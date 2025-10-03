<?php
// API Simple compatible con PHP 5.4
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuración de base de datos
$host = 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com';
$dbname = 'sprint_voting';
$username = 'admin';
$password = 'VotingForm2025!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Database connection failed'));
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'submit') {
    // Guardar voto
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input['email'] || !$input['totalHours'] || !$input['selectedQuestions']) {
        http_response_code(400);
        echo json_encode(array('success' => false, 'error' => 'Faltan campos requeridos'));
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO votes_simple (email, total_horas, preguntas_seleccionadas) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute(array(
            $input['email'],
            $input['totalHours'],
            $input['selectedQuestions']
        ));
        
        echo json_encode(array(
            'success' => true, 
            'message' => 'Voto guardado correctamente',
            'id' => $pdo->lastInsertId()
        ));
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array('success' => false, 'error' => 'Error al guardar: ' . $e->getMessage()));
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'results') {
    // Obtener resultados
    try {
        $stmt = $pdo->query("
            SELECT email, fecha_envio, total_horas, preguntas_seleccionadas 
            FROM votes_simple 
            ORDER BY fecha_envio DESC
        ");
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(array(
            'success' => true,
            'data' => $results,
            'count' => count($results)
        ));
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array('success' => false, 'error' => 'Error al obtener resultados: ' . $e->getMessage()));
    }
    
} else {
    http_response_code(404);
    echo json_encode(array('success' => false, 'error' => 'Endpoint no válido'));
}
?>
