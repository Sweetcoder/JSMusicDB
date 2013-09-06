jsmusicdb.controller('PlaylistController', ['$scope', 'playerService', function ($scope, playerService) {
    "use strict";
    $scope.$on("addAlbumToPlaylist", function (e, album) {
        playerService.addAlbum(album);
    });
    $scope.$on("setAsPlaylist", function (e, album) {
        $scope.playlist = []; // clear current playlist
        $scope.playlist.push(album);
    });
    $scope.orderTracks = function(a) {
        var totalNumber= 0;
        if (a.Disc) {
            totalNumber = a.Disc * 100 + a.Nummer;
        } else {
            // fake CD 1
            totalNumber =  100 + a.Nummer;
        }
        return totalNumber;
    };
}]);