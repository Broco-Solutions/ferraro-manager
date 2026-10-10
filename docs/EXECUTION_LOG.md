# Ferraro Manager — Execution Log

Registro resumido de la ejecución autónoma de V1. El contrato funcional continúa en [`FERRARO_MASTER_PLAN.md`](./FERRARO_MASTER_PLAN.md).

## BUILD 0

- **Status:** COMPLETE
- **Commits:** `8f16bf2..7a1571e`
- **Tests:** unit, integración, E2E, lint, typecheck, format y build verdes; CI remota verde.
- **Migrations:** `20261002211623_foundation`
- **Decisions:** DEC-001 — Better Auth con sesiones persistidas.
- **Known issues:** ninguno bloqueante.

## BUILD 1

- **Status:** COMPLETE
- **Commits:** `91385ab` — `feat(clients): complete build 1 clients and vehicles`
- **Tests:** 10 unit, 5 integración y 4 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Revisión visual/a11y desktop 1440×900, tablet 820×1180 y mobile 390×844 sin overflow.
- **Migrations:** `20261002221400_clients_vehicles`; schema y migraciones sin drift.
- **Decisions:** ninguna.
- **Known issues:** ninguno.

## BUILD 2

- **Status:** COMPLETE
- **Commits:** `ebab05c` — `feat(services): complete build 2 service catalog`
- **Tests:** 13 unit, 7 integración y 5 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. ADMIN/STAFF y proyección sin precios verificados. Revisión visual/a11y desktop, tablet y mobile sin overflow.
- **Migrations:** `20261002223027_service_catalog`, `20261002223140_service_catalog_constraints`; schema y migraciones sin drift.
- **Decisions:** ninguna.
- **Known issues:** ninguno.

## BUILD 3

- **Status:** COMPLETE
- **Commits:** `b5e079c` — `feat(calendar): complete build 3 scheduling`
- **Tests:** 15 unit, 10 integración y 6 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Agenda y formularios revisados en desktop 1440 px, tablet 820 px y mobile 390 px sin overflow ni errores de consola.
- **Migrations:** `20261002224645_service_cases_calendar`, `20261002224830_calendar_constraints`; schema y migraciones sin drift.
- **Decisions:** calendario propio server-rendered para V1; DnD/resize diferidos hasta justificar una dependencia madura.
- **Known issues:** ninguno.

## BUILD 4

- **Status:** COMPLETE
- **Commits:** `9c4f5f9` — `feat(jobs): complete build 4 work history`
- **Tests:** 17 unit, 13 integración y 7 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Flujo turno→trabajo y carga directa verificados; desktop, tablet y mobile revisados sin overflow ni errores de consola.
- **Migrations:** `20261002230859_jobs`, `20261002231010_job_constraints`.
- **Decisions:** ninguna.
- **Known issues:** ninguno.

## BUILD 5

- **Status:** COMPLETE
- **Commits:** `c635ef0` — `feat(quotes): complete build 5 quotes and PDF`
- **Tests:** 20 unit, 14 integración y 9 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Presupuesto→PDF→aceptación→mismo `ServiceCase`→turno verificado. Lista/editor revisados en desktop 1440 px, tablet 768 px y mobile 390 px; PDF A4 inspeccionado visualmente en una página y cubierto en varias páginas por test.
- **Migrations:** `20261002234000_quotes`.
- **Decisions:** ninguna nueva; `@react-pdf/renderer` 4.9.0 y storage privado detrás de adapter ejecutan la arquitectura aprobada en el Master Plan.
- **Known issues:** ninguno.

## BUILD 6

- **Status:** COMPLETE
- **Commits:** `1caf1a0` — `feat(finance): complete build 6 deposits and balances`
- **Tests:** 24 unit, 18 integración y 11 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Señas, pagos parciales/completos, reversión compensatoria, importe acordado versionado y límites mensuales de Buenos Aires verificados. Revisión visual desktop 1440 px, tablet 768 px y mobile 390 px sin overflow.
- **Migrations:** `20261003000954_finance`; schema y migraciones sin drift.
- **Decisions:** ninguna nueva; `FinancialEntry` es el ledger único de caja y el saldo de `ServiceCase` permanece derivado, según el Master Plan.
- **Known issues:** ninguno.

## BUILD 7

