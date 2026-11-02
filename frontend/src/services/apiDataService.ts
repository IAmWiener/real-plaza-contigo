/**
 * Implementación de la Capa de Servicios respaldada por la API REST del backend
 * (`ApiDataService`), con fallback automático a `MockDataService`.
 *
 * Esta implementación es la que se usa cuando `VITE_API_BASE_URL` apunta a una
 * API real. Habla con el backend mediante `fetch` contra `${baseUrl}/...` y
 * normaliza cualquier fallo (red, timeout o respuesta no-ok) al error uniforme
 * `ErrorDataService`, de modo que la UI pueda mostrar mensajes claros sin
 * conocer el origen del error.
 *
 * FALLBACK (Req. 12.3): la lectura inicial (`cargarTodo`) es tolerante a fallos.
 * Si la API no responde (error de red o timeout), el servicio cae a una
 * instancia interna de `MockDataService`, marca su estado como demostración
 * (`esDemo = true`) y, a partir de ese momento, TODAS las operaciones se
 * delegan al mock para que la demo siga siendo navegable. Las mutaciones solo
 * caen al mock cuando el fallback ya está activo; si una mutación falla por red
 * antes de activarse el fallback, el error se propaga como `ErrorDataService`.
 *
 * El backend está fuera del alcance de esta tarea: las rutas REST se declaran
 * de forma coherente (`/empresas`, `/categorias`, `/eventos`, `/recursos`,
 * `/puntos-acopio`, `/puntos-riesgo`) pero su implementación vive en el proyecto
 * `backend/`.
 *
 * IMPORTANTE: todos los datos expuestos por esta capa son ficticios y de
 * demostración. No representan operaciones, sedes, emergencias ni ubicaciones
 * reales de Real Plaza.
 */

import type {
  PuntoAcopio,
  PuntoAcopioInput,
  PuntoRiesgo,
  PuntoRiesgoInput,
} from '@/types/domain';
import type { DatosDominio } from '@/types/ui';
import {
  type DataService,
  ErrorDataService,
} from '@/services/dataService';
import { MockDataService } from '@/services/mockDataService';

/** Tiempo máximo (ms) que se espera por una petición antes de considerarla sin respuesta. */
const TIEMPO_ESPERA_MS = 8000;

/** Rutas REST del backend. Relativas a `baseUrl`. */
const RUTAS = {
  empresas: '/empresas',
  categorias: '/categorias',
  eventos: '/eventos',
  recursos: '/recursos',
  puntosAcopio: '/puntos-acopio',
  puntosRiesgo: '/puntos-riesgo',
} as const;

/**
 * Cliente de la API REST del backend con fallback automático a mocks en la
 * lectura inicial.
 */
export class ApiDataService implements DataService {
  /** URL base de la API, sin barra final (p. ej. `https://api.ejemplo.com`). */
  private readonly baseUrl: string;

  /**
   * Instancia mock usada tras el fallback. Se crea de forma perezosa la primera
   * vez que la lectura inicial falla y queda activa el resto de la vida del
   * servicio.
   */
  private mock: MockDataService | null = null;

  /** `true` cuando el fallback a mock está activo. */
  private fallbackActivo = false;

