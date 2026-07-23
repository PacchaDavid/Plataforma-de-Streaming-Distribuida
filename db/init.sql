-- ============================================================
-- Streaming Distribuido — Esquema de Base de Datos
-- MariaDB / Galera Cluster
-- ============================================================

CREATE DATABASE IF NOT EXISTS streaming_db;
USE streaming_db;

-- ============================================================
-- Tabla: usuarios (Microservicio de Usuarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL DEFAULT 'changeme',
    perfil      VARCHAR(50)  DEFAULT 'usuario',
    creado_en   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: contenido (Microservicio de Recomendaciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS contenido (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    genero          VARCHAR(50),
    tipo            ENUM('pelicula', 'serie', 'documental') DEFAULT 'pelicula',
    anio_lanzamiento INT,
    duracion_min    INT,
    rating          DECIMAL(3,1) DEFAULT 0.0,
    url_portada     VARCHAR(500) DEFAULT '',
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: recomendaciones (Microservicio de Recomendaciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS recomendaciones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    contenido_id    INT NOT NULL,
    motivo          VARCHAR(255) DEFAULT '',
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contenido_id) REFERENCES contenido(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: suscripciones (Microservicio de Pagos)
-- ============================================================
CREATE TABLE IF NOT EXISTS suscripciones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    plan            ENUM('basico', 'estandar', 'premium') DEFAULT 'basico',
    estado          ENUM('activa', 'cancelada', 'vencida') DEFAULT 'activa',
    fecha_inicio    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin       TIMESTAMP NULL,
    monto           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: pagos (Microservicio de Pagos)
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    suscripcion_id  INT NOT NULL,
    usuario_id      INT NOT NULL,
    monto           DECIMAL(10,2) NOT NULL,
    metodo          VARCHAR(50) DEFAULT 'tarjeta',
    estado          ENUM('exitoso', 'fallido', 'pendiente') DEFAULT 'exitoso',
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Datos semilla
-- ============================================================

-- Usuarios de prueba
INSERT INTO usuarios (nombre, email, perfil) VALUES
    ('Ana López', 'ana@streaming.com', 'usuario'),
    ('Carlos Ruiz', 'carlos@streaming.com', 'usuario'),
    ('María García', 'maria@streaming.com', 'premium'),
    ('Juan Pérez', 'juan@streaming.com', 'usuario');

-- Contenido de prueba
INSERT INTO contenido (titulo, descripcion, genero, tipo, anio_lanzamiento, duracion_min, rating) VALUES
    ('El Último Horizonte', 'Un astronauta perdido en el espacio lucha por volver a casa.', 'Ciencia Ficción', 'pelicula', 2024, 148, 8.7),
    ('Crónicas de Hierro', 'En un mundo medieval, un herrero descubre un poder ancestral.', 'Fantasía', 'serie', 2025, 55, 9.1),
    ('Planeta Azul II', 'Documental sobre la vida en los océanos más remotos del planeta.', 'Naturaleza', 'documental', 2023, 120, 9.5),
    ('Noche de Niebla', 'Un detective investiga desapariciones en un pueblo costero.', 'Suspenso', 'pelicula', 2024, 132, 8.2),
    ('Ríe y Olvida', 'Comedia sobre un grupo de amigos que deciden viajar juntos.', 'Comedia', 'pelicula', 2025, 98, 7.8),
    ('Mente Cuántica', 'Un científico crea una IA que trasciende la comprensión humana.', 'Ciencia Ficción', 'serie', 2025, 45, 9.3),
    ('Sabores del Mundo', 'Recorrido gastronómico por las cocinas tradicionales del mundo.', 'Cocina', 'documental', 2024, 45, 8.9),
    ('Sombras del Pasado', 'Una familia enfrenta secretos que amenazan con destruirlos.', 'Drama', 'pelicula', 2023, 145, 8.5),
    ('Velocidad Límite', 'Competencia clandestina de autos modificados en la ciudad.', 'Acción', 'pelicula', 2025, 110, 7.5),
    ('Aprendices del infinito', 'Jóvenes prodigio compiten en un torneo intergaláctico.', 'Aventura', 'serie', 2024, 42, 8.8);

-- Recomendaciones para usuarios
INSERT INTO recomendaciones (usuario_id, contenido_id, motivo) VALUES
    (1, 2, 'Porque te gustó Crónicas de Hierro'),
    (1, 6, 'Popular en Ciencia Ficción'),
    (2, 4, 'Recomendado por tu historial'),
    (2, 8, 'Tendencia en Drama'),
    (3, 3, 'Más visto este mes'),
    (3, 7, 'Nuevo lanzamiento'),
    (4, 1, 'Recomendado para ti'),
    (4, 9, 'Popular en Acción');

-- Suscripciones de prueba
INSERT INTO suscripciones (usuario_id, plan, estado, fecha_inicio, fecha_fin, monto) VALUES
    (1, 'estandar', 'activa', '2026-01-15', '2026-12-15', 9.99),
    (2, 'basico', 'activa', '2026-03-01', '2026-09-01', 5.99),
    (3, 'premium', 'activa', '2026-02-01', '2027-02-01', 14.99),
    (4, 'basico', 'vencida', '2025-06-01', '2026-06-01', 5.99);

-- Pagos de prueba
INSERT INTO pagos (suscripcion_id, usuario_id, monto, metodo, estado) VALUES
    (1, 1, 9.99, 'tarjeta', 'exitoso'),
    (1, 1, 9.99, 'tarjeta', 'exitoso'),
    (2, 2, 5.99, 'paypal', 'exitoso'),
    (3, 3, 14.99, 'tarjeta', 'exitoso'),
    (3, 3, 14.99, 'tarjeta', 'exitoso'),
    (4, 4, 5.99, 'tarjeta', 'fallido');
