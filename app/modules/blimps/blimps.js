'use strict';

angular.module('blimpIO.blimps', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('blimps', {
                url: '/',
                templateUrl: 'modules/blimps/blimps.html',
                controller: 'BlimpsCtrl'
            });
    })
    .controller('BlimpsCtrl', function ($scope, $rootScope, $http, toaster) {

    });
