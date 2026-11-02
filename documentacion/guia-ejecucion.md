# Guía de ejecución — Real Plaza Contigo

> **Estado:** el **frontend** está implementado, compila y está **desplegado**.
> El **backend** aún no está inicializado (pendiente). Todos los datos son
> ficticios y de demostración.

## Requisitos

- Node.js 20+ (probado con Node 24).
- npm 10+.

## Instalación

Desde la raíz del monorepo (`/`):

```bash
npm install
```

El proyecto usa **npm workspaces**, por lo que esto instala las dependencias de
`frontend/` (y de `backend/` cuando exista).

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

## Backend

⏳ **Pendiente.** Se documentarán los comandos de desarrollo, migraciones, seeds
y empaquetado para AWS Lambda cuando el proyecto `backend/` esté inicializado.

## Despliegue objetivo en AWS (según steering)

Previsto con infraestructura como código (AWS CDK): AWS Lambda + API Gateway
para la API, Amazon RDS for PostgreSQL con PostGIS, y S3 + CloudFront para el
frontend. El despliegue actual del frontend (S3 + CloudFront) es un primer paso
hacia esa arquitectura.
