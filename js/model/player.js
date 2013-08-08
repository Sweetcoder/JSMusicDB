var Player = function (audiotag, model) {
	"use strict";
	// static
	var that = this;
	that.playerpath = 'http://www.arielext.org:5000/webman/3rdparty/AudioStation/webUI/audio_stream.cgi/0.mp3?action=streaming&songpath=';
	// that.playerpath = '';
	// observables
	that.length = ko.observable();
	that.position = ko.observable();
	that.playlist = ko.observableArray();
	that.currentTrack = ko.observable();
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
		$.each(that.playlist(), function () {
			var track = this;
			track.isplaying(false);
			if (track.Nummer() == that.currentTrack() && track.Disc() == that.currentDisc()) {
				track.isplaying(true);
				if (that.activeTrack()) {
					//if (that.currentTrack() != that.activeTrack().Nummer()) {
						audiotag.src = that.playerpath + track.path();
						track.isplaying(true);
						$("#player .info-Title").html(track.Titel());
						audiotag.load();
						that.activeTrack(track);						
					//}
				} else {
					audiotag.src = that.playerpath + track.path();
					track.isplaying(true);
					$("#player .info-Title").html(track.Titel());
					audiotag.load();
					that.activeTrack(track);
				}
			}
		});
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
		audiotag.play();
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
		var nr = Number(that.currentTrack()) - 1;
		if (nr < 1) {
			that.ended();
		} else {
			that.currentTrack(nr);
			that.play();
		}
	};
	that.next = function () {
		var nr = Number(that.currentTrack()) + 1;
		if (nr > that.playlist().length) {
			that.ended();
		} else {
			that.currentTrack(nr);
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
		$.each(that.playlist(), function () {
			var track = this;
			track.isplaying(false);
		});
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
