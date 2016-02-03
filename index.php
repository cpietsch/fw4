<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
// Warning: fopen(./logs/dkk0j09a153uskclafqs707ki6.csv): failed to open stream: Permission denied in /var/customers/webs/ucl/fw4beta/index.php on line 9 Warning: fwrite() expects parameter 1 to be resource, boolean given in /var/customers/webs/ucl/fw4beta/index.php on line 10
session_start();

// create empty log file or add nothing
$file = fopen("./logs/" . session_id() . ".csv", "a+");
fwrite($file, "");

include "page.html";

?>