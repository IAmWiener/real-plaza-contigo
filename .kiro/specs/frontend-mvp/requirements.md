# Requirements Document

## Introduction

Esta especificación cubre la **primera versión del frontend** de "Real Plaza Contigo",
una plataforma web de apoyo, acopio y respuesta ante emergencias de Real Plaza. El
alcance se limita exclusivamente al proyecto `frontend/` (React + TypeScript + Vite +
Tailwind + Leaflet/React Leaflet + OpenStreetMap + Lucide + Framer Motion), ejecutable en
**modo demo** con datos mockeados y persistencia en `localStorage`.

El frontend expone dos modos de trabajo sobre un mapa interactivo: **Centros de acopio**
(explorar y administrar puntos de acopio) y **Reporte de puntos críticos** (visualizar y
reportar zonas de riesgo). Toda la información es **ficticia y de demostración**, acotada
a Real Plaza.

El frontend debe acceder a los datos únicamente a través de una capa de servicios
configurable por la variable de entorno `VITE_API_BASE_URL`. Cuando dicha variable no
está configurada o la API no responde, el frontend opera en modo demo con datos mockeados
y `localStorage`. **El backend real queda fuera del alcance de esta especificación**: aquí
solo se requiere que la capa de servicios esté preparada para consumir la API, con
respaldo a mocks.

Se reutiliza el código existente sin recrearlo: `frontend/src/types/domain.ts`,
`frontend/src/data/mock/*`, `frontend/src/utils/format.ts` y
`frontend/src/services/storage.ts`, además de la configuración de Vite/TS/Tailwind.

## Glossary

- **Frontend**: Aplicación web React de "Real Plaza Contigo" que se ejecuta en el
  navegador y constituye el alcance de esta especificación.
- **Modo_Demo**: Estado de operación del Frontend en el que los datos provienen de mocks
  y la persistencia de cambios ocurre en `localStorage`, por ausencia de
  `VITE_API_BASE_URL` o por falta de respuesta de la API.
- **Capa_Servicios**: Módulos bajo `frontend/src/services/` que encapsulan todo acceso a
  datos (cliente HTTP hacia la API y respaldo a mocks/`localStorage`).
- **Selector_Modo**: Control visual principal que permite al usuario alternar entre el
  modo "Centros de acopio" y el modo "Reporte de puntos críticos".
- **Modo_Acopio**: Modo de la plataforma centrado en centros de acopio.
- **Modo_Riesgo**: Modo de la plataforma centrado en puntos de riesgo.
- **Mapa**: Componente de mapa interactivo basado en Leaflet/React Leaflet con cartografía
  de OpenStreetMap.
- **Punto_Acopio**: Centro de acopio ficticio, representado por la entidad `PuntoAcopio`.
- **Punto_Riesgo**: Zona de riesgo reportada, representada por la entidad `PuntoRiesgo`,
  visualizada como un círculo perimetral más un marcador central.
- **Estado_Operativo**: Estado de un Punto_Acopio: operativo, capacidad limitada, saturado
  o temporalmente cerrado.
- **Severidad**: Nivel de severidad de un Punto_Riesgo: bajo, medio, alto o crítico.
- **Estado_Reporte**: Estado de un Punto_Riesgo: activo, en verificación o resuelto.
- **Ficha_Detalle**: Panel (drawer en escritorio, bottom sheet en móvil) que muestra la
  información completa de un Punto_Acopio o un Punto_Riesgo seleccionado.
- **Panel_Filtros**: Componente de búsqueda y filtros que opera sobre los datos del modo
  activo.
- **Panel_Administracion**: Vista de gestión (demostración) de puntos de acopio y de
  riesgo con operaciones de crear, editar y eliminar.
- **Header**: Barra superior con la marca, el lema, el indicador DEMO, el Selector_Modo y
  los controles de navegación/ubicación.
- **Indicador_DEMO**: Elemento visual que comunica que la plataforma y sus datos son de
  demostración.

## Requirements

### Requirement 1: Selector de modo Acopio / Riesgo