- **Status:** COMPLETE
- **Commits:** `6a346e7` — `feat(inventory): complete build 7 stock ledger`
- **Tests:** 27 unit, 22 integración y 12 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Precisión decimal, idempotencia, deducciones concurrentes, compensaciones, conciliación y proyección STAFF sin costos verificadas. Revisión visual desktop 1280 px, tablet 768 px y mobile 390 px sin overflow.
- **Migrations:** `20261003003829_inventory_core`, `20261003003910_inventory_constraints`; schema y migraciones sin drift.
- **Decisions:** ninguna nueva; saldo agregado + ledger y factores explícitos ejecutan el Master Plan.
- **Known issues:** ninguno.

## BUILD 8

- **Status:** COMPLETE
- **Commits:** `e26f1b8` — `feat(purchases): complete build 8 atomic purchasing`
- **Tests:** 29 unit, 25 integración y 13 E2E verdes; lint sin warnings, typecheck, format, build, migraciones y diff verdes. Compra→snapshots→stock→egreso único, idempotencia, rollback y anulación compensatoria verificados. Revisión visual desktop 1280 px, tablet 768 px y mobile 390 px sin overflow.
- **Migrations:** `20261003010430_suppliers_purchases`; schema y migraciones sin drift.
- **Decisions:** ninguna nueva; V1 registra la compra como pagada al postear, según contrato.
- **Known issues:** ninguno.

## BUILD 9

- **Status:** COMPLETE
- **Commits:** `ab44ac0` — `feat(inventory): complete build 9 job consumptions`
- **Tests:** 31 unit, 29 integración y 14 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Consumo decimal, doble submit, stock insuficiente, concurrencia, corrección compensatoria y anulación de trabajo con restitución verificados. Revisión visual desktop 1280 px, tablet 768 px y mobile 390 px sin overflow.
- **Migrations:** `20261003013500_job_consumptions`; ledger conciliado después de altas, correcciones, concurrencia y anulaciones.
- **Decisions:** ninguna nueva; consumos y correcciones usan el ledger append-only definido en el Master Plan.
- **Known issues:** ninguno.

## BUILD 10

- **Status:** COMPLETE
- **Commits:** `16dd751` — `feat(photos): complete build 10 private job gallery`
- **Tests:** 33 unit, 32 integración y 14 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Upload múltiple con progreso/retry, MIME falso, límites, privacidad por defecto, publicación explícita, portada, orden y borrado lógico verificados. Revisión visual desktop 1280 px, tablet 768 px y mobile 390 px sin overflow; variantes sin EXIF y acceso anónimo rechazado.
- **Migrations:** `20261003021000_job_photos`; schema y migraciones sin drift.
- **Decisions:** DEC-002 — adapter privado S3-compatible en producción, filesystem local sólo para desarrollo/test y variantes procesadas con Sharp.
- **Known issues:** ninguno bloqueante; el cleanup físico de objetos expirados/eliminados queda como mantenimiento con política de retención, sin afectar privacidad ni trazabilidad V1.

## BUILD 11

- **Status:** COMPLETE
- **Commits:** `4312d51` — `feat(portal): complete build 11 private client access`
- **Tests:** 35 unit, 36 integración y 15 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Token/password hashes, límite persistente, expiración, revocación, regeneración, sesión corta, headers no-store y acceso de fotos verificados. Fixture adversarial con clientes de igual nombre/teléfono confirma aislamiento; turno oculto, fotos privadas y notas internas no salen. Revisión visual desktop 1280 px, tablet 768 px y mobile 390 px sin overflow.
- **Migrations:** `20261003022626_client_portal`, `20261003022800_client_portal_constraints`; un solo link activo por cliente y hashes validados por DB.
- **Decisions:** ninguna nueva; cookie firmada y ligada a token/password aplica la sesión corta aprobada sin sumar una tabla de workflow.
- **Known issues:** ninguno.

## BUILD 12

