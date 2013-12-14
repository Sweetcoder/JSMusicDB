jsmusicdb.controller('SetupController', ['$scope', '$rootScope', '$http',
    function ($scope, $rootScope, $http) {
        "use strict";
        window.document.title = 'JSMusicDB - Setup';
        if (window._gaq) {
            _gaq.push(['_trackPageview', '/setup']);
        }
        var path = location.pathname;
        if (path.indexOf("index.html") !== -1) {
            path = path.substring(0, path.indexOf("index.html"));
        }
        $scope.data = {
            url: location.protocol + '//' + location.host,
            musiclocation: path + 'music.json',
            incrementlocation: path + 'increment.json',
            navigation: 0
        };

        $scope.$on("save", function () {
            localStorage.setItem("wizardData", JSON.stringify($scope.data));
            $rootScope.wizardData = $scope.data;
        });
        $scope.$on("skip", function () {
            localStorage.setItem("wizardData", "{}");
            $rootScope.wizardData = {};
        });

        if (localStorage.getItem("wizardData")) {
            $rootScope.wizardData = JSON.parse(localStorage.getItem("wizardData"));
            $("#setup-wizard").hide();
        }
        ;
    }]);

jsmusicdb.directive('wizard', function ($rootScope) {
    var rootScope = $rootScope;
    return {
        restrict: 'E',
        transclude: true,

        scope: {
            onBeforeStepChange: '&',
            onStepChanging: '&',
            onAfterStepChange: '&'
        },

        templateUrl: 'wizard.html',

        replace: true,

        link: function (scope) {
            scope.currentStepIndex = 0;
            scope.steps[scope.currentStepIndex].currentStep = true;
        },

        controller: function ($scope) {
            $scope.steps = [];

            this.registerStep = function (step) {
                $scope.steps.push(step);
            };

            var toggleSteps = function (showIndex) {
                var event = {
                    event: {
                        fromStep: $scope.currentStepIndex,
                        toStep: showIndex
                    }
                };

                if ($scope.onBeforeStepChange) {
                    $scope.onBeforeStepChange(event);
                }
                $scope.steps[$scope.currentStepIndex].currentStep = false;

                if ($scope.onStepChanging) {
                    $scope.onStepChanging(event);
                }
                $scope.currentStepIndex = showIndex;

                $scope.steps[$scope.currentStepIndex].currentStep = true;
                if ($scope.onAfterStepChange) {
                    $scope.onAfterStepChange(event);
                }
            };
            $scope.showNextStep = function () {
                toggleSteps($scope.currentStepIndex + 1);
            };

            $scope.showPreviousStep = function () {
                toggleSteps($scope.currentStepIndex - 1);
            };

            $scope.hasNext = function () {
                return $scope.currentStepIndex < ($scope.steps.length - 1);
            };

            $scope.hasPrevious = function () {
                return $scope.currentStepIndex > 0;
            };

            $scope.save = function () {
                $scope.$emit("save");
                $("#setup-wizard").hide();
            };
            $scope.skip = function () {
                $scope.$emit("skip");
                $("#setup-wizard").hide();
            };
        }
    };
});

jsmusicdb.directive('step', function () {

    return {
        require: "^wizard",
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        template: '<div class="step" ng-show="currentStep"><h2>{{title}}</h2> <div ng-transclude></div> </div>',
        replace: true,

        link: function (scope, element, attrs, wizardController) {
            wizardController.registerStep(scope);
        }
    };

});
