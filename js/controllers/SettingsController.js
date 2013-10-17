jsmusicdb.controller('SettingsController', ['$scope', '$rootScope', '$http',
function($scope, $rootScope, $http) {"use strict";

	window.document.title = 'JSMusicDB - Settings';
	if (window._gaq) {
		_gaq.push(['_trackPageview', '/settings']);
	}
	$scope.lastfmLink = 'http://www.last.fm/api/auth/?api_key=956c1818ded606576d6941de5ff793a5&cb=' + document.location.href.substring(0, document.location.href.indexOf("#"));
	var lastfmkey = localStorage.getItem("key");
	$rootScope.url = $scope.url;
	$rootScope.canPlay = false;

	$scope.isLoading = false;

	$scope.login = function() {
		$scope.isLoading = true;
		$scope.loginError = false;
		// synology
		if ($scope.server == '1') {
			$http.get('proxy/' + $scope.server + '/login.php', {
				params : {
					account : $scope.username,
					passwd : $scope.password,
					server : $scope.url
				}
			}).success(function(json) {
				if (json.success && json.success === true) {
					// login successfull
					$scope.loggedIn = true;
					$rootScope.sid = json.data.sid;
					$rootScope.url = $scope.url;
					$rootScope.server = $scope.server;
					if ($scope.store) {
						var stored = {
							username : $scope.username,
							password : $scope.password,
							url : $scope.url,
							server : $scope.server
						};
						localStorage.removeItem("store");
						localStorage.setItem("store", JSON.stringify(stored));
					}
				} else {
					localStorage.removeItem("store");
					$scope.loginError = true;
				}
				$scope.isLoading = false;
				$rootScope.canPlay = true;
			});
		} else if ($scope.server == '2') {
			// node.js
			$http.jsonp($scope.url + '/login/?callback=JSON_CALLBACK', {
				params : {
					account : $scope.username,
					passwd : $scope.password,
					server : $scope.url
				}
			}).success(function(json) {
				if (json.success && json.success === true) {
					// login successfull
					$scope.loggedIn = true;
					$rootScope.url = $scope.url;
					$rootScope.server = $scope.server;
					if ($scope.store) {
						var stored = {
							username : $scope.username,
							password : $scope.password,
							url : $scope.url,
							server : $scope.server
						};
						localStorage.removeItem("store");
						localStorage.setItem("store", JSON.stringify(stored));
					}
				} else {
					localStorage.removeItem("store");
					$scope.loginError = true;
				}
				$scope.isLoading = false;
				$rootScope.canPlay = true;
			});
		} else {
			$rootScope.server = $scope.server;
			if ($scope.store) {
				$scope.username = 'local user';
				var stored = {
					server : $scope.server,
					username : $scope.username
				};
				localStorage.removeItem("store");
				localStorage.setItem("store", JSON.stringify(stored));
			}
			$scope.loggedIn = true;
			$scope.isLoading = false;
			$rootScope.canPlay = true;
		}
	};
	$scope.logout = function() {
		// logout from the server and reset the state
		localStorage.removeItem("store");
		$scope.isLoading = false;
		$rootScope.canPlay = false;
		$scope.loggedIn = false;
	};

	// only start prefilling when the models are fully loaded.
	$rootScope.$watch(function() {
		return $rootScope.parsed;
	}, function(n, o) {
		if (n) {
			if ($rootScope.isPrivateServer) {
				// auto login; without using a password; this is handy for playling local files, but not recommended if the server is connected to the internet
				$scope.login();
			}
			if ($rootScope.backendConfig) {
				// prefill based on backend config, stored config will overwrite this
				$scope.url = $rootScope.backendConfig.serverURL;
				$scope.server = $rootScope.backendConfig.serverType;
			}
		}
	});
	
	if (localStorage.getItem("store")) {
		var stored = JSON.parse(localStorage.getItem("store"));
		$scope.username = stored.username;
		$scope.password = stored.password;
		$scope.url = stored.url;
		$scope.server = stored.server;
		$scope.login();
		$(".toggle > i").tooltip("destroy");
		// no need for hints anymore!
	}
	// show tooltip to hint the user to login
	if (lastfmkey) {
		$scope.lastfm = lastfmkey;
		$rootScope.lastfmkey = lastfmkey;
	}

}]);
