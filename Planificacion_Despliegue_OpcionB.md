# Planificación de Despliegue — Opción B: Split Deployment
**Sistema de Gestión Infantil — Hosanna Infantil**
**Fecha:** 2026-06-20 | **Versión:** 1.0

> **Estrategia:** El proyecto se despliega en tres servicios independientes en la nube.
> No se requiere refactorización del código existente. Cada servicio mantiene su rol actual.

---

## Tabla de Contenidos

1. [Arquitectura de Despliegue](#1-arquitectura-de-despliegue)
2. [Servicios y Plataformas](#2-servicios-y-plataformas)
3. [Base de Datos — Neon PostgreSQL](#3-base-de-datos--neon-postgresql)
4. [Backend — Railway](#4-backend--railway)
5. [Frontend — Vercel](#5-frontend--vercel)
6. [Variables de Entorno](#6-variables-de-entorno)
7. [Configuración CORS](#7-configuración-cors)
8. [Orden de Ejecución del Despliegue](#8-orden-de-ejecución-del-despliegue)
9. [Checklist de Verificación Post-Despliegue](#9-checklist-de-verificación-post-despliegue)
10. [Costos Estimados (Tier Gratuito)](#10-costos-estimados-tier-gratuito)

---

## 1. Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                            │
│           React + Vite + TailwindCSS                           │
│         URL: https://hosanna-infantil.vercel.app               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RAILWAY (Backend)                             │
│               Express.js + Node.js                             │
│      URL: https://hosanna-infantil-api.up.railway.app          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ PostgreSQL (connection string)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                NEON (Base de Datos)                             │
│                  PostgreSQL 16                                  │
│        URL: ep-xxx.us-east-1.aws.neon.tech                     │
└─────────────────────────────────────────────────────────────────┘
```

> **Principio clave:** Cada capa solo conoce a la capa inmediatamente inferior.
> El frontend nunca accede directamente a la base de datos.

---

## 2. Servicios y Plataformas

| Capa | Plataforma | Plan | Motivo de Selección |
|------|-----------|------|---------------------|
| **Frontend** | [Vercel](https://vercel.com) | Hobby (gratuito) | CDN global, build automático desde Git, soporte Vite nativo |
| **Backend** | [Railway](https://railway.app) | Starter (gratuito con límites) | Soporte Express sin modificaciones, variables de entorno simples, deploy desde Git |
| **Base de Datos** | [Neon](https://neon.tech) | Free Tier (gratuito) | PostgreSQL 16 gestionado, compatible con `pg`, SSL incluido, branching de BD |

> **Alternativa al backend:** [Render](https://render.com) — mismas capacidades, también gratuito.
> La diferencia principal es que Railway tiene deploy más rápido y mejor DX.

---

## 3. Base de Datos — Neon PostgreSQL

### 3.1 Crear el proyecto en Neon

1. Ir a [console.neon.tech](https://console.neon.tech) → **New Project**
2. Nombre: `hosanna-infantil`
3. Región: la más cercana disponible (ej. `US East`)
4. PostgreSQL version: **16**
5. Copiar la **Connection String** con este formato:
   ```
   postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3.2 Ejecutar las migraciones

Conectarse a Neon con `psql` o el cliente SQL integrado en la consola de Neon
y ejecutar los scripts en este orden estricto:

```
1. migracion_v5_1.sql    ← Esquema base completo
2. migracion_v5_2.sql
3. migracion_v5_3.sql
4. migracion_v5_4.sql
5. migracion_v5_5.sql
6. migracion_v5_6.sql
7. migracion_v5_7.sql
8. migracion_v5_8.sql
9. migracion_v5_9.sql
```

> Los scripts se encuentran en la carpeta `backend/` del repositorio.

### 3.3 Variables resultantes de Neon

| Variable | Valor (ejemplo) |
|----------|----------------|
| `PGHOST` | `ep-cold-lake-123456.us-east-1.aws.neon.tech` |
| `PGPORT` | `5432` |
| `PGDATABASE` | `neondb` |
| `PGUSER` | `hosanna_user` |
| `PGPASSWORD` | `<generado por Neon>` |

---

## 4. Backend — Railway

### 4.1 Crear el proyecto en Railway

1. Ir a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Seleccionar el repositorio del proyecto
3. Railway detectará automáticamente Node.js

### 4.2 Configurar el directorio raíz

Railway debe apuntar al subdirectorio `backend/`, no a la raíz del monorepo.

En el dashboard de Railway:
- **Settings → Source → Root Directory:** `backend`

### 4.3 Comandos de build y start

Estos comandos ya existen en `backend/package.json` y Railway los leerá automáticamente:

| Opción | Valor |
|--------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js"
}
```

> El build de TypeScript (`tsc`) genera `backend/dist/`. Railway ejecuta el build
> antes del primer deploy automáticamente.

### 4.4 Variables de entorno en Railway

En **Variables** del proyecto Railway, agregar:

```env
# Base de datos (valores obtenidos de Neon)
PGHOST=ep-cold-lake-123456.us-east-1.aws.neon.tech
PGPORT=5432
PGDATABASE=neondb
PGUSER=hosanna_user
PGPASSWORD=<password de Neon>

# Seguridad
JWT_SECRET=<secreto aleatorio mínimo 64 caracteres>
JWT_EXPIRA_EN=8h
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
MINUTOS_BLOQUEO_LOGIN=15

# Servidor
PUERTO=3001
NODE_ENV=production

# CORS — dominio del frontend en Vercel (configurar tras obtener la URL de Vercel)
CORS_ORIGEN=https://hosanna-infantil.vercel.app
```

> ⚠️ `CORS_ORIGEN` se configura **después** de conocer la URL de Vercel (Paso 5).

### 4.5 SSL con Neon

Neon requiere SSL obligatoriamente. Verificar que `backend/src/config/db.ts`
incluya la opción SSL para producción:

```typescript
// Agregar en la configuración del pool de pg
ssl: process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : false
```

### 4.6 URL resultante del backend

Tras el deploy, Railway asigna una URL pública:
```
https://hosanna-infantil-api.up.railway.app
```

Esta URL se usa como `VITE_API_URL` en Vercel.

---

## 5. Frontend — Vercel

### 5.1 Crear el proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
2. Seleccionar el repositorio
3. Vercel detecta Vite automáticamente

### 5.2 Configurar el directorio raíz

| Opción | Valor |
|--------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` (autodetectado) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 5.3 Variables de entorno en Vercel

En **Settings → Environment Variables**:

```env
VITE_API_URL=https://hosanna-infantil-api.up.railway.app
```

> **Convención de Vite:** Solo las variables prefijadas con `VITE_` son
> expuestas al cliente. El resto son ignoradas durante el build.

### 5.4 Uso de la variable en el frontend

La URL base del API debe consumirse desde una constante central en el frontend:

```typescript
// src/config/api.ts (crear si no existe)
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
```

> Si actualmente la URL `http://localhost:3001` está hardcodeada en múltiples archivos,
> se debe centralizar en este archivo antes del primer deploy.

### 5.5 URL resultante del frontend

Vercel asigna automáticamente:
```
https://hosanna-infantil.vercel.app
```

Este dominio es el que va en `CORS_ORIGEN` de Railway.

---

## 6. Variables de Entorno

Resumen completo por servicio:

### Backend (Railway)

| Variable | Descripción | Fuente |
|----------|-------------|--------|
| `PGHOST` | Host de Neon | Dashboard Neon |
| `PGPORT` | Puerto PostgreSQL | `5432` (fijo) |
| `PGDATABASE` | Nombre de la BD | Dashboard Neon |
| `PGUSER` | Usuario de BD | Dashboard Neon |
| `PGPASSWORD` | Contraseña de BD | Dashboard Neon |
| `JWT_SECRET` | Clave de firma JWT | `openssl rand -hex 64` |
| `JWT_EXPIRA_EN` | Duración del token | `8h` |
| `BCRYPT_SALT_ROUNDS` | Rondas de hash | `12` |
| `MINUTOS_BLOQUEO_LOGIN` | Bloqueo tras intentos fallidos | `15` |
| `PUERTO` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `CORS_ORIGEN` | Dominio del frontend permitido | URL de Vercel |

### Frontend (Vercel)

| Variable | Descripción | Fuente |
|----------|-------------|--------|
| `VITE_API_URL` | URL base del backend | URL de Railway |

---

## 7. Configuración CORS

El CORS en `backend/src/app.ts` actualmente solo acepta `localhost`.
Para producción se debe actualizar para aceptar también el dominio de Vercel.

### Cambio requerido en `backend/src/app.ts`

```typescript
// ANTES — solo acepta localhost
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// DESPUÉS — acepta localhost + dominio de producción desde variable de entorno
const origenPermitido = process.env.CORS_ORIGEN;

app.use(cors({
  origin: function (origin, callback) {
    const esLocalhost = !origin
      || origin.startsWith('http://localhost:')
      || origin.startsWith('http://127.0.0.1:');
    const esProduccion = !!origenPermitido && origin === origenPermitido;

    if (esLocalhost || esProduccion) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
```

> Este es el **único cambio de código** requerido en el backend para el despliegue
> con la Opción B. Todo lo demás se configura mediante variables de entorno.

---

## 8. Orden de Ejecución del Despliegue

El despliegue debe hacerse en este orden estricto, ya que cada paso genera
valores que el siguiente necesita:

```
┌─────────────────────────────────────────────────────────────┐
│  Paso 1 — Neon                                              │
│  ├─ Crear proyecto en console.neon.tech                     │
│  ├─ Ejecutar scripts de migración SQL (v5_1 → v5_9)         │
│  └─ Obtener: PGHOST, PGDATABASE, PGUSER, PGPASSWORD         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Paso 2 — Código                                            │
│  ├─ Modificar CORS en backend/src/app.ts (ver §7)           │
│  ├─ Centralizar API_BASE_URL en frontend/src/config/api.ts  │
│  ├─ Verificar SSL en backend/src/config/db.ts               │
│  └─ Commit y push al repositorio                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Paso 3 — Railway                                           │
│  ├─ Crear proyecto desde el repositorio                     │
│  ├─ Root Directory: backend                                 │
│  ├─ Configurar todas las variables de entorno del backend   │
│  │  (CORS_ORIGEN se puede dejar vacío por ahora)            │
│  └─ Obtener: URL del backend (*.up.railway.app)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Paso 4 — Vercel                                            │
│  ├─ Crear proyecto desde el repositorio                     │
│  ├─ Root Directory: frontend                                │
│  ├─ Configurar: VITE_API_URL = URL de Railway               │
│  └─ Obtener: URL del frontend (*.vercel.app)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Paso 5 — Actualizar CORS en Railway                        │
│  ├─ Variable: CORS_ORIGEN = URL de Vercel                   │
│  └─ Railway redespliega automáticamente                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Paso 6 — Verificación final (ver §9)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Checklist de Verificación Post-Despliegue

### Base de Datos (Neon)
- [ ] La consola de Neon muestra el proyecto activo
- [ ] Los scripts de migración se ejecutaron sin errores
- [ ] Las tablas principales existen: `Personas`, `Ninos`, `Personal_Sistema`, `Grupos`, `Turnos`

### Backend (Railway)
- [ ] `GET https://<url-railway>/api/salud` retorna `{ "exito": true }`
- [ ] El log de Railway no muestra errores de conexión a la BD
- [ ] `POST /api/auth/login` con credenciales válidas retorna un JWT
- [ ] Los headers de respuesta incluyen `Access-Control-Allow-Origin` con la URL de Vercel

### Frontend (Vercel)
- [ ] La URL de Vercel carga la aplicación sin errores en la consola del navegador
- [ ] El login funciona y autentica contra el backend en Railway
- [ ] Una operación de lectura (ej. lista de niños) devuelve datos reales de Neon
- [ ] Una operación de escritura (ej. registrar asistencia) persiste correctamente

### Seguridad
- [ ] `CORS_ORIGEN` tiene el dominio exacto de Vercel (sin `/` al final)
- [ ] `JWT_SECRET` tiene mínimo 64 caracteres aleatorios
- [ ] `NODE_ENV=production` está configurado en Railway
- [ ] Ninguna variable sensible está hardcodeada en el código fuente

---

## 10. Costos Estimados (Tier Gratuito)

| Servicio | Plan | Límites relevantes |
|----------|------|--------------------|
| **Neon** | Free Forever | 0.5 GB almacenamiento, 1 proyecto, auto-suspend tras inactividad |
| **Railway** | Starter | $5 USD de crédito/mes ≈ 500 horas de ejecución |
| **Vercel** | Hobby | 100 GB bandwidth/mes, builds ilimitados |

| Escenario de uso | Costo mensual estimado |
|-----------------|----------------------|
| Solo domingos (uso intermitente) | **$0** — tiers gratuitos suficientes |
| Uso diario moderado | **~$5–10 USD** (upgrade Railway Developer) |
| Alta escala (>500 usuarios simultáneos) | Reevaluar arquitectura |

> Para un sistema de uso principalmente dominical, los tres tiers gratuitos
> son suficientes durante toda la fase inicial sin costo alguno.

---

*Documento de despliegue generado para el Sistema de Gestión Infantil — Hosanna Infantil.*
*Estrategia: Split Deployment — Vercel (Frontend) + Railway (Backend) + Neon (PostgreSQL).*
*Fecha de emisión: 2026-06-20.*
