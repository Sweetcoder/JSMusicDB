/*
 * Service module to switch between different views
 */

angular.module('jsmusicdb.switchView', []).factory('switchView', function ($rootScope) {
	return {
		letter: function (l) {
			$rootScope.$broadcast('letterChange', l);
		},
		artist: function (a) {
			$rootScope.$broadcast('artistChange', a);
		},
		album: function (a) {
			$rootScope.$broadcast('albumChange', a);
		},
		addToPlaylist: function (a) {
			$rootScope.$broadcast('addAlbumToPlaylist' ,a);
		},
		setAsPlaylist: function (a) {
			$rootScope.$broadcast('setAsPlaylist' ,a);
		},
		playTrack: function (a, t) {
			$rootScope.$broadcast('playTrack', a, t);
		}
	}
});