- **Status:** COMPLETE
- **Commits:** `91a2ef9` — `feat(dashboard): complete build 12 operations and search`
- **Tests:** 35 unit, 39 integración y 16 E2E verdes; lint, typecheck, format, build, migraciones y diff verdes. Fórmulas de cobrado, egresos, flujo, ticket acordado, saldo e importe por definir reconciliadas con el ledger y límites de Buenos Aires. ADMIN/STAFF reciben proyecciones distintas en dashboard y búsqueda. Revisión visual desktop 1280 px, tablet 768 px y mobile 390 px sin overflow.
- **Migrations:** ninguna; índices existentes cubren rangos operativos. Medición local en base de desarrollo: dashboard operativo 113.9 ms en cold run, dashboard ADMIN 15.2 ms y búsqueda 26.4 ms; `ILIKE contains` conserva scan simple apropiado al volumen V1, sin Elasticsearch/trigram prematuro.
- **Decisions:** ninguna nueva.
- **Known issues:** ninguno.

## BUILD 13

- **Status:** COMPLETE
- **Commits:** `afc3460` — `feat(hardening): complete build 13 production readiness`
- **Tests:** 35 unit, 42 integración y 17 E2E verdes; lint, typecheck, format, build y diff verdes. Auditoría de dependencias sin vulnerabilidades conocidas; health, cleanup y reconciliación ejecutados. Revisión visual desktop 1280×800, tablet 768×1024 y mobile 390×844 sin overflow ni errores de consola; menú mobile corregido y cubierto por E2E.
- **Migrations:** ninguna nueva. Restore drill local aplicó desde cero las migraciones versionadas sobre un schema aislado y verificó 38 tablas; el procedimiento productivo exige DB/restauración aislada del proveedor.
- **Decisions:** ninguna nueva. DEC-002 se precisó para usar POST prefirmado con política de MIME/tamaño exactos y cleanup de intents expirados.
- **Known issues:** ningún issue crítico/alto de código. Antes de producción falta el gate humano y validar un restore real con los proveedores contratados de DB/storage.

## FRONTEND BUILD FE-00 — Auditoría y extracción de marca

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Base:** `feat/ferraro-frontend-redesign` en `0cabbab`, idéntica a `origin/main` al iniciar; working tree limpio.
- **Scope:** auditoría de 39 rutas, 9 loadings, 247 selectores globales y UI por rol; extracción de ocho SVG oficiales desde el PDF vectorial, manifiesto y checksums.
- **Evidence:** 18 capturas privadas en `/tmp/ferraro-redesign-evidence/fe00` para login, dashboard ADMIN y STAFF en los seis viewports obligatorios; contact sheet de assets en `/tmp/ferraro-brand-audit/optimized-contact.png`.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Prisma local aislado con 17 migraciones al día.
- **Security:** STAFF sin contenido financiero en HTML visible; baseline sin overflow horizontal mobile. No se usó producción ni servicios cloud.
- **Assets:** paths preservados; no autotrace, no fuente web para el wordmark; comparación manual páginas 1–5 aprobada internamente.
- **Gate:** GATE 1 marca, `approved for continued autonomous execution`; tokens, fuente, iconos y primitives continúan en FE-01/02.
- **Known issues:** preview/DB/auth/storage cloud aislados todavía no provisionados; no bloquean trabajo local y quedan sin declarar como validados.

## FRONTEND BUILD FE-01 — Foundations y tokens

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** tokens semánticos, cascade layers, foundations, utilidades mínimas, aliases heredados, Inter Variable local y `/app/design-system` inicial protegida para ADMIN.
- **Typography:** Inter Variable 5.3.0 elegida después de comparación óptica y métrica con IBM Plex Sans 5.3.0; una sola familia/subset latino, `display: swap`, fallback estable y licencia OFL versionada.
- **Evidence:** comparación tipográfica y tres capturas privadas de `/app/design-system` en `/tmp/ferraro-redesign-evidence/fe01`; 1440×900, 768×1024 y 390×844 sin overflow horizontal ni errores de consola.
- **Accessibility:** combinaciones de texto y estados entre 5.01:1 y 21:1; foco 6.52:1 sobre canvas, reduced motion global, targets base de 44 px y STAFF recibe forbidden server-side en el catálogo.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Fuente cargada localmente y confirmada en navegador.
- **Gate:** GATE 1 foundations/tipo, `approved for continued autonomous execution`; primitives e iconografía continúan en FE-02.
- **Known issues:** aliases y hardcodes heredados continúan bajo migración controlada; preview cloud aislada aún no disponible y no fue sustituida por producción.

