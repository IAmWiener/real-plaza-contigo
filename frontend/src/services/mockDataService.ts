/**
 * Implementación de la Capa de Servicios en Modo_Demo.
 *
 * `MockDataService` usa los datos mockeados de `data/mock/*` como semilla y
 * `localStorage` (vía `storage.ts`) como respaldo persistente. Es la fuente de
 * verdad cuando no hay API disponible (`esDemo = true`).
 *
 * Persistencia:
 *  - Las colecciones mutables (puntos de acopio, puntos de riesgo y recursos) se
 *    persisten bajo las claves `rpc:puntosAcopio`, `rpc:puntosRiesgo` y
 *    `rpc:recursos`. El prefijo `rpc:` lo añade `storage.ts` internamente, por
 *    lo que aquí se usan las claves sin prefijo.
 *  - Las colecciones de catálogo (empresas, categorías, eventos) se consideran
 *    estáticas en Modo_Demo: se leen directamente de los mocks y se cachean en
 *    memoria para lecturas consistentes; no se escriben.
 *
 * IMPORTANTE: todos los datos expuestos por esta clase son ficticios y de
 * demostración. No representan operaciones, sedes, emergencias ni ubicaciones
 * reales de Real Plaza.
 */

import type {
  PuntoAcopio,
  PuntoAcopioInput,
  PuntoRiesgo,
  PuntoRiesgoInput,
  Recurso,
  Empresa,
  Categoria,
  Evento,
} from '@/types/domain';
import type { DatosDominio } from '@/types/ui';
import type { DataService } from '@/services/dataService';
import { ErrorDataService } from '@/services/dataService';
import { leer, escribir, eliminar, generarId } from '@/services/storage';
import {
  empresas,
  categorias,
  eventos,
  puntosAcopio,
  recursos,
  puntosRiesgo,
} from '@/data/mock';

/** Claves de persistencia (sin el prefijo `rpc:`, que añade `storage.ts`). */
const CLAVE_ACOPIO = 'puntosAcopio';
const CLAVE_RIESGO = 'puntosRiesgo';
const CLAVE_RECURSOS = 'recursos';

/** Clona de forma profunda para evitar mutar los mocks de origen. */
function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

export class MockDataService implements DataService {
  readonly esDemo = true;

  /** Catálogo estático cacheado en memoria para lecturas consistentes. */
  private readonly empresas: Empresa[] = clonar(empresas);
  private readonly categorias: Categoria[] = clonar(categorias);
  private readonly eventos: Evento[] = clonar(eventos);

  constructor() {
    this.sembrarSiFalta();
  }

  /**
   * Siembra las claves mutables en `localStorage` desde los mocks si aún no
   * existen. No sobrescribe datos ya persistidos por el usuario.
   */
  private sembrarSiFalta(): void {
    const marca = Symbol();
    const yaHay = (clave: string): boolean =>
      (leer<unknown>(clave, marca) as unknown) !== marca;

    if (!yaHay(CLAVE_ACOPIO)) {
      escribir<PuntoAcopio[]>(CLAVE_ACOPIO, clonar(puntosAcopio));
    }
    if (!yaHay(CLAVE_RIESGO)) {
      escribir<PuntoRiesgo[]>(CLAVE_RIESGO, clonar(puntosRiesgo));
    }
    if (!yaHay(CLAVE_RECURSOS)) {
      escribir<Recurso[]>(CLAVE_RECURSOS, clonar(recursos));
    }
  }

  /** Lee los puntos de acopio persistidos (con fallback a los mocks). */
  private leerAcopio(): PuntoAcopio[] {
    return leer<PuntoAcopio[]>(CLAVE_ACOPIO, clonar(puntosAcopio));
  }

  /** Lee los puntos de riesgo persistidos (con fallback a los mocks). */
  private leerRiesgo(): PuntoRiesgo[] {
    return leer<PuntoRiesgo[]>(CLAVE_RIESGO, clonar(puntosRiesgo));
  }

  /** Lee los recursos persistidos (con fallback a los mocks). */
  private leerRecursos(): Recurso[] {
    return leer<Recurso[]>(CLAVE_RECURSOS, clonar(recursos));
  }

  async cargarTodo(): Promise<DatosDominio> {
    // Garantiza que las claves existan antes de leer (p. ej. tras restaurar).
    this.sembrarSiFalta();
    return {
      empresas: clonar(this.empresas),
      categorias: clonar(this.categorias),
      eventos: clonar(this.eventos),
      recursos: this.leerRecursos(),
      puntosAcopio: this.leerAcopio(),
      puntosRiesgo: this.leerRiesgo(),
    };
  }

