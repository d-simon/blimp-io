'use strict';

angular.module('blimpIO', [
        'ngResource',
        'ngSanitize',
        'ngAnimate',

        'ui.router',

        'btford.socket-io',
        'http-auth-interceptor',

        'toaster',

        'blimpIO.auth'
    ])
    .config(function ($urlRouterProvider, $stateProvider, $authServiceProvider, $auth) {

        $authServiceProvider.setUrls({
            login: '/login',
            main: '/',
            api: {
                authed: '/api/loggedin',
                logout: '/api/logout'
            }
        })        

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('login', {
                url: '/login',
                resolve: { check: $auth.isAlreadyAuthed },
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('logout', {
                url: '/logout',
                resolve: { check: $auth.doLogout },
                redirectTo: '/'
            })
            .state('main', {
                url: '/',
                resolve: { check: $auth.isAuthed },
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            });

    })
    .run(function ($rootScope, $location, socket) {
        // Inline Routing
        $rootScope.go = function (hash) {
            $location.path(hash);
        };

        // Auth Interceptor
        $rootScope.$on('event:auth-loginRequired', function () { $location.url("/") });


        // Socket event relaying
        socket.forward(['awesomeThings:updated']);
    });


