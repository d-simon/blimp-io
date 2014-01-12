'use strict';

angular.module('blimpIO.blimps', ['blimpIO.blimp.overview'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimps', {
                url: '/blimps',
                abstract: true,
                template: '<ui-view />'
            })
            .state('index.blimps.list', {
                url: '',
                templateUrl: 'modules/blimps/blimps.tpl.html',
                controller: 'BlimpsCtrl'
            });
    }])
    .controller('BlimpsCtrl', ['$scope', '$rootScope', '$http', '$state', 'toaster',
        function ($scope, $rootScope, $http, $state, toaster) {

            $scope.getBlimps = function () {
                $http.get('/api/blimps')
                    .success(function (blimps) {
                        $scope.blimps = blimps;
                    });
            };

            $scope.createBlimp = function () {
                $http.post('/api/blimps')
                    .success(function () {
                        // Currently we don't need this, since we are
                        // emiting to our own socket too (use broadcast instead)
                        // $scope.getBlimps();
                        $state.go('index.blimps.list');
                        $scope.newBlimp = {};
                        return false;
                    });
            };

            $scope.deleteBlimp = function (id) {
                var index = _.findIndex($scope.blimps, { '_id': id });
                if (index > -1 && confirm("Do you really want to delete '" + $scope.blimps[index].name + "'?")) {
                    $http.delete('/api/blimps/'+id)
                        .success(function () {
                            $scope.blimps.splice(index, 1);
                        });
                }
            };

            $scope.getBlimps();

            $scope.$on('socket:data:update:blimps', function () {
                $scope.getBlimps();
            });
        }
    ]);
