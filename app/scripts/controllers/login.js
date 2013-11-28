'use strict';

angular.module('blimpIO')
    .controller('LoginCtrl', function ($scope, $location, $http) {

        $scope.userdata = {
            username: '',
            password: ''
        };

        $scope.login = function () {
            $http.post('/api/login', $scope.userdata)
                .success(function (response) {
                    console.log(response);
                    if (response !== '0') {
                        $location.url('/main')
                    }
                });
        };
    });
