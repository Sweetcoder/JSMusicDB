jsmusicdb.controller('PlayerController', ['$scope', '$http', 'switchView', '$rootScope', 'playerService', '$location',
function($scope, $http, switchView, $rootScope, playerService, $location) {"use strict";
	var playerpath = 'proxy/$s/stream.php?path=', audiotag = $('audio').get(0), watching = [$scope.album, $scope.track], sanitize = function(name) {
		name = name.replace(/\+/g, '%2B');
		name = name.replace(/\&/g, '%26');
		name = name.replace(/#/g, '%23');
		return name;
	};
	if (navigator.userAgent.indexOf('Mobi') !== -1) {
		playerpath = 'proxy/$s/mobile.php?path=';
	}
	$scope.isBuffering = false;
	var play = function(track) {
		$scope.scrobbeld = false;
		if ($scope.track) {
			$scope.track.isPlaying = false;
		}
		$scope.track = playerService.track(track);
		$scope.track.isPlaying = true;
		$rootScope.isPlaying = true;
		$scope.playstate = 'pause';

		// set audio source
		var src = "";
		if ($rootScope.server == '1') {
			src = playerpath.replace('$s', $rootScope.server) + sanitize(track.path) + '&sid=' + $rootScope.sid + '&server=' + encodeURIComponent($rootScope.url);
		} else if ($rootScope.server == '2') {
			src = $rootScope.url + '/listen/?path=' + sanitize(track.path);
		} else {
			src = track.path;
		}
		audiotag.src = src;
		audiotag.load();
		audiotag.play();
		// another try to fix the damned mobile playback
		setTimeout(function() {
			audiotag.pause();
			audiotag.play();
		}, 10);
		// set now playling status
		playerService.scrobbleNowPlaying($scope);
	};
	$scope.$on('playTrack', function(e, track, type) {
		// switchView.setAsPlaylist(album);
		$scope.type = type;
		play(track);
	});
	$scope.pos = function() {
		var percentage = ($scope.position / $scope.len) * 100;
		return (percentage) ? percentage + '%' : '0%';
	};
	$scope.next = function() {
		var track = playerService.nextTrack($scope.track, $scope.type);
		if (track) {
			play(track);
		} else {
			$scope.track.isPlaying = false;
			$scope.track = null;
			$rootScope.isPlaying = false;
			audiotag.pause();
		}
	};
	$scope.previous = function() {
		var track = playerService.previousTrack($scope.track, $scope.type);
		if (track) {
			play(track);
		} else {
			$scope.track.isPlaying = false;
			$scope.track = null;
			$rootScope.isPlaying = false;
			audiotag.pause();
		}
	};
	$scope.playstate = 'pause';
	$scope.playpause = function() {
		if ($scope.playstate === 'pause') {
			$scope.playstate = 'play';
			$scope.track.isPlaying = false;
			audiotag.pause();
		} else {
			$scope.playstate = 'pause';
			$scope.track.isPlaying = true;
			audiotag.play();
		}
	};
	$scope.stop = function() {
		$scope.playstate = 'pause';
		$rootScope.isPlaying = false;
		$scope.track.isPlaying = false;
		audiotag.pause();
		audiotag.src = '';
	};
	$scope.updatePosition = function($event) {
		if ($scope.len) {
			var clientX = $event.clientX, left = clientX - $($event.target).offset().left, perc = (left / $($event.target).width()), time = perc * $scope.len;
			audiotag.currentTime = time;
		}
	};
	$scope.muteState = 'up';
	$scope.toggleMute = function() {
		if ($scope.muteState === 'up') {
			$scope.muteState = 'off';
			audiotag.volume = 0;
		} else {
			$scope.muteState = 'up';
			audiotag.volume = 1;
		}
	};
	$scope.love = function(album, track) {
		if (localStorage.getItem("key")) {
			var url = 'http://ws.audioscrobbler.com/2.0/', data = {
				method : 'track.love',
				api_key : '956c1818ded606576d6941de5ff793a5',
				artist : album.Artiest,
				track : track.Titel,
				sk : localStorage.getItem("key"),
				api_sig : lastfm.signplayinglove(album.Artiest, track.Titel, 'track.love')
			};
			$.post(url, data, function(json) {
			});
		}
	};
	var scrobble = function() {
		playerService.scrobble($scope);
		$scope.scrobbeld = true;
	};
	$scope.playlistView = 'list';
	$scope.toggleView = function() {
		if ($scope.playlistView === 'list') {
			$location.path('/playlist');
			$scope.playlistView = 'th';
		} else {
			$location.path($rootScope.contentPath);
			$scope.playlistView = 'list';
		}
	};

	$scope.isRandom = 'random';
	$scope.toggleRandom = function() {
		if ($scope.isRandom === 'random') {
			playerService.isRandom = true;
			playerService.random();
			$scope.isRandom = 'arrow-right';
		} else {
			playerService.isRandom = false;
			playerService.random();
			$scope.isRandom = 'random';
		}
	};
	$scope.hide = function() {
		$("#player").addClass("noshow");
	};
	$scope.show = function() {
		$("#player").removeClass("noshow");
	};

	// audiotag events
	audiotag.addEventListener('timeupdate', function() {
		$scope.position = audiotag.currentTime;
		$scope.len = audiotag.duration;
		if ($scope.position / $scope.len > 0.5 && !$scope.scrobbeld) {
			scrobble();
		}
		$scope.$apply();
		var numRanges = this.buffered.length;

		if (this.buffered.length == 1) {
			// only one range
			if (this.buffered.start(0) == 0 && this.buffered.end(0) == this.duration) {
				$scope.isBuffering = false;
			}
		}
	});
	audiotag.addEventListener('ended', function() {
		$scope.next();
	});
	audiotag.addEventListener('progress', function() {
		$scope.isBuffering = true;
	});
}]);
