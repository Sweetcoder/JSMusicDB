jsmusicdb.controller('TrackController', ['$scope', 'switchView', 'playerService', '$rootScope', function ($scope, switchView, playerService, $rootScope) {
    "use strict";
    $scope.playTrack = function (album, track) {
        if ($rootScope.canPlay) {
            playerService.addAlbum(album);
            switchView.playTrack(track);
        } else {
            console.log('not logged in');
            $(".toggle > i").tooltip("show");
        }
    };
}]);