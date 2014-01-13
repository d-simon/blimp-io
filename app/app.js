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
        'blimpIO.users',
        'blimpIO.services'
    ])
    .config(['$urlRouterProvider', '$stateProvider',
        function ($urlRouterProvider, $stateProvider) {

            var urls = {
                    login: '/login',
                    logout: '/logout',
                    index: '/dashboard',
                    api: {
                        authed: '/api/loggedin',
                        logout: '/api/logout'
                    }
                },
                errorResponse = '0',
                isAuthed = ['$q', '$timeout', '$http', '$rootScope', '$location', 'toaster', 'factoryAuth',
                    function ($q, $timeout, $http, $rootScope, $location, toaster, factoryAuth) {
                        var deferred = $q.defer();
                        factoryAuth
                            .getAuthed()
                            .success(function (user) {
                                var currentPath = $location.path(),
                                    returnPath = ($location.search()).returnPath;
                                if (user !== errorResponse) {
                                    if (returnPath) {
                                        $location.url(decodeURIComponent(($location.search()).returnPath));
                                    } else if (currentPath == urls.login) {
                                        $location.url(urls.index);
                                    }
                                    $rootScope.current.user = user;
                                    $timeout(deferred.resolve,0);
                                } else if (currentPath == urls.login) {
                                    deferred.resolve();
                                } else {
                                    if (!returnPath && currentPath 
                                        && currentPath != '/'
                                        && currentPath != urls.login
                                        && currentPath != urls.logout)
                                    {
                                        $location.url(urls.login).search('returnPath', currentPath);
                                    } else {
                                        $location.url(urls.login).search('returnPath', returnPath);
                                    }
                                    $timeout(deferred.reject,0);
                                }
                            });
                        return deferred.promise;
                    }
                ],
                doLogout = ['$q', '$timeout', '$http', '$location', 'factoryAuth',
                    function ($q, $timeout, $http, $location, factoryAuth) {
                        var deferred = $q.defer();
                        factoryAuth
                            .logOut()
                            .success(function () {
                                $timeout(deferred.resolve, 0);
                                $location.url(urls.login);
                            })
                            .error(function () {
                                $timeout(deferred.reject, 0);
                            });
                        return deferred.promise;
                    }
                ];

            $urlRouterProvider.otherwise(urls.index);

            $stateProvider
                .state('login', {
                    url: urls.login,
                    resolve: { check: isAuthed },
                    templateUrl: 'modules/login/login.tpl.html',
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
                    templateUrl: 'modules/index/index.tpl.html'
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
                 var currentPath = $location.path(),
                     returnPath = ($location.search()).returnPath;
                if (returnPath) {
                    $location.path('/login').search('returnPath', returnPath);
                } else {
                    $location.path('/login').search('returnPath', currentPath);
                }
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