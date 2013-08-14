<?

// proxy the range header and cookie to the synology streaming script
$requestHeader = "Cookie: id=".$_GET["sid"]."\r\n";
foreach (getallheaders() as $name => $value) {
    echo "$name: $value\n";
	if ($name == "Range") {
		$requestHeader = $requestHeader . "Range: " . $offset . "-\r\n";
	}
}


$opts = array(
	'http' =>array(
		'method'=>"GET",
		'header'=>	$requestHeader
	)
);

// set a default context; for the header request to get the file size
stream_context_set_default(array(
	'http' =>array(
		'header'=>	"Cookie: id=".$_GET["sid"]."\r\n"
	)
));

// replace certain characters in a way the streaming script can still find the file
$path = str_replace(array(" ", "+", "&"), array("%20", "%2B", "%26"), $_GET["path"]);
// TODO: set base url and port in the settings of the player.
$url = $_GET["server"] . '/webman/3rdparty/AudioStation/webUI/audio_stream.cgi/0.mp3?action=streaming&songpath=' . $path;
$headers = get_headers($url, 1);
$content_length = $headers["Content-Length"];
$context = stream_context_create($opts);

// open a handle for the response of the streaming script
$handle = fopen($url, "r", false, $context);

// add headers
foreach($http_response_header as $h) {
	header($h);
	header('Content-type: audio/mpeg');
	header('Keep-Alive: timeout=5, max=100');
	header('Content-length: '.$content_length);
	header('X-Pad: avoid browser bug');
    header('Cache-Control: no-cache');
}
$start_point = 0;
$end_point = $content_length -1;
// partial download
if(isset($_SERVER['HTTP_RANGE']) && !empty($_SERVER['HTTP_RANGE'])) {
    //download range
    $http_range = explode('-', substr($_SERVER['HTTP_RANGE'], strlen('bytes=')));
    $start_point = $http_range[0];
    if($http_range[1] > 0)
        $end_point = $http_range[1];

    //headers
    header('HTTP/1.0 206 Partial Content');
    header('Status: 206 Partial Content');
    header('Accept-Ranges: bytes');
    header('Content-Range: bytes '.$_SERVER['HTTP_RANGE'].'/'.$content_length);
    header('Content-Length: '.($end_point - $start_point + 1));
}
//jump ahead in file to start
if($start_point > 0)
    fseek($handle, $start_point);
//serve data chunk
$download_bytes_position = $start_point;
while(!feof($handle) && $download_bytes_position <= $end_point) {
	//mark download as aborted if connection has been closed
    if(connection_aborted() || connection_status() != 0) {
    	throw new Exception("Connection aborted");
    }
	// calculate next chunk size
	$download_data_chunk_size = 1048000;
    if($download_bytes_position + $download_data_chunk_size > $end_point + 1)
        $download_data_chunk_size = $end_point - $download_bytes_position + 1;

    //get data chunk
    $download_data_chunk = fread($handle, $download_data_chunk_size);
    if(!$download_data_chunk)
        throw new Exception('Could not read file');

    //output it
    print($download_data_chunk);
    flush();

    //increment download point
    $download_bytes_position += $download_data_chunk_size;
}
while (!feof($handle)) {
	$buffer = fread($handle, 4096);
	echo $buffer;
	flush();
}
fclose($handle);

?>