'use strict';

angular.module('blimpIO.dashboard', [])
    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('index.dashboard', {
                    url: '/dashboard',
                    templateUrl: 'modules/dashboard/dashboard.tpl.html'
                });
        }
    ]);
