<?php

session_start();

// create empty log file or add nothing
$file = fopen("./logs/" . session_id() . ".csv", "a+");
fwrite($file, "");

include "page.html";

?>