# Especificación Técnica — Sistema de Control de Asistencia: Escuela Dominical

> **Metodología:** Spec-Driven Development (SDD)
> **Motor de BD:** PostgreSQL 14+
> **Patrón de Datos:** Herencia de Tablas (Supertipo/Subtipo)
> **Versión:** 2.0 (Esquema v4)
> **Fecha:** 2026-05-17
> **Migración:** v1.0 → v2.0 (esquema BD v3 → v4)

---

##  Flujos Críticos y Prioridades del Negocio (MVP)

> **🚨 ESTA SECCIÓN DEFINE LA PRIORIDAD ABSOLUTA DEL SISTEMA.**
> Los flujos descritos a continuación son el **corazón del sistema** y deben implementarse, probarse y validarse antes que cualquier otra funcionalidad.

---

### MVP-01: Gestión de Niños y Asistencia

**Prioridad:** 🔴 Crítica — Es la razón de existir del sistema.

El sistema debe permitir:

1. **Ingresar niños a la base de datos** con todos sus datos requeridos (nombres, apellidos, fecha de nacimiento, información médica, observaciones generales y tutores).
2. **Registrar asistencia de forma rápida** mediante una interfaz ágil que permita "ponerles presente" sin fricción. El flujo debe ser: buscar niño → asignar ficha de entrada → confirmar check-in.
3. El modal rápido de check-in (Módulo 9.2) es la interfaz principal para esta operación.

**Tablas involucradas:** `Personas`, `Ninos`, `Info_Medica_Ninos`, `Asistencia_Ninos`, `Fichas`, `Tutores`, `Tutores_Ninos`.
**Módulos que lo soportan:** 9.2 (Asistencia General), 9.3 (Asistencia por Grupo), 4.1 (Flujo de Check-in).

---

### MVP-02: Asignación de Grupos

**Prioridad:** 🔴 Crítica — Sin grupos, no hay organización del aula.

El sistema debe permitir:

1. **Asignar niños a los grupos disponibles** (2-6 años, 7-9 años, 10-12 años) según su edad.
2. **Gestionar excepciones documentadas** para hermanos/primos que necesiten estar juntos fuera de su rango de edad.
3. Los grupos deben estar pre-cargados como catálogo en la tabla `Grupos`.

**Tablas involucradas:** `Grupos`, `Ninos_Grupos`.
**Reglas vinculadas:** R-06 a R-10 (Sección 3.2). Constraint `chk_excepcion_motivo` obliga a documentar excepciones.

---

### MVP-03: Directorio de Tutores

**Prioridad:** 🔴 Crítica — Sin contacto de tutores, no hay seguridad en el retiro.

El sistema debe proveer:

1. **Acceso rápido y directo** a la lista de tutores vinculados a cada niño.
2. Botón **"Ver Tutores"** visible en cada registro de asistencia de niños que abra el Directorio de Contacto (Módulo 9.6).
3. La información debe incluir: nombres, apellidos, teléfono, tipo de tutor (Padre, Madre, Abuelo, etc.).

**Tablas involucradas:** `Tutores`, `Tutores_Ninos`.
**Módulo que lo soporta:** 9.6 (Directorio de Contacto).

---

### MVP-04: Gestión de Jerarquías

**Prioridad:** 🟠 Alta — Sin jerarquías, no hay control de accesos.

El sistema debe permitir:

1. **Ingresar personal** al sistema mediante el flujo de solicitudes (Módulo 9.10).
2. **Modificar roles de forma dinámica**: promover un Colaborador a Maestro, un Maestro a Staff, etc.
3. **Respetar la regla jerárquica**: registrar a un nuevo Staff requiere autorización obligatoria de un Coordinador General (blindado por trigger `trg_validar_autorizacion_staff`).
4. **Detectar duplicados**: si una persona ya existe en `Personas`, reutilizar su `ID_Persona`.

**Tablas involucradas:** `Personas`, `Personal_Sistema`, `Roles`, `Solicitudes_Personal`, `Personal_Grupos`.
**Módulo que lo soporta:** 9.5 (Ingreso de Personal), 9.10 (Solicitudes). **Trigger:** `trg_validar_autorizacion_staff`.

---

### MVP-05: Widget de Cumpleañeros

**Prioridad:** 🟠 Alta — Requisito permanente del Dashboard.

El tablero (Dashboard) principal debe mostrar **obligatoria y permanentemente** la lista de los niños cumpleañeros del mes actual:

1. El widget debe ser **siempre visible** en la pantalla principal, sin necesidad de navegación adicional.
2. Se calcula cruzando `EXTRACT(MONTH FROM Fecha_Nacimiento)` con el mes actual.
3. Debe mostrar: nombre completo del niño, día de cumpleaños y grupo asignado.

**Tablas involucradas:** `Personas`, `Ninos`, `Ninos_Grupos`, `Grupos`.
**Módulo que lo soporta:** 9.1 (Dashboard — componente "Cumpleañeros del mes").

---

### MVP-06: Gestión de Fichas Físicas

**Prioridad:** 🟠 Alta — Sin fichas, no hay control de entrada/salida seguro.

El sistema debe permitir:

1. **Gestionar fichas físicas por grupo**: cada ficha pertenece a un grupo etario específico.
2. **Rastrear disponibilidad**: saber cuántas fichas activas hay disponibles por grupo.
3. **Trazabilidad completa**: qué ficha se entregó a qué niño, en qué turno, y su estado actual.

**Tablas involucradas:** `Fichas`, `Asistencia_Ninos`, `Grupos`.
**Módulo que lo soporta:** 9.7 (Fichas).

---

### MVP-07: Solicitudes de Ingreso al Personal

**Prioridad:**  Alta — Sin flujo de solicitudes, no hay control de calidad del personal.

El sistema debe permitir:

1. **Crear solicitudes en estado Borrador** con todos los datos del candidato y requisitos cumplidos.
2. **Enviar solicitudes a Pendiente** solo si todos los requisitos obligatorios están marcados como cumplidos (validado por trigger).
3. **Aprobar o rechazar** solicitudes desde la vista del Coordinador General.
4. **Propagar datos automáticamente** al aprobar: se crea el registro en `Personal_Sistema` y se copian los datos a las tablas de perfil.

**Tablas involucradas:** `Solicitudes_Personal`, `Solicitudes_Requisitos`, `Requisitos`, `Personal_Sistema`.
**Módulo que lo soporta:** 9.10 (Solicitudes). **Triggers:** `trg_validar_requisitos_solicitud`, `trg_propagar_datos_solicitud`.

---

### MVP-08: Reportes y Exportación

**Prioridad:**  Media — Necesario para toma de decisiones y auditoría.

El sistema debe generar:

1. **Reporte de niños**: lista completa con datos personales, médicos y tutores.
2. **Reporte de asistencia de maestros**: puntualidad, inasistencias, métricas por rol.
3. **Reporte de fichas**: disponibilidad, extraviadas, trazabilidad.
4. **Reporte de solicitudes**: estado, tiempos de resolución.
5. **Exportación Excel/CSV** para todos los reportes.

**Tablas involucradas:** Todas las tablas operativas.
**Módulo que lo soporta:** 9.12 (Reportes).

---

### Matriz de Trazabilidad MVP → Módulos

| Prioridad MVP | Módulos que lo soportan | Tablas críticas | Estado |
|---|---|---|---|
| MVP-01: Gestión de Niños y Asistencia | 9.2, 9.3, Flujo 4.1 | `Personas`, `Ninos`, `Asistencia_Ninos`, `Fichas` | ⬜ Pendiente |
| MVP-02: Asignación de Grupos | 9.3 | `Grupos`, `Ninos_Grupos` | ⬜ Pendiente |
| MVP-03: Directorio de Tutores | 9.6 | `Tutores`, `Tutores_Ninos` | ⬜ Pendiente |
| MVP-04: Gestión de Jerarquías | 9.5, 9.9, 9.10 | `Personal_Sistema`, `Roles`, `Solicitudes_Personal` | ⬜ Pendiente |
| MVP-05: Widget de Cumpleañeros | 9.1 | `Personas`, `Ninos` | ⬜ Pendiente |
| MVP-06: Gestión de Fichas | 9.7 | `Fichas`, `Asistencia_Ninos` | ⬜ Pendiente |
| MVP-07: Solicitudes | 9.10 | `Solicitudes_Personal`, `Solicitudes_Requisitos`, `Requisitos` | ⬜ Pendiente |
| MVP-08: Reportes | 9.12 | Todas las tablas operativas | ⬜ Pendiente |

---

## 1. Visión General del Sistema

### 1.1 Objetivos

Proveer un sistema seguro y auditable para:

1. Controlar la asistencia dominical de niños (2-12 años) y personal de servicio.
2. Garantizar la seguridad física de los niños mediante un flujo de check-in/check-out con doble validación de fichas físicas.
3. Gestionar roles jerárquicos del personal con reglas estrictas de autorización.
4. Registrar información médica crítica para respuesta rápida ante emergencias.
5. Administrar tutores permanentes con información de contacto completa.
6. Gestionar un flujo de solicitudes para ingreso de personal con validación de requisitos.
7. Generar reportes exportables para toma de decisiones y auditoría.

### 1.2 Actores del Sistema

| Actor | Rol | Nivel | Permisos clave |
|---|---|---|---|
| Coordinador General | Administrador principal | 4 | Acceso total. Autoriza creación de Staff. Aprueba solicitudes. |
| Staff | Administrador operativo | 3 | Gestiona accesos. Requiere autorización del Coordinador para agregar otros Staff. Crea solicitudes. |
| Maestro | Líder de grupo | 2 | Solo ve su grupo asignado. **Solo visualiza** la asistencia (no puede registrarla). |
| Colaborador | Apoyo en grupo | 1 | Solo ve su grupo asignado. Apoyo operativo. |
| Padre/Tutor | Actor externo | — | Ingresa y retira niños. No tiene acceso al sistema. |

### 1.3 Alcance

**Incluido:** Gestión de personas, asignación a grupos, control de asistencia (niños y maestros), fichas físicas, información médica, tutores, solicitudes de ingreso al personal, requisitos, roles, turnos, eventos, redes, reportes, auditoría de accesos.

**Excluido:** Currículo educativo, finanzas/ofrendas, comunicaciones (email/SMS), app móvil nativa.

---

## 2. Modelos de Datos (Entidades y Relaciones)

### 2.1 Diagrama Entidad-Relación (Resumen)

```
                     ┌──────────────┐
                     │   Personas   │  ← SUPERTIPO
                     │  (ID_Persona)│
                     ──────┬───────┘
            ┌───────┬───────┼───────┬────────────────┐
            ▼       ▼       ▼       ▼                ▼
         ┌──────┐┌──────┐┌──────┐┌──────────────┐┌────────────────────┐
         │Niños ││Tutor.││Solic.││Personal_Sist.││Personas_Autorizadas│
         │      ││      ││      ││              ││   (standalone)     │
         └──┬───┘└──┬───└──┬───┘└──────┬───────┘└────────────────────┘
            │       │       │           │
      ┌─────┴────┐  │       │     ┌─────┴──────────────
      │Info_Med.  │  │       │     │Personal_Info_      │
      │Niños     │  │       │     │Personal / Iglesia  │
      └──────────┘  │       │     │Personal_Requisitos │
            │       │       │     │Personal_Turnos     │
      ┌─────┴───────┴───────┴──┐  │Personal_Grupos     │
      │   Asistencia_Niños     │  └────────────────────┘
      │   (check-in/check-out) │
      │   + Fichas + Turnos    │
      ───────────────────────┘
```

### 2.2 Tipos Enumerados (13)

```sql
CREATE TYPE rol_nombre              AS ENUM ('Colaborador','Maestro','Staff','Coordinador General');
CREATE TYPE ficha_estado            AS ENUM ('Activa','Inactiva','Extraviada');
CREATE TYPE tipo_info_medica        AS ENUM ('Alergia','Medicamento','Condicion');
CREATE TYPE severidad_medica        AS ENUM ('Leve','Moderada','Alta');
CREATE TYPE estado_llegada          AS ENUM ('Temprano','Tarde','Justificado','Injustificado');
CREATE TYPE estado_civil            AS ENUM ('Soltero','Acompañado','Casado','Divorciado','Viudo');
CREATE TYPE estado_liderazgo        AS ENUM ('Gap','Lider','Mentor');
CREATE TYPE nombre_turno            AS ENUM ('Miercoles','Domingo_8am','Domingo_11am','Domingo_5pm');
CREATE TYPE tipo_evento             AS ENUM ('Servicio Regular','Party Mix','Power Day','Semana Santa','Navidad','Especial','Otro');
CREATE TYPE tipo_requisito          AS ENUM ('Formacion','Estado_Ministerial','Otro');
CREATE TYPE estado_solicitud        AS ENUM ('Borrador','Pendiente','Aprobado','Rechazado');
CREATE TYPE estado_asistencia_nino  AS ENUM ('Presente','Retirado');
CREATE TYPE tipo_sexo               AS ENUM ('Masculino','Femenino');
```

