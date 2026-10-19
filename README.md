# Ferraro Manager

Sistema interno de gestión para Ferraro Detail, Rosario. El contrato funcional y técnico es [`docs/FERRARO_MASTER_PLAN.md`](./docs/FERRARO_MASTER_PLAN.md); las decisiones posteriores se registran en [`docs/DECISIONS.md`](./docs/DECISIONS.md).

## Requisitos

- Node.js 24 LTS
- pnpm 11.9.0
- PostgreSQL 17 o un PostgreSQL administrado compatible

No se usa `prisma db push`: todo cambio de esquema debe producir una migración versionada.

## Inicio local

1. Copiar `.env.example` a `.env` y completar valores locales. Nunca reutilizar secretos entre ambientes.
2. Instalar dependencias con `pnpm install`.
3. Levantar un PostgreSQL local. Sin Docker puede usarse `pnpm db:dev --name ferraro-manager`; copiar sus URLs principal y shadow a `DATABASE_URL` y `SHADOW_DATABASE_URL`.
4. Generar el cliente con `pnpm db:generate`.
5. Aplicar migraciones con `pnpm db:migrate:deploy`.
6. Definir las variables `BOOTSTRAP_ADMIN_*` y ejecutar `pnpm admin:bootstrap` para crear o rotar de forma idempotente el ADMIN inicial.
7. Iniciar con `pnpm dev` y abrir `http://localhost:3000`.

El signup público está cerrado. Las cuentas internas se provisionan de forma controlada con el bootstrap idempotente; nunca desde un formulario público.

Para fotos, `STORAGE_DRIVER=local` guarda objetos privados en `.data/private` únicamente durante desarrollo y tests. Preview y producción deben usar `STORAGE_DRIVER=s3`, un bucket privado S3-compatible y CORS limitado al origen de la aplicación para cargas `POST`; ninguna URL del bucket se expone como lectura pública.

Los PDF definitivos de presupuestos usan el mismo storage privado. En Vercel se rechaza `STORAGE_DRIVER=local`; S3 requiere bucket, access key y secret key. Los cambios de variables se aplican al crear un nuevo deployment. Si falla la emisión, el detalle muestra un error recuperable dentro del presupuesto y permite reintentar.

## Calidad

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm format:check
pnpm domain:reconcile
git diff --check
```

Los E2E requieren Chromium (`pnpm exec playwright install chromium`) y una base migrada. Los fixtures de prueba son identificables, se crean antes de la suite y se eliminan al finalizar.

## Ambientes

Desarrollo, preview y producción deben usar bases y secretos separados. Producción aplica migraciones con `pnpm db:migrate:deploy`; nunca con `db push`. `America/Argentina/Buenos_Aires` es la zona IANA del negocio. USD es la moneda canónica; finanzas, presupuestos y compras admiten carga en USD o ARS con cotización manual ARS por USD y conservan el origen.

El runbook de health, cleanup, backup, restore, migración y rollback está en [`docs/OPERATIONS.md`](./docs/OPERATIONS.md). La aplicación no reemplaza los backups administrados del proveedor.

## Flujo cliente y vehículo

Nuevo turno y nuevo presupuesto comparten un selector buscable de cliente y vehículo. La búsqueda de clientes es server-side y acotada; incluye clientes activos aunque todavía no tengan vehículos. Sin abandonar ni vaciar el formulario se puede crear un cliente con uno o varios vehículos, o agregar un vehículo a un cliente existente. Teléfono normalizado y email bloquean duplicados fuertes; un nombre parecido sólo genera una sugerencia.

«Nuevo cliente + vehículo» abre un alta rápida con nombre, teléfono opcional y marca/modelo. Los formularios de vehículo sólo muestran marca y modelo; los atributos históricos se conservan al editar. Después de agendar se abre el detalle del turno con la confirmación de éxito. La edición se realiza desde «Editar turno» en una ruta separada.

En un turno existente la identidad sólo puede reasignarse cuando su `ServiceCase` nació de un turno directo y todavía no tiene presupuesto aceptado, jobs, movimientos financieros, montos/costos/revisiones ni otras visitas. Una vez que existe historia comercial, la UI mantiene cliente y vehículo fijos para preservarla.

## Ferraro Manager V1

La branch de integración contiene los módulos V1 definidos por el Master Plan: clientes/vehículos, catálogo, agenda, trabajos, presupuestos/PDF, finanzas, inventario, compras, consumos, fotos, portal privado, dashboard y búsqueda. El estado verificable de cada gate está en [`docs/EXECUTION_LOG.md`](./docs/EXECUTION_LOG.md). PPF HOUSE y multi-tenancy permanecen fuera de alcance.
