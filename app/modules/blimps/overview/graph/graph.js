'use strict';

angular.module('blimpIO.blimp.overview.graph', ['highcharts-ng'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('index.blimps.overview.graph', {
                url: '/graph',
                templateUrl: 'modules/blimps/overview/graph/graph.tpl.html',
            });
    }])
    .directive('reportgraph', function() {
        return {
            restrict: 'EAC',
            template: '<highchart id="{{ chartid }}" config="chartConfig"></highchart>',
            scope: {
                reports: '=',
                chartid: '='
            },
            link: function($scope) {

                $scope.chartConfig = {
                    options: {
                        chart: {
                            type: 'line',
                            zoomType: 'xy'
                        }
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    scrollbar: {
                        enabled: true
                    },
                    series: [],
                    title: {
                        text: 'Report Data'
                    },
                    loading: false
                };

                function createSeries (data) {

                    var tempSeries = {};
                    traverseArrayLike(
                        data,
                        function (obj, key) {
                            console.log(key + ' ', obj);
                        },
                        function (element, key) {
                            if (key && element && isValidNumber(element)) {
                                if (!tempSeries[key]) {
                                    tempSeries[key] = [];
                                }
                                tempSeries[key].push(element);
                                console.log(' -> ', key + ' ', element);
                            }
                        }
                    );

                    var series = [];
                    _.forEach(tempSeries, function (obj, key) {
                        if (key !== 'timestamp' &&
                            obj.length &&
                            obj.length > 0)
                        {
                            var tempData = [];
                            _.forEach(obj, function (val, index) {
                                tempData.push([tempSeries.timestamp[index]*1000, parseFloat(val)]);
                            });
                            series.push({ name: key, data: tempData });
                        }
                    });
                    console.log (series);
                    return series;
                }

                function traverseArrayLike (obj, arrayCallback, elementCallback) {
                    _.forEach(obj, function (obj, key) {
                        if (isArrayLike(obj)) {
                            arrayCallback(obj, key);
                            traverseArrayLike(obj, arrayCallback, elementCallback);
                        } else {
                            elementCallback(obj, key);
                        }
                    });
                }


                function isEmptyObject (obj) {
                    var isEmpty = true,
                        keys;
                    for(keys in obj)
                    {
                        isEmpty = false;
                        break;
                    }
                    return isEmpty;
                }

                function isArrayLike (obj) {
                    return (obj &&                                    // obj is not null, undefined, etc.
                            typeof obj === 'object' &&                // obj is an object
                                (isFinite(obj.length) &&                  // obj.length is a finite number
                                obj.length >= 0 &&                        // obj.length is non-negative
                                obj.length === Math.floor(obj.length) &&  // obj.length is an integer
                                obj.length < 4294967296 ||                // obj.length < 2^32
                                !isEmptyObject(obj)                       // or is iterable non-empty object
                                ));
                }

                function isValidNumber (number) {
                    return (/^[+-]?\d+(\.\d+)?$/.test(number));
                }


                $scope.$watch('reports', function(newReports, oldReports) {
                    if (JSON.stringify(newReports) === JSON.stringify(oldReports)) {return; }
                    $scope.chartConfig.series = createSeries(newReports);

                }, true);

                $scope.chartConfig.series = createSeries($scope.reports);
            }
        };
    });