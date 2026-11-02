 # Implementation Plan: Frontend MVP — Real Plaza Contigo

## Overview

Este plan implementa el frontend de "Real Plaza Contigo" sobre el código ya
scaffolded (`types/domain.ts`, `data/mock/*`, `utils/format.ts`,
`services/storage.ts` y la config de Vite/TS/Tailwind), sin recrearlo. El trabajo
avanza de forma incremental y test-driven: primero el tooling de pruebas y las
dependencias, luego la Capa de Servicios (fuente de verdad en Modo_Demo), los
tipos de UI y la derivación de view-models, los hooks (filtrado reutilizable,
geolocalización, toasts, reduced-motion), el estado global (`AppProvider` +
reducer), los componentes UI compartidos, el mapa y sus controles, el
Selector_Modo y el Header, los paneles de filtros, las fichas de detalle, el
flujo de reporte de riesgo, el panel de administración, y finalmente la
composición de `App` + `main.tsx` + estilos globales y el wiring de todas las
acciones. Cada paso se apoya en el anterior y termina integrado en la app.

Lenguaje de implementación: **TypeScript** (definido por el diseño). El diseño
incluye una sección de Correctness Properties (Property 1–13); cada propiedad se
cubre con una prueba basada en propiedades (fast-check, mínimo 100 iteraciones)
etiquetada con el formato `// Feature: frontend-mvp, Property {n}: {texto}`.

## Tasks

- [ ] 1. Configurar tooling de pruebas, dependencias y variables de entorno
  - [x] 1.1 Agregar dependencias de desarrollo e instalar
    - Añadir a `frontend/package.json` (devDependencies): `vitest`, `jsdom`,
      `@testing-library/react`, `@testing-library/user-event`,
      `@testing-library/jest-dom`, `fast-check`, `@axe-core/react` (o
      `jest-axe` adaptado a Vitest)
    - Añadir scripts `test` (`vitest run`) y `test:watch` (`vitest`) en
      `package.json`
    - Ejecutar la instalación de dependencias (`npm install` en `frontend/`)
    - _Requirements: 12.1_

  - [x] 1.2 Configurar Vitest (jsdom) y setup de pruebas
    - Añadir configuración `test` en `frontend/vite.config.ts`
      (`environment: 'jsdom'`, `globals: true`, `setupFiles`)
    - Crear `frontend/src/test/setup.ts` con `@testing-library/jest-dom`, mock
      base de `localStorage` y stubs mínimos de la API de Leaflet para jsdom
    - Verificar que `npm test` arranca sin errores con un test trivial temporal
    - _Requirements: 12.1_

  - [x] 1.3 Manejar `VITE_API_BASE_URL` y modo demo por entorno
    - Confirmar/ajustar `frontend/.env.example` documentando `VITE_API_BASE_URL`
      opcional (vacío → Modo_Demo)
    - Añadir tipado de `import.meta.env` en `frontend/src/vite-env.d.ts`
      (`VITE_API_BASE_URL?: string`)
    - _Requirements: 12.2, 12.3_

- [x] 2. Definir tipos de UI y derivación de view-models
  - [x] 2.1 Crear `types/ui.ts` con view-models y modelos de filtrado
    - Definir `PuntoAcopioVista` (extiende `PuntoAcopio` con `sede`, `aliados`,
      `categorias`, `evento`, `recursos`, `ocupacionPct`), `FiltrosAcopio`,
      `FiltrosRiesgo`, `ResultadoFiltro<T>`, `BorradorReporte`, vista
      `'mapa' | 'administracion'` y `DatosDominio`
    - Reusar enums y entidades de `types/domain.ts` sin redefinirlos
    - _Requirements: 7.1, 7.2, 12.6_

  - [x] 2.2 Implementar derivación de view-models por ID en `utils/geo.ts` y helper de datos
    - Crear `utils/geo.ts` con utilidades geográficas (p. ej. límites/bounds y
      helpers de coordenadas) usadas por el mapa
    - Implementar función pura `derivarPuntoAcopioVista(punto, { empresas,
      categorias, eventos, recursos })` que resuelve relaciones por ID y calcula
      `ocupacionPct` con `nivelOcupacion` de `utils/format.ts`
    - _Requirements: 7.1, 7.2, 12.6_

  - [ ]* 2.3 Escribir property test de derivación de view-models por ID
    - **Property 13: El view-model resuelve las relaciones por ID de forma consistente**
    - **Validates: Requirements 12.6**

  - [ ]* 2.4 Escribir property test del nivel de ocupación acotado
    - **Property 4: El nivel de ocupación está acotado a [0, 100]**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 2.5 Escribir property test de "Cómo llegar"
    - **Property 5: "Cómo llegar" incluye las coordenadas del punto**
    - **Validates: Requirements 7.4, 8.3**

