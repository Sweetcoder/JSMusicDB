jsmusicdb.Track = function(node) {
    'use strict';
    var that = this;
    that.File = node.Naam;
    that.Artiest = node.Artiest;
    that.Album = node.Album;
    that.Omvang = node.MB;
    that.Tijd = node.Duur;
    that.Kwaliteit = node["Kbit/s"];
    that.Titel = node.Titel;
    that.Nummer = Number(node.Track || '');
    that.path = node.Pad;
    that.Disc = Number(node.Disk);
    that.AlbumNode = null;
    that.isPlaying = false;
    that.filename = function () {
    	var name = that.path.split('/');
    	return name[name.length-1];
    };
    that.inLocalDevice = false;
    that.isVisible = true;
    that.seconds = function () {
    	var a = that.Tijd.split(":");
    	return Number(a[0]) * 60 + Number(a[1]);
    };
}; 