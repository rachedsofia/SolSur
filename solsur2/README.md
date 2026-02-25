# SolSur — Sistema de Gestión de Showroom

Sistema completo para gestión de stock, ventas y facturación del showroom SolSur.

## Stack Tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Backend    | Java 17 + Spring Boot 3.2         |
| Frontend   | React 18                          |
| Base de datos | MySQL 8.x                      |
| ORM        | Spring Data JPA / Hibernate       |
| Exportes   | Apache POI (Excel) + iText (PDF)  |

---

## Requisitos Previos

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.x
- Git

---

## Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/solsur.git
cd solsur
```

### 2. Base de Datos MySQL
```bash
# Entrar a MySQL como root
mysql -u root -p

# Ejecutar el script de inicialización
SOURCE database/init.sql;
```

O desde la terminal:
```bash
mysql -u root -p < database/init.sql
```

### 3. Backend — Spring Boot

Editar `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/solsur_db?useSSL=false&serverTimezone=America/Argentina/Buenos_Aires
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_AQUI
```

Luego ejecutar:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

### 4. Frontend — React

```bash
cd frontend
npm install
npm start
```

El frontend estará disponible en: `http://localhost:3000`

---

## Estructura del Proyecto

```
solsur/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/solsur/
│       ├── SolSurApplication.java
│       ├── config/
│       │   └── CorsConfig.java
│       ├── controller/
│       │   ├── DashboardController.java
│       │   ├── ProductController.java
│       │   ├── SaleController.java
│       │   └── InvoiceController.java
│       ├── service/
│       │   ├── DashboardService.java
│       │   ├── ProductService.java
│       │   ├── SaleService.java
│       │   ├── InvoiceService.java
│       │   └── ExportService.java
│       ├── repository/
│       │   ├── ProductRepository.java
│       │   ├── SaleRepository.java
│       │   └── InvoiceRepository.java
│       ├── entity/
│       │   ├── Product.java
│       │   ├── Sale.java
│       │   └── Invoice.java
│       ├── dto/
│       │   └── DTOs.java
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           ├── ResourceNotFoundException.java
│           └── BusinessException.java
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── services/
│       │   └── api.js                      # Axios — todos los endpoints
│       └── components/
│           ├── shared/index.js             # Design system completo
│           ├── layout/Sidebar.js           # Navegación lateral
│           ├── dashboard/Dashboard.js      # Estadísticas + gráficos
│           ├── stock/
│           │   ├── StockSection.js         # Lista + búsqueda + edición
│           │   └── LoadStock.js            # Formulario carga de stock
│           ├── sales/SalesSection.js       # Ventas + export Excel/PDF
│           └── invoice/InvoiceSection.js   # Comprobantes AFIP
│
└── database/
    └── init.sql                            # Script MySQL con datos de prueba
```

---

## API REST — Endpoints

### Productos
| Método | Endpoint                    | Descripción                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/products               | Listar todos (+ ?search=)    |
| GET    | /api/products/{id}          | Obtener uno                  |
| GET    | /api/products/low-stock     | Productos con stock bajo     |
| POST   | /api/products               | Crear producto               |
| PUT    | /api/products/{id}          | Editar producto              |
| DELETE | /api/products/{id}          | Eliminar producto            |

### Ventas
| Método | Endpoint                        | Descripción                  |
|--------|---------------------------------|------------------------------|
| GET    | /api/sales                      | Listar (+ ?start=&end=)      |
| GET    | /api/sales/current-month        | Ventas del mes actual        |
| POST   | /api/sales                      | Registrar venta              |
| PATCH  | /api/sales/{id}/status          | Actualizar estado            |
| DELETE | /api/sales/{id}                 | Eliminar (repone stock)      |
| GET    | /api/sales/export/excel         | Descargar Excel              |
| GET    | /api/sales/export/pdf           | Descargar PDF                |

### Facturación
| Método | Endpoint                        | Descripción                  |
|--------|---------------------------------|------------------------------|
| GET    | /api/invoices                   | Listar comprobantes          |
| POST   | /api/invoices                   | Crear comprobante            |
| PATCH  | /api/invoices/{id}/status       | Actualizar estado            |
| DELETE | /api/invoices/{id}              | Eliminar                     |

### Dashboard
| Método | Endpoint                    | Descripción                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/dashboard/stats        | Estadísticas del mes         |

---

## Funcionalidades Principales

### Dashboard
- Ventas del mes (con y sin IVA)
- Comparativa Ventas vs. Compras (barra visual)
- Margen bruto mensual
- Pendiente de cobro
- Unidades vendidas
- Gráfico de barras mensual (Recharts)
- Formas de pago del mes
- Últimas ventas
- Alertas de stock bajo / sin stock

### Stock
- Lista completa de productos con búsqueda en tiempo real
- Badges de estado por stock (verde / naranja / rojo)
- Edición y eliminación inline
- Soporte de promociones (%, 2x1, precio especial)

### Cargar Stock
- Formulario completo con vista previa en tiempo real
- Cálculo automático de margen (costo vs. venta)
- Validaciones de código único

### Ventas
- Registro de ventas con descuento automático de stock
- Filtro por estado (Todas / Facturado / Pendiente)
- Exportación a **Excel (.xlsx)** vía Apache POI
- Exportación a **PDF** vía iText
- Restauración de stock al eliminar una venta

### Facturación
- Formulario con todos los campos AFIP
- Tipos: Factura A, B, C; Notas de Débito/Crédito
- Vinculación con ventas pendientes
- Alícuotas: 21%, 10.5%, 27%, Exento
- Cálculo automático de IVA y total
- Link directo al portal AFIP
- Alertas de ventas sin facturar

---

## Variables de Entorno

Crear archivo `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## Para Producción

### Backend
```bash
mvn clean package -DskipTests
java -jar target/solsur-backend-1.0.0.jar \
  --spring.datasource.password=PROD_PASSWORD \
  --server.port=8080
```

### Frontend
```bash
npm run build
# Servir la carpeta build/ con nginx, apache, o similar
```

### Nginx (ejemplo)
```nginx
server {
    listen 80;
    server_name tudominio.com;

    # Frontend
    location / {
        root /var/www/solsur/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
    }
}
```

---

## Notas de Seguridad

- Cambiar la contraseña en `application.properties` antes de producción
- Crear un usuario MySQL dedicado con permisos mínimos (ver comentarios en `init.sql`)
- Para producción: agregar Spring Security con autenticación JWT
- Las credenciales **nunca** deben commitearse al repositorio

---

## Próximas Mejoras (Roadmap)

- [ ] Autenticación JWT con roles (Admin / Vendedor)
- [ ] Módulo de compras / proveedores
- [ ] Integración directa con AFIP (Factura Electrónica)
- [ ] Módulo de clientes con historial de compras
- [ ] App móvil React Native
- [ ] Notificaciones por email de stock bajo
- [ ] Multi-sucursal

---

Desarrollado para **SolSur Showroom** · Sistema de Gestión v1.0
