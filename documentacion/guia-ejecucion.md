# Guía de ejecución — Real Plaza Contigo

> **Estado:** el **frontend** está implementado, compila y está **desplegado**.
> El **backend** está implementado y compila; su despliegue en AWS queda
> pendiente. Todos los datos son ficticios y de demostración.

## Requisitos

- Node.js 20+ (probado con Node 24).
- npm 10+.
- Para ejecutar el backend: **PostgreSQL con la extensión PostGIS**.

## Instalación

Desde la raíz del monorepo (`/`):

```bash
npm install
```

El proyecto usa **npm workspaces**, por lo que esto instala las dependencias de
`frontend/` y `backend/`.

> **Nota (Node 24 / scripts de instalación):** las versiones recientes de npm
> bloquean por defecto los *lifecycle scripts*, por lo que el `postinstall` de
> Prisma puede no ejecutarse. Si el cliente de Prisma no queda generado, córrelo
> manualmente: `npm run prisma:generate --workspace backend`.

## Frontend

Scripts (desde la raíz del monorepo):

| Comando | Acción |
|---------|--------|
| `npm run dev:frontend` | Servidor de desarrollo Vite (http://localhost:5173). |
| `npm run build:frontend` | Type-check + build de producción a `frontend/dist`. |
| `npm run typecheck` | Comprobación de tipos en todos los workspaces. |
| `npm run lint` | Lint en los workspaces que lo definan. |
| `npm run test --workspace frontend` | Pruebas con Vitest (sin pruebas escritas aún). |

También dentro de `frontend/`: `npm run dev`, `npm run build`, `npm run preview`.

> **Nota (entorno sandbox):** si `npm run dev` se bloquea por el acceso a la
> terminal, usa la alternativa: `npm run build:frontend` y sirve `frontend/dist`
> con cualquier servidor estático.

### Variables de entorno (frontend)

Copia `frontend/.env.example` a `frontend/.env`:

| Variable | Descripción |
|----------|-------------|
| `VITE_API_BASE_URL` | URL base de la API. Si se deja vacía, la app opera en **modo demo** con datos mockeados y persistencia en `localStorage`. |

## Despliegue del frontend (actual)

El frontend está publicado como **build estático en Amazon S3 (bucket privado)
servido por Amazon CloudFront con Origin Access Control (OAC)**, lo que da HTTPS
sin exponer el bucket públicamente. Región: `us-east-1`.

Pasos reproducibles (resumen):

```bash
# 1. Build con rutas absolutas (raíz del dominio)
cd frontend && npx vite build --base=/

# 2. Subir el build al bucket S3 privado
aws s3 sync dist/ s3://<bucket>/ --delete

# 3. Invalidar la caché de CloudFront para publicar los cambios
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

> El bucket es privado; la lectura la hace CloudFront mediante una *bucket
> policy* restringida al ARN de la distribución (no es acceso público). Esto se
> eligió porque el rol del entorno no permite desbloquear el *Block Public
> Access* de S3.

### Despliegue en Netlify (`netlify.toml`)

El repositorio incluye `netlify.toml` para publicar el frontend en Netlify:

| Clave | Valor | Motivo |
|-------|-------|--------|
| `base` | `frontend` | El sitio vive en la subcarpeta `frontend/` del monorepo. |
| `command` | `npm install --include=dev && npm run build` | `--include=dev` fuerza instalar las devDependencies (vite, typescript, tailwind), necesarias para el build aunque Netlify use `NODE_ENV=production`. |
| `publish` | `dist` | Salida del build de Vite, relativa a `base`. |
| `NODE_VERSION` | `20` | Node LTS compatible con Vite 5. |

Incluye una redirección SPA (`/*` → `/index.html`, 200) para que el enrutado del
cliente no devuelva 404 al recargar.

> **Nota de monorepo:** al existir un `package.json` raíz con workspaces, el
> build debe instalar las devDependencies explícitamente; por eso el `command`
> usa `--include=dev`. El `backend/` no se instala en este flujo (no es
> necesario para publicar el sitio estático).

## Backend

### Variables de entorno (backend)

Copia `backend/.env.example` a `backend/.env`:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (la base debe tener PostGIS). |
| `PORT` | Puerto del servidor HTTP local (por defecto `4000`). |
| `CORS_ORIGIN` | Origen(es) permitidos por CORS (incluir el del frontend, p. ej. `http://localhost:5173`). |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`). |

### Puesta en marcha (local)

Requiere una base PostgreSQL con PostGIS accesible mediante `DATABASE_URL`.

```bash
# 1. Generar el cliente de Prisma (si el postinstall no corrió)
npm run prisma:generate --workspace backend

# 2. Aplicar migraciones (crea tablas y habilita PostGIS)
npm run db:migrate --workspace backend      # o: npm run db:migrate (raíz)

# 3. Sembrar datos ficticios de demostración
npm run db:seed --workspace backend         # o: npm run db:seed (raíz)

# 4. Arrancar la API en desarrollo (http://localhost:4000)
npm run dev:backend                          # desde la raíz
```

### Scripts del backend (dentro de `backend/`)

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor Express con recarga (`tsx watch`). |
| `npm run build` | Compila TypeScript a `backend/dist`. |
| `npm start` | Ejecuta el build (`node dist/server.js`). |
| `npm run typecheck` | Comprobación de tipos (`tsc --noEmit`). |
| `npm run lint` | Lint del backend (ESLint). |
| `npm run prisma:generate` | Genera el cliente de Prisma. |
| `npm run db:migrate` | Aplica migraciones en desarrollo. |
| `npm run db:deploy` | Aplica migraciones en producción. |
| `npm run db:seed` | Carga los seeds de demostración. |

### Conectar el frontend con la API

Define `VITE_API_BASE_URL` en `frontend/.env` apuntando a la API (p. ej.
`http://localhost:4000`). Sin esa variable, el frontend opera en modo demo con
mocks y `localStorage`.

## Despliegue objetivo en AWS (según steering)

Previsto con infraestructura como código (AWS CDK): AWS Lambda + API Gateway
para la API, Amazon RDS for PostgreSQL con PostGIS, y S3 + CloudFront para el
frontend. El despliegue actual del frontend (S3 + CloudFront) es un primer paso
hacia esa arquitectura.
