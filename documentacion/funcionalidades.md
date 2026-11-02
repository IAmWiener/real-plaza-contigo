# Funcionalidades — Real Plaza Contigo

> **Estado:** el **frontend está completo** (implementado, compila y
> desplegado). El **backend/AWS (API + PostGIS)** sigue pendiente.
>
> ⚠️ Todos los datos son ficticios y de demostración.
>
> Nota: no se escribieron pruebas automatizadas (decisión del proyecto); el
> tooling de pruebas (Vitest + fast-check) está instalado y listo.

## Leyenda de estado

- ✅ Implementado
- 🚧 En construcción
- ⏳ Pendiente

## Modos de la plataforma

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Selector Acopio / Riesgo | ✅ | `components/layout/SelectorModo.tsx` (tablist, etiqueta + icono). |

## Datos y capa de servicios

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Tipos del dominio y view-models | ✅ | `types/domain.ts`, `types/ui.ts`. |
| Datos mockeados (sedes, categorías, eventos, acopio, recursos, riesgo) | ✅ | `data/mock/*`. |
| Helpers de formato/etiquetas/ocupación/geo | ✅ | `utils/format.ts`, `utils/geo.ts`, `utils/viewModels.ts`. |
| Capa de servicios (interfaz + mock + API) | ✅ | `services/*`: `DataService`, `MockDataService`, `ApiDataService`. |
| Cliente HTTP hacia la API con fallback a mock | ✅ | `apiDataService.ts` (timeout + fallback); fábrica por `VITE_API_BASE_URL`. |
| Persistencia en localStorage (modo demo) | ✅ | `services/storage.ts` (prefijo `rpc:`). |

## Mapa interactivo

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Mapa Leaflet + OpenStreetMap (sin API key) | ✅ | `components/map/MapaBase.tsx` con atribución y estados carga/error. |
| Marcadores de acopio por categoría/estado | ✅ | `MarcadoresAcopio.tsx` (icono + forma, no solo color). |
| Clustering | ✅ | `react-leaflet-cluster`. |
| Zonas de riesgo (círculo perimetral + marcador) | ✅ | `ZonasRiesgo.tsx`. |
| Controles (vista inicial, ubicación) | ✅ | `ControlVolverInicio.tsx`, `ControlUbicacion.tsx`. |
| Ajuste de encuadre a puntos filtrados | ✅ | `AjusteEncuadre.tsx`. |

## Búsqueda, filtros y detalle

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Panel de búsqueda y filtros (ambos modos) | ✅ | `components/filters/*` + hooks `useFiltrosAcopio/Riesgo`. |
| Estados vacíos con acción de limpiar | ✅ | `ListaResultados.tsx`. |
| Ficha de detalle de acopio | ✅ | `components/points/FichaDetalleAcopio.tsx`. |
| Ficha de detalle de riesgo | ✅ | `components/risk/FichaDetalleRiesgo.tsx`. |
| Ficha de evento asociado | ✅ | `components/events/FichaEvento.tsx`. |
| Acciones (cómo llegar, copiar, compartir, ver evento) | ✅ | Web Share API con fallback a copiar enlace. |

## Reporte de puntos de riesgo

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Marcar zona con rango perimetral | ✅ | `FlujoReporteRiesgo.tsx` + `PreviewRadio.tsx`. |
| Resolver / eliminar reporte (con confirmación) | ✅ | Ficha de riesgo + `Dialogo`. |

## Administración

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Tabla/listado con búsqueda y filtros por modo | ✅ | `components/administration/PanelAdministracion.tsx`. |
| Crear / editar / eliminar (con validación y confirmación) | ✅ | `FormAcopio.tsx`, `FormRiesgo.tsx`. |
| Persistencia (API + respaldo localStorage) | ✅ | Vía capa de servicios; refresco inmediato de mapa y lista. |
| Restaurar datos iniciales de demostración | ✅ | Acción disponible en modo demo. |

## Accesibilidad y experiencia

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Foco visible, etiquetas accesibles, teclado | ✅ | Componentes `ui/*` + `index.css`. |
| Estados por texto + icono (no solo color) | ✅ | `Badge`, severidad/estado operativo. |
| `prefers-reduced-motion` | ✅ | `usePrefersReducedMotion` + `index.css`. |
| Responsive móvil (drawer/bottom sheet, safe-area) | ✅ | Capas con z-index coherente (mapa `z-0`, overlays `z-[600]`, drawer `z-[2000]`); panel de filtros `max-h-[40vh]` + safe-area y flujo de reporte con scroll. |

## Despliegue

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Frontend en S3 + CloudFront (HTTPS, OAC) | ✅ | Build estático publicado; ver `guia-ejecucion.md`. |

## Backend / AWS

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| API REST (CRUD + geoespacial) | ⏳ | — |
| PostgreSQL + PostGIS | ⏳ | — |
| Despliegue API (Lambda + API Gateway, RDS) con CDK | ⏳ | — |
