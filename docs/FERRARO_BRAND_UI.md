# Ferraro Brand UI

> Fuente de implementación del frontend Ferraro. El manual oficial sigue siendo la autoridad visual; este documento registra su traducción digital verificable.

## Fuente y procedencia

- Fuente maestra: `docs/brand/source/FERRARO_manual_marca.pdf`.
- SHA-256: `efe1227d30607fc00f90dc8c5fa9374eeabcb0b23951ae68b9afd516aad97251`.
- Origen detectado: PDF 1.6 de 5 páginas exportado por Adobe Illustrator; conserva paths vectoriales.
- Extracción: PDF.js sobre el contenido vectorial, aislamiento por bounding box y matriz de transformación. No se utilizó autotrace ni reconstrucción tipográfica.
- Validación: comparación óptica contra las cinco páginas rasterizadas del manual, revisión de `viewBox`, paths, proporción, color y legibilidad.
- Derechos: activos propietarios de Ferraro, autorizados para Ferraro Manager. No son un paquete público ni reutilizable por PPF House.

## Activos oficiales

El manifiesto legible por tooling vive en `public/brand/manifest.json` y registra checksum individual.

| Asset | Uso | Fuente |
| --- | --- | --- |
| `ferraro-lockup-detail-tricolor.svg` | Login, portal y firma institucional clara | Página 3 |
| `ferraro-lockup-detail-black.svg` | PDF e impresión sobre blanco | Página 4 |
| `ferraro-logo-tricolor.svg` | Superficie clara con presencia institucional | Página 3 |
| `ferraro-logo-black.svg` | UI clara compacta | Página 4 |
| `ferraro-logo-white.svg` | Shell y fondos oscuros; geometría oficial de la variante monocroma | Páginas 2 y 4 |
| `ferraro-logo-outline.svg` | Recurso decorativo de baja frecuencia | Página 5 |
| `ferraro-mark-tricolor.svg` | App icon y acento institucional claro | Página 3 |
| `ferraro-mark-outline.svg` | Navegación compacta monocroma | Páginas 1 y 4 |

Reglas: no deformar, inclinar, sombrear, separar letras, reconstruir el wordmark con una fuente web ni aplicar colores de módulo. El área de exclusión mínima provisional es el ancho del isotipo. El descriptor `DETAIL` exige al menos 160 px de ancho óptico; debajo se usa logo sin descriptor. El logo compacto exige 110 px y el isotipo se usa entre 20 y 64 px según contexto.

## Color

Núcleo de marca aprobado para digital:

- `#000000` negro.
- `#706F6F` gris.
- `#FFCE13` amarillo.
- `#FFFFFF` blanco.

Contrastes medidos: negro/blanco 21.00:1; negro/amarillo 14.09:1; blanco/gris 5.01:1. Negro/gris es 4.19:1 y no se usa como combinación de texto normal que requiera 4.5:1. El amarillo nunca recibe texto blanco y no representa por sí mismo `warning`.

Los tonos derivados viven como tokens semánticos. Primitives y módulos no consumen hex de marca directamente.

## Tipografía e iconografía

- Hipótesis aprobada: Inter Variable, subset latino, una sola familia y números tabulares.
- Comparación requerida en GATE 1: Inter vs IBM Plex Sans en login, dashboard, agenda y tabla densa.
- Wordmark: siempre SVG oficial; nunca texto Inter/IBM Plex.
- Iconografía: Phosphor por defecto, imports individuales. Lucide sólo reemplaza la elección completa si el spike demuestra una desventaja real de bundle, SSR o accesibilidad.

## Geometría y tono

La UI deriva del isotipo su ritmo vertical y división en tres, sin convertirlos en patrón ornamental repetitivo. El shell es grafito y el área de trabajo clara. La identidad proviene de activo, tipografía, alineación, ritmo y detalle; el amarillo se reserva para marca, foco y selección controlada.

## Baseline FE-00

- 39 rutas `page.tsx`, 9 estados `loading.tsx`, 247 selectores globales de primer nivel y 3 componentes transversales previos al rediseño.
- 18 capturas locales privadas: login, dashboard ADMIN y dashboard STAFF en 1440×900, 1280×800, 1024×768, 820×1180, 768×1024 y 390×844.
- Ubicación local: `/tmp/ferraro-redesign-evidence/fe00` (no versionada, datos E2E sintéticos).
- Baseline técnico: lint y typecheck verdes; 35 unit y 42 integración verdes; build Next.js verde.
- Baseline de permisos: STAFF no recibe el resumen financiero; no hubo overflow horizontal a 390 px.

## Arquitectura y portabilidad

Ferraro conserva ownership de assets y composición institucional. Los primitives sólo consumen contratos semánticos. Para PPF House se sustituyen manifiesto, `brand.config`, tokens, fuente, login y slots de PDF; no se copian assets Ferraro, auth, DB, storage ni datos.

## Deuda y evidencia pendiente

- Preview cloud aislada, DB preview, Better Auth preview y storage persistente todavía no están disponibles/verificados en esta ejecución.
- Las capturas de Playwright permanecen como artifacts privados con retención objetivo de 14 días; no se versionan.
- La validación de persistencia remota de fotos en FE-08/FE-12 quedará explícitamente pendiente si no se provisiona storage preview aislado.
