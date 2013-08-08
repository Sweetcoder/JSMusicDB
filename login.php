<?
$content = file_get_contents('http://www.arielext.org:5000/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=login&account=lucien&passwd=Factory001!');
if( $content !== FALSE ) {
  // add your JS into $content
  echo $content;
}
?>