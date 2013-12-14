jsmusicdb.controller('AlbumController', ['$scope', '$http', 'ImageService', 'playerService', '$location', '$routeParams', '$rootScope', 'switchView', 'sortService',
    function ($scope, $http, ImageService, playerService, $location, $routeParams, $rootScope, switchView, sortService) {
        "use strict";
        $scope.$on('albumChange', function (e, album, artist, update) {
            $scope.album = album;
            $scope.artist = artist;
            $rootScope.upPath = $location.path().substring(0, $location.path().indexOf("/album/"));
            window.scrollTo(0, 0);
        });
        $scope.addToPlaylist = function (album) {
            playerService.addAlbum(album, $rootScope.playlist);
            $scope.albumstate = "minus";
        };
        $scope.albumstate = "plus";

        $scope.removeFromPlaylist = function (album) {
            playerService.removeAlbum(album);
            $scope.albumstate = "plus";
        };

        $scope.closeView = function () {
            var path = $location.path();
            document.location.href = "#" + path.substring(0, path.indexOf("/album/"));
        };
        // $scope.art = ImageService.getAlbumArt($scope);
        $scope.orderTracks = function (a) {
            var totalNumber = 0;
            if (a.Disc) {
                totalNumber = a.Disc * 100 + a.Nummer;
            } else {
                // fake CD 1
                totalNumber = 100 + a.Nummer;
            }
            return totalNumber;
        };

        if ($routeParams.album) {
            $rootScope.$watch(function () {
                return $rootScope.parsed;
            }, function (n, o) {
                if (n) {
                    if ($rootScope.activeLetter) {
                        $rootScope.activeLetter.active = false;
                    }
                    $rootScope.activeLetter = $rootScope.letterCache[$routeParams.letter];
                    if ($rootScope.activeLetter) {
                        $rootScope.activeLetter.active = true;
                        var activeLetter = $rootScope.activeLetter;
                        $.each(activeLetter.artists, function () {
                            if ($.trim(this.Naam).toLowerCase() === $routeParams.artist.toLowerCase()) {
                                var artist = this;
                                $.each(this.albums, function () {
                                    if ($.trim(this.Album) === $routeParams.album) {
                                        if (window._gaq) {
                                            _gaq.push(['_trackPageview', '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist + '/album/' + $routeParams.album]);
                                        }
                                        window.document.title = 'JSMusicDB - ' + $routeParams.artist + " - " + $routeParams.album;
                                        $rootScope.pageTitle = $routeParams.album + "<span class='artist'>" + $routeParams.artist + "</span>";
                                        localStorage.removeItem("state");
                                        localStorage.setItem("state", JSON.stringify({
                                            url: '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist + '/album/' + $routeParams.album
                                        }));
                                        $rootScope.rootView = false;
                                        switchView.album(this, artist, true);
                                        return false;
                                    }
                                });
                            }
                        });
                    }
                    $scope.navIndex = -1;
                    $scope.$on('keydown', function (msg, code) {
                        if ($rootScope.listenLetters) {
                            switch (code) {
                                case $rootScope.keymapping.UP:
                                    // up
                                    setNavIndex(-1, code);
                                    break;
                                case $rootScope.keymapping.DOWN:
                                    // down
                                    setNavIndex(+1, code);
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
                                        $("table tr.highlight > td:first").click();
                                        msg.preventDefault();
                                    }
                                    break;
                                default:
                                    return;
                            }
                        }
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
                            $scope.navIndex = -1;
                        } else {
                            if (next < 0) {
                                $rootScope.$broadcast("keyOutOfBoundsUp", code);
                                $scope.navIndex = next;
                                //$scope.$apply();
                                $scope.inLetterNav = true;
                            }

                            if (next > ($scope.album.tracks.length - 1)) {
                                next = ($scope.album.tracks.length - 1);
                            }
                            if (!$scope.inLetterNav) {
                                $scope.navIndex = next;
                                //$scope.$apply();
                                // scroll to active element
                                if ($("table tr.highlight").length === 1) {
                                    var top = $("table tr.highlight").position().top - 80;
                                    window.scrollTo(0, top);
                                }
                            }
                        }
                    };
                }
                $rootScope.contentPath = $location.path();
            });
            $scope.$on("backbutton", function () {
                console.log("AlC: capture backbutton");
                $scope.closeView();
            });
        }
    }]);
