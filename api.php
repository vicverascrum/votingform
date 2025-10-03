<?php
// Simple PHP API for VotingForm with RDS MySQL
// Deploy this to any web server (AWS EC2, shared hosting, etc.)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = 'your-rds-endpoint.amazonaws.com';
$dbname = 'sprint_voting';
$username = 'admin';
$password = 'VotingForm2025!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'submit') {
    handleSubmit($pdo);
} elseif ($method === 'GET' && $action === 'results') {
    getResults($pdo);
} elseif ($method === 'GET' && $action === 'stats') {
    getStats($pdo);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid endpoint']);
}

function handleSubmit($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input['email'] || !$input['selectedItems'] || !isset($input['totalHours'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Insert main result
        $stmt = $pdo->prepare("
            INSERT INTO voting_results 
            (email, selected_items, total_hours, capacity_percentage, sprint_number, ip_address) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['email'],
            json_encode($input['selectedItems']),
            $input['totalHours'],
            ($input['totalHours'] / 260) * 100,
            $input['sprintNumber'] ?? 24,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $votingId = $pdo->lastInsertId();
        
        // Insert individual selections
        $stmt = $pdo->prepare("
            INSERT INTO question_selections 
            (voting_result_id, question_id, question_title, estimated_hours, complexity, category) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($input['selectedItems'] as $item) {
            $stmt->execute([
                $votingId,
                $item['id'],
                $item['title'],
                $item['estimatedHours'] ?? null,
                $item['complexity'] ?? null,
                $item['category'] ?? null
            ]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'id' => $votingId]);
        
    } catch (Exception $e) {
        $pdo->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save: ' . $e->getMessage()]);
    }
}

function getResults($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                vr.email,
                vr.total_hours,
                vr.capacity_percentage,
                vr.submission_date,
                COUNT(qs.id) as items_selected,
                GROUP_CONCAT(qs.question_title SEPARATOR ', ') as selected_items_list
            FROM voting_results vr
            LEFT JOIN question_selections qs ON vr.id = qs.voting_result_id
            WHERE vr.sprint_number = 24
            GROUP BY vr.id
            ORDER BY vr.submission_date DESC
            LIMIT 100
        ");
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $results]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get results: ' . $e->getMessage()]);
    }
}

function getStats($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                COUNT(*) as total_submissions,
                AVG(total_hours) as avg_hours,
                MAX(total_hours) as max_hours,
                MIN(total_hours) as min_hours,
                AVG(capacity_percentage) as avg_capacity
            FROM voting_results 
            WHERE sprint_number = 24
        ");
        
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'stats' => $stats]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get stats: ' . $e->getMessage()]);
    }
}
?>
