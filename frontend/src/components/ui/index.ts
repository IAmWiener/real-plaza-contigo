/**
 * Barrel de componentes UI compartidos de Real Plaza Contigo.
 *
 * Reexporta los componentes accesibles y reutilizables usados por el resto de
 * la aplicación (header, mapa, filtros, fichas, administración), junto con sus
 * tipos y helpers públicos.
 */

export { Boton } from './Boton';
export type { BotonProps, VarianteBoton, TamanoBoton } from './Boton';

export { Campo } from './Campo';
export type { CampoProps, AtributosControl } from './Campo';

export { Badge, tonoDesdeEstado, tonoDesdeSeveridad } from './Badge';
export type { BadgeProps, TonoBadge } from './Badge';

export { Drawer } from './Drawer';
export type { DrawerProps } from './Drawer';

export { Dialogo } from './Dialogo';
export type { DialogoProps } from './Dialogo';

export { Toasts } from './Toasts';
export type { ToastsProps } from './Toasts';
