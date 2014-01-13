angular.module('blimpIO.services')
    .factory('factoryReports', ['$http', function ($http) {

        var urlBase = '/api/reports',
            urlBlimps = '/api/blimps',
            urlFragment = '/reports';
        var factory = {};

        factory.getReports = function () {
            return $http.get(urlBase);
        };

        factory.getReport = function (reportId) {
            return $http.get(urlBase + '/' + reportId);
        };

        factory.getReportsByBlimpId = function (blimpId) {
            return $http.get(urlBlimps + '/' + blimpId + urlFragment);
        };

        factory.getReportsByBlimpName = function (blimpName) {
            return $http.get(urlBlimps + '/' + blimpName + urlFragment + '?identifier=name');
        };

        return factory;
    }]);