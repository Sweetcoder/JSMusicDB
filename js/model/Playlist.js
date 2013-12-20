jsmusicdb.Playlist = function(node) {
    'use strict';
	var that = this;
	this.is_container = node.is_container;
	this.is_track = node.is_track;
	this.item_id = node.item_id;
	this.item_pid = node.item_pid;
	this.sequence = node.sequence;
	this.title = node.title; 
};