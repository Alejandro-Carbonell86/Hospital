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
        $stmt = $conn->query('SELECT * FROM traslados ORDER BY created_at DESC');
        $traslados = $stmt->fetchAll();
        response(['success' => true, 'data' => $traslados]);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !is_array($data)) {
        response(['success' => false, 'message' => 'Datos inválidos.'], 400);
    }

    if ($method === 'POST') {
        $stmt = $conn->prepare('INSERT INTO traslados (paciente, chofer, copiloto, origen, destino, hora_salida, hora_llegada, notas, estado, created_at, updated_at) VALUES (:paciente, :chofer, :copiloto, :origen, :destino, :hora_salida, :hora_llegada, :notas, :estado, NOW(), NOW())');
        $stmt->execute([
            'paciente' => $data['paciente'] ?? '',
            'chofer' => $data['chofer'] ?? '',
            'copiloto' => $data['copiloto'] ?? '',
            'origen' => $data['origen'] ?? '',
            'destino' => $data['destino'] ?? '',
            'hora_salida' => $data['hora_salida'] ?? null,
            'hora_llegada' => $data['hora_llegada'] ?? null,
            'notas' => $data['notas'] ?? null,
            'estado' => 'pendiente',
        ]);
        response(['success' => true, 'message' => 'Traslado registrado.', 'id' => $conn->lastInsertId()]);
    }

    if ($method === 'PUT') {
        if (empty($data['id'])) {
            response(['success' => false, 'message' => 'ID de traslado requerido.'], 400);
        }
        $stmt = $conn->prepare('UPDATE traslados SET paciente = :paciente, chofer = :chofer, copiloto = :copiloto, origen = :origen, destino = :destino, hora_salida = :hora_salida, hora_llegada = :hora_llegada, notas = :notas, estado = :estado, updated_at = NOW() WHERE id = :id');
        $stmt->execute([
            'paciente' => $data['paciente'] ?? '',
            'chofer' => $data['chofer'] ?? '',
            'copiloto' => $data['copiloto'] ?? '',
            'origen' => $data['origen'] ?? '',
            'destino' => $data['destino'] ?? '',
            'hora_salida' => $data['hora_salida'] ?? null,
            'hora_llegada' => $data['hora_llegada'] ?? null,
            'notas' => $data['notas'] ?? null,
            'estado' => $data['estado'] ?? 'pendiente',
            'id' => $data['id'],
        ]);
        response(['success' => true, 'message' => 'Traslado actualizado.']);
    }

    if ($method === 'DELETE') {
        if (empty($data['id'])) {
            response(['success' => false, 'message' => 'ID de traslado requerido.'], 400);
        }
        $stmt = $conn->prepare('DELETE FROM traslados WHERE id = :id');
        $stmt->execute(['id' => $data['id']]);
        response(['success' => true, 'message' => 'Traslado eliminado.']);
    }

    response(['success' => false, 'message' => 'Método no permitido.'], 405);
} catch (PDOException $exception) {
    response(['success' => false, 'message' => 'Error de base de datos.'], 500);
} catch (Throwable $exception) {
    response(['success' => false, 'message' => 'Error del servidor.'], 500);
}
