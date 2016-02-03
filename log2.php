<?

// TODO: an fw4 anpassen, noch von DDB vis

session_start();
$id = session_id();
$file = fopen("./logs/" . $id . ".csv", "a+");

$request_body = file_get_contents('php://input');
print_r($request_body);

$data = json_decode($request_body);

fwrite($file, $request_body);

?>