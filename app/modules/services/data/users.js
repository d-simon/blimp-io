'use strict';

angular.module('blimpIO.services')
    .factory('factoryUsers', ['$http', function ($http) {

        var urlBase = '/api/users';
        var factory = {};

        factory.getUsers = function () {
            return $http.get(urlBase);
        };

        factory.updateUser = function (user) {
            return $http.put(urlBase + '/' + user.ID, user);
        };

        factory.deleteUser = function (id) {
            return $http.delete(urlBase + '/' + id);
        };
        
        return factory;
    }]);