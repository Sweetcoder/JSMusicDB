var lastfm = {
	signtoken: function(api_key, method, token) {
		return hex_md5('api_key' + api_key + 'method' + method + 'token' + token + lastfm.secret);
	},
	signscrobble: function(artist,track, ts) {
		var method = "track.scrobble",
			sk = localStorage.getItem("key");
		return hex_md5('api_key' + lastfm.api_key + 'artist' + artist + 'method' + method + 'sk' + sk + 'timestamp' + ts + 'track' + track + lastfm.secret);
	},
	signplayinglove: function(artist,track, method) {
		var sk = localStorage.getItem("key");
		return hex_md5('api_key' + lastfm.api_key + 'artist' + artist + 'method' + method + 'sk' + sk + 'track' + track + lastfm.secret);
	},
	api_key : '956c1818ded606576d6941de5ff793a5',
	secret: '4d183e73f7578dee78557665e9be3acc'
}
