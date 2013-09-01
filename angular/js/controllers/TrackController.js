jsmusicdb.controller('TrackController', ['$scope', 'switchView', 'playerService', function ($scope, switchView, playerService) {
    "use strict";
    $scope.playTrack = function (album, track) {
        playerService.addAlbum(album);
        switchView.playTrack(track);
    };
}]);