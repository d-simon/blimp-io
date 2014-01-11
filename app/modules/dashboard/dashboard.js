'use strict';

angular.module('blimpIO.dashboard', [])
    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('index.dashboard', {
                    url: '/dashboard',
                    templateUrl: 'modules/dashboard/dashboard.html',
                    controller: 'DashboardCtrl'
                });
        }
    ])
    .controller('DashboardCtrl', ['$scope', '$rootScope', '$http', 'toaster',
        function ($scope, $rootScope, $http, toaster) {
            
        }
    ]);