### 2.3 Supertipo — Tabla `Personas`

```sql
CREATE TABLE Personas (
    ID_Persona        SERIAL       PRIMARY KEY,
    Nombres           VARCHAR(100) NOT NULL,
    Apellidos         VARCHAR(100) NOT NULL,
    Telefono          VARCHAR(20),
    Fecha_Nacimiento  DATE,
    Sexo              tipo_sexo,
    Creado_En         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    Actualizado_En    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

> **Auditoría aplicada:** `Creado_En` y `Actualizado_En` para trazabilidad temporal.

### 2.4 Subtipos

#### 2.4.1 `Niños`

```sql
CREATE TABLE Ninos (
    ID_Persona              INT  PRIMARY KEY
                                     REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Observaciones_Generales TEXT
);
```

#### 2.4.2 `Tutores` (unificado — reemplaza Padres + Tutores_Temporales)

```sql
CREATE TABLE Tutores (
    ID_Persona  INT         PRIMARY KEY
                                REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Tipo_Tutor  VARCHAR(60) NOT NULL
);
```

> **Cambio v2:** Se unifica `Padres` y `Tutores_Temporales` en una sola tabla `Tutores`. El campo `Tipo_Tutor` es libre: "Padre", "Madre", "Abuelo", "Tío", etc. **Todos los tutores son permanentes** — no existe vigencia de un día.

#### 2.4.3 `Tutores_Ninos` (M:N)

```sql
CREATE TABLE Tutores_Ninos (
    ID_Tutor  INT NOT NULL REFERENCES Tutores(ID_Persona) ON DELETE CASCADE,
    ID_Nino   INT NOT NULL REFERENCES Ninos(ID_Persona)   ON DELETE RESTRICT,
    PRIMARY KEY (ID_Tutor, ID_Nino)
);
```

> **Cambio v2:** Reemplaza `Padres_Ninos` y `Tutores_Temporales_Ninos`.

#### 2.4.4 `Personal_Sistema`

```sql
CREATE TABLE Personal_Sistema (
    ID_Persona             INT          PRIMARY KEY
                                            REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    ID_Rol                 INT          NOT NULL REFERENCES Roles(ID_Rol),
    Usuario                VARCHAR(30)  NOT NULL UNIQUE,
    Password_Hash          VARCHAR(255) NOT NULL,
    Fecha_Ingreso_Servicio DATE         NOT NULL DEFAULT CURRENT_DATE,
    Activo                 BOOLEAN      NOT NULL DEFAULT TRUE,
    ID_Creado_Por          INT          REFERENCES Personal_Sistema(ID_Persona),
    ID_Autorizado_Por      INT          REFERENCES Personal_Sistema(ID_Persona),
    ID_Solicitud_Origen    INT          UNIQUE
);
```

> **Cambios v2:**
> - `Usuario VARCHAR(30)` reemplaza a `Correo` como identificador de login.
> - `ID_Solicitud_Origen` vincula al registro de la solicitud aprobada que originó este personal.
> - `Activo BOOLEAN` para baja lógica sin perder historial.

### 2.5 Catálogos

#### 2.5.1 `Roles` (CRUD + activación)

```sql
CREATE TABLE Roles (
    ID_Rol           SERIAL     PRIMARY KEY,
    Nombre_Rol       rol_nombre NOT NULL UNIQUE,
    Nivel_Jerarquico INT        NOT NULL CHECK (Nivel_Jerarquico BETWEEN 1 AND 4),
    Activo           BOOLEAN    NOT NULL DEFAULT TRUE
);

INSERT INTO Roles (Nombre_Rol, Nivel_Jerarquico, Activo) VALUES
    ('Colaborador',         1, TRUE),
    ('Maestro',             2, TRUE),
    ('Staff',               3, TRUE),
    ('Coordinador General', 4, TRUE);
```

#### 2.5.2 `Grupos` (CRUD + activación)

```sql
CREATE TABLE Grupos (
    ID_Grupo     SERIAL       PRIMARY KEY,
    Nombre       VARCHAR(50)  NOT NULL,
    Edad_Minima  SMALLINT     NOT NULL,
    Edad_Maxima  SMALLINT     NOT NULL,
    Activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_edades_grupo
        CHECK (Edad_Minima >= 2 AND Edad_Maxima <= 12 AND Edad_Minima < Edad_Maxima)
);

INSERT INTO Grupos (Nombre, Edad_Minima, Edad_Maxima, Activo) VALUES
    ('2-6 años',   2,  6, TRUE),
    ('7-9 años',   7,  9, TRUE),
    ('10-12 años', 10, 12, TRUE);
```

#### 2.5.3 `Fichas` (por grupo etario)

```sql
CREATE TABLE Fichas (
    ID_Ficha      SERIAL       PRIMARY KEY,
    Codigo_Ficha  VARCHAR(20)  NOT NULL UNIQUE,
    Estado        ficha_estado NOT NULL DEFAULT 'Activa',
    ID_Grupo      INT          NOT NULL REFERENCES Grupos(ID_Grupo)
);

CREATE INDEX idx_fichas_activas ON Fichas (Estado, ID_Grupo) WHERE Estado = 'Activa';
CREATE INDEX idx_fichas_grupo   ON Fichas (ID_Grupo);
CREATE INDEX idx_fichas_codigo  ON Fichas (Codigo_Ficha);
```

> **Cambio v2:** Cada ficha pertenece a un grupo etario específico (`ID_Grupo`). Esto permite saber cuántas fichas hay disponibles por grupo.

#### 2.5.4 `Requisitos` (catálogo flexible)

```sql
CREATE TABLE Requisitos (
    ID_Requisito     SERIAL         PRIMARY KEY,
    Nombre           VARCHAR(100)   NOT NULL UNIQUE,
    Descripcion      TEXT,
    Tipo             tipo_requisito NOT NULL DEFAULT 'Formacion',
    ID_Rol_Requerido INT            REFERENCES Roles(ID_Rol),
    Obligatorio      BOOLEAN        NOT NULL DEFAULT FALSE,
    Activo           BOOLEAN        NOT NULL DEFAULT TRUE
);

INSERT INTO Requisitos (Nombre, Tipo, Obligatorio) VALUES
    ('Escuela de Nuevos Creyentes', 'Formacion',         TRUE),
    ('PEEH',                        'Formacion',         FALSE),
    ('BEE',                         'Formacion',         FALSE),
    ('Escuela de Artes',            'Formacion',         FALSE),
    ('Escuela de Obreros',          'Formacion',         FALSE);

CREATE INDEX idx_requisitos_tipo_activo ON Requisitos (Tipo, Activo);
```

> **Nuevo v2:** Catálogo CRUD de requisitos. `ID_Rol_Requerido = NULL` significa que aplica a todos los roles. `Obligatorio` determina si debe cumplirse antes de enviar una solicitud.

#### 2.5.5 `Redes` (catálogo eclesiástico)

```sql
CREATE TABLE Redes (
    ID_Red  SERIAL      PRIMARY KEY,
    Nombre  VARCHAR(60) NOT NULL UNIQUE,
    Activo  BOOLEAN     NOT NULL DEFAULT TRUE
);
```

#### 2.5.6 `Turnos` (4 servicios fijos)

```sql
CREATE TABLE Turnos (
    ID_Turno    SERIAL       PRIMARY KEY,
    Nombre      nombre_turno NOT NULL UNIQUE,
    Dia_Semana  SMALLINT     NOT NULL CHECK (Dia_Semana IN (0, 3)),
    Hora_Inicio TIME         NOT NULL,
    Activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO Turnos (Nombre, Dia_Semana, Hora_Inicio) VALUES
    ('Miercoles',    3, '19:00:00'),
    ('Domingo_8am',  0, '08:00:00'),
    ('Domingo_11am', 0, '11:00:00'),
    ('Domingo_5pm',  0, '17:00:00');
```

> **Nuevo v2:** Cuatro servicios semanales. `Dia_Semana`: 0 = Domingo, 3 = Miércoles (DOW en PostgreSQL).

#### 2.5.7 `Eventos` (fechas especiales)

```sql
CREATE TABLE Eventos (
    ID_Evento     SERIAL       PRIMARY KEY,
    Nombre        VARCHAR(100) NOT NULL,
    Descripcion   TEXT,
    Fecha         DATE         NOT NULL,
    ID_Turno      INT          REFERENCES Turnos(ID_Turno),
    Tipo          tipo_evento  NOT NULL DEFAULT 'Servicio Regular',
    Numero_Semana SMALLINT     GENERATED ALWAYS AS (
                      (((EXTRACT(DAY FROM Fecha))::INT - 1) / 7 + 1)::SMALLINT
                  ) STORED,
    Activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_evento_fecha_turno UNIQUE (Fecha, ID_Turno)
);

CREATE INDEX idx_eventos_fecha ON Eventos (Fecha DESC);
CREATE INDEX idx_eventos_turno ON Eventos (ID_Turno, Fecha);
```

> **Nuevo v2:** `Numero_Semana` calcula automáticamente qué semana del mes es (1.°, 2.°, 3.° o 4.°). Tipos: Party Mix, Power Day, Semana Santa, Navidad, Especial, Otro.

### 2.6 Información Médica de Niños

```sql
CREATE TABLE Info_Medica_Ninos (
    ID_Info       SERIAL           PRIMARY KEY,
    ID_Nino       INT              NOT NULL
                                       REFERENCES Ninos(ID_Persona) ON DELETE CASCADE,
    Tipo          tipo_info_medica NOT NULL,
    Descripcion   TEXT             NOT NULL,
    Severidad     severidad_medica,
    Instrucciones TEXT
);

CREATE INDEX idx_medica_nino_tipo ON Info_Medica_Ninos (ID_Nino, Tipo);
```

### 2.7 Tablas de Relación

#### `Ninos_Grupos` (M:N con excepciones)

```sql
CREATE TABLE Ninos_Grupos (
    ID_Nino           INT          NOT NULL REFERENCES Ninos(ID_Persona) ON DELETE RESTRICT,
    ID_Grupo          INT          NOT NULL REFERENCES Grupos(ID_Grupo),
    Es_Excepcion      BOOLEAN      NOT NULL DEFAULT FALSE,
    Motivo_Excepcion  VARCHAR(255),
    Fecha_Asignacion  DATE         NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (ID_Nino, ID_Grupo),
    CONSTRAINT chk_excepcion_motivo
        CHECK (Es_Excepcion = FALSE OR Motivo_Excepcion IS NOT NULL)
);
```

#### `Personal_Grupos` (M:N por turno)

```sql
CREATE TABLE Personal_Grupos (
    ID_Personal       INT  NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Grupo          INT  NOT NULL REFERENCES Grupos(ID_Grupo),
    ID_Turno          INT  NOT NULL REFERENCES Turnos(ID_Turno),
    Fecha_Asignacion  DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (ID_Personal, ID_Grupo, ID_Turno)
);

CREATE INDEX idx_personal_grupos ON Personal_Grupos (ID_Personal, ID_Grupo);
```

> **Cambio v2:** La PK incluye `ID_Turno`: un maestro puede cubrir grupos distintos en distintos turnos del mismo domingo.

#### `Personal_Turnos` (M:N)

```sql
CREATE TABLE Personal_Turnos (
    ID_Personal       INT     NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Turno          INT     NOT NULL REFERENCES Turnos(ID_Turno),
    Fecha_Asignacion  DATE    NOT NULL DEFAULT CURRENT_DATE,
    Activo            BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Personal, ID_Turno)
);
```

> **Nuevo v2:** Asignación de personal a turnos con estado activo/inactivo.

### 2.8 Información Personal del Staff

#### `Personal_Info_Personal` (datos civiles, 1:1)

```sql
CREATE TABLE Personal_Info_Personal (
    ID_Persona      INT          PRIMARY KEY
                                     REFERENCES Personal_Sistema(ID_Persona) ON DELETE CASCADE,
    Estado_Civil    estado_civil NOT NULL DEFAULT 'Soltero',
    Nombre_Conyuge  VARCHAR(100),
    Tiene_Hijos     BOOLEAN      NOT NULL DEFAULT FALSE,
    Numero_Hijos    SMALLINT,
    Direccion       TEXT,
    CONSTRAINT chk_conyuge
        CHECK (Estado_Civil NOT IN ('Casado','Acompañado') OR Nombre_Conyuge IS NOT NULL),
    CONSTRAINT chk_numero_hijos
        CHECK (Tiene_Hijos = FALSE OR (Numero_Hijos IS NOT NULL AND Numero_Hijos > 0))
);
```

#### `Personal_Info_Iglesia` (datos eclesiásticos, 1:1)

```sql
CREATE TABLE Personal_Info_Iglesia (
    ID_Persona            INT              PRIMARY KEY
                                               REFERENCES Personal_Sistema(ID_Persona) ON DELETE CASCADE,
    ID_Red                INT              REFERENCES Redes(ID_Red),
    Estado_Liderazgo      estado_liderazgo,
    ID_Mentor             INT              REFERENCES Personal_Sistema(ID_Persona),
    Circulo_Amistad       VARCHAR(100),
    Tiempo_Iglesia_Meses  INT              CHECK (Tiempo_Iglesia_Meses >= 0),
    Ministerio_Adicional  VARCHAR(150),
    CONSTRAINT chk_mentor_requiere_liderazgo
        CHECK (ID_Mentor IS NULL OR Estado_Liderazgo IN ('Gap','Lider')),
    CONSTRAINT chk_circulo_solo_lider
        CHECK (Circulo_Amistad IS NULL OR Estado_Liderazgo = 'Lider')
);

