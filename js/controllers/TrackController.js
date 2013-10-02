jsmusicdb.controller('TrackController', ['$scope', 'switchView', 'playerService', '$rootScope', function ($scope, switchView, playerService, $rootScope) {
    "use strict";
    $scope.playTrack = function (album, track, type) {
        if ($rootScope.canPlay) {
            // playerService.addAlbum(album);
            if (type !== 'album') {
            	playerService.addTrack(track);
            }
            switchView.playTrack(track, type);
        } else {
            $(".toggle > i").tooltip("show");
        }
    };
}]);