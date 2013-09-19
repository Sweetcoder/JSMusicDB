jsmusicdb.controller('SettingsController', ['$scope', '$rootScope', '$http',
function($scope, $rootScope, $http) {"use strict";
    var lastfmkey = localStorage.getItem("key");
    $rootScope.url = $scope.url;

    $scope.isLoading = false;

    $scope.login = function() {
        $scope.isLoading = true;
        if ($scope.server !== '0') {
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
                    // TODO: error handling
                    localStorage.removeItem("store");
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