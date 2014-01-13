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
                controller: 'BlimpsCtrl',
                resolve: {
                    resolvedBlimps: ['$q', 'factoryBlimps', function ($q, factoryBlimps) {
                        var deferred = $q.defer();
                        factoryBlimps
                            .getBlimps()
                            .success(function (blimp) {
                                deferred.resolve(blimp);
                            })
                            .error(function (error) {
                                deferred.reject();
                            });
                        return deferred.promise;
                    }]
                }
            });
    }])
    .controller('BlimpsCtrl', ['$scope', '$rootScope', '$state', 'toaster', 'factoryBlimps', 'resolvedBlimps',
        function ($scope, $rootScope, $state, toaster, factoryBlimps, resolvedBlimps) {

            $scope.blimps = resolvedBlimps;

            $scope.getBlimps = function () {
                factoryBlimps
                    .getBlimps()
                    .success(function (blimps) {
                        $scope.blimps = blimps;
                    });
            };

            $scope.createBlimp = function () {
                factoryBlimps
                    .createBlimp()
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
                    factoryBlimps
                        .deleteBlimpByName(id)
                        .success(function () {
                            $scope.blimps.splice(index, 1);
                        });
                }
            };

            $scope.$on('socket:data:update:blimps', function () {
                $scope.getBlimps();
            });
        }
    ]);
