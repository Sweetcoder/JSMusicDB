/*
 * Service module to switch between different views
 */

angular.module('jsmusicdb.switchView', []).factory('switchView', function ($rootScope) {
	'use strict';
	return {
		letter: function (l) {
			$rootScope.$broadcast('letterChange', l);
		},
		routeLetter: function (l) {
			$rootScope.$broadcast('routeLetterChange', l);
		},
		artist: function (a, up) {
			$rootScope.$broadcast('artistChange', a, up);
		},
		routeArtist: function (a) {
			$rootScope.$broadcast('routeArtistChange', a);
		},
		album: function (a, ar, up) {
			$rootScope.$broadcast('albumChange', a, ar, up);
		},
		addToPlaylist: function (a) {
			$rootScope.$broadcast('addAlbumToPlaylist' ,a);
		},
		setAsPlaylist: function (a) {
			$rootScope.$broadcast('setAsPlaylist' ,a);
		},
		playTrack: function (t, type, playlist) {
			$rootScope.$broadcast('playTrack', t, type, playlist);
		}
	};
});
