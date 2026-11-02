/**
 * `Campo`: envoltorio accesible para un control de formulario (input, select,
 * textarea, etc.). Asocia una etiqueta visible con el control, muestra una
 * pista opcional y un mensaje de error, y cablea los atributos ARIA necesarios.
 *
 * El control se provee como `children` y debe recibir el `id` indicado y, si
 * hay error, `aria-invalid` y `aria-describedby`. Para facilitarlo, `Campo`
 * expone un render-prop opcional (`children` como función) que recibe los
 * atributos ya calculados y los aplica al control.
 *
 * Patrón de uso con render-prop (recomendado):
 *
 * ```tsx
 * <Campo id="nombre" label="Nombre" error={errores.nombre} required>
 *   {(props) => <input {...props} value={valor} onChange={...} />}
 * </Campo>
 * ```
 *
 * También acepta children estáticos; en ese caso el consumidor es responsable
 * de aplicar `id`/`aria-*` al control.
 */

import type { ReactNode } from 'react';

/** Atributos accesibles que `Campo` calcula para el control. */
export interface AtributosControl {
  /** Identificador del control, asociado al `htmlFor` de la etiqueta. */
  id: string;
  /** `true` cuando hay error, para marcar el control como inválido. */
  'aria-invalid'?: boolean;
  /** IDs de los elementos que describen el control (pista y/o error). */
  'aria-describedby'?: string;
  /** Refleja el estado requerido para tecnologías de asistencia. */
  'aria-required'?: boolean;
}

export interface CampoProps {
  /** Identificador único del control; vincula label, pista y error. */
  id: string;
  /** Texto de la etiqueta visible. */
  label: string;
  /** Mensaje de error; si está presente, el campo se marca como inválido. */
  error?: string;
  /** Texto de ayuda opcional mostrado bajo la etiqueta. */
  hint?: string;
  /** Marca el campo como obligatorio (muestra indicador y aria-required). */
  required?: boolean;
  /** Clases adicionales para el contenedor. */
  className?: string;
  /**
   * Control del formulario. Puede ser un nodo estático o un render-prop que
   * recibe los atributos accesibles ya calculados.
   */
  children: ReactNode | ((props: AtributosControl) => ReactNode);
}

/**
 * Envoltorio de campo de formulario con etiqueta, pista y error accesibles.
 */
export function Campo({
  id,
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: CampoProps) {
  const idHint = hint ? `${id}-hint` : undefined;
  const idError = error ? `${id}-error` : undefined;

  // `aria-describedby` apunta a la pista y/o al error cuando existen.
  const describedBy = [idHint, idError].filter(Boolean).join(' ') || undefined;

  const atributos: AtributosControl = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
  };

  return (
    <div className={['flex flex-col gap-1', className ?? ''].join(' ').trim()}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-brand" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={idHint} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}

      {typeof children === 'function' ? children(atributos) : children}

      {error && (
        <p
          id={idError}
          role="alert"
          className="text-xs font-medium text-status-saturado"
        >
          {error}
        </p>
      )}
    </div>
  );
}