**User Story:** Como usuario de la plataforma, quiero alternar entre el modo de centros de
acopio y el modo de puntos críticos, para explorar y actuar sobre el tipo de información
que necesito sin perder el mapa de vista.

#### Acceptance Criteria

1. THE Frontend SHALL mostrar el Selector_Modo con una etiqueta textual y un icono para
   cada modo ("Centros de acopio" y "Reporte de puntos críticos").
2. THE Frontend SHALL mostrar el Selector_Modo de forma visible tanto en viewports de
   escritorio como en viewports de ancho igual o mayor a 360px.
3. WHEN el usuario selecciona el Modo_Acopio, THE Frontend SHALL mostrar en el Mapa y en
   el Panel_Filtros únicamente el contenido de puntos de acopio.
4. WHEN el usuario selecciona el Modo_Riesgo, THE Frontend SHALL mostrar en el Mapa y en
   el Panel_Filtros únicamente el contenido de puntos de riesgo.
5. WHEN el usuario cambia de modo, THE Frontend SHALL mantener el Mapa visible durante la
   transición.
6. THE Frontend SHALL indicar el modo activo mediante una diferencia visual que no dependa
   únicamente del color.

### Requirement 2: Visualización del mapa interactivo

**User Story:** Como usuario, quiero un mapa interactivo centrado en Lima Metropolitana,
para ubicar geográficamente los puntos de acopio y las zonas de riesgo.

#### Acceptance Criteria

1. WHEN el Frontend carga la vista de mapa, THE Mapa SHALL centrarse inicialmente en Lima
   Metropolitana, Perú.
2. THE Mapa SHALL usar cartografía de OpenStreetMap sin requerir una API key.
3. THE Mapa SHALL mostrar la atribución de OpenStreetMap de forma visible.
4. THE Mapa SHALL permitir acercar, alejar y desplazar la vista.
5. WHILE las teselas del Mapa se están cargando, THE Mapa SHALL mostrar un estado de
   carga.
6. IF la carga de las teselas del Mapa falla, THEN THE Mapa SHALL mostrar un mensaje de
   error de carga del mapa.
7. THE Mapa SHALL proporcionar un control para restablecer la vista inicial de Lima
   Metropolitana.

### Requirement 3: Marcadores y zonas en el mapa

**User Story:** Como usuario, quiero distinguir visualmente los puntos de acopio por
categoría y estado y las zonas de riesgo por severidad, para interpretar la situación de
un vistazo.

#### Acceptance Criteria

1. WHILE el Modo_Acopio está activo, THE Mapa SHALL mostrar un marcador por cada
   Punto_Acopio del conjunto filtrado, diferenciado por categoría y por Estado_Operativo
   mediante icono y forma, no únicamente por color.
2. WHILE el Modo_Riesgo está activo, THE Mapa SHALL mostrar cada Punto_Riesgo como un
   círculo perimetral correspondiente al radio reportado más un marcador central
   diferenciado del marcador de los puntos de acopio.
3. WHILE el número de marcadores visibles supera un umbral definido, THE Mapa SHALL
   agrupar los marcadores mediante clustering.
4. WHEN el usuario selecciona un marcador, THE Mapa SHALL mostrar un popup informativo con
   los datos resumidos del punto correspondiente.
5. WHEN el usuario selecciona un marcador, THE Frontend SHALL abrir la Ficha_Detalle
   correspondiente al punto seleccionado.
6. WHILE un punto está seleccionado, THE Mapa SHALL mostrar un indicador visual que
   distinga el marcador o la zona seleccionada del resto.
7. WHEN el conjunto de puntos filtrados cambia, THE Mapa SHALL ajustar su encuadre para
   mostrar los puntos resultantes del filtro.
8. WHERE el conjunto de puntos filtrados está vacío, THE Mapa SHALL conservar una vista
   válida sin marcadores.

### Requirement 4: Ubicación del usuario

**User Story:** Como usuario, quiero centrar el mapa en mi ubicación actual, para
orientarme respecto a los puntos cercanos.

#### Acceptance Criteria

