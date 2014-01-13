'use strict';

angular.module('blimpIO.users', [])
    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('index.users', {
                    url: '/users',
                    templateUrl: 'modules/users/users.tpl.html',
                    controller: 'UsersCtrl',
                    resolve: {
                        resolvedUsers: ['$stateParams', '$q', 'factoryUsers', function ($stateParams, $q, factoryUsers) {
                            var deferred = $q.defer();
                            factoryUsers
                                .getUsers()
                                .success(function (users) {
                                    deferred.resolve(users);
                                })
                                .error(function (error) {
                                    deferred.reject();
                                });
                            return deferred.promise;
                        }]
                    }
                })
                .state('index.users.add', {});
        }
    ])
    .controller('UsersCtrl', ['$scope', '$rootScope', '$state', 'toaster', 'factoryUsers', 'resolvedUsers',
        function ($scope, $rootScope, $state, toaster, factoryUsers, resolvedUsers) {
            
            $scope.users = resolvedUsers;
            
            $scope.newUser = {};

            $scope.getUsers = function () {
                factoryUsers
                    .getUsers()
                    .success(function (users) {
                        $scope.users = users;
                    });
            };

            $scope.createUser = function () {
                factoryUsers
                    .createUser($scope.newUser)
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
                    factoryUsers
                        .deleteUser(id)
                        .success(function () {
                            $scope.users.splice(index, 1);
                        });
                }
            };

            $scope.$on('socket:data:update:users', function () {
                $scope.getUsers();
            });

        }
    ]);