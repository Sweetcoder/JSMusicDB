var jsmusicdb = angular.module('jsmusicdb', ['jsmusicdb.modelService', 'jsmusicdb.switchView', 'jsmusicdb.playerService', 'TimeFilters', 'jsmusicdb.sortService', 'ngRoute', 'ngSanitize', 'ngAnimate', 'ngTouch', 'pasvaz.bindonce']).config(['$routeProvider',
function($routeProvider) {
	$routeProvider.when('/letter/:letter', {
		templateUrl : 'templates/ArtistOverview.html',
		controller : jsmusicdb.ArtistOverviewController
	}).when('/letter/:letter/artist/:artist', {
		templateUrl : 'templates/ArtistView.html',
		controller : jsmusicdb.ArtistController
	}).when("/letter/:letter/artist/:artist/album/:album*", {
		templateUrl : 'templates/AlbumView.html',
		controller : jsmusicdb.AlbumController
	}).when("/playlist", {
		templateUrl : 'templates/playlist.html',
		controller : jsmusicdb.PlaylistController
	}).when("/settings", {
		templateUrl : 'templates/settings.html',
		controller : jsmusicdb.SettingsController
	}).when("/about", {
		templateUrl : 'templates/about.html',
		controller : jsmusicdb.AboutController
	}).otherwise({
		templateUrl : 'templates/Overview.html',
		controller : jsmusicdb.OverviewController
	});
}]);
/* caching */
jsmusicdb.controller('AppController', ['$scope', '$http', 'switchView', '$rootScope', '$location', '$routeParams', 'modelService',
function($scope, $http, switchView, $rootScope, $location, $routeParams, modelService) {"use strict";
	/* declare globals */
	$rootScope.letterCache = {};
	$rootScope.artistCache = {};
	$rootScope.albumCache = {};
	$rootScope.trackCache = {};
	$rootScope.letterCacheLocal = {};
	$rootScope.artistCacheLocal = {};
	$rootScope.albumCacheLocal = {};
	$rootScope.trackCacheLocal = {};
	$rootScope.letters = [];
	$rootScope.activeLetter = null;
	$rootScope.debug = [];
	$rootScope.parsed = false;
	$rootScope.contentPath = "";
	$rootScope.listenLetters = false;
	$rootScope.settingsBroadcast = false;
	$rootScope.pageTitle = 'Mobile MusicDB';
	$rootScope.recent = true;
	$rootScope.rootView = true;
	$rootScope.source = "cloud";
	$scope.first = true;

	// read settings
	$http.get('settings.json').success(function(data) {
		$rootScope.isPrivateServer = data.private;
		$rootScope.backendConfig = data.backend;
		$rootScope.incremental = data.incremental;
		$rootScope.settingsRead = true;
		$scope.keydebug = data.keydebug;
		$rootScope.useWizard = data.useWizard;
	}).error(function() {
		$rootScope.settingsRead = true;
		$rootScope.noSettingsFound = true;
	});

	$scope.$on("keydown", function(msg, code) {
		$scope.keycode = code;
	});

	$rootScope.localRead = false;
	$rootScope.$watch(function() {
		return $rootScope.wizardData;
	}, function(n, o) {
		if (n) {
			
			var postProcessModel = function() {
				$rootScope.parsed = true;
			};
			// only init on first go; a rescan can trigger this again and snapper won't work properly.
			if ($scope.first) {
				
				// implement fastclick
				$rootScope.parsed = false;
				// get data
				if (window.localJSON) {
					// device has local stored data
					$("#loadingType").html("Using device media");
					$rootScope.cachedJSON = false;
					modelService.parseJSON(window.localJSON, switchView, $rootScope, $location, $routeParams, 'app', $scope, $http, postProcessModel, 'local');
				}
				// sidebar
				var snapper = new Snap({
					element : document.getElementById('main')
				});
				snapper.settings({
					disable : 'right',
					touchToDrag : false
				});
				$("html").on("click", ".snapjs-left .snap-content", function(e) {
					e.preventDefault();
					$("body").removeClass("snapjs-left");
				});

				$("header").on("click", ".toggle a", function(e) {
					e.preventDefault();
					if ($("body").hasClass("snapjs-left")) {
						$("body").removeClass("snapjs-left");
					} else {
						snapper.open('left');
					}
				});
				$(".snap-drawers").on("click", "a", function(e) {
					// snapper.close();
					$("body").removeClass("snapjs-left");
				});
				$scope.debugText = $rootScope.debug.join('<br />');
				$(".snap-content").fadeIn(function() {
					$(".snap-drawers").show();
				});
				// go to most recent page
				/*
				 if (localStorage.getItem("state")) {
				 var state = JSON.parse(localStorage.getItem("state"));
				 if (state.url) {
				 document.location.href = "#" + state.url;
				 }
				 }
				 */
				/*
				 // broadcast backbutton events
				 document.addEventListener("backbutton", function (e) {
				 console.log("broadcast backbutton");
				 $rootScope.$broadcast("backbutton");
				 }, true);
				 document.addEventListener("menubutton", function () {
				 $('header .dropdown-toggle').dropdown('toggle');
				 }, false);
				 */
				$scope.first = false;
			}
			$rootScope.rescan();
		}
	});
	$rootScope.rescan = function() {
		
		var postProcessModel = function() {
			$rootScope.parsed = true;
		};
		// do we want cloud data?
		if ($rootScope.source === 'cloud' || !$rootScope.source) {
			$rootScope.parsed = false;
			if (window.jsonCache) {
				$("#loadingType").html("Importing local music data");
				$rootScope.cachedJSON = true;
				// we have a cached version of the music.json file, no need to get it again
				modelService.parseJSON(window.jsonCache, switchView, $rootScope, $location, $routeParams, 'app', $scope, $http, postProcessModel, 'cloud');
			} else {
				if (!$rootScope.wizardData.url) {
					// show wizard to set-up server data
					$rootScope.useWizard = true;
					$("#setup-wizard").show();
					// $rootScope.parsed = true;
				} else {
					$rootScope.cachedJSON = false;
					// get a new version of the music.json file
					$("#loadingType").html("Importing cloud music data");
					modelService.fetchJSON($rootScope, $http, function(data) {
						
						modelService.parseJSON(data, switchView, $rootScope, $location, $routeParams, 'app', $scope, $http, postProcessModel, 'cloud');
					});
				}
			}
		}
	};
	// populate recent
	var recent = localStorage.getItem("recent");
	if (recent) {
		recent = JSON.parse(recent);
		$rootScope.recent = recent;
	}
	$rootScope.addRecent = function(track) {
		var recent = localStorage.getItem("recent");
		if (recent) {
			recent = JSON.parse(recent);
		} else {
			recent = {
				artists : [],
				albums : [],
				tracks : [],
				topTracks : {}
			};
		}
		// album data
		var album = track.albumNode;
		if ($.inArray(stripThe(album.Artiest) + "-" + album.Album, recent.albums) === -1) {
			recent.albums.unshift(stripThe(album.Artiest) + "-" + album.Album);
			if (recent.albums.length > 4) {
				recent.albums.pop();
			}
		}
		// artist data
		var artist = album.artistNode;
		if ($.inArray(stripThe(artist.Naam), recent.artists) === -1) {
			recent.artists.unshift(stripThe(artist.Naam));
			if (recent.artists.length > 4) {
				recent.artists.pop();
			}
		}
		// track data
		if ($.inArray(stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel, recent.tracks) === -1) {
			recent.tracks.unshift(stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel);
		}
		if (!recent.topTracks) {
			recent.topTracks = {};
		}
		if (!recent.topTracks[stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel]) {
			recent.topTracks[stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel] = {
				played : 1,
				lastDate : new Date()
			};
		} else {
			recent.topTracks[stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel].played = recent.topTracks[stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel].played + 1;
			recent.topTracks[stripThe(artist.Naam) + "-" + album.Album + "-" + track.Titel].lastDate = new Date();
		}
		$rootScope.recent = recent;
		localStorage.removeItem("recent");
		localStorage.setItem("recent", JSON.stringify(recent));
	};
	function stripThe(name) {"use strict";
		name = $.trim(name.toUpperCase());
		name = (name.indexOf("THE ") === 0) ? name.substring(4) : name;
		return name;
	}

	// add features based on settings
	$rootScope.$watch(function() {
		return $rootScope.settingsRead;
	}, function(n, o) {
		if (n) {
			if (!$rootScope.useWizard) {
				var path = location.pathname;
				if (path.indexOf("index.html") !== -1) {
					path = path.substring(0, path.indexOf("index.html"));
				}
				if (path.indexOf("tv.html") !== -1) {
					path = path.substring(0, path.indexOf("tv.html"));
				}
				$rootScope.wizardData = {
					url : location.protocol + '//' + location.host,
					musiclocation : path + 'music.json',
					incrementlocation : path + 'increment.json'
				};
			}
			$rootScope.localRead = true;

			if ($rootScope.incremental) {
				// allow incremental updating
				modelService.fetchIncrements(switchView, $rootScope, $location, $routeParams, 'app', $scope, $http);
			}
		}
	});

}]);
