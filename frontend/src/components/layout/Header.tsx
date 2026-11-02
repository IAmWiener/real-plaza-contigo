/**
 * `Header`: cabecera principal de Real Plaza Contigo.
 *
 * Reúne la identidad de marca y los controles de navegación de nivel superior:
 *
 * - Logotipo tipográfico "Real Plaza Contigo" (marca Real Plaza) y el lema
 *   "Una red de apoyo para nuestras comunidades" (Req. 11.1, 15.1).
 * - `SelectorModo` para alternar entre Modo_Acopio y Modo_Riesgo (Req. 11.3).
 * - Control Mapa / Administración: par de botones que alternan la vista activa
 *   indicando con etiqueta + icono cuál está seleccionada (Req. 11.3, 10.1).
 * - Botón de acceso a la ubicación actual del usuario; el centrado real lo
 *   realiza el `ControlUbicacion` del mapa, aquí es solo el disparador.
 *
 * El componente recibe props explícitas (en lugar de consumir el contexto
 * `useApp`) para mantenerlo desacoplado y fácil de probar de forma aislada.
 *
 * Layout responsive sin scroll horizontal desde 360px (Req. 11.4, 13.1): usa
 * `flex-wrap` y `gap`, trunca el texto de marca y reorganiza los controles en
 * una segunda fila en pantallas pequeñas. En móvil (<768px) el `SelectorModo`
 * ocupa su propia fila a lo ancho; en escritorio (≥768px) todo convive en una
 * sola fila. Todas las áreas táctiles son de al menos 44px (vía `Boton`).
 */

import {
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  LocateFixed,
  Map,
} from 'lucide-react';

import type { ModoApp } from '@/types/domain';
import type { Vista } from '@/types/ui';
import { Boton } from '@/components/ui';
import { SelectorModo } from '@/components/layout/SelectorModo';
import { Logo } from '@/components/layout/Logo';

export interface HeaderProps {
  /** Modo actualmente activo (acopio/riesgo). */
  modo: ModoApp;
  /** Callback invocado al seleccionar un modo en el `SelectorModo`. */
  onCambiarModo: (modo: ModoApp) => void;
  /** Vista actualmente activa (mapa/administración/resumen). */
  vista: Vista;
  /** Callback invocado al alternar entre las vistas. */
  onCambiarVista: (vista: Vista) => void;
  /** Callback invocado al pulsar el botón de ubicación actual. */
  onUbicacion: () => void;
  /** Callback invocado al pulsar "¿Cómo funciona?" (relanza el onboarding). */
  onAyuda: () => void;
}

/**
 * Cabecera con marca, lema, indicador de entorno DEMO y controles de modo,
 * vista y ubicación.
 */
export function Header({
  modo,
  onCambiarModo,
  vista,
  onCambiarVista,
  onUbicacion,
  onAyuda,
}: HeaderProps) {
  const enMapa = vista === 'mapa';
  const enResumen = vista === 'resumen';
  const enAdministracion = vista === 'administracion';

  return (
    <header className="safe-top sticky top-0 z-[700] w-full bg-brand text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:gap-x-4 sm:gap-y-2.5 sm:px-4 sm:py-3">
        {/* Bloque de marca: isotipo, wordmark e indicador DEMO. */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          {/* Isotipo del león de Real Plaza, en blanco sobre la banda morada
              (uso recomendado por la guía de marca). */}
          <Logo
            className="h-8 w-8 shrink-0 text-white sm:h-10 sm:w-10"
            titulo="Real Plaza"
          />
          <div className="min-w-0">
            <span className="cr-display block whitespace-nowrap text-xl leading-none text-white sm:text-2xl">
              Solidaridad Real
            </span>
            <p className="hidden text-xs text-white/80 sm:block">
              Una red de apoyo para nuestras comunidades
            </p>
          </div>
        </div>

        {/* Controles de vista y ubicación. */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/*
           * Grupo Mapa / Administración. La vista activa se distingue con una
           * píldora turquesa (acento) y `aria-pressed`, no solo por color.
           */}
          <div
            role="group"
            aria-label="Cambiar entre mapa, resumen y administración"
            className="flex items-center gap-1 rounded-pill bg-white/10 p-1"
          >
            <Boton
              variante={enMapa ? 'turquesa' : 'inverso'}
              tamano="sm"
              aria-pressed={enMapa}
              icono={<Map className="h-4 w-4" aria-hidden="true" />}
              onClick={() => onCambiarVista('mapa')}
              className={enMapa ? '' : 'border-transparent'}
            >
              <span className="hidden sm:inline">Mapa</span>
            </Boton>
            <Boton
              variante={enResumen ? 'turquesa' : 'inverso'}
              tamano="sm"
              aria-pressed={enResumen}
              icono={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
              onClick={() => onCambiarVista('resumen')}
              className={enResumen ? '' : 'border-transparent'}
              data-tour="resumen"
            >
              <span className="hidden sm:inline">Resumen</span>
            </Boton>
            <Boton
              variante={enAdministracion ? 'turquesa' : 'inverso'}
              tamano="sm"
              aria-pressed={enAdministracion}
              icono={<LayoutDashboard className="h-4 w-4" aria-hidden="true" />}
              onClick={() => onCambiarVista('administracion')}
              className={enAdministracion ? '' : 'border-transparent'}
            >
              <span className="hidden sm:inline">Administración</span>
            </Boton>
          </div>

          {/* Acceso a la ubicación actual del usuario. Solo icono; oculto en
              móvil para no saturar la barra en pantallas pequeñas. */}
          <Boton
            variante="inverso"
            tamano="sm"
            aria-label="Centrar en mi ubicación actual"
            icono={<LocateFixed className="h-4 w-4" aria-hidden="true" />}
            onClick={onUbicacion}
            data-tour="ubicacion"
            className="hidden sm:inline-flex"
          />

          {/* Acceso permanente a la guía de uso (relanza el onboarding). Solo
              icono; oculto en móvil. */}
          <Boton
            variante="inverso"
            tamano="sm"
            aria-label="Ver guía: cómo funciona la aplicación"
            icono={<HelpCircle className="h-4 w-4" aria-hidden="true" />}
            onClick={onAyuda}
            className="hidden sm:inline-flex"
          />
        </div>

        {/*
         * Selector de modo Acopio / Riesgo. En móvil ocupa toda una fila propia
         * (ancho completo); en escritorio se limita a un ancho cómodo y se
         * alinea a la derecha dentro de la fila.
         */}
        <div
          className="w-full md:w-auto md:min-w-[22rem] md:max-w-md md:ml-auto"
          data-tour="modo"
        >
          <SelectorModo modo={modo} onCambiarModo={onCambiarModo} />
        </div>
      </div>
    </header>
  );
}
