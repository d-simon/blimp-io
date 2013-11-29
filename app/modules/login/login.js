'use strict';

angular.module('blimpIO.login', [])
    .controller('LoginCtrl', function ($scope, $location, $http) {

        $scope.userdata = {
            username: '',
            password: '',
            rememberme: false,
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