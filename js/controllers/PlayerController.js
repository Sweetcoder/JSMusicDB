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
	$rootScope.playlist = [];
	$rootScope.playlistNowPlaying = [];

	$scope.playlist = $rootScope.playlist;

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
		$rootScope.addRecent(track);

		audiotag.src = src;
		audiotag.load();
		audiotag.play();
		/*
		// another try to fix the damned mobile playback
		setTimeout(function() {
		audiotag.pause();
		audiotag.play();
		}, 10);
		*/
		// set now playling status
		playerService.scrobbleNowPlaying($scope);
	};
	$scope.$on('playTrack', function(e, track, type, playlist) {
		// switchView.setAsPlaylist(album);
		$scope.type = type;
		$scope.playlist = playlist;
		play(track);
	});
	$scope.pos = function() {
		var percentage = ($scope.position / $scope.len) * 100;
		return (percentage) ? percentage + '%' : '0%';
	};
	$scope.bufferpos = function() {
		var percentage = ($scope.buffpos / $scope.len) * 100;
		return (percentage) ? percentage + '%' : '0%';
	};
	$scope.next = function() {
		var track = playerService.nextTrack($scope.track, $scope.type, $scope.playlist);
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
		var track = playerService.previousTrack($scope.track, $scope.type, $scope.playlist);
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
	$scope.pause = function() {
		$scope.playstate = 'play';
		$scope.track.isPlaying = false;
		audiotag.pause();
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
	$scope.muteState = 'high';
	$scope.toggleMute = function() {
		if ($scope.muteState === 'high') {
			$scope.muteState = 'mute';
			audiotag.volume = 0;
		} else {
			$scope.muteState = 'high';
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
	$scope.playlistView = 'navicon';
	$scope.toggleView = function() {
		if ($scope.playlistView === 'navicon') {
			$location.path('/playlist');
			$scope.playlistView = 'grid';
		} else {
			$location.path($rootScope.contentPath);
			$scope.playlistView = 'navicon';
		}
	};

	$scope.isRandom = 'shuffle';
	$scope.toggleRandom = function() {
		if ($scope.isRandom === 'shuffle') {
			playerService.isRandom = true;
			playerService.random();
			$scope.isRandom = 'arrow-right-a';
		} else {
			playerService.isRandom = false;
			playerService.random();
			$scope.isRandom = 'shuffle';
		}
	};
	$scope.hide = function() {
		$("#player").addClass("noshow");
	};
	$scope.maximize = function() {
		$("#player").addClass("maximized");
	};
	$scope.show = function() {
		$("#player").removeClass("noshow").removeClass("maximized");
	};

	$scope.albumart = function() {
		$('#albumart').lightbox({
			show : true,
			backdrop : true
		});
	};
	$scope.hideAlbumart = function() {
		$(".modal-backdrop").click();
	};
	$scope.fullscreen = function() {
		if (fullScreenApi.supportsFullScreen) {
			fullScreenApi.requestFullScreen($("#albumart").get(0));
		}
	};

	function frameLooper() {

		if (!window.requestAnimationFrame) {
			if (!window.webkitRequestAnimationFrame) {
				
			}
			window.requestAnimationFrame = window.webkitRequestAnimationFrame;
		}
		window.requestAnimationFrame(frameLooper);

		var fbc_array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(fbc_array);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Clear the canvas
		ctx.fillStyle = '#0e90d2';
		// Color of the bars
		var bars = 100;
		for (var i = 0; i < bars; i++) {
			var bar_x = i * 3;
			var bar_width = 2;
			var bar_height = -(fbc_array[i] / 2);
			//fillRect( x, y, width, height ) // Explanation of the parameters below
			ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
		}
	}

	var analyser, canvas, ctx;

	// Disable for firefox for now untill it is fixed in the release channel see https://bugzilla.mozilla.org/show_bug.cgi?id=934100
	if (/chrome/.test(navigator.userAgent.toLowerCase())) {
		window.addEventListener("load", function() {
			if (!window.AudioContext) {
				if (!window.webkitAudioContext) {
					alert('no audiocontext found');
				}
				window.AudioContext = window.webkitAudioContext;
			}
			var context = new AudioContext();
			analyser = context.createAnalyser();
			analyser.smoothingTimeConstant = 0.9;
			analyser.fftSize = 512;
			var source = context.createMediaElementSource(audiotag);
			source.connect(analyser);
			analyser.connect(context.destination);
	
			canvas = document.getElementById('analyser_render');
			ctx = canvas.getContext('2d');
	
			frameLooper();
	
		});
	}

	audiotag.addEventListener('timeupdate', function() {
		$scope.$apply(function() {
			$scope.position = audiotag.currentTime;
			$scope.len = audiotag.duration;
			if ($scope.position / $scope.len > 0.5 && !$scope.scrobbeld) {
				scrobble();
			}
		});
	});
	audiotag.addEventListener('ended', function() {
		$scope.next();
	});
	audiotag.addEventListener('progress', function() {
		try {
			$scope.buffpos = audiotag.buffered.end(0);
			$scope.$apply();
		} catch (e) {
		}
		;
	});

	$scope.$on('keydown', function(msg, code) {
		if ($rootScope.listenLetters) {
			switch (code) {
				case $rootScope.keymapping.STOP:
				case $rootScope.keymapping.ESC:
					// esc -> stop
					if ($scope.track) {
						$scope.stop();
						$scope.$apply();
						$rootScope.$apply();
					}
					break;
				case $rootScope.keymapping.SPACE:
					// space -> play/pause
					if ($scope.track) {
						$scope.playpause();
						$scope.$apply();
						$rootScope.$apply();
					}
					break;
				case $rootScope.keymapping.PAUSE:
					// pause
					if ($scope.track) {
						$scope.playpause();
						$scope.$apply();
						$rootScope.$apply();
					}
					break;
				case $rootScope.keymapping.PLAY:
					// play
					if ($scope.track) {
						$scope.playpause();
						$scope.$apply();
						$rootScope.$apply();
					}
					break;
				case $rootScope.keymapping.PREVIOUS:
					// previous track
					if ($scope.track) {
						$scope.previous();
					}
					break;
				case $rootScope.keymapping.NEXT:
					// next track
					if ($scope.track) {
						$scope.next();
					}
					break;
				case $rootScope.keymapping.OPEN:
					// open albumart view
					if (!$scope.albumartOpen) {
						$scope.albumart();
						$scope.albumartOpen = true;
					} else {
						$scope.hideAlbumart();
						$scope.albumartOpen = false;
					}
					break;
				case $rootScope.keymapping.FULLSCREEN:
					// open fullscreen mode
					$scope.fullscreen();
					break;
				default:
					return;
			}
		}
	});
}]);
