'use strict';

angular.module('blimpIO.login', [])
    .controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'factoryAuth',
        function ($scope, $rootScope, $location, factoryAuth) {

            $scope.userdata = {
                username: '',
                password: '',
                rememberme: false
            };
            
            $scope.login = function () {
                factoryAuth
                    .logIn($scope.userdata)
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