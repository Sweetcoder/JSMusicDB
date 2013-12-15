jsmusicdb.controller('AboutController', ['$scope', '$rootScope', '$http', '$log',
    function ($scope, $rootScope, $http, $log) {
        "use strict";
        window.document.title = 'JSMusicDB - About';
        if (window._gaq) {
            _gaq.push(['_trackPageview', '/about']);
        }
    }]);