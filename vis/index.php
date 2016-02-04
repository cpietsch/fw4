<?php

include "../db.php";

//redirect to intro page if it's a new session
if (!recognized()) {
	header("Location: http://uclab.fh-potsdam.de/fw4beta/");
	die();
}

include "viz.html";

?>