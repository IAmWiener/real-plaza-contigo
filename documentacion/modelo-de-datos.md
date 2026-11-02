# Modelo de datos — Real Plaza Contigo

> **Estado:** en progreso. Basado en `frontend/src/types/domain.ts`.
>
> ⚠️ **Todos los datos son ficticios y de demostración** (sedes, RUC,
> coordenadas, eventos, capacidades, contactos). No representan información real
> de Real Plaza.

## Entidades

| Entidad | Tipo | Descripción | Relaciones (por ID) |
|---------|------|-------------|---------------------|
| `Empresa` | sede / aliado | Centro comercial de Real Plaza o aliado participante. Incluye RUC ficticio. | Referenciada por `PuntoAcopio.sedeId` y `PuntoAcopio.aliadoIds` |
| `Categoria` | — | Categoría de recursos atendidos (alimentos, agua, salud, etc.). Incluye nombre de icono Lucide. | Referenciada por `PuntoAcopio.categoriaIds` |
| `Evento` | desastre | Evento o desastre natural ficticio. | Referenciado por `PuntoAcopio.eventoId` |
| `Recurso` | — | Recurso disponible en un punto de acopio. | `Recurso.puntoAcopioId → PuntoAcopio.id` |
| `PuntoAcopio` | — | Centro de acopio sobre el mapa. | `sedeId`, `aliadoIds[]`, `categoriaIds[]`, `eventoId` |
| `PuntoRiesgo` | — | Reporte ciudadano de zona de riesgo con rango perimetral. | Autónomo (sin FKs) |

## Enumeraciones (uniones de tipos)

| Tipo | Valores |
|------|---------|
| `EstadoOperativo` | `operativo`, `capacidad_limitada`, `saturado`, `cerrado` |
| `TipoDesastre` | `inundacion`, `sismo`, `deslizamiento`, `lluvias_intensas` |
| `EstadoEvento` | `activo`, `monitoreo`, `cerrado` |
| `TipoIncidente` | `inundacion`, `derrumbe`, `incendio`, `sismo`, `via_bloqueada`, `otro` |
| `SeveridadRiesgo` | `bajo`, `medio`, `alto`, `critico` |
| `EstadoReporte` | `activo`, `en_verificacion`, `resuelto` |
| `EstadoDisponibilidad` | `disponible`, `bajo`, `agotado` |

## Relaciones principales

```
Empresa (sede) 1 ──< PuntoAcopio >── N Categoria
Empresa (aliado) N ──< PuntoAcopio
Evento 1 ──< PuntoAcopio (opcional)
PuntoAcopio 1 ──< Recurso
PuntoRiesgo  (independiente, reporte ciudadano)
```

- El **nivel de ocupación/disponibilidad** de un `PuntoAcopio` se deriva de
  `ocupacion / capacidad` (no es un porcentaje arbitrario).
- `PuntoRiesgo` define un área perimetral mediante `coordenada` + `radioMetros`.

## Payloads de entrada

| Tipo | Deriva de | Omite |
|------|-----------|-------|
| `PuntoAcopioInput` | `PuntoAcopio` | `id`, `actualizadoEn` |
| `PuntoRiesgoInput` | `PuntoRiesgo` | `id`, `reportadoEn`, `estado` |

## Modo de la aplicación

`ModoApp = 'acopio' | 'riesgo'` — controla qué contenido muestra el mapa y los
paneles (selector principal de la interfaz).
