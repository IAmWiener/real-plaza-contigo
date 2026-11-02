# Documentación — Mapa de Solidaridad Real

> **Estado:** el **frontend** está implementado y **desplegado** (S3 +
> CloudFront, HTTPS). El **backend** (API REST + Prisma + PostgreSQL/PostGIS)
> está implementado y compila; su despliegue en AWS queda pendiente.
>
> **App pública (demo):** https://d1uo79vfdlb23z.cloudfront.net/
>
> El nombre visible de la aplicación es **"Mapa de Solidaridad Real"**; la marca
> usa la paleta morada de Real Plaza.

## Visión general

**Mapa de Solidaridad Real** es una plataforma de apoyo, acopio y respuesta ante
emergencias y desastres naturales, presentada como una iniciativa digital de
Real Plaza. Permite:

- Visualizar y gestionar **centros de acopio** sobre un mapa interactivo.
- **Marcar puntos críticos / zonas de riesgo** con un rango perimetral para
  advertir a la comunidad sobre incidentes en curso.

La plataforma se compone de dos proyectos en un monorepo:

- `frontend/` — aplicación web React + TypeScript + Vite (implementada y desplegada).
- `backend/` — API REST Node.js + TypeScript (Express + Prisma) con PostgreSQL +
  PostGIS; corre en local como servidor Express y se adapta a AWS Lambda + API
  Gateway mediante `@codegenie/serverless-express` (implementado; despliegue AWS
  pendiente).

## ⚠️ Aviso sobre los datos

**Todos los datos operativos de esta plataforma son ficticios y existen solo con
fines de demostración.** Sedes, aliados, RUC, coordenadas, eventos, capacidades,
teléfonos y contactos **no representan** operaciones, emergencias ni ubicaciones
reales de Real Plaza.

## Índice de la documentación

| Documento | Contenido | Estado |
|-----------|-----------|--------|
| [`arquitectura.md`](./arquitectura.md) | Estructura de carpetas y módulos (frontend + backend) | Actualizado |
| [`stack-tecnologico.md`](./stack-tecnologico.md) | Tecnologías y dependencias con versiones | Actualizado |
| [`modelo-de-datos.md`](./modelo-de-datos.md) | Entidades, tipos y relaciones por ID | Actualizado |
| [`funcionalidades.md`](./funcionalidades.md) | Vistas y features implementadas | Actualizado |
| [`guia-ejecucion.md`](./guia-ejecucion.md) | Comandos de instalación, desarrollo y build | Actualizado |
| [`sistema-de-diseno.md`](./sistema-de-diseno.md) | Tokens de marca (Comunidad Real), tipografía y componentes | Aplicado |

## Estado actual

- **Monorepo** con npm workspaces (`package.json` raíz con `frontend` y
  `backend`).
- **Frontend:** completo. Mapa interactivo, selector de modo Acopio/Riesgo,
  filtros y búsqueda, fichas de detalle, flujo de reporte de riesgo, panel de
  administración, capa de servicios (API con respaldo a mocks + localStorage) y
  hooks. Compila sin errores (typecheck/lint/build limpios) y está desplegado.
- **Backend:** implementado. API REST con Express + Prisma sobre PostgreSQL +
  PostGIS; módulos para empresas, categorías, eventos, recursos, puntos de
  acopio y puntos de riesgo (CRUD + consulta geoespacial por radio). Compila sin
  errores (typecheck/lint/build limpios). Requiere una base PostgreSQL con
  PostGIS para ejecutarse; el **despliegue en AWS** (Lambda + API Gateway + RDS)
  queda pendiente.
