import type { Evento } from '@/types/domain';

/**
 * Eventos / desastres naturales ficticios de demostración.
 */
export const eventos: Evento[] = [
  {
    id: 'evt-inundacion-rimac',
    nombre: 'Inundación zona ribereña del Rímac',
    tipo: 'inundacion',
    descripcion: 'Desborde ficticio del río que afecta zonas aledañas. Escenario de demostración.',
    fechaInicio: '2026-10-21T08:00:00.000Z',
    estado: 'activo',
    zonaAfectada: 'Cercado de Lima / San Martín de Porres',
  },
  {
    id: 'evt-sismo-lima',
    nombre: 'Sismo moderado Lima Metropolitana',
    tipo: 'sismo',
    descripcion: 'Simulación de sismo de magnitud moderada con daños localizados.',
    fechaInicio: '2026-10-18T14:30:00.000Z',
    estado: 'monitoreo',
    zonaAfectada: 'Lima Metropolitana',
  },
  {
    id: 'evt-deslizamiento-comas',
    nombre: 'Deslizamiento en laderas de Comas',
    tipo: 'deslizamiento',
    descripcion: 'Deslizamiento ficticio en zonas de ladera tras lluvias.',
    fechaInicio: '2026-10-24T05:15:00.000Z',
    estado: 'activo',
    zonaAfectada: 'Comas / Los Olivos',
  },
  {
    id: 'evt-lluvias-norte',
    nombre: 'Lluvias intensas Lima Norte',
    tipo: 'lluvias_intensas',
    descripcion: 'Emergencia simulada por lluvias intensas en Lima Norte.',
    fechaInicio: '2026-10-26T20:00:00.000Z',
    estado: 'activo',
    zonaAfectada: 'Los Olivos / San Martín de Porres',
  },
  {
    id: 'evt-sismo-callao',
    nombre: 'Sismo réplica zona oeste',
    tipo: 'sismo',
    descripcion: 'Réplica simulada posterior al sismo principal.',
    fechaInicio: '2026-10-19T09:45:00.000Z',
    estado: 'cerrado',
    zonaAfectada: 'San Miguel / Cercado de Lima',
  },
];
