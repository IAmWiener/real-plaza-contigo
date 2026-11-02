/**
 * `Logo`: isotipo de Real Plaza (cabeza de león "Layo") a partir del PNG oficial
 * ubicado en `public/favicon-layo.png`.
 *
 * Se usa la imagen de marca real en lugar de una recreación vectorial para
 * respetar fielmente el diseño. La imagen es el león en blanco sobre fondo
 * transparente, pensada para fondos morados/oscuros (Header y banda de cierre),
 * que es donde se emplea.
 *
 * El wordmark "REAL PLAZA" se compone aparte (ver `IsotipoConWordmark`), para
 * poder usar solo el isotipo en espacios reducidos (p. ej. la navegación).
 */

/** Ruta pública del isotipo (servido desde `frontend/public`). */
const RUTA_ISOTIPO = '/favicon-layo.png';

interface LogoProps {
  /** Clases utilitarias (tamaño, p. ej. `h-8 w-8`). */
  className?: string;
  /** Texto accesible; si se omite, la imagen es decorativa (`alt=""`). */
  titulo?: string;
}

/**
 * Isotipo: cabeza de león de la marca. Renderiza el PNG oficial con `alt`
 * accesible cuando se provee `titulo`, o decorativo en caso contrario.
 */
export function Logo({ className, titulo }: LogoProps) {
  return (
    <img
      src={RUTA_ISOTIPO}
      className={['object-contain', className ?? ''].filter(Boolean).join(' ')}
      alt={titulo ?? ''}
      aria-hidden={titulo ? undefined : true}
      draggable={false}
    />
  );
}

interface IsotipoConWordmarkProps {
  /** Clases del contenedor. */
  className?: string;
  /** Texto accesible del conjunto marca. */
  titulo?: string;
}

/**
 * Isotipo del león sobre el wordmark "REAL PLAZA", apilados verticalmente. Usado
 * en la banda de cierre de la página. El wordmark hereda el color del contenedor.
 */
export function IsotipoConWordmark({
  className,
  titulo = 'Real Plaza',
}: IsotipoConWordmarkProps) {
  return (
    <span className={['inline-flex flex-col items-center', className ?? '']
      .filter(Boolean)
      .join(' ')}
    >
      <Logo className="h-14 w-14" titulo={titulo} />
      <span className="cr-display mt-2 text-2xl tracking-[0.18em]">
        Real Plaza
      </span>
    </span>
  );
}

/**
 * `BandaMarca`: banda morada de cierre de página con esquinas superiores
 * redondeadas (patrón "superficies suaves" del sistema de diseño), el isotipo
 * del león y el wordmark "REAL PLAZA" centrados en blanco. Incluye el aviso de
 * demostración. Respeta el área segura inferior (notch/home indicator).
 */
export function BandaMarca() {
  return (
    <footer className="safe-bottom mt-8 rounded-t-3xl bg-brand px-6 py-10 text-center text-white">
      <IsotipoConWordmark className="text-white" titulo="Real Plaza" />
      <p className="mx-auto mt-4 max-w-md text-sm text-white/75">
        Una red de apoyo para nuestras comunidades.
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs italic text-white/60">
        Mapa de Solidaridad Real · Demostración. Todos los datos son ficticios.
      </p>
    </footer>
  );
}
