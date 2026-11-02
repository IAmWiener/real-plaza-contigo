import type { Empresa } from '@/types/domain';

/**
 * Sedes de Real Plaza y aliados participantes.
 * DATOS FICTICIOS DE DEMOSTRACIÓN — RUC, teléfonos y relaciones son inventados.
 */
export const empresas: Empresa[] = [
  { id: 'sede-salaverry', nombre: 'Real Plaza Salaverry', tipo: 'sede', ruc: '20100000011', distrito: 'Jesús María', telefono: '(01) 500-0011' },
  { id: 'sede-primavera', nombre: 'Real Plaza Primavera', tipo: 'sede', ruc: '20100000022', distrito: 'San Borja', telefono: '(01) 500-0022' },
  { id: 'sede-centro-civico', nombre: 'Real Plaza Centro Cívico', tipo: 'sede', ruc: '20100000033', distrito: 'Cercado de Lima', telefono: '(01) 500-0033' },
  { id: 'sede-pro', nombre: 'Real Plaza Pro', tipo: 'sede', ruc: '20100000044', distrito: 'Los Olivos', telefono: '(01) 500-0044' },
  { id: 'sede-plaza-norte', nombre: 'Real Plaza Plaza Norte (ref.)', tipo: 'sede', ruc: '20100000055', distrito: 'Independencia', telefono: '(01) 500-0055' },
  { id: 'sede-san-miguel', nombre: 'Real Plaza San Miguel', tipo: 'sede', ruc: '20100000066', distrito: 'San Miguel', telefono: '(01) 500-0066' },
  { id: 'sede-cajamarca', nombre: 'Real Plaza Guardia Civil (ref.)', tipo: 'sede', ruc: '20100000077', distrito: 'Chorrillos', telefono: '(01) 500-0077' },
  { id: 'sede-puruchuco', nombre: 'Real Plaza Puruchuco', tipo: 'sede', ruc: '20100000088', distrito: 'Ate', telefono: '(01) 500-0088' },
  { id: 'aliado-cruz-apoyo', nombre: 'Aliado Cruz de Apoyo', tipo: 'aliado', ruc: '20200000011', distrito: 'Miraflores', telefono: '(01) 700-0011' },
  { id: 'aliado-manos-unidas', nombre: 'Aliado Manos Unidas', tipo: 'aliado', ruc: '20200000022', distrito: 'San Isidro', telefono: '(01) 700-0022' },
  { id: 'aliado-red-solidaria', nombre: 'Aliado Red Solidaria', tipo: 'aliado', ruc: '20200000033', distrito: 'Comas', telefono: '(01) 700-0033' },
];
