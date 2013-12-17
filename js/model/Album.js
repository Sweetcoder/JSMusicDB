jsmusicdb.Album = function(node) {
    'use strict';
	var that = this;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.Album = node.Album;
	that.Jaar = (node.Jaar !== 'null') ? node.Jaar : null;
	that.Artiest = node.Artiest;
	that.tracks = [];
	that.url = 'http://ws.audioscrobbler.com/2.0/';
	that.data = {
		method : 'album.getinfo',
		api_key : '956c1818ded606576d6941de5ff793a5',
		artist : node.Artiest,
		album: node.Album,
		format : 'json',
		autoCorrect : true
	};
	that.inLocalDevice = false;
	that.isVisible = true;
	that.albumURL = function () {
		return "/letter/" + getFirstLetter(node.Artiest) + "/artist/" + node.Artiest + "/album/" + node.Album;
	};
	function getFirstLetter(name) {'use strict';
		name = stripThe(name);
		var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'], firstLetter = name.charAt(0);
		if ($.inArray(firstLetter, specialChars) > -1) {
			firstLetter = "1";
		}
		return "" + firstLetter;
	}
	function stripThe(name) {'use strict';
		name = $.trim(name.toUpperCase());
		name = (name.indexOf("THE ") === 0) ? name.substring(4) : name;
		return name;
	}
};