- [x] 3. Implementar la Capa de Servicios (DataService + mock + api + fábrica)
  - [x] 3.1 Definir la interfaz `DataService` y `DatosDominio`
    - Crear `services/dataService.ts` con la interfaz (`esDemo`, `cargarTodo`,
      CRUD de acopio y riesgo, `resolverRiesgo`, `restaurarDemo`) tal como el
      diseño
    - _Requirements: 12.1_

  - [x] 3.2 Implementar `MockDataService` con mocks + `storage.ts`
    - Inicializar estado desde `data/mock/*`, persistir/leer con `storage.ts`
      (claves `rpc:puntosAcopio`, `rpc:puntosRiesgo`, `rpc:recursos`; catálogo
      cacheado)
    - Implementar CRUD de acopio y riesgo, `resolverRiesgo` (estado →
      `'resuelto'`), `restaurarDemo` (limpiar claves `rpc:` y resembrar), usando
      `generarId('pa'|'pr')` para IDs estables y relaciones por ID
    - _Requirements: 9.5, 9.7, 10.4, 10.5, 10.6, 10.11, 12.3, 12.4, 12.5, 12.6_

  - [x] 3.3 Implementar `ApiDataService` con fallback a mock
    - Cliente `fetch` contra `${VITE_API_BASE_URL}/...` con formato de error
      uniforme; si la lectura inicial falla (red/timeout), caer a
      `MockDataService` y marcar `esDemo = true`
    - _Requirements: 12.2, 12.3_

  - [x] 3.4 Implementar la fábrica `crearDataService()`
    - Seleccionar `ApiDataService` cuando `VITE_API_BASE_URL` es cadena no vacía
      (ignorando espacios) y `MockDataService` en caso contrario
    - _Requirements: 12.2, 12.3_

  - [ ]* 3.5 Escribir property test de IDs estables y únicos
    - **Property 6: Los identificadores creados son estables y únicos**
    - **Validates: Requirements 12.5**

  - [ ]* 3.6 Escribir property test de invariantes CRUD
    - **Property 7: Las mutaciones CRUD preservan las invariantes de colección**
    - **Validates: Requirements 10.4, 10.5, 10.6**

  - [ ]* 3.7 Escribir property test de resolver/eliminar reporte de riesgo
    - **Property 8: Resolver o eliminar un reporte de riesgo tiene el efecto esperado**
    - **Validates: Requirements 8.6**

  - [ ]* 3.8 Escribir property test de round-trip de persistencia en Modo_Demo
    - **Property 9: La persistencia en Modo_Demo es un round-trip**
    - **Validates: Requirements 9.5, 9.7, 10.4, 10.5**

  - [ ]* 3.9 Escribir property test de restaurar datos de demostración
    - **Property 10: Restaurar devuelve exactamente los datos mock iniciales**
    - **Validates: Requirements 10.10, 10.11**

  - [ ]* 3.10 Escribir property test de selección de implementación por entorno
    - **Property 11: La fábrica selecciona la implementación según el entorno**
    - **Validates: Requirements 12.2, 12.3**

  - [ ]* 3.11 Escribir unit test del fallback de `ApiDataService`
    - Mockear `fetch` que rechaza y verificar caída a mock con `esDemo = true`
    - _Requirements: 12.3_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implementar hooks de estado y lógica reutilizable
  - [x] 5.1 Implementar núcleo de filtrado reutilizable y hooks de filtros
    - Crear `hooks/aplicarFiltros.ts` (núcleo genérico que compone predicados de
      texto e igualdad por campo)
    - Crear `hooks/useFiltrosAcopio.ts` y `hooks/useFiltrosRiesgo.ts` que
      configuran el núcleo con sus campos y devuelven `ResultadoFiltro<T>`
      memoizado (items + total)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.2 Escribir property test de correctitud y completitud del filtrado
    - **Property 2: El filtrado es correcto y completo**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4**

  - [ ]* 5.3 Escribir property test de limpiar filtros
    - **Property 3: Limpiar filtros restaura la colección completa**
    - **Validates: Requirements 5.7, 5.8, 6.6, 6.7**

  - [x] 5.4 Implementar `useGeolocalizacion`, `useToasts` y `usePrefersReducedMotion`
    - `useGeolocalizacion`: envuelve `navigator.geolocation`, resuelve posición o
      error sin lanzar excepción
    - `useToasts`: cola de mensajes de éxito/error
    - `usePrefersReducedMotion`: lee la media query y reacciona a cambios
    - _Requirements: 4.1, 4.2, 4.3, 14.5, 14.6_

