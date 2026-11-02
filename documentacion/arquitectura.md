# Arquitectura — Real Plaza Contigo

> **Estado:** en progreso. Refleja la estructura real del workspace a la fecha.
> Las carpetas aún no creadas se marcan como *pendiente*.

## Monorepo

```
/
├── package.json          # Raíz con npm workspaces (frontend, backend)
├── .gitignore
├── documentacion/        # Esta documentación
├── frontend/             # Aplicación web (en construcción)
└── backend/              # API REST (pendiente)
```

## Frontend (`frontend/`)

Estructura actual de configuración y código:

```
frontend/
├── index.html
├── package.json
├── vite.config.ts          # Alias @ -> src, puerto 5173
├── tsconfig*.json          # Config TS (app / node / referencias)
├── tailwind.config.js      # Tema: colores de marca, estado y riesgo
├── postcss.config.js
├── .env.example            # VITE_API_BASE_URL (modo API o demo)
├── public/
│   └── favicon.svg
└── src/
    ├── types/
    │   └── domain.ts       # Tipos del dominio (entidades + enums)
    ├── data/
    │   └── mock/           # Datos ficticios de demostración
    │       ├── empresas.ts
    │       ├── categorias.ts
    │       ├── eventos.ts
    │       ├── puntosAcopio.ts
    │       ├── recursos.ts
    │       ├── puntosRiesgo.ts
    │       └── index.ts     # Barrel de acceso a los mocks
    ├── services/
    │   └── storage.ts       # Acceso tipado a localStorage (modo demo)
    └── utils/
        └── format.ts        # Etiquetas legibles, fechas, ocupación, URLs
```

### Descripción de módulos (existentes)

| Módulo | Rol |
|--------|-----|
| `types/domain.ts` | Fuente única de los tipos del dominio y enumeraciones. |
| `data/mock/*` | Datos ficticios por entidad, relacionados por ID; barrel en `index.ts`. |
| `services/storage.ts` | Lectura/escritura tipada en localStorage con prefijo y generador de IDs. |
| `utils/format.ts` | Mapas de etiquetas (estado, severidad, etc.), formato de fecha, nivel de ocupación y URL de "Cómo llegar". |

### Módulos pendientes (dentro del alcance)

| Módulo | Rol previsto |
|--------|--------------|
| `app/` | Composición principal y estado global de la app. |
| `components/layout/` | Header y estructura general. |
| `components/map/` | Mapa Leaflet, marcadores, clustering, zonas de riesgo. |
| `components/filters/` | Panel de búsqueda y filtros por modo. |
| `components/points/` | Ficha de detalle de punto de acopio. |
| `components/events/` | Vista/consulta de eventos. |
| `components/risk/` | Reporte y detalle de puntos de riesgo. |
| `components/administration/` | Panel de administración (CRUD). |
| `components/ui/` | Componentes reutilizables (botones, badges, sheets). |
| `services/` (API) | Cliente HTTP hacia el backend con respaldo a mocks. |
| `hooks/` | Estado de datos, filtros, selección y modo. |

## Backend (`backend/`)

**Pendiente de inicialización.** Previsto: Node.js + TypeScript + Express,
PostgreSQL + PostGIS, Prisma, estructura por módulos (controller/service/routes/
schema) y handler para AWS Lambda + API Gateway.

## Relación entre capas (frontend)

```
data/mock ──► services ──► hooks ──► components ──► app
   types  ◄──────────── (compartidos por todas las capas) ──────────►
   utils  ◄──────────── (helpers de presentación/cálculo) ──────────►
```

La fuente de verdad objetivo es la API del backend; los mocks + localStorage
son el respaldo del modo demo.
