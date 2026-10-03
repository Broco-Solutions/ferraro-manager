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