- [x] 6. Implementar el estado global (AppProvider + reducer)
  - [x] 6.1 Crear `app/rutas.ts` y el reducer de estado
    - Definir el tipo de vista `'mapa' | 'administracion'` y el reducer con
      `modo`, `vista`, `datos` (+ `cargando`/`error`), `seleccionId`,
      `seleccionTipo`, `modoDemo`, `toasts`
    - _Requirements: 1.3, 1.4, 3.5, 3.6, 10.1_

  - [x] 6.2 Implementar `app/AppProvider.tsx` con acciones y carga inicial
    - Instanciar `crearDataService()`, invocar `cargarTodo()` al montar, exponer
      acciones (cambiar modo/vista, seleccionar/limpiar selección, CRUD de
      acopio y riesgo, reportar, resolver/eliminar, restaurar demo) que llaman a
      la Capa de Servicios y refrescan las colecciones
    - Derivar las colecciones de view-models (acopio) con `derivarPuntoAcopioVista`
    - _Requirements: 1.3, 1.4, 8.6, 9.5, 10.4, 10.5, 10.6, 10.11, 12.1, 14.5_

  - [ ]* 6.3 Escribir property test de contenido visible por modo
    - **Property 1: El modo activo determina el contenido visible**
    - **Validates: Requirements 1.3, 1.4**

- [x] 7. Implementar componentes UI compartidos (`components/ui/`)
  - [x] 7.1 Crear `Boton`, `Campo`, `Badge`, `Drawer`/`BottomSheet`, `Dialogo`, `Toasts`
    - Componentes accesibles: foco visible, `aria-*`, áreas táctiles adecuadas;
      `Badge` muestra icono + etiqueta textual; `Drawer`/`BottomSheet`
      responsive; `Dialogo` para confirmaciones; `Toasts` consume `useToasts`
    - Respetar `prefers-reduced-motion` en animaciones de framer-motion
    - _Requirements: 13.4, 13.5, 14.1, 14.2, 14.3, 14.5, 14.6_

  - [ ]* 7.2 Escribir unit tests de los componentes UI compartidos
    - Foco visible, etiquetas accesibles, Badge con icono + texto, confirmación
      del Dialogo, render de Toasts; auditoría axe básica
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

