/*
 * These models represent parts of the musicdb collection, combining the parts will create the full model; we're trying not to store to much duplicted data in the models
 * Model layout:
 * - Artist
 * 	- [Album]
 * 		- [Track]
 */
"use strict"; 
var root = null;

var DataModel = function() {
	var that = this;
	root = that;
	// simple model
	this.Artiesten = ko.observableArray();
	this.Albums = ko.observableArray();
	this.debugtext = ko.observable();
	// paging by letter
	this.letters = ko.observableArray();
	this.ActiveArtist = ko.observable();
	this.ActiveAlbum = ko.observable();
	// loggedin state
	this.loggedin = ko.observable(false);
	this.username = ko.observable();
	this.password = ko.observable();
	this.isplaying = ko.observable(false);
	this.ActiveTrack = ko.observable();
	this.lastfm = ko.observable(localStorage.getItem("key"));
	
	this.keepalive = 0; // index of the keepalive thread
	
	// audio player
	this.player = ko.observable(new Player($("#player audio").get(0), root));
	
	this.doLogin = function() {
		var host = "http://www.arielext.org:5000";
		//var loginurl = host + "/webman/modules/login.cgi?username=";
		var loginurl = host + "/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account="
		
		
		// workaround for knockout not having the stored credentials
		$("#login input").change();
		
		loginurl += that.username() + "&passwd=";
		loginurl += that.password();
		$.get(loginurl, function (resonse) {});
		setTimeout(function () {
			that.loggedin(true);
			$("#login").modal('hide');
		}, 500);
		return false;
		
		// keep alive by relogging in
		root.keepalive = setInterval(function () {
			$.get(loginurl, function (resonse) {});
		}, 60 * 5);
	};
};
var Letter = function(node) {
	var that = this, specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = node.Naam().charAt(0).toUpperCase();
	if ($.inArray(firstLetter, specialChars) > -1) {
		firstLetter = "#";
	}
	that.letter = firstLetter;
	that.artists = ko.observableArray();
	that.active = ko.observable(false);

	// behaviour
	that.showLetter = function() {
		root.Artiesten(that.artists());
		// console.log(root.Artiesten().length);
		$.each(root.letters(), function() {
			var letter = this;
			letter.active(false);
		});
		that.active(true);
		if ($("#artistView").is(":visible") || $("#albumView").is(":visible")) {
			$("#artistView, #albumView").css({
				transformOrigin : '50% 50px'
			}).transition({
				scale : 0
			}, function() {
				$(this).hide();
				$("#artistOverviewView").show().css({
					transform : 'scale(0)'
				});
				$("#artistOverviewView").css({
					transformOrigin : '50% 50px'
				}).transition({
					scale : 1
				});
			});
		}
	};
};
var Artist = function(node) {
	var that = this;

	// internal function to get info from last.fm
	var doCall = function(callback) {
		var url = 'http://ws.audioscrobbler.com/2.0/', data = {
			method : 'artist.getinfo',
			api_key : '956c1818ded606576d6941de5ff793a5',
			artist : that.Naam(),
			format : 'json',
			autoCorrect : true
		};
		if (!that.info.bio()) {
			$.getJSON(url, data, function(json) {
				that.json = json;
				if ( callback instanceof Function) {
					callback(json);
				}
			});
		} else {
			if ( callback instanceof Function) {
				callback(that.json);
			}
		}
	}

	that.Naam = ko.observable(node.Naam);
	that.Omvang = ko.observable(node.MB);
	that.Tijd = ko.observable(node["U:M:S"]);
	that.Kwaliteit = ko.observable(node["Kbit/s"]);
	that.Albums = ko.observableArray();
	that.json = null;

	that.info = {
		bio : ko.observable(),
		art : ko.observable()
	};

	// behaviour
	that.getInfo = function() {
		doCall(function(json) {
			that.info.bio(json.artist.bio.content);
			that.info.art(json.artist.image[2]["#text"]);
			$("#artistName").html(that.Naam());
			$("#artistArt").attr("src", that.info.art());
			$("#artistBio").html(that.info.bio());
			$('#artistInfo').modal();
		});
	};
	that.art = function() {
		doCall(function(json) {
			that.info.bio(json.artist.bio.content);
			that.info.art(json.artist.image[3]["#text"] || "images/nocover.png");
		});
		return that.info.art();
	};
	that.getArtist = function() {
		root.ActiveArtist(that);
	}
};
var Album = function(node) {
	var doCall = function(callback) {
		var url = 'http://ws.audioscrobbler.com/2.0/', data = {
			method : 'album.getinfo',
			api_key : '956c1818ded606576d6941de5ff793a5',
			artist : that.Artiest(),
			album : that.Album(),
			format : 'json',
			autoCorrect : true
		};
		if (!that.Hoes()) {
			$.getJSON(url, data, function(json) {
				that.json = json;
				if ( callback instanceof Function) {
					callback(json);
				}
			});
		} else {
			if ( callback instanceof Function) {
				callback(that.json);
			}
		}
	}
	var that = this;
	that.Omvang = ko.observable(node.MB);
	that.Tijd = ko.observable(node["U:M:S"]);
	that.Kwaliteit = ko.observable(node["Kbit/s"]);
	that.Album = ko.observable(node.Album);
	that.Jaar = ko.observable(node.Jaar);
	that.Hoes = ko.observable();
	that.Tracks = ko.observableArray();
	that.Artiest = ko.observable(node.Artiest);
	that.polled = ko.observable(false);
	// behaviour
	that.showAlbum = ko.observable(false);
	// by default hide tracks
	that.toggleAlbum = function() {
		var atm = that.showAlbum();
		that.showAlbum(!atm);
	};
	that.showAlbum.subscribe(function(value) {
		if (value && !that.Hoes()) {
			var url = 'http://ws.audioscrobbler.com/2.0/', data = {
				method : 'album.getinfo',
				api_key : '956c1818ded606576d6941de5ff793a5',
				artist : that.Artiest(),
				album : that.Album(),
				format : 'json',
				autoCorrect : true
			};
			$.getJSON(url, data, function(json) {
				var artlist = json.album.image;
				$.each(artlist, function() {
					if (this.size === 'extralarge') {
						that.Hoes(this["#text"]);
					}
				});
				if (that.Hoes() === "") {
					that.Hoes("images/nocover.png");
				}
			})
		}
	})

	that.art = function() {
		if (!that.polled()) {
			doCall(function(json) {
				var artlist = json.album.image;
				$.each(artlist, function() {
					if (this.size === 'extralarge') {
						var url = this["#text"];
						url = url.split("/");
						url = "http://userserve-ak.last.fm/serve/500/" + url[5];
						that.Hoes(url);
					}
				});
				if (that.Hoes() === "") {
					that.Hoes("images/nocover.png");
				}
			});
			that.polled(true);
		}
		return that.Hoes();
	};

	that.getAlbum = function() {
		root.ActiveAlbum(that);
	}
};
var Track = function(node) {
	var that = this;
	that.File = ko.observable(node.Naam);
	that.Omvang = ko.observable(node.MB);
	that.Tijd = ko.observable(node["U:M:S"]);
	that.Kwaliteit = ko.observable(node["Kbit/s"]);
	that.Titel = ko.observable(node.Titel);
	that.Nummer = ko.observable(node.Track);
	that.isplaying = ko.observable(false);
	that.path = ko.observable(node.Pad);
	that.Disc = ko.observable(node.Disk);
	
	that.playFile = function () {
		if (root.loggedin()) {
			root.player().playlist(root.ActiveAlbum().Tracks());
			root.player().currentTrack(that.Nummer());
			root.player().currentDisc(that.Disc());
			$("#player .thumbnail").attr("src", root.ActiveAlbum().Hoes());
			$("#player .info-Artist").html(root.ActiveAlbum().Album());
			$("#player .info-Album").html(root.ActiveAlbum().Artiest());
			$("#player .info-Year").html(root.ActiveAlbum().Jaar());
			root.player().play();
			root.isplaying(true);
		}
	};
};