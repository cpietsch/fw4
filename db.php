<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define ("DB", "uclsql2");
define ("PW", "FpmbCD2bSlBCkhCaI9mhgut");

session_start();


function hello(){
	$sid = session_id();
	$db = new mysqli('localhost', DB, PW, DB);
	$db->query("INSERT IGNORE INTO sessions (sessionid, modified) VALUES ('$sid', now())");
	$db->close();
}

function recognized(){
	$sid = session_id();
	$out = 1;
	$db = new mysqli('localhost', DB, PW, DB);

	if ($res = $db->query("SELECT 1 FROM sessions WHERE sessionid = '$sid'")) {
	  $out = $res->num_rows;
	  $res->close();
	}

	$db->close();
	return $out;
}

function logger(){
	$sid = session_id();
	$payload = file_get_contents('php://input');
	$data = json_decode($payload);
	if(count($data) == 0) die;

	$db = new mysqli('localhost', DB, PW, DB);
	
	foreach($data as $entry){
		$payload = $db->real_escape_string(json_encode($entry));
		// print_r($payload);
		$db->query("INSERT INTO logs (sessionid, payload,modified) VALUES ('$sid', '$payload', now())");

	}

	$db->close();
}

//logger();

// Testing...
// echo recognized();
// echo hello();
// echo recognized();





?>