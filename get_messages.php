<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$filename = 'messages.json';
$lastCheck = $_GET['since'] ?? '1970-01-01 00:00:00';

if (file_exists($filename)) {
    $messages = json_decode(file_get_contents($filename), true) ?: [];
    
    $newMessages = array_filter($messages, function($msg) use ($lastCheck) {
        return ($msg['received_at'] ?? '') > $lastCheck;
    });
    
    echo json_encode(['messages' => array_values($newMessages)]);
} else {
    echo json_encode(['messages' => []]);
}
?>