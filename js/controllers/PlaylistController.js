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

	$scope.deletePlaylist = function(playlist) {
		if (playlist !== "track") {
			// this is server based playlist
			if ($rootScope.server === '1') {
				$http.get('proxy/1/deletePlaylist.php?server=' + $rootScope.url + '&sid=' + $rootScope.sid + '&playlist=' + playlist.item_id).success(function(data) {
					if (data.success) {
						$scope.selectedPlaylist = null;

					}
					// refresh playlists
					$scope.getPlaylists();
				});
			}
		}
	};

	$scope.addPlaylist = function() {
		var newList = $scope.data.playlistName;
		if (playlist !== "track") {
			// this is server based playlist
			if ($rootScope.server === '1') {
				$http.get('proxy/1/addPlaylist.php?server=' + $rootScope.url + '&sid=' + $rootScope.sid + '&playlist=' + $scope.data.playlistName).success(function(data) {
					if (data.success) {
						$scope.data.playlistName = '';
					}
					// refresh playlists
					$scope.getPlaylists(function() {
						angular.forEach($scope.playlists, function(value) {
							if (value.title === newList) {
								$scope.selectedPlaylist = value;
							}
						});
					});
				});
			}
		}
	};

	$scope.renamePlaylist = function(playlist) {
		/*
		 action:saveplsname
		 id:musiclib_music_shared/playlist/902
		 name:12345
		 library:shared
		 */
		var newName = $scope.data.alterPlaylistName;
		if (playlist !== "track") {
			// this is server based playlist
			if ($rootScope.server === '1') {
				$http.get('proxy/1/renamePlaylist.php?server=' + $rootScope.url + '&sid=' + $rootScope.sid + '&playlist=' + playlist.item_id + '&name=' + newName).success(function(data) {
					if (data.success) {
						// refresh playlists
						$scope.getPlaylists(function() {
							angular.forEach($scope.playlists, function(value) {
								if (value.title === newName) {
									$scope.selectedPlaylist = value;
								}
							});
						});
						$scope.data.alterPlaylistName = null;
					}
				});
			}
		}
	};

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

	$scope.getPlaylists = function(callback) {
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
						if (callback) {
							callback();
						}
					});
				}
			}
		});
	};

	$scope.getPlaylists();

	$("#playlist .dropdown .dropdown-toggle").on("click", function() {
		$("#playlistSelector .active").removeClass("active");
	});

}]);
