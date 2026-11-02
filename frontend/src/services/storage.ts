/**
 * Acceso centralizado y tipado a localStorage para el modo demo / respaldo.
 */

const PREFIX = 'rpc:';

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + clave);
    if (raw == null) return porDefecto;
    return JSON.parse(raw) as T;
  } catch {
    return porDefecto;
  }
}

export function escribir<T>(clave: string, valor: T): void {
  try {
    localStorage.setItem(PREFIX + clave, JSON.stringify(valor));
  } catch {
    // Silencioso: en modo demo la persistencia es best-effort.
  }
}

export function eliminar(clave: string): void {
  try {
    localStorage.removeItem(PREFIX + clave);
  } catch {
    // no-op
  }
}

/** Genera un ID estable simple para entidades creadas en el cliente. */
export function generarId(prefijo: string): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefijo}-${Date.now().toString(36)}-${rnd}`;
}
