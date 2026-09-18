<div align="center">

# 🛒 Gestor Huaskar

**Sistema integral de gestión de inventarios, compras, ventas y sesiones de caja con soporte para emisión de comprobantes, WebSockets y PostgreSQL.**

[![CI/CD](https://github.com/yorblim/Gestor-Huaskar/actions/workflows/ci.yml/badge.svg)](https://github.com/yorblim/Gestor-Huaskar/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución en Desarrollo](#-ejecución-en-desarrollo)
- [Credenciales Iniciales](#-credenciales-iniciales)
- [Pruebas Automatizadas](#-pruebas-automatizadas)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características Principales

- **📦 Gestión de Inventario y Productos:**
  - Catálogo de productos con código interno, código de barras (EAN), precio de venta, costo, stock mínimo y categorías.
  - Búsqueda en tiempo real insensible a mayúsculas/minúsculas.
  - Trazabilidad de lotes con fechas de vencimiento y movimientos de stock (entradas, salidas, ajustes).
- **💰 Punto de Venta (POS) y Facturación:**
  - Emisión de Boletas y Facturas con cálculo automático de impuestos (IGV) y descuentos.
  - Registro de múltiples métodos de pago (Efectivo, Tarjeta, Yape, Plin).
  - Impresión de tickets y generación de facturas en formato PDF.
  - Anulación de ventas con restitución automática de stock.
- **🧾 Arqueo y Sesiones de Caja:**
  - Apertura, control de saldo inicial, cierre de caja con cálculo automático de diferencias y estados de sesión.
  - Notificaciones en tiempo real vía WebSockets ante aperturas y cierres de sesión.
- **🚚 Compras y Proveedores:**
  - Registro y administración de proveedores con RUC.
  - Órdenes de compra con recepción de mercancía y sugerencias inteligentes de compra basadas en stock bajo.
- **📊 Reportes y Auditoría:**
  - Reporte de ventas, compras, productos con bajo stock, productos más vendidos y márgenes de ganancia.
  - Exportación de métricas a formato CSV.
  - Registro de auditoría (Audit Logs) para trazabilidad de acciones críticas por usuario.

---

## 🏗️ Arquitectura y Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM, WebSockets (`ws`), Zod, Helmet, Rate Limiting, PDFKit |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7, TanStack Query, Lucide Icons |
| **Base de Datos** | PostgreSQL 16 (con soporte de tipos Decimal, Enums y claves foráneas en cascada) |
| **Testing** | Vitest (Pruebas unitarias y de integración completas) |
| **DevOps & CI/CD** | Docker, Docker Compose, GitHub Actions (TypeCheck, Lint, Tests, Builds) |

---

## 📁 Estructura del Proyecto

```text
Gestor-Huaskar/
├── .github/
│   ├── workflows/             # Pipelines de CI/CD (ci.yml, deploy.yml)
│   ├── ISSUE_TEMPLATE/        # Plantillas de incidencias y mejoras
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml         # Actualización automática de dependencias
├── frontend/                  # Aplicación SPA cliente (React + Vite)
│   ├── src/
│   │   ├── app/               # Router principal
│   │   ├── components/        # Componentes compartidos y ErrorBoundary
│   │   ├── features/          # Módulos por dominio (auth, sales, products, etc.)
│   │   └── api.ts             # Cliente HTTP base
│   └── vite.config.ts
├── prisma/
│   ├── schema.prisma          # Esquema de datos y relaciones
│   └── seed.ts                # Datos iniciales para pruebas y demo
├── src/                       # Backend API REST & WebSockets
│   ├── config/                # Validación de entorno tipada con Zod (env.ts)
│   ├── lib/                   # Instancia única de Prisma Client
│   ├── middlewares/           # Autenticación JWT, Auditoría, Rate-limit, Validación
│   ├── modules/               # Controladores, servicios y rutas modulares
│   ├── utils/                 # Logger, errores tipados, paginación
│   ├── app.ts                 # Configuración de Express
│   └── server.ts              # Punto de entrada HTTP y WebSockets
├── tests/                     # Suite de pruebas unitarias y de integración
├── docker-compose.yml         # Orquestación de contenedores
├── Dockerfile                 # Imagen de producción para el backend
└── .env.example               # Plantilla de variables de entorno
```

---

## ⚙️ Requisitos Previos

- **Node.js**: v20.x o superior.
- **npm**: v10.x o superior.
- **PostgreSQL**: v15.x o superior (o Docker / Docker Compose).

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/yorblim/Gestor-Huaskar.git
   cd Gestor-Huaskar
   ```

2. **Instalar dependencias del Backend:**
   ```bash
   npm install
   ```

3. **Instalar dependencias del Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configurar las variables de entorno:**
   Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Ajusta tu cadena de conexión a PostgreSQL y la clave JWT secreta:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestor_huaskar?schema=public"
   JWT_SECRET="tu-clave-secreta-jwt-de-al-menos-8-caracteres"
   PORT=3000
   NODE_ENV="development"
   ```

5. **Sincronizar el esquema de base de datos:**
   ```bash
   npx prisma db push
   ```

6. **Poblar la base de datos con datos de prueba (`seed`):**
   ```bash
   npm run seed
   ```

---

## 💻 Ejecución en Desarrollo

En dos terminales separadas:

- **Terminal 1 (Backend):**
  ```bash
  npm run dev
  ```
  Servidor disponible en: [http://localhost:3000](http://localhost:3000)
  Documentación Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
  Aplicación web disponible en: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Credenciales Iniciales

El comando `npm run seed` crea automáticamente el siguiente usuario administrador:

| Campo | Valor |
| :--- | :--- |
| **Correo** | `admin@huskar.com` |
| **Contraseña** | `Admin123*` |
| **Rol** | `ADMIN` |

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integración utilizando **Vitest**:

```bash
# Ejecutar todas las pruebas una sola vez
npm run test:run

# Ejecutar pruebas en modo watch interactivo
npm run test

# Verificar linters en el frontend
cd frontend && npm run lint
```

---

## 🐳 Despliegue con Docker

Para levantar toda la infraestructura (PostgreSQL, Backend y Frontend con Nginx) con un solo comando:

```bash
docker compose up -d --build
```

- **Frontend:** [http://localhost](http://localhost) (puerto 80)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **PostgreSQL:** `localhost:5432`

Para detener los contenedores:
```bash
docker compose down
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para colaborar:
1. Revisa [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las pautas de estilo y flujo de ramas.
2. Crea un issue previo para discutir el cambio o mejora propuesta.
3. Envía tu Pull Request siguiendo la plantilla estándar.

---

## 📄 Licencia

Este proyecto está bajo la licencia [ISC](LICENSE).
