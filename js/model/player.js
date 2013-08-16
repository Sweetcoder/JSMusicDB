var Player = function (audiotag, model) {
	"use strict";
	// static
	var that = this;
	that.playerpath = 'proxy/$s/stream.php?path=';
	// observables
	that.length = ko.observable();
	that.position = ko.observable();
	that.playlist = ko.observableArray();
	that.currentIndex = ko.observable();
	that.currentDisc = ko.observable();
	that.activeTrack = ko.observable();
	that.isPlaying = ko.observable(false);
	that.isMuted = ko.observable(false);
	
	
	
	// computed
	that.progress = ko.computed(function () {
		var percentage = (that.position() / that.length()) * 100;
		return percentage + "%";
	});
	that.state = ko.computed(function () {
		if (that.isPlaying()) {
			return '<i class="icon-pause"></i>';
		} else {
			return '<i class="icon-play"></i>'
		}
	});
	that.muteState = ko.computed(function () {
		if (that.isMuted()) {
			return '<i class="icon-volume-off"></i>';
		} else {
			return '<i class="icon-volume-up"></i>'
		}
	})

	// functions
	that.togglePlayPause = function () {
		that.isPlaying(!that.isPlaying());
		if (that.isPlaying()) {
			that.play();
		} else {
			that.pause();
		}
	};
	that.toggleMute = function () {
		that.isMuted(!that.isMuted());
		if (that.isMuted()) {
			that.mute();	
		} else {
			that.unmute();
		}
	}
	that.play = function () {
		that.isPlaying(true);
		// reset playing state of previous active track
		if (that.activeTrack()) {
			that.activeTrack().isplaying(false);
		}
		// play this song
		var track = that.playlist()[that.currentIndex()];
		if (track) {
			track.isplaying(true);
			that.activeTrack(track);
			// set the audiotag source
			var src = "";
			if (model.server() != "0") {
				src = that.playerpath.replace('$s', model.server()) + track.path().replace('+', '%2B').replace('&', '%26') + '&sid='+window.sid + '&server=' + model.url();
			} else {
				src = 'file:///' + track.path();
			}
			audiotag.src = src;
			audiotag.load();
			
			// set metainfo
			$("#player .info-Title").html(track.Titel());
			$("#player .thumbnail").attr("src", track.Album().Hoes());
			$("#player .info-Artist").html(track.Album().Album());
			$("#player .info-Album").html(track.Album().Artiest());
			$("#player .info-Year").html(track.Album().Jaar());
			
			// scrobble
			if (localStorage.getItem("key")) {
				var now = new Date();
				var ts = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + now.getTimezoneOffset(), now.getSeconds()) / 1000;
				var url = 'http://ws.audioscrobbler.com/2.0/', data = {
					method : 'track.scrobble',
					api_key : '956c1818ded606576d6941de5ff793a5',
					artist : model.ActiveAlbum().Artiest(),
					track : that.activeTrack().Titel(),
					timestamp : ts,
					sk : localStorage.getItem("key"),
					api_sig: lastfm.signscrobble(model.ActiveAlbum().Artiest(), that.activeTrack().Titel(), ts)
				};
				$.post(url, data, function(json) {});
				
				var url = 'http://ws.audioscrobbler.com/2.0/', data = {
					method : 'track.updateNowPlaying',
					api_key : '956c1818ded606576d6941de5ff793a5',
					artist : model.ActiveAlbum().Artiest(),
					track : that.activeTrack().Titel(),
					sk : localStorage.getItem("key"),
					api_sig: lastfm.signplayinglove(model.ActiveAlbum().Artiest(), that.activeTrack().Titel(), 'track.updateNowPlaying')
				};
				$.post(url, data, function(json) {});
			}
			
			// and play the track!
			audiotag.play();
		}
	};
	that.love = function () {
		if (localStorage.getItem("key")) {
			var url = 'http://ws.audioscrobbler.com/2.0/', data = {
				method : 'track.love',
				api_key : '956c1818ded606576d6941de5ff793a5',
				artist : model.ActiveAlbum().Artiest(),
				track : that.activeTrack().Titel(),
				sk : localStorage.getItem("key"),
				api_sig: lastfm.signplayinglove(model.ActiveAlbum().Artiest(), that.activeTrack().Titel(), 'track.love')
			};
			$.post(url, data, function(json) {});
		}
	};
	that.pause = function () {
		that.isPlaying(false);
		that.activeTrack().isplaying(false);
		audiotag.pause();
	};
	that.previous = function () {
		var index = 0;
		var playingTrack = that.activeTrack();
		if (playingTrack) {
			index = that.playlist.indexOf(playingTrack) - 1;
		}
		if (index < 0) {
			that.ended();
		} else {
			that.currentIndex(index);
			that.play();
		}
	};
	that.next = function () {
		var index = 0;
		var playingTrack = that.activeTrack();
		if (playingTrack) {
			index = that.playlist.indexOf(playingTrack) + 1;
		}
		if (index >= that.playlist().length) {
			that.ended();
		} else {
			that.currentIndex(index);
			that.play();
		}
	};
	that.mute = function () {
		audiotag.volume = 0;
	};
	that.unmute = function () {
		audiotag.volume = 1;
	};
	that.ums = function (seconds) {
		var integer = Number(seconds());
		var minutes = Math.floor(integer/60,10),
			sec = (integer - minutes*60);
		return that.prefixZero(minutes) + ":" + that.prefixZero(sec.toFixed(0));
	};
	that.prefixZero = function (n) {
		if (n < 10) {
			return "0" + n;
		}
		return n;
	};
	that.ended = function () {
		audiotag.pause();
		that.isPlaying(false);
		that.activeTrack().isplaying(false);
		that.activeTrack(null); // reset the activeTrack field.
		model.isplaying(false);
		$("#albumart").lightbox('hide');
	};
	that.updatePosition = function(data, event) {
		var scope = $(event.target);
		var clientX = event.clientX,
			left = clientX - scope.offset().left,
			perc = (left / scope.width()),
			time = perc * that.length();
		audiotag.currentTime = time;
	};
	
	// audiotag events
	audiotag.addEventListener('timeupdate', function () {
		that.length(audiotag.duration);
		that.position(audiotag.currentTime);
	});
	audiotag.addEventListener('ended', function () {
		that.next();
	});
}
