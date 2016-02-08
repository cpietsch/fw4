<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FW4 Feedback</title>
<style type="text/css">
	body, html {
		border: 0;
		margin: 0;
		overflow: hidden;
		widows: 100%;
		height: 100%;
	}
	iframe {
		border: none;
		width: 100%;
		height: 100%;
	}
</style>
</head>

<body>
	<iframe src="<?php
	$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
	$url = "https://fw4.typeform.com/to/";
	$ext = "?cid=". session_id();

	if($lang == "de"){
		$url .= "ZIIgIe";
	} else {
		$url .= "ZqM3Jo";
	}

	echo $url . $ext;

	?>"></iframe>
</body>
