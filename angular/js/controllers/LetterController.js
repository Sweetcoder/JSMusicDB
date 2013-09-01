function LetterController($scope, $rootScope, switchView) {
    "use strict";
    $scope.Letters = $rootScope.letterCache;

    // set the artistsInLetter var to reflect the artists in the current active letter
    $scope.getLetter = function(letter) {
        $rootScope.activeLetter.active = false;
        $rootScope.activeLetter = letter;
        $rootScope.activeLetter.active = true;
        switchView.letter(letter);
        $("#artistOverviewView").removeClass("child").removeClass("parent").addClass("view");
        $("#artistView").addClass("child").removeClass("parent").removeClass("view");
        $("#albumView").addClass("child").removeClass("parent").removeClass("view");
        $(".snap-content").get(0).scrollTop = 0;
    };
}