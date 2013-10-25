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
		var path = $location.path();
		window.location.href = "#" + path.substring(0, path.indexOf("/artist/"));
	};

	// sorting
	$scope.sortService = sortService;

	// get routing

	if ($routeParams.artist) {
		$rootScope.$watch(function() {
			return $rootScope.parsed;
		}, function(n, o) {
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
				$scope.navIndex = -4;
				$scope.$on('keydown', function(msg, code) {
					switch (code) {
						case 38:
							// up
							setNavIndex(-4);
							break;
						case 40:
							// down
							setNavIndex(+4);
							break;
						case 37:
							// left; select next (or first) li in the media-list
							setNavIndex(-1);
							break;
						case 39:
							//right
							setNavIndex(+1);
							break;
						case 13:
							// enter
							$(".media-list .highlight > a").click();
							break;
						default:
							return;
					}
					return false;
				});

				var setNavIndex = function(inc) {
					var now = $scope.navIndex, next = now + inc;
					if (next < 0) {
						next = 0;
					}
					if (next > ($scope.artist.albums.length - 1)) {
						next = ($scope.artist.albums.length - 1);
					}
					$scope.navIndex = next;
					$scope.$apply();
					// scroll to active element
					if ($(".media-list .highlight").length === 1) {
						var top = $(".media-list .highlight").position().top - 80;
						window.scrollTo(0, top);
					}
				};
			}
			$rootScope.contentPath = $location.path();
		});
	}
}]);
