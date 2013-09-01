function PlaylistController($scope, playerService) {
    "use strict";
    $scope.$on("addAlbumToPlaylist", function (e, album) {
        playerService.addAlbum(album);
    });
    $scope.$on("setAsPlaylist", function (e, album) {
        $scope.playlist = []; // clear current playlist
        $scope.playlist.push(album);
    });
}