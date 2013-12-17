jsmusicdb.controller('LetterController', ['$scope', '$rootScope', 'switchView', '$window', '$log',
    function ($scope, $rootScope, switchView, $window, $log) {
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
