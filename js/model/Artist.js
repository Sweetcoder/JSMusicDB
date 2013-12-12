jsmusicdb.Artist = function(node) {
    "use strict";
	var that = this;
	that.Naam = node.Naam;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.albums = [];
	that.albumsLocal = [];
	that.url = 'http://ws.audioscrobbler.com/2.0/';
	that.data = {
		method : 'artist.getinfo',
		api_key : '956c1818ded606576d6941de5ff793a5',
		artist : node.Naam,
		format : 'json',
		autoCorrect : true
	};
	that.inLocalDevice = false;
	that.isVisible = true;
	that.artistURL = function () {
		return "/letter/" + getFirstLetter(node.Naam) + "/artist/" + node.Naam; 
	};
	
	function getFirstLetter(name) {"use strict";
		name = stripThe(name);
		var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'], firstLetter = name.charAt(0);
		if ($.inArray(firstLetter, specialChars) > -1) {
			firstLetter = "1";
		}
		return "" + firstLetter;
	}
	
	function stripThe(name) {"use strict";
		name = $.trim(name.toUpperCase());
		name = (name.indexOf("THE ") === 0) ? name.substring(4) : name;
		return name;
	}
};