'use strict';

angular.module('blimpIO', [
        'ngResource',
        'ngSanitize',
        'ngAnimate',

        'ui.router',

        'btford.socket-io',
        'http-auth-interceptor',

        'toaster'
    ])
    .config(function ($urlRouterProvider, $stateProvider) {

        var isAuthed = function ($q, $timeout, $http, $location) {
                var deferred = $q.defer();
                $http.get(urls.api.authed)
                    .success(function (user) {
                        if (user !== errorResponse) {
                            $timeout(deferred.resolve, 0);
                        } else {
                            //$rootScope.message = 'You need to log in.';
                            $timeout(function () { deferred.reject(); }, 0);
                            $location.url(urls.login);
                        }
                    });
                return deferred.promise;
            },
            isAlreadyAuthed = function ($q, $timeout, $http, $location) {
                var deferred = $q.defer();
                $http.get(urls.api.authed)
                    .success(function (user) {
                        if (user === errorResponse) {
                            $timeout(deferred.resolve, 0);
                        } else {
                            //$rootScope.message = 'You need to log in.';
                            $timeout(function () { deferred.reject(); }, 0);
                            $location.url(urls.main);
                        }
                    });
                return deferred.promise;
            },
            doLogout = function ($q, $timeout, $http, $location) {
                var deferred = $q.defer();
                $http.post(urls.api.logout)
                    .success(function () {
                        $timeout(deferred.resolve, 0);
                        $location.url(urls.login);
                    })
                    .error(function () {
                        $timeout(function () { deferred.reject(); }, 0);
                    });
                return deferred.promise;
            };


        var urls = {
                login: '/login',
                logout: '/logout',
                main: '/',
                api: {
                    authed: '/api/loggedin',
                    logout: '/api/logout'
                }
            },
            errorResponse = '0';



        $urlRouterProvider.otherwise(urls.main);

        $stateProvider
            .state('login', {
                url: urls.login,
                resolve: { check: isAlreadyAuthed },
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('logout', {
                url: urls.logout,
                resolve: { check: doLogout },
                redirectTo: urls.login
            })
            .state('main', {
                url: urls.main,
                resolve: { check: isAuthed },
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
        $rootScope.$on('event:auth-loginRequired', function () { $location.url("/login") });


        // Socket event relaying
        socket.forward(['awesomeThings:updated']);
    });