## FRONTEND BUILD FE-02 — Componentes base y design system

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** primitives P0, assets de marca, patterns de página/form, overlays headless, Phosphor y catálogo vivo ADMIN. El `window.confirm` compartido fue reemplazado por `ConfirmDialog` sin modificar server actions; el uso específico del portal migra en FE-12.
- **Architecture:** controles simples nativos; React Aria Components 1.22.1 para dialog/drawer/tooltip/confirmación; Phosphor Icons 2.1.10 como único set con imports por entorno. Boundaries cliente limitadas a overlays, confirmación y showcase interactivo.
- **Evidence:** cinco capturas privadas en `/tmp/ferraro-redesign-evidence/fe02`: catálogo 1440×900, 768×1024, 390×844, drawer mobile y confirmación mobile. Sin overflow horizontal ni errores de consola; aborts observados correspondieron a prefetch RSC cancelado durante navegación completa, no a respuestas fallidas.
- **Accessibility:** 2 E2E del design system verdes; axe WCAG A/AA sin violations, Escape/cierre/retorno de foco verificados, cancelación recibe foco inicial en acción destructiva y controles táctiles parten de 44 px.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. E2E relacionado: 4/4 (catálogo/axe y presupuesto ADMIN/STAFF con confirmación real).
- **Gate:** GATE 1 completo, `approved for continued autonomous execution`; marca, tipo, tokens, iconos, primitives y overlays habilitan FE-03/04.
- **Known issues:** el catálogo aún se monta dentro del shell heredado; su navegación y fixed mobile se reemplazan en FE-03. Preview cloud aislada sigue pendiente y producción no fue usada.

## FRONTEND BUILD FE-03 — Shell, navegación e iconografía

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** shell completo, navegación agrupada por rol, activo inequívoco, sidebar 280/72 persistida, tablet compacta, header/drawer/bottom-nav mobile, breadcrumbs, skip link y búsqueda integrada. No cambiaron destinos, queries ni autorización.
- **Evidence:** ocho capturas privadas en `/tmp/ferraro-redesign-evidence/fe03`: ADMIN/STAFF en los seis viewports obligatorios, ADMIN 1440 colapsada y drawer STAFF 390. Sin overflow horizontal ni errores de consola.
- **Security:** items derivados de `getNavigationForRole` en servidor; STAFF sin Finanzas/Compras/Administración en drawer, bottom-nav, DOM no-JS ni navegación desktop. Las rutas continúan autorizadas server-side.
- **Accessibility:** landmarks y `aria-current`, links reales sin JS, skip link, nombre accesible en compacto, tooltip por foco, targets 44 px, Escape y retorno de foco del drawer. Axe A/AA del catálogo integrado: 0 violations.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. E2E relacionado auth/design-system/shell: 8/8, incluido axe A/AA.
- **Gate:** GATE 2 shell, `approved for continued autonomous execution`; GATE 2 completo se cierra junto con login/estados en FE-04.
- **Known issues:** evidencia preview cloud integrada no disponible; validación local product build cubre el shell. Estilos globales heredados sin consumidores se retiran en FE-14.

## FRONTEND BUILD FE-04 — Login y estados globales

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** login Ferraro responsive con lockup oficial, primitives de formulario y feedback; `StatePage` para error/403/404, loading estructural y toast base consumido por el catálogo. Better Auth, proxy, redirects y contratos permanecen intactos.
- **Evidence:** ocho capturas privadas en `/tmp/ferraro-redesign-evidence/fe04`: login idle en seis viewports, error mobile y not-found mobile. Sin overflow; consola limpia en idle. El 401 de credencial inválida y 404 de la ruta adversarial son respuestas esperadas del caso probado.
- **Accessibility:** autofocus real en Email tras hidratación, labels/autocomplete conservados, inputs 48 px, loading `aria-busy`, error live, valores preservados y foco/contraste visibles. Axe login y catálogo: 0 violations A/AA.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Auth/auth-ui 7/7 y design-system 2/2 en ejecuciones finales; submitting, invalid credentials, 403, 404 y toast cubiertos.
- **Gate:** GATE 2 completo, `approved for continued autonomous execution`; shell, navegación, login y estados habilitan migración modular.
- **Known issues:** preview cloud aislada no disponible; Better Auth Preview URL continúa pendiente de validación cloud. Producción no fue usada.

