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

## DEC-003 — Inter Variable y tokens semánticos nativos

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Build afectado:** FRONTEND BUILD FE-01 — Foundations y tokens

### Contexto

La UI heredada dependía de Avenir instalada en el sistema, valores visuales globales sin semántica y una hoja de estilos monolítica. El rediseño necesita render estable entre plataformas, contraste verificable y separación estricta entre marca, interacción y estados.

### Decisión

Usar Inter Variable 5.3.0 con subset latino, archivos WOFF2 locales y `next/font/local`. La comparación directa contra IBM Plex Sans 5.3.0 en titulares, texto operativo, montos y tabla densa no mostró una mejora clara que justificara cambiar la primera opción: Inter conservó una fila un píxel más compacta, lectura neutra y cifras estables.

Centralizar color, tipografía, spacing, geometría, layout, motion y z-index en `src/design-system/tokens.css`, ordenados mediante cascade layers. Los colores oficiales permanecen inmutables; interacción y estados usan familias semánticas propias. Los aliases heredados se mantienen temporalmente sólo para evitar una migración global accidental y se eliminarán en FE-14.

### Consecuencias

- La familia queda autocontenida, con licencia OFL versionada, sin dependencia de red ni FOIT por proveedor externo.
- El wordmark continúa siendo el SVG oficial y nunca se reconstruye con Inter.
- Los nuevos componentes no pueden consumir aliases heredados ni agregar hex fuera del archivo de tokens, salvo texto documental que exhiba el valor oficial.
- PPF House puede sustituir fuente y tokens sin modificar primitives ni lógica de dominio.

## DEC-004 — React Aria Components y Phosphor como infraestructura visual

- **Fecha:** 2026-10-10
- **Estado:** aceptada
- **Build afectado:** FRONTEND BUILD FE-02 — Componentes base y design system

### Contexto

Dialog, drawer, tooltip y confirmación requieren focus trap, Escape, retorno de foco, scroll/modal semantics y comportamiento consistente con teclado/touch. Implementar esos contratos a mano ampliaría la superficie de errores. La iconografía debe ser única, tree-shakeable, legible y con variantes de peso suficientes para navegación y estado.

### Decisión

Usar React Aria Components 1.22.1 como capa headless para overlays, conservando inputs, selects, textareas, checkbox y botones simples como controles nativos. Reemplazar el `window.confirm` del componente compartido por `ConfirmDialog`, con cancelación enfocada por defecto y consecuencia explícita. La confirmación específica del portal migra junto a ese módulo en FE-12.

Adoptar Phosphor Icons 2.1.10 como única librería de iconos, con imports individuales: `dist/ssr` para Server Components y el entrypoint normal sólo dentro de boundaries cliente. La comparación con Lucide 1.54.0 mostró que ambas opciones soportan tree shaking y SSR; Phosphor ofrece pesos más útiles para distinguir navegación/estado sin mezclar estilos. El chunk cliente que contiene el set real del showcase quedó en 28.770 bytes sin comprimir, por lo que no apareció el riesgo de bundle que justificaría cambiar a Lucide.

### Consecuencias

- Los primitives no contienen copy de Ferraro, rutas de dominio ni colores de marca.
- Overlays mantienen foco, cierre por Escape/click exterior y retorno al disparador por contratos probados de React Aria.
- `@axe-core/playwright` queda disponible para gates A/AA automatizados; no reemplaza teclado, zoom ni revisión manual.
- No se instala ni mezcla una segunda librería de iconos.
