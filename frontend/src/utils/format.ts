import type {
  EstadoOperativo,
  SeveridadRiesgo,
  EstadoReporte,
  TipoIncidente,
  TipoDesastre,
  EstadoEvento,
  Coordenada,
} from '@/types/domain';

/** Etiqueta legible para cada estado operativo de acopio. */
export const etiquetaEstadoOperativo: Record<EstadoOperativo, string> = {
  operativo: 'Operativo',
  capacidad_limitada: 'Capacidad limitada',
  saturado: 'Saturado',
  cerrado: 'Temporalmente cerrado',
};

/** Etiqueta legible para cada nivel de severidad de riesgo. */
export const etiquetaSeveridad: Record<SeveridadRiesgo, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
};

/** Etiqueta legible para el estado de un reporte de riesgo. */
export const etiquetaEstadoReporte: Record<EstadoReporte, string> = {
  activo: 'Activo',
  en_verificacion: 'En verificación',
  resuelto: 'Resuelto',
};

/** Etiqueta legible para el tipo de incidente. */
export const etiquetaTipoIncidente: Record<TipoIncidente, string> = {
  inundacion: 'Inundación',
  derrumbe: 'Derrumbe',
  incendio: 'Incendio',
  sismo: 'Sismo',
  via_bloqueada: 'Vía bloqueada',
  otro: 'Otro',
};

/** Etiqueta legible para el tipo de desastre de un evento. */
export const etiquetaTipoDesastre: Record<TipoDesastre, string> = {
  inundacion: 'Inundación',
  sismo: 'Sismo',
  deslizamiento: 'Deslizamiento',
  lluvias_intensas: 'Lluvias intensas',
};

/** Etiqueta legible para el estado de un evento. */
export const etiquetaEstadoEvento: Record<EstadoEvento, string> = {
  activo: 'Activo',
  monitoreo: 'En monitoreo',
  cerrado: 'Cerrado',
};

/** Formatea una fecha ISO a una cadena legible en español (Lima). */
export function formatearFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Nivel de ocupación (0-100) derivado de capacidad y ocupación. */
export function nivelOcupacion(capacidad: number, ocupacion: number): number {
  if (capacidad <= 0) return 0;
  return Math.min(100, Math.round((ocupacion / capacidad) * 100));
}

/** URL de Google Maps para "Cómo llegar" a una coordenada. */
export function urlComoLlegar({ lat, lng }: Coordenada): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
