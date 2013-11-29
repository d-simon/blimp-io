'use strict';

angular.module('blimpIO.blimps', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('index.blimps', {
                url: '/blimps',
                templateUrl: 'modules/blimps/blimps.html',
                controller: 'BlimpsCtrl'
            });
    })
    .controller('BlimpsCtrl', function ($scope, $rootScope, $http, toaster) {

    });
