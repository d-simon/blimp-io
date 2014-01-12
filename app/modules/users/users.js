'use strict';

angular.module('blimpIO.users', [])
    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('index.users', {
                    url: '/users',
                    templateUrl: 'modules/users/users.tpl.html',
                    controller: 'UsersCtrl'
                })
                .state('index.users.add', {});
        }
    ])
    .controller('UsersCtrl', ['$scope', '$rootScope', '$state', '$http', 'toaster',
        function ($scope, $rootScope, $state, $http, toaster) {

            $scope.newUser = {};

            $scope.getUsers = function () {
                $http.get('/api/users')
                    .success(function (users) {
                        $scope.users = users;
                    });
            };

            $scope.createUser = function () {
                $http.post('/api/users', $scope.newUser)
                    .success(function () {
                        // Currently we don't need this, since we are
                        // emiting to the own socket too (use broadcast instead)
                        // $scope.getUsers();
                        $state.go('index.users');
                        $scope.newUser = {};
                        return false;
                    });
            };

            $scope.deleteUser = function (id) {
                var index = _.findIndex($scope.users, { '_id': id });
                if (index > -1 && confirm("Do you really want to delete '" + $scope.users[index].username + "'?")) {
                    $http.delete('/api/users/'+id)
                        .success(function () {
                            $scope.users.splice(index, 1);
                        });
                }
            };

            $scope.getUsers();

            $scope.$on('socket:data:update:users', function () {
                $scope.getUsers();
            });

        }
    ]);