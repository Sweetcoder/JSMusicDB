jsmusicdb.controller('ArtistController', ['$scope', '$http', 'ImageService', 'switchView', '$location', '$routeParams', '$rootScope', 'modelService', 'sortService',
    function ($scope, $http, ImageService, switchView, $location, $routeParams, $rootScope, modelService, sortService) {
        "use strict";
        $scope.$on('artistChange', function (e, artist, update) {
            $scope.artist = artist;
            if (update) {
                ImageService.getInfo($scope);
            }
            if ($rootScope.source === 'local') {
                $scope.albums = artist.albumsLocal;
            } else {
                $scope.albums = artist.albums;
            }
            window.scrollTo(0, 0);
            $rootScope.upPath = $location.path().substring(0, $location.path().indexOf("/artist/"));
        });

        $scope.getAlbum = function (album) {
            switchView.album(album, $scope.Artist);
            $(".snap-content").get(0).scrollTop = 0;
        };
        $scope.closeView = function () {
            var path = $location.path();
            document.location.href = "#" + path.substring(0, path.indexOf("/artist/"));
        };

        // sorting
        $scope.sortService = sortService;

        // get routing

        if ($routeParams.artist) {
            $rootScope.$watch(function () {
                return $rootScope.parsed;
            }, function (n, o) {
                if (n) {
                    if ($rootScope.activeLetter) {
                        $rootScope.activeLetter.active = false;
                    }
                    $rootScope.activeLetter = $rootScope.letterCache[$routeParams.letter];
                    $rootScope.activeLetter.active = true;
                    var activeLetter = $rootScope.activeLetter;
                    $.each(activeLetter.artists, function () {
                        if (this.Naam === $routeParams.artist) {
                            if (window._gaq) {
                                _gaq.push(['_trackPageview', '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist]);
                            }
                            window.document.title = 'JSMusicDB - ' + $routeParams.artist;
                            $rootScope.pageTitle = $routeParams.artist + '<span class="artist">' + $routeParams.letter + '</span>';
                            localStorage.removeItem("state");
                            localStorage.setItem("state", JSON.stringify({
                                url: '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist
                            }));
                            $rootScope.rootView = false;
                            switchView.artist(this, true);
                            return false;
                        }
                    });
                    $scope.navIndex = -4;
                    $scope.$on('keydown', function (msg, code) {
                        if ($rootScope.listenLetters) {
                            switch (code) {
                                case $rootScope.keymapping.UP:
                                    // up
                                    setNavIndex(-4, code);
                                    break;
                                case $rootScope.keymapping.DOWN:
                                    // down
                                    setNavIndex(+4, code);
                                    break;
                                case $rootScope.keymapping.LEFT:
                                    // left; select next (or first) li in the media-list
                                    setNavIndex(-1, code);
                                    break;
                                case $rootScope.keymapping.RIGHT:
                                    //right
                                    setNavIndex(+1, code);
                                    break;
                                case $rootScope.keymapping.ENTER:
                                    // enter
                                    if ($scope.inLetterNav) {
                                        $rootScope.$broadcast("keyOutOfBoundsUp", code);
                                    } else {
                                        $(".media-list .highlight > a").click();
                                    }
                                    break;
                                default:
                                    return;
                            }
                        }
                        return false;
                    });
                    $scope.inLetterNav = false;
                    $scope.$on('letterOutOfBoundsDown', function (msg, code) {
                        $scope.inLetterNav = false;
                        $scope.navIndex = -1;
                        setNavIndex(+1);
                    });

                    var setNavIndex = function (inc, code) {
                        var now = $scope.navIndex, next = now + inc;
                        if ($scope.inLetterNav) {
                            $rootScope.$broadcast("keyOutOfBoundsUp", code);
                        } else {
                            if (next < 0) {
                                $rootScope.$broadcast("keyOutOfBoundsUp", code);
                                $scope.navIndex = next;
                                //$scope.$apply();
                                $scope.inLetterNav = true;
                            }

                            if (next > ($scope.artist.albums.length - 1)) {
                                next = ($scope.artist.albums.length - 1);
                            }
                            if (!$scope.inLetterNav) {
                                $scope.navIndex = next;
                                //$scope.$apply();
                                // scroll to active element
                                if ($(".media-list .highlight").length === 1) {
                                    var top = $(".media-list .highlight").position().top - 80;
                                    window.scrollTo(0, top);
                                }
                            }
                        }
                    };
                }
                $rootScope.contentPath = $location.path();
            });
            $scope.$on("backbutton", function () {
                console.log("ArC: capture backbutton");
                $scope.closeView();
            });
        }
    }]);
