function TrackController($scope, switchView, playerService) {
    "use strict";
    $scope.playTrack = function (album, track) {
        playerService.addAlbum(album);
        switchView.playTrack(track);
    };
}