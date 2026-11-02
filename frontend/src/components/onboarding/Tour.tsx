/**
 * `Tour`: onboarding por "coachmarks" (tooltips guiados) que resaltan los
 * controles clave la primera vez que se usa la aplicación.
 *
 * Objetivo de accesibilidad: pensado también para personas mayores. Por eso
 * usa texto amplio, botones grandes (≥44px), lenguaje claro y un solo mensaje
 * por paso. Resalta el elemento objetivo con un recorte luminoso y muestra una
 * tarjeta cerca de él explicando para qué sirve.
 *
 * Los pasos apuntan a elementos marcados con `data-tour="<clave>"` en el DOM.
 * Si un objetivo no existe en pantalla (p. ej. un control que solo aparece en
 * cierto modo), ese paso se centra sin recorte, sin bloquear el recorrido.
 *
 * Estado: el componente es controlado (`abierto` + `onCerrar`). La persistencia
 * de "ya visto" vive en el consumidor (`App`) vía `localStorage`.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

import { Boton } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useBloqueoScroll } from '@/hooks/useBloqueoScroll';

/** Un paso del recorrido: a qué elemento apunta y qué explica. */
export interface PasoTour {
  /** Valor de `data-tour` del elemento a resaltar (o `null` para centrar). */
  destino: string | null;
  /** Título corto del paso. */
  titulo: string;
  /** Explicación en lenguaje claro. */
  texto: string;
}

/**
 * Recorrido por defecto, ordenado según el uso natural: primero entender qué se
 * ve y cómo filtrarlo, luego cómo actuar (reportar), y al final el resumen y la
 * forma de volver a ver la guía.
 */
const PASOS_TOUR: PasoTour[] = [
  {
    destino: null,
    titulo: '¡Te damos la bienvenida!',
    texto:
      'Te enseñamos lo básico en 1 minuto. Puedes salir cuando quieras y volver a verlo después.',
  },
  {
    destino: 'modo',
    titulo: '1. Elige qué quieres ver',
    texto:
      'Cambia entre "Centros de acopio" (dónde dejar o recibir ayuda) y "Reporte de puntos críticos" (zonas de riesgo).',
  },
  {
    destino: 'filtros',
    titulo: '2. Busca y filtra',
    texto:
      'Aquí encuentras los puntos: escribe para buscar o usa los filtros por tipo y estado. Toca uno para ver su ficha.',
  },
  {
    destino: 'ubicacion',
    titulo: '3. Encuentra lo más cercano',
    texto:
      'Toca "Mi ubicación" para centrar el mapa donde estás y ver los puntos cerca de ti.',
  },
  {
    destino: null,
    titulo: '4. Cómo reportar una zona de riesgo',
    texto:
      'En "Reporte de puntos críticos", usa "Reportar zona de riesgo", toca el mapa para ubicarla y elige el tipo con los iconos de colores. ¡Listo!',
  },
  {
    destino: 'resumen',
    titulo: '5. Mira el resumen',
    texto:
      'En "Resumen" ves de un vistazo cuántos centros están disponibles y cuántas zonas de riesgo hay.',
  },
  {
    destino: null,
    titulo: 'Eso es todo',
    texto:
      'Si te pierdes, toca "¿Cómo funciona?" arriba para ver esta guía otra vez cuando lo necesites.',
  },
];

export interface TourProps {
  /** Si el recorrido está visible. */
  abierto: boolean;
  /** Se invoca al terminar o cerrar el recorrido. */
  onCerrar: () => void;
  /** Pasos a mostrar; por defecto `PASOS_TOUR`. */
  pasos?: PasoTour[];
}

/** Rectángulo del elemento objetivo en coordenadas de viewport. */
interface Recorte {
  top: number;
  left: number;
  width: number;
  height: number;
}

const MARGEN = 8;

/**
 * Localiza el elemento objetivo por `data-tour` y devuelve su rectángulo con un
 * pequeño margen, o `null` si no existe en el DOM.
 */
function medirDestino(destino: string | null): Recorte | null {
  if (!destino) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${destino}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return {
    top: r.top - MARGEN,
    left: r.left - MARGEN,
    width: r.width + MARGEN * 2,
    height: r.height + MARGEN * 2,
  };
}

/**
 * Recorrido de onboarding con resaltado de elementos y tarjeta explicativa.
 */
