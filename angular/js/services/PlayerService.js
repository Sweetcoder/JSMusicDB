/*
 * Service module to hold information about the player
 */

angular.module('jsmusicdb.playerService', []).service('playerService', function ($rootScope) {
	this.track = function (track) {
		return track;
	};
	this.album = function (album) {
		return album;
	};
	this.nextTrack = function ($scope) {
		var album = $scope.album,
			track = $scope.track,
			index = $.inArray(track, album.tracks);
		// current track is from a different CD
		var skipToNextAlbum = false;
		if (track.Album != album.Album) {
			skipToNextAlbum = true;
		}
		if (index !== -1 || skipToNextAlbum) {
			var next = index + 1;
			track = album.tracks[next];
			if (track) {
				return track;
			} 
		}
	};
	this.previousTrack = function ($scope) {
		var album = $scope.album,
			track = $scope.track,
			index = $.inArray(track, album.tracks);
		// current track is from a different CD
		var skipToNextAlbum = false;
		if (track.Album != album.Album) {
			skipToNextAlbum = true;
			index = album.tracks.length;
		}
		if (index !== -1 || skipToNextAlbum) {
			var next = index - 1;
			track = album.tracks[next];
			console.log("track", track, album.tracks);
			if (track) {
				return track;
			} 
		}
	}
	this.nextAlbum = function ($scope) {
		
		var playlistscope = angular.element(document.querySelector('#playlist .playlist')).scope(),
			playlist = playlistscope.playlist,
			nextAlbum = $.inArray($scope.album, playlist) + 1;
		if (playlist.length > nextAlbum) {
			return playlist[nextAlbum];
		} else {
			return null;
		}
	}
	this.previousAlbum = function ($scope) {
		
		var playlistscope = angular.element(document.querySelector('#playlist .playlist')).scope(),
			playlist = playlistscope.playlist,
			previousAlbum = $.inArray($scope.album, playlist) - 1;
		if (previousAlbum > -1) {
			return playlist[previousAlbum];
		} else {
			return null;
		}
	}
});