CREATE INDEX idx_iglesia_liderazgo ON Personal_Info_Iglesia (Estado_Liderazgo) WHERE Estado_Liderazgo IS NOT NULL;
CREATE INDEX idx_iglesia_red       ON Personal_Info_Iglesia (ID_Red)           WHERE ID_Red IS NOT NULL;
```

#### `Personal_Requisitos` (M:N — seguimiento individual)

```sql
CREATE TABLE Personal_Requisitos (
    ID_Personal     INT     NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE CASCADE,
    ID_Requisito    INT     NOT NULL REFERENCES Requisitos(ID_Requisito),
    Cumplido        BOOLEAN NOT NULL DEFAULT FALSE,
    Fecha_Cumplido  DATE,
    Notas           TEXT,
    PRIMARY KEY (ID_Personal, ID_Requisito),
    CONSTRAINT chk_fecha_cumplido
        CHECK (Cumplido = FALSE OR Fecha_Cumplido IS NOT NULL)
);

CREATE INDEX idx_personal_requisitos ON Personal_Requisitos (ID_Personal);
```

### 2.9 Solicitudes de Ingreso al Personal

#### `Solicitudes_Personal` (snapshot completo del candidato)

```sql
CREATE TABLE Solicitudes_Personal (
    ID_Solicitud          SERIAL           PRIMARY KEY,

    -- Identificación
    ID_Persona            INT              NOT NULL
                                               REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    ID_Rol_Solicitado     INT              NOT NULL REFERENCES Roles(ID_Rol),

    -- Gestión
    ID_Gestionado_Por     INT              NOT NULL
                                               REFERENCES Personal_Sistema(ID_Persona),
    ID_Resuelto_Por       INT              REFERENCES Personal_Sistema(ID_Persona),
    Estado                estado_solicitud NOT NULL DEFAULT 'Borrador',
    Fecha_Solicitud       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    Fecha_Resolucion      TIMESTAMPTZ,
    Notas_Staff           TEXT,
    Notas_Coordinador     TEXT,

    -- Datos personales del candidato (snapshot)
    Sexo_Candidato        tipo_sexo,
    Estado_Civil          estado_civil,
    Nombre_Conyuge        VARCHAR(100),
    Tiene_Hijos           BOOLEAN          NOT NULL DEFAULT FALSE,
    Numero_Hijos          SMALLINT,
    Direccion             TEXT,

    -- Datos eclesiásticos del candidato (snapshot)
    ID_Red                INT              REFERENCES Redes(ID_Red),
    Estado_Liderazgo      estado_liderazgo,
    ID_Mentor_Propuesto   INT              REFERENCES Personal_Sistema(ID_Persona),
    Circulo_Amistad       VARCHAR(100),
    Tiempo_Iglesia_Meses  INT              CHECK (Tiempo_Iglesia_Meses >= 0),
    Ministerio_Adicional  VARCHAR(150),

    -- Constraints de integridad
    CONSTRAINT chk_sol_fecha_resolucion
        CHECK (Fecha_Resolucion IS NULL OR Fecha_Resolucion >= Fecha_Solicitud),
    CONSTRAINT chk_sol_resolucion_completa
        CHECK (
            Estado IN ('Borrador','Pendiente')
            OR (
                Estado IN ('Aprobado','Rechazado')
                AND ID_Resuelto_Por IS NOT NULL
                AND Fecha_Resolucion IS NOT NULL
            )
        ),
    CONSTRAINT chk_sol_conyuge
        CHECK (Estado_Civil IS NULL
               OR Estado_Civil NOT IN ('Casado','Acompañado')
               OR Nombre_Conyuge IS NOT NULL),
    CONSTRAINT chk_sol_hijos
        CHECK (Tiene_Hijos = FALSE OR (Numero_Hijos IS NOT NULL AND Numero_Hijos > 0)),
    CONSTRAINT chk_sol_mentor_liderazgo
        CHECK (ID_Mentor_Propuesto IS NULL OR Estado_Liderazgo IN ('Gap','Lider')),
    CONSTRAINT chk_sol_circulo_lider
        CHECK (Circulo_Amistad IS NULL OR Estado_Liderazgo = 'Lider'),
    CONSTRAINT uq_solicitud_activa UNIQUE (ID_Persona, Estado)
);

CREATE INDEX idx_solicitudes_estado  ON Solicitudes_Personal (Estado, Fecha_Solicitud DESC);
CREATE INDEX idx_solicitudes_persona ON Solicitudes_Personal (ID_Persona);
```

> **Nuevo v2:** La solicitud es un snapshot completo de los datos del candidato. Al aprobarse, esos datos se copian automáticamente a `Personal_Info_Personal` y `Personal_Info_Iglesia` mediante trigger.

#### `Solicitudes_Requisitos` (requisitos declarados en la solicitud)

```sql
CREATE TABLE Solicitudes_Requisitos (
    ID_Solicitud    INT     NOT NULL REFERENCES Solicitudes_Personal(ID_Solicitud) ON DELETE CASCADE,
    ID_Requisito    INT     NOT NULL REFERENCES Requisitos(ID_Requisito),
    Cumplido        BOOLEAN NOT NULL DEFAULT FALSE,
    Fecha_Cumplido  DATE,
    Notas           TEXT,
    PRIMARY KEY (ID_Solicitud, ID_Requisito),
    CONSTRAINT chk_sr_fecha_cumplido
        CHECK (Cumplido = FALSE OR Fecha_Cumplido IS NOT NULL)
);

CREATE INDEX idx_sol_requisitos ON Solicitudes_Requisitos (ID_Solicitud);
```

#### FK diferida: `Personal_Sistema` ↔ `Solicitudes_Personal`

```sql
ALTER TABLE Personal_Sistema
    ADD CONSTRAINT fk_solicitud_origen
        FOREIGN KEY (ID_Solicitud_Origen)
        REFERENCES Solicitudes_Personal(ID_Solicitud)
        ON DELETE SET NULL;
```

### 2.10 Tablas de Asistencia

#### `Asistencia_Ninos` (rediseñada — con turnos, eventos, fichas, estado)

```sql
CREATE TABLE Asistencia_Ninos (
    ID_Asistencia              SERIAL                 PRIMARY KEY,
    Fecha                      DATE                   NOT NULL,
    ID_Turno                   INT                    NOT NULL REFERENCES Turnos(ID_Turno),
    ID_Evento                  INT                    REFERENCES Eventos(ID_Evento),
    ID_Nino                    INT                    NOT NULL REFERENCES Ninos(ID_Persona)   ON DELETE RESTRICT,
    ID_Grupo_Asistido          INT                    NOT NULL REFERENCES Grupos(ID_Grupo),
    Es_Excepcion_Asistencia    BOOLEAN                NOT NULL DEFAULT FALSE,
    Motivo_Excepcion_Asistencia VARCHAR(255),
    ID_Ficha_Entrada           INT                    NOT NULL REFERENCES Fichas(ID_Ficha),
    ID_Ficha_Salida            INT                    REFERENCES Fichas(ID_Ficha),
    ID_Ingresado_Por           INT                    NOT NULL REFERENCES Personas(ID_Persona),
    ID_Retirado_Por            INT                    REFERENCES Personas(ID_Persona),
    Registrado_Por             INT                    NOT NULL REFERENCES Personal_Sistema(ID_Persona),
    Checkout_Por               INT                    REFERENCES Personal_Sistema(ID_Persona),
    Hora_Entrada               TIME                   NOT NULL,
    Hora_Salida                TIME,
    Estado                     estado_asistencia_nino NOT NULL DEFAULT 'Presente',
    Acompanante_En_Aula        BOOLEAN                NOT NULL DEFAULT FALSE,
    Notas                      TEXT,

    CONSTRAINT uq_nino_fecha_turno        UNIQUE (ID_Nino, Fecha, ID_Turno),
    CONSTRAINT chk_horas_asistencia       CHECK (Hora_Salida IS NULL OR Hora_Salida > Hora_Entrada),
    CONSTRAINT chk_fichas_distintas       CHECK (ID_Ficha_Salida IS NULL OR ID_Ficha_Entrada <> ID_Ficha_Salida),
    CONSTRAINT chk_excepcion_asist_motivo CHECK (Es_Excepcion_Asistencia = FALSE OR Motivo_Excepcion_Asistencia IS NOT NULL),
    CONSTRAINT chk_estado_retirado
        CHECK (
            Estado = 'Presente'
            OR (Estado = 'Retirado' AND ID_Retirado_Por IS NOT NULL
                                    AND Hora_Salida IS NOT NULL
                                    AND ID_Ficha_Salida IS NOT NULL)
        )
);

CREATE INDEX idx_asistencia_nino       ON Asistencia_Ninos (ID_Nino, Fecha DESC);
CREATE INDEX idx_asistencia_fecha      ON Asistencia_Ninos (Fecha);
CREATE INDEX idx_asistencia_turno      ON Asistencia_Ninos (ID_Turno, Fecha DESC);
CREATE INDEX idx_salida_pendiente      ON Asistencia_Ninos (Fecha, ID_Nino) WHERE Estado = 'Presente';
CREATE INDEX idx_asistencia_ficha_ent  ON Asistencia_Ninos (ID_Ficha_Entrada);
```

> **Cambios v2:**
> - `ID_Turno` y `ID_Evento` para contextualizar el servicio.
> - `Estado` enum (`Presente`/`Retirado`) reemplaza la lógica implícita de `Hora_Salida IS NULL`.
> - `ID_Ficha_Entrada` y `ID_Ficha_Salida` vinculadas a la tabla `Fichas` (que ahora tiene `ID_Grupo`).
> - `Es_Excepcion_Asistencia` y `Motivo_Excepcion_Asistencia` para cuando el grupo asignado difiere del calculado por edad.
> - `UNIQUE (ID_Nino, Fecha, ID_Turno)`: un niño puede aparecer una vez por turno por día.

#### `Asistencia_Maestros` (con turnos, eventos, razón de ausencia)

```sql
CREATE TABLE Asistencia_Maestros (
    ID_Asistencia_Maestro  SERIAL         PRIMARY KEY,
    Fecha                  DATE           NOT NULL,
    ID_Turno               INT            NOT NULL REFERENCES Turnos(ID_Turno),
    ID_Evento              INT            REFERENCES Eventos(ID_Evento),
    ID_Personal            INT            NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Grupo               INT            NOT NULL REFERENCES Grupos(ID_Grupo),
    Estado_Llegada         estado_llegada NOT NULL,
    Hora_Llegada           TIME           NOT NULL,
    Razon_Ausencia         TEXT,
    Comentarios            TEXT,
    CONSTRAINT uq_personal_fecha_turno   UNIQUE (ID_Personal, Fecha, ID_Turno),
    CONSTRAINT chk_razon_injustificado
        CHECK (Estado_Llegada <> 'Injustificado' OR Razon_Ausencia IS NOT NULL)
);

