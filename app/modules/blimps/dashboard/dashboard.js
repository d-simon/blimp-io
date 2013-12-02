'use strict';

angular.module('blimpIO.blimp.dashboard', [])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimp-dashboard', {
                url: '/blimps/:blimpName',
                templateUrl: 'modules/blimps/dashboard/dashboard.html',
                controller: 'BlimpsDashboardCtrl'
            });
    }])
    .controller('BlimpsDashboardCtrl', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'toaster',
        function ($scope, $rootScope, $http, $state, $stateParams, toaster) {

            $scope.getBlimp = function () {
                $http.get('/api/blimps/' + $stateParams.blimpName +'/byName')
                    .success(function (blimp) {
                        $scope.blimp = blimp;
                    })
                    .error(function () {
                        $state.go('index.blimps');
                    });
            };

           $scope.deleteBlimp = function (id) {
                if (confirm("Do you really want to delete '" + $scope.blimp.name + "'?")) {
                    $http.delete('/api/blimps/'+id)
                        .success(function () {
                            $state.go('index.blimps');
                        });
                }
            };

            $scope.getReports = function () {
                $http.get('/api/blimps/' + $stateParams.blimpName +'/byName/reports')
                    .success(function (reports) {
                        $scope.reports = reports;
                    })
                    .error(function () {
                    });
            };

           $scope.deleteBlimp = function (id) {
                if (confirm("Do you really want to delete '" + $scope.blimp.name + "'?")) {
                    $http.delete('/api/blimps/'+id)
                        .success(function () {
                            $state.go('index.blimps');
                        });
                }
            };

            $scope.getBlimp();
            $scope.getReports();

            $scope.$on('socket:data:update:blimps', function () {
                $scope.getBlimp();
            });
            $scope.$on('socket:data:update:reports', function () {
                $scope.getReports();
            });
        }
    ]);