  // --- Centros de acopio -----------------------------------------------------

  async crearAcopio(input: PuntoAcopioInput): Promise<PuntoAcopio> {
    const coleccion = this.leerAcopio();
    const punto: PuntoAcopio = {
      ...input,
      id: generarId('pa'),
      actualizadoEn: new Date().toISOString(),
    };
    coleccion.push(punto);
    escribir<PuntoAcopio[]>(CLAVE_ACOPIO, coleccion);
    return punto;
  }

  async editarAcopio(id: string, input: PuntoAcopioInput): Promise<PuntoAcopio> {
    const coleccion = this.leerAcopio();
    const indice = coleccion.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorDataService(
        `No se encontró el punto de acopio con id "${id}".`,
        { estado: 404, codigo: 'ACOPIO_NO_ENCONTRADO' },
      );
    }
    const punto: PuntoAcopio = {
      ...input,
      id,
      actualizadoEn: new Date().toISOString(),
    };
    coleccion[indice] = punto;
    escribir<PuntoAcopio[]>(CLAVE_ACOPIO, coleccion);
    return punto;
  }

  async eliminarAcopio(id: string): Promise<void> {
    const coleccion = this.leerAcopio();
    const indice = coleccion.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorDataService(
        `No se encontró el punto de acopio con id "${id}".`,
        { estado: 404, codigo: 'ACOPIO_NO_ENCONTRADO' },
      );
    }
    coleccion.splice(indice, 1);
    escribir<PuntoAcopio[]>(CLAVE_ACOPIO, coleccion);

    // Elimina también los recursos asociados para mantener la coherencia.
    const recursosActuales = this.leerRecursos();
    const recursosRestantes = recursosActuales.filter(
      (r) => r.puntoAcopioId !== id,
    );
    if (recursosRestantes.length !== recursosActuales.length) {
      escribir<Recurso[]>(CLAVE_RECURSOS, recursosRestantes);
    }
  }

  // --- Reportes de riesgo ----------------------------------------------------

  async crearRiesgo(input: PuntoRiesgoInput): Promise<PuntoRiesgo> {
    const coleccion = this.leerRiesgo();
    const punto: PuntoRiesgo = {
      ...input,
      id: generarId('pr'),
      estado: 'activo',
      reportadoEn: new Date().toISOString(),
    };
    coleccion.push(punto);
    escribir<PuntoRiesgo[]>(CLAVE_RIESGO, coleccion);
    return punto;
  }

  async editarRiesgo(
    id: string,
    cambios: Partial<PuntoRiesgo>,
  ): Promise<PuntoRiesgo> {
    const coleccion = this.leerRiesgo();
    const indice = coleccion.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorDataService(
        `No se encontró el punto de riesgo con id "${id}".`,
        { estado: 404, codigo: 'RIESGO_NO_ENCONTRADO' },
      );
    }
    // Merge parcial manteniendo siempre el id original.
    const punto: PuntoRiesgo = { ...coleccion[indice], ...cambios, id };
    coleccion[indice] = punto;
    escribir<PuntoRiesgo[]>(CLAVE_RIESGO, coleccion);
    return punto;
  }

  async resolverRiesgo(id: string): Promise<PuntoRiesgo> {
    const coleccion = this.leerRiesgo();
    const indice = coleccion.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorDataService(
        `No se encontró el punto de riesgo con id "${id}".`,
        { estado: 404, codigo: 'RIESGO_NO_ENCONTRADO' },
      );
    }
    const punto: PuntoRiesgo = { ...coleccion[indice], estado: 'resuelto' };
    coleccion[indice] = punto;
    escribir<PuntoRiesgo[]>(CLAVE_RIESGO, coleccion);
    return punto;
  }

  async eliminarRiesgo(id: string): Promise<void> {
    const coleccion = this.leerRiesgo();
    const indice = coleccion.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorDataService(
        `No se encontró el punto de riesgo con id "${id}".`,
        { estado: 404, codigo: 'RIESGO_NO_ENCONTRADO' },
      );
    }
    coleccion.splice(indice, 1);
    escribir<PuntoRiesgo[]>(CLAVE_RIESGO, coleccion);
  }

  // --- Restauración de datos de demostración ---------------------------------

  async restaurarDemo(): Promise<void> {
    eliminar(CLAVE_ACOPIO);
    eliminar(CLAVE_RIESGO);
    eliminar(CLAVE_RECURSOS);
    this.sembrarSiFalta();
  }
}
