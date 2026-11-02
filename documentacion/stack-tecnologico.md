# Stack tecnológico — Real Plaza Contigo

> **Estado:** en progreso. Las versiones provienen de los `package.json` reales
> del workspace. El backend se documentará cuando se cree su `package.json`.

## Monorepo

Raíz gestionada con **npm workspaces** (`frontend`, `backend`).

## Frontend (`frontend/package.json`)

Aplicación **React + TypeScript + Vite**, estilos con **Tailwind CSS**, mapa con
**Leaflet / React Leaflet** sobre **OpenStreetMap**.

### Dependencias de ejecución

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | ^18.3.1 | Librería de UI |
| react-dom | ^18.3.1 | Render en el DOM |
| leaflet | ^1.9.4 | Motor de mapas |
| react-leaflet | ^4.2.1 | Bindings de Leaflet para React |
| react-leaflet-cluster | ^2.1.0 | Clustering de marcadores |
| lucide-react | ^0.456.0 | Iconografía |
| framer-motion | ^11.11.17 | Animaciones sutiles |

### Dependencias de desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| vite | ^5.4.11 | Bundler / dev server |
| @vitejs/plugin-react | ^4.3.3 | Plugin React para Vite |
| typescript | ^5.6.3 | Tipado estático |
| tailwindcss | ^3.4.15 | Framework de estilos |
| postcss | ^8.4.49 | Procesado de CSS |
| autoprefixer | ^10.4.20 | Prefijos CSS automáticos |
| @types/leaflet | ^1.9.14 | Tipos de Leaflet |
| @types/react | ^18.3.12 | Tipos de React |
| @types/react-dom | ^18.3.1 | Tipos de React DOM |

> Cartografía: **OpenStreetMap** como proveedor de tiles, sin API key. Se debe
> incluir su atribución en el mapa.

## Backend

Pendiente de inicialización: Node.js + TypeScript + Express, PostgreSQL +
PostGIS, desplegable en AWS (Lambda + API Gateway).
