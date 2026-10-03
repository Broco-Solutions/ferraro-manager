# Ferraro Manager — Decision Log

Este archivo registra únicamente desviaciones o decisiones estructurales posteriores al Master Plan. No reemplaza a [`FERRARO_MASTER_PLAN.md`](./FERRARO_MASTER_PLAN.md); lo complementa y debe leerse junto con él.

## DEC-001 — Better Auth para credenciales y sesiones persistidas

- **Fecha:** 2026-10-02
- **Estado:** aceptada
- **Build afectado:** BUILD 0 — Foundation

### Contexto

El Master Plan exige usuarios provisionados, signup público cerrado, contraseña Argon2id y sesiones opacas almacenadas en PostgreSQL. La opción inicialmente indicada, Auth.js con Credentials, no persiste usuarios de credenciales y limita ese proveedor a sesiones JWT. Esto contradice el requisito de sesión de base.

### Decisión

Usar Better Auth con adaptador Prisma/PostgreSQL, email y contraseña, signup deshabilitado, hashing Argon2id configurable y sesiones persistidas en base. Los únicos roles de producto siguen siendo `ADMIN` y `STAFF`; toda autorización continúa validándose en servidor.

### Alternativas consideradas

- **Auth.js Credentials + JWT:** descartada porque incumple la fuente de verdad de sesiones persistidas.
- **Auth propia completa:** descartada por aumentar superficie de seguridad y mantenimiento.
- **Proveedor administrado:** válido, pero innecesario para dos roles internos y agrega dependencia operativa/costo.

### Consecuencias

- Se agregan las tablas técnicas requeridas por Better Auth (`Session`, `Account`, `Verification` y `RateLimit`).
- El bootstrap de usuarios continúa siendo interno, idempotente y sin signup público.
- No cambia el modelo de dominio, los permisos, el alcance ni la experiencia definida por el Master Plan.
- Un cambio futuro de proveedor deberá preservar estos contratos y registrarse aquí.

## DEC-002 — Storage privado S3-compatible con procesamiento server-side

- **Fecha:** 2026-10-03
- **Estado:** aceptada
- **Build afectado:** BUILD 10 — Photos

### Contexto

Las fotos de trabajos contienen información privada y deben admitir carga directa, variantes livianas y una futura publicación selectiva en el portal. Guardarlas en PostgreSQL o hacer público el bucket rompería el contrato de privacidad y complicaría el escalado.

### Decisión

Usar un adapter de storage privado: filesystem sólo en desarrollo/test y S3-compatible en preview/producción. El navegador recibe una URL de carga corta ligada a un intent de un solo uso; el servidor valida firma real, tamaño y MIME con Sharp, aplica orientación y genera preview/thumbnail sin metadata EXIF. Los objetos nunca son públicos: backoffice y portal los sirven mediante endpoints autorizados específicos.

### Alternativas consideradas

- **Vercel Blob público:** descartado porque no ofrece el aislamiento privado requerido como default.
- **Uploads pasando siempre por Next.js:** válido para local, pero descartado en producción por límites de payload, memoria y duración.
- **Blobs en PostgreSQL:** descartado por costo de backups, rendimiento y acoplamiento.

### Consecuencias

- Se agregan AWS SDK S3/Presigned Post y Sharp como dependencias estructurales. La política del POST prefirmado exige el MIME y tamaño declarados antes de aceptar el objeto; la firma real vuelve a validarse al confirmar.
- Producción requiere bucket privado, credenciales limitadas y CORS para `POST` desde el origen permitido.
- Los borrados de usuario son lógicos para conservar trazabilidad. El mantenimiento sólo purga uploads nunca confirmados después de 24 horas; una futura purga de fotos borradas requerirá una política de retención explícita.
- El proveedor puede cambiar sin modificar el dominio mientras conserve el contrato S3-compatible.
