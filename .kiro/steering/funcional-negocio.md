---
inclusion: always
---

# REAL PLAZA CONTIGO — Definición funcional y de negocio

Este documento describe QUÉ debe hacer la plataforma y POR QUÉ, desde la
perspectiva de negocio y de experiencia de usuario. Las decisiones de stack,
arquitectura de código, estilo, backend y despliegue en AWS están en el steering
de tecnología.

## 1. Rol y objetivo de negocio

Real Plaza Contigo es una iniciativa digital de Real Plaza para organizar y
visibilizar, ante emergencias y desastres naturales:

- **Centros de acopio**: dónde se reciben y entregan recursos de apoyo.
- **Puntos críticos / de riesgo**: zonas donde está ocurriendo un incidente y
  que deben advertirse a la comunidad.

La experiencia debe transmitir cercanía, confianza y coordinación con las
comunidades, bajo el lema "Una red de apoyo para nuestras comunidades".

El alcance es una **plataforma full-stack** funcional, visualmente impactante y
responsive: un **frontend** web y un **backend** (API REST con PostgreSQL +
PostGIS) que es la fuente de verdad de los datos. Toda la infraestructura se
despliega en **AWS**. Durante el desarrollo local el frontend puede operar con
datos mockeados como respaldo (modo demo), pero su objetivo es consumir la API
real.

Aunque la plataforma sea funcional end-to-end, los datos operativos cargados
(sedes, puntos, eventos, reportes) son **ficticios y de demostración**: no
representan operaciones, emergencias ni ubicaciones reales de Real Plaza.

### Reglas de marca y veracidad (obligatorias)

- Usa **Real Plaza** como marca principal.
- Todo el contenido está **acotado exclusivamente a Real Plaza** (sedes,
  aliados, eventos y puntos).
- No presentes la demo como un sistema productivo ni afirmes que existen
  integraciones, convenios, sedes habilitadas o emergencias reales.
- **Todo dato operativo (puntos, coordenadas, capacidades, estados, eventos,
  RUC, teléfonos) debe identificarse claramente como ficticio / de
  demostración.**
- Puedes usar sedes conocidas de Real Plaza como referencia de contexto, pero
  deja claro que los puntos y sus datos no representan operaciones reales.

## 2. Modos de la plataforma: Acopio vs. Riesgo

La interfaz debe ofrecer un **selector visual principal** que permita al usuario
escoger qué quiere ver y hacer sobre el mapa. Este selector es un elemento
central de la experiencia, no un filtro secundario.

Modos:

1. **Centros de acopio** — explorar y gestionar puntos de acopio (flujo
   existente).
2. **Reporte de puntos críticos** — visualizar y reportar zonas de riesgo /
   incidentes activos.

Requisitos del selector:

- Debe ser claramente visible y accesible tanto en escritorio como en móvil.
- Debe usar etiqueta textual + icono (no depender solo del color).
- Al cambiar de modo, el mapa, los filtros y los paneles deben reflejar el
  contenido del modo activo.
- El usuario puede alternar entre modos sin perder el mapa de vista.

## 3. Funcionalidad: Marcar puntos de riesgo (NUEVO)

Cualquier persona que se conecte a la demo puede **marcar un punto o un rango
perimetral de riesgo** sobre el mapa para advertir a las demás personas de un
incidente en curso.

### Comportamiento esperado

- El usuario activa el modo "Reporte de puntos críticos".
- Puede **marcar una zona de riesgo** definiendo un **rango perimetral**
  (radio alrededor de un punto, o un área) directamente sobre el mapa.
- La zona de riesgo se visualiza con un **área/círculo perimetral** más un
  marcador central diferenciado del de los centros de acopio.
- Se muestra como **advertencia** a cualquier otro usuario que explore el mapa
  en ese modo.
- El flujo de marcado debe ser simple y usable con una mano en móvil
  (seleccionar ubicación, ajustar radio, confirmar).

### Datos de un punto de riesgo (mockeados)

Cada reporte de riesgo debe tener al menos:

1. Identificador estable.
2. Tipo de incidente (p. ej. inundación, derrumbe, incendio, sismo, vía
   bloqueada, otro).
3. Nivel de severidad (con etiqueta textual + icono, no solo color).
4. Coordenadas del centro del área.
5. Radio o rango perimetral afectado.
6. Distrito / zona.
7. Descripción breve del incidente.
8. Fecha y hora de reporte simulada.
9. Estado del reporte (activo, en verificación, resuelto).
10. Indicación explícita de que es un reporte ciudadano de demostración.

### Reglas de la funcionalidad de riesgo

- Los reportes creados por el usuario deben **persistir en el backend** (y
  reflejarse de inmediato en el mapa), igual que los centros de acopio. En modo
  demo sin API disponible, se persisten en `localStorage` como respaldo.
