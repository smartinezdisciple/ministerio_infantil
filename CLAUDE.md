# CLAUDE.md — Cerebro del Proyecto: Escuela Dominical

> **Este archivo es el manual de instrucciones central del proyecto.**
> Todas las reglas aquí definidas son de cumplimiento **obligatorio** en cada línea de código, cada commit y cada revisión.
>
> **Versión del proyecto:** v2.1 (Análisis de Brecha aplicado)
> **Especificación de referencia:** `especificacion_escuela_dominical.md` (v2.0) + `especificacion_actualizada.md` (v2.1 — fuente de verdad para trabajo pendiente)

---

## 1. Comandos de Entorno

- **Siempre** cargar las variables del archivo `.env` antes de ejecutar, compilar o probar cualquier código.
- Usar la librería `dotenv` en el punto de entrada del backend:
  ```typescript
  import 'dotenv/config';
  ```
- Verificar que las variables críticas (`PGHOST`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`) estén definidas antes de iniciar el servidor. Si alguna falta, el proceso debe abortar con un mensaje claro.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Node.js con TypeScript estricto (`strict: true` en `tsconfig.json`) |
| **Frontend** | React 18 + TypeScript + **Vite** (SPA, code splitting por ruta con `lazy`) |
| **Estilos** | **CSS Variables propias** (`index.css` — sistema de tokens, NO Tailwind) |
| **Base de Datos** | PostgreSQL 14+ |
| **ORM / Query Builder** | Consultas parametrizadas directas con `pg` (node-postgres) |
| **Autenticación** | JWT (jsonwebtoken) + bcrypt |
| **Validación** | Zod |
| **Seguridad HTTP** | Helmet + CORS |
| **Reportes Excel** | `exceljs` (pendiente instalar en backend) |

---

## 3. Guías de Estilo y Nomenclatura

### 3.1 Módulos y Asincronía

- Usar **siempre** módulos ES (`import` / `export`). Nunca `require()`.
- Usar **siempre** `async` / `await` con bloques `try` / `catch` explícitos. Nunca `.then().catch()` encadenados.

### 3.2 Sub-Arquitectura del Proyecto (Obligatoria)

#### Frontend (React + Vite + TypeScript + CSS Variables)

> Todo el código del frontend debe vivir dentro de `/frontend/src/`.

```
frontend/src/
├── components/     → Componentes reutilizables (botones, modales, inputs, alertas)
├── contexts/       → Context API (ContextoAuth.tsx — estado global de auth)
├── pages/          → Vistas completas (Login, Tablero, Asistencia)
└── services/       → Llamadas a la API (servicioApi.ts), tipos TS, esquemas Zod
```

> **⚠️ Importante:** El frontend usa **CSS Variables** definidas en `index.css`, NO Tailwind.
> Los tokens de diseño están documentados en §8.1 de este archivo y se aplican como `var(--color-primary)` etc.
> No se puede usar clases Tailwind — solo clases CSS propias definidas en `index.css`.

- **`/components`**: Solo componentes visuales reutilizables. Cada componente es un archivo `PascalCase.tsx`.
- **`/pages`**: Una página = una vista completa del sistema. Cada página compone múltiples componentes.
- **`/services`**: Lógica no visual: llamadas HTTP (`fetch`), esquemas de validación (`Zod`), interfaces TypeScript y funciones auxiliares.

#### Backend (Node.js + TypeScript)

> Todo el código del backend debe vivir dentro de `/backend/src/`.

```
backend/src/
├── routes/         → Definición de endpoints (Express Router)
├── controllers/    → Lógica de petición/respuesta HTTP
├── middlewares/    → Validaciones de seguridad, rate limiting, autenticación JWT
├── services/       → Lógica de negocio pura
├── repositories/   → Consultas SQL parametrizadas
└── utils/          → Helpers y funciones reutilizables
backend/tests/      → Pruebas unitarias e integración (TDD)
```

- **`/routes`**: Solo define rutas y asocia controladores. Sin lógica de negocio.
- **`/controllers`**: Recibe la petición, llama al servicio, retorna la respuesta. Sin SQL directo.
- **`/middlewares`**: Rate limiting (§4.2), validación Zod (§4.4), verificación JWT.
- **`/services`**: Lógica de negocio pura. Llama a repositorios.
- **`/repositories`**: Solo consultas SQL parametrizadas (§4.1). Sin lógica de negocio.
- **`/tests`**: Carpeta separada para pruebas TDD (§8).

### 3.3 Convenciones de Nomenclatura

| Contexto | Convención | Ejemplo |
|---|---|---|
| PostgreSQL (tablas, columnas) | `snake_case` | `Fecha_Nacimiento`, `ID_Persona` |
| Variables y funciones (Node.js/TS) | `camelCase` | `obtenerNinoPorId`, `fechaNacimiento` |
| Componentes React | `PascalCase` | `TarjetaAsistencia`, `ModalCheckIn` |
| Archivos de componentes React | `PascalCase.tsx` | `TarjetaAsistencia.tsx` |
| Archivos de servicios/repositorios | `camelCase.ts` | `asistenciaNinosServicio.ts` |
| Constantes globales | `UPPER_SNAKE_CASE` | `MAX_INTENTOS_LOGIN` |

---

## 4. Seguridad y Validaciones

### 4.1 Inyección SQL — Tolerancia Cero

- Usar **siempre** consultas parametrizadas con placeholders (`$1`, `$2`, etc.).
- **NUNCA** concatenar strings para construir consultas SQL.
- Ejemplo correcto:
  ```typescript
  const resultado = await pool.query(
    'SELECT * FROM Personas WHERE ID_Persona = $1',
    [idPersona]
  );
  ```

### 4.2 Rate Limiting Estricto

- **Exactamente 3 intentos** permitidos en el endpoint de login.
- Al superar el límite, **bloquear la IP temporalmente** (por defecto 15 minutos, configurable en `.env`).
- Aplicar rate limiting también a rutas críticas: registro de personal, check-in/check-out.

### 4.3 Contraseñas

- Aplicar **siempre** hash con `bcrypt` (salt rounds ≥ 12) antes de almacenar.
- Nunca almacenar contraseñas en texto plano, ni siquiera en logs o mensajes de error.

### 4.4 Validación y Sanitización de Inputs

- Validar **todos** los inputs de entrada usando esquemas de Zod en la capa de middleware.
- Configurar `Helmet` para cabeceras de seguridad HTTP.
- Configurar `CORS` con orígenes explícitos (nunca `*` en producción).

### 4.5 Complejidad de Contraseñas — Regla Innegociable

> **🚨 Obligatorio en frontend Y backend. Sin excepciones.**

Toda contraseña nueva o ingresada debe cumplir **todos** estos requisitos simultáneamente:

| Requisito | Regex de validación | Ejemplo válido |
|---|---|---|
| Mínimo **8 caracteres** | `.{8,}` | `MiClave1!` ✓ / `Abc1!` ✗ |
| Al menos **1 letra mayúscula** | `[A-Z]` | `miClave1!` ✓ / `miclave1!` ✗ |
| Al menos **1 número** | `[0-9]` | `MiClave1!` ✓ / `MiClave!!` ✗ |
| Al menos **1 carácter especial** | `[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]` | `MiClave1!` ✓ / `MiClave12` ✗ |

- La validación debe ejecutarse en **ambas capas**: frontend (feedback visual inmediato) y backend (última línea de defensa).
- Los mensajes de error deben indicar **específicamente** qué requisito falta, no un mensaje genérico.

---

## 5. Idioma

- **Todo** el código fuente debe estar en **español**:
  - Nombres de variables, funciones, clases y componentes.
  - Comentarios que expliquen la lógica de negocio.
  - Mensajes de error y respuestas de la API.
- Excepción: palabras reservadas del lenguaje y nombres de librerías externas se mantienen en inglés (`import`, `async`, `try`, `catch`, `Router`, etc.).

---

## 6. Módulos del Sistema

> El detalle completo de los módulos, reglas de negocio, modelos de datos, flujos de estado y consideraciones de seguridad se encuentra en el archivo **`especificacion_escuela_dominical.md`** (v2.0).
>
> El análisis de brecha, estado de implementación y plan de trabajo pendiente se encuentran en **`especificacion_actualizada.md`** (v2.1).

### 6.1 Estado de Rutas Backend (Referencia Rápida)

| Prefijo Registrado | Archivo | Estado |
|---|---|---|
| `/api/auth` | `authRutas.ts` | ✅ Implementado |
| `/api/ninos` | `ninosRutas.ts` | ✅ Implementado |
| `/api/dashboard` | `dashboardRutas.ts` | ⚠️ Solo `GET /` — faltan 8 sub-rutas |
| `/api/asistencia` | `asistenciaRutas.ts` | ⚠️ Falta `ID_Turno` en check-in |
| `/api/grupos` | `gruposRutas.ts` | ⚠️ Falta filtro por turno |
| `/api/personal` | `personalRutas.ts` | ⚠️ Falta perfil completo y PUT |
| `/api/contactos` | `contactosRutas.ts` | ⚠️ Solo GET global |
| `/api/fichas` | `fichasRutas.ts` | ✅ Implementado |
| `/api/requisitos` | **NO EXISTE** | 🔴 Crear |
| `/api/roles` | **NO EXISTE** | 🔴 Crear |
| `/api/solicitudes` | **NO EXISTE** | 🔴 Crear |
| `/api/turnos` | **NO EXISTE** | 🔴 Crear |
| `/api/eventos` | **NO EXISTE** | 🔴 Crear |
| `/api/redes` | **NO EXISTE** | 🔴 Crear |
| `/api/reportes` | **NO EXISTE** | 🔴 Crear |

### 6.2 Pool de Base de Datos — Regla Obligatoria

- **SIEMPRE** importar el pool centralizado desde `../config/db.js`.
- **NUNCA** crear un `new Pool({...})` local en un controlador.
- Ejemplo correcto:
  ```typescript
  import pool from '../config/db.js';
  ```

---

## 7. Reglas de Git y Commits

- Mensajes de commit en español, formato: `tipo(alcance): descripción`
  - Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
  - Ejemplo: `feat(asistencia): agregar modal rápido de check-in`
- No hacer commit de `.env` ni de `node_modules/`.

---

## 8. Guía de Diseño UI

> **Esta sección es la fuente de verdad visual del sistema.**
> Todo componente React debe usar exclusivamente los tokens aquí definidos. No se permite inventar colores, bordes o tipografías ad-hoc.

### 8.1 Paleta de Colores (Tokens CSS — `index.css` `@theme`)

La paleta se basa en **Material Design 3** adaptada. Los módulos internos (post-login) usan la paleta unificada Stitch:

| Token | Hex | Uso principal |
|---|---|---|
| `primary` | `#2a7de1` | Botones principales, links activos, sidebar active, CTA |
| `primary-container` | `#2a7de1` | Fondos de botones primarios con contraste blanco |
| `on-primary` | `#ffffff` | Texto sobre primary |
| `secondary` | `#8f4e00` | Badges de pendientes, estados "Tarde" |
| `secondary-container` | `#fc9d41` | Fondo de badges de advertencia |
| `tertiary` | `#006a35` | Estados exitosos (Temprano, Completado), iconos check-in |
| `tertiary-container` | `#008645` | Fondo de iconos de éxito |
| `error` | `#ba1a1a` | Alertas críticas, severidad Alta, errores |
| `error-container` | `#ffdad6` | Fondo de alertas de error |
| `background` | `#f8f9ff` | Fondo general de la aplicación |
| `surface` | `#f8f9ff` | Fondo base de contenido |
| `surface-container-lowest` | `#ffffff` | Tarjetas, sidebar, modales |
| `surface-container-low` | `#eff4ff` | Fondos de filtros, inputs, thead |
| `surface-container` | `#e5eeff` | Fondos secundarios |
| `surface-container-high` | `#dce9ff` | Hover de filas, botones secundarios |
| `on-surface` | `#0b1c30` | Texto principal (oscuro) |
| `on-surface-variant` | `#414753` | Texto secundario, labels, metadata |
| `outline` | `#717784` | Bordes de inputs |
| `outline-variant` | `#c1c6d5` | Bordes sutiles de tarjetas y divisores |

### 8.2 Tipografía

| Rol | Fuente | Clase Tailwind (familia) | Clase Tailwind (tamaño) |
|---|---|---|---|
| Títulos de página (Display) | Plus Jakarta Sans, 700-800 | `font-display-lg` | `text-display-lg` (40px/48px) |
| Encabezados de sección | Plus Jakarta Sans, 600-700 | `font-headline-md` | `text-headline-md` (24px/32px) |
| Subtítulos grandes | Plus Jakarta Sans, 700 | `font-headline-lg` | `text-headline-lg` (32px/40px) |
| Cuerpo de texto | Inter, 400 | `font-body-md` | `text-body-md` (16px/24px) |
| Cuerpo pequeño | Inter, 400 | `font-body-sm` | `text-body-sm` (14px/20px) |
| Labels / Etiquetas | Inter, 600 | `font-label-md` | `text-label-md` (14px/16px) |
| Labels pequeñas | Inter, 500 | `font-label-sm` | `text-label-sm` (12px/14px) |

### 8.3 Reglas de Componentes

#### Tarjetas (Cards)
```
bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-gutter
```

#### Botones Primarios
```
bg-primary text-on-primary rounded-xl font-label-md shadow-md
hover:bg-primary/90 active:scale-95 transition-all
```

#### Botones Secundarios / Ghost
```
border border-outline-variant text-on-surface-variant rounded-xl font-label-md
hover:bg-surface-container-high transition-colors
```

#### Inputs
```
bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3
text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none
```

#### Sidebar de Navegación
```
Contenedor: w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-screen sticky top-0
Item activo:  bg-primary/10 text-primary rounded-xl font-label-md (icono con FILL 1)
Item normal:  text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors font-label-md
```

#### Header / Top App Bar
```
bg-surface-container-lowest border-b border-outline-variant h-16 sticky top-0 z-40
```

#### Modales
```
Overlay: fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60]
Contenido: bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg
```

#### Tablas
```
Contenedor: bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden
thead:       bg-surface-container-low border-b border-outline-variant
th:          px-gutter py-4 font-label-md text-on-surface-variant
td:          px-gutter py-4
tr hover:    hover:bg-surface-container-high transition-colors
```

#### Badges de Estado
```
Pendiente:    bg-secondary-container/15 text-secondary  rounded-full text-[12px] font-semibold
Completado:   bg-tertiary/15 text-tertiary              rounded-full text-[12px] font-semibold
Temprano:     bg-tertiary-fixed-dim/20 text-tertiary    rounded-full text-[11px] font-bold uppercase
Tarde:        bg-secondary-fixed/50 text-secondary      rounded-full text-[11px] font-bold uppercase
Justificado:  bg-primary-fixed/50 text-primary          rounded-full text-[11px] font-bold uppercase
Alta Prioridad: bg-error-container text-on-error-container  rounded-full text-[11px] font-bold uppercase
```

### 8.4 Espaciado (Spacing Tokens)

| Token | Valor | Uso |
|---|---|---|
| `stack-sm` | 4px | Separación mínima entre elementos inline |
| `base` | 8px | Espaciado base (ritmo de 8px) |
| `stack-md` | 12px | Separación entre items de lista |
| `gutter` | 16px | Padding interno de tarjetas, celdas de tabla |
| `stack-lg` | 24px | Separación entre secciones |
| `container-margin-desktop` | 32px | Margin lateral del contenido principal |

### 8.5 Iconografía

- Librería: **Material Symbols Outlined** (Google Fonts)
- Peso: 400 por defecto, `FILL 1` para iconos activos en el sidebar
- Tamaño: 24px por defecto, ajustable con `text-[Npx]`

---

## 9. Pruebas Automáticas y Prevención de Regresiones (TDD)

> **Framework de pruebas:** Vitest (backend). Ejecutar con `npm test` en `/backend`.

### 9.1 Validación Estricta de Flujos Críticos (MVP) — OBLIGATORIA

> **🚨 DIRECTRIZ INELUDIBLE — APLICA A TODA TAREA DE DESARROLLO**

**Cada vez que se asigne la tarea de generar, modificar o interactuar con un módulo, es OBLIGATORIO seguir este protocolo sin excepción:**

1. **Leer primero los flujos MVP:** Antes de escribir una sola línea de código, se debe leer la sección **"⚡ Flujos Críticos y Prioridades del Negocio (MVP)"** en el archivo `especificacion_escuela_dominical.md`. Esto garantiza que toda decisión de código esté alineada con las prioridades absolutas del sistema.

2. **Escribir pruebas ANTES del código:** Antes de implementar el microservicio o microfrontend, se deben escribir pruebas unitarias y de integración **deterministas** enfocadas específicamente en garantizar que la nueva característica respete las **5 reglas de negocio innegociables**:

   | # | Regla de Negocio Innegociable | Qué debe validar la prueba |
   |---|---|---|
   | MVP-01 | **Ingreso ágil de niños** | Que un niño se puede registrar en `Personas` + `Ninos` y marcar su asistencia en un flujo completo sin errores |
   | MVP-02 | **Asignación de grupos** | Que un niño se asigna correctamente al grupo por edad, y que las excepciones exigen motivo obligatorio |
   | MVP-03 | **Acceso al directorio de padres** | Que la consulta de padres/tutores vinculados a un niño retorna datos completos y correctos |
   | MVP-04 | **Gestión estricta de jerarquías** | Que un Staff no puede crear otro Staff sin autorización de Coordinador General, y que nadie crea roles superiores al propio |
   | MVP-05 | **Widget automático de cumpleañeros** | Que la consulta de cumpleañeros filtra correctamente por el mes actual y retorna nombre, día y grupo |

3. **Condición de éxito — Refinamiento iterativo autónomo:**

   ```
   REPETIR {
       1. Ejecutar todas las pruebas unitarias y de integración
       2. Analizar los resultados
       3. SI hay errores → Corregir el código y volver al paso 1
       4. SI todas pasan → Verificar cobertura de las 5 reglas MVP
       5. SI alguna regla MVP no tiene cobertura → Escribir prueba faltante y volver al paso 1
   } HASTA QUE:
       ✅ Todas las pruebas pasan (0 fallos)
       ✅ Las 5 reglas MVP tienen cobertura explícita
       ✅ No hay regresiones en módulos existentes
   ```

   > **⛔ NO se puede dar por terminado el desarrollo de un módulo, ni solicitar revisión, hasta que las pruebas demuestren matemáticamente que NINGUNA de las 5 reglas de negocio críticas se ha roto.**

### 8.2 Estructura de Pruebas

```
src/
├── __pruebas__/
│   ├── unitarias/
│   │   ├── servicios/       → Pruebas de lógica de negocio pura
│   │   └── repositorios/    → Pruebas de consultas SQL con mocks
│   ├── integracion/
│   │   ├── flujosMvp/       → Pruebas específicas de las 5 reglas MVP
│   │   ├── rutas/           → Pruebas de endpoints HTTP
│   │   └── triggers/        → Pruebas de triggers de PostgreSQL
│   └── utilidades/
│       └── fabricas.ts      → Factories para generar datos de prueba
```

### 8.3 Convenciones de Pruebas

- Framework: **Vitest** (compatible con TypeScript y ESM).
- Nombrar archivos de prueba con sufijo `.test.ts` (ej: `asistenciaNinosServicio.test.ts`).
- Cada prueba debe tener un `describe` que indique explícitamente qué regla MVP valida:
  ```typescript
  describe('MVP-01: Ingreso ágil de niños', () => {
    it('debe registrar un niño en Personas y Ninos correctamente', async () => {
      // ...
    });

    it('debe marcar asistencia asignando ficha de entrada', async () => {
      // ...
    });
  });
  ```
- Las pruebas de integración deben usar una base de datos de prueba con transacciones que se reviertan (`ROLLBACK`) después de cada test.
