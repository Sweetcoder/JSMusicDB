jsmusicdb.controller('AlbumController', ['$scope', '$http', 'ImageService', 'playerService', '$location', '$routeParams', '$rootScope', 'switchView', 'sortService',
function($scope, $http, ImageService, playerService, $location, $routeParams, $rootScope, switchView, sortService) {"use strict";
	$scope.$on('albumChange', function(e, album, artist, update) {
		$scope.album = album;
		$scope.artist = artist;
	});
	$scope.addToPlaylist = function(album) {
		playerService.addAlbum(album, $rootScope.playlist);
		$scope.albumstate = "minus";
	};
	$scope.albumstate = "plus";

	$scope.removeFromPlaylist = function(album) {
		playerService.removeAlbum(album);
		$scope.albumstate = "plus";
	};

	$scope.closeView = function() {
		var path = $location.path();
		window.location.href = "#" + path.substring(0, path.indexOf("/album/"));
	};
	// $scope.art = ImageService.getAlbumArt($scope);
	$scope.orderTracks = function(a) {
		var totalNumber = 0;
		if (a.Disc) {
			totalNumber = a.Disc * 100 + a.Nummer;
		} else {
			// fake CD 1
			totalNumber = 100 + a.Nummer;
		}
		return totalNumber;
	};

	if ($routeParams.album) {
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
					if ($.trim(this.Naam).toLowerCase() === $routeParams.artist.toLowerCase()) {
						var artist = this;
						$.each(this.albums, function() {
							if ($.trim(this.Album) === $routeParams.album) {
								if (window._gaq) {
									_gaq.push(['_trackPageview', '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist + '/album/' + $routeParams.album]);
								}
								window.document.title = 'JSMusicDB - ' + $routeParams.artist + " - " + $routeParams.album;
								switchView.album(this, artist, true);
								return false;
							}
						});
					}
				});
				$scope.navIndex = -1;
				$scope.$on('keydown', function(msg, code) {
					switch (code) {
						case 38:
							// up
							setNavIndex(-1);
							break;
						case 40:
							// down
							setNavIndex(+1);
							break;
						case 13:
							// enter
							$("table tr.highlight > td:first").click();
							msg.preventDefault();
							break;
						default:
							return;
					}
				});

				var setNavIndex = function(inc) {
					var now = $scope.navIndex, next = now + inc;
					if (next < 0) {
						next = 0;
					}
					if (next > ($scope.album.tracks.length - 1)) {
						next = ($scope.album.tracks.length - 1);
					}
					$scope.navIndex = next;
					$scope.$apply();
					// scroll to active element
					if ($("table tr.highlight").length === 1) {
						var top = $("table tr.highlight").position().top - 80;
						window.scrollTo(0, top);
					}
				};
			}
			$rootScope.contentPath = $location.path();
		});
	}
}]);
