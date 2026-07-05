# Tech Stack — Sistema de Gestión del Ministerio Infantil

## Backend

| Categoría | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | 22 |
| Lenguaje | TypeScript | 6 |
| Web framework | Express | 5 |
| Validador de esquemas | zod | 4.0.1 |
| Autenticación | bcryptjs | 2.4.3 |
| Autenticación | jsonwebtoken | 9.0.2 |
| Seguridad HTTP | helmet | 8.0.0 |
| CORS | cors | 2.8.5 |
| Rate limiting | express-rate-limit | 7.5.0 |
| Variables de entorno | dotenv | 16.4.7 |
| Motor de BD | PostgreSQL (cliente `pg`) | 8.13.3 |
| Dev server | tsx (watch mode) | — |
| Testing | vitest | 3.1.3 |
| Testing HTTP | supertest | 7.1.0 |

### Estandares

- ESM modules (`"type": "module"`).
- Separación App/Server (`app.ts` exporta la instancia Express; `server.ts` la importa, conecta BD y escucha).
- Sin framework de migraciones. Migraciones como archivos `.sql` crudos aplicados manualmente.
- Dos seeds: `scripts/seed.ts` (destructivo, desarrollo) y `src/seed_produccion.ts` (no destructivo, producción).

---

## Frontend

| Categoría | Tecnología | Versión |
|---|---|---|
| Lenguaje | TypeScript | — |
| UI | React | 19 |
| Build tool | Vite | 8 |
| CSS framework | Tailwind CSS | 4 |
| Plugin Tailwind | @tailwindcss/vite | — |
| Routing | React Router | 7 |
| Data fetching | SWR | — |
| Toasts | Sonner | 2.0.7 |

### Estándares

- Sin `tailwind.config.*` — configuración vía CSS con `@tailwindcss/vite`.
- Todas las páginas cargadas con `React.lazy()` y `Suspense`.
- Rutas protegidas con componente `<RutaProtegida nivelMinimo={n}>`.

---

## Infraestructura y Entorno

| Concepto | Especificación |
|---|---|
| Zona horaria | UTC-6 (Nicaragua) |
| Monorepo | Sin herramienta de workspaces. `backend/` y `frontend/` independientes (cada uno con su `package.json`, `node_modules/`, `package-lock.json`). |
| Variables de entorno | Documentadas en `backend/.env.example`. |

### Variables de Entorno Críticas

| Variable | Propósito |
|---|---|
| `JWT_SECRET` | Firma de tokens JWT |
| `BCRYPT_SALT_ROUNDS` | Salt rounds para bcrypt (12) |
| `MINUTOS_BLOQUEO_LOGIN` | Tiempo de bloqueo tras intentos fallidos (15) |
| `PUERTO` | Puerto del servidor (3001) |
| `CORS_ORIGEN` | Origen permitido para CORS |

### Testing

- Solo backend cubierto con tests (vitest + supertest).
- Requiere una base de datos PostgreSQL real (sin Docker/testcontainers).
- Configuración vía `.env` o `.env.test`.
- Tests existentes en `tests/__pruebas__/integracion/flujosMvp/`.

---

## Autorización

| Nivel | Título |
|---|---|
| 1 | Colaborador |
| 2 | Maestro |
| 3 | Staff |
| 4 | Coordinador General |
