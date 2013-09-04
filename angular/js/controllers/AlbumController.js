jsmusicdb.controller('AlbumController', ['$scope', '$http', 'ImageService', 'playerService', '$location','$routeParams', '$rootScope', 'switchView', function ($scope, $http, ImageService, playerService, $location, $routeParams, $rootScope, switchView) {
    "use strict";
    $scope.$on('albumChange', function(e, album, artist) {
        $scope.Album = album;
        $scope.Artist = artist;
        // update location
        // $location.path('/artist/' + artist.Naam + '/album/' + album.Album);
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").addClass("parent").removeClass("view");
        $("#albumView").removeClass("child").removeClass("parent").addClass("view");
    });
    $scope.addToPlaylist = function (album) {
        playerService.addAlbum(album);
    };
    $scope.closeView = function () {
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").removeClass("parent").addClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        window.history.back();
    };
    $scope.art = ImageService.getAlbumArt($scope);
    
    if ($routeParams.album) {
    	var digest = function () {
    		var activeLetter = null;
    		if ($rootScope.activeLetter) {
    			activeLetter = $rootScope.activeLetter;
    			$.each(activeLetter.artists, function () {
    				if (this.Naam === $routeParams.artist) {
    					$.each(this.albums, function () {
    						if (this.Album === $routeParams.album) {
    							switchView.album(this);
    							return false;
    						}
    					});
    				}
    			});
    		} else {
    			setTimeout(function () {
    				digest();
    			}, 100);
    		}
    	}
    	digest();
    }
}]);