1. THE Frontend SHALL mostrar un control para centrar el Mapa en la ubicación del usuario.
2. WHEN el usuario activa el control de ubicación y concede el permiso del navegador, THE
   Mapa SHALL centrarse en la ubicación obtenida del usuario.
3. IF el usuario deniega el permiso de ubicación o la obtención de la ubicación falla,
   THEN THE Frontend SHALL mostrar un mensaje informando que la ubicación no está
   disponible y SHALL conservar la vista actual del Mapa.

### Requirement 5: Búsqueda y filtros en modo Acopio

**User Story:** Como usuario en el modo de centros de acopio, quiero buscar y filtrar los
puntos de acopio, para encontrar rápidamente el centro que necesito.

#### Acceptance Criteria

1. WHILE el Modo_Acopio está activo, THE Panel_Filtros SHALL ofrecer un buscador de texto
   que filtre los puntos de acopio por nombre, sede, aliado, dirección o distrito.
2. WHILE el Modo_Acopio está activo, THE Panel_Filtros SHALL ofrecer filtros por
   categoría, por Estado_Operativo, por evento/desastre asociado y por distrito.
3. WHEN el usuario modifica un criterio de búsqueda o un filtro, THE Frontend SHALL
   actualizar la lista de resultados, el contador de resultados y los marcadores del Mapa
   según los criterios vigentes.
4. THE Panel_Filtros SHALL mostrar un contador con el número de puntos de acopio que
   cumplen los criterios vigentes.
5. THE Panel_Filtros SHALL mostrar una lista de los puntos de acopio que cumplen los
   criterios vigentes.
6. WHEN el usuario selecciona un resultado de la lista, THE Frontend SHALL centrar el Mapa
   en el punto seleccionado y abrir su Ficha_Detalle.
7. THE Panel_Filtros SHALL ofrecer una acción para limpiar todos los filtros y la búsqueda
   de acopio.
8. WHERE ningún Punto_Acopio cumple los criterios vigentes, THE Panel_Filtros SHALL
   mostrar un estado vacío con una acción para limpiar los filtros.

### Requirement 6: Búsqueda y filtros en modo Riesgo

**User Story:** Como usuario en el modo de puntos críticos, quiero buscar y filtrar las
zonas de riesgo, para localizar los incidentes relevantes.

#### Acceptance Criteria

1. WHILE el Modo_Riesgo está activo, THE Panel_Filtros SHALL ofrecer un buscador de texto
   que filtre los puntos de riesgo por descripción, por tipo de incidente o por distrito.
2. WHILE el Modo_Riesgo está activo, THE Panel_Filtros SHALL ofrecer filtros por tipo de
   incidente, por Severidad y por Estado_Reporte.
3. WHEN el usuario modifica un criterio de búsqueda o un filtro, THE Frontend SHALL
   actualizar la lista de resultados, el contador de resultados y las zonas del Mapa según
   los criterios vigentes.
4. THE Panel_Filtros SHALL mostrar un contador con el número de puntos de riesgo que
   cumplen los criterios vigentes.
5. WHEN el usuario selecciona un resultado de la lista de riesgo, THE Frontend SHALL
   centrar el Mapa en la zona seleccionada y abrir su Ficha_Detalle.
6. THE Panel_Filtros SHALL ofrecer una acción para limpiar todos los filtros y la búsqueda
   de riesgo.
7. WHERE ningún Punto_Riesgo cumple los criterios vigentes, THE Panel_Filtros SHALL
   mostrar un estado vacío con una acción para limpiar los filtros.

### Requirement 7: Ficha de detalle de punto de acopio

**User Story:** Como usuario, quiero ver la información completa de un centro de acopio,
para decidir si acudo a él y cómo llegar.

#### Acceptance Criteria

1. WHEN el usuario selecciona un Punto_Acopio, THE Ficha_Detalle SHALL mostrar su nombre,
   código identificador, Estado_Operativo, categorías atendidas, sede responsable y
   aliados participantes, RUC ficticio, evento asociado y tipo de desastre, dirección,
   distrito y coordenadas, horario, persona de contacto y teléfono, recursos disponibles,
   capacidad con nivel de ocupación, fecha de última actualización y observaciones.
