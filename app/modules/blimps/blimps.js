'use strict';

angular.module('blimpIO.blimps', [])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimps', {
                url: '/blimps',
                templateUrl: 'modules/blimps/blimps.html',
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
                        // emiting to the own socket too (use broadcast instead)
                        // $scope.getBlimps();
                        $state.go('index.blimps');
                        $scope.newBlimp = {};
                        return false;
                    });
            };

            $scope.deleteBlimp = function (id) {
                $http.delete('/api/blimps/'+id)
                    .success(function () {
                        var spliceIndex = _.findIndex($scope.blimps, { '_id': id });
                        if (spliceIndex > -1) {
                            $scope.blimps.splice(spliceIndex, 1);
                        }
                    });
            };

            $scope.getBlimps();

            $scope.$on('socket:data:update:blimps', function () {
                $scope.getBlimps();
            });
        }
    ]);
