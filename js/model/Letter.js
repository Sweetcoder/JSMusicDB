jsmusicdb.Letter = function(node) {
    "use strict";

    function getFirstLetter(name) {
    	if (name.toUpperCase().indexOf("THE ") === 0) {
    		name = name.substring(4);
    	}
        var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = name.charAt(0).toUpperCase();
        if ($.inArray(firstLetter, specialChars) > -1) {
            firstLetter = "1";
        }
        return firstLetter;
    }

    var that = this;
    that.letter = getFirstLetter(node.Naam);
    that.artists = [];
    that.active = false;
};
