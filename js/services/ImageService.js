jsmusicdb.factory('ImageService', function($http) {'use strict';
    var image = null;
    return {
        getInfo : function($scope) {
            if ($scope.artist && !$scope.artist.art) {
                $http.get($scope.artist.url, {
                    params : $scope.artist.data
                }).success(function(json) {
                    if (json.artist) {
                        $scope.art = json.artist.image[3]["#text"] || "images/nocover.png";
                        $scope.bio = json.artist.bio.content;
                    } else {
                        $scope.art = "images/nocover.png";
                    }
                    $scope.artist.art = $scope.art;
                    $scope.artist.bio = $scope.bio;
                });
            } else {
                if ($scope.artist && $scope.artist.art) {
                    $scope.art = $scope.artist.art;
                    $scope.bio = $scope.artist.bio;
                } else {
                    $scope.art = "images/nocover.png";
                }
                return {
                    art : $scope.art,
                    bio : $scope.bio
                };
            }
        },
        getAlbumArt : function($scope) {
            if ($scope.album && !$scope.album.art) {
                $http.get($scope.album.url, {
                    params : $scope.album.data
                }).success(function(json) {
                    if (json.album) {
                        var artlist = json.album.image;
                        $.each(artlist, function() {
                            if (this.size === 'extralarge') {
                                var url = this["#text"];
                                $scope.art = url || "images/nocover.png";
                                /*
                                if (url !== "") {
                                    url = url.split("/");
                                    url = "http://userserve-ak.last.fm/serve/500/" + url[5];
                                    $scope.art = url;
                                } else {
                                    $scope.art = "images/nocover.png";
                                }
                                */
                            }
                        });
                    } else {
                        $scope.art = "images/nocover.png";
                    }
                    $scope.album.art = $scope.art;
                });
            } else {
                if ($scope.album && $scope.album.art) {
                    $scope.art = $scope.album.art;
                } else {
                    $scope.art = "images/nocover.png";
                }
                return $scope.art;
            }
        }
    };
});
