'use strict';

angular.module('blimpIO.auth', [])
    // Relay as a constant to inject it in .config()
    .constant('$auth', {
        doLogout: ['$authService', function($authService) {
            return $authService.doLogout;
        }],
        isAuthed: ['$authService', function($authService) {
            return $authService.isAuthed;
        }],
        isAlreadyAuthed: ['$authService', function($authService) {
            return $authService.isAlreadyAuthed;
        }]
    })
    .provider('$authService', function() {
 
        this.urls = {
            login: '/login',
            main: '/',
            api: {
                authed: '/api/loggedin',
                logout: '/api/logout'
            }
        };

        this.errorResponse = '0';
     
        this.$get = function() {
            var urls = this.urls;
            return {
                isAuthed: function ($q, $timeout, $http, $location) {
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
                isAlreadyAuthed: function ($q, $timeout, $http, $location) {
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
                doLogout: function ($q, $timeout, $http, $location) {
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
            }
        };
     
        this.setUrls = function(urls) {
            this.urls = urls
        };
        this.setErrorResponse = function(errorResponse) {
            this.errorResponse = errorResponse;
        };
    });
