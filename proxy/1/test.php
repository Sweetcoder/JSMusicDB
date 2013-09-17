<?

// replace certain characters in a way the streaming script can still find the file
$path = str_replace(array(" ", "+", "&", "#"), array("%20", "%2B", "%26", "%23"), $_GET["path"]);
// TODO: set base url and port in the settings of the player.
$url = $_GET["server"] . '/webman/3rdparty/AudioStation/webUI/audio_stream.cgi/0.mp3?action=streaming&songpath=' . $path;

// open a handle for the response of the streaming script
print($path + '<br />');
print($url);
?>