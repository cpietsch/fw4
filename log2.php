<?

// TODO: an fw4 anpassen, noch von DDB vis

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
echo "<pre>";

$id = session_id();
print_r($id);
$request_body = file_get_contents('php://input');
$data = json_decode($request_body);
print_r($request_body);


file_put_contents("./logs/" . $id . ".csv", $id, FILE_APPEND | LOCK_EX);

// $file = fopen("./logs/" . $id . ".csv", "a+");
// fwrite($file, $data."\n");
// fclose($file);
// print_r($file);

// $inp = file_get_contents("./logs/" . $id . ".csv");
// $tempArray = json_decode($inp);
// array_push($tempArray, $data);
// $jsonData = json_encode($tempArray);
// file_put_contents("./logs/" . $id . ".csv", $jsonData);

?>