---
inclusion: always
---

# REAL PLAZA CONTIGO — Definición tecnológica

Este documento describe CÓMO construir la plataforma: stack, arquitectura de
código, dirección visual, accesibilidad técnica, experiencia mobile,
backend, despliegue en AWS y orden de ejecución. El QUÉ y el POR QUÉ (negocio y
funcionalidad) están en el steering funcional y de negocio.

## 0. Alcance y estructura del proyecto

La plataforma se compone de **dos proyectos** dentro de un único workspace
(monorepo):

- **`frontend/`** — aplicación web (React + TypeScript + Vite) que consume la
  API del backend.
- **`backend/`** — API REST (Node.js + TypeScript) con PostgreSQL + PostGIS para
  las consultas geoespaciales.

Toda la infraestructura (API, base de datos, hosting del frontend) se despliega
en **AWS**. Ver secciones 10 (backend) y 11 (AWS).

Durante el desarrollo local, el frontend puede arrancar con datos mockeados como
respaldo (modo demo), pero el objetivo es que consuma la API real del backend a
través de una capa de servicios configurable por variable de entorno
(`VITE_API_BASE_URL`).

## 1. Rol técnico

Actúa como Senior Full-Stack Engineer, UX/UI Designer, especialista en
aplicaciones geoespaciales y en despliegue en AWS.

**IMPORTANTE:** No te limites a proponer una arquitectura, crear un plan o
mostrar fragmentos de código. Inspecciona el proyecto actual, implementa la
solución, crea los archivos necesarios, instala las dependencias que falten y
verifica que la aplicación compile y funcione.

Si el proyecto ya tiene estructura o componentes reutilizables, revísalos antes
de modificarlos. Conserva lo útil y evita sobrescribir archivos
innecesariamente.

## 2. Stack tecnológico del frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Leaflet y React Leaflet para el mapa interactivo.
- OpenStreetMap como proveedor de cartografía.
- Lucide React para iconografía.
- Framer Motion para animaciones sutiles, solo cuando aporte valor.
- Capa de servicios HTTP (fetch o axios) para consumir la API del backend.
- Datos mockeados en módulos TypeScript como respaldo/modo demo, separados del
  código de presentación.

Restricciones y consideraciones:

- El mapa debe visualizarse sin API key. Incluye la atribución de OpenStreetMap
  y contempla los estados de carga y error del mapa.
- Si utilizas clustering, instala y configura una librería compatible con React
  Leaflet.
- Para dibujar las zonas de riesgo (círculo/área perimetral) usa las primitivas
  de Leaflet / React Leaflet (p. ej. `Circle`) sin dependencias innecesarias.
- La URL base de la API se configura por variable de entorno
  (`VITE_API_BASE_URL`); nunca hardcodear endpoints ni credenciales.
- No incluir secretos ni claves en el código del frontend.

## 3. Dirección visual

Interfaz premium, moderna, tecnológica y profesional, alineada con una
plataforma digital de Real Plaza para coordinar apoyo, acopio y respuesta ante
emergencias. No una plantilla administrativa genérica ni un CRUD convencional.

Referencias conceptuales:

- Plataformas modernas de geospatial intelligence.
- Interfaces de gestión de operaciones en tiempo real.
- Aplicaciones de mapas con paneles flotantes.
- Diseño editorial minimalista combinado con visualización geográfica.

Sistema visual:

- Iconografía consistente mediante Lucide.
- Bordes suaves, sombras discretas y tarjetas bien estructuradas.
- Microinteracciones y transiciones fluidas.
- Evita el exceso de gradientes, efectos de vidrio, sombras pesadas y
  decoración innecesaria.
- El mapa es el protagonista de la interfaz.
- Los colores de estado deben acompañarse de etiquetas textuales e iconos; no
  deben depender únicamente del color para comunicar información (aplica tanto a
  estados de acopio como a severidad de riesgo).
- Diferencia visualmente los dos modos (Acopio / Riesgo) y los marcadores de
  cada tipo mediante icono y forma, no solo color.

## 4. Arquitectura de código

Monorepo con dos paquetes independientes bajo la raíz del workspace:

```
frontend/
  src/
    app/
    components/
      layout/
      map/
      filters/
      points/
      events/
      risk/
      administration/
      ui/
    data/
      mock/
    hooks/
    services/      # clientes HTTP hacia la API del backend
    types/
    utils/

backend/
  src/
    config/        # carga de entorno, conexión a BD
    modules/       # dominios: sedes, categorias, eventos, acopio, recursos, riesgo
      <modulo>/
        <modulo>.controller.ts
        <modulo>.service.ts
        <modulo>.routes.ts
        <modulo>.schema.ts   # validación (zod) y tipos
    middlewares/   # errores, validación, cors, logging
    db/            # migraciones, seeds, cliente ORM
    types/
    utils/
    app.ts         # instancia del servidor
    server.ts      # bootstrap
```

