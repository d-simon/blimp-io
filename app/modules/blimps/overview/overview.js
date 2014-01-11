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
                        $http.get('/api/blimps/' + $stateParams.blimpName +'/byName/reports')
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
                        $http.get('/api/blimps/' + $stateParams.blimpName +'/byName')
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
            })
    }])
    .controller('BlimpsOverviewCtrl', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'toaster', 'reports', 'blimp',
        function ($scope, $rootScope, $http, $state, $stateParams, toaster, reports, blimp) {

            $scope.getBlimp = function () {
                $http.get('/api/blimps/' + $stateParams.blimpName +'/byName')
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
                $http.get('/api/blimps/' + $stateParams.blimpName +'/byName/reports')
                    .success(function (reports) {
                        $scope.reports = reports;
                        $scope.$broadcast('angular:data:update:reports');
                    })
                    .error(function () {
                    });
            };

            $scope.reports = reports;
            $scope.blimp = blimp;

            $scope.$on('socket:data:update:blimps', function () {
                $scope.getBlimp();
            });
            $scope.$on('socket:data:update:reports', function () {
                $scope.getReports();
            });
        }
    ]);
