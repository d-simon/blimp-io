'use strict';

angular.module('blimpIO.blimp.overview.graph', ['highcharts-ng'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimps.overview.graph', {
                url: '/graph',
                templateUrl: 'modules/blimps/overview/graph/graph.tpl.html',
                controller: 'BlimpsOverviewGraphCtrl'
            });
    }])
    .controller('BlimpsOverviewGraphCtrl', ['$scope',
        function ($scope) {

            $scope.chartConfig = {
                options: {
                    chart: {
                        type: 'line',
                        zoomType: 'x'
                    }
                },
                xAxis: {
                    type: 'datetime'
                },
                series: [],
                title: {
                    text: 'Temperature'
                },
                loading: false
            };

            
            var temperature = { name: 'Temp', data: [] };
            $scope.chartConfig.series.push(temperature);
            $scope.setSeries = function () {
                var tempData = [];
                _.forEach($scope.reports, function (obj) {
                    tempData.push([obj.timestamp*1000, parseFloat(obj.json.environment.temp)]);
                });
                $scope.chartConfig.series[0].data = tempData;
            };
            $scope.setSeries();

            $scope.$on('angular:data:update:reports', function () {
                $scope.setSeries();
            });
        }
    ]);
