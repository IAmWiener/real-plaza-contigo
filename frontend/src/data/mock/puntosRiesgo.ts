import type { PuntoRiesgo } from '@/types/domain';

/**
 * Puntos de riesgo iniciales (reportes ciudadanos ficticios de demostración).
 * El usuario puede crear nuevos reportes desde el modo "Reporte de puntos
 * críticos"; se persisten en el backend (o en localStorage en modo demo).
 */
export const puntosRiesgo: PuntoRiesgo[] = [
  {
    id: 'pr-001', tipo: 'inundacion', severidad: 'alto',
    descripcion: 'Calle inundada, paso vehicular bloqueado (reporte ficticio).',
    coordenada: { lat: -12.0470, lng: -77.0420 }, radioMetros: 350,
    distrito: 'Cercado de Lima', estado: 'activo', reportadoEn: '2026-10-29T13:20:00.000Z',
  },
  {
    id: 'pr-002', tipo: 'derrumbe', severidad: 'critico',
    descripcion: 'Derrumbe en ladera, evacuar zona (reporte ficticio).',
    coordenada: { lat: -11.9420, lng: -77.0580 }, radioMetros: 500,
    distrito: 'Comas', estado: 'activo', reportadoEn: '2026-10-29T11:05:00.000Z',
  },
  {
    id: 'pr-003', tipo: 'via_bloqueada', severidad: 'medio',
    descripcion: 'Vía bloqueada por acumulación de agua (reporte ficticio).',
    coordenada: { lat: -11.9950, lng: -77.0750 }, radioMetros: 200,
    distrito: 'Los Olivos', estado: 'en_verificacion', reportadoEn: '2026-10-29T10:40:00.000Z',
  },
  {
    id: 'pr-004', tipo: 'incendio', severidad: 'alto',
    descripcion: 'Conato de incendio controlado parcialmente (reporte ficticio).',
    coordenada: { lat: -12.0800, lng: -77.0950 }, radioMetros: 250,
    distrito: 'San Miguel', estado: 'resuelto', reportadoEn: '2026-10-28T22:15:00.000Z',
  },
  {
    id: 'pr-005', tipo: 'otro', severidad: 'bajo',
    descripcion: 'Señalización dañada en avenida principal (reporte ficticio).',
    coordenada: { lat: -12.1180, lng: -77.0290 }, radioMetros: 150,
    distrito: 'Miraflores', estado: 'activo', reportadoEn: '2026-10-29T09:00:00.000Z',
  },
];
