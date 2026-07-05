# Misión
Esta es una aplicación web para el control y la gestión de la asistencia de niños, y personal del Ministerio infantil. 

# Stack Tecnológico  
Frontend (React + Vite) + Backend (Node + Express + PostgreSQL).  
Ver detalle completo con versiones en [spec/constitution/tech-stack.md](spec/constitution/tech-stack.md).

# Convenciones y Buenas Prácticas
- Comenta siempre las funciones complejas.
- Divide el código en componentes pequeños.

# Memoria y Documentación
- Cada vez que finalices una tarea, guarda un resumen de lo que hiciste en la carpeta `/docs` para no perder el contexto.

# Prohibiciones (Qué NO hacer)
- Bajo ningún concepto dejes contraseñas o claves API en el código fuente.
- No modifiques la arquitectura base sin que lo aprobemos en el modo "Plan".

# Comandos de desarrollo

```bash
# Backend (cwd: backend/)
npm run dev          # tsx watch --env-file=.env src/server.ts
npm run build        # tsc
npm run start        # node dist/seed_produccion.js && node dist/server.js
npm test             # vitest run
npm run test:watch   # vitest

# Frontend (cwd: frontend/)
npm run dev          # vite (puerto 5173, abre navegador)
npm run build        # tsc && vite build
```

En producción `npm start` siempre ejecuta el seed no destructivo antes del servidor. El seed verifica si los roles existen antes de insertar — seguro de ejecutar repetidamente.

# Arquitectura

- **Monorepo, sin herramienta de workspaces.** `backend/` (ESM) y `frontend/` (CJS) son independientes — cada uno tiene su propio `package.json`, `node_modules/` y `package-lock.json`.
- **Separación App/Server** (`backend/src/app.ts` vs `server.ts`). Los tests deben importar `app` (no `server`) para evitar activar la conexión real a la BD al importar. `server.ts` llama a `verificarConexionDB()` y se pone a la escucha.
- **Sin framework de migraciones.** Todas las migraciones son archivos `.sql` crudos en `backend/` (`migracion_v4.sql`, `migracion_v5_*.sql`). Se aplican manualmente.
- **Dos archivos seed:** `scripts/seed.ts` (destructivo — trunca tablas, para desarrollo) vs `src/seed_produccion.ts` (no destructivo — verifica existencia, se ejecuta en producción).
- **Frontend:** React 19, Vite 8, Tailwind v4 (configuración basada en CSS vía `@tailwindcss/vite` — sin `tailwind.config.*`), React Router v7, SWR, sonner toasts. Todas las páginas cargadas con `lazy()` y `Suspense`.
- **Variables de entorno:** documentadas en `backend/.env.example`. Claves: `JWT_SECRET`, `BCRYPT_SALT_ROUNDS` (12), `MINUTOS_BLOQUEO_LOGIN` (15), `PUERTO` (3001), `CORS_ORIGEN`. Zona horaria: UTC-6 (Nicaragua).
- **Niveles de autorización:** 1=Colaborador, 2=Maestro, 3=Staff, 4=Coordinador General. El frontend usa `<RutaProtegida nivelMinimo={n}>` para proteger rutas.
- **Guardia de conexión a BD** en `config/db.ts` omite la verificación de variables críticas cuando `NODE_ENV === 'test'`.

## Testing

- **Vitest + supertest** (solo backend; frontend no tiene tests).
- **Los tests necesitan una base de datos PostgreSQL real.** Sin Docker/testcontainers. Se configura vía `.env` o `.env.test`. No hay `.env.test` commiteado.
- Ejecutar tests aislados: `npm test -- --run tests/__pruebas__/integracion/flujosMvp/mvp01.test.ts`
- Tests existentes en `tests/__pruebas__/integracion/flujosMvp/`.

# Estilo de Commits y PRs
- Analiza siempre mis cambios antes de sugerir un commit.
- Utiliza el estándar Conventional Commits (ej. feat:, fix:, docs:).
- Prepárame el comando exacto de git commit, pero NO lo ejecutes ni hagas push. Yo revisaré el código y haré el push manualmente.