function SettingsController($scope, $rootScope) {
    "use strict";
    var proxy = 'proxy/'+$scope.server+'/login.php',
        lastfmkey = localStorage.getItem("key");
    $rootScope.url = $scope.url;
    $scope.server = 1;
    
    $scope.login = function () {
        // TODO: should be an angular $http
        $.getJSON(proxy, { account: $scope.username, passwd: $scope.password, server: $scope.url}, function (json) {
            if (json.success && json.success === true) {
                // login successfull
                $scope.loggedIn = true;
                $rootScope.sid = json.data.sid;
                $rootScope.url = $scope.url;
                $rootScope.server = $scope.server;
                if ($scope.store) {
                    var stored = {
                        username: $scope.username,
                        password: $scope.password,
                        url: $scope.url,
                        server: $scope.server
                    };
                    localStorage.removeItem("store");
                    localStorage.setItem("store", JSON.stringify(stored));
                }
            } else {
                // TODO: error handling
                localStorage.removeItem("store");
            }
        });
    };
    
    if (localStorage.getItem("store")) {
        var stored = JSON.parse(localStorage.getItem("store"));
        $scope.username = stored.username;
        $scope.password = stored.password;
        $scope.url = stored.url;
        $scope.server = stored.server;
        $scope.login();
        $scope.store = true;
        $(".toggle").tooltip("destroy"); // no need for hints anymore!
    }
    // show tooltip to hint the user to login
    if (!$scope.store) {
        $(".toggle").tooltip("show");
    }
    if (lastfmkey) {
        $scope.lastfm = lastfmkey;
        $rootScope.lastfmkey = lastfmkey;
    }
    $rootScope.lastfmkey = 'lastfmkey';
}