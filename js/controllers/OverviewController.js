jsmusicdb.controller('OverviewController', ['$scope', '$http', 'switchView', '$location', '$routeParams', '$rootScope', 'sortService',
    function ($scope, $http, switchView, $location, $routeParams, $rootScope, sortService) {
        "use strict";
        $scope.sortService = sortService;
        $rootScope.rootView = true;

        window.document.title = 'JSMusicDB - Overview';
        $rootScope.pageTitle = "Overview <span class='artist'>Mobile MusicDB</span>";
        localStorage.removeItem("state");


        $rootScope.$watch(function () {
            return $rootScope.parsed && $rootScope.recent;
        }, function (n, o) {
            if (n) {
                if (localStorage.getItem("recent")) {
                    $scope.Artists = [];
                    angular.forEach($rootScope.recent.artists, function (value, key) {
                        if ($rootScope.artistCache[value]) {
                            $scope.Artists.push($rootScope.artistCache[value]);
                        }
                    });
                    $scope.Albums = [];
                    angular.forEach($rootScope.recent.albums, function (value, key) {
                        if ($rootScope.albumCache[value]) {

                            $scope.Albums.push($rootScope.albumCache[value]);
                        }
                    });
                    $scope.Tracks = [];
                    angular.forEach($rootScope.recent.topTracks, function (value, key) {
                        if ($rootScope.trackCache[key]) {

                            $scope.Tracks.push({
                                data: value,
                                track: $rootScope.trackCache[key]
                            });
                        }
                    });
                    $scope.Tracks = $scope.Tracks.sort(function (a, b) {
                        if (a.data.played < b.data.played) {
                            return 1;
                        } else if (a.data.played == b.data.played) {
                            return 0;
                        } else {
                            return -1;
                        }
                    });
                    $scope.Tracks = $scope.Tracks.slice(0, 5);
                } else {
                    $scope.showIntro = true;
                }
                window.scrollTo(0, 0);
            }
        });

        // exit on backbutton
        $scope.$on("backbutton", function () {
            if (!$rootScope.settingsBroadcast) {
                if (confirm("Pressing OK will exit Mobile MusicDB")) {
                    // clean up any notifications
                    $rootScope.$broadcast("notifyStop", $rootScope.track);
                    navigator.app.exitApp();
                }
            }
            $rootScope.settingsBroadcast = false;
        });
    }]);
