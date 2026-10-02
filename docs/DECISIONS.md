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
