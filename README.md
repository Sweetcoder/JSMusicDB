JSMusicDB
=========

JSMusicDB is a webstandards based music library/music player that can run on any website; using a direct connection to the source mp3 files or on a Synology NAS; in that case a php based proxy is used.
Any type of scanning script can be used as long as the output is a JSON file with a specific layout. One of the scripts capable of delivering the correct format is [scanner.py](https://github.com/lucienimmink/scanner.py)

### Features
- Artist (sortable by Alphabet or amount of albums) overview per letter
- Album (Sortable by Release date or Alphabet) overview per Aritst; with artist information pulled from last.fm
- Track view per Album
- Playlist support; you can add/remove tracks and/or albums
- Optionally host and connect to a NAS (only synology support for now)
- Scrobble tracks on last.fm / love tracks on last.fm
- quickly navigate and switch between views
- Device aware; all features are useable and optimized for desktops, tablets and phones!
- Incremental updates; see music add when you add it to the filesystem; a compatible backend is required.

Settings
--------
You can set a few settings now in JSMusicDB; in a file called settings.json in the root of the project.
```javascript
{
    "private": false,
    "incremental": true,
    "backend": {
        "serverType": "2",
        "serverURL": "http://127.0.0.1:2000"
    }
}
```
- private: set this to false if you use JSMusicDB on an internet connected server; private servers will log in a user automaticly
- incremental: use the incremental polling mechanism to auto update the collection
- backend
	- serverType: default servertype 0) no server, 1) synology server 2) node.js server
	- serverURL: the full path of the server; including any ports

Requirements
------------
- Any type of hosting capable of delivering html/css and JS files
- A PHP based hosting is the synology connector is used

Backend
-------
Since JSMusicDB is backend independent it's possible to create your own backend software in any language you like. Just make sure that the JSON is in the correct format; see the backend projects for more info.
- [Scanner.py](https://github.com/lucienimmink/scanner.py) A python based music scanner
- [node-mp3scan](https://github.com/lucienimmink/mp3scan) node.js based music scanner
- [node-mp3stream](https://github.com/lucienimmink/node-mp3stream) node.js based webserver with mp3 streaming capabilities
All these backends are 100% compatible with JSMusicDB.

Screenshot
----------

Desktop:

### Artist overview
![artistoverview](http://www.arielext.org/screenshots/artistoverview.PNG)
### Artist view
![artistview](http://www.arielext.org/screenshots/artistview.PNG)
### Album view
![albumview](http://www.arielext.org/screenshots/albumview.PNG)
### Player
![player](http://www.arielext.org/screenshots/player.PNG)
### menu
![menu](http://www.arielext.org/screenshots/menu.PNG)
### playlist
![playlist](http://www.arielext.org/screenshots/playlist.PNG)
### settings
![settings](http://www.arielext.org/screenshots/settings.PNG)
### about
![about](http://www.arielext.org/screenshots/about.PNG)