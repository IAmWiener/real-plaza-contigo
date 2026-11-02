import type { Categoria } from '@/types/domain';

/**
 * Categorías de recursos atendidos en los puntos de acopio.
 * DATOS FICTICIOS DE DEMOSTRACIÓN.
 */
export const categorias: Categoria[] = [
  { id: 'cat-alimentos', nombre: 'Alimentos', icono: 'Apple', descripcion: 'Alimentos no perecibles y comida preparada.' },
  { id: 'cat-agua', nombre: 'Agua potable', icono: 'Droplets', descripcion: 'Agua embotellada y bidones.' },
  { id: 'cat-salud', nombre: 'Salud y primeros auxilios', icono: 'HeartPulse', descripcion: 'Medicinas e insumos de primeros auxilios.' },
  { id: 'cat-ropa', nombre: 'Ropa y abrigo', icono: 'Shirt', descripcion: 'Ropa, frazadas y abrigo.' },
  { id: 'cat-refugio', nombre: 'Refugio temporal', icono: 'Tent', descripcion: 'Carpas y espacios de alojamiento temporal.' },
  { id: 'cat-higiene', nombre: 'Higiene', icono: 'ShowerHead', descripcion: 'Kits de aseo e higiene personal.' },
  { id: 'cat-rescate', nombre: 'Rescate y asistencia', icono: 'LifeBuoy', descripcion: 'Equipos de rescate y asistencia logística.' },
];
