/*
 * Service module to switch between different views
 */

angular.module('jsmusicdb.switchView', []).factory('switchView', function ($rootScope) {
	return {
		letter: function (l) {
			console.log('switching to', l);
			$rootScope.$broadcast('letterChange', l);
		},
		artist: function (a) {
			console.log('switching to', a);
			$rootScope.$broadcast('artistChange', a);
		}
	}
});
