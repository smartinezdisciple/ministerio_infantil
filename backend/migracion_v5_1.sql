-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.1 — Sistema Hosanna Infantil
-- Basado en Planificacion_bd_v5_1.md §6.1, §6.2, §6.3, §6.4
-- Ejecutar completo en UNA sola transacción en PostgreSQL.
-- PREREQUISITO: esquema v4 ya aplicado.
-- ============================================================

BEGIN;

-- ============================================================
-- §6.1 — ENUMs NUEVOS Y MODIFICADOS
-- ============================================================

-- Sexo
DO $$ BEGIN
  CREATE TYPE tipo_sexo AS ENUM ('Masculino', 'Femenino', 'Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tipo de teléfono (sin 'Whatsapp' — ahora es columna booleana)
DO $$ BEGIN
  CREATE TYPE tipo_telefono AS ENUM ('Casa', 'Oficina', 'Claro', 'Movistar', 'Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tipo de dirección
DO $$ BEGIN
  CREATE TYPE tipo_direccion AS ENUM ('Residencial', 'Laboral', 'Referencia', 'Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Nivel académico
DO $$ BEGIN
  CREATE TYPE nivel_academico AS ENUM (
    'Primaria', 'Secundaria', 'Nivel_Tecnico', 'Licenciatura',
    'Ingenieria', 'Postgrado', 'Maestria', 'Doctorado', 'Otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tipo de relación familiar entre personas
DO $$ BEGIN
  CREATE TYPE tipo_relacion_persona AS ENUM ('Conyuge', 'Familiar', 'Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Precisión de fechas parciales
DO $$ BEGIN
  CREATE TYPE tipo_precision_fecha AS ENUM ('Dia', 'Mes', 'Ano');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Estado formativo/espiritual — reemplaza estado_liderazgo ('Gap','Lider','Mentor')
DO $$ BEGIN
  CREATE TYPE estado_operativo AS ENUM ('Lider', 'En_Formacion');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Categoría de motivo de suspensión
DO $$ BEGIN
  CREATE TYPE categoria_motivo_suspension AS ENUM (
    'Conducta', 'Enfermedad', 'Personal', 'Disciplina', 'Otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Estado de solicitud (sin 'Borrador' — flujo simplificado)
DO $$ BEGIN
  CREATE TYPE estado_solicitud AS ENUM ('Pendiente', 'Aprobado', 'Rechazado', 'En_Revision');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tipo de expediente para niños
DO $$ BEGIN
  CREATE TYPE tipo_expediente_nino AS ENUM ('Conducta', 'Incidente', 'Observacion', 'Medico');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tipo de evaluación de personal
DO $$ BEGIN
  CREATE TYPE tipo_evaluacion AS ENUM ('Desempeno', 'Formacion', 'Conducta', 'Ascenso', 'Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Resultado de evaluación
DO $$ BEGIN
  CREATE TYPE tipo_resultado_evaluacion AS ENUM ('Satisfactorio', 'En_Proceso', 'Insatisfactorio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
-- === SPLIT ===
-- Ampliar ENUM estado_civil con 5 nuevos valores (ADD VALUE es seguro en PostgreSQL)
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Union_Libre';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Segundo_Matrimonio';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Separado';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Madre_Soltera';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Padre_Soltero';
-- === SPLIT ===
BEGIN;


-- ============================================================
-- §6.2 — NUEVAS TABLAS
-- ============================================================

-- Función universal de auditoría updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.Actualizado_En = NOW();
    RETURN NEW;
END;
$$;

-- ── Telefonos_Personas ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Telefonos_Personas (
    ID_Telefono     SERIAL        PRIMARY KEY,
    ID_Persona      INT           NOT NULL
                                      REFERENCES Personas(ID_Persona) ON DELETE CASCADE,
    Tipo            tipo_telefono NOT NULL DEFAULT 'Otro',
    Numero          VARCHAR(20)   NOT NULL,
    Tiene_Whatsapp  BOOLEAN       NOT NULL DEFAULT FALSE,
    Es_Principal    BOOLEAN       NOT NULL DEFAULT FALSE,
    Activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    Creado_En       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    Actualizado_En  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_telefonos_persona ON Telefonos_Personas (ID_Persona);
CREATE UNIQUE INDEX IF NOT EXISTS uq_un_principal_activo
    ON Telefonos_Personas (ID_Persona)
    WHERE Es_Principal = TRUE AND Activo = TRUE;

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_telefonos ON Telefonos_Personas;
CREATE TRIGGER trg_auditoria_updated_at_telefonos
    BEFORE UPDATE ON Telefonos_Personas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ── Personas_Direcciones ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS Personas_Direcciones (
    ID_Direccion         SERIAL         PRIMARY KEY,
    ID_Persona           INT            NOT NULL
                                             REFERENCES Personas(ID_Persona) ON DELETE CASCADE,
    Tipo_Direccion       tipo_direccion NOT NULL DEFAULT 'Residencial',
    Ciudad_Departamento  VARCHAR(60),
    Municipio            VARCHAR(60),
    Distrito             VARCHAR(60),
    Barrio               VARCHAR(60),
    Direccion_Exacta     TEXT,
    Es_Principal         BOOLEAN        NOT NULL DEFAULT TRUE,
    Activo               BOOLEAN        NOT NULL DEFAULT TRUE,
    Creado_En            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    Actualizado_En       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_direcciones_persona ON Personas_Direcciones (ID_Persona);
CREATE UNIQUE INDEX IF NOT EXISTS uq_una_dir_principal
    ON Personas_Direcciones (ID_Persona)
    WHERE Es_Principal = TRUE AND Activo = TRUE;

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_direcciones ON Personas_Direcciones;
CREATE TRIGGER trg_auditoria_updated_at_direcciones
    BEFORE UPDATE ON Personas_Direcciones
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ── Relaciones_Personas ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS Relaciones_Personas (
    ID_Persona_A      INT                   NOT NULL
                                                REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    ID_Persona_B      INT                   NOT NULL
                                                REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Tipo_Relacion     tipo_relacion_persona NOT NULL,
    Datos_Adicionales JSONB,
    Fecha_Inicio      DATE,
    Fecha_Fin         DATE,
    Activo            BOOLEAN               NOT NULL DEFAULT TRUE,
    Creado_En         TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    Actualizado_En    TIMESTAMPTZ,
    PRIMARY KEY (ID_Persona_A, ID_Persona_B, Tipo_Relacion),
    CONSTRAINT chk_no_autorelacion CHECK (ID_Persona_A <> ID_Persona_B),
    CONSTRAINT chk_relacion_fechas CHECK (Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio)
);

CREATE INDEX IF NOT EXISTS idx_relaciones_a ON Relaciones_Personas (ID_Persona_A);
CREATE INDEX IF NOT EXISTS idx_relaciones_b ON Relaciones_Personas (ID_Persona_B);

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_relaciones ON Relaciones_Personas;
CREATE TRIGGER trg_auditoria_updated_at_relaciones
    BEFORE UPDATE ON Relaciones_Personas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Helper bidireccional para cónyuge
CREATE OR REPLACE FUNCTION fn_registrar_conyuge(
    p_id_a              INT,
    p_id_b              INT,
    p_datos_adicionales JSONB DEFAULT NULL,
    p_fecha_inicio      DATE  DEFAULT CURRENT_DATE
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE Relaciones_Personas
    SET    Fecha_Fin      = CURRENT_DATE,
           Activo         = FALSE,
           Actualizado_En = NOW()
    WHERE  ID_Persona_A   = p_id_a
      AND  ID_Persona_B  <> p_id_b
      AND  Tipo_Relacion  = 'Conyuge'
      AND  Fecha_Fin IS NULL
      AND  Activo = TRUE;

    UPDATE Relaciones_Personas
    SET    Fecha_Fin      = CURRENT_DATE,
           Activo         = FALSE,
           Actualizado_En = NOW()
    WHERE  ID_Persona_A   = p_id_b
      AND  ID_Persona_B  <> p_id_a
      AND  Tipo_Relacion  = 'Conyuge'
      AND  Fecha_Fin IS NULL
      AND  Activo = TRUE;

    INSERT INTO Relaciones_Personas
        (ID_Persona_A, ID_Persona_B, Tipo_Relacion, Datos_Adicionales, Fecha_Inicio)
    VALUES (p_id_a, p_id_b, 'Conyuge', p_datos_adicionales, p_fecha_inicio)
    ON CONFLICT (ID_Persona_A, ID_Persona_B, Tipo_Relacion)
        DO UPDATE SET Datos_Adicionales = EXCLUDED.Datos_Adicionales,
                      Fecha_Inicio      = EXCLUDED.Fecha_Inicio,
                      Fecha_Fin         = NULL,
                      Activo            = TRUE,
                      Actualizado_En    = NOW();

    INSERT INTO Relaciones_Personas
        (ID_Persona_A, ID_Persona_B, Tipo_Relacion, Datos_Adicionales, Fecha_Inicio)
    VALUES (p_id_b, p_id_a, 'Conyuge', p_datos_adicionales, p_fecha_inicio)
    ON CONFLICT (ID_Persona_A, ID_Persona_B, Tipo_Relacion)
        DO UPDATE SET Datos_Adicionales = EXCLUDED.Datos_Adicionales,
                      Fecha_Inicio      = EXCLUDED.Fecha_Inicio,
                      Fecha_Fin         = NULL,
                      Activo            = TRUE,
                      Actualizado_En    = NOW();
END;
$$;


-- ── Personal_Lideres ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Personal_Lideres (
    ID_Lider    SERIAL  PRIMARY KEY,
    ID_Persona  INT     NOT NULL
                            REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Activo      BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_lider_persona UNIQUE (ID_Persona)
);

CREATE INDEX IF NOT EXISTS idx_lideres_activo ON Personal_Lideres (Activo) WHERE Activo = TRUE;


-- ── Circulos_Amistad ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Circulos_Amistad (
    ID_Circulo   SERIAL       PRIMARY KEY,
    Nombre       VARCHAR(100) NOT NULL,
    Descripcion  TEXT,
    Activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    Creado_En    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_circulo_nombre UNIQUE (Nombre)
);

CREATE INDEX IF NOT EXISTS idx_circulos_activo ON Circulos_Amistad (Activo) WHERE Activo = TRUE;


-- ── Personal_Historial_Lideres ────────────────────────────────
CREATE TABLE IF NOT EXISTS Personal_Historial_Lideres (
    ID_Historial       SERIAL      PRIMARY KEY,
    ID_Personal        INT         NOT NULL
                                       REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Lider_Anterior  INT         REFERENCES Personal_Lideres(ID_Lider),
    ID_Lider_Nuevo     INT         REFERENCES Personal_Lideres(ID_Lider),
    Fecha_Cambio       DATE        NOT NULL DEFAULT CURRENT_DATE,
    ID_Registrado_Por  INT         NOT NULL
                                       REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas              TEXT,
    Creado_En          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_lideres_personal
    ON Personal_Historial_Lideres (ID_Personal, Fecha_Cambio DESC);

CREATE OR REPLACE FUNCTION fn_auditoria_cambio_lider()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_registrador INT;
BEGIN
    IF OLD.ID_Lider IS DISTINCT FROM NEW.ID_Lider THEN
        v_registrador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_registrador IS NULL THEN
            RAISE EXCEPTION
                'app.id_autorizador no está definido en la sesión. '
                'Usar SET LOCAL app.id_autorizador = <id> antes del UPDATE.';
        END IF;
        INSERT INTO Personal_Historial_Lideres
            (ID_Personal, ID_Lider_Anterior, ID_Lider_Nuevo, ID_Registrado_Por)
        VALUES
            (NEW.ID_Persona, OLD.ID_Lider, NEW.ID_Lider, v_registrador);
    END IF;
    RETURN NEW;
END;
$$;



-- ── Solicitudes_Historial_Estado ──────────────────────────────
CREATE TABLE IF NOT EXISTS Solicitudes_Historial_Estado (
    ID_Historial     SERIAL          PRIMARY KEY,
    ID_Solicitud     INT             NOT NULL
                                         REFERENCES Solicitudes_Personal(ID_Solicitud) ON DELETE RESTRICT,
    Estado_Anterior  estado_solicitud,
    Estado_Nuevo     estado_solicitud NOT NULL,
    Fecha_Cambio     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ID_Cambiado_Por  INT             NOT NULL
                                         REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas            TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_estado_solicitud
    ON Solicitudes_Historial_Estado (ID_Solicitud, Fecha_Cambio DESC);

CREATE OR REPLACE FUNCTION fn_auditoria_cambio_estado_solicitud()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_responsable INT;
BEGIN
    IF OLD.Estado IS DISTINCT FROM NEW.Estado THEN
        v_responsable := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_responsable IS NULL THEN
            RAISE EXCEPTION
                'app.id_autorizador no está definido en la sesión. '
                'Usar SET LOCAL app.id_autorizador = <id> antes del UPDATE.';
        END IF;
        INSERT INTO Solicitudes_Historial_Estado
            (ID_Solicitud, Estado_Anterior, Estado_Nuevo, ID_Cambiado_Por)
        VALUES
            (NEW.ID_Solicitud, OLD.Estado, NEW.Estado, v_responsable);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditoria_cambio_estado_solicitud ON Solicitudes_Personal;
CREATE TRIGGER trg_auditoria_cambio_estado_solicitud
    AFTER UPDATE OF Estado ON Solicitudes_Personal
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_estado_solicitud();


-- ── Personal_Historial_Roles ──────────────────────────────────
CREATE TABLE IF NOT EXISTS Personal_Historial_Roles (
    ID_Historial      SERIAL  PRIMARY KEY,
    ID_Personal       INT     NOT NULL
                                  REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Rol_Anterior   INT     REFERENCES Roles(ID_Rol),
    ID_Rol_Nuevo      INT     NOT NULL REFERENCES Roles(ID_Rol),
    Fecha_Cambio      DATE    NOT NULL DEFAULT CURRENT_DATE,
    ID_Autorizado_Por INT     NOT NULL
                                  REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas             TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_personal
    ON Personal_Historial_Roles (ID_Personal, Fecha_Cambio DESC);

CREATE OR REPLACE FUNCTION fn_auditoria_cambio_rol()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    IF OLD.ID_Rol IS DISTINCT FROM NEW.ID_Rol THEN
        v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_autorizador IS NULL THEN
            RAISE EXCEPTION
                'app.id_autorizador no está definido en la sesión. '
                'Usar SET LOCAL app.id_autorizador = <id_coordinador> antes del UPDATE de ID_Rol.';
        END IF;
        INSERT INTO Personal_Historial_Roles
            (ID_Personal, ID_Rol_Anterior, ID_Rol_Nuevo, ID_Autorizado_Por)
        VALUES
            (NEW.ID_Persona, OLD.ID_Rol, NEW.ID_Rol, v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditoria_cambio_rol ON Personal_Sistema;
CREATE TRIGGER trg_auditoria_cambio_rol
    AFTER UPDATE OF ID_Rol ON Personal_Sistema
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_rol();


-- ── Personal_Suspensiones_Servicio ────────────────────────────
CREATE TABLE IF NOT EXISTS Personal_Suspensiones_Servicio (
    ID_Suspension      SERIAL                       PRIMARY KEY,
    ID_Personal        INT                          NOT NULL
                                                        REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Fecha_Inicio       DATE                         NOT NULL DEFAULT CURRENT_DATE,
    Fecha_Fin          DATE,
    Categoria_Motivo   categoria_motivo_suspension  NOT NULL DEFAULT 'Otro',
    Motivo             TEXT                         NOT NULL,
    ID_Registrado_Por  INT                          NOT NULL
                                                        REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Activo             BOOLEAN                      NOT NULL DEFAULT TRUE,
    Creado_En          TIMESTAMPTZ                  NOT NULL DEFAULT NOW(),
    Actualizado_En     TIMESTAMPTZ,
    CONSTRAINT chk_suspension_fechas
        CHECK (Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio)
);

CREATE INDEX IF NOT EXISTS idx_suspensiones_personal
    ON Personal_Suspensiones_Servicio (ID_Personal, Activo, Fecha_Inicio, Fecha_Fin);

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_suspensiones ON Personal_Suspensiones_Servicio;
CREATE TRIGGER trg_auditoria_updated_at_suspensiones
    BEFORE UPDATE ON Personal_Suspensiones_Servicio
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_validar_suspension()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT (SELECT Activo FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Personal) THEN
        RAISE EXCEPTION
            'No se puede suspender al personal inactivo (ID: %). Usar Soft Delete es suficiente.',
            NEW.ID_Personal;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_suspension ON Personal_Suspensiones_Servicio;
CREATE TRIGGER trg_validar_suspension
    BEFORE INSERT ON Personal_Suspensiones_Servicio
    FOR EACH ROW EXECUTE FUNCTION fn_validar_suspension();


-- ── Ninos_Expedientes_Conducta ────────────────────────────────
CREATE TABLE IF NOT EXISTS Ninos_Expedientes_Conducta (
    ID_Expediente    SERIAL               PRIMARY KEY,
    ID_Nino          INT                  NOT NULL
                                              REFERENCES Ninos(ID_Persona) ON DELETE RESTRICT,
    Fecha            DATE                 NOT NULL DEFAULT CURRENT_DATE,
    ID_Turno         INT                  REFERENCES Turnos(ID_Turno),
    ID_Evento        INT                  REFERENCES Eventos(ID_Evento),
    Tipo             tipo_expediente_nino NOT NULL DEFAULT 'Observacion',
    Descripcion      TEXT                 NOT NULL,
    ID_Reportado_Por INT                  NOT NULL
                                              REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Resuelto         BOOLEAN              NOT NULL DEFAULT FALSE,
    Notas_Resolucion TEXT,
    Creado_En        TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expediente_nino  ON Ninos_Expedientes_Conducta (ID_Nino, Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_expediente_tipo  ON Ninos_Expedientes_Conducta (Tipo, Resuelto);
CREATE INDEX IF NOT EXISTS idx_expediente_nino_activo
    ON Ninos_Expedientes_Conducta (ID_Nino, Resuelto) WHERE Resuelto = FALSE;


-- ── Personal_Expedientes_Evaluacion ──────────────────────────
CREATE TABLE IF NOT EXISTS Personal_Expedientes_Evaluacion (
    ID_Evaluacion  SERIAL                   PRIMARY KEY,
    ID_Personal    INT                      NOT NULL
                                                REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Fecha          DATE                     NOT NULL DEFAULT CURRENT_DATE,
    Tipo           tipo_evaluacion          NOT NULL DEFAULT 'Desempeno',
    Descripcion    TEXT                     NOT NULL,
    Resultado      tipo_resultado_evaluacion,
    ID_Evaluador   INT                      NOT NULL
                                                REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas          TEXT,
    Creado_En      TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluacion_personal
    ON Personal_Expedientes_Evaluacion (ID_Personal, Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_evaluacion_tipo
    ON Personal_Expedientes_Evaluacion (Tipo, Resultado);


-- Trigger bcrypt en Personal_Sistema
CREATE OR REPLACE FUNCTION fn_validar_hash_bcrypt()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Password_Hash IS NOT NULL
       AND NEW.Password_Hash NOT SIMILAR TO '\$2[aby]\$%' THEN
        RAISE EXCEPTION
            'Password_Hash debe ser un hash bcrypt válido ($2a$, $2b$ o $2y$). '
            'Nunca almacenar contraseñas en texto plano.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_hash_bcrypt ON Personal_Sistema;
CREATE TRIGGER trg_validar_hash_bcrypt
    BEFORE INSERT OR UPDATE OF Password_Hash ON Personal_Sistema
    FOR EACH ROW EXECUTE FUNCTION fn_validar_hash_bcrypt();


-- ============================================================
-- §6.3 — ALTER TABLE EN TABLAS EXISTENTES
-- ============================================================

-- A: Personas — campos de identidad + índices funcionales
ALTER TABLE Personas
    ADD COLUMN IF NOT EXISTS Sexo   tipo_sexo   DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Cedula VARCHAR(20) DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_personas_cedula
    ON Personas (Cedula) WHERE Cedula IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personas_mes_nac
    ON Personas (EXTRACT(MONTH FROM Fecha_Nacimiento))
    WHERE Fecha_Nacimiento IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personas_dia_nac
    ON Personas (EXTRACT(DAY FROM Fecha_Nacimiento))
    WHERE Fecha_Nacimiento IS NOT NULL;

-- Migrar Personas.Telefono → Telefonos_Personas (preservar datos existentes)
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT ID_Persona, 'Casa', Telefono, TRUE
FROM   Personas
WHERE  Telefono IS NOT NULL
ON CONFLICT DO NOTHING;
-- ALTER TABLE Personas DROP COLUMN Telefono;  -- Ejecutar manualmente tras validar


-- B: Personal_Info_Personal — bloque familiar/laboral
ALTER TABLE Personal_Info_Personal
    ADD COLUMN IF NOT EXISTS Ocupacion       VARCHAR(150)    DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Centro_Laboral  VARCHAR(150)    DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Nivel_Academico nivel_academico DEFAULT NULL;

-- Migrar Direccion → Personas_Direcciones
INSERT INTO Personas_Direcciones (ID_Persona, Direccion_Exacta, Es_Principal)
SELECT pip.ID_Persona, pip.Direccion, TRUE
FROM   Personal_Info_Personal pip
WHERE  pip.Direccion IS NOT NULL
ON CONFLICT DO NOTHING;
-- ALTER TABLE Personal_Info_Personal DROP COLUMN Direccion;  -- Ejecutar tras validar

-- Actualizar constraint de cónyuge para nuevos estados civiles
ALTER TABLE Personal_Info_Personal DROP CONSTRAINT IF EXISTS chk_conyuge;
ALTER TABLE Personal_Info_Personal
    ADD CONSTRAINT chk_conyuge
        CHECK (
            Estado_Civil NOT IN
                ('Casado','Acompañado','Union_Libre','Segundo_Matrimonio')
            OR Nombre_Conyuge IS NOT NULL
        );


-- C: Personal_Info_Iglesia — bloque eclesiástico ampliado
-- Paso 1: añadir Estado_Operativo (nuevo)
ALTER TABLE Personal_Info_Iglesia
    ADD COLUMN IF NOT EXISTS Estado_Operativo estado_operativo DEFAULT NULL;

-- Paso 2: migrar datos de Estado_Liderazgo → Estado_Operativo
UPDATE Personal_Info_Iglesia
SET Estado_Operativo =
    CASE Estado_Liderazgo
        WHEN 'Lider'   THEN 'Lider'::estado_operativo
        WHEN 'Gap'     THEN 'En_Formacion'::estado_operativo
        WHEN 'Mentor'  THEN 'Lider'::estado_operativo
        ELSE NULL
    END
WHERE Estado_Liderazgo IS NOT NULL;
-- ALTER TABLE Personal_Info_Iglesia DROP COLUMN Estado_Liderazgo;  -- Ejecutar tras validar

-- Paso 3: nuevas columnas de bautismo, círculo, experiencia docente y líder
ALTER TABLE Personal_Info_Iglesia
    ADD COLUMN IF NOT EXISTS Bautizado_Agua             BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo             DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo_Precision   tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ID_Circulo                 INT                  DEFAULT NULL
                                                            REFERENCES Circulos_Amistad(ID_Circulo)
                                                            ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Desde      DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Precision  tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Ninos      BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Detalle    TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Capacitacion_Ensenanza     BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Capacitacion_Detalle       TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Observaciones_Espirituales TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ID_Lider                   INT                  DEFAULT NULL
                                                            REFERENCES Personal_Lideres(ID_Lider)
                                                            ON DELETE SET NULL;

-- Migrar Circulo_Amistad VARCHAR → catálogo Circulos_Amistad
INSERT INTO Circulos_Amistad (Nombre)
SELECT DISTINCT TRIM(Circulo_Amistad)
FROM   Personal_Info_Iglesia
WHERE  Circulo_Amistad IS NOT NULL AND TRIM(Circulo_Amistad) <> ''
ON CONFLICT (Nombre) DO NOTHING;

UPDATE Personal_Info_Iglesia pii
SET    ID_Circulo = ca.ID_Circulo
FROM   Circulos_Amistad ca
WHERE  TRIM(pii.Circulo_Amistad) = ca.Nombre
  AND  pii.Circulo_Amistad IS NOT NULL;
-- ALTER TABLE Personal_Info_Iglesia DROP COLUMN Circulo_Amistad;  -- Ejecutar tras validar

-- Constraints de integridad para nuevas columnas
ALTER TABLE Personal_Info_Iglesia
    DROP CONSTRAINT IF EXISTS chk_bautismo_precision,
    DROP CONSTRAINT IF EXISTS chk_circulo_precision,
    DROP CONSTRAINT IF EXISTS chk_clases_detalle,
    DROP CONSTRAINT IF EXISTS chk_capacitacion_detalle;

ALTER TABLE Personal_Info_Iglesia
    ADD CONSTRAINT chk_bautismo_precision
        CHECK (Fecha_Bautismo IS NULL OR Fecha_Bautismo_Precision IS NOT NULL),
    ADD CONSTRAINT chk_circulo_precision
        CHECK (Circulo_Amistad_Desde IS NULL OR Circulo_Amistad_Precision IS NOT NULL),
    ADD CONSTRAINT chk_clases_detalle
        CHECK (Clases_Biblicas_Ninos = FALSE OR Clases_Biblicas_Detalle IS NOT NULL),
    ADD CONSTRAINT chk_capacitacion_detalle
        CHECK (Capacitacion_Ensenanza = FALSE OR Capacitacion_Detalle IS NOT NULL);

DROP TRIGGER IF EXISTS trg_auditoria_cambio_lider ON Personal_Info_Iglesia;
CREATE TRIGGER trg_auditoria_cambio_lider
    AFTER UPDATE OF ID_Lider ON Personal_Info_Iglesia
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_lider();


-- Agregar columna Activo a Ninos_Grupos si no existe (necesaria para protocolo de transición §10.5)
ALTER TABLE Ninos_Grupos
    ADD COLUMN IF NOT EXISTS Activo BOOLEAN NOT NULL DEFAULT TRUE;


-- D: Solicitudes_Personal — snapshot completo del formulario v5.1
-- Nota: Se elimina 'Borrador' del flujo. La columna Estado existente puede
-- tener valores 'Borrador'; se migran a 'Pendiente' antes de modificar el tipo.
UPDATE Solicitudes_Personal SET Estado = 'Pendiente' WHERE Estado = 'Borrador';

ALTER TABLE Solicitudes_Personal
    ADD COLUMN IF NOT EXISTS Sexo_Candidato              tipo_sexo            DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Cedula_Candidato            VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Ocupacion_Candidato         VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Centro_Laboral_Candidato    VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Nivel_Academico_Candidato   nivel_academico      DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Ciudad                  VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Municipio               VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Distrito                VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Barrio                  VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Exacta                  TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Casa                    VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Oficina                 VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Claro                   VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Movistar                VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Conyuge_Ocupacion           VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Conyuge_Centro_Laboral      VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Bautizado_Agua              BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo              DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo_Precision    tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Desde       DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Precision   tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Ninos       BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Detalle     TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Capacitacion_Ensenanza      BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Capacitacion_Detalle        TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Observaciones_Espirituales_Sol TEXT              DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Estado_Operativo_Candidato  estado_operativo     DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ID_Lider_Propuesto          INT                  DEFAULT NULL
                                                             REFERENCES Personal_Lideres(ID_Lider)
                                                             ON DELETE SET NULL;

-- Actualizar constraint de cónyuge en Solicitudes_Personal
ALTER TABLE Solicitudes_Personal DROP CONSTRAINT IF EXISTS chk_sol_conyuge;
ALTER TABLE Solicitudes_Personal
    ADD CONSTRAINT chk_sol_conyuge
        CHECK (
            Estado_Civil IS NULL
            OR Estado_Civil NOT IN ('Casado','Acompañado','Union_Libre','Segundo_Matrimonio')
            OR Nombre_Conyuge IS NOT NULL
        );


-- E: fn_propagar_datos_solicitud_aprobada — versión v5.1 completa
CREATE OR REPLACE FUNCTION fn_propagar_datos_solicitud_aprobada()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Estado = 'Aprobado' AND OLD.Estado = 'Pendiente' THEN

        -- Identidad en Personas
        UPDATE Personas
        SET
            Sexo   = COALESCE(Personas.Sexo,   NEW.Sexo_Candidato),
            Cedula = COALESCE(Personas.Cedula,  NEW.Cedula_Candidato)
        WHERE ID_Persona = NEW.ID_Persona;

        -- Teléfonos del snapshot
        INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
        SELECT NEW.ID_Persona,
               tipo,
               numero,
               (ROW_NUMBER() OVER (ORDER BY orden) = 1) AS Es_Principal
        FROM (VALUES
            (1, 'Casa'::tipo_telefono,     NEW.Tel_Casa),
            (2, 'Oficina'::tipo_telefono,  NEW.Tel_Oficina),
            (3, 'Claro'::tipo_telefono,    NEW.Tel_Claro),
            (4, 'Movistar'::tipo_telefono, NEW.Tel_Movistar)
        ) AS t(orden, tipo, numero)
        WHERE numero IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Dirección estructurada
        INSERT INTO Personas_Direcciones (
            ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio,
            Distrito, Barrio, Direccion_Exacta, Es_Principal)
        SELECT NEW.ID_Persona,
               'Residencial',
               NEW.Dir_Ciudad, NEW.Dir_Municipio,
               NEW.Dir_Distrito, NEW.Dir_Barrio,
               NEW.Dir_Exacta, TRUE
        WHERE  NEW.Dir_Exacta IS NOT NULL OR NEW.Dir_Ciudad IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Personal_Info_Personal
        INSERT INTO Personal_Info_Personal (
            ID_Persona, Estado_Civil, Nombre_Conyuge,
            Tiene_Hijos, Numero_Hijos, Direccion,
            Ocupacion, Centro_Laboral, Nivel_Academico)
        SELECT ps.ID_Persona,
               NEW.Estado_Civil, NEW.Nombre_Conyuge,
               NEW.Tiene_Hijos, NEW.Numero_Hijos,
               NEW.Dir_Exacta,
               NEW.Ocupacion_Candidato,
               NEW.Centro_Laboral_Candidato,
               NEW.Nivel_Academico_Candidato
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        -- Personal_Info_Iglesia
        INSERT INTO Personal_Info_Iglesia (
            ID_Persona, ID_Red, Estado_Operativo, ID_Lider,
            ID_Circulo, Tiempo_Iglesia_Meses, Ministerio_Adicional,
            Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
            Circulo_Amistad_Desde, Circulo_Amistad_Precision,
            Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
            Capacitacion_Ensenanza, Capacitacion_Detalle,
            Observaciones_Espirituales)
        SELECT ps.ID_Persona,
               NEW.ID_Red,
               NEW.Estado_Operativo_Candidato,
               NEW.ID_Lider_Propuesto,
               (SELECT ID_Circulo FROM Circulos_Amistad
                WHERE TRIM(Nombre) = TRIM(NEW.Circulo_Amistad) LIMIT 1),
               NEW.Tiempo_Iglesia_Meses,
               NEW.Ministerio_Adicional,
               NEW.Bautizado_Agua,
               NEW.Fecha_Bautismo,
               NEW.Fecha_Bautismo_Precision,
               NEW.Circulo_Amistad_Desde,
               NEW.Circulo_Amistad_Precision,
               NEW.Clases_Biblicas_Ninos,
               NEW.Clases_Biblicas_Detalle,
               NEW.Capacitacion_Ensenanza,
               NEW.Capacitacion_Detalle,
               NEW.Observaciones_Espirituales_Sol
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        -- Requisitos
        INSERT INTO Personal_Requisitos
            (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido, Notas)
        SELECT ps.ID_Persona,
               sr.ID_Requisito, sr.Cumplido,
               sr.Fecha_Cumplido, sr.Notas
        FROM Solicitudes_Requisitos sr
        JOIN Personal_Sistema ps
          ON ps.ID_Persona = NEW.ID_Persona
         AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Personal, ID_Requisito) DO NOTHING;

    END IF;
    RETURN NEW;
END;
$$;
-- El trigger trg_propagar_datos_solicitud ya existe y apunta a la función redefinida.


-- ============================================================
-- §6.4 — VISTAS OPERATIVAS Y PREDICTIVAS
-- ============================================================

-- v_personal_disponible_servicio
CREATE OR REPLACE VIEW v_personal_disponible_servicio AS
SELECT
    ps.ID_Persona,
    p.Nombres || ' ' || p.Apellidos   AS Nombre_Completo,
    r.Nombre_Rol                       AS Rol,
    ps.Fecha_Ingreso_Servicio
FROM Personal_Sistema ps
JOIN Personas p ON ps.ID_Persona = p.ID_Persona
JOIN Roles    r ON ps.ID_Rol     = r.ID_Rol
WHERE ps.Activo = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM Personal_Suspensiones_Servicio pss
      WHERE pss.ID_Personal   = ps.ID_Persona
        AND pss.Activo        = TRUE
        AND pss.Fecha_Inicio  <= CURRENT_DATE
        AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin >= CURRENT_DATE)
  )
ORDER BY r.Nivel_Jerarquico DESC, p.Apellidos, p.Nombres;


-- v_ninos_graduacion_mes
CREATE OR REPLACE VIEW v_ninos_graduacion_mes AS
SELECT
    p.Nombres,
    p.Apellidos,
    p.Fecha_Nacimiento,
    EXTRACT(MONTH FROM p.Fecha_Nacimiento)::INT   AS Mes_Cumpleanos,
    EXTRACT(DAY   FROM p.Fecha_Nacimiento)::INT   AS Dia_Cumpleanos,
    g.Nombre                                       AS Grupo_Actual,
    (DATE_TRUNC('year', CURRENT_DATE)
        + (EXTRACT(MONTH FROM p.Fecha_Nacimiento) - 1 || ' months')::INTERVAL
        + (EXTRACT(DAY   FROM p.Fecha_Nacimiento) - 1 || ' days')::INTERVAL
    )::DATE                                        AS Fecha_Graduacion_Este_Anio,
    CASE
        WHEN (DATE_TRUNC('year', CURRENT_DATE)
            + (EXTRACT(MONTH FROM p.Fecha_Nacimiento) - 1 || ' months')::INTERVAL
            + (EXTRACT(DAY   FROM p.Fecha_Nacimiento) - 1 || ' days')::INTERVAL
            )::DATE < CURRENT_DATE
        THEN TRUE
        ELSE FALSE
    END                                            AS Ya_Graduo_Este_Anio
FROM Personas p
JOIN Ninos n ON p.ID_Persona = n.ID_Persona
LEFT JOIN LATERAL (
    SELECT g2.Nombre
    FROM Ninos_Grupos ng
    JOIN Grupos g2 ON ng.ID_Grupo = g2.ID_Grupo
    WHERE ng.ID_Nino = n.ID_Persona
    ORDER BY ng.Fecha_Asignacion DESC
    LIMIT 1
) g ON TRUE
WHERE p.Fecha_Nacimiento BETWEEN
    MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT - 13, 1,  1)
    AND
    MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT - 13, 12, 31)
ORDER BY Mes_Cumpleanos, Dia_Cumpleanos;


-- v_ninos_transicion_grupo_mes
CREATE OR REPLACE VIEW v_ninos_transicion_grupo_mes AS
WITH edad_calculada AS (
    SELECT
        p.ID_Persona,
        p.Nombres,
        p.Apellidos,
        p.Fecha_Nacimiento,
        DATE_PART('year',
            AGE(DATE_TRUNC('month', CURRENT_DATE)::DATE, p.Fecha_Nacimiento)
        )::INT AS Edad_Este_Mes
    FROM Personas p
    JOIN Ninos n ON p.ID_Persona = n.ID_Persona
    WHERE p.Fecha_Nacimiento BETWEEN
        (CURRENT_DATE - INTERVAL '13 years')::DATE
        AND
        (CURRENT_DATE - INTERVAL '2 years')::DATE
),
grupo_asignado AS (
    SELECT DISTINCT ON (ng.ID_Nino)
        ng.ID_Nino,
        ng.ID_Grupo                     AS ID_Grupo_Actual,
        g.Nombre                        AS Nombre_Grupo_Actual,
        g.Edad_Minima,
        g.Edad_Maxima
    FROM Ninos_Grupos ng
    JOIN Grupos g ON ng.ID_Grupo = g.ID_Grupo
    WHERE ng.Activo = TRUE
    ORDER BY ng.ID_Nino, ng.Fecha_Asignacion DESC
),
grupo_correcto AS (
    SELECT
        ec.ID_Persona,
        g.ID_Grupo                      AS ID_Grupo_Correcto,
        g.Nombre                        AS Nombre_Grupo_Correcto
    FROM edad_calculada ec
    JOIN Grupos g
      ON ec.Edad_Este_Mes >= g.Edad_Minima
     AND ec.Edad_Este_Mes <= g.Edad_Maxima
     AND g.Activo = TRUE
)
SELECT
    ec.ID_Persona,
    ec.Nombres,
    ec.Apellidos,
    ec.Fecha_Nacimiento,
    ec.Edad_Este_Mes,
    ga.Nombre_Grupo_Actual             AS Grupo_Actual,
    gc.Nombre_Grupo_Correcto           AS Grupo_Sugerido,
    CASE
        WHEN ga.ID_Grupo_Actual IS NULL          THEN 'Sin_Asignacion'
        WHEN gc.ID_Grupo_Correcto IS NULL        THEN 'Fuera_De_Rango'
        WHEN ga.ID_Grupo_Actual <> gc.ID_Grupo_Correcto THEN 'Debe_Transicionar'
        ELSE 'En_Grupo_Correcto'
    END                                AS Estado_Transicion
FROM edad_calculada ec
LEFT JOIN grupo_asignado ga ON ec.ID_Persona = ga.ID_Nino
LEFT JOIN grupo_correcto  gc ON ec.ID_Persona = gc.ID_Persona
WHERE
    ga.ID_Grupo_Actual IS NULL
    OR gc.ID_Grupo_Correcto IS NULL
    OR ga.ID_Grupo_Actual <> gc.ID_Grupo_Correcto
ORDER BY ec.Edad_Este_Mes DESC, ec.Apellidos;


-- v_perfil_completo_personal
CREATE OR REPLACE VIEW v_perfil_completo_personal AS
SELECT
    ps.ID_Persona,
    p.Nombres || ' ' || p.Apellidos    AS Nombre_Completo,
    p.Sexo,
    p.Cedula,
    p.Fecha_Nacimiento,
    DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT AS Edad,
    r.Nombre_Rol                        AS Rol,
    ps.Activo,
    pd.Ciudad_Departamento,
    pd.Municipio,
    pd.Distrito,
    pd.Barrio,
    pd.Direccion_Exacta,
    tp.Numero                           AS Telefono_Principal,
    tp.Tipo                             AS Tipo_Telefono_Principal,
    tp.Tiene_Whatsapp                   AS Principal_Tiene_Whatsapp,
    pip.Estado_Civil,
    pip.Nombre_Conyuge,
    pip.Tiene_Hijos,
    pip.Numero_Hijos,
    pip.Ocupacion,
    pip.Centro_Laboral,
    pip.Nivel_Academico,
    pii.Bautizado_Agua,
    pii.Fecha_Bautismo,
    pii.Estado_Operativo,
    rd.Nombre                           AS Red,
    ca.Nombre                           AS Circulo_Amistad,
    pii.Circulo_Amistad_Desde,
    pii.Tiempo_Iglesia_Meses,
    pii.Ministerio_Adicional,
    pii.Clases_Biblicas_Ninos,
    pii.Capacitacion_Ensenanza,
    pii.Observaciones_Espirituales,
    pl.ID_Lider,
    p_lider.Nombres || ' ' || p_lider.Apellidos AS Nombre_Lider,
    tp_lider.Numero                     AS Tel_Lider,
    CASE WHEN sus.ID_Suspension IS NOT NULL THEN TRUE ELSE FALSE END AS En_Suspension,
    sus.Fecha_Inicio                    AS Suspension_Desde,
    sus.Fecha_Fin                       AS Suspension_Hasta,
    sus.Categoria_Motivo                AS Categoria_Suspension,
    sus.Motivo                          AS Motivo_Suspension
FROM Personal_Sistema ps
JOIN  Personas p              ON ps.ID_Persona = p.ID_Persona
JOIN  Roles    r              ON ps.ID_Rol      = r.ID_Rol
LEFT JOIN Personal_Info_Personal pip ON ps.ID_Persona = pip.ID_Persona
LEFT JOIN Personal_Info_Iglesia  pii ON ps.ID_Persona = pii.ID_Persona
LEFT JOIN Redes rd                   ON pii.ID_Red    = rd.ID_Red
LEFT JOIN Circulos_Amistad ca        ON pii.ID_Circulo = ca.ID_Circulo
LEFT JOIN Personal_Lideres pl        ON pii.ID_Lider  = pl.ID_Lider
LEFT JOIN Personas p_lider           ON pl.ID_Persona = p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider
       ON p_lider.ID_Persona   = tp_lider.ID_Persona
      AND tp_lider.Es_Principal = TRUE AND tp_lider.Activo = TRUE
LEFT JOIN Personas_Direcciones pd
       ON ps.ID_Persona   = pd.ID_Persona
      AND pd.Es_Principal = TRUE AND pd.Activo = TRUE
LEFT JOIN Telefonos_Personas tp
       ON ps.ID_Persona   = tp.ID_Persona
      AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
LEFT JOIN LATERAL (
    SELECT ID_Suspension, Fecha_Inicio, Fecha_Fin, Categoria_Motivo, Motivo
    FROM Personal_Suspensiones_Servicio pss
    WHERE pss.ID_Personal  = ps.ID_Persona
      AND pss.Activo       = TRUE
      AND pss.Fecha_Inicio <= CURRENT_DATE
      AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin >= CURRENT_DATE)
    LIMIT 1
) sus ON TRUE
ORDER BY p.Apellidos, p.Nombres;


-- v_solicitud_formulario_completo
CREATE OR REPLACE VIEW v_solicitud_formulario_completo AS
SELECT
    sp.ID_Solicitud,
    sp.Fecha_Solicitud::DATE              AS Fecha_Formulario,
    p.Nombres || ' ' || p.Apellidos       AS Candidato,
    sp.Sexo_Candidato                     AS Sexo,
    sp.Cedula_Candidato                   AS Cedula,
    p.Fecha_Nacimiento,
    sp.Tel_Casa, sp.Tel_Oficina, sp.Tel_Claro, sp.Tel_Movistar,
    sp.Dir_Ciudad, sp.Dir_Municipio, sp.Dir_Distrito,
    sp.Dir_Barrio, sp.Dir_Exacta,
    sp.Ocupacion_Candidato,
    sp.Centro_Laboral_Candidato,
    sp.Nivel_Academico_Candidato          AS Nivel_Academico,
    sp.Estado_Civil,
    sp.Nombre_Conyuge,
    sp.Conyuge_Ocupacion,
    sp.Conyuge_Centro_Laboral,
    sp.Bautizado_Agua,
    sp.Fecha_Bautismo,
    sp.Fecha_Bautismo_Precision,
    sp.Circulo_Amistad,
    sp.Circulo_Amistad_Desde,
    sp.Clases_Biblicas_Ninos,
    sp.Clases_Biblicas_Detalle,
    sp.Capacitacion_Ensenanza,
    sp.Capacitacion_Detalle,
    sp.Observaciones_Espirituales_Sol     AS Observaciones_Espirituales,
    sp.Estado_Operativo_Candidato,
    r_sol.Nombre_Rol                      AS Rol_Solicitado,
    sp.Estado,
    p_lider.Nombres || ' ' || p_lider.Apellidos AS Lider_Propuesto,
    tp_lider.Numero                       AS Tel_Lider,
    p_staff.Nombres || ' ' || p_staff.Apellidos AS Gestionado_Por,
    sp.Notas_Staff,
    sp.Notas_Coordinador
FROM Solicitudes_Personal sp
JOIN Personas p                   ON sp.ID_Persona        = p.ID_Persona
JOIN Roles r_sol                  ON sp.ID_Rol_Solicitado = r_sol.ID_Rol
JOIN Personal_Sistema ps_staff    ON sp.ID_Gestionado_Por = ps_staff.ID_Persona
JOIN Personas p_staff             ON ps_staff.ID_Persona  = p_staff.ID_Persona
LEFT JOIN Personal_Lideres pl     ON sp.ID_Lider_Propuesto = pl.ID_Lider
LEFT JOIN Personas p_lider        ON pl.ID_Persona         = p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider
       ON p_lider.ID_Persona    = tp_lider.ID_Persona
      AND tp_lider.Es_Principal = TRUE AND tp_lider.Activo = TRUE
ORDER BY sp.Fecha_Solicitud DESC;


-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Ejecutar estas queries para confirmar que la migración fue exitosa:
-- SELECT COUNT(*) FROM Telefonos_Personas;          -- debe ser > 0 si había teléfonos
-- SELECT COUNT(*) FROM Personas_Direcciones;        -- debe ser > 0 si había direcciones
-- SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trg_%' ORDER BY tgname;
-- SELECT typname FROM pg_type WHERE typname IN ('tipo_sexo','tipo_telefono','estado_operativo');
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'personas' AND column_name IN ('sexo','cedula');

COMMIT;
