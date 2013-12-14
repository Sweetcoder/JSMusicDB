angular.module('jsmusicdb.modelService', []).service('modelService', function($rootScope, $http, $timeout) {"use strict";
	var that = this;

	this.fetchIncrements = function(switchView, $rootScope, $location, $routeParams, ctl, $scope, $http) {
		(function checkIncrement() {
			var scope = $scope, start = new Date();
			$http.get($rootScope.wizardData.url + $rootScope.wizardData.incrementlocation).success(function(data) {
				if (data) {
					var ts = data[data.length - 1].ts;
					if (scope.lastIncrementDate !== ts) {
						console.log("parse new data");
						angular.forEach(data, function(value, key) {
							that.parseData(value, key, $scope, $rootScope, true);
						});
						scope.lastIncrementDate = ts;
						$rootScope.debug.push('Increment parsed in ' + (new Date() - start) + ' ms');
					}
				}
			});
			$timeout(checkIncrement, 1000);
		})();
	};

	this.fetchJSON = function($rootScope, $http, callback) {
		var mainStart = new Date();
		$http.get($rootScope.wizardData.url + $rootScope.wizardData.musiclocation).success(function(data) {
			var start = new Date();
			$rootScope.debug.push('JSON fetched in ' + (start - mainStart) + ' ms');
			// save it to a local file
			/*
			 try {
			 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			 fileSystem.root.getDirectory("org.arielext.mobilemusicdb", {create: true}, function (dirEntry){
			 dirEntry.getFile("music.json", {create: true, exclusive: true}, function(fileEntry){
			 fileEntry.createWriter(function(writer){
			 writer.write(JSON.stringify(data));
			 });
			 });
			 });
			 });
			 } catch (e) {
			 }
			 */
			callback(data);
		});
	};
	this.parseJSON = function(data, switchView, $rootScope, $location, $routeParams, ctl, $scope, $http, callback, source) {
		var start = new Date();
		$rootScope.nonParseable = false;
		if (data[0] !== "<") {
			angular.forEach(data, function(value, key) {
				that.parseData(value, key, $scope, $rootScope, false, source);
			});
			$rootScope.debug.push('JSON parsed in ' + (new Date() - start) + ' ms');
			that.fetched = true;
			that.setupModels(switchView, $rootScope, $location, $routeParams, ctl);
		}
		callback();
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
		if ($rootScope.activeLetter) {
			$rootScope.contentPath = "/letter/" + $rootScope.activeLetter.letter;
		}
	};

	this.parseData = function(value, key, $scope, $rootScope, updateTotals, source) {
		switch (value.Type) {
			case 'totals':
				$rootScope.totalArtists = value.totals.artists;
				$rootScope.totalAlbums = value.totals.albums;
				$rootScope.totalTracks = value.totals.tracks;
				$rootScope.totalPlaying = value.totals.playingTime;
				$rootScope.timestamp = value.totals.timestamp * 1000;
				break;
			case 'artist':
				if (value.Naam) {
					if (!$rootScope.letterCache[getFirstLetter(value.Naam)]) {
						var letter = new jsmusicdb.Letter(value);
						$rootScope.letterCache[getFirstLetter(value.Naam)] = letter;
					}
					if (!$rootScope.artistCache[stripThe(value.Naam)]) {
						var artist = new jsmusicdb.Artist(value);
						$rootScope.artistCache[stripThe(value.Naam)] = artist;
						$rootScope.letterCache[getFirstLetter(value.Naam)].artists.push(artist);
						if (updateTotals) {
							$rootScope.totalArtists++;
						}
						artist.letterNode = $rootScope.letterCache[getFirstLetter(value.Naam)];
					}
				} else {
					console.log("No 'Naam' field found, we had " + JSON.stringify(value));
				}
				break;
			case 'album':
				if (value.Album && value.Artiest) {
					if (!$rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album]) {
						var album = new jsmusicdb.Album(value);
						$rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album] = album;
						$rootScope.artistCache[stripThe(album.Artiest)].albums.push(album);
						album.artistNode = $rootScope.artistCache[stripThe(album.Artiest)];
						if (updateTotals) {
							$rootScope.totalAlbums++;
						}
					}
				}
				break;
			case 'track':
				var track = new jsmusicdb.Track(value);
				// add track to album
				if ($rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album]) {
					if (!$rootScope.trackCache[stripThe(value.Artiest) + "-" + value.Album + "-" + value.Titel]) {
						$rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album].tracks.push(track);
						track.albumNode = $rootScope.albumCache[stripThe(value.Artiest) + "-" + value.Album];
						$rootScope.trackCache[stripThe(value.Artiest) + "-" + value.Album + "-" + value.Titel] = track;
						if (updateTotals) {
							$rootScope.totalTracks++;
							$rootScope.totalPlaying = $scope.totalPlaying + 2500;
						}
						if (source === "local") {
							// on device
							track.inLocalDevice = true;
							if (!$rootScope.letterCacheLocal[track.albumNode.artistNode.letterNode.letter]) {
								$rootScope.letterCacheLocal[track.albumNode.artistNode.letterNode.letter] = track.albumNode.artistNode.letterNode;
							}
							if (!$rootScope.artistCacheLocal[stripThe(track.albumNode.artistNode.Naam)]) {
								$rootScope.artistCacheLocal[stripThe(track.albumNode.artistNode.Naam)] = track.albumNode.artistNode;
								track.albumNode.artistNode.letterNode.artistsLocal.push(track.albumNode.artistNode);
							}
							if (!$rootScope.albumCacheLocal[stripThe(track.albumNode.Artiest) + "-" + track.albumNode.Album]) {
								$rootScope.albumCacheLocal[stripThe(track.albumNode.Artiest) + "-" + track.albumNode.Album] = track.albumNode;
								track.albumNode.artistNode.albumsLocal.push(track.albumNode);
								track.albumNode.inLocalDevice = true;
							}
						}
					}
				} else {
					// TODO: do we want to log this/report these?
					// console.log("no album found for",stripThe(value.Artiest) + "-" + value.Album, $rootScope.albumCache);
				}

				break;
			case 'ts':
				break;
			default:
				// unknown type or no type present
				if (window.console)
					console.log("Unknown type: " + value.Type);
				// tell the view the data is non-parseable
				$rootScope.nonParseable = true;
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