`frontend/src/components/risk/` agrupa la UI de reporte y visualización de
puntos críticos. Adapta la estructura si un proyecto ya usa otra convención.

Compartir tipos: define las entidades del dominio en el backend y réplica/alinea
los tipos equivalentes en el frontend (o extrae un paquete compartido si el
proyecto crece). Mantén nombres y relaciones por ID coherentes entre ambos.

Requisitos:

- Separar lógica de negocio y presentación.
- Centralizar los tipos TypeScript en `types/` (incluye los tipos de puntos de
  riesgo y severidad).
- Centralizar las operaciones sobre datos mockeados en `services/` (incluyendo
  CRUD de acopio y de reportes de riesgo).
- Evitar componentes monolíticos.
- Evitar duplicación de la lógica de filtros; reutilizar hooks/utilidades de
  filtrado para ambos modos cuando sea razonable.
- Utilizar componentes reutilizables.
- Mantener un estado coherente entre mapa, filtros, modo activo, selección y
  administración.
- Evitar errores de tipado.
- Implementar manejo de errores y estados vacíos.
- Evitar dependencias innecesarias.

No agregues una arquitectura empresarial compleja para una demo frontend.

## 5. Consumo de datos y persistencia

- La fuente de verdad de los datos es la **API del backend** (PostgreSQL +
  PostGIS).
- El frontend accede a los datos exclusivamente a través de su capa de
  `services/` (clientes HTTP), nunca con llamadas dispersas.
- Modo demo / respaldo: si no hay `VITE_API_BASE_URL` configurada o la API no
  responde, el frontend puede caer a datos mockeados y `localStorage` para que
  la demo siga siendo navegable. Este modo debe identificarse claramente como
  demostración.
- Centraliza el acceso a `localStorage` (en `services/` o `hooks/`) para
  mantener tipado seguro y evitar accesos dispersos.
- Provee una opción para restaurar los datos iniciales de demostración en el
  modo respaldo.

## 6. Experiencia mobile (técnica)

La aplicación debe funcionar correctamente desde 360 px de ancho.

En móvil:

- El mapa ocupa la mayor parte del viewport.
- Los controles son accesibles con una mano (incluido el flujo de marcar un
  punto de riesgo).
- El buscador permanece fácil de encontrar.
- Los filtros se abren en un panel compacto.
- La lista de resultados se puede deslizar.
- La ficha de detalle tiene un botón de cierre evidente.
- Los botones tienen áreas táctiles adecuadas.
- Evita scroll horizontal.
- Respeta las áreas seguras de dispositivos móviles.
- El panel de administración sigue siendo utilizable en pantallas pequeñas.

En escritorio, aprovecha el espacio con un panel lateral y un mapa amplio.

## 7. Accesibilidad y calidad visual (técnica)

- Contraste adecuado.
- Estados de foco visibles.
- Etiquetas accesibles en botones e inputs.
- Navegación por teclado cuando corresponda.
- Etiquetas textuales para estados críticos y niveles de severidad.
- Mensajes claros de error y éxito.
- Animaciones discretas y respetuosas con `prefers-reduced-motion`.

No sacrifiques usabilidad por decoración.

## 8. Calidad de código y verificación

- No deben existir errores de compilación ni errores críticos en consola.
- Ejecuta el build y las comprobaciones disponibles (type-check, lint) y corrige
  los errores encontrados, tanto en frontend como en backend.
- No dejes botones principales sin acción implementada ni endpoints declarados
  sin implementación.
- La interfaz debe verse cuidada tanto con datos como en estados vacíos.

## 9. Stack tecnológico del backend

- Node.js + TypeScript.
- Framework HTTP: Express (ligero y suficiente para la API REST). Puede usarse
  NestJS si el proyecto crece.
- PostgreSQL como base de datos relacional.
- **PostGIS** como extensión geoespacial para almacenar y consultar ubicaciones
  (puntos de acopio) y áreas/perímetros de riesgo (p. ej. `geography(Point)` y
  radios o polígonos).
- ORM/Query builder: Prisma (o Drizzle) para esquema, migraciones y acceso
  tipado a datos.
- Validación de entrada con zod (o equivalente) en cada endpoint.
- CORS configurado para permitir el origen del frontend.
- Variables de entorno para la configuración (cadena de conexión a BD, puerto,
  origen permitido). Nunca hardcodear credenciales; usar `.env` en local y
  gestores de secretos en AWS.

Requisitos del backend:

- API REST con recursos para sedes/empresas, categorías, eventos, puntos de
  acopio, recursos y **puntos de riesgo**, con operaciones CRUD donde aplique.