## FRONTEND BUILD FE-05 — Dashboard

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** dashboard operativo reordenado alrededor de la jornada: turnos de hoy y próximos primero, accesos rápidos por rol, actividad/stock como soporte y seguimiento administrativo separado. Para ADMIN, flujo neto es el KPI financiero principal; cobrado y egresos permanecen secundarios. No se agregaron métricas, gráficos, queries ni reglas de negocio.
- **Evidence:** seis capturas privadas en `/tmp/ferraro-redesign-evidence/fe05`, cubriendo ADMIN en 1440×900, 1280×800 y 1024×768, y STAFF en 820×1180, 768×1024 y 390×844. Estados vacíos, jerarquía financiera, sidebar/tablet/mobile y barra inferior fueron inspeccionados sin clipping ni overflow horizontal.
- **Accessibility:** dashboard ADMIN y STAFF con axe WCAG A/AA en 0 violations; headings, landmarks, `time`, enlaces completos, targets y foco preservados. La información financiera no existe para STAFF. Consola limpia; requests RSC cancelados al cerrar contextos corresponden a prefetch abortado, no a respuestas de aplicación fallidas.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. E2E relacionado dashboard/search ADMIN/STAFF 1/1, con proyecciones por rol y axe en ambas sesiones.
- **Gate:** GATE 3 dashboard parcial, `approved for continued autonomous execution`; se completa con agenda en FE-06.
- **Known issues:** evidencia cloud aislada no disponible; validación en production build local con PostgreSQL local y datos E2E sintéticos. Producción no fue usada.

## FRONTEND BUILD FE-06 — Agenda

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** agenda día/semana/mes, toolbar y selector de fecha navegable, eventos proporcionales con carriles de solape, continuidad multidía, bloqueo tramado, estados explícitos y formularios/detalle. Mobile usa lista temporal del día seleccionado; no comprime siete columnas. No se añadieron DnD, resize, capacidad, recordatorios ni reglas de colisión.
- **Evidence:** seis baselines en `/tmp/ferraro-redesign-evidence/fe06/baseline` y ocho capturas finales en `/tmp/ferraro-redesign-evidence/fe06/final`: las seis resoluciones obligatorias distribuidas entre ADMIN/STAFF y día/semana/mes, más formulario desktop y detalle mobile. Fixtures locales reversibles cubrieron vacío, solape, multidía, bloqueo, confirmado, realizado y cancelado; fueron eliminadas después de capturar.
- **Responsive:** día temporal proporcional en desktop, semana de siete columnas legibles con scroll/snap en tablet y día elegido como lista en mobile; mes con seis semanas completas, encabezados y `+N`, reducido al día elegido en mobile. Cero overflow del documento en 1440×900, 1280×800, 1024×768, 820×1180, 768×1024 y 390×844.
- **Accessibility:** estado por texto, icono, borde/forma y color; rango/duración en nombres accesibles; orden cronológico; teclado para view switcher y fecha nativa; axe WCAG A/AA en 0 violations. Emulación de 200% efectiva (640 CSS px, DPR 2) sin overflow y `prefers-reduced-motion: reduce` confirmado. Consola y respuestas HTTP limpias en las capturas.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Agenda E2E 2/2; gate conjunto agenda/dashboard/portal 4/4 con roles, proyecciones y aislamiento conservados.
- **Gate:** GATE 3 completo, `approved for continued autonomous execution`.
- **Known issues:** preview cloud aislada no disponible; validación local sobre production build y PostgreSQL local. La página de turno sigue siendo la fuente de verdad y no se agregó drawer opcional. Producción no fue usada.