  constructor(baseUrl: string) {
    // Normalizamos para evitar barras finales duplicadas al componer rutas.
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Refleja si el servicio opera en Modo_Demo. Empieza en `false` (consumiendo
   * la API real) y pasa a `true` cuando se activa el fallback a mock tras un
   * fallo en la lectura inicial.
   */
  get esDemo(): boolean {
    return this.fallbackActivo;
  }

  // ---------------------------------------------------------------------------
  // Carga inicial (con fallback)
  // ---------------------------------------------------------------------------

  /**
   * Carga todas las colecciones del dominio en paralelo desde la API.
   *
   * Si la petición falla por red o timeout, activa el fallback a
   * `MockDataService` (dejando `esDemo = true`) y devuelve los datos de
   * demostración, de modo que la aplicación siga siendo navegable.
   *
   * Si el fallback ya está activo (p. ej. por una llamada previa), delega
   * directamente en el mock.
   */
  async cargarTodo(): Promise<DatosDominio> {
    if (this.fallbackActivo) {
      return this.mockService().cargarTodo();
    }

    try {
      const [empresas, categorias, eventos, recursos, puntosAcopio, puntosRiesgo] =
        await Promise.all([
          this.obtener<DatosDominio['empresas']>(RUTAS.empresas),
          this.obtener<DatosDominio['categorias']>(RUTAS.categorias),
          this.obtener<DatosDominio['eventos']>(RUTAS.eventos),
          this.obtener<DatosDominio['recursos']>(RUTAS.recursos),
          this.obtener<DatosDominio['puntosAcopio']>(RUTAS.puntosAcopio),
          this.obtener<DatosDominio['puntosRiesgo']>(RUTAS.puntosRiesgo),
        ]);

      return { empresas, categorias, eventos, recursos, puntosAcopio, puntosRiesgo };
    } catch (_error) {
      // Solo la lectura inicial dispara el fallback automático a mock.
      return this.activarFallback().cargarTodo();
    }
  }

  // ---------------------------------------------------------------------------
  // Mutaciones de centros de acopio
  // ---------------------------------------------------------------------------

  async crearAcopio(input: PuntoAcopioInput): Promise<PuntoAcopio> {
    if (this.fallbackActivo) return this.mockService().crearAcopio(input);
    return this.enviar<PuntoAcopio>('POST', RUTAS.puntosAcopio, input);
  }

  async editarAcopio(id: string, input: PuntoAcopioInput): Promise<PuntoAcopio> {
    if (this.fallbackActivo) return this.mockService().editarAcopio(id, input);
    return this.enviar<PuntoAcopio>('PUT', `${RUTAS.puntosAcopio}/${encodeURIComponent(id)}`, input);
  }

  async eliminarAcopio(id: string): Promise<void> {
    if (this.fallbackActivo) return this.mockService().eliminarAcopio(id);
    await this.enviar<void>('DELETE', `${RUTAS.puntosAcopio}/${encodeURIComponent(id)}`);
  }

  // ---------------------------------------------------------------------------
  // Mutaciones de reportes de riesgo
  // ---------------------------------------------------------------------------

  async crearRiesgo(input: PuntoRiesgoInput): Promise<PuntoRiesgo> {
    if (this.fallbackActivo) return this.mockService().crearRiesgo(input);
    return this.enviar<PuntoRiesgo>('POST', RUTAS.puntosRiesgo, input);
  }

  async editarRiesgo(id: string, cambios: Partial<PuntoRiesgo>): Promise<PuntoRiesgo> {
    if (this.fallbackActivo) return this.mockService().editarRiesgo(id, cambios);
    return this.enviar<PuntoRiesgo>('PUT', `${RUTAS.puntosRiesgo}/${encodeURIComponent(id)}`, cambios);
  }

  async resolverRiesgo(id: string): Promise<PuntoRiesgo> {
    if (this.fallbackActivo) return this.mockService().resolverRiesgo(id);
    // Transición de estado explícita: estado -> 'resuelto'.
    return this.enviar<PuntoRiesgo>(
      'POST',
      `${RUTAS.puntosRiesgo}/${encodeURIComponent(id)}/resolver`,
    );
  }

  async eliminarRiesgo(id: string): Promise<void> {
    if (this.fallbackActivo) return this.mockService().eliminarRiesgo(id);
    await this.enviar<void>('DELETE', `${RUTAS.puntosRiesgo}/${encodeURIComponent(id)}`);
  }

  // ---------------------------------------------------------------------------
  // Restaurar demostración
  // ---------------------------------------------------------------------------

  /**
   * Restaura los datos iniciales de demostración. Solo tiene efecto cuando el
   * fallback a mock está activo (Modo_Demo); contra la API real es una
   * operación no aplicable y se ignora silenciosamente.
   */
  async restaurarDemo(): Promise<void> {
    if (this.fallbackActivo) return this.mockService().restaurarDemo();
    // Sin fallback activo no hay datos de demostración que restaurar.
  }

  // ---------------------------------------------------------------------------
  // Internos
  // ---------------------------------------------------------------------------

  /**
   * Activa el fallback a mock (idempotente) y devuelve la instancia mock. A
   * partir de aquí `esDemo` es `true` y todas las operaciones se delegan.
   */
  private activarFallback(): MockDataService {
    this.fallbackActivo = true;
    return this.mockService();
  }

  /** Devuelve la instancia mock, creándola de forma perezosa si no existe. */
  private mockService(): MockDataService {
    if (this.mock === null) {
      this.mock = new MockDataService();
    }
    return this.mock;
  }

  /** Ejecuta un GET y devuelve el JSON parseado. */
  private obtener<T>(ruta: string): Promise<T> {
    return this.pedir<T>('GET', ruta);
  }

  /** Ejecuta una mutación (POST/PUT/DELETE) con cuerpo JSON opcional. */
  private enviar<T>(
    metodo: 'POST' | 'PUT' | 'DELETE',
    ruta: string,
    cuerpo?: unknown,
  ): Promise<T> {
    return this.pedir<T>(metodo, ruta, cuerpo);
  }

  /**
   * Núcleo del cliente HTTP: realiza la petición con `fetch`, aplica un timeout
   * mediante `AbortController` y normaliza cualquier fallo a `ErrorDataService`.
   *
   * - Error de red o timeout -> `ErrorDataService` sin `estado` y con
   *   `codigo: 'red'` (lo que la lectura inicial interpreta como "no responde").
   * - Respuesta no-ok -> `ErrorDataService` con el código HTTP en `estado`.
   * - Respuesta ok -> JSON parseado (o `undefined` si no hay cuerpo, p. ej.
   *   en un `204 No Content`).
   */
  private async pedir<T>(
    metodo: string,
    ruta: string,
    cuerpo?: unknown,
  ): Promise<T> {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);

    let respuesta: Response;
    try {
      respuesta = await fetch(`${this.baseUrl}${ruta}`, {
        method: metodo,
        signal: controlador.signal,
        headers:
          cuerpo === undefined
            ? { Accept: 'application/json' }
            : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
    } catch (error) {
      // Fallo de red o abort por timeout: no hay código HTTP disponible.
      throw new ErrorDataService(
        'No se pudo contactar con el servicio. Verifica tu conexión.',
        { codigo: 'red', causa: error },
      );
    } finally {
      clearTimeout(temporizador);
    }

    if (!respuesta.ok) {
      throw new ErrorDataService(
        `La solicitud falló con estado ${respuesta.status}.`,
        { estado: respuesta.status, codigo: 'http' },
      );
    }

    // 204 No Content (o cuerpo vacío): no intentamos parsear JSON.
    if (respuesta.status === 204) {
      return undefined as T;
    }

    try {
      const texto = await respuesta.text();
      return (texto ? JSON.parse(texto) : undefined) as T;
    } catch (error) {
      throw new ErrorDataService('La respuesta del servicio no es válida.', {
        estado: respuesta.status,
        codigo: 'formato',
        causa: error,
      });
    }
  }
}
