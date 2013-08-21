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
	this.Artiesten = ko.observableArray().extend({ throttle: 100 });
	this.debugtext = ko.observable();
	// paging by letter
	this.letters = ko.observableArray();
	this.ActiveLetter = ko.observable();
	this.ActiveArtist = ko.observable();
	this.ActiveAlbum = ko.observable();
	// loggedin state
	this.loggedin = ko.observable(false);
	this.username = ko.observable();
	this.password = ko.observable();
	this.store = ko.observable();
	this.server = ko.observable("0");
	this.url = ko.observable();
	this.isplaying = ko.observable(false);
	this.ActiveTrack = ko.observable();
	this.lastfm = ko.observable(localStorage.getItem("key"));
	
	// audio player
	this.player = ko.observable(new Player($("#player audio").get(0), root));
	
	// totals
	this.totalArtists = ko.observable(0);
	this.totalAlbums = ko.observable(0);
	this.totalTracks = ko.observable(0);
	this.totalPlaying = ko.observable(0);
	
	
	// animations
	this.animation = ko.observable(3);
	this.animation.subscribe(function (value) {
		localStorage.removeItem("animation");
		localStorage.setItem("animation", value);
	});
	if (localStorage.getItem("animation")) {
		that.animation(localStorage.getItem("animation"));
	}
	
	// sorting
	this.sortArtists = ko.observable(1);
	this.sortAlbums = ko.observable(2);
	
	this.sortArtists.subscribe(function (value) {
		localStorage.removeItem("sortArtists");
		localStorage.setItem("sortArtists", value);
	});
	if (localStorage.getItem("sortArtists")) {
		that.sortArtists(localStorage.getItem("sortArtists"));
	}
	
	this.sortAlbums.subscribe(function (value) {
		localStorage.removeItem("sortAlbums");
		localStorage.setItem("sortAlbums", value);
	});
	if (localStorage.getItem("sortAlbums")) {
		that.sortAlbums(localStorage.getItem("sortAlbums"));
	}
	
	this.doLogin = function() {
		if (that.server() != '0' || that.server() != 0) {
			var proxy = 'proxy/'+that.server()+'/login.php';
			
			// workaround for knockout not having the stored credentials
			$("#setLogin input").change();
			
			$.getJSON(proxy, { account: that.username(), passwd: that.password(), server: that.url()}, function (json) {
				if (json.success && json.success === true) {
					// login successfull
					that.loggedin(true);
					window.sid = json.data.sid;
					if (that.store()) {
						var stored = {
							username: that.username(),
							password: that.password(),
							url: that.url(),
							server: that.server()
						}
						localStorage.removeItem("store");
						localStorage.setItem("store", JSON.stringify(stored));
					}
				} else {
					// TODO: error handling
					localStorage.removeItem("store");
				}
			});
		} else {
			if (that.store()) {
				var stored = {
					server: that.server()
				};
				localStorage.removeItem("store");
				localStorage.setItem("store", JSON.stringify(stored));
			}
			that.loggedin(true);
		}
	};
	
	this.doLogout = function () {
		if (that.server() != '0') {
			var proxy = 'proxy/'+that.server()+'/logout.php';
			$.get(proxy, { account: that.username(), passwd: that.password(), server: that.url()}, function (json) {
				if (json.success && json.success === true) {
					// login successfull
					that.loggedin(false);
					window.sid = null;
					localStorage.removeItem("store");
				} else {
					// TODO: error handling
					localStorage.removeItem("store");
				}
			});
		} else {
			if (that.store()) {
				localStorage.removeItem("store");
				that.loggedin(false);
			}
		}
	}
	
	this.doRemoveLastFM = function () {
		localStorage.removeItem("key");
		that.lastfm(null);
	}
	
	// auto login
	if (localStorage.getItem("store")) {
		var stored = JSON.parse(localStorage.getItem("store"));
		that.username(stored.username);
		that.password(stored.password);
		that.url(stored.url);
		that.server(stored.server);
		that.doLogin();
		that.store(true);
		$(".toggle").tooltip("destroy"); // no need for hints anymore!
	}
	// show tooltip to hint the user to login
	if (!that.store()) {
		$(".toggle").tooltip("show");
	}
	
	// helper functions
	this.ums = function (total) {
		// total = total in seconds
		var days = parseInt(total / (3600 * 24)),
			rest = parseInt(total % (3600 * 24)),
			hours = parseInt(rest / 3600),
			rest = parseInt(total % 3600),
			minutes = parseInt(rest / 60),
			seconds = parseInt(rest % 60);
		if (days === 0) {
			days = "";
		} else {
			days = days + " days, "
		}
		if (hours < 10) {
			hours = "0" + hours;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		return days + hours + ":" + minutes + ":" + seconds;
	}
};
var Letter = function(node) {
	var that = this, specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = node.Naam.charAt(0).toUpperCase();
	if ($.inArray(firstLetter, specialChars) > -1) {
		firstLetter = "#";
	}
	// static
	that.letter = firstLetter;
	
	// dynamic
	that.artists = ko.observableArray();
	that.active = ko.observable(false);

	// functions
	that.showLetter = function() {
		root.Artiesten(that.artists());
		if (root.ActiveLetter()) {
			root.ActiveLetter().active(false);	
		}
		that.active(true);
		root.ActiveLetter(that);
		if ($("#artistView").is(":visible") || $("#albumView").is(":visible")) {
			window.scrollTo(0,0);
			if (root.animation() === "1") {
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
			} else if (root.animation() === "2") {
				$("#artistView, #albumView").css({
					transformOrigin : '50% 50px'
				}).transition({
					scale : 0,
					opacity: 0
				}, function() {
					$(this).hide();
					$("#artistOverviewView").show().css({
						transform : 'scale(5)'
					});
					$("#artistOverviewView").css({
						transformOrigin : '50% 50px'
					}).transition({
						scale : 1,
						opacity: 1
					});
				});
			} else if (root.animation() === "3") {
				$("#artistView, #albumView").transition({
					left : '-100%',
					opacity: 0
				}, function() {
					$(this).hide();
				});
				$("#artistOverviewView").show().css({
					left: '100%'
				});
				$("#artistOverviewView").transition({
					left : 0,
					opacity: 1
				});
			}
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
			artist : that.Naam,
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
	
	// static
	that.Naam = node.Naam;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	// dynamic
	that.ID = ko.observable(getUID());
	that.Albums = ko.observableArray().extend({ throttle: 100 });
	that.json = null;
	that.info = {
		bio : ko.observable(),
		art : ko.observable()
	};
	// functions
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
	// inner functions
	var doCall = function(callback) {
		var url = 'http://ws.audioscrobbler.com/2.0/', data = {
			method : 'album.getinfo',
			api_key : '956c1818ded606576d6941de5ff793a5',
			artist : that.Artiest,
			album : that.Album,
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
	// static
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.Album = node.Album;
	that.Jaar = node.Jaar;
	that.Artiest = node.Artiest;
	that.ID = getUID();
	
	// dynamic
	that.Hoes = ko.observable();
	that.Tracks = ko.observableArray().extend({ throttle: 100 });
	that.polled = ko.observable(false);
	that.showAlbum = ko.observable(false);
	
	// functions
	that.toggleAlbum = function() {
		var atm = that.showAlbum();
		that.showAlbum(!atm);
	};
	that.art = function() {
		if (!that.polled()) {
			doCall(function(json) {
				if (json.album) {
					var artlist = json.album.image;
					$.each(artlist, function() {
						if (this.size === 'extralarge') {
							var url = this["#text"];
							if (url !== "") {
								url = url.split("/");
								url = "http://userserve-ak.last.fm/serve/500/" + url[5];
								that.Hoes(url);
							} else {
								that.Hoes("");
							}
						}
					});
					if (that.Hoes() === "") {
						that.Hoes("images/nocover.png");
					}	
				} else {
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
	that.addToPlaylist = function () {
		$.each(that.Tracks(), function () {
			root.player().playlist.push(this);
		});
		root.player().addAlbumToPlaylist(that);
	}
};
var Track = function(node) {
	var that = this;
	// static
	that.File = node.Naam;
	that.Artiest = node.Artiest;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.Titel = node.Titel;
	that.Nummer = node.Track;
	that.path = node.Pad;
	that.Disc = node.Disk;
	
	// dynamic
	that.Album = ko.observable();
	that.isplaying = ko.observable(false);
	
	// functions
	that.playFile = function () {
		// create a new playlist and play this track
		if (root.loggedin()) {
			var initalPlaylist = [];
			$.each(root.ActiveAlbum().Tracks(), function (i) {
				initalPlaylist.push(this);
				if (this == that) {
					root.player().currentIndex(i);
				}
			});
			root.player().setAlbumAsPlaylist(root.ActiveAlbum());
    		root.player().playlist(initalPlaylist);
			root.player().play();
			root.isplaying(true);
		}
	};
	that.playTrack = function () {
		// skip to this track in the current playlist
		if (root.loggedin()) {
			var index = 0;
			$.each(root.player().playlist(), function (i) {
				if (this == that) {
					root.player().currentIndex(i);
					return false;
				}
			});
			root.player().play();
			root.isplaying(true);
		}
	};
};

var getUID = function(){
	var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    	out = '';
	for(var i=0, clen=chars.length; i<6; i++){
   		out += chars.substr(0|Math.random() * clen, 1);
	}
	// ensure that the uid is unique for this page
	return getUID.uids[out] ? getUID() : (getUID.uids[out] = out);
}
getUID.uids = {};