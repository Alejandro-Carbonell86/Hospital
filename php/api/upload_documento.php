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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    response(['success' => false, 'message' => 'Método no permitido.'], 405);
}

if (!isset($_FILES['documento'])) {
    response(['success' => false, 'message' => 'No se recibió ningún archivo.'], 400);
}

$file = $_FILES['documento'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    response(['success' => false, 'message' => 'Error al subir el archivo.'], 400);
}

if (mime_content_type($file['tmp_name']) !== 'application/pdf') {
    response(['success' => false, 'message' => 'Solo se aceptan archivos PDF.'], 400);
}

$token = 'DOC-' . bin2hex(random_bytes(8));
$nombre = basename($file['name']);
$destinoCarpeta = __DIR__ . '/../../data/documents';
$nombreArchivo = sprintf('%s-%s.pdf', time(), preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $nombre));
$rutaDestino = $destinoCarpeta . '/' . $nombreArchivo;

if (!move_uploaded_file($file['tmp_name'], $rutaDestino)) {
    response(['success' => false, 'message' => 'No se pudo guardar el archivo en el servidor.'], 500);
}

$contenido = base64_encode(file_get_contents($rutaDestino));
$qrData = json_encode(['token' => $token, 'nombre' => $nombre, 'ruta' => $nombreArchivo]);

try {
    $db = new Database($config);
    $conn = $db->getConnection();
    $stmt = $conn->prepare('INSERT INTO documentos (nombre, token, contenido, qr_data, created_at, updated_at) VALUES (:nombre, :token, :contenido, :qr_data, NOW(), NOW())');
    $stmt->execute([
        'nombre' => $nombre,
        'token' => $token,
        'contenido' => $contenido,
        'qr_data' => $qrData,
    ]);

    response(['success' => true, 'message' => 'Documento subido correctamente.', 'data' => ['token' => $token, 'nombre' => $nombre, 'qr_data' => $qrData]]);
} catch (PDOException $exception) {
    response(['success' => false, 'message' => 'Error de base de datos.'], 500);
} catch (Throwable $exception) {
    response(['success' => false, 'message' => 'Error del servidor.'], 500);
}
