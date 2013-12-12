// bootstrap cordova before angular

window.fileCache = [];
window.jpgCache = [];
window.jsonCache = null;
window.localJSON = null;

document.addEventListener('deviceready', function() {
	"use strict";
	var bootstrapped = false;
	// cordova is ready, do cordova specific stuff
	
	
	// scan local stored mp3 files, based on the MediaScannerService (blazingly fast!)
	mp3scan.createEvent(function (json) {
		window.localJSON = json;
	}, function (e) {
		console.log("error: " + e);
	});
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fileFail);
	
	function onFileSystemSuccess(fileSystem) {
		var sdcard = fileSystem.root;
		var directoryReader = sdcard.createReader();
		directoryReader.readEntries(success, fileFail);
		$("#loadingType").html("Scanning local system");
	};

	function success(entries) {
		var i, hasFolder = false;
		for ( i = 0; i < entries.length; i++) {
			if (entries[i].name === "org.arielext.mobilemusicdb") {
				// cache folder found!
				hasFolder = true;
				var reader = entries[i].createReader();
				reader.readEntries(cacheSuccess, fileFail);
			}
		}
		if (!hasFolder) {
			console.log("go init, no cache folder cordova");
			initAngular();
		}
	};

	function cacheSuccess(entries) {
		var hasCache = false;
		for (var i = 0; i < entries.length; i++) {
			if (entries[i].name === 'music.json') {
				entries[i].file(gotFile, fileFail);
				hasCache = true;
			} else if (entries[i].name.indexOf(".jpg") !== -1) {
				var c = entries[i].name;
				c = c.substring(0, c.indexOf(".jpg"));
				c = c.replace(/ /g, '');
				window.jpgCache[c] = entries[i].fullPath;
				// console.log("jpg cache for " + entries[i].name + ": " + window.jpgCache[entries[i].name]);
			}
		}
		if (!hasCache) {
			// no cahced music file
			console.log("no cached music.json file");
			initAngular();
		}
	}

	function gotFile(file) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			var json = JSON.parse(evt.target.result);
			window.jsonCache = json;
			console.log("Got a cached music.json file");
			initAngular();
		};
		reader.readAsText(file);
	}

	function fileFail(error) {
		console.log(error.code + ", " + error.message);
	};

	function initAngular() {
		if (!bootstrapped) {
			bootstrapped = true;
			console.log('init angular');
			angular.bootstrap(document, ['jsmusicdb']);
		}
	}
});

// debug
$(function() {
	//console.log("DEBUG: trigger cordova");
	//var event = new Event('deviceready');
	//document.dispatchEvent(event);
	if (!window.cordova) {
		console.log("no cordova");
		angular.bootstrap(document, ['jsmusicdb']);
	}
});

