'use strict';

angular.module('blimpIO.blimp.overview', ['blimpIO.blimp.overview.graph'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimps.overview', {
                url: '/:blimpName',
                templateUrl: 'modules/blimps/overview/overview.html',
                controller: 'BlimpsOverviewCtrl',
                resolve: {
                    reports: ['$stateParams', '$q', '$http', function($stateParams, $q, $http) {
                        var deferred = $q.defer();
                        $http.get('/api/blimps/' + $stateParams.blimpName +'/reports?identifier=name')
                            .success(function (reports) {
                                deferred.resolve(reports);
                            })
                            .error(function (error) {
                                deferred.reject();
                            });
                        return deferred.promise;
                    }],
                    blimp: ['$stateParams', '$q', '$http', function($stateParams, $q, $http) {
                        var deferred = $q.defer();
                        $http.get('/api/blimps/' + $stateParams.blimpName +'?identifier=name')
                            .success(function (blimp) {
                                deferred.resolve(blimp);
                            })
                            .error(function (error) {
                                deferred.reject();
                            });
                        return deferred.promise;
                    }]
                }
            })
            .state('index.blimps.overview.reports', {
                url: '/reports',
                templateUrl: 'modules/blimps/overview/reports.html'
            });
    }])
    .controller('BlimpsOverviewCtrl', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'toaster', 'reports', 'blimp',
        function ($scope, $rootScope, $http, $state, $stateParams, toaster, reports, blimp) {

            $scope.getBlimp = function () {
                $http.get('/api/blimps/' + $stateParams.blimpName +'?identifier=name')
                    .success(function (blimp) {
                        $scope.blimp = blimp;
                        $scope.$broadcast('angular:data:update:blimp');
                    })
                    .error(function () {
                        $state.go('index.blimps.list');
                    });
            };

           $scope.deleteBlimp = function (id) {
                if (confirm("Do you really want to delete '" + $scope.blimp.name + "'?")) {
                    $http.delete('/api/blimps/'+id)
                        .success(function () {
                            $state.go('index.blimps.list');
                            $scope.$broadcast('angular:data:update:blimp');
                        });
                }
            };

            $scope.getReports = function () {
                $http.get('/api/blimps/' + $stateParams.blimpName +'/reports?identifier=name')
                    .success(function (reports) {
                        $scope.reports = reports;
                        $scope.$broadcast('angular:data:update:reports');
                    });
            };

            $scope.reports = reports;
            $scope.blimp = blimp;

            $scope.rename = {
                storeName: $scope.blimp.name,
                save: function () {
                    $scope.listenToSocketUpdates = false;
                    $http.put('/api/blimps/' + $scope.rename.storeName + '?identifier=name', $scope.blimp)
                        .success(function (blimp) {
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
                if ($scope.listenToSocketUpdates) $scope.getBlimp();
            });
            $scope.$on('socket:data:update:reports', function () {
                if ($scope.listenToSocketUpdates) $scope.getReports();
            });
        }
    ]);