2. THE Ficha_Detalle SHALL presentar la información de un Punto_Acopio priorizando estado,
   ubicación, recursos y disponibilidad.
3. THE Ficha_Detalle SHALL identificar el RUC y el teléfono de contacto como datos
   ficticios de demostración.
4. WHEN el usuario activa la acción "Cómo llegar", THE Frontend SHALL abrir Google Maps con
   las coordenadas del Punto_Acopio seleccionado.
5. WHEN el usuario activa la acción "Copiar dirección", THE Frontend SHALL copiar la
   dirección del Punto_Acopio al portapapeles y SHALL confirmar la acción con un mensaje.
6. WHEN el usuario activa la acción "Compartir punto" y el navegador soporta la Web Share
   API, THE Frontend SHALL invocar la Web Share API con los datos del Punto_Acopio.
7. IF el navegador no soporta la Web Share API, THEN WHEN el usuario activa "Compartir
   punto", THE Frontend SHALL copiar un enlace al punto al portapapeles como alternativa.
8. WHEN el usuario activa la acción "Ver evento" de un Punto_Acopio con evento asociado,
   THE Frontend SHALL mostrar la información del evento asociado.
9. WHEN el usuario cierra la Ficha_Detalle, THE Frontend SHALL ocultar la Ficha_Detalle y
   SHALL devolver el foco a la exploración del Mapa.

### Requirement 8: Ficha de detalle de punto de riesgo

**User Story:** Como usuario, quiero ver la información de una zona de riesgo reportada,
para conocer el incidente y actuar en consecuencia.

#### Acceptance Criteria

1. WHEN el usuario selecciona un Punto_Riesgo, THE Ficha_Detalle SHALL mostrar su tipo de
   incidente, su Severidad con etiqueta textual e icono, la descripción, el distrito, las
   coordenadas, el radio perimetral afectado, la fecha y hora de reporte y el
   Estado_Reporte.
2. THE Ficha_Detalle SHALL identificar el Punto_Riesgo como un reporte ciudadano de
   demostración.
3. WHEN el usuario activa la acción "Cómo llegar" de un Punto_Riesgo, THE Frontend SHALL
   abrir Google Maps con las coordenadas del Punto_Riesgo seleccionado.
4. WHEN el usuario activa la acción "Compartir" de un Punto_Riesgo y el navegador soporta
   la Web Share API, THE Frontend SHALL invocar la Web Share API con los datos del
   Punto_Riesgo.
5. IF el navegador no soporta la Web Share API, THEN WHEN el usuario activa "Compartir" de
   un Punto_Riesgo, THE Frontend SHALL copiar un enlace al punto al portapapeles como
   alternativa.
6. WHEN el usuario activa la acción "Resolver o eliminar reporte" y confirma la operación,
   THE Capa_Servicios SHALL aplicar el cambio al Punto_Riesgo y THE Frontend SHALL
   actualizar el Mapa y la lista de resultados.
7. WHEN el usuario cierra la Ficha_Detalle de un Punto_Riesgo, THE Frontend SHALL ocultar
   la Ficha_Detalle y SHALL devolver el foco a la exploración del Mapa.

### Requirement 9: Reportar una zona de riesgo

**User Story:** Como usuario, quiero marcar una zona de riesgo con un rango perimetral
sobre el mapa, para advertir a la comunidad de un incidente en curso.

#### Acceptance Criteria

1. WHILE el Modo_Riesgo está activo, THE Frontend SHALL ofrecer una acción para iniciar el
   flujo de marcar una zona de riesgo.
2. WHEN el usuario marca una ubicación sobre el Mapa durante el flujo de reporte, THE
   Frontend SHALL registrar las coordenadas del centro de la zona de riesgo.
3. WHILE el flujo de reporte está activo, THE Frontend SHALL permitir ajustar el radio
   perimetral de la zona de riesgo y SHALL mostrar en el Mapa una vista previa del círculo
   resultante.
4. THE Frontend SHALL permitir completar el flujo de reporte con los controles accesibles
   con una sola mano en viewports de ancho igual o mayor a 360px.
