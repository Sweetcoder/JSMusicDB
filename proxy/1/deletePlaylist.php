<?
$opts = array('http' => array('method' => "GET", 'header' => $requestHeader));

$url = $_GET["server"] . '/webman/3rdparty/AudioStation/webUI/audio_playlist.cgi';
$postOptions = "action=delete&playlists=".$_GET["playlist"]."&library=shared";

$options = array(
	'http' => array(
		'header'  => "Content-type: application/x-www-form-urlencoded\r\n" . "Cookie: id=" . $_GET["sid"] . "\r\n" . "X-SYNO-TOKEN:" . $_GET["sid"] . "\r\n",
        'method'  => 'POST',
        'content' => $postOptions
	),
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

header('Content-type: application/json');
echo $result;


?>