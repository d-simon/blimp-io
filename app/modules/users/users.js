'use strict';

angular.module('blimpIO.users', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('index.users', {
                url: '/users',
                templateUrl: 'modules/users/users.html',
                controller: 'UsersCtrl'
            })
            .state('index.users.add', {});
    })
    .controller('UsersCtrl', function ($scope, $rootScope, $http, $state, toaster) {

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
            $http.delete('/api/users/'+id)
                .success(function () {
                    var spliceIndex = _.findIndex($scope.users, { '_id': id });
                    if (spliceIndex > -1) {
                        $scope.users.splice(spliceIndex, 1);
                    }
                });
        };

        $scope.getUsers();

        $scope.$on('socket:data:update:users', function () {
            $scope.getUsers();
        });

    });
