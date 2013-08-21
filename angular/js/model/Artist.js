function Artist(node) {
	var that = this;
	that.Naam = node.Naam;
	that.Omvang = node.MB;
	that.Tijd = node["U:M:S"];
	that.Kwaliteit = node["Kbit/s"];
	that.albums = [];
	that.url = 'http://ws.audioscrobbler.com/2.0/';
	that.data = {
		method : 'artist.getinfo',
		api_key : '956c1818ded606576d6941de5ff793a5',
		artist : node.Naam,
		format : 'json',
		autoCorrect : true
	}
};