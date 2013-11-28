'use strict';

angular.module('blimpIO', [
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngAnimate',
        'btford.socket-io',
        'http-auth-interceptor',
        'toaster'
    ])
    .config(function ($routeProvider) {

        var isAuthed = ['$q', '$timeout', '$http', '$location', function ($q, $timeout, $http, $location) {
                var deferred = $q.defer();
                $http.get('/api/loggedin')
                    .success(function (user) {
                        if (user !== '0') {
                            $timeout(deferred.resolve, 0);
                        } else {
                            //$rootScope.message = 'You need to log in.';
                            $timeout(function () { deferred.reject(); }, 0);
                            $location.url('/login');
                        }
                    });
                return deferred.promise;
            }],
            isAlreadyAuthed = ['$q', '$timeout', '$http', '$location', function ($q, $timeout, $http, $location) {
                var deferred = $q.defer();
                $http.get('/api/loggedin')
                    .success(function (user) {
                        if (user === '0') {
                            $timeout(deferred.resolve, 0);
                        } else {
                            //$rootScope.message = 'You need to log in.';
                            $timeout(function () { deferred.reject(); }, 0);
                            $location.url('/main');
                        }
                    });
                return deferred.promise;
            }],
            doLogout = ['$q', '$timeout', '$http', function ($q, $timeout, $http) {
                var deferred = $q.defer();
                $http.post('/api/logout')
                    .success(function () {
                        $timeout(deferred.resolve, 0);
                    })
                    .error(function () {
                        $timeout(function () { deferred.reject(); }, 0);
                    });
                return deferred.promise;
            }];

        $routeProvider
            .when('/', {
                resolve: { check: isAlreadyAuthed },
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/logout', {
                resolve: { check: doLogout },
                redirectTo: '/'
            })
            .when('/main', {
                resolve: { check: isAuthed },
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
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


