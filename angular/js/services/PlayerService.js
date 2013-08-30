/*
 * Service module to hold information about the player
 */

angular.module('jsmusicdb.playerService', []).service('playerService', function ($rootScope) {
	var that = this;
	this.track = function (track) {
		return track;
	};
	this.album = function (album) {
		return album;
	};
	this.addAlbum = function (album) {
		// TODO: figure out if we can hold these properties in own scope
		$rootScope.playlist = $rootScope.playlist || [];
		$rootScope.playlist = $rootScope.playlist.concat(album.tracks);
		$rootScope.playlistAlbums = $rootScope.playlistAlbums || [];
		$rootScope.playlistAlbums = $rootScope.playlistAlbums.concat(album);
	};
	this.nextTrack = function (track) {
		var index = $.inArray(track, $rootScope.playlist);
		return $rootScope.playlist[index+1];
	};
	this.previousTrack = function (track) {
		var index = $.inArray(track, $rootScope.playlist);
		return $rootScope.playlist[index-1];
	};
});