## FRONTEND BUILD FE-07 — Clientes, vehículos y servicios

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** listas, filtros, fichas, garage, historial, presupuestos ADMIN, formularios de cliente/vehículo y catálogo ADMIN con categorías, precio base, duración y variantes. No se agregaron capacidades CRM, marcas visuales de fabricantes, transferencias ni reglas de pricing.
- **Evidence:** seis baselines en `/tmp/ferraro-redesign-evidence/fe07/baseline` y nueve capturas finales en `/tmp/ferraro-redesign-evidence/fe07/final`. Las seis resoluciones obligatorias se distribuyeron entre ADMIN/STAFF, lista/ficha/catálogo/form; evidencia adicional cubre archivado, duplicado sugerido, filtro sin resultados, servicio inactivo, a cotizar, variantes y datos largos. Fixtures locales reversibles eliminados al terminar.
- **Responsive:** filas densas pasan a bloques de lectura sin perder nombre/contacto/garage/estado; ficha reordena resumen, vehículos e historial; forms compartidos pasan a una columna. Cero overflow en 1440×900, 1280×800, 1024×768, 820×1180, 768×1024 y 390×844; consola y respuestas HTTP limpias.
- **Accessibility:** fields compartidos enlazan label/descripción/error, estados no dependen sólo de color, targets preservados y formularios mantienen controles nativos/autocomplete. Axe WCAG A/AA en 0 violations para lista STAFF y detalle de servicio ADMIN.
- **Security:** ADMIN conserva catálogo, precios, presupuestos y portal; STAFF recibe 403 server-side en Servicios y no recibe presupuestos/portal en la ficha. Queries y proyecciones existentes no cambiaron.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. E2E clientes/servicios 2/2 con alta, vehículo, búsqueda por modelo, categoría, servicio, excepción de modelo y denegación STAFF.
- **Gate:** GATE 4 primer corte modular, `approved for continued autonomous execution`; se completa con FE-08 a FE-12.
- **Known issues:** el gestor visual del link privado se rediseña en FE-12 y sólo fue preservado aquí; preview cloud aislada no disponible. Producción no fue usada.

## FRONTEND BUILD FE-08 — Trabajos, consumos y fotografías

- **Status:** COMPLETE LOCAL / CLOUD PERSISTENCE PENDING — approved for continued autonomous execution.
- **Scope:** historial, alta y detalle de trabajos; servicios snapshot, consumos/correcciones/anulación y galería privada con upload, progreso, etapa, portada, orden, publicación y eliminación. El lightbox React Aria reemplaza la apertura en pestaña y conserva foco/Escape. No cambiaron contratos, stock, procesamiento, storage ni autorización.
- **Evidence:** seis baselines de lista vacía en `/tmp/ferraro-redesign-evidence/fe08/baseline` y seis capturas finales del detalle poblado en `/tmp/ferraro-redesign-evidence/fe08/final`, para 1440×900, 1280×800, 1024×768, 820×1180, 768×1024 y 390×844. Fixtures locales reversibles cubrieron turno convertido, snapshot, corrección, 1 foto y visibilidad privada/pública; fueron eliminadas por teardown.
- **Responsive:** historial recompone filas sin perder fecha/vehículo/cliente/servicios/estado; resumen 3→2→1, galería 4→3→2→1 y queue compacta. Los seis viewports pasan chequeo programático de overflow horizontal.
- **Accessibility:** estado por texto/icono/color; controles de galería nombrados; modal con título, focus trap, Escape y retorno; progreso live y alt contextual. Axe WCAG A/AA/2.2 AA en 0 violations después de corregir el contraste heredado del disclosure.
- **Security:** thumbnail/preview continúan detrás de endpoints autorizados; acceso anónimo devuelve 401; foto privada por defecto y publicación explícita verificadas. STAFF accede a operación, no a cobros ADMIN.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. E2E jobs 2/2: turno→trabajo, consumo→corrección con movimientos compensatorios, upload local, privacidad, publicación y lightbox por teclado.
- **Gate:** GATE 4 continúa, `approved for continued autonomous execution` para la validación local.
- **Known issues:** no existe storage Preview persistente y aislado; por regla del plan, la persistencia remota de FE-08 no se declara cerrada. Producción no fue usada. El procesamiento se validó exclusivamente con filesystem local y datos sintéticos.

