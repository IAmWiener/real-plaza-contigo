/**
 * Fábrica de la Capa de Servicios de Real Plaza Contigo.
 *
 * Selecciona la implementación concreta de `DataService` según el entorno:
 *  - `ApiDataService`  cuando `VITE_API_BASE_URL` es una cadena no vacía
 *    (ignorando espacios en blanco), es decir, apunta a la API real.
 *  - `MockDataService` en caso contrario (variable ausente, vacía o compuesta
 *    solo por espacios en blanco), es decir, Modo_Demo.
 *
 * Se define en un archivo separado —en lugar de dentro de `dataService.ts`—
 * para evitar un ciclo de imports en tiempo de ejecución: `dataService.ts` es
 * el módulo de contrato y exporta `ErrorDataService` (un valor) que ambas
 * implementaciones importan. Al vivir la fábrica aquí, el módulo de contrato no
 * necesita conocer las clases concretas y el grafo de dependencias queda
 * unidireccional (contrato → implementaciones → fábrica).
 *
 * IMPORTANTE: todos los datos expuestos por la Capa de Servicios son ficticios
 * y de demostración. No representan operaciones, sedes, emergencias ni
 * ubicaciones reales de Real Plaza.
 */

import type { DataService } from '@/services/dataService';
import { ApiDataService } from '@/services/apiDataService';
import { MockDataService } from '@/services/mockDataService';

/**
 * Variante pura de la fábrica: recibe el valor de la URL base como argumento
 * en lugar de leer `import.meta.env` directamente.
 *
 * Mantener la decisión en una función pura facilita las pruebas (p. ej. la
 * prueba de la Property 11) sin tener que manipular el entorno global: basta
 * con pasar distintos valores de `base`.
 *
 * @param base Valor de `VITE_API_BASE_URL` (o `undefined` si no está definida).
 * @returns `ApiDataService` si `base` es una cadena no vacía (ignorando
 *   espacios); `MockDataService` en cualquier otro caso.
 */
export function crearDataServicePara(base: string | undefined): DataService {
  if (base && base.trim() !== '') {
    return new ApiDataService(base);
  }
  return new MockDataService();
}

/**
 * Fábrica principal de la Capa de Servicios. Lee `VITE_API_BASE_URL` del
 * entorno de Vite y delega la selección en `crearDataServicePara`.
 *
 * @returns La implementación de `DataService` adecuada al entorno actual.
 */
export function crearDataService(): DataService {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return crearDataServicePara(base);
}
