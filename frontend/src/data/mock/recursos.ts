import type { Recurso } from '@/types/domain';

/**
 * Recursos disponibles por punto de acopio. DATOS DE DEMOSTRACIÓN.
 */
export const recursos: Recurso[] = [
  { id: 'rec-001', puntoAcopioId: 'pa-001', nombre: 'Arroz (sacos)', unidad: 'saco 25kg', cantidadDisponible: 120, cantidadComprometida: 30, estado: 'disponible' },
  { id: 'rec-002', puntoAcopioId: 'pa-001', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 40, cantidadComprometida: 10, estado: 'bajo' },
  { id: 'rec-003', puntoAcopioId: 'pa-001', nombre: 'Kits de higiene', unidad: 'kit', cantidadDisponible: 80, cantidadComprometida: 0, estado: 'disponible' },
  { id: 'rec-004', puntoAcopioId: 'pa-002', nombre: 'Frazadas', unidad: 'unidad', cantidadDisponible: 60, cantidadComprometida: 50, estado: 'bajo' },
  { id: 'rec-005', puntoAcopioId: 'pa-002', nombre: 'Carpas', unidad: 'unidad', cantidadDisponible: 15, cantidadComprometida: 12, estado: 'bajo' },
  { id: 'rec-006', puntoAcopioId: 'pa-003', nombre: 'Conservas', unidad: 'caja', cantidadDisponible: 0, cantidadComprometida: 0, estado: 'agotado' },
  { id: 'rec-007', puntoAcopioId: 'pa-003', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 10, cantidadComprometida: 8, estado: 'bajo' },
  { id: 'rec-008', puntoAcopioId: 'pa-004', nombre: 'Botiquines', unidad: 'unidad', cantidadDisponible: 45, cantidadComprometida: 5, estado: 'disponible' },
  { id: 'rec-009', puntoAcopioId: 'pa-004', nombre: 'Alcohol en gel', unidad: 'litro', cantidadDisponible: 90, cantidadComprometida: 0, estado: 'disponible' },
  { id: 'rec-010', puntoAcopioId: 'pa-005', nombre: 'Cuerdas de rescate', unidad: 'rollo', cantidadDisponible: 20, cantidadComprometida: 4, estado: 'disponible' },
  { id: 'rec-011', puntoAcopioId: 'pa-006', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 150, cantidadComprometida: 20, estado: 'disponible' },
  { id: 'rec-012', puntoAcopioId: 'pa-006', nombre: 'Fideos', unidad: 'caja', cantidadDisponible: 70, cantidadComprometida: 10, estado: 'disponible' },
  { id: 'rec-013', puntoAcopioId: 'pa-007', nombre: 'Ropa de abrigo', unidad: 'bolsa', cantidadDisponible: 35, cantidadComprometida: 0, estado: 'disponible' },
  { id: 'rec-014', puntoAcopioId: 'pa-008', nombre: 'Medicinas básicas', unidad: 'caja', cantidadDisponible: 25, cantidadComprometida: 5, estado: 'bajo' },
  { id: 'rec-015', puntoAcopioId: 'pa-010', nombre: 'Arroz (sacos)', unidad: 'saco 25kg', cantidadDisponible: 60, cantidadComprometida: 10, estado: 'disponible' },
  { id: 'rec-016', puntoAcopioId: 'pa-012', nombre: 'Ropa de abrigo', unidad: 'bolsa', cantidadDisponible: 40, cantidadComprometida: 8, estado: 'disponible' },
  { id: 'rec-017', puntoAcopioId: 'pa-013', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 5, cantidadComprometida: 5, estado: 'agotado' },
  { id: 'rec-018', puntoAcopioId: 'pa-014', nombre: 'Carpas', unidad: 'unidad', cantidadDisponible: 22, cantidadComprometida: 2, estado: 'disponible' },
  { id: 'rec-019', puntoAcopioId: 'pa-015', nombre: 'Kits de higiene', unidad: 'kit', cantidadDisponible: 50, cantidadComprometida: 20, estado: 'disponible' },
  { id: 'rec-020', puntoAcopioId: 'pa-011', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 18, cantidadComprometida: 15, estado: 'bajo' },
];
