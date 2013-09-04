var jsmusicdb = angular.module('jsmusicdb', ['jsmusicdb.modelService', 'jsmusicdb.switchView', 'jsmusicdb.playerService', 'TimeFilters']).config(['$routeProvider',
function($routeProvider) {
	$routeProvider.when('/letter/:letter', {
		templateUrl : 'templates/ArtistOverview.html',
		controller : jsmusicdb.ArtistOverviewController
	}).when('/letter/:letter/artist/:artist', {
		templateUrl : 'templates/ArtistView.html',
		controller : jsmusicdb.ArtistController
	}).when('/letter/:letter/artist/:artist/album/:album', {
		templateUrl : 'templates/AlbumView.html',
		controller : jsmusicdb.AlbumController
	}).otherwise({
		templateUrl : 'templates/ArtistOverview.html',
		controller : jsmusicdb.ArtistOverviewController
	})
}]);
/* caching */
// var letterCache = {}, letters = [], activeLetter = null, artistCache = {}, albumCache = {}, debug = [];
jsmusicdb.controller('AppController', ['$scope', '$http', 'switchView', '$rootScope', '$location', '$routeParams', 'modelService',
function($scope, $http, switchView, $rootScope, $location, $routeParams, modelService) {"use strict";
	/* declare globals */
	$rootScope.letterCache = {};
	$rootScope.letters = [];
	$rootScope.activeLetter = null;
	$rootScope.artistCache = {};
	$rootScope.albumCache = {};
	$rootScope.debug = [];
	$rootScope.parsed = false;

	modelService.fetchJSON(switchView, $rootScope, $location, $routeParams, 'app', $scope, $http, function() {
		$("#loader").hide();
		$("#content").fadeIn();

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
		});

		//var stop = new Date();
		//$rootScope.debug.push('Fill and sort models done in ' + (stop - start) + ' ms');
		$scope.debugText = $rootScope.debug.join('<br />');
		
		$rootScope.parsed = true;
	});
	$("#loader").hide();
	$("#content").fadeIn();
}]);