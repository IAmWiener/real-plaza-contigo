# Sistema de diseño — Comunidad Real (Mapa de Solidaridad Real)

> **Estado:** aplicado al frontend. Los tokens provienen del sistema de diseño
> **"Comunidad Real"** de Real Plaza (muestreado de capturas del sitio; las
> fuentes son sustitutos de Google Fonts). La implementación vive en
> `frontend/tailwind.config.js`, `frontend/index.html` y `frontend/src/index.css`.

Esta guía documenta cómo la identidad de **Comunidad Real** se tradujo a los
tokens de Tailwind del proyecto y cómo usarla al construir piezas nuevas.

---

## 1. Principios

- **Morado estructura, turquesa da energía.** El morado sostiene la navegación,
  la marca y la acción primaria; el turquesa anima banners, cabeceras, acentos y
  el anillo de foco.
- **Titulares que gritan.** Display condensada en mayúsculas para títulos;
  display extendida solo para la palabra protagonista de un hero.
- **Superficies suaves.** Esquinas redondeadas generosas; navegación y botones
  tipo *pill* (totalmente redondeados).
- **Lectura cómoda.** Cuerpo en sans redondeada (Outfit), alineado a la
  izquierda, gris oscuro sobre fondos muy claros.
- **Mínimo viable.** Pocos tokens, pocos componentes. Lo que no esté aquí se
  construye con estos mismos tokens.

---

## 2. Color y mapeo a Tailwind

La marca y los acentos conviven con **señales semánticas** (estado de acopio y
severidad de riesgo). Estas señales **no son marca**: comunican alerta y
disponibilidad, y se mantienen separadas para no perder legibilidad.

### Marca (morado) — token `brand`

| Token Tailwind | Hex | Origen (Comunidad Real) | Uso |
|----------------|-----|-------------------------|-----|
| `brand.DEFAULT` | `#4F0090` | morado 800 | Header, footer, acción primaria |
| `brand.dark` | `#3A006B` | morado 900 | Hover / presionado |
| `brand.light` | `#6A0BE0` | morado 600 | Acción destacada, chat, interacción |
| `brand.soft` | `#EFE4FB` | morado 100 | Fondos suaves, tags |

### Acento (turquesa) — token `accent`

| Token Tailwind | Hex | Origen | Uso |
|----------------|-----|--------|-----|
| `accent.DEFAULT` | `#2FC4D2` | turquesa 500 | Ilustraciones, **anillo de foco** |
| `accent.soft` | `#7FD9E1` | turquesa 300 | Banners, cabeceras, pestaña activa |
| `accent.subtle` | `#C6EFF3` | turquesa 100 | Chips, botón cerrar |
| `accent.surface` | `#ECFBFD` | celeste 50 | Fondo de tarjeta de contenido |

### Texto y superficies

| Token Tailwind | Hex | Origen | Uso |
|----------------|-----|--------|-----|
| `title` | `#0B3A22` | verde 900 | Títulos sobre turquesa/celeste (AA) |
| `ink.DEFAULT` | `#111111` | negro | Titulares |
| `ink.soft` | `#4A4A4A` | gris 700 | Cuerpo |
| `ink.muted` | `#7A7A7A` | gris 500 | Texto secundario |
| `surface.DEFAULT` | `#FFFFFF` | blanco | Fondo, texto sobre morado |
| `surface.subtle` | `#ECFBFD` | celeste 50 | Fondo de contenido suave |
| `surface.border` | `#E3E3E3` | gris 200 | Bordes |

### Señales semánticas (se conservan, no son marca)

| Grupo | Tokens | Uso |
|-------|--------|-----|
| `status.*` | operativo `#16A34A`, limitado `#D97706`, saturado `#DC2626`, cerrado `#7A7A7A` | Estado operativo de centros de acopio |
| `risk.*` | bajo `#2563EB`, medio `#D97706`, alto `#DC2626`, crítico `#7F1D1D` | Severidad de zonas de riesgo |

> **Contraste:** blanco sobre `brand.DEFAULT` y `title` sobre `accent.soft`
> cumplen AA. **Evita** texto blanco sobre turquesa.

---

## 3. Tipografía

| Rol | Token Tailwind | Fuente | Uso |
|-----|----------------|--------|-----|
| Display condensada | `font-display` | Anton | Titulares H1/H2 en mayúsculas |
| Display extendida | `font-impacto` | Archivo Black | Palabra protagonista del hero |
| Base | `font-sans` | Outfit | Navegación, cuerpo, botones |

Las fuentes se cargan vía Google Fonts en `frontend/index.html`.

### Escala (`fontSize` en Tailwind)

| Clase | Tamaño (clamp) | Notas |
|-------|----------------|-------|
| `text-hero` | `clamp(3rem, 7vw, 5.5rem)` | Interlineado 0.95 |
| `text-h1` | `clamp(2.25rem, 4.5vw, 3.75rem)` | Mayúsculas, color `title` |
| `text-h2` | `clamp(1.75rem, 3vw, 2.5rem)` | Mayúsculas, color `title` |
| `text-h3` | `1.375rem` | Bold, morado |
| `text-body-lg` | `1.375rem` | Párrafos de artículo, `ink.soft` |
| `text-body` | `1.125rem` | Texto estándar |

