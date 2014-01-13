'use strict';

angular.module('blimpIO.services')
    .factory('factoryBlimps', ['$http', function ($http) {

        var urlBase = '/api/blimps';
        var factory = {};

        factory.getBlimps = function () {
            return $http.get(urlBase);
        };

        factory.getBlimp = function (id) {
            return $http.get(urlBase + '/' + id);
        };

        factory.getBlimpByName = function (name) {
            return $http.get(urlBase + '/' + name + '?identifier=name');
        };

        factory.createBlimp = function (blimp) {
            return $http.post(urlBase, blimp);
        };

        factory.updateBlimp = function (blimp) {
            return $http.put(urlBase + '/' + blimp._id, blimp);
        };
        
        factory.updateBlimpByName = function (blimp, name) {
            if (name) {
                return $http.put(urlBase + '/' + name + '?identifier=name');
            } else {
                return $http.put(urlBase + '/' + blimp.name + '?identifier=name');
            }
        };

        factory.deleteBlimp = function (id) {
            return $http.delete(urlBase + '/' + id);
        };

        factory.deleteBlimpByName = function (id) {
            return $http.delete(urlBase + '/' + id + '?identifier=name');
        };

        return factory;
    }]);