jsmusicdb.Album = function(node) {
    "use strict";
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
};