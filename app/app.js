'use strict';

angular.module('blimpIO', [
        'ngResource',
        'ngSanitize',
        'ngAnimate',

        'ui.router',

        'btford.socket-io',
        'http-auth-interceptor',

        'toaster',

        'blimpIO.index',
        'blimpIO.login',
        'blimpIO.main',
        'blimpIO.blimps'
    ])
    .config(function ($urlRouterProvider, $stateProvider) {

        var isAuthed = ['$q', '$timeout', '$http', '$location', function ($q, $timeout, $http, $location) {
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
            }],
            isAlreadyAuthed = ['$q', '$timeout', '$http', '$location', function ($q, $timeout, $http, $location) {
                var deferred = $q.defer();
                $http.get(urls.api.authed)
                    .success(function (user) {
                        if (user === errorResponse) {
                            $timeout(deferred.resolve, 0);
                        } else {
                            //$rootScope.message = 'You need to log in.';
                            $timeout(function () { deferred.reject(); }, 0);
                            $location.url(urls.index);
                        }
                    });
                return deferred.promise;
            }],
            doLogout = ['$q', '$timeout', '$http', '$location', function ($q, $timeout, $http, $location) {
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
            }],
            // Url & Response Config
            urls = {
                login: '/login',
                logout: '/logout',
                index: '/',
                api: {
                    authed: '/api/loggedin',
                    logout: '/api/logout'
                }
            },
            errorResponse = '0';

        $urlRouterProvider.otherwise(urls.index);

        $stateProvider
            .state('login', {
                url: urls.login,
                resolve: { check: isAlreadyAuthed },
                templateUrl: 'modules/login/login.html',
                controller: 'LoginCtrl'
            })
            .state('logout', {
                url: urls.logout,
                resolve: { check: doLogout },
                redirectTo: urls.login
            })
            .state('index', {
                abstract: true,
                resolve: { check: isAuthed },
                templateUrl: 'modules/index/index-view.html'
            });

    })
    .run(function ($rootScope, $location, socket, $state, $stateParams) {
        // Inline Routing
        $rootScope.go = function (hash) {
            $location.path(hash);
        };

        // Auth Interceptor
        $rootScope.$on('event:auth-loginRequired', function () { $location.url("/login") });

        // State
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        // Socket event relaying
        socket.forward(['awesomeThings:updated']);
    });


