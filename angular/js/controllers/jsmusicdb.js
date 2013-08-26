var jsmusicdb = angular.module('jsmusicdb', ['jsmusicdb.switchView']);

// factories
jsmusicdb.factory('ImageService', function($http) {
	image = null;
	return {
		getInfo: function ($scope) {
			if ($scope.artist && !$scope.artist.art) {
				$http.get($scope.artist.url, {params: $scope.artist.data}).success(function (json) {
					if (json.artist) {
						$scope.art = json.artist.image[3]["#text"] || "images/nocover.png";
						$scope.bio = json.artist.bio.content;
					} else {
						$scope.art = "images/nocover.png";
					}
					$scope.artist.art = $scope.art;
					$scope.artist.bio = $scope.bio;
				});
			} else {
				if ($scope.artist && $scope.artist.art) {
					$scope.art = $scope.artist.art;
					$scope.bio = $scope.artist.bio;
				} else {
					$scope.art = "images/nocover.png";
				}
				return $scope.art
			}
		},
		getAlbumArt: function ($scope) {
			if ($scope.album && !$scope.album.art) {
				$http.get($scope.album.url, {params: $scope.album.data}).success(function (json) {
					if (json.album) {
						var artlist = json.album.image;
						$.each(artlist, function() {
							if (this.size === 'extralarge') {
								var url = this["#text"];
								if (url !== "") {
									url = url.split("/");
									url = "http://userserve-ak.last.fm/serve/500/" + url[5];
									$scope.art = url;
								} else {
									$scope.art = "images/nocover.png";
								}
							}
						});
					} else {
						$scope.art = "images/nocover.png";
					}
					$scope.album.art = $scope.art;
				});
			} else {
				if ($scope.album && $scope.album.art) {
					$scope.art = $scope.album.art;
				} else {
					$scope.art = "images/nocover.png";
				}
				return $scope.art
			}
		}
	}
});

// controllers
function LetterController($scope, switchView) {
	$scope.Letters = letterCache

	// set the artistsInLetter var to reflect the artists in the current active letter
	$scope.getLetter = function(letter) {
		activeLetter.active = false;
		activeLetter = letter;
		activeLetter.active = true;
		switchView.letter(letter);
		$("#artistOverviewView").removeClass("hide");
		$("#artistView").removeClass("show");
		$("#albumView").removeClass("show");
	};
};

function ArtistOverviewController($scope, $http, switchView) {
	$scope.$on('letterChange', function(e, letter) {
		$scope.Artists = letter.artists;
	});
	$scope.getArtist = function (artist) {
		switchView.artist(artist);
		// TODO: generic function
		$("#artistOverviewView").addClass("hide");
		$("#artistView").addClass("show");
		$("#albumView").removeClass("show");
	}
};

function ArtistController($scope, $http, switchView, ImageService) {
	$scope.$on('artistChange', function(e, artist) {
		$scope.Artist = artist;
	});
	$scope.art = ImageService.getInfo($scope);
	$scope.bio = ImageService.getInfo($scope);
	
	$scope.getAlbum = function (album) {
		switchView.album(album);
		$("#artistOverviewView").addClass("hide");
		$("#artistView").removeClass("show");
		$("#albumView").addClass("show");
	};
	$scope.closeView = function () {
		// return to letter view
		$("#artistOverviewView").removeClass("hide");
		$("#artistView").removeClass("show");
		$("#albumView").removeClass("show");
	};
}
function AlbumController($scope, $http, switchView, ImageService) {
	$scope.$on('albumChange', function(e, album) {
		$scope.Album = album;
	});
	$scope.closeView = function () {
		$("#artistOverviewView").addClass("hide");
		$("#artistView").addClass("show");
		$("#albumView").removeClass("show");
	};
	$scope.art = ImageService.getAlbumArt($scope);
}
function TrackController($scope) {
	
};

/* caching */
var letterCache = {}, letters = [], activeLetter = null, artistCache = {}, albumCache = {}, debug = [];

function AppController($scope, $http, switchView) {
	var mainStart = new Date();
	$http.get('music.json').success(function(data) {
		var start = new Date();
		debug.push('JSON fetched in ' + (start - mainStart) + ' ms');
		angular.forEach(data, function(value, key) {
			if (value.totals) {
				$scope.totalArtists = value.totals.artists;
				$scope.totalAlbums = value.totals.albums;
				$scope.totalTracks = value.totals.tracks;
				$scope.totalPlaying = ums(value.totals.playingTime);
			} else if (value.Naam && !value.Artiest) {
				// these are the nodes without an Artiest attribute but with a Naam attribute; these are the Artists meta nodes
				if (!letterCache[getFirstLetter(value.Naam)]) {
					var letter = new Letter(value);
					letterCache[getFirstLetter(value.Naam)] = letter;
				}
				if (!artistCache[stripThe(value.Naam)]) {
					var artist = new Artist(value);
					artistCache[stripThe(value.Naam)] = artist;
					letterCache[getFirstLetter(value.Naam)].artists.push(artist);
				}
			} else if (value.Naam && value.Artiest) {
				// these are the nodes with an Artiest and a Name attribute; these are the Album meta nodes
				if (!albumCache[value.Naam]) {
					var album = new Album(value);
					albumCache[value.Naam] = album;
					artistCache[stripThe(album.Artiest)].albums.push(album);
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
		_setupModels(switchView);
		$("#loader").hide();
		$("#content").fadeIn();
		var stop = new Date();
		debug.push('Fill and sort models done in ' + (stop - start) + ' ms');
		$scope.debugText = debug.join('<br />');
	});	
};
AppController.$inject = ['$scope', '$http', 'switchView'];
LetterController.$inject = ['$scope', 'switchView'];
ArtistOverviewController.$inject = ['$scope', '$http', 'switchView'];
ArtistController.$inject = ['$scope', '$http', 'switchView', 'ImageService'];
AlbumController.$inject = ['$scope', '$http', 'switchView', 'ImageService'];
TrackController.$inject = ['$scope'];


function getFirstLetter(name) {
	name = stripThe(name);
	var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = name.charAt(0);
	if ($.inArray(firstLetter, specialChars) > -1) {
		firstLetter = "#";
	}
	return firstLetter;
}
function stripThe(name) {
	name = name.toUpperCase();
	name = (name.indexOf("THE ") === 0) ? name.substring(4) : name ;
	return name;
}
function ums(total) {
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
function _setupModels(switchView) {
	// push all letters in a simple array
	for (var letter in letterCache) {
		var l = letterCache[letter];

		l.artists= $.grep(l.artists, function(e,i) {
			return e.albums.length > 0;
		});
		
		if (l.artists.length === 0) {
			delete letterCache[letter];
		}
	}
	for (var letter in letterCache) {
		var l = letterCache[letter];
		l.artists.sort(function(a, b) {
			if (a.Naam < b.Naam) {
				return -1;
			} else {
				return 1;
			}
		});
		for (var i = 0; i < l.artists.length; i++) {
			var a = l.artists[i];
			a.albums.sort(function(a, b) {
				if (a.Jaar < b.Jaar) {
					return -1;
				} else {
					return 1;
				}
			});
			for (var j = 0; j < a.albums.length; j++) {
				var al = a.albums[j];
				al.tracks.sort(function(a, b) {
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
	letters.sort(function(a, b) {
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
		switchView.letter(activeLetter);
	}
	
	// sidebar
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
		/*
		if ($(this).attr("href") === "#playlist") {
			settings.model.player().playlistView(true);
		} else {
			settings.model.player().playlistView(false);
		}
		*/
	});
}