- Debe existir una acción para **eliminar o resolver** un reporte propio con
  confirmación.
- El panel de administración debe permitir gestionar también estos reportes de
  riesgo.
- Marca con claridad que los reportes de riesgo son **ficticios y de
  demostración**; no representan emergencias reales.
- Visualmente, diferencia sin ambigüedad las zonas de riesgo de los centros de
  acopio (icono, forma del marcador, área perimetral y etiquetas textuales).

## 4. Vistas de la aplicación

La vista principal abre directamente en el **mapa**, con el selector de modo
(Acopio / Riesgo) visible.

Vistas principales:

1. **Mapa** — centros de acopio y/o puntos críticos según el modo activo.
2. **Panel de administración** de la información del sistema (acopio y riesgo),
   conectado a la API.

### A. Header

- Logotipo tipográfico "Real Plaza Contigo" respetando la identidad de Real
  Plaza.
- Texto secundario: "Una red de apoyo para nuestras comunidades".
- Indicador de entorno **DEMO**.
- Selector de modo Acopio / Riesgo (o acceso claro a él).
- Botón para cambiar entre mapa y administración.
- Botón de ubicación actual.
- Diseño adaptable a pantallas pequeñas.
- No inventes conexión ni sincronización real; si hay un estado, identifícalo
  como dato de demostración.

### B. Mapa interactivo

- Centrado inicialmente en Lima Metropolitana, Perú.
- Marcadores personalizados por categoría y diferenciados por estado operativo
  (acopio).
- Zonas de riesgo con área/círculo perimetral y marcador central diferenciado.
- Clustering cuando existan muchos puntos.
- Popups informativos al seleccionar marcadores.
- Selección de un marcador que abra su ficha de detalle.
- Zoom y desplazamiento.
- Control para volver a la vista inicial.
- Control para centrar en la ubicación del usuario (previa autorización del
  navegador).
- Ajuste del mapa a los puntos filtrados y actualización al cambiar filtros o
  modo.
- Indicador visual del punto/zona seleccionada.

### C. Panel de búsqueda y filtros

Escritorio: panel lateral que convive con el mapa. Móvil: panel inferior
deslizable o lista superpuesta que no oculte el mapa.

Para centros de acopio incluye:

- Buscador por nombre del punto, sede, aliado, dirección o distrito.
- Filtro por categoría, estado operativo, evento/desastre y distrito.
- Botón para limpiar filtros.
- Contador de resultados y lista de puntos.
- Selección de un resultado que centre el mapa y abra el detalle.

Para puntos de riesgo incluye:

- Buscador por descripción, tipo de incidente o distrito.
- Filtro por tipo de incidente, severidad y estado del reporte.
- Botón para limpiar filtros y contador de resultados.

Los filtros deben operar realmente sobre los datos del sistema (API, o datos
mockeados en modo demo). Cuando no haya resultados, muestra un estado vacío bien
diseñado con acción para limpiar filtros.

### D. Ficha de detalle del punto de acopio

Información organizada y jerarquizada (prioriza estado, ubicación, recursos y
disponibilidad):

1. Nombre del punto.
2. Código identificador.
3. Estado operativo.
4. Categorías atendidas.
5. Sede de Real Plaza responsable y/o aliado participante.
6. Nombre de sede, aliado y datos comerciales ficticios cuando se requieran.
7. RUC ficticio, claramente identificado como dato de demostración.
8. Evento o desastre natural asociado.
9. Tipo de desastre.
10. Dirección, distrito y coordenadas.
11. Horario de atención.
12. Persona de contacto y teléfono ficticio.
13. Recursos disponibles.
14. Capacidad y nivel de ocupación.
15. Fecha y hora de última actualización simulada.
16. Observaciones operativas.

Acciones funcionales:

- "Cómo llegar": abre Google Maps con las coordenadas del punto.
- "Copiar dirección": copia la dirección al portapapeles.
- "Compartir punto": Web Share API con fallback de copia de enlace.
- "Ver evento": muestra la información del evento asociado.
- Cerrar la ficha y volver a la exploración del mapa.

Móvil: bottom sheet o panel deslizable. Escritorio: drawer lateral o panel de
detalle.

### D-bis. Ficha de detalle del punto de riesgo

Al seleccionar una zona de riesgo, muestra su ficha priorizando severidad,
ubicación y estado:

- Tipo de incidente y nivel de severidad (etiqueta + icono).
- Descripción del incidente.
- Distrito, coordenadas y rango perimetral afectado.
- Fecha y hora de reporte y estado del reporte.
- Indicación de que es un reporte ciudadano de demostración.
- Acciones: "Cómo llegar", "Compartir", "Resolver / eliminar reporte" (con
  confirmación) y cerrar.

### E. Categorías y recursos

