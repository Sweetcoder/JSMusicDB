jsmusicdb.controller('ArtistOverviewController', ['$scope', '$http', 'switchView', '$location', '$routeParams', '$rootScope', 'sortService',
function($scope, $http, switchView, $location, $routeParams, $rootScope, sortService) {"use strict";
	$scope.$on('letterChange', function(e, letter) {
		$scope.Artists = letter.artists;
	});
	$scope.$on('routeArtistChange', function(e, artistName) {
		$.each($scope.Artists, function() {
			if (this.Naam === artistName) {
				switchView.artist(this);
				// TODO: generic function
				$(".snap-content").get(0).scrollTop = 0;
			}
		});
	});

	$scope.getArtist = function(artist) {
		switchView.artist(artist);
		// TODO: generic function
		$("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
		$("#artistView").removeClass("child").removeClass("parent").addClass("view");
		$("#albumView").addClass("child").removeClass("parent").removeClass("view");
		$(".snap-content").get(0).scrollTop = 0;
	};

	// sorting
	$scope.sortService = sortService;

	// get routing

	if ($routeParams.letter) {
		$rootScope.$watch(function() {
			return $rootScope.parsed;
		}, function(n, o) {
			if (n) {
				if (window._gaq) {
					_gaq.push(['_trackPageview', '/letter/' + $routeParams.letter]);
				}
				window.document.title = 'JSMusicDB - letter: ' + $routeParams.letter;
				switchView.routeLetter($routeParams.letter);

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
					if (next > ($scope.Artists.length - 1)) {
						next = ($scope.Artists.length - 1);
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
