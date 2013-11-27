'use strict';

angular.module('blimpIO', [
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'btford.socket-io',
    'toaster'
])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });