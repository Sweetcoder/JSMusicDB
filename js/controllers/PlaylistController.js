jsmusicdb.controller('PlaylistController', ['$scope', 'playerService', function ($scope, playerService) {
    "use strict";
    
    window.document.title = 'JSMusicDB - Playlist';
    if (window._gaq) {
        _gaq.push(['_trackPageview', '/playlist']);
    }
    
    $scope.$on("addAlbumToPlaylist", function (e, album) {
        playerService.addAlbum(album);
    });
    $scope.$on("setAsPlaylist", function (e, album) {
        $scope.playlist = []; // clear current playlist
        $scope.playlist.push(album);
    });
    $scope.orderTracks = function(a) {
        var totalNumber= 0;
        if (a.Disc) {
            totalNumber = a.Disc * 100 + a.Nummer;
        } else {
            // fake CD 1
            totalNumber =  100 + a.Nummer;
        }
        return totalNumber;
    };
    $scope.$on("backbutton", function() {
		console.log("Playlist: capture backbutton: " + $rootScope.contentPath);
		document.location.href = "#" + $rootScope.contentPath;
	});
}]);