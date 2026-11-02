/**
 * Núcleo genérico y PURO de filtrado reutilizable.
 *
 * Compone una lista de predicados sobre una colección y devuelve el subconjunto
 * que satisface TODOS ellos (lógica AND), junto con el total de resultados.
 * No depende de React ni de ningún estado externo, por lo que es trivialmente
 * testeable y reutilizable por `useFiltrosAcopio` y `useFiltrosRiesgo`.
 *
 * Incluye además helpers de predicados reutilizables (`coincideTexto`,
 * `igualA`) que encapsulan la semántica común de búsqueda de texto e igualdad
 * por campo, evitando duplicar la lógica de filtrado entre ambos modos.
 */

import type { ResultadoFiltro } from '@/types/ui';

/** Predicado puro que decide si un elemento pasa un criterio de filtrado. */
export type Predicado<T> = (item: T) => boolean;

/**
 * Aplica una lista de predicados sobre `items` con lógica AND: un elemento se
 * incluye en el resultado solo si satisface todos los predicados.
 *
 * El resultado es siempre un subconjunto de `items` que conserva el orden de
 * entrada, y `total` es exactamente la longitud de `items` filtrados.
 *
 * @param items Colección de entrada (no se muta).
 * @param predicados Predicados a satisfacer; una lista vacía no filtra nada.
 * @returns `{ items, total }` con los elementos que pasan todos los predicados.
 */
export function aplicarFiltros<T>(
  items: T[],
  predicados: Array<Predicado<T>>,
): ResultadoFiltro<T> {
  const filtrados = items.filter((item) =>
    predicados.every((predicado) => predicado(item)),
  );
  return { items: filtrados, total: filtrados.length };
}

/**
 * Normaliza una cadena para comparaciones insensibles a mayúsculas/minúsculas y
 * a acentos: pasa a minúsculas, descompone con `normalize('NFD')` y elimina los
 * diacríticos combinantes (rango Unicode U+0300–U+036F). Recorta espacios.
 *
 * @example
 * normalizarTexto('Jesús María') // => 'jesus maria'
 */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Construye un predicado de búsqueda de texto PARCIAL, case-insensitive y
 * accent-insensitive sobre la concatenación de `campos`.
 *
 * Los `campos` se concatenan con un espacio y se normalizan; el `texto` buscado
 * también se normaliza. Si el texto normalizado queda vacío (sin búsqueda), el
 * predicado acepta cualquier valor.
 *
 * Esta función devuelve el predicado ya cerrado sobre el `texto`, de modo que
 * el consumidor solo construye por cada elemento la lista de `campos`.
 *
 * @param texto Texto de búsqueda libre (puede venir con acentos/mayúsculas).
 * @returns Función que, dados los campos de un elemento, indica si coincide.
 */
export function coincideTexto(texto: string): (campos: string[]) => boolean {
  const consulta = normalizarTexto(texto);
  return (campos: string[]): boolean => {
    if (consulta === '') return true;
    const concatenado = normalizarTexto(campos.join(' '));
    return concatenado.includes(consulta);
  };
}

/**
 * Compara un `valor` con un `filtro` de igualdad exacta.
 *
 * Devuelve `true` cuando no hay filtro aplicado (`filtro` es `null`) o cuando el
 * valor coincide estrictamente con el filtro. Se usa para los selects de los
 * paneles, cuyo valor por defecto "sin filtro" es `null`.
 *
 * @param valor Valor del campo del elemento.
 * @param filtro Valor seleccionado en el filtro, o `null` para no filtrar.
 */
export function igualA<T>(valor: T, filtro: T | null): boolean {
  return filtro === null || valor === filtro;
}
