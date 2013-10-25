jsmusicdb.controller('LetterController', ['$scope', '$rootScope', 'switchView', '$window',
function($scope, $rootScope, switchView, $window) {"use strict";
	$scope.Letters = $rootScope.letterCache;

	// set the artistsInLetter var to reflect the artists in the current active letter
	$scope.getLetter = function(letter) {
		if ($scope.activeLetter) {
			$scope.activeLetter.active = false;
		}
		$scope.activeLetter = letter;
		$scope.activeLetter.active = true;
		$rootScope.activeLetter = letter;
		switchView.letter(letter);
		$("#artistOverviewView").removeClass("child").removeClass("parent").addClass("view");
		$("#artistView").addClass("child").removeClass("parent").removeClass("view");
		$("#albumView").addClass("child").removeClass("parent").removeClass("view");
		$(".snap-content").get(0).scrollTop = 0;
	};

	$scope.$on('routeLetterChange', function(e, l) {
		var digest = function(l) {
			if ($rootScope.letters.length !== 0) {
				var newLetter = $scope.Letters[l];
				if (!newLetter) {
					$.each($scope.Letters, function() {
						newLetter = this;
						return false;
					});
				}
				$scope.getLetter(newLetter);
			} else {
				setTimeout(function() {
					digest(l);
				}, 100);
			}
		};
		digest(l);
	});
	$scope.$on('keydown', function(msg, code) {
		if ((code >= 65 && code <= 90) || code === 49) {
			// user pressed a letter
			var letter = String.fromCharCode(code);
			$window.location.href = '#/letter/' + letter;
		}
	});
}]);
