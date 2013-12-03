'use strict';

angular.module('blimpIO.login', [])
    .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$http',
        function ($scope, $rootScope, $location, $http) {

            $scope.userdata = {
                username: '',
                password: '',
                rememberme: false
            };
            
            $scope.login = function () {
                $http.post('/api/login', $scope.userdata)
                    .success(function (response) {
                        console.log(response);
                        if (response !== '0') {
                            if (($location.search()).returnPath) {
                                console.log(($location.search()).returnPath);
                                $location.path(($location.search()).returnPath);
                            } else {
                                $location.path('main');
                            }
                        }
                    });
            };
        }
    ]);