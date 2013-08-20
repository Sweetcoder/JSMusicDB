function LetterController($scope) {
	$scope.Letters = letterCache
}

var letterCache = {},
	letters = [],
	activeLetter = null;
	artistCache = {},
	albumCache = {};
	

function AppController($scope, $http) {
	$http.get('music.json').success(function (data) {
		var start = new Date();
		angular.forEach(data, function (value, key) {
			if (value.Naam && !value.Artiest) {
				// these are the nodes without an Artiest attribute but with a Naam attribute; these are the Artists meta nodes
				if (!letterCache[getFirstLetter(value.Naam)]) {
					var letter = new Letter(value);
					letterCache[getFirstLetter(value.Naam)] = letter;	
				}
				if (!artistCache[value.Naam]) {
					var artist = new Artist(value);
					artistCache[value.Naam] = artist;
					letterCache[getFirstLetter(value.Naam)].artists.push(artist);
				}
			}
			else if (value.Naam && value.Artiest) {
				// these are the nodes with an Artiest and a Name attribute; these are the Album meta nodes
				if (!albumCache[value.Naam]) {
					var album = new Album(value);
					albumCache[value.Naam] = album;
					artistCache[album.Artiest].albums.push(album);
				}
			} else {
				// these are the Track nodes
				var track = new Track(value);
				// add track to album
				if (albumCache[track.Artiest + " - " + track.Album]) {
					albumCache[track.Artiest + " - " + track.Album].tracks.push(track);
				}
			}
		});
		_setupModels();
		$("#loader").hide();
		$("#content").fadeIn();
		var stop = new Date();
		console.log(stop-start);
	});
}


function Letter(node) {
	var that = this;
	that.letter = getFirstLetter(node.Naam);
	that.artists = [];
	that.active = false;
};

function getFirstLetter(name) {
	var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = name.charAt(0).toUpperCase();
	if ($.inArray(firstLetter, specialChars) > -1) {
		firstLetter = "#";
	}
	return firstLetter;
}

function Artist(node) {
	var that = this;
	that.Naam = node.Naam;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.albums = [];
};

function Album(node) {
	var that= this;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.Album = node.Album;
	that.Jaar = node.Jaar;
	that.Artiest = node.Artiest;
	that.tracks = [];
};

function Track(node) {
	var that = this;
	that.File = node.Naam;
	that.Artiest = node.Artiest;
	that.Album = node.Album;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.Titel = node.Titel;
	that.Nummer = node.Track;
	that.path = node.Pad;
	that.Disc = node.Disk;
	that.AlbumNode = null;
}

function _setupModels() {
	// push all letters in a simple array
	for (var letter in letterCache) {
		var l = letterCache[letter];
		l.artists.sort(function (a,b) {
			if (a.Naam < b.Naam) {
				return -1;
			} else {
				return 1;
			}
		});
		for (var i = 0; i < l.artists.length; i++) {
			var a = l.artists[i];
			a.albums.sort(function (a,b) {
				if (a.Album < b.Album) {
					return -1;
				} else {
					return 1;
				}
			});
			for (var j = 0; j < a.albums.length; j++) {
				var al = a.albums[j];
				al.tracks.sort(function (a,b) {
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
				});
			}
		}
		letters.push(l);
	}
	// sort the array
	letters.sort(function (a,b) {
		if (a.letter < b.letter) {
			return -1;
		} else {
			return 1;
		}
	});
	// set first letter active
	if (letters.length > 0) {
		activeLetter = letters[0];
		activeLetter.active = true;
		console.log(activeLetter, "is active");
	}
}
