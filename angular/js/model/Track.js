jsmusicdb.Track = function(node) {
    "use strict";
    var that = this;
    that.File = node.Naam;
    that.Artiest = node.Artiest;
    that.Album = node.Album;
    that.Omvang = node.MB;
    that.Tijd = node["U:M:S"];
    that.Kwaliteit = node["Kbit/s"];
    that.Titel = node.Titel;
    that.Nummer = Number(node.Track);
    that.path = node.Pad;
    that.Disc = Number(node.Disk);
    that.AlbumNode = null;
    that.isPlaying = false;
}; 