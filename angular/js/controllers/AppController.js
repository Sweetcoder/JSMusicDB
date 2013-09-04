var jsmusicdb = angular.module('jsmusicdb', ['jsmusicdb.switchView', 'jsmusicdb.playerService', 'TimeFilters']).config(['$routeProvider',
function($routeProvider) {
	$routeProvider.when('/letter/:letter', {
		templateUrl : 'templates/ArtistOverview.html',
		controller : jsmusicdb.ArtistOverviewController
	}).when('/letter/:letter/artist/:artist', {
		templateUrl : 'templates/ArtistView.html',
		controller: jsmusicdb.ArtistController
	}).when('/letter/:letter/artist/:artist/album/:album', {
		templateUrl : 'templates/AlbumView.html',
		controller: jsmusicdb.AlbumController
	}).otherwise({
		templateUrl: 'templates/ArtistOverview.html',
		controller: jsmusicdb.ArtistOverviewController
	})
}]);
/* caching */
// var letterCache = {}, letters = [], activeLetter = null, artistCache = {}, albumCache = {}, debug = [];
jsmusicdb.controller('AppController', ['$scope', '$http', 'switchView', '$rootScope', '$location', '$routeParams', 
function($scope, $http, switchView, $rootScope, $location, $routeParams) {"use strict";
	/* declare globals */
	$rootScope.letterCache = {};
	$rootScope.letters = [];
	$rootScope.activeLetter = null;
	$rootScope.artistCache = {};
	$rootScope.albumCache = {};
	$rootScope.debug = [];

	var mainStart = new Date();
	$http.get('music.json').success(function(data) {
		var start = new Date();
		$rootScope.debug.push('JSON fetched in ' + (start - mainStart) + ' ms');
		angular.forEach(data, function(value, key) {
			if (value.totals) {
				$scope.totalArtists = value.totals.artists;
				$scope.totalAlbums = value.totals.albums;
				$scope.totalTracks = value.totals.tracks;
				$scope.totalPlaying = value.totals.playingTime;
			} else if (value.Naam && !value.Artiest) {
				// these are the nodes without an Artiest attribute but with a Naam attribute; these are the Artists meta nodes
				if (!$rootScope.letterCache[getFirstLetter(stripThe(value.Naam))]) {
					var letter = new jsmusicdb.Letter(value);
					$rootScope.letterCache[getFirstLetter(stripThe(value.Naam))] = letter;
				}
				if (!$rootScope.artistCache[stripThe(value.Naam)]) {
					var artist = new jsmusicdb.Artist(value);
					$rootScope.artistCache[stripThe(value.Naam)] = artist;
					$rootScope.letterCache[getFirstLetter(stripThe(value.Naam))].artists.push(artist);
				}
			} else if (value.Naam && value.Artiest) {
				// these are the nodes with an Artiest and a Name attribute; these are the Album meta nodes
				if (!$rootScope.albumCache[value.Naam]) {
					var album = new jsmusicdb.Album(value);
					$rootScope.albumCache[value.Naam] = album;
					$rootScope.artistCache[stripThe(album.Artiest)].albums.push(album);
				}
			} else {
				// these are the Track nodes
				var track = new jsmusicdb.Track(value);
				// add track to album
				if ($rootScope.albumCache[track.Artiest + " - " + track.Album]) {
					$rootScope.albumCache[track.Artiest + " - " + track.Album].tracks.push(track);
					track.albumNode = $rootScope.albumCache[track.Artiest + " - " + track.Album];
				}
			}
		});
		_setupModels(switchView, $rootScope, $location, $routeParams);
		$("#loader").hide();
		$("#content").fadeIn();
		var stop = new Date();
		$rootScope.debug.push('Fill and sort models done in ' + (stop - start) + ' ms');
		$scope.debugText = $rootScope.debug.join('<br />');
	});
}]);
/*
 AppController.$inject = ['$scope', '$http', 'switchView', '$rootScope'];
 LetterController.$inject = ['$scope', 'switchView'];
 ArtistOverviewController.$inject = ['$scope', '$http', 'switchView'];
 ArtistController.$inject = ['$scope', '$http', 'switchView', 'ImageService'];
 AlbumController.$inject = ['$scope', '$http', 'ImageService', 'playerService'];
 PlaylistController.$inject = ['$scope', 'playerService'];
 PlayerController.$inject = ['$scope', '$http', 'switchView', '$rootScope', 'playerService'];
 */

function getFirstLetter(name) {"use strict";
	name = stripThe(name);
	var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = name.charAt(0);
	if ($.inArray(firstLetter, specialChars) > -1) {
		firstLetter = "1";
	}
	return firstLetter;
}

function stripThe(name) {"use strict";
	name = name.toUpperCase();
	name = (name.indexOf("THE ") === 0) ? name.substring(4) : name;
	return name;
}

function _setupModels(switchView, $rootScope, $location, $routeParams) {"use strict";
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
    		$.each($rootScope.letters, function () {
    			var letter = this;
    			if (this.letter == $routeParams.letter) {
    				$rootScope.activeLetter = this;
	   				return false;
    			}
    		});
    	}
        $rootScope.activeLetter.active = true;
        switchView.letter($rootScope.activeLetter);
    }
	
	// sidebar
	var snapper = new Snap({
		element : document.getElementById('main')
	});
	snapper.settings({
		disable : 'right',
		touchToDrag : false
	});

	$("#main .toggle").on("click", function() {
		if (snapper.state().state == "left") {
			snapper.close();
		} else {
			snapper.open('left');
		}
	});
	$(".snap-drawers").on("click", "a", function(e) {
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