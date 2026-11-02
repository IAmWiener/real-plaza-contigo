/**
 * Error HTTP con código de estado asociado. Permite a los servicios/controladores
 * lanzar errores semánticos (404, 400, 409...) que el middleware central de
 * errores traduce a una respuesta JSON uniforme.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly detalles?: unknown;

  constructor(status: number, mensaje: string, codigo = 'error', detalles?: unknown) {
    super(mensaje);
    this.name = 'HttpError';
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  static noEncontrado(mensaje = 'Recurso no encontrado') {
    return new HttpError(404, mensaje, 'no_encontrado');
  }

  static solicitudInvalida(mensaje = 'Solicitud inválida', detalles?: unknown) {
    return new HttpError(400, mensaje, 'solicitud_invalida', detalles);
  }

  static conflicto(mensaje = 'Conflicto con el estado actual') {
    return new HttpError(409, mensaje, 'conflicto');
  }
}
