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
					if ($rootScope.listenLetters) {
						switch (code) {
							case $rootScope.keymapping.UP:
								// up
								setNavIndex(-4, code);
								break;
							case $rootScope.keymapping.DOWN:
								// down
								setNavIndex(+4, code);
								break;
							case $rootScope.keymapping.LEFT:
								// left; select next (or first) li in the media-list
								setNavIndex(-1, code);
								break;
							case $rootScope.keymapping.RIGHT:
								//right
								setNavIndex(+1, code);
								break;
							case $rootScope.keymapping.ENTER:
								// enter
								if ($scope.inLetterNav) {
									$rootScope.$broadcast("keyOutOfBoundsUp", code);
								} else {
									$(".media-list .highlight > a").click();
								}
								break;
							default:
								return;
						}
						return false;
					}
				});
				$scope.inLetterNav = false;
				$scope.$on('letterOutOfBoundsDown', function(msg, code) {
					$scope.inLetterNav = false;
					$scope.navIndex = -1;
					setNavIndex(+1);
				});

				var setNavIndex = function(inc, code) {
					var now = $scope.navIndex, next = now + inc;
					if ($scope.inLetterNav) {
						$rootScope.$broadcast("keyOutOfBoundsUp", code);
					} else {
						if (next < 0) {
							$rootScope.$broadcast("keyOutOfBoundsUp", code);
							next = -1;
							$scope.inLetterNav = true;
						}
						if (next > ($scope.Artists.length - 1)) {
							next = ($scope.Artists.length - 1);
						}
						if (!$scope.inLetterNav) {
							$scope.navIndex = next;
							$scope.$apply();
							// scroll to active element
							if ($(".media-list .highlight").length === 1) {
								var top = $(".media-list .highlight").position().top - 80;
								window.scrollTo(0, top);
							}
						}
					}
				};
			}
			$rootScope.contentPath = $location.path();
		});
	}
}]);
