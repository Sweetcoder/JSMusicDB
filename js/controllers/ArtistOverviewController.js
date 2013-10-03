jsmusicdb.controller('ArtistOverviewController', ['$scope', '$http', 'switchView', '$location', '$routeParams', '$rootScope', 'sortService',
function($scope, $http, switchView, $location, $routeParams, $rootScope, sortService) {"use strict";
    $scope.$on('letterChange', function(e, letter) {
        $scope.Artists = letter.artists;
    });
    $scope.$on('routeArtistChange', function(e, artistName) {
        $.each($scope.Artists, function() {
            if (this.Naam === artistName) {
                switchView.artist(this);
                // TODO: generic function
                $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
                $("#artistView").removeClass("child").removeClass("parent").addClass("view");
                $("#albumView").addClass("child").removeClass("parent").removeClass("view");
                $(".snap-content").get(0).scrollTop = 0;
            }
        });
    });
    $scope.getArtist = function(artist) {
        switchView.artist(artist);
        // TODO: generic function
        $("#artistOverviewView").removeClass("child").addClass("parent").removeClass("view");
        $("#artistView").removeClass("child").removeClass("parent").addClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        $(".snap-content").get(0).scrollTop = 0;
    };

    // sorting
    $scope.sortService = sortService;

    // get routing

    if ($routeParams.letter) {
        $rootScope.$watch(function() {
            return $rootScope.parsed;
        }, function(n, o) {
            if (n) {
                if (window._gaq) {
                    _gaq.push(['_trackPageview', '/letter/' + $routeParams.letter]);
                }
                window.document.title = 'JSMusicDB - letter: ' + $routeParams.letter;
                switchView.routeLetter($routeParams.letter);
            }
            $rootScope.contentPath = $location.path();
        });
    }
}]);
