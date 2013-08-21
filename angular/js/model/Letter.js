function Letter(node) {
	var that = this;
	that.letter = getFirstLetter(node.Naam);
	that.artists = [];
	that.active = false;
};

function getFirstLetter(name) {
	var specialChars = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], firstLetter = name.charAt(0).toUpperCase();
	if ($.inArray(firstLetter, specialChars) > -1) {
		firstLetter = "#";
	}
	return firstLetter;
}
