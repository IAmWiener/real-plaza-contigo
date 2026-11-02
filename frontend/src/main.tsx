/**
 * Punto de entrada de la aplicación Real Plaza Contigo (frontend).
 *
 * Monta el árbol de React dentro del elemento #root, envolviendo la app con el
 * proveedor de estado global (AppProvider). StrictMode ayuda a detectar efectos
 * y patrones inseguros durante el desarrollo.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Estilos globales (Tailwind + Leaflet + áreas seguras + reduced-motion).
import './index.css';

import { AppProvider } from '@/app/AppProvider';
import { App } from '@/app/App';

const contenedor = document.getElementById('root');

if (!contenedor) {
  throw new Error('No se encontró el elemento #root para montar la aplicación.');
}

createRoot(contenedor).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
