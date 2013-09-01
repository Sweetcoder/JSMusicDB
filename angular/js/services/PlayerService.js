/*
 * Service module to hold information about the player
 */

angular.module('jsmusicdb.playerService', []).service('playerService', function($rootScope, $http) {
    "use strict";
    var that = this;
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
            $rootScope.playlist = $rootScope.playlist.concat(album.tracks);
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
    this.scrobble = function ($scope) {
        // scrobble
        if (localStorage.getItem("key") && !$scope.scrobbeld) {
            var now = new Date(),
                ts = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + now.getTimezoneOffset(), now.getSeconds()) / 1000,
                url = 'http://ws.audioscrobbler.com/2.0/', data = {
                method : 'track.scrobble',
                api_key : '956c1818ded606576d6941de5ff793a5',
                artist : $scope.track.albumNode.Artiest,
                track : $scope.track.Titel,
                timestamp : ts,
                sk : localStorage.getItem("key"),
                api_sig: lastfm.signscrobble($scope.track.albumNode.Artiest, $scope.track.Titel, ts)
            };
            $http.post(url, data);
        }
    };
    this.scrobbleNowPlaying = function ($scope) {
        if (localStorage.getItem("key")) {
            var url = 'http://ws.audioscrobbler.com/2.0/', data = {
                method : 'track.updateNowPlaying',
                api_key : '956c1818ded606576d6941de5ff793a5',
                artist : $scope.track.albumNode.Artiest,
                track : $scope.track.Titel,
                sk : localStorage.getItem("key"),
                api_sig: lastfm.signplayinglove($scope.track.albumNode.Artiest, $scope.track.Titel, 'track.updateNowPlaying')
            };
            $http.post(url, data);
        }
    };
}); 