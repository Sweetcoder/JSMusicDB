jsmusicdb.controller('TrackController', ['$scope', 'switchView', 'playerService', '$rootScope', function ($scope, switchView, playerService, $rootScope) {
    "use strict";
    $scope.playTrack = function (album, track, type, $event) {
        if ($rootScope.canPlay || track.inLocalDevice) {
        	var playlist = (type) ? $rootScope.playlist : $rootScope.playlistNowPlaying;
        	if (type !== 'track') {
        		playerService.addAlbum(album, playlist);	
        	} else {
        		playerService.addTrack(track, playlist);
        	}
            //if (type !== 'album') {
            //	playerService.addTrack(track);
            //}
            switchView.playTrack(track, type, playlist);
        } else {
            $(".toggle > i").tooltip("show");
        }
    };
    $scope.trackstate = "plus";
    $scope.addToPlaylist = function(track) {
        playerService.addTrack(track);
        $scope.trackstate = "minus";
    };
    $scope.removeFromPlaylist = function(track) {
        playerService.removeTrack(track);
        $scope.trackstate = "plus";
    };
}]);