CREATE INDEX idx_asist_maestro_fecha ON Asistencia_Maestros (Fecha, ID_Personal);
CREATE INDEX idx_asist_maestro_turno ON Asistencia_Maestros (ID_Turno, Fecha DESC);
CREATE INDEX idx_asist_maestro_estado ON Asistencia_Maestros (Estado_Llegada, Fecha DESC);
```

> **Cambios v2:**
> - `ID_Turno` y `ID_Evento` para contextualizar.
> - `Razon_Ausencia` obligatoria cuando `Estado_Llegada = 'Injustificado'`.
> - `UNIQUE (ID_Personal, Fecha, ID_Turno)`: un personal puede registrarse una vez por turno por día.

### 2.11 Índices (resumen)

| Índice | Tabla | Propósito |
|---|---|---|
| `idx_fichas_activas` | `Fichas` | Fichas disponibles por grupo (parcial) |
| `idx_fichas_grupo` | `Fichas` | Búsqueda por grupo |
| `idx_fichas_codigo` | `Fichas` | Búsqueda por código |
| `idx_requisitos_tipo_activo` | `Requisitos` | Filtro por tipo y activo |
| `idx_eventos_fecha` | `Eventos` | Orden cronológico descendente |
| `idx_eventos_turno` | `Eventos` | Eventos por turno |
| `idx_tutores_ninos` | `Tutores_Ninos` | Tutores de un niño |
| `idx_ninos_persona` | `Ninos` | Búsqueda por persona |
| `idx_medica_nino_tipo` | `Info_Medica_Ninos` | Info médica por niño y tipo |
| `idx_personal_usuario` | `Personal_Sistema` | Login por usuario |
| `idx_personal_rol_activo` | `Personal_Sistema` | Personal activo por rol |
| `idx_personal_rol_ingreso` | `Personal_Sistema` | Métricas por rol y fecha |
| `idx_personal_requisitos` | `Personal_Requisitos` | Requisitos de un personal |
| `idx_solicitudes_estado` | `Solicitudes_Personal` | Solicitudes por estado |
| `idx_solicitudes_persona` | `Solicitudes_Personal` | Solicitudes de una persona |
| `idx_sol_requisitos` | `Solicitudes_Requisitos` | Requisitos de una solicitud |
| `idx_asistencia_nino` | `Asistencia_Ninos` | Historial por niño |
| `idx_asistencia_fecha` | `Asistencia_Ninos` | Listado por fecha |
| `idx_asistencia_turno` | `Asistencia_Ninos` | Listado por turno |
| `idx_salida_pendiente` | `Asistencia_Ninos` | Niños sin retirar (parcial) |
| `idx_asistencia_ficha_ent` | `Asistencia_Ninos` | Trazabilidad de ficha |
| `idx_asist_maestro_fecha` | `Asistencia_Maestros` | Asistencia por fecha |
| `idx_asist_maestro_turno` | `Asistencia_Maestros` | Asistencia por turno |
| `idx_asist_maestro_estado` | `Asistencia_Maestros` | Filtrado por estado |
| `idx_personal_grupos` | `Personal_Grupos` | Grupos de un personal |
| `idx_iglesia_liderazgo` | `Personal_Info_Iglesia` | Filtrado por liderazgo |
| `idx_iglesia_red` | `Personal_Info_Iglesia` | Filtrado por red |

---

## 3. Reglas de Negocio y Lógica Central

### 3.1 Jerarquía de Roles y Permisos

| Regla | Descripción | Implementación |
|---|---|---|
| R-01 | Coordinador General tiene acceso total al sistema | Nivel jerárquico 4 — sin restricciones |
| R-02 | Staff administra accesos y opera todo el sistema | Nivel 3 — acceso completo excepto gestión de otros Staff sin autorización |
| R-03 | Staff requiere autorización del Coordinador para agregar otro Staff | Trigger `trg_validar_autorizacion_staff` |
| R-04 | Maestros y Colaboradores solo ven su grupo asignado | Filtro por `Personal_Grupos` en capa de aplicación |
| R-05 | Tiempo de servicio se calcula desde `Fecha_Ingreso_Servicio` | `AGE(CURRENT_DATE, Fecha_Ingreso_Servicio)` |

### 3.2 Gestión de Grupos y Excepciones

| Regla | Descripción |
|---|---|
| R-06 | Rango de edad global: 2 a 12 años |
| R-07 | Tres grupos: 2-6, 7-9, 10-12 |
| R-08 | Excepción permitida: hermanos/primos juntos (requiere motivo documentado) |
| R-09 | Excepción permitida: padre acompaña niño de 2 años en el aula (`Acompanante_En_Aula = TRUE`) |
| R-10 | Al asignar un niño fuera de su rango, `Es_Excepcion = TRUE` y `Motivo_Excepcion` es obligatorio |

### 3.3 Fichas Físicas

| Regla | Descripción |
|---|---|
| R-11 | Las fichas son objetos físicos reutilizables con código único |
| R-12 | Estados: Activa, Inactiva, Extraviada |
| R-13 | Cada ficha pertenece a un grupo etario específico (`ID_Grupo`) |
| R-14 | La ficha de entrada y la de salida pueden tener códigos distintos |
| R-15 | Un niño solo puede tener **una ficha de entrada activa por turno por día** (`UNIQUE (ID_Nino, Fecha, ID_Turno)`) |

### 3.4 Tutores

| Regla | Descripción |
|---|---|
| R-16 | Los tutores son permanentes (no existe vigencia de un día) |
| R-17 | `Tipo_Tutor` es libre: "Padre", "Madre", "Abuelo", "Tío", etc. |
| R-18 | Un niño puede tener múltiples tutores registrados |

### 3.5 Requisitos

| Regla | Descripción |
|---|---|
| R-19 | Los requisitos son un catálogo CRUD con activación/desactivación |
| R-20 | `ID_Rol_Requerido = NULL` significa que aplica a todos los roles |
| R-21 | Los requisitos obligatorios deben cumplirse antes de enviar una solicitud (validado por trigger) |
| R-22 | Tipos de requisito: Formación, Estado Ministerial, Otro |

### 3.6 Solicitudes de Ingreso

| Regla | Descripción |
|---|---|
| R-23 | Flujo de estados: Borrador → Pendiente → Aprobado / Rechazado |
| R-24 | No se puede regresar de Pendiente/Aprobado/Rechazado a Borrador |
| R-25 | Solo el Coordinador General puede aprobar o rechazar solicitudes |
| R-26 | Al aprobar, los datos del snapshot se copian a las tablas de perfil del personal |
| R-27 | Un candidato solo puede tener una solicitud activa (Borrador o Pendiente) a la vez |

### 3.7 Turnos y Eventos

| Regla | Descripción |
|---|---|
| R-28 | Cuatro turnos fijos: Miércoles 7pm, Domingo 8am, Domingo 11am, Domingo 5pm |
| R-29 | Los eventos especiales se vinculan a un turno y fecha específica |
| R-30 | `Numero_Semana` se calcula automáticamente (1.°, 2.°, 3.° o 4.° del mes) |

### 3.8 Patrón de Herencia (Supertipo/Subtipo)

| Regla | Descripción |
|---|---|
| R-31 | Toda persona se registra primero en `Personas` (supertipo) |
| R-32 | Cada subtipo usa `ID_Persona` como PK y FK simultáneamente |
| R-33 | Una persona puede existir en múltiples subtipos (ej: tutor que es maestro) |

---

## 4. Flujos de Estado (State Flows)

### 4.1 Flujo de Check-in (Entrada del Niño)

```
┌─────────────────────────────────────────────────────────┐
│                  FLUJO DE CHECK-IN                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Padre/Tutor llega con el niño                       │
│          │                                              │
│          ▼                                              │
│  2. Personal verifica identidad del tutor               │
│     (busca en Tutores_Ninos)                            │
│          │                                              │
│          ▼                                              │
│  3. ¿Niño ya tiene asistencia este turno hoy?           │
│     ├─ SÍ → RECHAZAR (constraint uq_nino_fecha_turno)  │
│     └─ NO → Continuar                                  │
│          │                                              │
│          ▼                                              │
│  4. Sistema calcula grupo por edad (trigger)            │
│     ¿El staff elige un grupo distinto?                  │
│     ├─ SÍ → Es_Excepcion_Asistencia = TRUE              │
│     │       Motivo_Excepcion_Asistencia obligatorio     │
│     └─ NO → Grupo asignado automáticamente              │
│          │                                              │
│          ▼                                              │
│  5. Sistema asigna ficha de ENTRADA                     │
│     (ficha activa del grupo correspondiente)            │
│     → Se entrega ficha física al tutor                  │
│          │                                              │
│          ▼                                              │
│  6. ¿Niño tiene 2 años y tutor acompañará?              │
│     ├─ SÍ → Acompanante_En_Aula = TRUE                 │
│     └─ NO → Acompanante_En_Aula = FALSE                │
│          │                                              │
│          ▼                                              │
│  7. Se crea registro en Asistencia_Ninos:               │
│     - Fecha, ID_Turno, ID_Evento (si aplica)            │
│     - Hora_Entrada, Estado = 'Presente'                 │
│     - ID_Nino, ID_Grupo_Asistido                        │
│     - ID_Ficha_Entrada                                  │
│     - ID_Ingresado_Por (el tutor)                       │
│     - Registrado_Por (personal que procesa)             │
│          │                                              │
│          ▼                                              │
│  8. CHECK-IN COMPLETADO ✓                               │
│     Ficha de entrada queda con el tutor.                │
│     Niño pasa al aula de su grupo.                      │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Check-out (Retiro del Niño) — Doble Validación

```
┌─────────────────────────────────────────────────────────┐
│               FLUJO DE CHECK-OUT                        │
│          (Doble Validación de Fichas)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Persona llega a retirar al niño                     │
│     Presenta ficha de SALIDA al personal                │
│          │                                              │
│          ▼                                              │
│  2. VALIDACIÓN DE IDENTIDAD (trigger)                   │
│     ¿Quién es esta persona?                             │
│     ├─ ¿Es la misma que hizo check-in?                  │
│     │   (ID_Retirado_Por = ID_Ingresado_Por)            │
│     │   └─ SÍ → AUTORIZADO ✓                           │
│     │                                                   │
│     ├─ ¿Es tutor registrado del niño?                   │
│     │   (existe en Tutores_Ninos)                       │
│     │   └─ SÍ → AUTORIZADO ✓                           │
│     │                                                   │
│     ─ NO cumple ninguna condición                      │
│         └─ RECHAZADO ✗ (trigger lanza excepción)        │
│          │                                              │
│          ▼                                              │
│  3. Personal del aula entrega ficha de ENTRADA          │
│     al maestro/personal para cruce                      │
│          │                                              │
│          ▼                                              │
│  4. VALIDACIÓN CRUZADA DE FICHAS                        │
│     Personal verifica que:                              │
│     - La ficha de SALIDA es válida (estado 'Activa')    │
│     - Se registra ID_Ficha_Salida (puede ser ≠ entrada) │
│     - ID_Ficha_Entrada ≠ ID_Ficha_Salida                │
│          │                                              │
│          ▼                                              │
│  5. Se actualiza registro en Asistencia_Ninos:          │
│     - ID_Ficha_Salida                                   │
│     - ID_Retirado_Por (persona que retira)              │
│     - Checkout_Por (personal que procesa)               │
│     - Hora_Salida                                       │
│     - Estado = 'Retirado' (trigger)                     │
│          │                                              │
│          ▼                                              │
│  6. CHECK-OUT COMPLETADO ✓                              │
│     Ambas fichas se recuperan para reutilización.       │
│     Niño entregado al tutor autorizado.                 │
─────────────────────────────────────────────────────────┘
```

### 4.3 Flujo de Solicitud de Ingreso al Personal

```
┌─────────────────────────────────────────────────────────┐
│            FLUJO DE SOLICITUD DE INGRESO                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Staff crea solicitud en estado 'Borrador'           │
│     - Selecciona o crea candidato en Personas           │
│     - Selecciona rol solicitado                         │
│     - Completa datos personales (tab 2)                 │
│     - Completa datos eclesiásticos (tab 3)              │
│     - Marca requisitos cumplidos (tab 4)                │
│          │                                              │
│          ▼                                              │
│  2. Staff envía solicitud (Borrador → Pendiente)        │
│     TRIGGER trg_validar_requisitos_solicitud:           │
│     - Verifica que TODOS los requisitos obligatorios    │
│       (activos y del rol solicitado) estén marcados     │
│       como Cumplido = TRUE                              │
│     - Si faltan → RAISE EXCEPTION con lista de faltantes│
│     - Si cumplen → Estado = 'Pendiente'                 │
│          │                                              │
│          ▼                                              │
│  3. Coordinador General revisa solicitudes pendientes   │
│     - Ve lista en vista v_solicitudes_pendientes        │
│     - Revisa datos, requisitos, notas del staff         │
│          │                                              │
│          ▼                                              │
│  4. Coordinador decide:                                 │
│     ├─ APROBAR → Estado = 'Aprobado'                    │
│     │            ID_Resuelto_Por = Coordinador          │
│     │            Fecha_Resolucion = NOW()               │
│     │            TRIGGER trg_propagar_datos_solicitud:  │
│     │            - Crea Personal_Sistema                │
│     │            - Copia datos a Personal_Info_Personal │
│     │            - Copia datos a Personal_Info_Iglesia  │
│     │            - Copia requisitos a Personal_Requisitos│
│     │            - Vincula ID_Solicitud_Origen          │
│     │                                                   │
│     └─ RECHAZAR → Estado = 'Rechazado'                  │
│                  ID_Resuelto_Por = Coordinador          │
│                  Fecha_Resolucion = NOW()               │
│                  Notas_Coordinador obligatorias         │
│          │                                              │
│          ▼                                              │
│  5. SOLICITUD RESUELTA ✓                                │
│     Si Aprobado: el nuevo personal ya puede iniciar     │
│     sesión con su Usuario y Password_Hash.              │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Flujo de Emergencia (Retiro por Persona No Original)

```
Tutor original NO puede retirar al niño
          │
          ▼
¿Persona sustituta está en Tutores_Ninos?
├─ SÍ → Proceder con check-out normal (Sección 4.2)
└─ NO → ¿Se puede registrar como tutor nuevo?
         │
         ▼
    Coordinador/Staff registra nuevo tutor:
    1. Crear en Personas (si no existe)
    2. Crear en Tutores (Tipo_Tutor = "Tío", "Vecino", etc.)
    3. Crear en Tutores_Ninos
    4. Proceder con check-out
