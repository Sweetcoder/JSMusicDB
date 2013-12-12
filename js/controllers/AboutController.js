jsmusicdb.controller('AboutController', ['$scope', '$rootScope', '$http',
function($scope, $rootScope, $http) {"use strict";
    window.document.title = 'JSMusicDB - About';
    if (window._gaq) {
        _gaq.push(['_trackPageview', '/about']);
    }
    $scope.$on("backbutton", function() {
		console.log("About: capture backbutton, " + $rootScope.contentPath);
		document.location.href = "#" + $rootScope.contentPath;
	});
}]);