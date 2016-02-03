<?php

session_start();

// redirect to intro page if it's a new session
if (!file_exists("../logs/".session_id().".csv")) {
	header("Location: http://uclab.fh-potsdam.de/fw4beta/");
	die();
}

include "viz.html";

?>