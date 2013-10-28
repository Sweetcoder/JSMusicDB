jsmusicdb.directive('noKeyTrap', function($rootScope) {
	var rootScope = $rootScope, inDestroy = false;
	// make rootScope available for all functions in this directive

	return function(scope) {
		inDestroy = false;
		rootScope.$watch(function() {
			return rootScope.listenLetters;
		}, function(n, o) {
			if (n && !inDestroy) {
				// override listener when this directive is active
				rootScope.listenLetters = false;
			}
		});
		scope.$on("$destroy", function() {
			inDestroy = true;
			rootScope.listenLetters = true;
		});
	};
});
