/**
 * Cálculo de agregados (KPIs) para el panel de Resumen.
 *
 * Funciones puras que, a partir de las colecciones ya cargadas en memoria
 * (puntos de acopio enriquecidos y puntos de riesgo), derivan los indicadores
 * que alimentan el dashboard combinado. No producen efectos secundarios ni
 * dependen de React, de modo que son fáciles de probar y memoizar.
 *
 * Todos los datos son ficticios y de demostración.
 */

import type {
  EstadoOperativo,
  EstadoReporte,
  PuntoRiesgo,
  SeveridadRiesgo,
  TipoIncidente,
} from '@/types/domain';
import type { PuntoAcopioVista } from '@/types/ui';

/** Un tramo de una distribución (etiqueta → cantidad), para barras/listas. */
export interface Tramo<K extends string> {
  clave: K;
  cantidad: number;
}

/** KPIs del modo de centros de acopio. */
export interface EstadisticasAcopio {
  /** Número total de centros de acopio. */
  total: number;
  /** Centros en estado "operativo" o "capacidad_limitada" (reciben ayuda). */
  disponibles: number;
  /** Centros "saturado" o "cerrado" (no reciben o están al límite). */
  noDisponibles: number;
  /** Ocupación promedio (0-100) sobre todos los centros. */
  ocupacionPromedio: number;
  /**
   * Capacidad disponible agregada: suma de `capacidad - ocupacion` de los
   * centros que no están cerrados, acotada a valores no negativos.
   */
  capacidadDisponible: number;
  /** Distribución por estado operativo, en orden fijo de presentación. */
  porEstado: Tramo<EstadoOperativo>[];
}

/** KPIs del modo de puntos de riesgo. */
export interface EstadisticasRiesgo {
  /** Número total de reportes de riesgo. */
  total: number;
  /** Reportes en estado "activo" o "en_verificacion" (vigentes). */
  activos: number;
  /** Reportes marcados como "resuelto". */
  resueltos: number;
  /** Reportes de severidad "alto" o "critico". */
  severosActivos: number;
  /** Distribución por severidad, en orden de gravedad ascendente. */
  porSeveridad: Tramo<SeveridadRiesgo>[];
  /** Distribución por tipo de incidente (solo tipos con al menos 1 reporte). */
  porTipo: Tramo<TipoIncidente>[];
}

/** Agregado combinado para el panel de Resumen. */
export interface EstadisticasResumen {
  acopio: EstadisticasAcopio;
  riesgo: EstadisticasRiesgo;
}

/** Orden de presentación de los estados operativos de acopio. */
const ORDEN_ESTADO_OPERATIVO: EstadoOperativo[] = [
  'operativo',
  'capacidad_limitada',
  'saturado',
  'cerrado',
];

/** Orden de presentación de las severidades (de menor a mayor gravedad). */
const ORDEN_SEVERIDAD: SeveridadRiesgo[] = ['bajo', 'medio', 'alto', 'critico'];

/** Cuenta ocurrencias de una clave derivada de cada elemento. */
function contarPor<T, K extends string>(
  items: T[],
  clave: (item: T) => K,
): Map<K, number> {
  const mapa = new Map<K, number>();
  for (const item of items) {
    const k = clave(item);
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return mapa;
}

/** Calcula los KPIs de centros de acopio. */
export function estadisticasAcopio(
  puntos: PuntoAcopioVista[],
): EstadisticasAcopio {
  const total = puntos.length;
  const conteoEstado = contarPor(puntos, (p) => p.estado);

  const disponibles =
    (conteoEstado.get('operativo') ?? 0) +
    (conteoEstado.get('capacidad_limitada') ?? 0);
  const noDisponibles = total - disponibles;

  const sumaOcupacion = puntos.reduce((acc, p) => acc + p.ocupacionPct, 0);
  const ocupacionPromedio = total > 0 ? Math.round(sumaOcupacion / total) : 0;

  // Cupo libre real: capacidad menos ocupación en los centros que siguen
  // operando (excluye los cerrados). Cada término se acota a >= 0.
  const capacidadDisponible = puntos
    .filter((p) => p.estado !== 'cerrado')
    .reduce((acc, p) => acc + Math.max(0, p.capacidad - p.ocupacion), 0);

  const porEstado = ORDEN_ESTADO_OPERATIVO.map((clave) => ({
    clave,
    cantidad: conteoEstado.get(clave) ?? 0,
  }));

  return {
    total,
    disponibles,
    noDisponibles,
    ocupacionPromedio,
    capacidadDisponible,
    porEstado,
  };
}

/** Calcula los KPIs de puntos de riesgo. */
export function estadisticasRiesgo(puntos: PuntoRiesgo[]): EstadisticasRiesgo {
  const total = puntos.length;
  const conteoEstadoReporte = contarPor<PuntoRiesgo, EstadoReporte>(
    puntos,
    (p) => p.estado,
  );
  const resueltos = conteoEstadoReporte.get('resuelto') ?? 0;
  const activos = total - resueltos;

  const conteoSeveridad = contarPor(puntos, (p) => p.severidad);
  const severosActivos = puntos.filter(
    (p) =>
      p.estado !== 'resuelto' &&
      (p.severidad === 'alto' || p.severidad === 'critico'),
  ).length;

  const porSeveridad = ORDEN_SEVERIDAD.map((clave) => ({
    clave,
    cantidad: conteoSeveridad.get(clave) ?? 0,
  }));

  const conteoTipo = contarPor(puntos, (p) => p.tipo);
  const porTipo = Array.from(conteoTipo.entries())
    .map(([clave, cantidad]) => ({ clave, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  return { total, activos, resueltos, severosActivos, porSeveridad, porTipo };
}

/** Agregado combinado (acopio + riesgo) para el panel de Resumen. */
export function estadisticasResumen(
  acopio: PuntoAcopioVista[],
  riesgo: PuntoRiesgo[],
): EstadisticasResumen {
  return {
    acopio: estadisticasAcopio(acopio),
    riesgo: estadisticasRiesgo(riesgo),
  };
}