- [ ] 8. Implementar el mapa interactivo y sus controles (`components/map/`)
  - [x] 8.1 Implementar `MapaBase` con OSM, estados de carga/error y control de inicio
    - `MapContainer` centrado en Lima Metropolitana (`[-12.0464, -77.0428]`,
      zoom ~11), `TileLayer` OSM sin API key con atribución visible; overlay de
      carga (`loading`) y banner de error (`tileerror`); `ControlVolverInicio`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 8.2 Implementar `ControlUbicacion` y `AjusteEncuadre`
    - `ControlUbicacion` usa `useGeolocalizacion`: centra al conceder permiso;
      toast "Ubicación no disponible" y conserva vista si falla/deniega
    - `AjusteEncuadre` ejecuta `fitBounds` sobre el conjunto filtrado del modo
      activo; conserva vista válida si está vacío
    - _Requirements: 3.7, 3.8, 4.1, 4.2, 4.3_

  - [x] 8.3 Implementar `MarcadoresAcopio` (icono por categoría + forma por estado, clustering, popup)
    - `Marker` con `divIcon` que combina icono de categoría principal + forma por
      `EstadoOperativo` (no solo color); `react-leaflet-cluster` sobre umbral;
      `Popup` resumido; clic selecciona y abre ficha; realce del seleccionado
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [x] 8.4 Implementar `ZonasRiesgo` (Circle por radio + marcador central diferenciado)
    - `Circle` con `radioMetros` (relleno por severidad) + `Marker` central con
      `divIcon` de advertencia distinto al de acopio; `Popup` resumido; clic
      selecciona y abre ficha; realce del seleccionado
    - _Requirements: 3.2, 3.4, 3.5, 3.6_

  - [ ]* 8.5 Escribir unit tests del mapa y property test de cardinalidad de marcadores
    - Unit: center/zoom iniciales, control volver a inicio, estados tiles
      carga/error, `fitBounds` al cambiar conjunto y sin fallo en vacío, forma/
      icono de marcadores, geolocalización mock conceder/denegar
    - **Property 12: El número de marcadores/zonas coincide con el conjunto filtrado**
    - **Validates: Requirements 3.1, 3.2**
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 3.7, 3.8, 4.2, 4.3_

- [x] 9. Implementar Selector_Modo y Header (`components/layout/`)
  - [x] 9.1 Implementar `SelectorModo`
    - Dos opciones con etiqueta textual + icono (role `tablist`/`aria-selected`);
      modo activo distinguido por peso/borde/indicador, no solo color; visible
      ≥360px; cambiar modo no desmonta el mapa
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 14.1_

  - [x] 9.2 Implementar `Header` con marca, lema, Indicador_DEMO y controles
    - Logotipo "Real Plaza Contigo", lema, badge DEMO siempre visible; incluye
      Selector_Modo, control Mapa/Administración y control de ubicación; layout
      sin scroll horizontal ≥360px (controles secundarios colapsables en móvil)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 13.1, 15.1, 15.2_

  - [ ]* 9.3 Escribir unit tests de Selector_Modo y Header
    - Etiquetas + iconos, indicador DEMO, distinción del modo activo sin solo
      color, presencia de marca Real Plaza
    - _Requirements: 1.1, 1.6, 11.1, 11.2, 14.1, 15.1_

- [x] 10. Implementar Panel_Filtros para ambos modos (`components/filters/`)
  - [x] 10.1 Implementar `PanelFiltros`, `FiltrosAcopio`, `FiltrosRiesgo` y `ListaResultados`
    - Panel lateral en escritorio; en móvil panel inferior compacto y deslizable
      que no oculta el mapa, con lista deslizable; renderiza filtros según modo
    - Acopio: buscador (nombre/sede/aliado/dirección/distrito), filtros
      categoría/estado/evento/distrito, contador, lista, limpiar, estado vacío
    - Riesgo: buscador (descripción/tipo/distrito), filtros
      tipo/severidad/estado, contador, lista, limpiar, estado vacío
    - Seleccionar un resultado centra el mapa y abre la ficha (vía acciones del
      AppProvider); usa `useFiltrosAcopio`/`useFiltrosRiesgo`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 13.3_

  - [ ]* 10.2 Escribir unit tests de los paneles de filtros
    - Interacción búsqueda/filtros actualiza lista y contador, seleccionar centra
      y abre ficha, limpiar restaura, estado vacío con acción
    - _Requirements: 5.5, 5.6, 5.8, 6.5, 6.7_

