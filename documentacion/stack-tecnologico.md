# Stack tecnológico — Real Plaza Contigo

> **Estado:** actualizado. Las versiones provienen de los `package.json` reales
> del workspace (frontend y backend).

## Monorepo

Raíz gestionada con **npm workspaces** (`frontend`, `backend`).

## Frontend (`frontend/package.json`)

Aplicación **React + TypeScript + Vite**, estilos con **Tailwind CSS**, mapa con
**Leaflet / React Leaflet** sobre **OpenStreetMap**.

### Dependencias de ejecución

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | ^18.3.1 | Librería de UI |
| react-dom | ^18.3.1 | Render en el DOM |
| leaflet | ^1.9.4 | Motor de mapas |
| react-leaflet | ^4.2.1 | Bindings de Leaflet para React |
| react-leaflet-cluster | ^2.1.0 | Clustering de marcadores |
| lucide-react | ^0.456.0 | Iconografía |
| framer-motion | ^11.11.17 | Animaciones sutiles |

### Dependencias de desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| vite | ^5.4.11 | Bundler / dev server |
| @vitejs/plugin-react | ^4.3.3 | Plugin React para Vite |
| typescript | ^5.6.3 | Tipado estático |
| tailwindcss | ^3.4.15 | Framework de estilos |
| postcss | ^8.4.49 | Procesado de CSS |
| autoprefixer | ^10.4.20 | Prefijos CSS automáticos |
| @types/leaflet | ^1.9.14 | Tipos de Leaflet |
| @types/react | ^18.3.12 | Tipos de React |
| @types/react-dom | ^18.3.1 | Tipos de React DOM |
| @types/node | ^22.10.1 | Tipos de Node |
| eslint | ^9.39.5 | Linter |
| typescript-eslint | ^8.72.1 | Parser/reglas TS para ESLint |
| @eslint/js | ^9.39.5 | Reglas base de ESLint |
| eslint-plugin-react-hooks | ^5.2.0 | Reglas de hooks de React |
| eslint-plugin-react-refresh | ^0.4.26 | Reglas de fast-refresh |
| globals | ^15.15.0 | Definición de globals para ESLint |
| vitest | ^2.1.8 | Runner de pruebas (instalado; sin pruebas escritas) |
| jsdom | ^25.0.1 | DOM para pruebas en Vitest |
| @testing-library/react | ^16.0.1 | Utilidades de testing de componentes |
| @testing-library/user-event | ^14.5.2 | Simulación de interacciones |
| @testing-library/jest-dom | ^6.6.3 | Matchers de DOM |
| fast-check | ^3.23.1 | Property-based testing |
| @axe-core/react · jest-axe | ^4.10.0 · ^9.0.0 | Auditoría de accesibilidad |

> **Build de producción independiente del tooling de pruebas:** `vite.config.ts`
> importa `defineConfig` desde `vite` (no desde `vitest/config`) y el
> `tsconfig.app.json` excluye `src/test`. Así `tsc -b && vite build` no depende
> de `vitest` ni de `@testing-library/*`, evitando fallos en despliegues que
> omiten devDependencies.

> Cartografía: **OpenStreetMap** como proveedor de tiles, sin API key. Se debe
> incluir su atribución en el mapa.

## Backend (`backend/package.json`)

API REST **Node.js + TypeScript** con **Express**, acceso a datos con **Prisma**
sobre **PostgreSQL + PostGIS**, validación con **zod**. El mismo código corre en
local (servidor Express) y en **AWS Lambda** mediante
`@codegenie/serverless-express`.

`package.json` es `type: commonjs`; por eso la config de ESLint es
`eslint.config.mjs` (ESM).

### Dependencias de ejecución

| Paquete | Versión | Uso |
|---------|---------|-----|
| express | ^4.21.1 | Framework HTTP de la API |
| @prisma/client | ^5.22.0 | Cliente de acceso a datos tipado |
| zod | ^3.23.8 | Validación de entrada por endpoint |
| cors | ^2.8.5 | CORS restringido al origen del frontend |
| dotenv | ^16.4.5 | Carga de variables de entorno |

### Dependencias de desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| typescript | ^5.6.3 | Tipado estático |
| prisma | ^5.22.0 | CLI de esquema, migraciones y seeds |
| tsx | ^4.19.2 | Ejecución de TS en dev/seed (`dev`, `db:seed`) |
| @codegenie/serverless-express | ^4.16.0 | Adaptador Express → AWS Lambda |
| @types/aws-lambda | ^8.10.145 | Tipos de AWS Lambda |
| @types/express | ^4.17.21 | Tipos de Express |
| @types/cors | ^2.8.17 | Tipos de CORS |
| @types/node | ^22.10.1 | Tipos de Node |
| eslint · @eslint/js | ^9.39.5 | Linter y reglas base |
| typescript-eslint | ^8.72.1 | Parser/reglas TS para ESLint |
| globals | ^15.15.0 | Definición de globals para ESLint |

> **PostGIS:** el `schema.prisma` habilita la extensión `postgis` vía
> `datasource.extensions = [postgis]` y el preview feature
> `postgresqlExtensions` en el generador. La base de datos debe tener PostGIS
> instalado.

## Despliegue

- **Frontend:** build estático de Vite. Publicado en **Amazon S3 + CloudFront**
  (HTTPS, OAC); también configurado para **Netlify** (`netlify.toml`, base
  `frontend/`).
- **Backend:** objetivo **AWS Lambda + API Gateway** (adaptador listo) con
  **Amazon RDS for PostgreSQL + PostGIS**. Despliegue en AWS pendiente.
