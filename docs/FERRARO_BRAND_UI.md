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

| Asset                                | Uso                                                                | Fuente        |
| ------------------------------------ | ------------------------------------------------------------------ | ------------- |
| `ferraro-lockup-detail-tricolor.svg` | Login, portal y firma institucional clara                          | Página 3      |
| `ferraro-lockup-detail-black.svg`    | PDF e impresión sobre blanco                                       | Página 4      |
| `ferraro-logo-tricolor.svg`          | Superficie clara con presencia institucional                       | Página 3      |
| `ferraro-logo-black.svg`             | UI clara compacta                                                  | Página 4      |
| `ferraro-logo-white.svg`             | Shell y fondos oscuros; geometría oficial de la variante monocroma | Páginas 2 y 4 |
| `ferraro-logo-outline.svg`           | Recurso decorativo de baja frecuencia                              | Página 5      |
| `ferraro-mark-tricolor.svg`          | App icon y acento institucional claro                              | Página 3      |
| `ferraro-mark-outline.svg`           | Navegación compacta monocroma                                      | Páginas 1 y 4 |

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

- Familia aprobada: Inter Variable 5.3.0, subset latino, una sola familia, números tabulares y carga local mediante `next/font/local`.
- Inter e IBM Plex Sans se compararon lado a lado con copy de login/dashboard, vehículo, estados, montos y tabla densa. No apareció una mejora clara con IBM Plex: Inter preservó el carácter sobrio, una fila 1 px más compacta y una lectura más neutral. Evidencia privada: `/tmp/ferraro-redesign-evidence/fe01/type-comparison.png`.
- Los WOFF2 y su licencia OFL viven en `src/design-system/fonts`; checksums SHA-256: normal `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62`, italic `7291b5970da2237441273c03b424a504b70b18f09791473fab99687dcc314720`.
- Wordmark: siempre SVG oficial; nunca texto Inter/IBM Plex.
- Iconografía: Phosphor por defecto, imports individuales. Lucide sólo reemplaza la elección completa si el spike demuestra una desventaja real de bundle, SSR o accesibilidad.

En FE-02 Phosphor Icons 2.1.10 quedó aprobado como único set. Se usan imports `dist/ssr` en Server Components y el entrypoint cliente sólo en boundaries interactivos. La muestra real de acciones/estados produjo un chunk cliente de 28.770 bytes sin comprimir y no mostró problemas SSR; Lucide 1.54.0 no ofreció una mejora que justificara perder las variantes de peso de Phosphor.

## Foundations y tokens

- Fuente única: `src/design-system/tokens.css`; las capas se ordenan como `reset`, `tokens`, `base`, `components`, `patterns`, `modules`, `utilities` y `overrides`.
- Namespaces: `--brand-*`, superficies/foreground/border, interacción, estados, tipografía, spacing, geometría, controles, layout, z-index y motion.
- Breakpoints de referencia: 30, 48, 64 y 80 rem. Gutters: 1 rem mobile, 1.5 rem tablet y 2 rem desktop. Anchos de contenido: 45, 76 y 90 rem.
- Targets interactivos parten de 44 px. El foco claro usa `#6B5500` con 6.52:1 sobre canvas; el amarillo oficial se reserva como acento complementario.
- Aliases `--color-*` sostienen únicamente selectores heredados durante la migración. Componentes nuevos consumen tokens semánticos y FE-14 elimina aliases sin referencias.

Contrastes verificados en FE-01: foreground/canvas 16.03:1; muted/canvas 5.80:1; blanco/gris 5.01:1; success 6.47:1; warning 6.60:1; danger 6.12:1; info 6.37:1 sobre sus superficies.

## Componentes y patrones

Contratos de producción disponibles desde FE-02:

- Marca: `BrandLogo`, `BrandMark`, `BrandLockup`; encapsulan activos oficiales, variantes y mínimos.
- Controles: `Button`, `IconButton`, `Field`, `FieldError`, `Input`, `Textarea`, `Select`, `Choice`.
- Estado: `Badge`, `Alert`, `Spinner`, `Skeleton`, `EmptyState`.
- Superficie: `Card` flat/raised/interactive.
- Overlays: `Dialog`, `Drawer`, `Tooltip` integrado en `IconButton` y `ConfirmDialog`, respaldados por React Aria Components 1.22.1.
- Página/form: `Page`, `PageHeader`, `SectionHeader`, `DetailHeader`, `DataToolbar`, `FormSection`, `FormGrid`, `FormActions`.