- [ ] 11. Implementar fichas de detalle (`components/points/`, `components/events/`, `components/risk/`)
  - [x] 11.1 Implementar `FichaDetalleAcopio` y `FichaEvento`
    - Drawer (escritorio) / bottom sheet (móvil) con jerarquía estado →
      ubicación → recursos → disponibilidad; resuelve relaciones por ID; RUC y
      teléfono marcados como ficticios; acciones "Cómo llegar"
      (`urlComoLlegar`), "Copiar dirección" (clipboard + toast), "Compartir"
      (Web Share con fallback de copiar enlace), "Ver evento" (abre
      `FichaEvento`), cerrar devolviendo el foco al mapa
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 13.4, 14.4, 15.2_

  - [x] 11.2 Implementar `FichaDetalleRiesgo`
    - Muestra tipo, severidad (etiqueta + icono), descripción, distrito,
      coordenadas, radio, fecha/hora y estado; identificado como reporte
      ciudadano de demostración; acciones "Cómo llegar", "Compartir" con
      fallback, "Resolver o eliminar reporte" con confirmación (llama a la Capa
      de Servicios y refresca mapa/lista), cerrar devolviendo el foco
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 13.4, 14.1, 15.2_

  - [ ]* 11.3 Escribir unit tests de las fichas de detalle
    - Render de todos los campos y marca de dato ficticio, copiar/compartir con y
      sin soporte, ver evento, cierre que devuelve foco, confirmación de
      resolver/eliminar
    - _Requirements: 7.1, 7.3, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.2, 8.5, 8.6, 8.7_

- [x] 12. Implementar el flujo de reporte de zona de riesgo (`components/risk/`)
  - [x] 12.1 Implementar `FlujoReporteRiesgo` y `PreviewRadio`
    - Solo en Modo_Riesgo; pasos usables con una mano ≥360px: ubicar (tocar mapa
      vía `useMapEvents` → registra coordenada), ajustar radio (slider +
      `Circle` de vista previa en tiempo real), detallar y confirmar (tipo,
      severidad, descripción); validación que impide confirmar sin tipo,
      severidad, descripción o radio; al confirmar persiste vía Capa de Servicios
      y aparece de inmediato en el mapa
    - Integrar la elección de ubicación con `MapaBase` (modo "elegir ubicación")
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 12.2 Escribir unit tests del flujo de reporte
    - Registrar coordenada al tocar, preview del Circle al ajustar radio,
      validación de campos requeridos, persistencia reflejada en el mapa
    - _Requirements: 9.2, 9.3, 9.6_

- [x] 13. Implementar el Panel de administración (`components/administration/`)
  - [x] 13.1 Implementar `PanelAdministracion` con tabla, búsqueda y filtros por modo
    - Listado de acopio (búsqueda + filtros categoría/estado) o riesgo (búsqueda
      + filtros tipo/severidad/estado) reutilizando los hooks de filtrado;
      utilizable en móvil (tabla con scroll); acciones crear/editar/eliminar
      (eliminar con confirmación) que refrescan listado y mapa; acción
      "Restaurar datos de demostración" (con confirmación) en Modo_Demo
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.10, 10.11, 13.7_

  - [x] 13.2 Implementar `FormAcopio` y `FormRiesgo` con validación por campo
    - FormAcopio: selectores de sede, aliados, evento y categorías + dirección,
      coordenadas, capacidad, estado y contacto
    - FormRiesgo: tipo, severidad, radio, descripción y estado
    - Validación por campo con `aria-invalid`/`aria-describedby` que impide
      guardar; al guardar llama a la Capa de Servicios
    - _Requirements: 10.7, 10.8, 10.9_

  - [ ]* 13.3 Escribir unit tests del panel de administración
    - Crear/editar/eliminar reflejan cambios, validación bloquea guardado,
      restaurar demo repuebla y refresca, confirmación de eliminar
    - _Requirements: 10.4, 10.5, 10.6, 10.7, 10.11_

