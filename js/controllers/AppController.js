var jsmusicdb = angular.module('jsmusicdb', ['jsmusicdb.modelService', 'jsmusicdb.switchView', 'jsmusicdb.playerService', 'TimeFilters', 'jsmusicdb.sortService', 'ngRoute', 'ngSanitize', 'ngAnimate']).config(['$routeProvider',
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
		templateUrl : 'templates/ArtistOverview.html',
		controller : jsmusicdb.ArtistOverviewController
	})
}]);
/* caching */
jsmusicdb.controller('AppController', ['$scope', '$http', 'switchView', '$rootScope', '$location', '$routeParams', 'modelService',
function($scope, $http, switchView, $rootScope, $location, $routeParams, modelService) {"use strict";
	/* declare globals */
	$rootScope.letterCache = {};
	$rootScope.letters = [];
	$rootScope.activeLetter = null;
	$rootScope.artistCache = {};
	$rootScope.albumCache = {};
	$rootScope.trackCache = {};
	$rootScope.debug = [];
	$rootScope.parsed = false;
	$rootScope.contentPath = "";
	$rootScope.listenLetters = false;

	// read settings
	$http.get('settings.json').success(function(data) {
		$rootScope.isPrivateServer = data.private;
		$rootScope.backendConfig = data.backend;
		$rootScope.incremental = data.incremental;
		$rootScope.settingsRead = true;
		$scope.keydebug = data.keydebug;
	}).error(function() {
		$rootScope.settingsRead = true;
		$rootScope.noSettingsFound = true;
	});
	
	$scope.$on("keydown", function(msg, code) {
		$scope.keycode = code;
	});

	modelService.fetchJSON(switchView, $rootScope, $location, $routeParams, 'app', $scope, $http, function() {

		// sidebar
		var snapper = new Snap({
			element : document.getElementById('main')
		});
		snapper.settings({
			disable : 'right',
			touchToDrag : false
		});

		$("#main").on("click", " .toggle", function() {
			if (snapper.state().state == "left") {
				snapper.close();
			} else {
				snapper.open('left');
			}
		});
		$(".snap-drawers").on("click", "a", function(e) {
			snapper.close();
		});
		$scope.debugText = $rootScope.debug.join('<br />');
		$(".snap-content").fadeIn(function() {
			$(".snap-drawers").show();
		});
		$rootScope.parsed = true;
	});

	// add features based on settings
	$rootScope.$watch(function() {
		return $rootScope.settingsRead;
	}, function(n, o) {
		if (n) {
			if ($rootScope.incremental) {
				// allow incremental updating
				modelService.fetchIncrements(switchView, $rootScope, $location, $routeParams, 'app', $scope, $http);
			}
		}
	});

}]);