Utilidades globales (en `index.css`): `.cr-display` (Anton, mayúsculas,
interlineado 0.95) y `.cr-impacto` (Archivo Black, mayúsculas).

**Pesos:** 400 regular, 500 medio (navegación), 700 bold (botones, H3).

---

## 4. Radios, sombras y movimiento

### Radios (`borderRadius`)

| Clase | Valor | Uso |
|-------|-------|-----|
| `rounded-sm` | 8px | Elementos pequeños |
| `rounded-md` | 16px | Contenedores menores |
| `rounded-lg` | 24px | Tarjetas de imagen/video |
| `rounded-3xl` | 40px | Esquinas superiores de secciones |
| `rounded-pill` | 999px | Nav activo, botones |

### Sombras (`boxShadow`, con tinte morado)

| Clase | Uso |
|-------|-----|
| `shadow-sm` | Tarjetas |
| `shadow-md` | Elementos elevados |
| `shadow-fab` | Botón flotante de chat |
| `shadow-float` / `shadow-panel` / `shadow-soft` | Paneles flotantes sobre el mapa |

### Movimiento

- `ease-cr` → `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Animaciones `animate-fade-in` y `animate-slide-up`.
- Se respeta `prefers-reduced-motion` globalmente (en `index.css`).

---

## 5. Gradientes

| Clase | Uso |
|-------|-----|
| `bg-brand-gradient` | Isotipos/bandas de marca (morado) |
| `bg-brand-soft` | Fondos suaves de marca |
| `bg-accent-gradient` | Cabeceras/banners (turquesa) |

---

## 6. Componentes (implementación actual)

### Botón (`src/components/ui/Boton.tsx`)

Forma *pill*, texto bold, foco con anillo turquesa de 3px. Variantes:

| Variante | Estilo | Uso |
|----------|--------|-----|
| `primario` | morado 800 / blanco | Acción principal |
| `acento` | morado 600 / blanco | Acción destacada |
| `turquesa` | turquesa 300 / verde 900 | Sobre fondos claros o banda morada |
| `secundario` | borde morado 800 | Acción secundaria |
| `inverso` | borde blanco | Sobre fondo morado |
| `fantasma` | transparente | Acciones discretas |
| `peligro` | rojo (`status.saturado`) | Acciones destructivas |

Todas las áreas táctiles son ≥ 44px.

### Header / banda de marca (`src/components/layout/Header.tsx`)

Banda **morado 800** con texto blanco, isotipo del león (imagen real
`public/favicon-layo.png`, vía el componente `Logo`), wordmark en
`.cr-display`, indicador **DEMO** y controles. Sticky, con `safe-top` para el
notch.

### Selector de modo (`src/components/layout/SelectorModo.tsx`)

Tablist accesible tipo *pill* sobre la banda morada: la pestaña activa es una
píldora **turquesa** con texto `title` (verde 900) y una barra inferior; las
inactivas son blancas translúcidas. La selección se comunica con varias señales,
no solo con color.

### Selector de tipo de riesgo (`src/components/risk/FlujoReporteRiesgo.tsx`)

Cuadrícula de pastillas circulares con icono y color por tipo de incidente
(inspirada en apps de reportes de mapa). El catálogo visual de tipos vive en
`src/utils/riesgo.ts` (icono de lucide, color, glifo y descripción).

---

## 7. Reglas de uso

**Sí**

- Estructura en morado 800; acentos y banners en turquesa.
- Titulares en mayúsculas con fuente display; cuerpo en *sentence case*.
- `title` (verde 900) para títulos sobre turquesa o celeste.
- Una sola acción primaria por vista.
- Esquinas redondeadas generosas.

**No**

- Texto blanco sobre turquesa.
- `brand.light` (morado 600) como fondo estructural; es solo interacción.
- Mezclar más de dos fuentes display en una pantalla.
- Centrar párrafos largos.

---

## 8. Responsive

- Bajo ~720px: menos *gutter*, navegación más baja, radios de sección a 24px y
  tipografías escaladas automáticamente vía `clamp()` en la escala `fontSize`.
- Las áreas táctiles se mantienen ≥ 44px en todos los tamaños.

---

## 9. Dónde cambiar los tokens

| Qué | Archivo |
|-----|---------|
| Colores, fuentes, radios, sombras, gradientes | `frontend/tailwind.config.js` |
| Carga de fuentes y `theme-color` | `frontend/index.html` |
| Foco, utilidades display, scrollbars, safe-areas | `frontend/src/index.css` |
| Catálogo visual de tipos de riesgo | `frontend/src/utils/riesgo.ts` |

Si llegan *assets* o hex oficiales de marca, basta con actualizar estos tokens;
los componentes referencian los tokens (no hex sueltos) salvo los `divIcon` de
Leaflet y el catálogo de riesgo, documentados arriba.
