angular.module('jsmusicdb.modelService', []).service('modelService', function($rootScope, $http) {"use strict";
	var that = this;

	this.fetchJSON = function(switchView, $rootScope, $location, $routeParams, ctl, $scope, $http, callback) {
		var mainStart = new Date();
		$http.get('music.json').success(function(data) {
			var start = new Date();
			$rootScope.debug.push('JSON fetched in ' + (start - mainStart) + ' ms');
			start = new Date();
			angular.forEach(data, function(value, key) {
				if (value.totals) {
					$scope.totalArtists = value.totals.artists;
					$scope.totalAlbums = value.totals.albums;
					$scope.totalTracks = value.totals.tracks;
					$scope.totalPlaying = value.totals.playingTime;
					$scope.timestamp = value.totals.timestamp * 1000;
				} else if (value.Naam && !value.Artiest) {
					// these are the nodes without an Artiest attribute but with a Naam attribute; these are the Artists meta nodes
					if (!$rootScope.letterCache[getFirstLetter(value.Naam)]) {
						var letter = new jsmusicdb.Letter(value);
						$rootScope.letterCache[getFirstLetter(value.Naam)] = letter;
					}
					if (!$rootScope.artistCache[stripThe(value.Naam)]) {
						var artist = new jsmusicdb.Artist(value);
						$rootScope.artistCache[stripThe(value.Naam)] = artist;
						$rootScope.letterCache[getFirstLetter(value.Naam)].artists.push(artist);
					}
				} else if (value.Naam && value.Artiest) {
					// these are the nodes with an Artiest and a Name attribute; these are the Album meta nodes
					if (!$rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album]) {
						var album = new jsmusicdb.Album(value);
						$rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album] = album;
						$rootScope.artistCache[stripThe(album.Artiest)].albums.push(album);
					}
				} else {
					// these are the Track nodes
					var track = new jsmusicdb.Track(value);
					// add track to album
					if ($rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album]) {
						$rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album].tracks.push(track);
						track.albumNode = $rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album];
					} else {
						// TODO: do we want to log this/report these?
						// console.log("no album found for",stripThe(value.Artiest) + "-" + value.Album, $rootScope.albumCache);
					}
				}
			});
			$rootScope.debug.push('JSON parsed in ' + (new Date() - start) + ' ms');
			that.fetched = true;
			that.setupModels(switchView, $rootScope, $location, $routeParams, ctl);
			callback();
		});
	};
	this.setupModels = function(switchView, $rootScope, $location, $routeParams, ctl) {
		// push all letters in a simple array
		var letter = null;
		for (letter in $rootScope.letterCache) {
			var l = $rootScope.letterCache[letter];
			l.artists = $.grep(l.artists, function(e, i) {
				return e.albums.length > 0;
			});

			if (l.artists.length === 0) {
				delete $rootScope.letterCache[letter];
			}
			$rootScope.letters.push(l);
		}
		// sort the array
		$rootScope.letters.sort(function(a, b) {
			if (a.letter < b.letter) {
				return -1;
			} else {
				return 1;
			}
		});

		// set first or stored letter active
		if ($rootScope.letters.length > 0) {
			if (!$routeParams.letter) {
				$rootScope.activeLetter = $rootScope.letters[0];
			} else {
				$.each($rootScope.letters, function() {
					var letter = this;
					if (this.letter == $routeParams.letter) {
						$rootScope.activeLetter = this;
						// return false;
					}
				});
			}
			$rootScope.activeLetter.active = true;
			switchView.letter($rootScope.activeLetter);
		}
	};

	function getFirstLetter(name) {"use strict";
		name = stripThe(name);
		var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'], firstLetter = name.charAt(0);
		if ($.inArray(firstLetter, specialChars) > -1) {
			firstLetter = "1";
		}
		return "" + firstLetter;
	}

	function stripThe(name) {"use strict";
		name = $.trim(name.toUpperCase());
		name = (name.indexOf("THE ") === 0) ? name.substring(4) : name;
		return name;
	}

});
