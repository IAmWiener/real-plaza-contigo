/**
 * `Logo`: isotipo de Real Plaza (cabeza de león estilizada) como SVG vectorial.
 *
 * Se recrea en vectores en lugar de depender de un PNG para que escale nítido a
 * cualquier tamaño y pueda recolorearse con `currentColor` (el PNG oficial es
 * morado y, según la guía de marca, el logo debe ir en blanco sobre fondos
 * morados/oscuros). El color se hereda del contexto vía `currentColor`, de modo
 * que sobre la banda morada se usa `text-white` y sobre fondos claros
 * `text-brand`.
 *
 * El wordmark "REAL PLAZA" se compone aparte (ver `IsotipoConWordmark`), para
 * poder usar solo el isotipo en espacios reducidos (p. ej. la navegación).
 */

interface LogoProps {
  /** Clases utilitarias (tamaño y color vía `text-*`). */
  className?: string;
  /** Texto accesible; si se omite, el SVG es decorativo (`aria-hidden`). */
  titulo?: string;
}

/**
 * Isotipo: cabeza de león con melena circular, corona y hocico. Dibujado con
 * `fill="currentColor"` para heredar el color del contenedor.
 */
export function Logo({ className, titulo }: LogoProps) {
  const decorativo = !titulo;
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role={decorativo ? undefined : 'img'}
      aria-hidden={decorativo ? true : undefined}
      aria-label={titulo}
    >
      {titulo ? <title>{titulo}</title> : null}
      {/*
        Cabeza de león heráldica inspirada en la marca Real Plaza. Figura
        simétrica respecto al eje vertical (x=60): melena circular de mechones
        puntiagudos, corona de tres picos sobre la frente, ojos y hocico con
        sonrisa recortados en "negativo" (fillRule evenodd).
      */}
      <g fillRule="evenodd" clipRule="evenodd">
        {/* Melena: círculo exterior con mechones puntiagudos (silueta). */}
        <path d="M60 10
          L66 20 L74 13 L75 24 L86 21 L83 32 L95 33 L88 42 L99 47 L89 53
          C96 60 99 70 96 80 C93 92 83 101 72 105 C78 98 80 89 78 81
          C76 86 72 90 67 92 C72 86 73 78 70 72 L60 70 L50 72
          C47 78 48 86 53 92 C48 90 44 86 42 81 C40 89 42 98 48 105
          C37 101 27 92 24 80 C21 70 24 60 31 53 L21 47 L32 42 L25 33
          L37 32 L34 21 L45 24 L46 13 L54 20 Z
          M60 24 C48 24 39 33 37 45 C47 42 53 44 60 44 C67 44 73 42 83 45
          C81 33 72 24 60 24 Z" />
        {/* Corona de tres picos sobre la frente. */}
        <path d="M60 15 L65 27 L73 21 L70 33 L50 33 L47 21 L55 27 Z" />
        {/* Cara del león, con ojos y sonrisa recortados (negativo). */}
        <path d="M60 42
          C47 42 37 51 35 64 C34 72 37 80 43 86 C50 93 58 96 60 96
          C62 96 70 93 77 86 C83 80 86 72 85 64 C83 51 73 42 60 42 Z
          M49 58 C52 57 55 58 56 61 C57 64 56 67 53 68 C50 69 47 68 46 65
          C45 62 46 59 49 58 Z
          M71 58 C68 57 65 58 64 61 C63 64 64 67 67 68 C70 69 73 68 74 65
          C75 62 74 59 71 58 Z
          M44 75 C50 83 70 83 76 75 C74 82 68 87 60 87 C52 87 46 82 44 75 Z" />
      </g>
    </svg>
  );
}

interface IsotipoConWordmarkProps {
  /** Clases del contenedor (color vía `text-*`, hereda a isotipo y wordmark). */
  className?: string;
  /** Texto accesible del conjunto marca. */
  titulo?: string;
}

/**
 * Isotipo del león sobre el wordmark "REAL PLAZA", apilados verticalmente. Usado
 * en la banda de cierre de la página. El color se hereda con `currentColor`.
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
