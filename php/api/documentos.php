<?php

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/../config.php';
require_once __DIR__ . '/../models/Database.php';

session_start();

function response($data, int $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if (!isset($_SESSION['user'])) {
    response(['success' => false, 'message' => 'No autorizado.'], 401);
}

try {
    $db = new Database($config);
    $conn = $db->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (!empty($_GET['id'])) {
            $stmt = $conn->prepare('SELECT * FROM documentos WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $_GET['id']]);
            $documento = $stmt->fetch();
            if (!$documento) {
                response(['success' => false, 'message' => 'Documento no encontrado.'], 404);
            }
            response(['success' => true, 'data' => $documento]);
        }

        $stmt = $conn->query('SELECT id, nombre, token, created_at AS fecha FROM documentos ORDER BY created_at DESC');
        $documentos = $stmt->fetchAll();
        response(['success' => true, 'data' => $documentos]);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !is_array($data)) {
        response(['success' => false, 'message' => 'Datos inválidos.'], 400);
    }

    if ($method === 'POST') {
        $stmt = $conn->prepare('INSERT INTO documentos (nombre, token, contenido, qr_data, created_at, updated_at) VALUES (:nombre, :token, :contenido, :qr_data, NOW(), NOW())');
        $stmt->execute([
            'nombre' => $data['nombre'] ?? '',
            'token' => $data['token'] ?? '',
            'contenido' => $data['contenido'] ?? '',
            'qr_data' => $data['qr_data'] ?? '',
        ]);
        response(['success' => true, 'message' => 'Documento guardado.', 'id' => $conn->lastInsertId()]);
    }

    if ($method === 'PUT') {
        if (empty($data['id'])) {
            response(['success' => false, 'message' => 'ID de documento requerido.'], 400);
        }
        $stmt = $conn->prepare('UPDATE documentos SET nombre = :nombre, updated_at = NOW() WHERE id = :id');
        $stmt->execute([
            'nombre' => $data['nombre'] ?? '',
            'id' => $data['id'],
        ]);
        response(['success' => true, 'message' => 'Documento actualizado.']);
    }

    if ($method === 'DELETE') {
        if (empty($data['id'])) {
            response(['success' => false, 'message' => 'ID de documento requerido.'], 400);
        }
        $stmt = $conn->prepare('DELETE FROM documentos WHERE id = :id');
        $stmt->execute(['id' => $data['id']]);
        response(['success' => true, 'message' => 'Documento eliminado.']);
    }

    response(['success' => false, 'message' => 'Método no permitido.'], 405);
} catch (PDOException $exception) {
    response(['success' => false, 'message' => 'Error de base de datos.'], 500);
} catch (Throwable $exception) {
    response(['success' => false, 'message' => 'Error del servidor.'], 500);
}
