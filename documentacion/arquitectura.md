# Arquitectura — Real Plaza Contigo

> **Estado:** actualizado. Refleja la estructura real del workspace. Tanto el
> frontend como el backend están implementados.

## Monorepo

```
/
├── package.json          # Raíz con npm workspaces (frontend, backend)
├── netlify.toml          # Config de despliegue del frontend en Netlify
├── .gitignore
├── documentacion/        # Esta documentación
├── frontend/             # Aplicación web (implementada)
└── backend/              # API REST Express + Prisma (implementada)
```

Scripts de la raíz (`package.json`): `dev:frontend`, `dev:backend`,
`build:frontend`, `build:backend`, `typecheck` y `lint` (sobre todos los
workspaces), `db:migrate` y `db:seed` (backend).

## Frontend (`frontend/`)

Estructura real de código (configuración + `src/`):

```
frontend/
├── index.html
├── package.json
├── vite.config.ts          # Alias @ -> src, puerto 5173, config de Vitest
├── tsconfig*.json          # Config TS (app / node / referencias)
├── tailwind.config.js      # Tema: colores de marca, estado y riesgo
├── postcss.config.js
├── eslint.config.js        # ESLint flat config (TS + React hooks/refresh)
├── .env / .env.example     # VITE_API_BASE_URL (modo API o demo)
├── public/favicon-layo.png # Favicon (logo del león Layo)
└── src/
    ├── main.tsx            # Punto de entrada: monta App dentro de AppProvider
    ├── index.css           # Tailwind, foco visible, safe-area, reduced-motion
    ├── app/                # Composición raíz y estado global
    │   ├── App.tsx         # Cableado de vistas, selección, modo y acciones
    │   ├── AppProvider.tsx # Instancia DataService, carga inicial y acciones
    │   ├── estado.ts       # Reducer y estado (modo, vista, datos, selección…)
    │   ├── contexto.ts     # Contexto de React
    │   └── rutas.ts        # Tipo de vista 'mapa' | 'administracion'
    ├── components/
    │   ├── layout/         # Header, Logo, SelectorModo
    │   ├── map/            # MapaBase, marcadores, zonas, controles, encuadre
    │   ├── filters/        # PanelFiltros, FiltrosAcopio/Riesgo, ListaResultados
    │   ├── points/         # FichaDetalleAcopio
    │   ├── events/         # FichaEvento
    │   ├── risk/           # FichaDetalleRiesgo, FlujoReporteRiesgo, PreviewRadio
    │   ├── administration/ # PanelAdministracion, FormAcopio, FormRiesgo
    │   ├── summary/        # PanelResumen
    │   ├── onboarding/     # Tour (coachmarks de onboarding)
    │   └── ui/             # Boton, Campo, Badge, Drawer, Dialogo, Toasts
    ├── data/mock/          # Datos ficticios por entidad (+ index.ts barrel)
    ├── hooks/              # Filtros, geolocalización, toasts, reduced-motion…
    ├── services/           # Capa de datos (DataService + mock + API + fábrica)
    ├── types/              # domain.ts (dominio) + ui.ts (view-models/filtros)
    └── utils/              # format, geo, viewModels, estadisticas, riesgo
```

### Descripción de módulos (frontend)

| Módulo | Rol |
|--------|-----|
| `app/` | Composición raíz (`App`), proveedor de estado (`AppProvider`) y reducer (`estado.ts`). Mantiene modo, vista, datos, selección, modo demo y toasts. |
| `components/layout/` | Header con marca/lema y `SelectorModo` (Acopio/Riesgo); `Logo` muestra el isotipo del león desde `public/favicon-layo.png`. |
| `components/map/` | Mapa Leaflet + OSM, `MarcadoresAcopio`, `ZonasRiesgo`, controles de inicio/ubicación y `AjusteEncuadre`. |
| `components/filters/` | Panel de búsqueda y filtros por modo + lista de resultados. |
| `components/points/` · `events/` · `risk/` | Fichas de detalle de acopio, evento y riesgo; flujo de reporte de zona de riesgo. |
| `components/administration/` | Panel de administración con tabla y formularios (`FormAcopio`, `FormRiesgo`). |
| `components/summary/` · `onboarding/` · `ui/` | Panel de resumen, recorrido de onboarding y componentes reutilizables accesibles. |
| `data/mock/*` | Datos ficticios por entidad, relacionados por ID; barrel en `index.ts`. |
| `hooks/` | Filtrado reutilizable (`aplicarFiltros`, `useFiltrosAcopio/Riesgo`), geolocalización, toasts, `prefers-reduced-motion`, detección móvil (`useEsMobile`), bloqueo de scroll de fondo con overlays abiertos (`useBloqueoScroll`) y hoja inferior arrastrable del panel de filtros en móvil (`useBottomSheet`). |
| `services/` | `DataService` (interfaz), `MockDataService`, `ApiDataService` (con fallback a mock), fábrica `crearDataService()` y `storage.ts` (localStorage tipado). |
| `types/` | `domain.ts` (entidades + enums) y `ui.ts` (view-models y modelos de filtrado). |
| `utils/` | Etiquetas/formato, utilidades geográficas, derivación de view-models, estadísticas y helpers de riesgo. |

