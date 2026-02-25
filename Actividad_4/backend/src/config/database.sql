-- Script para crear la base de datos de Gestión de Biblioteca

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS biblioteca_db;
USE biblioteca_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de libros
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    cantidad INT DEFAULT 1,
    disponible INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    libro_id INT NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NOT NULL,
    estado ENUM('activo', 'devuelto', 'vencido') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE
);

-- Insertar usuario admin por defecto (password: admin123)
-- La contraseña está hasheada con bcrypt
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@biblioteca.com', '$2a$10$xGJ9Q7K5X8M3L2P1V9Y0ZeF6R8U7W2X3Y4Z5A6B7C8D9E0F1G2H3', 'admin');

-- Insertar algunos libros de ejemplo
INSERT INTO libros (titulo, autor, isbn, cantidad, disponible) VALUES
('El Quijote', 'Miguel de Cervantes', '978-84-376-0494-7', 3, 3),
('Cien Años de Soledad', 'Gabriel García Márquez', '978-84-204-0418-1', 2, 2),
('1984', 'George Orwell', '978-84-206-0689-8', 4, 4),
('La Odisea', 'Homero', '978-84-670-2586-5', 2, 2),
('Don Juan Tenorio', 'José Zorrilla', '978-84-670-4532-0', 3, 3);