- [x] 14. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Componer la aplicación y hacer el wiring final
  - [x] 15.1 Implementar estilos globales y `main.tsx`
    - Crear `src/index.css` con directivas de Tailwind, foco visible por defecto,
      utilidades de áreas seguras (safe-area insets) y reglas
      `prefers-reduced-motion`; importar CSS de Leaflet; crear/ajustar
      `src/main.tsx` que monta `App` dentro de `AppProvider`
    - _Requirements: 13.1, 13.6, 14.2, 14.6_

  - [x] 15.2 Implementar `app/App.tsx` y cablear todas las acciones
    - Composición raíz: `Header` + vista activa (`mapa` con mapa/filtros/fichas/
      flujo de reporte, o `administracion`); conectar selección↔mapa↔ficha,
      cambio de modo/vista, flujo de reporte, CRUD y restaurar; estados de carga/
      error y toasts; sin botones principales sin acción; interfaz cuidada en
      estados con datos y vacíos; marca Real Plaza y marca de datos ficticios
    - _Requirements: 1.5, 3.5, 3.6, 7.9, 8.7, 10.1, 11.3, 13.2, 14.5, 15.1, 15.2, 15.3_

  - [ ]* 15.3 Escribir tests de integración, responsive y veracidad de marca
    - Flujo cambiar modo → filtrar → seleccionar → ver ficha → cerrar; ausencia
      de scroll horizontal a 360px y bottom sheets en móvil; presencia de marca
      Real Plaza y marcas de dato ficticio en vistas principales; auditoría axe
      en vistas clave
    - _Requirements: 1.3, 1.4, 13.1, 13.2, 13.4, 14.1, 14.4, 15.1, 15.2, 15.3_

- [x] 16. Verificación final — build, typecheck y lint limpios
  - [ ] 16.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`
    - Corregir todos los errores de tipado, lint, pruebas y compilación hasta que
      las cuatro comprobaciones pasen sin errores ni warnings críticos
    - _Requirements: 12.1_

- [x] 17. Checkpoint final — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (pruebas) y pueden omitirse para un
  MVP más rápido; las tareas de implementación nunca se marcan como opcionales.
- Cada tarea referencia los requisitos que implementa para trazabilidad.
- Los checkpoints aseguran validación incremental.
- Las pruebas de propiedades validan las Correctness Properties del diseño
  (Property 1–13), con mínimo 100 iteraciones (`fc.assert(..., { numRuns: 100 })`)
  y etiqueta `// Feature: frontend-mvp, Property {n}: {texto}`.
- Las pruebas unitarias/example cubren interacción con Leaflet, APIs del
  navegador, accesibilidad y responsive, complementando a las propiedades.
- Se construye sobre el código existente (`types/domain.ts`, `data/mock/*`,
  `utils/format.ts`, `services/storage.ts`) sin recrearlo.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "3.1"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5", "3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "3.6", "3.7", "3.8", "3.9", "3.11"] },
    { "id": 6, "tasks": ["3.5", "3.10", "5.1", "5.4", "6.1"] },
    { "id": 7, "tasks": ["5.2", "5.3", "6.2", "6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "8.1", "9.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4", "9.2"] },
    { "id": 10, "tasks": ["8.5", "9.3", "10.1", "11.1", "11.2", "13.1", "13.2"] },
    { "id": 11, "tasks": ["10.2", "11.3", "12.1", "13.3"] },
    { "id": 12, "tasks": ["12.2", "15.1"] },
    { "id": 13, "tasks": ["15.2"] },
    { "id": 14, "tasks": ["15.3", "16.1"] }
  ]
}
```
