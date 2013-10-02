/*
 * Service module to hold information about the player
 */

angular.module('jsmusicdb.playerService', []).service('playerService', function($rootScope, $http) {"use strict";
	var that = this;
	that.busy = false;
	that.isRandom = false;
	this.track = function(track) {
		return track;
	};
	this.album = function(album) {
		return album;
	};
	this.addAlbum = function(album) {
		$rootScope.playlistAlbums = $rootScope.playlistAlbums || [];
		if ($.inArray(album, $rootScope.playlistAlbums) === -1) {
			album.tracks = album.tracks.sort(function(a, b) {
				var aDiscMultiplier = 100, bDiscMultiplier = 100;
				if (!isNaN(a.Disc)) {
					aDiscMultiplier = a.Disc * 100;
				}
				if (!isNaN(b.Disc)) {
					bDiscMultiplier = b.Disc * 100;
				}
				if (Number(Number(a.Nummer) + aDiscMultiplier) < Number(Number(b.Nummer) + bDiscMultiplier)) {
					return -1;
				} else {
					return 1;
				}
			});
			$rootScope.playlistAlbums = $rootScope.playlistAlbums.concat(album);
			if (that.isRandom) {
				$rootScope.playlistAlbums = shuffle($rootScope.playlistAlbums);
			}
		}
	};
	this.addTrack = function(track) {
		$rootScope.playlist = $rootScope.playlist || [];
		if ($.inArray(track, $rootScope.playlist) === -1) {
			$rootScope.playlist.push(track);
		}
	};
	this.removeAlbum = function (album) {
	    var index = $.inArray(album, $rootScope.playlistAlbums);
	    if (index !== -1) {
	        $rootScope.playlistAlbums.splice(index ,1);
	    }
	};
	
	this.removeTrack = function (track) {
	    var index = $.inArray(track, $rootScope.playlist);
	    if (index !== -1) {
	        $rootScope.playlist.splice(index, 1);
	    }
	};
	this.nextTrack = function(track, type) {
		if (type === 'track') {
			var index = $.inArray(track, $rootScope.playlist);
			return $rootScope.playlist[index + 1];
		} else {
			var next = null;
			$.each($rootScope.playlistAlbums, function(i) {
				var index = $.inArray(track, this.tracks);
				if (index !== -1) {
					// next track in album
					next = this.tracks[index + 1];
					if (!next && $rootScope.playlistAlbums[i + 1]) {
						// first track of next album
						next = $rootScope.playlistAlbums[i + 1].tracks[0];
					}
					return false;
				}
			});
			return next;
		}
	};
	this.previousTrack = function(track, type) {
		if (type === 'track') {
			var index = $.inArray(track, $rootScope.playlist);
			return $rootScope.playlist[index - 1];
		} else {
			var next  = null;
			$.each($rootScope.playlistAlbums, function (i) {
				var index = $.inArray(track, this.tracks);
				if (index !== -1) {
					// previous track in album
					next = this.tracks[index - 1];
					if (!next && $rootScope.playlistAlbums[i - 1]) {
						// last track of previous album
						next = $rootScope.playlistAlbums[i - 1].tracks[$rootScope.playlistAlbums[i - 1].tracks.length-1];
					}
					return false;
				}
			});
			return next;
		}
	};
	this.scrobble = function($scope) {
		// scrobble
		if (localStorage.getItem("key") && !that.busy) {
			that.busy = true;
			var now = new Date(), ts = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + now.getTimezoneOffset(), now.getSeconds()) / 1000, url = 'http://ws.audioscrobbler.com/2.0/', data = {
				method : 'track.scrobble',
				api_key : '956c1818ded606576d6941de5ff793a5',
				artist : $scope.track.albumNode.Artiest,
				track : $scope.track.Titel,
				timestamp : ts,
				sk : localStorage.getItem("key"),
				api_sig : lastfm.signscrobble($scope.track.albumNode.Artiest, $scope.track.Titel, ts)
			};
			$.post(url, data, function() {
				that.busy = false;
			});
		}
	};
	this.scrobbleNowPlaying = function($scope) {
		if (localStorage.getItem("key") && !that.busy) {
			that.busy = true;
			var url = 'http://ws.audioscrobbler.com/2.0/', data = {
				method : 'track.updateNowPlaying',
				api_key : '956c1818ded606576d6941de5ff793a5',
				artist : $scope.track.albumNode.Artiest,
				track : $scope.track.Titel,
				sk : localStorage.getItem("key"),
				api_sig : lastfm.signplayinglove($scope.track.albumNode.Artiest, $scope.track.Titel, 'track.updateNowPlaying')
			};
			$.post(url, data, function() {
				that.busy = false;
			});
		}
	};
	this.random = function() {
		if (that.isRandom) {
			$rootScope.playlist = shuffle($rootScope.playlist);
		} else {
			$rootScope.playlist = [];
			$.each($rootScope.playlistAlbums, function() {
				$rootScope.playlist = $rootScope.playlist.concat(this.tracks.sort(function(a, b) {
					if (!isNaN(a.Disc)) {
						// sort by discnumber (or by number, secondary)
						if (Number(a.Disc) < Number(b.Disc)) {
							return -1;
						} else if (Number(a.Disc) == Number(b.Disc)) {
							if (Number(a.Nummer) < Number(b.Nummer)) {
								return -1;
							} else {
								return 1;
							}
						} else {
							return 1;
						}
					} else {
						if (Number(a.Nummer) < Number(b.Nummer)) {
							return -1;
						} else {
							return 1;
						}
					}
				}));
			});
		}
	};
	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

});
