function ArtistController($scope, $http, switchView, ImageService) {
    "use strict";
    $scope.$on('artistChange', function(e, artist) {
        $scope.Artist = artist;
    });
    $scope.art = ImageService.getInfo($scope);
    $scope.bio = ImageService.getInfo($scope);
    
    $scope.getAlbum = function (album) {
        switchView.album(album);
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").addClass("parent").removeClass("view");
        $("#albumView").removeClass("child").removeClass("parent").addClass("view");
        $(".snap-content").get(0).scrollTop = 0;
    };
    $scope.closeView = function () {
        // return to letter view
        $("#artistOverviewView").removeClass("child").removeClass("parent").addClass("view");
        $("#artistView").addClass("child").removeClass("parent").removeClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        $(".snap-content").get(0).scrollTop = 0;
    };
}