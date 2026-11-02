/**
 * Configuración global de pruebas (Vitest + jsdom).
 *
 * jsdom no implementa de forma completa varias APIs del navegador que usan
 * React Testing Library y, sobre todo, Leaflet/React Leaflet (matchMedia,
 * ResizeObserver, getComputedStyle completo y la API de canvas/clientRects).
 * Aquí se registran los stubs mínimos para que importar y montar componentes
 * que dependen del mapa no falle en el entorno de pruebas.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM renderizado tras cada test.
afterEach(() => {
  cleanup();
});

// --- Mock base de localStorage ---------------------------------------------
// jsdom ya provee localStorage, pero lo reemplazamos por una implementación
// controlada y espiable, y la limpiamos antes de cada test para aislarlos.
class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
  configurable: true,
});

beforeEach(() => {
  globalThis.localStorage.clear();
});

// --- Stubs mínimos para jsdom + Leaflet -------------------------------------

// window.matchMedia (usado por usePrefersReducedMotion y algunas libs)
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // API antigua
      removeListener: vi.fn(), // API antigua
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// ResizeObserver (Leaflet y varios componentes lo usan para recalcular tamaños)
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverStub,
  });
}

// Leaflet consulta el tamaño del contenedor; jsdom devuelve 0 por defecto.
// Forzamos dimensiones no nulas para que el mapa no falle al inicializar.
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return 1024;
  },
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get() {
    return 768;
  },
});

// Leaflet usa getBoundingClientRect para posicionar marcadores y capas.
if (!HTMLElement.prototype.getBoundingClientRect) {
  HTMLElement.prototype.getBoundingClientRect = function (): DOMRect {
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };
}

// scrollTo no está implementado en jsdom.
if (!window.scrollTo) {
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    configurable: true,
    value: vi.fn(),
  });
}
