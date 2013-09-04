/*
 * Service module to switch between different views
 */

angular.module('jsmusicdb.switchView', []).factory('switchView', function ($rootScope) {
	return {
		letter: function (l) {
			$rootScope.$broadcast('letterChange', l);
		},
		routeLetter: function (l) {
			$rootScope.$broadcast('routeLetterChange', l);
		},
		artist: function (a) {
			$rootScope.$broadcast('artistChange', a);
		},
		routeArtist: function (a) {
			$rootScope.$broadcast('routeArtistChange', a);
		},
		album: function (a, ar) {
			$rootScope.$broadcast('albumChange', a, ar);
		},
		addToPlaylist: function (a) {
			$rootScope.$broadcast('addAlbumToPlaylist' ,a);
		},
		setAsPlaylist: function (a) {
			$rootScope.$broadcast('setAsPlaylist' ,a);
		},
		playTrack: function (t) {
			$rootScope.$broadcast('playTrack', t);
		}
	};
});
