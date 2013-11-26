'use strict';

angular.module('blimpIO')
    .controller('MainCtrl', function ($scope, $http, socket, toaster) {
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


        socket.on('awesomeThings:updated', function (team) {
            $scope.getAwesomeThings();
            toaster.pop('success', "Update!", "awesomeThings update!");
        });


    });
