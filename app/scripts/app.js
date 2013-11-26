'use strict';

angular.module('dSioApp', [
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'btford.socket-io'
])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
        .otherwise({
            redirectTo: '/'
        });
    });
