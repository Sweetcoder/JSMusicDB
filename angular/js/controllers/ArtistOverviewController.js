jsmusicdb.controller('ArtistOverviewController', ['$scope', '$http', 'switchView', function ($scope, $http, switchView) {
    "use strict";
    $scope.$on('letterChange', function(e, letter) {
        $scope.Artists = letter.artists;
    });
    $scope.getArtist = function (artist) {
        switchView.artist(artist);
        // TODO: generic function
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").removeClass("parent").addClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        $(".snap-content").get(0).scrollTop = 0;
    };
    
    // sorting defaults
    $scope.sortArtists = 'Naam';
}]);