5. WHEN el usuario confirma el reporte con tipo de incidente, Severidad, descripción,
   coordenadas y radio, THE Capa_Servicios SHALL persistir el nuevo Punto_Riesgo y THE
   Frontend SHALL mostrarlo de inmediato en el Mapa.
6. IF el usuario intenta confirmar el reporte sin el tipo de incidente, la Severidad, la
   descripción o el radio requeridos, THEN THE Frontend SHALL mostrar un mensaje de
   validación e impedir la confirmación.
7. WHILE el Frontend opera en Modo_Demo, THE Capa_Servicios SHALL persistir el nuevo
   Punto_Riesgo en `localStorage` de forma que permanezca tras recargar la página.

### Requirement 10: Panel de administración

**User Story:** Como administrador de la demostración, quiero gestionar los centros de
acopio y los reportes de riesgo, para mantener la información del sistema actualizada.

#### Acceptance Criteria

1. THE Frontend SHALL ofrecer en el Header un control para alternar entre la vista de Mapa
   y el Panel_Administracion.
2. WHILE el Modo_Acopio está activo, THE Panel_Administracion SHALL mostrar un listado de
   puntos de acopio con búsqueda y filtros por categoría y por Estado_Operativo.
3. WHILE el Modo_Riesgo está activo, THE Panel_Administracion SHALL mostrar un listado de
   puntos de riesgo con búsqueda y filtros por tipo de incidente, por Severidad y por
   Estado_Reporte.
4. WHEN el usuario crea un Punto_Acopio con datos válidos, THE Capa_Servicios SHALL
   persistir el nuevo punto y THE Frontend SHALL reflejarlo en el listado y en el Mapa.
5. WHEN el usuario edita un Punto_Acopio o un Punto_Riesgo con datos válidos, THE
   Capa_Servicios SHALL persistir los cambios y THE Frontend SHALL reflejarlos en el
   listado y en el Mapa.
6. WHEN el usuario solicita eliminar un Punto_Acopio o un Punto_Riesgo y confirma la
   operación, THE Capa_Servicios SHALL eliminar el registro y THE Frontend SHALL retirarlo
   del listado y del Mapa.
7. IF el usuario envía un formulario de creación o edición con campos requeridos inválidos
   o vacíos, THEN THE Frontend SHALL mostrar mensajes de validación por campo e impedir el
   guardado.
8. THE Panel_Administracion SHALL ofrecer en los formularios de acopio selectores de sede,
   de aliados, de evento y de categorías, y campos de dirección, coordenadas, capacidad,
   Estado_Operativo y contacto.
9. THE Panel_Administracion SHALL ofrecer en los formularios de riesgo campos de tipo de
   incidente, Severidad, radio perimetral, descripción y Estado_Reporte.
10. WHILE el Frontend opera en Modo_Demo, THE Panel_Administracion SHALL ofrecer una acción
    para restaurar los datos iniciales de demostración.
11. WHEN el usuario confirma la restauración de los datos iniciales de demostración, THE
    Capa_Servicios SHALL reemplazar los datos persistidos en `localStorage` por los datos
    mockeados iniciales y THE Frontend SHALL reflejar el conjunto restaurado en el listado
    y en el Mapa.

### Requirement 11: Header e identidad de la plataforma

**User Story:** Como usuario, quiero un encabezado claro con la marca y los controles
principales, para identificar la plataforma y navegar por ella.

#### Acceptance Criteria

1. THE Header SHALL mostrar el logotipo tipográfico "Real Plaza Contigo" y el lema "Una red
   de apoyo para nuestras comunidades".
2. THE Header SHALL mostrar el Indicador_DEMO de forma visible.
3. THE Header SHALL incluir el Selector_Modo, el control de cambio entre Mapa y
   Panel_Administracion y el control de ubicación del usuario.
4. WHILE el viewport tiene un ancho igual o mayor a 360px, THE Header SHALL presentar sus
   elementos sin provocar scroll horizontal.

### Requirement 12: Capa de servicios y acceso a datos

