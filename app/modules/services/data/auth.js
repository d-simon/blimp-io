'use strict';

angular.module('blimpIO.services')
    .factory('factoryAuth', ['$http', function ($http) {

        var urlBase = '/api';
        var factory = {};

        factory.getAuthed = function () {
            return $http.get(urlBase + '/loggedin');
        };

        factory.logIn = function (credentials) {
            return $http.post(urlBase + '/login', credentials);
        };

        factory.logOut = function () {
            return $http.post(urlBase + '/logout');
        };
        
        return factory;
    }]);