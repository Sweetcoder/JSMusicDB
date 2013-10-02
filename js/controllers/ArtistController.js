jsmusicdb.controller('ArtistController', ['$scope', '$http', 'ImageService', 'switchView', '$location', '$routeParams', '$rootScope', 'modelService', 'sortService',
function($scope, $http, ImageService, switchView, $location, $routeParams, $rootScope, modelService, sortService) {"use strict";
	$scope.$on('artistChange', function(e, artist, update) {
		$scope.artist = artist;
		if (update) {
			ImageService.getInfo($scope);
		}
	});
	
	

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

	// sorting
	$scope.sortService = sortService;

	// get routing

	if ($routeParams.artist) {
		$rootScope.$watch(function () {
			return $rootScope.parsed;
		}, function (n, o) {
			if (n) {
				if ($rootScope.activeLetter) {
					$rootScope.activeLetter.active = false;
				}
				$rootScope.activeLetter = $rootScope.letterCache[$routeParams.letter];
				$rootScope.activeLetter.active = true;
				var activeLetter = $rootScope.activeLetter;
				$.each(activeLetter.artists, function() {
					if (this.Naam === $routeParams.artist) {
					    if (window._gaq) {
					       _gaq.push(['_trackPageview', '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist]);
					    }
					    window.document.title = 'JSMusicDB - ' + $routeParams.artist;
						switchView.artist(this, true);
						return false;
					}
				});
			}
		});
	}
}]); 