**User Story:** Como desarrollador del frontend, quiero que todo acceso a datos pase por
una capa de servicios configurable, para poder consumir la API real o los mocks sin
cambiar la interfaz.

#### Acceptance Criteria

1. THE Frontend SHALL acceder a todos los datos de dominio exclusivamente a través de la
   Capa_Servicios.
2. WHERE la variable de entorno `VITE_API_BASE_URL` está configurada, THE Capa_Servicios
   SHALL dirigir las operaciones de datos a la API en esa URL base.
3. IF la variable `VITE_API_BASE_URL` no está configurada o la API no responde, THEN THE
   Capa_Servicios SHALL operar en Modo_Demo usando los datos mockeados y `localStorage`.
4. THE Capa_Servicios SHALL centralizar todo acceso a `localStorage` reutilizando el módulo
   `frontend/src/services/storage.ts`.
5. WHEN la Capa_Servicios crea una nueva entidad en Modo_Demo, THE Capa_Servicios SHALL
   asignarle un identificador estable.
6. THE Capa_Servicios SHALL mantener las relaciones entre entidades mediante identificadores
   por ID, sin duplicar la información de sedes, aliados y eventos.

### Requirement 13: Experiencia móvil

**User Story:** Como usuario en un dispositivo móvil, quiero una interfaz usable con una
mano desde 360px de ancho, para operar la plataforma cómodamente.

#### Acceptance Criteria

1. WHILE el viewport tiene un ancho igual o mayor a 360px, THE Frontend SHALL presentar su
   contenido sin provocar scroll horizontal.
2. WHILE el viewport corresponde a móvil, THE Mapa SHALL ocupar la mayor parte del
   viewport.
3. WHILE el viewport corresponde a móvil, THE Panel_Filtros SHALL abrirse en un panel
   compacto que no oculte por completo el Mapa, con una lista de resultados deslizable.
4. WHILE el viewport corresponde a móvil, THE Ficha_Detalle SHALL presentarse como un panel
   inferior deslizable con un control de cierre visible.
5. THE Frontend SHALL dotar a los controles interactivos de áreas táctiles accesibles para
   su uso con una mano.
6. THE Frontend SHALL respetar las áreas seguras del dispositivo en viewports móviles.
7. WHILE el viewport corresponde a móvil, THE Panel_Administracion SHALL permanecer
   utilizable.

### Requirement 14: Accesibilidad y calidad visual

**User Story:** Como usuario con distintas capacidades, quiero una interfaz accesible y
clara, para operar la plataforma por teclado y comprender los estados sin depender del
color.

#### Acceptance Criteria

1. THE Frontend SHALL comunicar el Estado_Operativo y la Severidad mediante etiqueta
   textual e icono, sin depender únicamente del color.
2. THE Frontend SHALL mostrar un indicador de foco visible en los controles interactivos
   cuando reciben foco por teclado.
3. THE Frontend SHALL proporcionar etiquetas accesibles en botones y campos de entrada.
4. THE Frontend SHALL permitir operar por teclado los controles principales de navegación,
   filtros y formularios.
5. WHEN una acción del usuario tiene éxito o falla, THE Frontend SHALL mostrar un mensaje
   claro de éxito o de error correspondiente.
6. WHERE el usuario ha activado `prefers-reduced-motion`, THE Frontend SHALL reducir o
   suprimir las animaciones.

### Requirement 15: Marca, veracidad y datos de demostración

**User Story:** Como responsable de la marca, quiero que la demostración deje claro que
todo es ficticio y acotado a Real Plaza, para no inducir a error sobre operaciones reales.

#### Acceptance Criteria

1. THE Frontend SHALL usar "Real Plaza" como marca principal y SHALL acotar el contenido
   mostrado a sedes, aliados, eventos y puntos de Real Plaza.
2. THE Frontend SHALL identificar los datos operativos (puntos, coordenadas, capacidades,
   estados, eventos, RUC y teléfonos) como ficticios y de demostración.
3. THE Frontend SHALL evitar afirmaciones que presenten la plataforma como un sistema
   productivo o que indiquen integraciones, convenios, sedes habilitadas o emergencias
   reales.