- Endpoints geoespaciales: búsqueda de puntos por cercanía (bounding box o
  radio) aprovechando PostGIS.
- Respuestas y errores consistentes (códigos HTTP correctos, formato de error
  uniforme).
- Migraciones y seeds que carguen los datos iniciales de demostración
  (claramente identificados como ficticios), coherentes con el steering
  funcional.
- Separar controladores (HTTP), servicios (lógica de negocio) y acceso a datos
  (ORM). Evitar lógica de negocio en los controladores.
- Manejo centralizado de errores y logging.

## 10. Despliegue en AWS

Toda la plataforma se despliega en AWS. Mantén la arquitectura lo más simple
posible que cumpla el objetivo; no sobre-dimensiones.

Componentes de referencia:

- **Base de datos:** Amazon RDS for PostgreSQL con la extensión PostGIS
  habilitada. Credenciales gestionadas con AWS Secrets Manager (no en el
  repositorio).
- **Backend / API:** desplegado como **serverless** en AWS: **AWS Lambda +
  Amazon API Gateway**. La app Express se adapta a Lambda mediante un handler
  (p. ej. `@codegenie/serverless-express` o `aws-lambda-fastify`/equivalente),
  de modo que el mismo código corra en local (servidor Express) y en AWS
  (Lambda). Esta es la opción elegida; manténla consistente.
- **Frontend:** build estático de Vite publicado en Amazon S3 y servido con
  Amazon CloudFront (CDN + HTTPS).
- **Red y seguridad:** la base de datos en subredes privadas; el backend accede
  por VPC; security groups restrictivos; HTTPS en los endpoints públicos.
- **Infraestructura como código:** preferible definir la infraestructura con AWS
  CDK (TypeScript) o CloudFormation para que el despliegue sea reproducible.
- **Configuración por entorno:** variables y secretos por ambiente
  (dev/prod); el frontend recibe `VITE_API_BASE_URL` apuntando al dominio de la
  API en el build correspondiente.

Antes de aprovisionar recursos reales en AWS (que pueden generar costos o
afectar entornos compartidos), confirma con el usuario la región, el perfil/
credenciales y el entorno objetivo. Favorece pasos reproducibles vía IaC sobre
cambios manuales en la consola.

## 11. Orden de ejecución

1. Inspecciona los archivos y dependencias existentes del workspace.
2. Define el modelo de datos del dominio (incluye puntos de riesgo) y los tipos
   TypeScript compartidos/alineados entre backend y frontend.

Backend:

3. Inicializa el proyecto `backend/` (Node + TypeScript + Express).
4. Configura PostgreSQL + PostGIS, el ORM, el esquema y las migraciones.
5. Crea seeds con los datos iniciales de demostración (ficticios).
6. Implementa los módulos y endpoints REST (CRUD + consultas geoespaciales).
7. Agrega validación, manejo de errores, CORS y logging.
8. Ejecuta type-check/lint/build del backend y prueba los endpoints localmente.

Frontend:

9. Inicializa el proyecto `frontend/` (React + TypeScript + Vite + Tailwind).
10. Implementa la estructura visual y el sistema de estilos.
11. Implementa la capa de `services/` que consume la API (con modo mock de
    respaldo).
12. Implementa el mapa, los marcadores y el selector de modo Acopio / Riesgo.
13. Implementa búsqueda, filtros y selección para ambos modos.
14. Implementa el detalle de punto de acopio y el detalle de punto de riesgo.
15. Implementa el flujo de marcar/reportar zonas de riesgo con rango perimetral.
16. Implementa el panel de administración conectado a la API (acopio y riesgo).
17. Ajusta la experiencia mobile.
18. Ejecuta el build y las comprobaciones del frontend.

Integración y despliegue:

19. Verifica la integración frontend ↔ backend en local (variables de entorno,
    CORS, datos reales desde la API).
20. Prepara el despliegue en AWS (IaC con CDK/CloudFormation, Docker si aplica,
    RDS con PostGIS, S3 + CloudFront para el frontend). Confirma región, perfil
    y entorno con el usuario antes de aprovisionar recursos reales.
21. Corrige los errores encontrados.
22. Presenta un resumen de lo implementado, los archivos principales, las
    dependencias agregadas, las variables de entorno y los comandos para
    ejecutar y desplegar ambos proyectos.

Si encuentras limitaciones del entorno, resuélvelas de la forma más sencilla
posible sin sustituir las funcionalidades principales por simulaciones visuales.

**Resultado esperado:** una plataforma full-stack ejecutable (frontend React +
backend Node/TypeScript con PostgreSQL + PostGIS) desplegable en AWS, funcional,
visualmente impactante y con una integración real entre la interfaz y la API.
