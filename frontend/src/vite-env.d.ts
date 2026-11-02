/// <reference types="vite/client" />

/**
 * Tipado de las variables de entorno expuestas por Vite a traves de
 * `import.meta.env`.
 *
 * `VITE_API_BASE_URL` es OPCIONAL: cuando esta ausente o vacia, el frontend
 * opera en Modo_Demo (datos mockeados + localStorage). Cuando contiene una URL
 * no vacia, la Capa_Servicios dirige las operaciones de datos a esa API.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /**
   * Clave de los basemaps de CARTO (opcional). Si está presente, el mapa usa el
   * estilo CARTO (Positron); si no, cae a OpenStreetMap estándar.
   */
  readonly VITE_CARTO_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