Los controles nativos preservan semantics y autocompletado. React Aria se limita a interacción compleja. El catálogo vivo `/app/design-system` es ADMIN-only, importa los componentes productivos y muestra estados idle/loading/disabled/error, responsive y overlays; no es una implementación paralela.

## Shell y navegación

- Desktop amplio: sidebar grafito de 280 px con logo oficial inverso, grupos Operación/Comercial/Insumos/Administración, activo con superficie + línea amarilla + `aria-current`, cuenta y salida.
- Desktop compacto: 72 px, isotipo oficial, labels accesibles y tooltip por foco; preferencia persistida localmente sin afectar autorización.
- Tablet 768–1024: compacto forzado para preservar ancho operativo.
- Mobile: header claro con logo oficial, búsqueda y drawer; barra inferior de cinco destinos operativos con icono, texto y activo no dependiente sólo del color.
- Contenido: ancho máximo 90 rem, gutters responsive, topbar de búsqueda sticky, breadcrumbs semánticos y skip link al `main`.

El mapa de iconos usa exclusivamente Phosphor regular/bold en cajas ópticas de 20–24 px. La navegación se filtra en servidor mediante `getNavigationForRole`; CSS nunca oculta una capacidad como mecanismo de seguridad.

## Acceso y estados globales

- Login desktop: composición editorial 45/55, panel grafito con geometría derivada del isotipo, lockup FERRARO DETAIL oficial sobre placa blanca y formulario claro sin fotografía genérica.
- Login tablet: conserva ambas regiones mientras cada columna mantiene ancho usable; mobile usa un formulario único con lockup oficial, foco inicial en Email y controles de 48 px.
- Auth: mismo Better Auth, mismos nombres/autocomplete, sin signup/reset/social. Loading localizado, error live y valores preservados.
- Estados: `StatePage` unifica error recuperable/global, 403 y 404 con isotipo, código, heading, explicación y acción segura; no revela contenido protegido.
- Loading/toast: skeleton estructural con `aria-busy` y `ToastRegion` live, dismissible y fuera de la navegación de foco automática.

El amarillo aparece como señal institucional y línea de composición. Sobre superficie clara, labels pequeños usan `--focus-ring` (6.52:1), no el amarillo oficial de 1.35:1.

## Dashboard operativo

- La operación de hoy ocupa la primera lectura después del encabezado y de los accesos rápidos: turno, hora, vehículo, cliente y servicio forman una sola fila accionable.
- El estado vacío conserva estructura y una siguiente acción clara; no se rellena la pantalla con métricas o gráficos sin utilidad operativa.
- ADMIN recibe un bloque financiero separado. Flujo neto usa la única superficie oscura del conjunto y es el KPI dominante; cobrado, egresos, cantidad de trabajos y saldo pendiente quedan subordinados.
- STAFF comparte agenda, trabajos y stock, pero el servidor no le entrega KPIs, seguimientos comerciales ni accesos administrativos.
- Desktop usa una grilla 2:1 para la jornada y mosaicos financieros; tablet colapsa la jornada a una columna y mantiene datos escaneables; mobile omite finanzas por rol y usa listas verticales con acciones rápidas en scroll horizontal.
- DashboardSection, Kpi y DashboardEmpty son patrones locales del módulo: consumen tokens y primitives compartidos, pero no se promueven a componentes genéricos hasta existir un segundo consumidor real.

Evidencia FE-05: `/tmp/ferraro-redesign-evidence/fe05`, seis viewports obligatorios combinados entre ADMIN y STAFF, sin overflow y con axe WCAG A/AA en cero violations.

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
- Los aliases visuales heredados y los hex previos permanecen hasta migrar cada consumidor; no deben recibir usos nuevos y se auditan para su eliminación en FE-14.
