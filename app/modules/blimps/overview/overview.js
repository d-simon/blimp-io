'use strict';

angular.module('blimpIO.blimp.overview', ['blimpIO.blimp.overview.graph'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimps.overview', {
                url: '/:blimpName',
                templateUrl: 'modules/blimps/overview/overview.tpl.html',
                controller: 'BlimpsOverviewCtrl',
                resolve: {
                    resolvedReports: ['$stateParams', '$q', 'factoryReports', function ($stateParams, $q, factoryReports) {
                        var deferred = $q.defer();
                        factoryReports
                            .getReportsByBlimpName($stateParams.blimpName)
                            .success(function (reports) {
                                deferred.resolve(reports);
                            })
                            .error(function () {
                                deferred.reject();
                            });
                        return deferred.promise;
                    }],
                    resolvedBlimp: ['$stateParams', '$q', 'factoryBlimps', function ($stateParams, $q, factoryBlimps) {
                        var deferred = $q.defer();
                        factoryBlimps
                            .getBlimpByName($stateParams.blimpName)
                            .success(function (blimp) {
                                deferred.resolve(blimp);
                            })
                            .error(function () {
                                deferred.reject();
                            });
                        return deferred.promise;
                    }]
                }
            })
            .state('index.blimps.overview.reports', {
                url: '/reports',
                templateUrl: 'modules/blimps/overview/reports.tpl.html'
            });
    }])
    .controller('BlimpsOverviewCtrl', [
        '$scope', '$rootScope', '$state', '$stateParams', 'toaster', 'factoryBlimps', 'factoryReports', 'resolvedReports', 'resolvedBlimp',
        function ($scope, $rootScope, $state, $stateParams, toaster, factoryBlimps, factoryReports, resolvedReports, resolvedBlimp) {

            $scope.reports = resolvedReports;
            $scope.blimp = resolvedBlimp;

            $scope.getBlimp = function () {
                factoryBlimps
                    .getBlimpByName()
                    .success(function (blimp) {
                        $scope.blimp = blimp;
                        $scope.$broadcast('angular:data:update:blimp');
                    })
                    .error(function () {
                        $state.go('index.blimps.list');
                    });
            };

            $scope.deleteBlimp = function () {
                if (confirm('Do you really want to delete "' + $scope.blimp.name + '"?')) {
                    factoryBlimps
                        .deleteBlimpByName()
                        .success(function () {
                            $state.go('index.blimps.list');
                            $scope.$broadcast('angular:data:update:blimp');
                        });
                }
            };

            $scope.getReports = function () {
                factoryReports
                    .getReportsByBlimpByName($stateParams.blimpName)
                    .success(function (reports) {
                        $scope.reports = reports;
                        $scope.$broadcast('angular:data:update:reports');
                    });
            };

            $scope.rename = {
                storeName: $scope.blimp.name,
                save: function () {
                    $scope.listenToSocketUpdates = false;
                    factoryBlimps
                        .updateBlimp($scope.blimp)
                        .success(function () {
                            $scope.rename.storeName = $scope.blimp.name;
                            $state.go($state.current.name, { blimpName: $scope.blimp.name });
                        })
                        .error(function () {
                            $scope.listenToSocketUpdates = true;
                            $scope.rename.cancel();
                        });
                },
                cancel: function () {
                    $scope.blimp.name = $scope.rename.storeName;
                }
            };

            $scope.viewState = 'default';

            $scope.switchViewState = function (state) {
                $scope.viewState = state;
            };


            $scope.listenToSocketUpdates = true;

            $scope.$on('socket:data:update:blimps', function () {
                if ($scope.listenToSocketUpdates) {
                    $scope.getBlimp();
                }
            });
            $scope.$on('socket:data:update:reports', function () {
                if ($scope.listenToSocketUpdates) {
                    $scope.getReports();
                }
            });
        }
    ]);
