jsmusicdb.controller('LetterController', ['$scope', '$rootScope', 'switchView', '$window',
    function ($scope, $rootScope, switchView, $window) {
        "use strict";
        $rootScope.$watch(function () {
            return $rootScope.source;
        }, function (n, o) {
            if (n === 'local') {
                $scope.Letters = $rootScope.letterCacheLocal;
            } else {
                $scope.Letters = $rootScope.letterCache;
            }
            if ($scope.activeLetter) {
                $scope.activeLetter.active = false;
            }
        });
        $scope.navIndex = -1;
        // set the artistsInLetter var to reflect the artists in the current active letter
        $scope.getLetter = function (letter) {
            if ($scope.activeLetter) {
                $scope.activeLetter.active = false;
            }
            $scope.activeLetter = letter;
            $scope.activeLetter.active = true;
            $rootScope.activeLetter = letter;
            switchView.letter(letter);

        };

        $scope.$on('routeLetterChange', function (e, l) {
            var digest = function (l) {
                if ($rootScope.letters.length !== 0) {
                    var newLetter = $scope.Letters[l];
                    if (!newLetter) {
                        $.each($scope.Letters, function () {
                            newLetter = this;
                            return false;
                        });
                    }
                    $scope.getLetter(newLetter);
                } else {
                    setTimeout(function () {
                        digest(l);
                    }, 100);
                }
            };
            digest(l);
        });
        $scope.$on("keyOutOfBoundsUp", function (msg, code) {
            if ($rootScope.listenLetters) {
                switch (code) {
                    case $rootScope.keymapping.LEFT:
                        // up
                        setNavIndex(-1, code);
                        break;
                    case $rootScope.keymapping.UP:
                        // up
                        setNavIndex(+1, code);
                        break;
                    case $rootScope.keymapping.RIGHT:
                        // down
                        setNavIndex(+1, code);
                        break;
                    case $rootScope.keymapping.DOWN:
                        $scope.navIndex = -1;
                        $rootScope.$broadcast("letterOutOfBoundsDown", code);
                        break;
                    case $rootScope.keymapping.ENTER:
                        // enter
                        $(".navbar ul .highlight").click();
                        msg.preventDefault();
                        break;
                    default:
                        return;
                }
            }
        });
        var setNavIndex = function (inc, code) {
            var now = $scope.navIndex, next = now + inc;
            if (next < 0) {
                $rootScope.$broadcast("letterOutOfBoundsUp", code);
                next = 0;
            }
            if (next > ($scope.Letters.length - 1)) {
                $rootScope.$broadcast("letterOutOfBoundsDown", code);

            }
            $scope.navIndex = next;
            if ($(".navbar ul .highlight").length === 1) {
                var top = $(".navbar ul .highlight").position().top - 80;
                window.scrollTo(0, top);
            }
            //$scope.$apply();
        };
    }]);