export function Tour({ abierto, onCerrar, pasos = PASOS_TOUR }: TourProps) {
  const [indice, setIndice] = useState(0);
  const [recorte, setRecorte] = useState<Recorte | null>(null);
  // Alto real de la tarjeta, medido tras renderizar, para colocarla sin tapar
  // el elemento resaltado (en vez de estimar un alto fijo).
  const [altoTarjeta, setAltoTarjeta] = useState(220);
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const sinMovimiento = usePrefersReducedMotion();

  // Bloquea el scroll del fondo mientras el recorrido está abierto.
  useBloqueoScroll(abierto);

  const paso = pasos[indice];
  const esUltimo = indice === pasos.length - 1;

  // Reinicia al primer paso cada vez que se abre.
  useEffect(() => {
    if (abierto) setIndice(0);
  }, [abierto]);

  // Al cambiar de paso, lleva el objetivo a la vista (si hiciera falta) antes
  // de medirlo, para que el recorte quede dentro del viewport.
  useEffect(() => {
    if (!abierto || !paso?.destino) return;
    const el = document.querySelector<HTMLElement>(
      `[data-tour="${paso.destino}"]`,
    );
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [abierto, paso]);

  // Mide el objetivo del paso actual y se re-mide al cambiar tamaño/scroll.
  useLayoutEffect(() => {
    if (!abierto) return;
    const actualizar = () => setRecorte(medirDestino(paso?.destino ?? null));
    actualizar();
    window.addEventListener('resize', actualizar);
    window.addEventListener('scroll', actualizar, true);
    return () => {
      window.removeEventListener('resize', actualizar);
      window.removeEventListener('scroll', actualizar, true);
    };
  }, [abierto, paso]);

  // Mide el alto real de la tarjeta tras pintar cada paso.
  useLayoutEffect(() => {
    if (!abierto) return;
    const h = tarjetaRef.current?.offsetHeight;
    if (h && h !== altoTarjeta) setAltoTarjeta(h);
  }, [abierto, paso, recorte, altoTarjeta]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!abierto) return;
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclado);
    return () => document.removeEventListener('keydown', alTeclado);
  }, [abierto, onCerrar]);

  const siguiente = useCallback(() => {
    if (esUltimo) onCerrar();
    else setIndice((i) => i + 1);
  }, [esUltimo, onCerrar]);

  if (!abierto || !paso) return null;

  // Posición de la tarjeta: bajo el objetivo si hay espacio, si no encima;
  // centrada cuando no hay recorte (pasos introductorios).
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const anchoTarjeta = Math.min(360, vw - 24);

  let estiloTarjeta: React.CSSProperties;
  if (recorte) {
    const espacioAbajo = vh - (recorte.top + recorte.height);
    const espacioArriba = recorte.top;
    // Coloca la tarjeta donde realmente quepa, usando su alto medido + holgura.
    const necesita = altoTarjeta + 24;
    let top: number;
    if (espacioAbajo >= necesita) {
      top = recorte.top + recorte.height + 12;
    } else if (espacioArriba >= necesita) {
      top = recorte.top - altoTarjeta - 12;
    } else {
      // No cabe ni arriba ni abajo: anclar a la zona con más espacio y acotar
      // dentro del viewport para no desbordar.
      top = Math.max(12, Math.min(vh - altoTarjeta - 12, recorte.top + 12));
    }
    let left = recorte.left + recorte.width / 2 - anchoTarjeta / 2;
    left = Math.max(12, Math.min(left, vw - anchoTarjeta - 12));
    estiloTarjeta = { top, left, width: anchoTarjeta };
  } else {
    estiloTarjeta = {
      top: '50%',
      left: '50%',
      width: anchoTarjeta,
      transform: 'translate(-50%, -50%)',
    };
  }

  const animacion = sinMovimiento ? '' : 'animate-fade-in';

  return (
    <div
      className="fixed inset-0 z-[3000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-titulo"
      aria-describedby="tour-texto"
    >
      {/* Velo oscuro. Al tocar fuera de la tarjeta se puede cerrar. */}
      <button
        type="button"
        aria-label="Cerrar la guía"
        onClick={onCerrar}
        className={`absolute inset-0 h-full w-full cursor-default bg-ink/60 ${animacion}`}
      />

      {/* Recorte luminoso sobre el elemento objetivo. */}
      {recorte && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl ring-4 ring-accent transition-all duration-300 ease-cr"
          style={{
            top: recorte.top,
            left: recorte.left,
            width: recorte.width,
            height: recorte.height,
            boxShadow: '0 0 0 9999px rgba(17,17,17,0.6)',
          }}
        />
      )}

      {/* Tarjeta explicativa del paso. */}
      <section
        ref={tarjetaRef}
        className={`absolute rounded-3xl border border-surface-border bg-surface p-5 shadow-float ${animacion}`}
        style={estiloTarjeta}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="tour-titulo" className="text-lg font-bold text-brand">
            {paso.titulo}
          </h2>
          <Boton
            variante="fantasma"
            tamano="sm"
            aria-label="Cerrar la guía"
            icono={<X className="h-5 w-5" />}
            onClick={onCerrar}
          />
        </div>

        <p id="tour-texto" className="mt-2 text-base leading-relaxed text-ink-soft">
          {paso.texto}
        </p>

        {/* Indicador de progreso (puntos) + acciones grandes. */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {pasos.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === indice ? 'w-5 bg-brand' : 'w-2 bg-surface-border'
                }`}
              />
            ))}
          </div>
          <span className="sr-only">
            Paso {indice + 1} de {pasos.length}
          </span>

          <div className="flex items-center gap-2">
            {!esUltimo && (
              <Boton variante="secundario" onClick={onCerrar}>
                Omitir
              </Boton>
            )}
            <Boton
              variante="primario"
              icono={
                esUltimo ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
              onClick={siguiente}
            >
              {esUltimo ? 'Entendido' : 'Siguiente'}
            </Boton>
          </div>
        </div>
      </section>
    </div>
  );
}
