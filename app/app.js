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
        'blimpIO.blimps',
        'blimpIO.users'
    ])
    .config(function ($urlRouterProvider, $stateProvider) {

        var isAuthed = ['$q', '$timeout', '$http', '$rootScope', '$location', 'toaster', function ($q, $timeout, $http, $rootScope, $location, toaster) {
                var deferred = $q.defer();
                $http.get(urls.api.authed)
                    .success(function (user) {
                        if (user !== errorResponse) {
                            $timeout(deferred.resolve, 0);
                            $rootScope.current.user = user;
                            toaster.pop('success', 'Welcome back!');
                        } else {
                            $timeout(function () { deferred.reject(); }, 0);
                            $location.url(urls.login);
                        }
                    });
                return deferred.promise;
            }],
            isAlreadyAuthed = ['$q', '$timeout', '$http', '$rootScope', '$location', 'toaster', function ($q, $timeout, $http, $rootScope, $location, toaster) {
                var deferred = $q.defer();
                $http.get(urls.api.authed)
                    .success(function (user) {
                        if (user === errorResponse) {
                            $timeout(deferred.resolve, 0);
                        } else {
                            toaster.pop('info', 'You\'re alread logged in!');
                            $rootScope.current.user = user;
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
    .run(function ($rootScope, $location, $http, socket, $state, $stateParams) {
        // Inline Routing
        $rootScope.go = function (hash) {
            $location.path(hash);
        };

        $rootScope.current = {};

        // Auth Interceptor
        $rootScope.$on('event:auth-loginRequired', function () { 
            $rootScope.current.user = null;
            $location.url("/login") 
        });

        if (!$rootScope.current.user) {
            $http.get('/api/loggedin')
                    .success(function (user) {
                        if (user !== '0') {
                            $rootScope.current.user = user;
                        }
                    });
        }

        // State
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        // Socket event relaying
        socket.forward([
            'data:update:awesomeThings',
            'data:update:blimps',
            'data:update:users']);
    });