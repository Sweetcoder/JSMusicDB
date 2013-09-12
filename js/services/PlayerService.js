/*
 * Service module to hold information about the player
 */

angular.module('jsmusicdb.playerService', []).service('playerService', function($rootScope, $http) {"use strict";
    var that = this;
    that.busy = false;
    this.track = function(track) {
        return track;
    };
    this.album = function(album) {
        return album;
    };
    this.addAlbum = function(album) {
        $rootScope.playlist = $rootScope.playlist || [];
        $rootScope.playlistAlbums = $rootScope.playlistAlbums || [];
        if ($.inArray(album, $rootScope.playlistAlbums) === -1) {
            $rootScope.playlist = $rootScope.playlist.concat(album.tracks.sort(function(a, b) {
                var discMultiplier = 100;
                if (!isNaN(a.Disc)) {
                    discMultiplier = a.Disc * 100;
                }
                if (Number(a.Nummer + discMultiplier) < Number(b.Nummer + discMultiplier)) {
                    return -1;
                } else {
                    return 1;
                }
            }));
            $rootScope.playlistAlbums = $rootScope.playlistAlbums.concat(album);
        }
    };
    this.nextTrack = function(track) {
        var index = $.inArray(track, $rootScope.playlist);
        return $rootScope.playlist[index + 1];
    };
    this.previousTrack = function(track) {
        var index = $.inArray(track, $rootScope.playlist);
        return $rootScope.playlist[index - 1];
    };
    this.scrobble = function($scope) {
        // scrobble
        if (localStorage.getItem("key") && !that.busy) {
            that.busy = true;
            var now = new Date(), ts = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + now.getTimezoneOffset(), now.getSeconds()) / 1000, url = 'http://ws.audioscrobbler.com/2.0/', data = {
                method : 'track.scrobble',
                api_key : '956c1818ded606576d6941de5ff793a5',
                artist : $scope.track.albumNode.Artiest,
                track : $scope.track.Titel,
                timestamp : ts,
                sk : localStorage.getItem("key"),
                api_sig : lastfm.signscrobble($scope.track.albumNode.Artiest, $scope.track.Titel, ts)
            };
            $.post(url, data, function() {
                that.busy = false;
            });
        }
    };
    this.scrobbleNowPlaying = function($scope) {
        if (localStorage.getItem("key") && !that.busy) {
            that.busy = true;
            var url = 'http://ws.audioscrobbler.com/2.0/', data = {
                method : 'track.updateNowPlaying',
                api_key : '956c1818ded606576d6941de5ff793a5',
                artist : $scope.track.albumNode.Artiest,
                track : $scope.track.Titel,
                sk : localStorage.getItem("key"),
                api_sig : lastfm.signplayinglove($scope.track.albumNode.Artiest, $scope.track.Titel, 'track.updateNowPlaying')
            };
            $.post(url, data, function() {
                that.busy = false;
            });
        }
    };
    this.random = function(random) {
        if (random) {
            $rootScope.playlist = shuffle($rootScope.playlist);
        } else {
            $rootScope.playlist = [];
            $.each($rootScope.playlistAlbums, function() {
                $rootScope.playlist = $rootScope.playlist.concat(this.tracks.sort(function(a, b) {
                    if (!isNaN(a.Disc)) {
                        // sort by discnumber (or by number, secondary)
                        if (Number(a.Disc) < Number(b.Disc)) {
                            return -1;
                        } else if (Number(a.Disc) == Number(b.Disc)) {
                            if (Number(a.Nummer) < Number(b.Nummer)) {
                                return -1;
                            } else {
                                return 1;
                            }
                        } else {
                            return 1;
                        }
                    } else {
                        if (Number(a.Nummer) < Number(b.Nummer)) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                }));
            });
        }
    };
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

});
