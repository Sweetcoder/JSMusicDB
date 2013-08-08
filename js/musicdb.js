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
				settings.letterCache[firstLetter] = letter;
				settings.model.letters.push(letter);
				settings.model.letters(settings.model.letters.sort(function(a,b) {
					if (a.letter < b.letter) {
						return -1;
					} else {
						return 1;
					}
				}));
			} else {
				letter = settings.letterCache[firstLetter];
			}
			letter.artists.push(artist);
			letter.artists(letter.artists.sort(function (a,b) {
				if (a.Naam() < b.Naam()) {
					return -1;
				} else {
					return 1;
				}
			}));
			settings.artistCache[artistName] = artist;
		}
	};
	var addAlbumToArtist = function(album, artistName) {
		settings.model.Albums.push(album);
		settings.albumCache[album.Album()] = album;
		artistName = artistName.toLowerCase();
		if (artistName.indexOf("the ") === 0) {
			artistName = artistName.substring(4);
		}
		var artist = settings.artistCache[artistName];
		if (artist) {
			artist.Albums.push(album);
		}
	};

	var addTrackToAlbum = function(track, albumName) {
		var album = settings.albumCache[albumName];
		if (album) {
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
		}
	};

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
		});
	};
	var parseJSON = function() {
		var start = new Date();
		$.each(settings.json, function() {
			if (this.Album === "") {
				// this is an artist node
				var artist = new Artist(this);
				//console.log("Artist", artist.Naam());
				addAristToModel(artist);
			} else if (this.Titel === "") {
				// this is an album node
				var album = new Album(this);
				//console.log("Album", album.Album());
				addAlbumToArtist(album, this.Artiest);
			} else {
				// this node is a track
				var track = new Track(this);
				//console.log("Track", track.File());
				addTrackToAlbum(track, this.Album);
			}
		});
		_cleanup();
		settings.model.letters()[0].showLetter();
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
	
	$("#wrapper").on("click", ".artistCard", function () {
	    $("#artistOverviewView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
	    	$(this).hide();
	    	$("#artistView").show().css({ transform: 'scale(0)' });
	    	$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1 });
	    });
	});
	$("#artistView").on("click", ".close", function () {
	    $("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
	    	$(this).hide();
	    	$("#artistOverviewView").show().css({ transform: 'scale(0)' });
	    	$("#artistOverviewView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1 });
	    });
	});
	
	$("#wrapper").on("click", ".albumCard", function () {
	    $("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
	    	$(this).hide();
	    	$("#albumView").show().css({ transform: 'scale(0)' });
	    	$("#albumView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1 });
	    });
	});
	$("#albumView").on("click", ".close", function () {
	    $("#albumView").css({ transformOrigin: '50% 50px' }).transition({ scale: 0 }, function () {
	    	$(this).hide();
	    	$("#artistView").show().css({ transform: 'scale(0)' });
	    	$("#artistView").css({ transformOrigin: '50% 50px' }).transition({ scale: 1 });
	    });
	});
	
	$("#player").on("click", ".slideLeft", function () {
		$("#player").transition({left: '-99%'}, function () {
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
				// settings.model.letters().remove(letter);
			}
		}
	}
})();
