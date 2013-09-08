jsmusicdb.controller('PlayerController', ['$scope', '$http', 'switchView', '$rootScope' ,'playerService', function ($scope, $http, switchView, $rootScope, playerService) {
    "use strict";
    var playerpath = 'proxy/$s/stream.php?path=',
        audiotag = $('audio').get(0),
        watching = [$scope.album, $scope.track],
    
    play = function (track) {
        $scope.scrobbeld = false;
        if ($scope.track) {
            $scope.track.isPlaying = false;
        }
        $scope.track = playerService.track(track);
        $scope.track.isPlaying = true;
        $scope.isPlaying = true;
        $scope.playstate = 'play';
        
        // set audio source
        var src = "";
        if ($rootScope.server !== 0) {
            src = playerpath.replace('$s', $rootScope.server) + track.path.replace('+', '%2B').replace('&', '%26') + '&sid='+$rootScope.sid + '&server=' + encodeURIComponent($rootScope.url);
        } else {
            src = 'file:///' + track.path;
        }
        audiotag.src = src;
        audiotag.load();
        
        // hack for setting src twice, could fix problems on mobiles.
        setTimeout(function () {
            audiotag.src = src;
            audiotag.load();
            // and play the track!
            audiotag.play();
        }, 10);
        
        // set now playling status
        playerService.scrobbleNowPlaying($scope);
    };
    $scope.$on('playTrack', function (e, track) {
        // switchView.setAsPlaylist(album);
        play(track);
    });
    $scope.pos = function () {
        var percentage = ($scope.position / $scope.len) * 100;
        return (percentage) ? percentage + '%' : '0%';
    };
    $scope.next = function () {
        var track = playerService.nextTrack($scope.track);
        if (track) {
            play(track);
        } else {
            $scope.track.isPlaying = false;
            $scope.track = null;
            $scope.isPlaying = false;
            audiotag.pause();
        }
    };
    $scope.previous = function () {
        var track = playerService.previousTrack($scope.track);
        if (track) {
            play(track);
        } else {
            $scope.track.isPlaying = false;
            $scope.track = null;
            $scope.isPlaying = false;
            audiotag.pause();
        }
    };
    $scope.playstate = 'play';
    $scope.playpause = function () {
        if ($scope.playstate === 'play') {
            $scope.playstate = 'pause';
            $scope.track.isPlaying = false;
            audiotag.pause();
        } else {
            $scope.playstate = 'play';
            $scope.track.isPlaying = true;
            audiotag.play();
        }
    };
    $scope.stop = function () {
        $scope.playstate = 'play';
        $scope.isPlaying = false;
        $scope.track.isPlaying = false;
        audiotag.pause();
        audiotag.src = '';
    };
    $scope.updatePosition = function ($event) {
        if ($scope.len) {
            var clientX = $event.clientX,
                left = clientX - $($event.target).offset().left,
                perc = (left / $($event.target).width()),
                time = perc * $scope.len;
            audiotag.currentTime = time;
        }
    };
    $scope.muteState = 'up';
    $scope.toggleMute = function () {
        if ($scope.muteState === 'up') {
            $scope.muteState = 'off';
            audiotag.volume = 0;
        } else {
            $scope.muteState = 'up';
            audiotag.volume = 1;
        }
    };
    $scope.love = function (album, track) {
        if (localStorage.getItem("key")) {
            var url = 'http://ws.audioscrobbler.com/2.0/', data = {
                method : 'track.love',
                api_key : '956c1818ded606576d6941de5ff793a5',
                artist : album.Artiest,
                track : track.Titel,
                sk : localStorage.getItem("key"),
                api_sig: lastfm.signplayinglove(album.Artiest, track.Titel, 'track.love')
            };
            $.post(url, data, function(json) {});
        }
    };
    var scrobble = function () {
        playerService.scrobble($scope);
        $scope.scrobbeld = true;
    };
    $scope.playlistView = 'list';
    $scope.toggleView = function () {
        $("#main .container > div").hide();
        if ($scope.playlistView === 'list') {
            $("#playlist").show();
            $scope.playlistView = 'th';
        } else {
            $("#content").show();
            $scope.playlistView = 'list';
        }
    };
    
    $scope.isRandom = 'arrow-right';
    $scope.toggleRandom = function () {
        if ($scope.isRandom === 'arrow-right') {
            playerService.random(true);
            $scope.isRandom = 'random';
        } else {
            playerService.random(false);
            $scope.isRandom = 'arrow-right';
        }
    };
    
    // audiotag events
    audiotag.addEventListener('timeupdate', function () {
        $scope.position = audiotag.currentTime;
        $scope.len = audiotag.duration;
        if ($scope.position / $scope.len > 0.5 && !$scope.scrobbeld) {
            scrobble();
        }
        $scope.$apply();
    });
    audiotag.addEventListener('ended', function () {
        $scope.next();
    });
}]);