```

---

## 5. Triggers de Validación de Negocio

### 5.1 `trg_nino_fecha_nac` — Fecha de nacimiento obligatoria en niños

```sql
CREATE OR REPLACE FUNCTION fn_validar_fecha_nac_nino()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT Fecha_Nacimiento FROM Personas WHERE ID_Persona = NEW.ID_Persona) IS NULL THEN
        RAISE EXCEPTION
            'El niño (ID_Persona: %) debe tener Fecha_Nacimiento registrada en Personas.',
            NEW.ID_Persona;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nino_fecha_nac
    BEFORE INSERT ON Ninos
    FOR EACH ROW EXECUTE FUNCTION fn_validar_fecha_nac_nino();
```

### 5.2 `trg_autoasignar_grupo_asistencia` — Calcula grupo por edad al registrar asistencia

```sql
CREATE OR REPLACE FUNCTION fn_autoasignar_grupo_asistencia()
RETURNS TRIGGER AS $$
DECLARE
    v_fecha_nac DATE;
    v_edad      INT;
    v_id_grupo  INT;
BEGIN
    SELECT p.Fecha_Nacimiento INTO v_fecha_nac
    FROM Personas p WHERE p.ID_Persona = NEW.ID_Nino;

    IF v_fecha_nac IS NULL THEN
        RAISE EXCEPTION 'El niño (ID: %) no tiene Fecha_Nacimiento registrada.', NEW.ID_Nino;
    END IF;

    v_edad := DATE_PART('year', AGE(NEW.Fecha, v_fecha_nac))::INT;

    SELECT ID_Grupo INTO v_id_grupo
    FROM Grupos
    WHERE Activo = TRUE
      AND v_edad >= Edad_Minima
      AND v_edad <= Edad_Maxima
    LIMIT 1;

    IF NEW.ID_Grupo_Asistido IS NULL THEN
        IF v_id_grupo IS NULL THEN
            RAISE EXCEPTION
                'No existe un grupo activo para un niño de % años. Asigne el grupo manualmente.', v_edad;
        END IF;
        NEW.ID_Grupo_Asistido          := v_id_grupo;
        NEW.Es_Excepcion_Asistencia    := FALSE;
        NEW.Motivo_Excepcion_Asistencia := NULL;
    ELSE
        IF v_id_grupo IS NULL OR NEW.ID_Grupo_Asistido <> v_id_grupo THEN
            NEW.Es_Excepcion_Asistencia := TRUE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_autoasignar_grupo_asistencia
    BEFORE INSERT ON Asistencia_Ninos
    FOR EACH ROW EXECUTE FUNCTION fn_autoasignar_grupo_asistencia();
```

### 5.3 `trg_validar_retiro_nino` — Autorización para retirar

```sql
CREATE OR REPLACE FUNCTION fn_validar_retiro_nino()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ID_Retirado_Por IS NOT NULL AND OLD.ID_Retirado_Por IS NULL THEN

        -- Caso 1: la misma persona que ingresó
        IF NEW.ID_Retirado_Por = OLD.ID_Ingresado_Por THEN
            NEW.Estado := 'Retirado';
            RETURN NEW;
        END IF;

        -- Caso 2: tutor registrado del niño
        IF EXISTS (
            SELECT 1 FROM Tutores_Ninos tn
            WHERE tn.ID_Nino  = NEW.ID_Nino
              AND tn.ID_Tutor = NEW.ID_Retirado_Por
        ) THEN
            NEW.Estado := 'Retirado';
            RETURN NEW;
        END IF;

        RAISE EXCEPTION
            'Persona (ID: %) NO autorizada para retirar al niño (ID: %).',
            NEW.ID_Retirado_Por, NEW.ID_Nino;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_retiro_nino
    BEFORE UPDATE ON Asistencia_Ninos
    FOR EACH ROW EXECUTE FUNCTION fn_validar_retiro_nino();
```

### 5.4 `trg_validar_requisitos_solicitud` — Requisitos obligatorios antes de enviar

```sql
CREATE OR REPLACE FUNCTION fn_validar_requisitos_solicitud()
RETURNS TRIGGER AS $$
DECLARE
    v_faltantes TEXT;
BEGIN
    IF OLD.Estado = 'Borrador' AND NEW.Estado = 'Pendiente' THEN

        SELECT STRING_AGG(r.Nombre, ', ' ORDER BY r.Nombre)
        INTO   v_faltantes
        FROM   Requisitos r
        WHERE  r.Activo       = TRUE
          AND  r.Obligatorio  = TRUE
          AND (r.ID_Rol_Requerido IS NULL OR r.ID_Rol_Requerido = NEW.ID_Rol_Solicitado)
          AND NOT EXISTS (
              SELECT 1 FROM Solicitudes_Requisitos sr
              WHERE sr.ID_Solicitud = NEW.ID_Solicitud
                AND sr.ID_Requisito = r.ID_Requisito
                AND sr.Cumplido     = TRUE
          );

        IF v_faltantes IS NOT NULL THEN
            RAISE EXCEPTION
                'La solicitud no puede enviarse. Requisitos obligatorios no cumplidos: [%].',
                v_faltantes;
        END IF;
    END IF;

    -- Bloquear retroceso desde Pendiente/Aprobado/Rechazado a Borrador
    IF OLD.Estado <> 'Borrador' AND NEW.Estado = 'Borrador' THEN
        RAISE EXCEPTION 'No se puede regresar una solicitud al estado Borrador una vez enviada.';
    END IF;

    -- Solo el Coordinador puede aprobar/rechazar
    IF NEW.Estado IN ('Aprobado','Rechazado') AND OLD.Estado = 'Borrador' THEN
        RAISE EXCEPTION 'La solicitud debe pasar por estado Pendiente antes de ser resuelta.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_requisitos_solicitud
    BEFORE UPDATE OF Estado ON Solicitudes_Personal
    FOR EACH ROW EXECUTE FUNCTION fn_validar_requisitos_solicitud();
```

### 5.5 `trg_validar_autorizacion_staff` — Jerarquía al crear Personal

```sql
CREATE OR REPLACE FUNCTION fn_validar_autorizacion_staff()
RETURNS TRIGGER AS $$
DECLARE
    v_nivel_creador    INT;
    v_nivel_autorizado INT;
    v_nivel_nuevo      INT;
BEGIN
    SELECT r.Nivel_Jerarquico INTO v_nivel_nuevo
    FROM Roles r WHERE r.ID_Rol = NEW.ID_Rol;

    IF NEW.ID_Creado_Por IS NOT NULL THEN
        SELECT r.Nivel_Jerarquico INTO v_nivel_creador
        FROM Personal_Sistema ps
        JOIN Roles r ON ps.ID_Rol = r.ID_Rol
        WHERE ps.ID_Persona = NEW.ID_Creado_Por;

        IF v_nivel_creador = 3 AND v_nivel_nuevo >= 3 THEN
            IF NEW.ID_Autorizado_Por IS NULL THEN
                RAISE EXCEPTION
                    'Un Staff que registra otro Staff o superior requiere ID_Autorizado_Por del Coordinador General.';
            END IF;

            SELECT r.Nivel_Jerarquico INTO v_nivel_autorizado
            FROM Personal_Sistema ps
            JOIN Roles r ON ps.ID_Rol = r.ID_Rol
            WHERE ps.ID_Persona = NEW.ID_Autorizado_Por;

            IF v_nivel_autorizado <> 4 THEN
                RAISE EXCEPTION
                    'ID_Autorizado_Por debe ser Coordinador General (nivel 4). Recibido nivel: %.',
                    v_nivel_autorizado;
            END IF;
        END IF;

        IF v_nivel_nuevo > v_nivel_creador THEN
            RAISE EXCEPTION
                'No se puede crear un usuario de nivel % desde nivel %.',
                v_nivel_nuevo, v_nivel_creador;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_autorizacion_staff
    BEFORE INSERT OR UPDATE ON Personal_Sistema
    FOR EACH ROW EXECUTE FUNCTION fn_validar_autorizacion_staff();
```

### 5.6 `trg_propagar_datos_solicitud` — Copia datos al aprobar solicitud

```sql
CREATE OR REPLACE FUNCTION fn_propagar_datos_solicitud_aprobada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.Estado = 'Aprobado' AND OLD.Estado = 'Pendiente' THEN

        -- Insertar info personal
        INSERT INTO Personal_Info_Personal (
            ID_Persona, Estado_Civil, Nombre_Conyuge,
            Tiene_Hijos, Numero_Hijos, Direccion
        )
        SELECT
            ps.ID_Persona,
            NEW.Estado_Civil,
            NEW.Nombre_Conyuge,
            NEW.Tiene_Hijos,
            NEW.Numero_Hijos,
            NEW.Direccion
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        -- Insertar info iglesia
        INSERT INTO Personal_Info_Iglesia (
            ID_Persona, ID_Red, Estado_Liderazgo,
            ID_Mentor, Circulo_Amistad,
            Tiempo_Iglesia_Meses, Ministerio_Adicional
        )
        SELECT
            ps.ID_Persona,
            NEW.ID_Red,
            NEW.Estado_Liderazgo,
            NEW.ID_Mentor_Propuesto,
            NEW.Circulo_Amistad,
            NEW.Tiempo_Iglesia_Meses,
            NEW.Ministerio_Adicional
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        -- Copiar requisitos
        INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido, Notas)
        SELECT
            ps.ID_Persona,
            sr.ID_Requisito,
            sr.Cumplido,
            sr.Fecha_Cumplido,
            sr.Notas
        FROM Solicitudes_Requisitos sr
        JOIN Personal_Sistema ps ON ps.ID_Persona = NEW.ID_Persona
                                AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Personal, ID_Requisito) DO NOTHING;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_propagar_datos_solicitud
    AFTER UPDATE OF Estado ON Solicitudes_Personal
    FOR EACH ROW EXECUTE FUNCTION fn_propagar_datos_solicitud_aprobada();
