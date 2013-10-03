jsmusicdb.controller('AlbumController', ['$scope', '$http', 'ImageService', 'playerService', '$location', '$routeParams', '$rootScope', 'switchView', 'sortService',
function($scope, $http, ImageService, playerService, $location, $routeParams, $rootScope, switchView, sortService) {"use strict";
    $scope.$on('albumChange', function(e, album, artist, update) {
        $scope.album = album;
        $scope.artist = artist;
    });
    $scope.addToPlaylist = function(album) {
        playerService.addAlbum(album);
        $scope.albumstate = "minus";
    };
    $scope.albumstate = "plus";
    
    $scope.removeFromPlaylist = function (album) {
        playerService.removeAlbum(album);
        $scope.albumstate = "plus";
    };
    
    $scope.closeView = function() {
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").removeClass("parent").addClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        window.history.back();
    };
    // $scope.art = ImageService.getAlbumArt($scope);
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

    if ($routeParams.album) {
        $rootScope.$watch(function() {
            return $rootScope.parsed;
        }, function(n, o) {
            if (n) {
            	if ($rootScope.activeLetter) {
					$rootScope.activeLetter.active = false;
				}
				$rootScope.activeLetter = $rootScope.letterCache[$routeParams.letter];
				$rootScope.activeLetter.active = true;
                var activeLetter = $rootScope.activeLetter;
                $.each(activeLetter.artists, function() {
                    if ($.trim(this.Naam).toLowerCase() === $routeParams.artist.toLowerCase()) {                        
                        var artist = this;
                        $.each(this.albums, function() {
                            if ($.trim(this.Album) === $routeParams.album) {
                                if (window._gaq) {
                                    _gaq.push(['_trackPageview', '/letter/' + $routeParams.letter + '/artist/' + $routeParams.artist + '/album/' + $routeParams.album]);
                                }
                                window.document.title = 'JSMusicDB - ' + $routeParams.artist + " - " + $routeParams.album;
                                switchView.album(this, artist, true);
                                return false;
                            }
                        });
                    }
                });
            }
            $rootScope.contentPath = $location.path();
        });
    }
}]);
