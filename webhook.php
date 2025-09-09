<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data) {
        $data['received_at'] = date('Y-m-d H:i:s');
        
        $filename = 'messages.json';
        $messages = [];
        
        if (file_exists($filename)) {
            $messages = json_decode(file_get_contents($filename), true) ?: [];
        }
        
        $messages[] = $data;
        
        if (count($messages) > 1000) {
            $messages = array_slice($messages, -1000);
        }
        
        file_put_contents($filename, json_encode($messages));
        
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Only POST allowed']);
}
?>