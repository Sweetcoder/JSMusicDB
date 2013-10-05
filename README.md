JSMusicDB
=========

JSMusicDB is a webstandards based music library/music player that can run on any website; using a direct connection to the source mp3 files or on a Synology NAS; in that case a php based proxy is used.
Any type of scanning script can be used as long as the output is a JSON file with a specific layout. One of the scripts capable of delivering the correct format is https://github.com/lucienimmink/scanner.py

### Features
- Artist (sortable by Alphabet or amount of albums) overview per letter
- Album (Sortable by Release date or Alphabet) overview per Aritst; with artist information pulled from last.fm
- Track view per Album
- Playlist support; you can add/remove tracks and/or albums
- Optionally host and connect to a NAS (only synology support for now)
- Scrobble tracks on last.fm / love tracks on last.fm
- quickly navigate and switch between views

Requirements
------------
- Any type of hosting capable of delivering html/css and JS files
- A PHP based hosting is the synology connector is used

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