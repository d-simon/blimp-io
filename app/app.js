'use strict';

angular.module('blimpIO', [
        'ngResource',
        'ngSanitize',
        'ngAnimate',

        'restangular',

        'ui.router',

        'btford.socket-io',
        'http-auth-interceptor',

        'toaster',

        'hljs',

        'blimpIO.index',
        'blimpIO.login',
        'blimpIO.dashboard',
        'blimpIO.blimps',
        'blimpIO.users'
    ])
    .config(['$urlRouterProvider', '$stateProvider',
        function ($urlRouterProvider, $stateProvider) {

            var isAuthed = ['$q', '$timeout', '$http', '$rootScope', '$location', 'toaster',
                    function ($q, $timeout, $http, $rootScope, $location, toaster) {
                        var deferred = $q.defer();
                        $http.get(urls.api.authed)
                            .success(function (user) {
                                if (user !== errorResponse) {
                                    
                                    if (($location.search()).returnPath) {
                                        $location.url(decodeURIComponent(($location.search()).returnPath));
                                    }
                                    $rootScope.current.user = user;
                                    $timeout(deferred.resolve, 0);
                                } else {
                                    var currentPath = $location.path(),
                                        returnPath = ($location.search()).returnPath;

                                    if (!returnPath && currentPath 
                                        && currentPath != '/'
                                        && currentPath != '/main'
                                        && currentPath != '/login'
                                        && currentPath != '/logout') {
                                        // set new returnPath
                                        $location.url(urls.login).search('returnPath', currentPath);
                                    } else {
                                        $location.url(urls.login)
                                    }
                                    $timeout(function () { deferred.reject(); }, 0);
                                }
                            });
                        return deferred.promise;
                    }
                ],
                isAlreadyAuthed = ['$q', '$timeout', '$http', '$rootScope', '$location', 'toaster',
                    function ($q, $timeout, $http, $rootScope, $location, toaster) {
                        console.log($location.absUrl());
                        var deferred = $q.defer();
                        $http.get(urls.api.authed)
                            .success(function (user) {
                                if (user === errorResponse) {
                                    $timeout(deferred.resolve, 0);
                                } else {
                                    toaster.pop('info', 'You\'re already logged in!');
                                    $rootScope.current.user = user;
                                    $timeout(function () { deferred.reject(); }, 0);
                                    $location.url(urls.index);
                                }
                            });
                        return deferred.promise;
                    }
                ],
                doLogout = ['$q', '$timeout', '$http', '$location',
                    function ($q, $timeout, $http, $location) {
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
                    }
                ],
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

        }
    ])
    .run(['$rootScope', '$location', '$http', 'socket', '$state', '$stateParams', '$q', '$timeout',
        function ($rootScope, $location, $http, socket, $state, $stateParams, $q, $timeout) {
            // Inline Routing
            $rootScope.go = function (hash) {
                $location.url(hash);
            };

            $rootScope.current = {};

            // Auth Interceptor
            $rootScope.$on('event:auth-loginRequired', function () { 
                $rootScope.current.user = null;
                $location.url("/login");
            });

            // State
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                //save location.search so we can add it back after transition is done
                $rootScope.locationSearch = $location.search();
            });
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                //restore all query string parameters back to $location.search
                $location.search($rootScope.locationSearch);
            });

            // Socket event relaying
            socket.forward([
                'data:update:awesomeThings',
                'data:update:blimps',
                'data:update:reports',
                'data:update:users']);

    }]);