```

---

## 6. Consideraciones de Seguridad y Privacidad

### 6.1 Gestión de Datos Sensibles

| Dato | Clasificación | Política |
|---|---|---|
| `Password_Hash` | Crítico | Almacenar solo hash bcrypt (cost ≥ 12). Nunca texto plano. |
| Info médica de niños | Sensible (PII) | Acceso restringido a personal asignado al grupo del niño. |
| Datos de solicitudes | Sensible | Snapshot completo del candidato. Acceso limitado a Staff+ y Coordinador. |
| Datos eclesiásticos | Sensible | Solo visible para el propio personal y Coordinador. |
| Teléfonos | PII | Acceso limitado por rol. |

### 6.2 Control de Accesos (Matriz de Permisos)

| Recurso | Coordinador | Staff | Maestro | Colaborador |
|---|---|---|---|---|
| Gestionar personal | ✓ Total | ✓ (no Staff sin auth) | ✗ | ✗ |
| Ver todos los grupos | ✓ | ✓ | ✗ |  |
| Ver su grupo asignado | ✓ | ✓ | ✓ | ✓ |
| Registrar check-in/out | ✓ | ✓ | ✗ | ✗ |
| Visualizar asistencia (su grupo) | ✓ | ✓ | ✓ | ✓ |
| Ver info médica (su grupo) | ✓ | ✓ | ✓ | ✓ |
| Gestionar fichas | ✓ | ✓ | ✗ | ✗ |
| Gestionar tutores | ✓ | ✓ | ✗ | ✗ |
| Crear solicitudes | ✓ | ✓ | ✗ |  |
| Aprobar solicitudes | ✓ |  | ✗ | ✗ |
| Gestionar requisitos | ✓ | ✓ | ✗ | ✗ |
| Gestionar roles | ✓ | ✓ |  | ✗ |
| Gestionar turnos/eventos | ✓ | ✓ | ✗ | ✗ |
| Reportes globales | ✓ | ✓ | ✗ | ✗ |

### 6.3 Política de Retención

- **Solicitudes rechazadas:** Retención mínima de 1 año para auditoría.
- **Asistencia:** Retención permanente para métricas históricas.
- **Fichas extraviadas:** Registro permanente con estado `Extraviada`.

---

## 7. Resumen de Auditoría y Correcciones Aplicadas

### 7.1 Hallazgos en la Propuesta Original (v1.0)

| # | Hallazgo | Corrección Aplicada |
|---|---|---|
| 1 | Sin campos de auditoría temporal | Agregados `Creado_En` y `Actualizado_En` a `Personas` |
| 2 | Personal sin estado activo/inactivo | Agregado `Activo BOOLEAN` a `Personal_Sistema` |
| 3 | `Asistencia_Maestros` sin hora de llegada | Agregado `Hora_Llegada TIME` |
| 4 | `Asistencia_Ninos` sin registro de quién procesó el checkout | Agregado `Checkout_Por` |
| 5 | `Lista_Autorizados` sin estado activo | **Eliminada**: reemplazada por `Tutores` unificado |
| 6 | `Ninos_Grupos` sin fecha de asignación | Agregado `Fecha_Asignacion` |
| 7 | Trigger de retiro no consideraba tutores registrados | Ampliado a 2 casos (quien ingresó + tutor en `Tutores_Ninos`) |
| 8 | Trigger de Staff no impedía crear usuarios de nivel superior | Agregada validación de nivel |
| 9 | Sin campo de notas en asistencia diaria | Agregado `Notas TEXT` a `Asistencia_Ninos` |
| 10 | Sin flujo de solicitudes para ingreso de personal | Agregadas `Solicitudes_Personal` + `Solicitudes_Requisitos` |
| 11 | Sin catálogo de requisitos | Agregada tabla `Requisitos` con CRUD |
| 12 | Sin gestión de turnos y eventos | Agregadas tablas `Turnos` y `Eventos` |
| 13 | Fichas sin vínculo a grupo | Agregado `ID_Grupo` a `Fichas` |
| 14 | Personal sin datos extendidos | Agregadas `Personal_Info_Personal` y `Personal_Info_Iglesia` |
| 15 | `Personal_Sistema` usaba `Correo` como login | Cambiado a `Usuario VARCHAR(30)` |

### 7.2 Migración v1.0 → v2.0

| Elemento v1 | Elemento v2 | Nota |
|---|---|---|
| `Padres` | `Tutores` | Unificado con `Tipo_Tutor` libre |
| `Tutores_Temporales` | **Eliminado** | Todos los tutores ahora son permanentes |
| `Padres_Ninos` | `Tutores_Ninos` | M:N unificado |
| `Tutores_Temporales_Ninos` | **Eliminado** | Fusionado en `Tutores_Ninos` |
| `Lista_Autorizados` | **Eliminado** | Funcionalidad absorbida por `Tutores` |
| `Personal_Sistema.Correo` | `Personal_Sistema.Usuario` | Login por usuario, no por correo |
| `Asistencia_Ninos.UNIQUE(ID_Nino, Fecha)` | `UNIQUE(ID_Nino, Fecha, ID_Turno)` | Un niño puede asistir a múltiples turnos |
| `Asistencia_Maestros.UNIQUE(ID_Personal, Fecha)` | `UNIQUE(ID_Personal, Fecha, ID_Turno)` | Un personal puede asistir a múltiples turnos |

---

## 8. Casos Límite (Edge Cases) Identificados

| Edge Case | Escenario | Solución |
|---|---|---|
| EC-01 | Padre intenta registrar al mismo niño dos veces en el mismo turno | `UNIQUE (ID_Nino, Fecha, ID_Turno)` lo impide |
| EC-02 | Niño de 2 años sin tutor acompañante | Se permite; `Acompanante_En_Aula` es informativo |
| EC-03 | Persona es tutor Y maestro simultáneamente | El patrón supertipo/subtipo lo soporta nativamente |
| EC-04 | Se extravía una ficha de entrada | Ficha se marca como `Extraviada`; se asigna nueva ficha de salida |
| EC-05 | Tres hermanos de edades 4, 8 y 11 quieren estar juntos | Se usa `Es_Excepcion = TRUE` con motivo para los fuera de rango |
| EC-06 | Staff intenta crear un Coordinador General | Trigger rechaza: no puede crear nivel superior al propio |
| EC-07 | Niño cumple 13 años durante el año | Se evalúa al inicio de cada ciclo; la edad se calcula dinámicamente |
| EC-08 | Check-out sin ficha de salida (emergencia) | Staff+ puede forzar el checkout documentando en `Notas` |
| EC-09 | Tutor no registrado intenta hacer check-in | No se permite. Debe estar en `Tutores_Ninos` |
| EC-10 | Solicitud con requisitos obligatorios incompletos | Trigger `trg_validar_requisitos_solicitud` bloquea el envío |
| EC-11 | Coordinador intenta aprobar solicitud sin requisitos | Imposible: el trigger ya validó al pasar a Pendiente |
| EC-12 | Personal asignado a grupo que no existe en su turno | `Personal_Grupos` con PK `(ID_Personal, ID_Grupo, ID_Turno)` lo previene |
| EC-13 | Ficha de entrada = ficha de salida | Constraint `chk_fichas_distintas` lo impide |
| EC-14 | Hora de salida anterior a hora de entrada | Constraint `chk_horas_asistencia` lo impide |

---

## 9. Especificación de Módulos del Sistema

### 9.1 Módulo Tablero (Dashboard)

**Acceso:** Todos los roles autenticados (cada rol ve información filtrada según su nivel).

#### 9.1.1 Resumen del Día

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Niños presentes | Contador en tiempo real de niños con Estado = 'Presente' | Se actualiza con cada check-in/check-out |
| Pendientes de retiro | Contador de niños sin retirar en el turno actual | Consulta: `WHERE Estado = 'Presente' AND Fecha = CURRENT_DATE AND ID_Turno = turno_actual` |
| Personal activo | Contador de personal presente hoy | Cruce con `Asistencia_Maestros` |
| Solicitudes pendientes | Badge con número de solicitudes en estado 'Pendiente' | Vista `v_solicitudes_pendientes` |

#### 9.1.2 Widget de Cumpleañeros del Mes

Lista de niños cuyo mes de nacimiento coincide con el mes actual:

```sql
SELECT p.Nombres, p.Apellidos, p.Fecha_Nacimiento,
       EXTRACT(DAY FROM p.Fecha_Nacimiento) AS Dia_Cumpleanos