Categorías mockeadas relevantes para Real Plaza y la atención de emergencias:

- Alimentos.
- Agua potable.
- Salud y primeros auxilios.
- Ropa y abrigo.
- Refugio temporal.
- Higiene.
- Rescate y asistencia.

Cada punto de acopio se asocia a una sede de Real Plaza, uno o más aliados, un
evento y varias categorías. Cada recurso debe tener nombre, unidad de medida,
cantidad disponible, cantidad comprometida (si aplica) y estado de
disponibilidad. El nivel de ocupación/disponibilidad se calcula a partir de los
valores reales de los datos, no con porcentajes arbitrarios.

### F. Eventos y desastres naturales

Eventos de demostración: inundación, sismo, deslizamiento, emergencia por
lluvias intensas. Cada evento contiene identificador, nombre, tipo,
descripción, fecha de inicio, estado, distrito/zona afectada y puntos de acopio
asociados. La ficha de cada punto permite consultar su evento. Eventos y
ubicaciones se identifican como datos ficticios de demostración.

### G. Panel de administración (demostración)

Gestiona centros de acopio y reportes de riesgo:

- Tabla/listado con búsqueda y filtros por categoría/estado (acopio) y por
  tipo/severidad/estado (riesgo).
- Crear, editar y eliminar (con confirmación).
- Formulario con validación.
- Selector de sede/centro responsable y de aliado cuando corresponda.
- Selector de evento y de categorías.
- Campos de dirección, coordenadas, capacidad, estado y contacto.
- Para riesgo: tipo de incidente, severidad, radio/rango, descripción y estado.

Crear, editar y eliminar actualizan el estado y se reflejan de inmediato en el
mapa. Los cambios se persisten a través de la API (backend); en modo demo sin
API se usa `localStorage` como respaldo, con una opción para restaurar los datos
iniciales de demostración. La autenticación no es el foco de esta entrega; si se
habilita, debe ser mínima.

## 5. Datos del dominio (negocio)

Entidades/recursos independientes: empresas (sedes), categorias, eventos,
puntosAcopio, recursos y **puntosRiesgo**. Identificadores estables y relaciones
por ID, sin duplicar innecesariamente información de sedes, aliados y eventos.
El backend es la fuente de verdad; en modo demo existen los mismos datos como
seeds/mocks.

El conjunto de datos iniciales de demostración (seeds del backend y mocks del
frontend) debe contener al menos:

- 8 sedes/centros comerciales de Real Plaza (datos de demostración).
- 7 categorías.
- 5 eventos.
- 15 puntos de acopio.
- Varios recursos por punto.
- Un conjunto inicial de puntos de riesgo de ejemplo (para probar el modo y los
  filtros).

Distribuye ubicaciones ficticias por distintas zonas de Lima Metropolitana:
San Isidro, Miraflores, San Miguel, Jesús María, Cercado de Lima, San Martín de
Porres, Los Olivos y Comas. Coordenadas geográficamente plausibles, pero no
presentadas como ubicaciones reales.

Estados operativos de acopio: operativo, capacidad limitada, saturado y
temporalmente cerrado. Los datos deben tener variedad suficiente para probar
todos los filtros, estados, categorías, relaciones y ambos modos.

## 6. Criterios de aceptación (negocio y funcional)

La tarea se considera completa solo cuando:

1. El frontend y el backend arrancan con sus comandos de desarrollo.
2. El backend expone la API y responde con los datos sembrados (seeds).
3. El frontend consume la API real y los marcadores aparecen en las ubicaciones
   provistas por el backend (o por los mocks en modo demo).
4. El mapa real se renderiza y permite zoom y desplazamiento.
5. El selector de modo Acopio / Riesgo funciona y cambia el contenido del mapa.
6. El usuario puede marcar un punto/zona de riesgo con rango perimetral y se
   visualiza como advertencia.
7. Los reportes de riesgo creados se guardan en el backend, persisten tras
   recargar y pueden resolverse/eliminarse.
8. Los filtros y la búsqueda funcionan combinados en ambos modos.
9. Seleccionar un punto o una zona abre su ficha correcta.
10. Las acciones de copiar dirección y cómo llegar funcionan.
11. Las relaciones con sedes, aliados, categorías, recursos y eventos son
    coherentes (y se respetan vía las relaciones por ID del backend).
12. Crear, editar y eliminar (acopio y riesgo) actualizan el backend, el mapa y
    la lista.
13. Los cambios persisten tras recargar; en modo demo, la restauración de datos
    iniciales funciona.
14. La interfaz es responsive y utilizable en móvil.
15. No hay botones principales sin acción implementada ni endpoints declarados
    sin implementar.
16. La interfaz se ve cuidada con datos y con estados vacíos.
17. Todos los datos operativos están claramente identificados como ficticios /
    de demostración y acotados a Real Plaza.
