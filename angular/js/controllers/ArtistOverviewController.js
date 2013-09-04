jsmusicdb.controller('ArtistOverviewController', ['$scope', '$http', 'switchView', '$location', '$routeParams', '$rootScope', function ($scope, $http, switchView, $location, $routeParams, $rootScope) {
    "use strict";
    $scope.$on('letterChange', function(e, letter) {
        $scope.Artists = letter.artists;
        // update location
        // $location.path('/letter/' + letter.letter);
    });
    $scope.$on('routeArtistChange', function (e, artistName) {
    	$.each($scope.Artists, function () {
    		if (this.Naam === artistName) {
				switchView.artist(this);
				// TODO: generic function
				$("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
				$("#artistView").removeClass("child").removeClass("parent").addClass("view");
				$("#albumView").addClass("child").removeClass("parent").removeClass("view");
				$(".snap-content").get(0).scrollTop = 0; 
    		}
    	});
    })
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
    
    // get routing
    
    if ($routeParams.letter) {
    	switchView.routeLetter($routeParams.letter);
    }
}]);