FROM Personas p
INNER JOIN Ninos n ON p.ID_Persona = n.ID_Persona
WHERE EXTRACT(MONTH FROM p.Fecha_Nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY EXTRACT(DAY FROM p.Fecha_Nacimiento) ASC;
```

#### 9.1.3 Alertas Médicas

Niños presentes hoy que tienen registros en `Info_Medica_Ninos` con severidad `Alta`. Solo visible para personal asignado al grupo del niño.

#### 9.1.4 Gráficas

| Gráfica | Tipo | Datos | Fuente |
|---|---|---|---|
| Asistencia niños por mes | Línea de tendencia | Total de niños distintos por mes | `v_asistencia_mensual_ninos` |
| Distribución por grupo | Dona / Pie | % de niños en 2-6, 7-9, 10-12 años | `Ninos_Grupos` + `Grupos` |
| Asistencia personal por rol | Barras apiladas | % Temprano/Tarde/Justificado/Injustificado por rol | `v_cumplimiento_personal` |
| Comparativa mes anterior | Indicador delta | ↑ o ↓ con diferencia numérica vs mes anterior | `v_comparativa_mensual` |
| Solicitudes pendientes | Contador/badge grande | Número de solicitudes en estado Pendiente | `v_solicitudes_pendientes` |

#### 9.1.5 Tarjetas de Acceso Rápido

4 tarjetas grandes con ícono Material Symbols, título y descripción breve:

| Tarjeta | Ícono | Destino | Descripción |
|---|---|---|---|
| Ingreso de Niños | `child_care` | `/ingreso-ninos` | Registrar nuevos niños y tutores |
| Asistencia de Niños | `fact_check` | `/asistencia` | Check-in y check-out de niños |
| Asistencia del Personal | `groups` | `/asistencia-personal` | Registro de llegada del personal |
| Reportes | `assessment` | `/reportes` | Generar y exportar reportes |

**Estilo visual:** Tarjetas grandes tipo Material Design con fondo `surface-container-lowest`, borde `outline-variant`, ícono grande (48px) con fondo circular de color temático, título en `headline-md`, descripción en `body-sm`. Hover con elevación y sombra.

---

### 9.2 Módulo de Asistencia General

**Acceso:** Staff y Coordinador General (nivel ≥ 3). Maestros y Colaboradores solo visualizan su grupo.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla paginada | Lista de todos los registros de asistencia del día con paginación | Tamaño de página por defecto: 20 registros |
| Filtro por turno | Selector de turno (Miércoles, Domingo 8am, 11am, 5pm) | Predeterminado: turno actual según hora del día |
| Filtro por evento | Selector de evento especial (si aplica) | Opcional |
| Filtro por estado | Pendiente de retiro / Completado | `Estado = 'Presente'` o `'Retirado'` |
| Botón "Nuevo Check-in" | Abre modal rápido de check-in | Solo para Staff+ |
| Indicador de pendientes | Badge visual con conteo de niños sin retirar | `WHERE Estado = 'Presente'` |

**Modal rápido de check-in:**
- Buscador de niño (insensible a acentos)
- Selector de turno (predeterminado: actual)
- Selector de ficha de entrada (solo fichas activas del grupo del niño)
- Selector de tutor que ingresa (de `Tutores_Ninos`)
- Checkbox de acompañante en aula
- Campo de observaciones

**Regla estricta de permisos:** Solo personal con rol **Staff (nivel 3) o superior** puede utilizar el botón de check-in. Maestros y Colaboradores **solo pueden visualizar** los registros de su grupo asignado.

---

### 9.3 Módulo de Asistencia por Grupo

**Acceso:** Todos los roles autenticados (filtrado por grupo asignado para Maestros y Colaboradores).

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Vista por grupo | Lista de niños asignados al grupo seleccionado con estado de asistencia del día | Cruce entre `Ninos_Grupos` y `Asistencia_Ninos` filtrado por `Fecha = CURRENT_DATE` |
| Selector de turno | Permite ver asistencia por turno específico | Predeterminado: turno actual |
| Modal de información médica | Al tocar/clicar el registro de un niño, se abre un modal con toda su información médica detallada | Muestra: condiciones, alergias con severidad, medicamentos con instrucciones, observaciones generales |
| Indicadores visuales | Iconos de alerta para niños con condiciones médicas de severidad `Alta` o `Moderada` | Visible directamente en la fila de la tabla |

---

### 9.4 Módulo de Asistencia de Personal

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Alcance:** Controla la asistencia de **Colaboradores** (nivel 1), **Maestros** (nivel 2) y **Staff** (nivel 3).

**Regla estricta:** Los **Coordinadores Generales (nivel 4) están excluidos** del registro de asistencia.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de asistencia | Lista del personal del día con estado de llegada, grupo asignado y turno | Filtro: `WHERE r.Nivel_Jerarquico < 4` |
| Filtro por turno | Selector de turno | Predeterminado: turno actual |
| Registro rápido | Formulario para marcar llegada con estado (`Temprano`, `Tarde`, `Justificado`, `Injustificado`) | `UNIQUE (ID_Personal, Fecha, ID_Turno)` previene duplicados |
| Razón de ausencia | Campo obligatorio cuando Estado = 'Injustificado' | Validado por constraint `chk_razon_injustificado` |
| Métricas | Porcentaje de asistencia por rol y tiempo de servicio | Cálculo con `AGE(CURRENT_DATE, ps.Fecha_Ingreso_Servicio)` |

---

### 9.5 Módulo de Ingreso de Personal (Post-Solicitud)

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Regla estricta:** Este módulo es el **paso final** después de que una solicitud ha sido aprobada por el Coordinador General. El registro en `Personal_Sistema` se crea automáticamente al aprobar la solicitud (trigger `trg_propagar_datos_solicitud`). Este módulo permite:

1. **Asignar rol final** basado en los requisitos cumplidos del candidato.
2. **Completar datos faltantes** que no se incluyeron en la solicitud.
3. **Asignar grupos y turnos** al nuevo personal.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Formulario de asignación | Campos: usuario, contraseña, rol final, fecha de ingreso | La contraseña se hashea con bcrypt antes de guardar |
| Selector de rol | Dropdown con roles disponibles según requisitos cumplidos | Un rol solo se puede asignar si los requisitos obligatorios para ese rol están cumplidos |
| Asignación de grupo | Selector de grupo (obligatorio para Colaborador y Maestro) | `ROLES_CON_GRUPO = ['Colaborador', 'Maestro']` |
| Asignación de turno | Selector múltiple de turnos | El personal puede estar asignado a varios turnos |
| Vista de solicitud origen | Muestra datos de la solicitud aprobada que originó este registro | Solo lectura, vinculada por `ID_Solicitud_Origen` |

**Flujo de registro:**

```
1. Solicitud aprobada → Personal_Sistema creado automáticamente (trigger)
          │
          ▼
2. Staff/Coordinador abre módulo de Ingreso de Personal
          │
          ▼
3. Selecciona el nuevo personal (de la lista de solicitudes aprobadas sin rol final)
          │
          ▼
4. Asigna rol final (basado en requisitos cumplidos)
          │
          ▼
5. Asigna grupo (si Colaborador/Maestro) y turnos
          │
          ▼
6. Establece Usuario y Password_Hash
          │
          ▼
7. Personal listo para iniciar sesión ✓
```

---

### 9.6 Módulo de Directorio de Contacto

**Acceso:** Staff y Coordinador General (nivel ≥ 3) ven todo. Maestros y Colaboradores solo ven contactos de niños de su grupo.

**Punto de entrada:** En las tablas de asistencia de niños, cada registro incluye un botón **"Ver Tutores"** que abre este módulo filtrado por el niño seleccionado.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de tutores | Muestra tutores del niño con: nombres, apellidos, teléfono, tipo de tutor | Datos de `Tutores_Ninos` cruzados con `Personas` y `Tutores` |
| Botón de llamada rápida | Enlace directo `tel:` para cada número de teléfono | Facilita contacto inmediato en emergencias |
| Tipo de tutor | Campo libre: "Padre", "Madre", "Abuelo", "Tío", etc. | Definido en `Tutores.Tipo_Tutor` |

**Nota:** Ya no existe la sección de tutores temporales. Todos los tutores son permanentes.

---

### 9.7 Módulo de Fichas Físicas

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Propósito:** Gestión completa de fichas físicas: CRUD, disponibilidad por grupo, trazabilidad.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de fichas | Lista de todas las fichas con código, estado, grupo asignado | Filtro por grupo y estado |
| Indicador de disponibilidad | Contador de fichas activas disponibles por grupo | `WHERE Estado = 'Activa' AND ID_Grupo = X AND ID_Ficha NOT IN (SELECT ID_Ficha_Entrada FROM Asistencia_Ninos WHERE Estado = 'Presente')` |
| CRUD de fichas | Crear, editar, desactivar o marcar como extraviada | Al marcar como `Extraviada`, no se puede usar para check-in |
| Trazabilidad | Historial de uso de cada ficha: qué niño, qué turno, qué fecha | Consulta cruzada con `Asistencia_Ninos` |
| Código de ficha | Campo único `Codigo_Ficha` (ej: "A-001", "B-015") | Formato libre pero único |

**Estados de ficha:**
- `Activa`: Disponible para uso
- `Inactiva`: Fuera de servicio (dañada, en reparación, etc.)
- `Extraviada`: No se encuentra, requiere reemplazo

**Vista de disponibilidad por grupo:**

```
┌─────────────────────────────────────────┐
│  FICHAS DISPONIBLES POR GRUPO           │
├─────────────────────────────────────────┤
│  2-6 años:  [████████░░]  8/10 activas  │
│  7-9 años:  [██████░░░░]  6/10 activas  │
│  10-12 años:[█████████░]  9/10 activas  │
└─────────────────────────────────────────┘
```

---

### 9.8 Módulo de Requisitos

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Propósito:** CRUD del catálogo de requisitos. Activar/desactivar requisitos. Marcar como obligatorio por rol.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de requisitos | Lista de todos los requisitos con nombre, tipo, rol requerido, obligatorio, activo | Filtro por tipo y estado |
| CRUD de requisitos | Crear, editar, activar/desactivar requisitos | Al desactivar, no aparece en nuevas solicitudes pero se mantiene en historial |
| Tipo de requisito | Selector: Formación, Estado Ministerial, Otro | `tipo_requisito` enum |
| Rol requerido | Selector de rol o "Todos los roles" | `ID_Rol_Requerido = NULL` significa todos |
| Obligatorio | Toggle booleano | Los requisitos obligatorios deben cumplirse antes de enviar una solicitud |

**Requisitos pre-cargados:**
- Escuela de Nuevos Creyentes (Formación, Obligatorio)
- PEEH (Formación, Opcional)
- BEE (Formación, Opcional)
- Escuela de Artes (Formación, Opcional)
- Escuela de Obreros (Formación, Opcional)

---

### 9.9 Módulo de Roles

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Propósito:** CRUD de roles. Activar/desactivar roles. No se pueden eliminar roles con personal asignado.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de roles | Lista de roles con nombre, nivel jerárquico, activo | Ordenado por nivel jerárquico |
| CRUD de roles | Crear, editar, activar/desactivar roles | No se puede eliminar un rol con personal asignado |
| Nivel jerárquico | Número del 1 al 4 | Determina permisos y reglas de autorización |
| Validación de eliminación | Verificar que no haya personal con ese rol | `SELECT COUNT(*) FROM Personal_Sistema WHERE ID_Rol = X` |

**Roles pre-cargados:**
- Colaborador (nivel 1)
- Maestro (nivel 2)
- Staff (nivel 3)
- Coordinador General (nivel 4)

---

### 9.10 Módulo de Solicitudes

**Acceso:** Staff crea solicitudes. Coordinador General aprueba/rechaza.

**Propósito:** Flujo completo de solicitud de ingreso al personal con modal de 4 pestañas navegables.

#### 9.10.1 Vista de Staff (Crear Solicitudes)

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de solicitudes | Lista de solicitudes creadas por el staff con estado | Filtro por estado |
| Botón "Nueva Solicitud" | Abre modal con 4 pestañas navegables | Solo para Staff+ |
| Estados visibles | Borrador, Pendiente, Aprobado, Rechazado | El staff solo puede editar en estado Borrador |

#### 9.10.2 Modal de Solicitud (4 Pestañas Navegables)

**Pestaña 1: Identificación del Candidato**
- Buscador de persona existente en `Personas` (para reutilizar `ID_Persona`)
- Opción de crear nueva persona si no existe
- Selector de rol solicitado (`ID_Rol_Solicitado`)
- Notas del staff (observaciones sobre el candidato)

**Pestaña 2: Datos Personales**
- Estado civil (Soltero, Acompañado, Casado, Divorciado, Viudo)
- Nombre del cónyuge (obligatorio si Casado o Acompañado)
- ¿Tiene hijos? (toggle)
- Número de hijos (obligatorio si tiene hijos)
- Dirección

**Pestaña 3: Datos Eclesiásticos**
- Red eclesiástica (selector de `Redes`)
- Estado de liderazgo (Gap, Lider, Mentor)
- Mentor propuesto (selector de personal existente, solo si Gap o Lider)
- Círculo de amistad (solo si Lider)
- Tiempo en la iglesia (meses)
- Ministerio adicional

**Pestaña 4: Requisitos**
- Checklist de todos los requisitos activos aplicables al rol solicitado
- Cada requisito tiene: checkbox de cumplido, fecha de cumplimiento (obligatoria si cumplido), notas
- Indicador visual de requisitos obligatorios pendientes
- Botón "Enviar Solicitud" (solo activo si todos los obligatorios están cumplidos)

#### 9.10.3 Vista de Coordinador (Aprobar/Rechazar)

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de pendientes | Lista de solicitudes en estado 'Pendiente' | Vista `v_solicitudes_pendientes` |
| Detalle de solicitud | Modal de solo lectura con las 4 pestañas | Muestra todos los datos del candidato |
| Requisitos cumplidos | Indicador visual: "X de Y requisitos obligatorios cumplidos" | Calculado en la vista |
| Botón Aprobar | Cambia estado a 'Aprobado' | Trigger propaga datos a tablas de perfil |
| Botón Rechazar | Cambia estado a 'Rechazado' | Requiere notas del coordinador |
| Historial de solicitudes | Lista de solicitudes aprobadas y rechazadas | Filtro por estado y fecha |

#### 9.10.4 Flujo de Estados

```
Borrador → (Staff envía, trigger valida requisitos) → Pendiente → (Coordinador decide) → Aprobado / Rechazado
```

- No se puede regresar de Pendiente/Aprobado/Rechazado a Borrador.
- Solo el Coordinador General puede aprobar o rechazar.
- Al aprobar, se crea automáticamente el registro en `Personal_Sistema` y se copian los datos a las tablas de perfil.

---

### 9.11 Módulo de Personal (Perfil Completo)

**Acceso:** Staff y Coordinador General (nivel ≥ 3). Cada personal puede ver su propio perfil.

**Propósito:** Vista consolidada del perfil del personal con todos sus datos.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Datos personales | Nombres, apellidos, usuario, fecha de ingreso, rol, activo | Datos de `Personas` + `Personal_Sistema` |
| Info personal | Estado civil, cónyuge, hijos, dirección | `Personal_Info_Personal` |
| Info iglesia | Red, estado liderazgo, mentor, círculo de amistad, tiempo en iglesia | `Personal_Info_Iglesia` |
| Requisitos cumplidos | Lista de requisitos con estado cumplido/pendiente, fecha, notas | `Personal_Requisitos` cruzado con `Requisitos` |
| Grupos asignados | Lista de grupos por turno | `Personal_Grupos` |
| Turnos asignados | Lista de turnos activos | `Personal_Turnos` |
| Historial de asistencia | Resumen de asistencia por mes y turno | `Asistencia_Maestros` |
| Solicitud de origen | Datos de la solicitud que originó este registro | `Solicitudes_Personal` vinculada por `ID_Solicitud_Origen` |

---

### 9.12 Módulo de Reportes

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Propósito:** Generación de reportes por sección con exportación Excel/CSV.

#### 9.12.1 Tipos de Reporte

| Reporte | Contenido | Filtros |
|---|---|---|
| Reporte de Niños | Lista completa con datos personales, fecha de nacimiento, grupo asignado, tutores, info médica | Por grupo, por fecha de nacimiento, por tutor |
| Reporte de Asistencia de Niños | Historial de asistencia con fecha, turno, grupo, hora entrada/salida, estado | Por fecha, por turno, por grupo, por estado |
| Reporte de Asistencia de Maestros | Puntualidad, inasistencias, métricas por rol y persona | Por fecha, por turno, por rol, por persona |
| Reporte de Fichas | Disponibilidad por grupo, fichas extraviadas, trazabilidad de uso | Por grupo, por estado |
| Reporte de Solicitudes | Estado, tiempos de resolución, requisitos cumplidos | Por estado, por fecha, por rol solicitado |
| Reporte de Requisitos | Cumplimiento por persona, requisitos pendientes por rol | Por rol, por persona, por requisito |
| Reporte de Cumpleaños | Niños que cumplen años en el período seleccionado | Por mes, por rango de fechas |

#### 9.12.2 Exportación

| Formato | Descripción |
|---|---|
| Excel (.xlsx) | Archivo con formato, encabezados y datos tabulados |
| CSV (.csv) | Archivo plano con separador de comas, compatible con cualquier hoja de cálculo |

**Funcionalidades de exportación:**
- Botón "Exportar a Excel" en cada reporte
- Botón "Exportar a CSV" en cada reporte
- Los filtros aplicados se mantienen en la exportación
- Nombre de archivo automático: `reporte_[tipo]_[fecha].xlsx`

#### 9.12.3 Vista Previa

Cada reporte muestra una vista previa en pantalla con:
- Tabla paginada con los datos
- Contador de registros totales
- Resumen estadístico (totales, promedios, porcentajes)
- Botones de exportación visibles

---

### 9.13 Módulo de Turnos y Eventos

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

#### 9.13.1 Turnos

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de turnos | Lista de los 4 turnos fijos con nombre, día, hora de inicio | No se pueden eliminar turnos con asistencia registrada |
| Estado activo | Toggle para activar/desactivar turnos | Un turno desactivado no aparece en selectores de asistencia |
| Turnos pre-cargados | Miércoles 7pm, Domingo 8am, Domingo 11am, Domingo 5pm | No editables (son fijos por política) |

#### 9.13.2 Eventos

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de eventos | Lista de eventos con nombre, descripción, fecha, turno, tipo, número de semana | Filtro por fecha y tipo |
| CRUD de eventos | Crear, editar, activar/desactivar eventos | `Numero_Semana` se calcula automáticamente |
| Tipos de evento | Servicio Regular, Party Mix, Power Day, Semana Santa, Navidad, Especial, Otro | `tipo_evento` enum |
| Calendario mensual | Vista de calendario con eventos del mes | Navegación mes a mes |

---

### 9.14 Módulo de Redes

**Acceso:** Staff y Coordinador General (nivel ≥ 3).

**Propósito:** CRUD del catálogo de redes eclesiásticas.

| Componente | Descripción | Regla de negocio |
|---|---|---|
| Tabla de redes | Lista de redes con nombre y estado activo | Filtro por estado |
| CRUD de redes | Crear, editar, activar/desactivar redes | No se puede eliminar una red con personal asignado |
| Estado activo | Toggle booleano | Una red desactivada no aparece en selectores |

---

### 9.15 Nota sobre el Patrón de Herencia en la Base de Datos

Todos los módulos que gestionan personas se apoyan en el **patrón de herencia de tablas (Supertipo/Subtipo)**:

- La tabla `Personas` es el **supertipo** que centraliza datos comunes (nombres, apellidos, teléfono, fecha de nacimiento).
- Los **subtipos** (`Ninos`, `Tutores`, `Personal_Sistema`) extienden a `Personas` usando `ID_Persona` como PK y FK simultáneamente.
- **Un tutor puede ser también maestro o staff**: la misma persona puede tener registros en `Tutores` y en `Personal_Sistema` al mismo tiempo, sin duplicar datos personales.
- El módulo de **Solicitudes** (9.10) debe detectar si la persona ya existe como tutor y reutilizar su `ID_Persona` en lugar de crear un duplicado.
- Las solicitudes contienen un **snapshot completo** de los datos del candidato. Al aprobarse, esos datos se propagan automáticamente a las tablas de perfil del personal mediante trigger.

---

## 10. Vistas de Base de Datos

### 10.1 `v_ninos_presentes` — Niños actualmente presentes por turno y fecha

```sql
CREATE OR REPLACE VIEW v_ninos_presentes AS
SELECT
    an.Fecha,
    t.Nombre                            AS Turno,
    p.Nombres  || ' ' || p.Apellidos   AS Nino,
    g.Nombre                            AS Grupo,
    an.Es_Excepcion_Asistencia,
    an.Acompanante_En_Aula,
    an.Hora_Entrada,
    f.Codigo_Ficha                      AS Ficha_Entrada,
    an.Estado
FROM Asistencia_Ninos an
JOIN Personas p   ON an.ID_Nino           = p.ID_Persona
JOIN Grupos   g   ON an.ID_Grupo_Asistido = g.ID_Grupo
JOIN Turnos   t   ON an.ID_Turno          = t.ID_Turno
JOIN Fichas   f   ON an.ID_Ficha_Entrada  = f.ID_Ficha
WHERE an.Estado = 'Presente'
ORDER BY an.Fecha DESC, t.Nombre, g.Nombre, p.Apellidos;
```

### 10.2 `v_asistencia_mensual_ninos` — Asistencia mensual de niños por turno

```sql
CREATE OR REPLACE VIEW v_asistencia_mensual_ninos AS
SELECT
    DATE_TRUNC('month', an.Fecha)  AS Mes,
    t.Nombre                       AS Turno,
    COUNT(DISTINCT an.ID_Nino)     AS Ninos_Distintos,
    COUNT(*)                       AS Total_Registros
FROM Asistencia_Ninos an
JOIN Turnos t ON an.ID_Turno = t.ID_Turno
GROUP BY DATE_TRUNC('month', an.Fecha), t.Nombre
ORDER BY Mes DESC, Turno;
```

### 10.3 `v_comparativa_mensual` — Comparativa de asistencia mensual (total + delta)

```sql
CREATE OR REPLACE VIEW v_comparativa_mensual AS
SELECT
    DATE_TRUNC('month', Fecha)   AS Mes,
    COUNT(DISTINCT ID_Nino)      AS Total_Ninos,
    LAG(COUNT(DISTINCT ID_Nino)) OVER (ORDER BY DATE_TRUNC('month', Fecha)) AS Mes_Anterior,
    COUNT(DISTINCT ID_Nino)
      - LAG(COUNT(DISTINCT ID_Nino)) OVER (ORDER BY DATE_TRUNC('month', Fecha)) AS Diferencia
FROM Asistencia_Ninos
GROUP BY DATE_TRUNC('month', Fecha)
ORDER BY Mes DESC;
```

### 10.4 `v_inasistencias_personal` — Inasistencias injustificadas y tardanzas del personal

```sql
CREATE OR REPLACE VIEW v_inasistencias_personal AS
SELECT
    am.Fecha,
    t.Nombre                           AS Turno,
    p.Nombres || ' ' || p.Apellidos   AS Personal,
    r.Nombre_Rol                       AS Rol,
    am.Estado_Llegada,
    am.Razon_Ausencia,
    am.Comentarios
FROM Asistencia_Maestros am
JOIN Personal_Sistema ps ON am.ID_Personal = ps.ID_Persona
JOIN Personas p          ON ps.ID_Persona  = p.ID_Persona
JOIN Roles r             ON ps.ID_Rol      = r.ID_Rol
JOIN Turnos t            ON am.ID_Turno    = t.ID_Turno
WHERE am.Estado_Llegada IN ('Injustificado','Tarde')
ORDER BY am.Fecha DESC, t.Nombre;
```

### 10.5 `v_cumplimiento_personal` — Cumplimiento de asistencia del personal (% por mes y turno)

```sql
CREATE OR REPLACE VIEW v_cumplimiento_personal AS
SELECT
    DATE_TRUNC('month', am.Fecha)      AS Mes,
    t.Nombre                           AS Turno,
    p.Nombres || ' ' || p.Apellidos   AS Personal,
    r.Nombre_Rol                       AS Rol,
    COUNT(*)                           AS Total_Sesiones,
    COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Temprano')      AS Temprano,
    COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Tarde')         AS Tarde,
    COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Justificado')   AS Justificado,
    COUNT(*) FILTER (WHERE am.Estado_Llegada = 'Injustificado') AS Injustificado,
    ROUND(
        100.0
        * COUNT(*) FILTER (WHERE am.Estado_Llegada IN ('Temprano','Tarde','Justificado'))
        / NULLIF(COUNT(*), 0), 2
    )                                  AS Pct_Asistencia
FROM Asistencia_Maestros am
JOIN Personal_Sistema ps ON am.ID_Personal = ps.ID_Persona
JOIN Personas p          ON ps.ID_Persona  = p.ID_Persona
JOIN Roles r             ON ps.ID_Rol      = r.ID_Rol
JOIN Turnos t            ON am.ID_Turno    = t.ID_Turno
GROUP BY DATE_TRUNC('month', am.Fecha), t.Nombre, p.Nombres, p.Apellidos, r.Nombre_Rol
ORDER BY Mes DESC, Turno, Personal;
```

### 10.6 `v_solicitudes_pendientes` — Solicitudes pendientes para el Coordinador General

```sql
CREATE OR REPLACE VIEW v_solicitudes_pendientes AS
SELECT
    sp.ID_Solicitud,
    p_cand.Nombres  || ' ' || p_cand.Apellidos   AS Candidato,
    p_cand.Telefono                               AS Telefono,
    r.Nombre_Rol                                  AS Rol_Solicitado,
    p_staff.Nombres || ' ' || p_staff.Apellidos  AS Gestionado_Por,
    sp.Fecha_Solicitud,
    sp.Estado_Liderazgo,
    sp.Tiempo_Iglesia_Meses,
    (SELECT COUNT(*) FROM Solicitudes_Requisitos sr
     JOIN Requisitos req ON sr.ID_Requisito = req.ID_Requisito
     WHERE sr.ID_Solicitud = sp.ID_Solicitud
       AND sr.Cumplido = TRUE
       AND req.Obligatorio = TRUE)               AS Req_Obligatorios_Cumplidos,
    (SELECT COUNT(*) FROM Requisitos req
     WHERE req.Obligatorio = TRUE AND req.Activo = TRUE
       AND (req.ID_Rol_Requerido IS NULL OR req.ID_Rol_Requerido = sp.ID_Rol_Solicitado))
                                                   AS Req_Obligatorios_Total,
    sp.Notas_Staff
FROM Solicitudes_Personal sp
JOIN Personas p_cand      ON sp.ID_Persona        = p_cand.ID_Persona
JOIN Roles r              ON sp.ID_Rol_Solicitado = r.ID_Rol
JOIN Personal_Sistema ps  ON sp.ID_Gestionado_Por = ps.ID_Persona
JOIN Personas p_staff     ON ps.ID_Persona        = p_staff.ID_Persona
WHERE sp.Estado = 'Pendiente'
ORDER BY sp.Fecha_Solicitud ASC;
```

### 10.7 `v_requisitos_personal` — Perfil completo de requisitos por persona del personal

```sql
CREATE OR REPLACE VIEW v_requisitos_personal AS
SELECT
    p.Nombres || ' ' || p.Apellidos   AS Personal,
    r_rol.Nombre_Rol                  AS Rol,
    req.Nombre                        AS Requisito,
    req.Tipo,
    req.Obligatorio,
    COALESCE(pr.Cumplido, FALSE)      AS Cumplido,
    pr.Fecha_Cumplido,
    pr.Notas
FROM Personal_Sistema ps
JOIN  Personas p     ON ps.ID_Persona = p.ID_Persona
JOIN  Roles r_rol    ON ps.ID_Rol     = r_rol.ID_Rol
CROSS JOIN Requisitos req
LEFT JOIN  Personal_Requisitos pr
       ON  pr.ID_Personal  = ps.ID_Persona
       AND pr.ID_Requisito = req.ID_Requisito
WHERE req.Activo = TRUE
ORDER BY Personal, req.Tipo, req.Nombre;
```

### 10.8 `v_alertas_medicas_ninos` — Alertas médicas de niños (ordenadas por severidad)

```sql
CREATE OR REPLACE VIEW v_alertas_medicas_ninos AS
SELECT
    p.Nombres || ' ' || p.Apellidos   AS Nino,
    im.Tipo,
    im.Descripcion,
    im.Severidad,
    im.Instrucciones
FROM Info_Medica_Ninos im
JOIN Ninos   n ON im.ID_Nino    = n.ID_Persona
JOIN Personas p ON n.ID_Persona = p.ID_Persona
ORDER BY
    CASE im.Severidad WHEN 'Alta' THEN 1 WHEN 'Moderada' THEN 2 WHEN 'Leve' THEN 3 ELSE 4 END,
    CASE im.Tipo      WHEN 'Condicion' THEN 1 WHEN 'Alergia' THEN 2 WHEN 'Medicamento' THEN 3 END;
```

### 10.9 `v_cumpleanos_mes` — Cumpleaños de niños del mes en curso

```sql
CREATE OR REPLACE VIEW v_cumpleanos_mes AS
SELECT
    p.Nombres,
    p.Apellidos,
    p.Fecha_Nacimiento,
    EXTRACT(DAY FROM p.Fecha_Nacimiento) AS Dia_Cumpleanos
FROM Personas p
JOIN Ninos n ON p.ID_Persona = n.ID_Persona
WHERE EXTRACT(MONTH FROM p.Fecha_Nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY EXTRACT(DAY FROM p.Fecha_Nacimiento);
```

### 10.10 `v_eventos_mes` — Eventos del mes en curso

```sql
CREATE OR REPLACE VIEW v_eventos_mes AS
SELECT
    e.Fecha,
    e.Numero_Semana,
    t.Nombre                       AS Turno,
    e.Nombre                       AS Evento,
    e.Tipo,
    e.Descripcion
FROM Eventos e
LEFT JOIN Turnos t ON e.ID_Turno = t.ID_Turno
WHERE e.Activo = TRUE
  AND DATE_TRUNC('month', e.Fecha) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY e.Fecha, t.Hora_Inicio;
```

---

## 11. Resumen del Esquema v4

### 11.1 ENUMs (12)

`rol_nombre`, `ficha_estado`, `tipo_info_medica`, `severidad_medica`, `estado_llegada`, `estado_civil`, `estado_liderazgo`, `nombre_turno`, `tipo_evento`, `tipo_requisito`, `estado_solicitud`, `estado_asistencia_nino`

### 11.2 Tablas de Catálogo (CRUD + Activo)

`Roles`, `Grupos`, `Fichas`, `Turnos`, `Redes`, `Requisitos`

### 11.3 Tablas de Personas

`Personas` → `Ninos`, `Tutores`
`Tutores_Ninos` (M:N)

### 11.4 Tablas de Personal

`Personal_Sistema`
`Personal_Info_Personal` (1:1 — datos civiles)
`Personal_Info_Iglesia` (1:1 — datos eclesiásticos)
`Personal_Requisitos` (M:N — cursos y formación)
`Personal_Turnos` (M:N — turnos asignados)
`Personal_Grupos` (M:N — grupos por turno)

### 11.5 Flujo de Aprobación

`Solicitudes_Personal` (Borrador→Pendiente→Aprobado/Rechazado)
`Solicitudes_Requisitos` (requisitos declarados en solicitud)

### 11.6 Tablas Operativas

`Info_Medica_Ninos`
`Ninos_Grupos`
`Eventos`

### 11.7 Tablas de Asistencia

`Asistencia_Ninos` (estado Presente/Retirado, grupo auto-calculado, fichas, turnos, eventos)
`Asistencia_Maestros` (Razon_Ausencia obligatoria si Injustificado, turnos, eventos)

### 11.8 Triggers (6)

| Trigger | Función |
|---|---|
| `trg_nino_fecha_nac` | Fecha_Nacimiento obligatoria en Ninos |
| `trg_autoasignar_grupo_asistencia` | Calcula grupo por edad al registrar asistencia |
| `trg_validar_retiro_nino` | Autorización (quien ingresó o tutor registrado) |
| `trg_validar_requisitos_solicitud` | Requisitos obligatorios antes de enviar solicitud |
| `trg_validar_autorizacion_staff` | Jerarquía al crear Personal |
| `trg_propagar_datos_solicitud` | Copia datos al aprobar solicitud → tablas de perfil |

### 11.9 Vistas (10)

`v_ninos_presentes`, `v_asistencia_mensual_ninos`, `v_comparativa_mensual`, `v_inasistencias_personal`, `v_cumplimiento_personal`, `v_solicitudes_pendientes`, `v_requisitos_personal`, `v_alertas_medicas_ninos`, `v_cumpleanos_mes`, `v_eventos_mes`

---

> **Documento generado bajo metodología Spec-Driven Development (SDD).**
> **Versión 2.0 — Esquema v4.**
> Toda implementación de backend y frontend debe derivarse de esta especificación como fuente de verdad.
