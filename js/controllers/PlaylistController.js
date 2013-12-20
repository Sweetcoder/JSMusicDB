jsmusicdb.controller('PlaylistController', ['$scope', 'playerService', '$log', "$http", "$rootScope",
function($scope, playerService, $log, $http, $rootScope) {'use strict';

	window.document.title = 'JSMusicDB - Playlist';
	if (window._gaq) {
		_gaq.push(['_trackPageview', '/playlist']);
	}

	$scope.$on("addAlbumToPlaylist", function(e, album) {
		playerService.addAlbum(album);
	});
	$scope.$on("setAsPlaylist", function(e, album) {
		$scope.playlist = [];
		// clear current playlist
		$scope.playlist.push(album);
	});
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
	$scope.$on("backbutton", function() {
		console.log("Playlist: capture backbutton: " + $rootScope.contentPath);
		document.location.href = "#" + $rootScope.contentPath;
	});

	$scope.setPlaylist = function(playlist) {
		var tmpList = [];
		if (playlist !== "track") {
			// this is server based playlist
			if ($rootScope.server === '1') {
				$scope.selectedPlaylist = playlist;
				$http.get('proxy/1/playlist.php?server=' + $rootScope.url + '&sid=' + $rootScope.sid + '&playlist=' + playlist.item_id).success(function(data) {
					angular.forEach(data, function(value, key) {
						if (key === "items") {
							angular.forEach(value, function(value) {
								var resource = value.res;
								// check if the resource is available
								var track = getTrack(resource);
								if (track) {
									tmpList.push(track);
								} else {
									$log.warn("resource not found");
									var dummy = new jsmusicdb.Track({
										Naam : 'unavailable',
										Artiest : 'unavailable',
										Album : 'unavailable',
										Duur : '00:00',
										Titel : 'unavailable',
										Nummer : 0,
										Pad : resource,
										Disk : 1
									});
									tmpList.push(dummy);
								}
							});
						}
					});
				});
				$scope.playlistTracks = tmpList;
			}
		} else {
			// show the current track playlist
			$scope.selectedPlaylist = null;
			$scope.playlistTracks = $rootScope.playlistNowPlaying;
		}
	};

	var getTrack = function(resource) {
		return $rootScope.pathCache[resource];
	};

	/** extended playlist support **/

	var tmpList = [];
	$rootScope.$watch(function() {
		return $rootScope.canPlay;
	}, function(n, o) {
		if (n) {
			if ($rootScope.server === '1') {
				$http.get("proxy/1/playlists.php?server=" + $rootScope.url + "&sid=" + $rootScope.sid).success(function(data) {
					angular.forEach(data, function(value, key) {
						if (key === "items") {
							angular.forEach(value, function(value) {
								var playlist = new jsmusicdb.Playlist(value);
								tmpList.push(playlist);
							});
						}
					});
					$scope.playlists = tmpList;
				});
			}
		}
	});
	
	$("#playlist .dropdown .dropdown-toggle").on("click", function () {
		$("#playlistSelector .active").removeClass("active");
	});

}]);
