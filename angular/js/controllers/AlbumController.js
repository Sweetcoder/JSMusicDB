jsmusicdb.controller('AlbumController', ['$scope', '$http', 'ImageService', 'playerService', function ($scope, $http, ImageService, playerService) {
    "use strict";
    $scope.$on('albumChange', function(e, album) {
        $scope.Album = album;
    });
    $scope.addToPlaylist = function (album) {
        playerService.addAlbum(album);
    };
    $scope.closeView = function () {
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").removeClass("parent").addClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
    };
    $scope.art = ImageService.getAlbumArt($scope);
}]);