## FRONTEND BUILD FE-09 — Presupuestos y PDF

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** lista/filtros, editor con resumen, detalle/document sheet, acciones de lifecycle, agenda desde aceptado y PDF A4. Cálculos, precisión decimal, estados, artefacto congelado y autorización permanecen intactos.
- **Brand/PDF:** el wordmark tipográfico fue eliminado del renderer. El PDF inserta el lockup FERRARO DETAIL oficial como los mismos paths del SVG verificado, usa negro/gris/amarillo oficiales, papel blanco e Inter Variable TTF embebida (`4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf`).
- **Evidence:** seis baselines en `/tmp/ferraro-redesign-evidence/fe09/baseline`; seis capturas UI, PDF original, raster color, raster gris y extracción de texto en `/tmp/ferraro-redesign-evidence/fe09/final`. A4 de una línea inspeccionado visualmente; prueba unitaria genera además 35 líneas multipágina.
- **Responsive/accessibility:** editor 2 columnas + resumen sticky pasa a flujo único; document sheet conserva jerarquía y montos tabulares. Seis viewports sin overflow horizontal; axe WCAG A/AA/2.2 AA en 0 violations. PDF conserva texto extraíble, metadata, numeración, encabezado de tabla repetido y filas no partidas.
- **Security/lifecycle:** STAFF recibe 403 en UI y PDF; preview/final continúan `private, no-store`; emitir congela el artefacto, aceptar fija importe y convertir reutiliza el mismo caso. Ningún cobro se registra por estas acciones.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Quote E2E 2/2: crear, preview PDF válido, emitir, aceptar, agendar, reconciliar USD 800.00 y denegación STAFF.
- **Gate:** GATE 4 UI continúa y GATE 5 PDF parcial, `approved for continued autonomous execution`.
- **Known issues:** no existe preview cloud aislada; el artefacto se validó con filesystem local, sin producción.

## FRONTEND BUILD FE-10 — Finanzas

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** resumen mensual, ledger, filtros, movimientos/categorías, estado financiero por caso, importe acordado, cobros, revisiones y reversión compensatoria. Sólo cambió presentación; moneda, signos, balances y reglas permanecen intactos.
- **Hierarchy:** entradas/salidas sostienen contexto y flujo neto ocupa la superficie oscura dominante. Importe acordado, cobrado neto y saldo pendiente/a favor/indefinido conservan etiquetas diferentes; ningún total depende sólo del color.
- **Evidence:** seis baselines en `/tmp/ferraro-redesign-evidence/fe10/baseline` y seis capturas finales del caso poblado en `/tmp/ferraro-redesign-evidence/fe10/final`, cubriendo todos los viewports obligatorios. Sin overflow horizontal.
- **Accessibility/security:** montos tabulares con signo y label, timeline textual, confirmación robusta y axe WCAG A/AA/2.2 AA en 0 violations. STAFF no recibe navegación financiera y obtiene 403 server-side tanto en lista como caso.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Finance E2E 2/2: importe por definir→acordado, cobro parcial, saldo USD 750.00 y denial STAFF.
- **Gate:** GATE 4 continúa, `approved for continued autonomous execution`.
- **Known issues:** preview cloud aislada no disponible; datos sintéticos PostgreSQL local, sin producción.

## FRONTEND BUILD FE-11 — Inventario, compras y proveedores

- **Status:** COMPLETE — approved for continued autonomous execution.
- **Scope:** inventario/filtros/estados, detalle y ajustes, categorías/presentaciones, compras/lista/editor/detalle y proveedores. No cambiaron unidades, factores, ledger, cálculos ni permisos.
- **Hierarchy:** stock actual y unidad se leen juntos; mínimo y estado completan la decisión. Compra muestra snapshot, factor de conversión, cantidad base ingresada, costo/total e integridad enlazada de inventario/caja.
- **Evidence:** seis baselines en `/tmp/ferraro-redesign-evidence/fe11/baseline` y seis capturas finales de compra poblada en `/tmp/ferraro-redesign-evidence/fe11/final`, cubriendo viewports obligatorios sin overflow horizontal.
- **Accessibility/security:** disponible/bajo usan icono+texto+color, unidad acompaña cantidad y targets preservan 44 px. Axe WCAG A/AA/2.2 AA en 0 violations para detalle de compra ADMIN y detalle de inventario STAFF. Costos/ajustes no se proyectan a STAFF; Compras devuelve 403.
- **Tests:** lint, typecheck, 35 unit, 42 integración, build y `git diff --check` verdes. Inventory/purchases E2E 2/2: categoría, artículo, ajuste, presentación 1=15 m, compra 2 rollos→+30 m, egreso USD 1200 y denegaciones.
- **Gate:** GATE 4 módulos operativos/comerciales completo, `approved for continued autonomous execution`.
- **Known issues:** preview cloud aislada no disponible; validación local reversible, sin producción.
