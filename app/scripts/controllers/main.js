'use strict';

angular.module('dSioApp')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.getAwesomeThings = function () {
            $http.get('/api/awesomeThings')
                .success(function (awesomeThings) {
                    $scope.awesomeThings = awesomeThings;
                });
        }
        
        $scope.getAwesomeThings();

        $scope.deleteAwesomeThing = function (id) {
            $http.delete('/api/awesomeThings/'+id)
                .success(function () {
                    var spliceIndex = _.findIndex($scope.awesomeThings, { '_id': id });
                    if (spliceIndex > -1) {
                        $scope.awesomeThings.splice(spliceIndex, 1);
                    }
                });
        };


        $scope.repopulate = function () {
            $http.get('/api/repopulate')
                .success(function () {
                    $scope.getAwesomeThings();
                });
        };

    });
