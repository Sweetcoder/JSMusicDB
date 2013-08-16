(function() {"use strict";
	var settings = {
		db : 'music.json',
		model : new DataModel(),
		artistCache : [],
		albumCache : [],
		letterCache : []
	};

	var addAristToModel = function(artist) {
		// settings.model.Artiesten.push(artist);
		var artistName = (artist.Naam()) ? artist.Naam().toLowerCase() : '';
		if (artistName && !settings.artistCache[artistName]) {
			if (artistName.indexOf("the ") === 0) {
				artistName = artistName.substring(4);
			}
			var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
			var firstLetter = artistName.charAt(0).toUpperCase();
			if ($.inArray(firstLetter, specialChars) > -1) {
				firstLetter = "#";
			}
			var letter = null;
			if (!settings.letterCache[firstLetter]) {
				letter = new Letter(artist);
				letter.letter = firstLetter;
				settings.model.letters.push(letter);
				settings.model.letters(settings.model.letters.sort(function(a,b) {
					if (a.letter < b.letter) {
						return -1;
					} else {
						return 1;
					}
				}));
				settings.letterCache[firstLetter] = letter;
			} else {
				letter = settings.letterCache[firstLetter];
			}
			letter.artists.push(artist);
			letter.artists(letter.artists.sort(function (a,b) {
				if (settings.model.sortArtists() == 1) {
					if (a.Naam() < b.Naam()) {
						return -1;
					} else {
						return 1;
					}	
				} else if (settings.model.sortArtists() == 2) {
					if (a.Albums().length < b.Albums().length) {
						return 1;
					} else {
						return -1;
					}
				}
			}));
			settings.artistCache[artistName] = artist;
		}
	};
	var addAlbumToArtist = function(album, artistName) {
		artistName = artistName.toLowerCase();
		if (artistName.indexOf("the ") === 0) {
			artistName = artistName.substring(4);
		}
		settings.model.Albums.push(album);
		var artist = settings.artistCache[artistName];
		if (artist) {
			settings.albumCache[artistName + "-"+ album.Album()] = album;
			artist.Albums.push(album);
			artist.Albums(artist.Albums.sort(function (a,b) {
				if (settings.model.sortAlbums() == 1) {
					if (a.Album() < b.Album()) {
						return -1;
					} else {
						return 1;
					}
				} else if (settings.model.sortAlbums() == 2) {
					if (a.Jaar() < b.Jaar()) {
						return -1;
					} else {
						return 1;
					}
				}
			}));
		}
	};

	var addTrackToAlbum = function(track, albumName) {
		var artistName = track.Artiest().toLowerCase();
		if (artistName.indexOf("the ") === 0) {
			artistName = artistName.substring(4);
		}
		var album = settings.albumCache[artistName + "-"+ albumName];
		if (album && album.Artiest() == track.Artiest()) {
			album.Tracks.push(track);
			album.Tracks(album.Tracks.sort(function (a,b) {
				if (!isNaN(a.Disc())) {
					// sort by discnumber (or by number, secondary)
					if (Number(a.Disc()) < Number(b.Disc())) {
						return -1;
					} else if (Number(a.Disc()) == Number(b.Disc())) {
						if (Number(a.Nummer()) < Number(b.Nummer())) {
							return -1;
						} else {
							return 1;
						}	
					} else {
						return 1;
					}
				} else {
					if (Number(a.Nummer()) < Number(b.Nummer())) {
						return -1;
					} else {
						return 1;
					}	
				}
			}));
			track.Album(album);
		}
	};
	
	var addTotals = function (node) {
		settings.model.totalArtists(node.artists);
		settings.model.totalAlbums(node.albums);
		settings.model.totalTracks(node.tracks);
		settings.model.totalPlaying(node.playingTime);
	}

	var loadJSON = function() {
		$("#loader").show();
		$("#content").hide();
		$.getJSON(settings.db, function(json) {
			settings.json = json;
			$(document).trigger("musicdb-json-loaded");
			$("#loader").hide();
			$("#content").fadeIn();
		}).error(function(e) {
			settings.model.debugtext("error occured during load", e)
			$("#loader").hide();
			$("#content").fadeIn();
		});
	};
	var parseJSON = function() {
		var start = new Date();
		$.each(settings.json, function() {
			if (!this.totals) {
				if (this.Album === "") {
					// this is an artist node
					var artist = new Artist(this);
					addAristToModel(artist);
				} else if (this.Titel === "") {
					// this is an album node
					var album = new Album(this);
					addAlbumToArtist(album, this.Artiest);
				} else {
					// this node is a track
					var track = new Track(this);
					addTrackToAlbum(track, this.Album);
				}
			} else {
				addTotals(this.totals);
			}
		});
		_cleanup();
		if (settings.model.letters().length > 0) {
			settings.model.letters()[0].showLetter();
		}
		var stop = new Date();
		settings.model.debugtext("JSON parsed in " + (stop - start) + " ms");
	};
	ko.applyBindings(settings.model);
	loadJSON();
	$(document).on("musicdb-json-loaded", function() {
		parseJSON();
	});
	$("#summary button").on("click", function () {
		$(this).parent().slideUp();
	})
	
	$(".wrapper").on("click", ".artistCard", function () {
		if (settings.model.animation() === "1") {
		    $("#artistOverviewView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
		    	$(this).hide();
		    	$("#artistView").show().css({ transform: 'scale(0)', opacity: 0, left: 0 });
		    	$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		    });
		}
		if (settings.model.animation() === "2") {
			$("#artistOverviewView").css({ transformOrigin: '50% 50px' }).transition({ scale: 5, opacity: 0}, function () {
				$(this).hide();
			});
			$("#artistView").show().css({ transform: 'scale(0)', opacity: 0, left: 0 });
	    	$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		}
		if (settings.model.animation() === "3") {
			$("#artistOverviewView").css({ left: 0}).transition({ left: '-100%', opacity: 0}, function () {
				$(this).hide();
			});
			$("#artistView").show().css({ left: '100%', opacity: 0,transform: 'scale(1)' });
	    	$("#artistView").transition({ left: 0, opacity: 1 });
		}
	});
	$("#artistView").on("click", ".close", function () {
		if (settings.model.animation() === "1") {
		    $("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
		    	$(this).hide();
		    	$("#artistOverviewView").show().css({ transform: 'scale(0)', opacity: 0, left: 0 });
		    	$("#artistOverviewView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		    });
		}
		if (settings.model.animation() === "2") {
			$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0, opacity: 0 }, function () {
		    	$(this).hide();
		    });
		    $("#artistOverviewView").show().css({ transform: 'scale(5)', opacity: 0, left: 0 });
	    	$("#artistOverviewView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		}
		if (settings.model.animation() === "3") {
			$("#artistView").css({ left: 0 }).transition({ left: '100%', opacity: 0 }, function () {
		    	$(this).hide();
		    });
		    $("#artistOverviewView").show().css({ left: '-100%',transform: 'scale(1)' });
	    	$("#artistOverviewView").transition({ left: 0, opacity: 1 });
		}
	});
	
	$(".wrapper").on("click", ".albumCard", function () {
		if (settings.model.animation() === "1") {
		    $("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
		    	$(this).hide();
		    	$("#albumView").show().css({ transform: 'scale(0)', opacity: 0, left: 0 });
		    	$("#albumView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		    });
		}
		if (settings.model.animation() === "2") {
			$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 5, opacity: 0 }, function () {
		    	$(this).hide();
		    });
		    $("#albumView").show().css({ transform: 'scale(0)', opacity: 0, left: 0 });
	    	$("#albumView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		}
		if (settings.model.animation() === "3") {
			$("#artistView").transition({ left: '-100%', opacity: 0}, function () {
		    	$(this).hide();
		    });
		    $("#albumView").show().css({ left: '100%', opacity: 0, transform: 'scale(1)' });
	    	$("#albumView").transition({ left: 0, opacity: 1 });
		}
	});
	$("#albumView").on("click", ".close", function () {
		if (settings.model.animation() === "1") {
		    $("#albumView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
		    	$(this).hide();
		    	$("#artistView").show().css({ transform: 'scale(0)', opacity: 0, left: 0 });
		    	$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		    });
		}
		if (settings.model.animation() === "2") {
			$("#albumView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0, opacity: 0 }, function () {
		    	$(this).hide();
		    });
		    $("#artistView").show().css({ transform: 'scale(5)', opacity: 0, left: 0 });
	    	$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1, opacity: 1 });
		}
		if (settings.model.animation() === "3") {
			$("#albumView").css({ left: 0 }).transition({ left: '100%', opacity: 0 }, function () {
		    	$(this).hide();
		    });
		    $("#artistView").show().css({ left: '-100%', opacity: 0, transform: 'scale(1)' });
	    	$("#artistView").transition({ left: 0, opacity: 1 });
		}
	});
	
	$("#player").on("click", ".slideLeft", function () {
		$("#player").transition({left: '-96%'}, function () {
			$("#player .slideLeft").removeClass("slideLeft").addClass("slideRight").find("i").addClass("icon-chevron-right");	
		});
	});
	
	$("#player").on("click", ".slideRight", function () {
		$("#player").transition({left: 0}, function () {
			$("#player .slideRight").removeClass("slideRight").addClass("slideLeft").find("i").removeClass("icon-chevron-right");
		});
	});
	
	var _cleanup = function() {
		// remove empty artists from the list (artists without any albums)
		var i = 0;
		for ( i = 0; i < settings.model.letters().length; i++) {
			var letter = settings.model.letters()[i], removeEmptyArtistsInLetter = [];
			for (var j = 0; j < letter.artists().length; j++) {
				var artist = letter.artists()[j];
				if (artist.Albums().length === 0) {
					removeEmptyArtistsInLetter.push(artist);
				}
			}
			letter.artists.removeAll(removeEmptyArtistsInLetter);
			if (letter.artists().length === 0) {
				settings.model.letters.remove(letter);
			}
		}
	}
	
	// add sidebar functionality
	var snapper = new Snap({
  		element: document.getElementById('main')
	});
	snapper.settings({
		disable: 'right'
		, touchToDrag: false
	});
	
	$("#main .toggle").on("click", function () {
		if (snapper.state().state == "left") {
			snapper.close();
		} else {
			snapper.open('left');
		}
	});
	$(".snap-drawers").on("click", "a", function (e) {
		e.preventDefault();
		$("#main .container > div").hide();
		$($(this).attr("href")).show();
		_gaq.push(['_trackPageview', $(this).attr("href")]);
		snapper.close();
	});
})();
