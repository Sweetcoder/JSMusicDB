<?
// TODO: set base url and port in the settings of the player.
$content = file_get_contents('http://www.arielext.org:5000/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account=' . $_GET["account"] . '&passwd=' . $_GET["passwd"] . '&format=sid');
if( $content !== FALSE ) {
  header('Content-type: application/json');
	// print the SID so the player can store it as the session token
  echo $content;
}
?>