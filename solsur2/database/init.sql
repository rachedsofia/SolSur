-- ─────────────────────────────────────────────────────────────────────────────
-- SolSur — Base de Datos MySQL
-- Ejecutar este script una sola vez para crear la base de datos
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS solsur_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE solsur_db;

-- Tabla: productos
CREATE TABLE IF NOT EXISTS products (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(50)    NOT NULL UNIQUE,
  name            VARCHAR(150)   NOT NULL,
  category        VARCHAR(100),
  size            VARCHAR(10),
  color           VARCHAR(60),
  stock           INT            NOT NULL DEFAULT 0,
  cost_price      DECIMAL(12,2),
  sale_price      DECIMAL(12,2)  NOT NULL,
  description     TEXT,
  has_promotion   TINYINT(1)     NOT NULL DEFAULT 0,
  promotion_type  VARCHAR(30),
  promotion_discount INT,
  created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_category (category),
  INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: ventas
CREATE TABLE IF NOT EXISTS sales (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  date            DATE           NOT NULL,
  client          VARCHAR(150)   NOT NULL,
  client_cuit     VARCHAR(20),
  product_id      BIGINT         NOT NULL,
  product_name    VARCHAR(150)   NOT NULL,
  quantity        INT            NOT NULL,
  unit_price      DECIMAL(12,2)  NOT NULL,
  total_amount    DECIMAL(12,2)  NOT NULL,
  payment_method  VARCHAR(50)    NOT NULL,
  invoice_status  VARCHAR(30)    NOT NULL DEFAULT 'Pendiente',
  invoice_number  VARCHAR(30),
  notes           TEXT,
  created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_date (date),
  INDEX idx_invoice_status (invoice_status),
  INDEX idx_client (client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: comprobantes (facturas)
CREATE TABLE IF NOT EXISTS invoices (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_type        VARCHAR(30)    NOT NULL,
  punto_venta         VARCHAR(10),
  numero              VARCHAR(20),
  razon_social        VARCHAR(200),
  cuit                VARCHAR(30),
  domicilio           VARCHAR(300),
  condicion_iva       VARCHAR(60),
  concepto            VARCHAR(200),
  monto_neto          DECIMAL(12,2),
  alicuota_iva        DECIMAL(5,2),
  monto_iva           DECIMAL(12,2),
  total               DECIMAL(12,2),
  fecha_vencimiento   DATE,
  fecha_emision       DATE           DEFAULT (CURRENT_DATE),
  status              VARCHAR(30)    DEFAULT 'Borrador',
  observaciones       TEXT,
  sale_id             BIGINT,
  created_at          DATETIME       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL,
  INDEX idx_fecha_emision (fecha_emision),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── DATOS DE PRUEBA ─────────────────────────────────────────────────────────

INSERT INTO products (code, name, category, size, color, stock, cost_price, sale_price, description, has_promotion, promotion_type, promotion_discount) VALUES
('SS-001', 'Vestido Lino Premium',   'Vestidos',  'M',  'Blanco', 8,  12000.00, 28000.00, 'Vestido de lino 100%, corte recto',        0, NULL, NULL),
('SS-002', 'Camisa Oxford Clásica',  'Camisas',   'L',  'Negro',  15, 8500.00,  19000.00, 'Camisa oxford, cierre de botones',          1, '2x1', 50),
('SS-003', 'Pantalón Palazzo',       'Pantalones','S',  'Beige',  6,  11000.00, 24000.00, 'Pantalón ancho tiro alto',                  1, '%',   20),
('SS-004', 'Blazer Estructurado',    'Sacos',     'M',  'Negro',  4,  22000.00, 52000.00, 'Blazer oversized con hombreras marcadas',   0, NULL, NULL),
('SS-005', 'Top Satinado',           'Tops',      'XS', 'Marfil', 12, 5500.00,  13000.00, 'Top satinado con breteles finos',           0, NULL, NULL);

-- Usuario MySQL para la app (ejecutar como root)
-- CREATE USER 'solsur_app'@'localhost' IDENTIFIED BY 'SolSur2024!';
-- GRANT ALL PRIVILEGES ON solsur_db.* TO 'solsur_app'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Base de datos SolSur creada correctamente ✓' AS resultado;
