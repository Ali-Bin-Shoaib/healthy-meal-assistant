<?php
// $api_key = 'wnUTg2RtfTVdGjNcFfrWrA==owWYtXjy8kU6meRD';
//q=breakfast&mealType=Lunch
// $api_url = 'https://api.api-ninjas.com/v1/nutrition?query=';
$api_url = 'https://api.edamam.com/api/recipes/v2?type=public';
$app_id = '&app_id=6f910b47';
$app_key = '&app_key=bdc8725b2e30f6fbc5dfebe2cde4a04b';
$apiInfo = [
    'app_id' => '6f910b47',
    'app_key' => 'bdc8725b2e30f6fbc5dfebe2cde4a04b',
    'q' => '',
    'mealType' => ''
];


// $options = [
//     'http' => [
//         'method' => 'GET',
//         // 'header' => 'Content-type: application/x-www-form-urlencoded' . "\r\n" .
//         'X-Api-Key: ' . $api_key // Add your API key
//     ],
// ];
// $context = stream_context_create($options);
$method = $_SERVER['REQUEST_METHOD'];
$mealItems = '';
$requestUrl = '';


if ($method === 'POST' && isset($_POST['meal-items'])) {
    $mealItems = $_POST['meal-items'] ?? '';
    $mealItems = str_replace(' ', '%20', $mealItems);
    $queryString = http_build_query($apiInfo);
    $requestUrl = $api_url . $queryString;
}

if (!empty($requestUrl)) {
    // Fetch data from the API
    $response = file_get_contents($requestUrl, false, $context);

    // Check if the request was successful
    if ($response === false) {
        die('Error occurred while fetching data from the API');
    }

    // Decode JSON response (assuming the API returns JSON)
    $data = json_decode($response, true);

    // Check if JSON decoding was successful
    if ($data === null) {
        die('Error decoding JSON data');
    }

    // Now $data contains the data from the API, and you can use it as needed

    // Example: Print the data
    echo json_encode($data);
}
