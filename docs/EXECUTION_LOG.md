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