## Backend (`backend/`)

API REST con **Express + Prisma** sobre **PostgreSQL + PostGIS**. El mismo `app`
Express corre en local (`server.ts`) y en AWS Lambda (`lambda.ts`, envuelto con
`@codegenie/serverless-express`).

```
backend/
├── package.json
├── tsconfig.json
├── eslint.config.mjs       # ESLint flat config con typescript-eslint
├── .env.example            # DATABASE_URL, PORT, CORS_ORIGIN, NODE_ENV
├── prisma/
│   ├── schema.prisma       # Modelos + extensión PostGIS (previewFeatures)
│   ├── migrations/         # Migración inicial (0001_init)
│   └── seed.ts             # Seeds con datos ficticios de demostración
└── src/
    ├── server.ts           # Bootstrap del servidor HTTP local
    ├── lambda.ts           # Handler para AWS Lambda + API Gateway
    ├── app.ts              # crearApp(): Express + CORS + rutas + errores
    ├── routes.ts           # Router raíz (/health + módulos REST)
    ├── config/             # env.ts (variables) y prisma.ts (cliente)
    ├── middlewares/        # errorHandler, logger, validate (zod)
    ├── modules/            # Un módulo por recurso del dominio
    │   ├── empresas/       # routes
    │   ├── categorias/     # routes
    │   ├── eventos/        # routes
    │   ├── recursos/       # routes
    │   ├── puntos-acopio/  # controller + service + routes + schema
    │   ├── puntos-riesgo/  # controller + service + routes + schema
    │   └── shared/         # mappers (fila Prisma -> entidad del dominio)
    ├── types/domain.ts     # Tipos del dominio alineados con el frontend
    └── utils/              # asyncHandler, httpError
```

### Descripción de módulos (backend)

| Módulo | Rol |
|--------|-----|
| `app.ts` / `server.ts` / `lambda.ts` | Instancia Express compartida; arranque local y adaptador Lambda. |
| `routes.ts` | Monta `/health` y los routers de cada recurso REST. |
| `config/` | Carga y valida variables de entorno; expone el cliente Prisma. |
| `middlewares/` | Manejo central de errores (formato uniforme), logging de peticiones y validación con zod. |
| `modules/<recurso>/` | Rutas y, en acopio/riesgo, controlador + servicio (lógica de negocio) + esquema (zod). La consulta geoespacial por radio usa PostGIS (`ST_DWithin`). |
| `modules/shared/mappers.ts` | Traduce filas de Prisma a las entidades del dominio que consume el frontend. |
| `prisma/` | Esquema (con `postgresqlExtensions` para PostGIS), migraciones y seeds ficticios. |

## Relación entre capas

Frontend:

```
data/mock ──► services ──► hooks ──► components ──► app
   types  ◄──────────── (compartidos por todas las capas) ──────────►
   utils  ◄──────────── (helpers de presentación/cálculo) ──────────►
```

Backend:

```
routes ──► controller ──► service ──► Prisma/PostGIS ──► PostgreSQL
                              ▲
                         schema (zod)  +  middlewares (errores, logging)
```

La fuente de verdad es la API del backend (PostgreSQL + PostGIS). El frontend la
consume a través de `services/` cuando `VITE_API_BASE_URL` está definida; si no,
opera en **modo demo** con los mocks y persistencia en `localStorage`.
