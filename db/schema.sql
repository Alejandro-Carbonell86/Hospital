-- Esquema de base de datos para el proyecto del Hospital de Clínicas

CREATE DATABASE IF NOT EXISTS hospital_clinicas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE hospital_clinicas;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(150) NULL,
    email VARCHAR(150) NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patente VARCHAR(50) NOT NULL UNIQUE,
    marca VARCHAR(100) NULL,
    modelo VARCHAR(100) NULL,
    capacidad INT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS choferes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    dni VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(50) NULL,
    licencia VARCHAR(100) NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    distancia_km DECIMAL(10,2) NULL,
    tiempo_estimado VARCHAR(100) NULL,
    creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS traslados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente VARCHAR(255) NOT NULL,
    chofer VARCHAR(150) NOT NULL,
    copiloto VARCHAR(150) NULL,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    hora_salida DATETIME NULL,
    hora_llegada DATETIME NULL,
    notas TEXT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    contenido LONGTEXT NOT NULL,
    qr_data TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS encuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_paciente VARCHAR(255) NULL,
    satisfacción INT NOT NULL,
    comentarios TEXT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patologias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NULL,
    stock INT NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registros_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(255) NOT NULL,
    detalle TEXT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    latitud DECIMAL(10,7) NULL,
    longitud DECIMAL(10,7) NULL,
    tipo VARCHAR(100) NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    rol_id INT NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id),
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_backup DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT NULL
);

INSERT INTO roles (nombre, descripcion) VALUES
('administrativo', 'Usuario con acceso a la gestión de documentos y traslados'),
('chofer', 'Conductor de ambulancia con acceso restringido'),
('supervisor', 'Encargado de supervisar estado de traslados');

INSERT INTO users (username, password_hash, role, nombre_completo, email) VALUES 
('admin', '$2y$10$YMyxczm1q4QbM6MIkW2OyO.xS8eRoZKCVnCkKkWfLnn.TW4MX9NO2', 'administrativo', 'Administrador del Hospital', 'admin@hospital.local');

INSERT INTO vehiculos (patente, marca, modelo, capacidad) VALUES
('ABC123', 'Renault', 'Master', 4),
('DEF456', 'Mercedes-Benz', 'Sprinter', 6);

INSERT INTO choferes (nombre, dni, telefono, licencia) VALUES
('Juan Pérez', '12345678', '099123456', 'B1'),
('María Gómez', '87654321', '099654321', 'B1');

INSERT INTO rutas (origen, destino, distancia_km, tiempo_estimado) VALUES
('Hospital de Clínicas', 'Centro de Montevideo', 8.5, '25 min'),
('Hospital de Clínicas', 'Sanatorio Mautone', 5.4, '18 min');

INSERT INTO ubicaciones (nombre, latitud, longitud, tipo) VALUES
('Hospital de Clínicas', -34.9061, -56.1990, 'hospital'),
('Centro de Montevideo', -34.9085, -56.1972, 'zona');

INSERT INTO backups (nombre_archivo, descripcion) VALUES
('backup_inicial.sql', 'Backup inicial de la estructura de base de datos');
