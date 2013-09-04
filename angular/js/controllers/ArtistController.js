jsmusicdb.controller('ArtistController', ['$scope', '$http', 'ImageService', 'switchView', '$location', '$routeParams', '$rootScope', 'modelService',
function($scope, $http, ImageService, switchView, $location, $routeParams, $rootScope, modelService) {"use strict";
	$scope.$on('artistChange', function(e, artist, update) {
		$scope.artist = artist;
		if (update) {
			$scope.art = ImageService.getInfo($scope);
			$scope.bio = ImageService.getInfo($scope);
		}
	});
	$scope.art = ImageService.getInfo($scope);
	$scope.bio = ImageService.getInfo($scope);

	$scope.getAlbum = function(album) {
		switchView.album(album, $scope.Artist);
		$("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
		$("#artistView").removeClass("child").addClass("parent").removeClass("view");
		$("#albumView").removeClass("child").removeClass("parent").addClass("view");
		$(".snap-content").get(0).scrollTop = 0;
	};
	$scope.closeView = function() {
		// return to letter view
		$("#artistOverviewView").removeClass("child").removeClass("parent").addClass("view");
		$("#artistView").addClass("child").removeClass("parent").removeClass("view");
		$("#albumView").addClass("child").removeClass("parent").removeClass("view");
		$(".snap-content").get(0).scrollTop = 0;
		window.history.back();
	};

	// sorting defaults
	$scope.sortAlbums = 'Jaar';

	// get routing

	if ($routeParams.artist) {
		$rootScope.$watch(function () {
			return $rootScope.parsed;
		}, function (n, o) {
			if (n) {
				var activeLetter = $rootScope.activeLetter;
				$.each(activeLetter.artists, function() {
					if (this.Naam === $routeParams.artist) {
						switchView.artist(this, true);
						return false;
					}
				})
			}
		});
	}
}]); 