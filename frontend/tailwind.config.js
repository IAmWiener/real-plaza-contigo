/** @type {import('tailwindcss').Config} */
/*
 * Tokens derivados del sistema de diseño "Comunidad Real" (Real Plaza).
 * Principio rector: el MORADO estructura (navegación, marca, acción primaria),
 * el TURQUESA da energía (banners, cabeceras, acentos, foco).
 *
 * Nota: los colores semánticos de ESTADO de acopio (`status.*`) y de SEVERIDAD
 * de riesgo (`risk.*`) se conservan aparte de la paleta de marca: son señales
 * de alerta/disponibilidad y no deben confundirse con la identidad visual.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Marca: morado (estructura e interacción) ---
        brand: {
          DEFAULT: '#4F0090', // cr-morado-800: header, footer, acción primaria
          dark: '#3A006B', // cr-morado-900: hover / presionado
          light: '#6A0BE0', // cr-morado-600: acento interactivo, chat
          soft: '#EFE4FB', // cr-morado-100: fondos suaves, tags
        },
        // --- Acento: turquesa (energía) ---
        accent: {
          DEFAULT: '#2FC4D2', // cr-turquesa-500: ilustraciones, anillo de foco
          soft: '#7FD9E1', // cr-turquesa-300: banner hero, cabecera de página
          subtle: '#C6EFF3', // cr-turquesa-100: chips, botón cerrar
          surface: '#ECFBFD', // cr-celeste-50: fondo de tarjeta de contenido
        },
        // Color de títulos sobre turquesa/celeste (cumple AA).
        title: '#0B3A22', // cr-verde-900
        ink: {
          DEFAULT: '#111111', // cr-negro: titulares
          soft: '#4A4A4A', // cr-gris-700: cuerpo
          muted: '#7A7A7A', // cr-gris-500: texto secundario
        },
        surface: {
          DEFAULT: '#FFFFFF', // cr-blanco
          subtle: '#ECFBFD', // cr-celeste-50: fondo de contenido/página suave
          border: '#E3E3E3', // cr-gris-200
        },
        // --- Señales semánticas (no son marca) ---
        status: {
          operativo: '#16A34A',
          limitado: '#D97706',
          saturado: '#DC2626',
          cerrado: '#7A7A7A',
        },
        risk: {
          bajo: '#2563EB',
          medio: '#D97706',
          alto: '#DC2626',
          critico: '#7F1D1D',
        },
      },
      fontFamily: {
        // Base: Outfit (navegación, cuerpo, botones).
        sans: ['Outfit', 'Nunito Sans', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
        // Display condensada: Anton (titulares H1/H2 en mayúsculas).
        display: ['Anton', 'Bebas Neue', 'Oswald', 'Impact', 'sans-serif'],
        // Display extendida: Archivo Black (palabra protagonista del hero).
        impacto: ['"Archivo Black"', '"Arial Black"', 'sans-serif'],
      },
      fontSize: {
        // Escala del sistema (clamp para fluidez entre móvil y escritorio).
        hero: ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '0.95' }],
        h1: ['clamp(2.25rem, 4.5vw, 3.75rem)', { lineHeight: '0.98' }],
        h2: ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1' }],
        h3: ['1.375rem', { lineHeight: '1.2' }],
        'body-lg': ['1.375rem', { lineHeight: '1.4' }],
        body: ['1.125rem', { lineHeight: '1.5' }],
      },
      boxShadow: {
        // Tinte morado, alineado con --cr-shadow-*.
        sm: '0 2px 6px rgba(30, 0, 60, 0.12)',
        md: '0 6px 20px rgba(30, 0, 60, 0.18)',
        fab: '0 6px 18px rgba(79, 0, 144, 0.35)',
        panel: '0 10px 30px -12px rgba(30, 0, 60, 0.28)',
        card: '0 2px 6px rgba(30, 0, 60, 0.12)',
        float:
          '0 20px 45px -18px rgba(79, 0, 144, 0.35), 0 4px 12px -6px rgba(30, 0, 60, 0.14)',
        soft: '0 8px 24px -14px rgba(30, 0, 60, 0.22)',
      },
      borderRadius: {
        // Esquinas generosas (sistema "superficies suaves").
        sm: '8px', // --cr-radius-sm
        md: '16px', // --cr-radius-md
        lg: '24px', // --cr-radius-lg
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '40px', // --cr-radius-xl: esquinas superiores de secciones
        pill: '999px', // --cr-radius-pill: nav activo, botones
      },
      backgroundImage: {
        // Gradiente de marca (morado) para isotipos/bandas.
        'brand-gradient':
          'linear-gradient(135deg, #6A0BE0 0%, #4F0090 55%, #3A006B 100%)',
        'brand-soft':
          'linear-gradient(135deg, rgba(106,11,224,0.12) 0%, rgba(79,0,144,0.08) 100%)',
        // Gradiente de acento (turquesa) para cabeceras/banners.
        'accent-gradient':
          'linear-gradient(135deg, #7FD9E1 0%, #2FC4D2 100%)',
      },
      transitionTimingFunction: {
        cr: 'cubic-bezier(0.2, 0.7, 0.2, 1)', // --cr-ease
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s cubic-bezier(0.2, 0.7, 0.2, 1)',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
