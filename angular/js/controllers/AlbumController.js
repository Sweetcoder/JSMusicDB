jsmusicdb.controller('AlbumController', ['$scope', '$http', 'ImageService', 'playerService', '$location', function ($scope, $http, ImageService, playerService, $location) {
    "use strict";
    $scope.$on('albumChange', function(e, album, artist) {
        $scope.Album = album;
        $scope.Artist = artist;
        // update location
        // $location.path('/artist/' + artist.Naam + '/album/' + album.Album);
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").addClass("parent").removeClass("view");
        $("#albumView").removeClass("child").removeClass("parent").addClass("view");
    });
    $scope.addToPlaylist = function (album) {
        playerService.addAlbum(album);
    };
    $scope.closeView = function () {
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").removeClass("parent").addClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        // window.history.back();
    };
    $scope.art = ImageService.getAlbumArt($scope);
}]);