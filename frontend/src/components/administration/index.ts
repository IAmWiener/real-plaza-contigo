/**
 * Barrel de componentes del panel de administración (demostración) de Real
 * Plaza Contigo.
 *
 * Reexporta el contenedor `PanelAdministracion` y los formularios de creación/
 * edición de centros de acopio y reportes de riesgo, junto con sus tipos
 * públicos.
 */

export { PanelAdministracion } from './PanelAdministracion';
export type { PanelAdministracionProps } from './PanelAdministracion';

export { FormAcopio } from './FormAcopio';
export type { FormAcopioProps } from './FormAcopio';

export { FormRiesgo } from './FormRiesgo';
export type { FormRiesgoProps, CambiosRiesgo } from './FormRiesgo';
