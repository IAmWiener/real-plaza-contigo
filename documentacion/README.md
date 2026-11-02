# Documentación — Mapa de Solidaridad Real

> **Estado:** el **frontend** está implementado y **desplegado** (S3 +
> CloudFront, HTTPS). El **backend** está pendiente.
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
- `backend/` — API REST Node.js + TypeScript con PostgreSQL + PostGIS, desplegable
  en AWS como Lambda + API Gateway (en construcción).

## ⚠️ Aviso sobre los datos

**Todos los datos operativos de esta plataforma son ficticios y existen solo con
fines de demostración.** Sedes, aliados, RUC, coordenadas, eventos, capacidades,
teléfonos y contactos **no representan** operaciones, emergencias ni ubicaciones
reales de Real Plaza.

## Índice de la documentación

| Documento | Contenido | Estado |
|-----------|-----------|--------|
| [`arquitectura.md`](./arquitectura.md) | Estructura de carpetas y módulos | En progreso |
| [`stack-tecnologico.md`](./stack-tecnologico.md) | Tecnologías y dependencias con versiones | En progreso (frontend) |
| [`modelo-de-datos.md`](./modelo-de-datos.md) | Entidades, tipos y relaciones por ID | En progreso |
| [`funcionalidades.md`](./funcionalidades.md) | Vistas y features implementadas | En progreso |
| [`guia-ejecucion.md`](./guia-ejecucion.md) | Comandos de instalación, desarrollo y build | En progreso |
| [`sistema-de-diseno.md`](./sistema-de-diseno.md) | Tokens de marca (Comunidad Real), tipografía y componentes | Aplicado |

## Estado actual

- **Monorepo** inicializado (`package.json` con workspaces `frontend` y
  `backend`).
- **Frontend:** configuración completa (Vite, TS, Tailwind), tipos del dominio,
  datos mockeados, utilidades y acceso a localStorage. Pendientes: componentes
  (mapa, filtros, fichas, riesgo, administración), capa de servicios API y
  hooks.
- **Backend:** pendiente de inicialización (Node + TS + Express, PostGIS, AWS
  Lambda).
