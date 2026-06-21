-- ================================================================
--  MIGRACIÓN v3 → v4: Esquema Ministerio Infantil
--  Ejecutar en orden. Cada sección es independiente.
-- ================================================================

BEGIN;

-- ================================================================
-- PASO 1: Eliminar triggers antiguos que bloquean cambios
-- ================================================================

DROP TRIGGER IF EXISTS trg_validar_retiro_nino ON asistencia_ninos;
DROP TRIGGER IF EXISTS trg_validar_autorizacion_staff ON personal_sistema;
DROP FUNCTION IF EXISTS validar_retiro_nino();
DROP FUNCTION IF EXISTS validar_autorizacion_staff();
DROP FUNCTION IF EXISTS desactivar_tutores_expirados();

-- ================================================================
-- PASO 2: Eliminar FKs que apuntan a tablas que serán eliminadas
-- ================================================================

-- FKs desde asistencia_ninos hacia lista_autorizados (si existen)
ALTER TABLE asistencia_ninos DROP CONSTRAINT IF EXISTS asistencia_ninos_id_ingresado_por_fkey;
ALTER TABLE asistencia_ninos DROP CONSTRAINT IF EXISTS asistencia_ninos_id_retirado_por_fkey;

-- FKs desde lista_autorizados
DROP TABLE IF EXISTS lista_autorizados CASCADE;

-- FKs desde tutores_temporales_ninos
DROP TABLE IF EXISTS tutores_temporales_ninos CASCADE;

-- FKs desde tutores_temporales
DROP TABLE IF EXISTS tutores_temporales CASCADE;

-- FKs desde padres_ninos
DROP TABLE IF EXISTS padres_ninos CASCADE;

-- FKs desde padres
DROP TABLE IF EXISTS padres CASCADE;

-- ================================================================
-- PASO 3: Crear nuevos ENUMs
-- ================================================================

DO $$ BEGIN
    CREATE TYPE estado_civil AS ENUM ('Soltero','Acompañado','Casado','Divorciado','Viudo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_liderazgo AS ENUM ('Gap','Lider','Mentor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE nombre_turno AS ENUM ('Miercoles','Domingo_8am','Domingo_11am','Domingo_5pm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_evento AS ENUM ('Servicio Regular','Party Mix','Power Day','Semana Santa','Navidad','Especial','Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_requisito AS ENUM ('Formacion','Estado_Ministerial','Otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM ('Borrador','Pendiente','Aprobado','Rechazado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_asistencia_nino AS ENUM ('Presente','Retirado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================================
-- PASO 4: Agregar columnas faltantes a tablas existentes
-- ================================================================

-- Roles: agregar Activo
ALTER TABLE roles ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
-- Actualizar roles existentes
UPDATE roles SET activo = TRUE WHERE activo IS NULL;

-- Grupos: agregar Activo
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE grupos SET activo = TRUE WHERE activo IS NULL;

-- Fichas: agregar ID_Grupo
ALTER TABLE fichas ADD COLUMN IF NOT EXISTS id_grupo INT;
-- Asignar grupo por defecto a fichas existentes (grupo 1 = 2-6 años)
UPDATE fichas SET id_grupo = 1 WHERE id_grupo IS NULL;
ALTER TABLE fichas ALTER COLUMN id_grupo SET NOT NULL;
ALTER TABLE fichas ADD CONSTRAINT fichas_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo);

-- Personal_Sistema: agregar ID_Solicitud_Origen
ALTER TABLE personal_sistema ADD COLUMN IF NOT EXISTS id_solicitud_origen INT;

-- Asistencia_Ninos: agregar columnas nuevas
ALTER TABLE asistencia_ninos ADD COLUMN IF NOT EXISTS id_turno INT;
ALTER TABLE asistencia_ninos ADD COLUMN IF NOT EXISTS id_evento INT;
ALTER TABLE asistencia_ninos ADD COLUMN IF NOT EXISTS estado estado_asistencia_nino;
ALTER TABLE asistencia_ninos ADD COLUMN IF NOT EXISTS es_excepcion_asistencia BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE asistencia_ninos ADD COLUMN IF NOT EXISTS motivo_excepcion_asistencia VARCHAR(255);

-- Actualizar estado de registros existentes: si hora_salida IS NULL → 'Presente', else 'Retirado'
UPDATE asistencia_ninos SET estado = CASE WHEN hora_salida IS NULL THEN 'Presente'::estado_asistencia_nino ELSE 'Retirado'::estado_asistencia_nino END WHERE estado IS NULL;
ALTER TABLE asistencia_ninos ALTER COLUMN estado SET NOT NULL;
ALTER TABLE asistencia_ninos ALTER COLUMN estado SET DEFAULT 'Presente';

-- Asignar turno por defecto a registros existentes (turno actual según día)
-- Miércoles = 3, Domingo = 0. Usamos turno Domingo_11am (ID 3) como default
UPDATE asistencia_ninos SET id_turno = 3 WHERE id_turno IS NULL;

-- Asistencia_Maestros: agregar columnas nuevas
ALTER TABLE asistencia_maestros ADD COLUMN IF NOT EXISTS id_turno INT;
ALTER TABLE asistencia_maestros ADD COLUMN IF NOT EXISTS id_evento INT;
ALTER TABLE asistencia_maestros ADD COLUMN IF NOT EXISTS razon_ausencia TEXT;

-- Asignar turno por defecto
UPDATE asistencia_maestros SET id_turno = 3 WHERE id_turno IS NULL;

-- Personal_Grupos: agregar ID_Turno a la PK
-- Primero agregar columna
ALTER TABLE personal_grupos ADD COLUMN IF NOT EXISTS id_turno INT;
-- Asignar turno por defecto
UPDATE personal_grupos SET id_turno = 3 WHERE id_turno IS NULL;

-- ================================================================
-- PASO 5: Crear tablas nuevas de catálogo
-- ================================================================

-- Redes
CREATE TABLE IF NOT EXISTS redes (
    id_red  SERIAL      PRIMARY KEY,
    nombre  VARCHAR(60) NOT NULL UNIQUE,
    activo  BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Turnos
CREATE TABLE IF NOT EXISTS turnos (
    id_turno    SERIAL       PRIMARY KEY,
    nombre      nombre_turno NOT NULL UNIQUE,
    dia_semana  SMALLINT     NOT NULL CHECK (dia_semana IN (0, 3)),
    hora_inicio TIME         NOT NULL,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Insertar turnos solo si no existen
INSERT INTO turnos (nombre, dia_semana, hora_inicio)
SELECT 'Miercoles', 3, '19:00:00' WHERE NOT EXISTS (SELECT 1 FROM turnos WHERE nombre = 'Miercoles');
INSERT INTO turnos (nombre, dia_semana, hora_inicio)
SELECT 'Domingo_8am', 0, '08:00:00' WHERE NOT EXISTS (SELECT 1 FROM turnos WHERE nombre = 'Domingo_8am');
INSERT INTO turnos (nombre, dia_semana, hora_inicio)
SELECT 'Domingo_11am', 0, '11:00:00' WHERE NOT EXISTS (SELECT 1 FROM turnos WHERE nombre = 'Domingo_11am');
INSERT INTO turnos (nombre, dia_semana, hora_inicio)
SELECT 'Domingo_5pm', 0, '17:00:00' WHERE NOT EXISTS (SELECT 1 FROM turnos WHERE nombre = 'Domingo_5pm');

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id_evento     SERIAL       PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   TEXT,
    fecha         DATE         NOT NULL,
    id_turno      INT          REFERENCES turnos(id_turno),
    tipo          tipo_evento  NOT NULL DEFAULT 'Servicio Regular',
    numero_semana SMALLINT     GENERATED ALWAYS AS (
                      (((EXTRACT(DAY FROM fecha))::INT - 1) / 7 + 1)::SMALLINT
                  ) STORED,
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_evento_fecha_turno UNIQUE (fecha, id_turno)
);

-- Requisitos
CREATE TABLE IF NOT EXISTS requisitos (
    id_requisito     SERIAL         PRIMARY KEY,
    nombre           VARCHAR(100)   NOT NULL UNIQUE,
    descripcion      TEXT,
    tipo             tipo_requisito NOT NULL DEFAULT 'Formacion',
    id_rol_requerido INT            REFERENCES roles(id_rol),
    obligatorio      BOOLEAN        NOT NULL DEFAULT FALSE,
    activo           BOOLEAN        NOT NULL DEFAULT TRUE
);

-- Insertar requisitos pre-cargados
INSERT INTO requisitos (nombre, tipo, obligatorio) VALUES
    ('Escuela de Nuevos Creyentes', 'Formacion', TRUE),
    ('PEEH', 'Formacion', FALSE),
    ('BEE', 'Formacion', FALSE),
    ('Escuela de Artes', 'Formacion', FALSE),
    ('Escuela de Obreros', 'Formacion', FALSE)
ON CONFLICT (nombre) DO NOTHING;

-- ================================================================
-- PASO 6: Crear tablas nuevas de tutores (unificado)
-- ================================================================

-- Tutores (reemplaza Padres + Tutores_Temporales)
CREATE TABLE IF NOT EXISTS tutores (
    id_persona  INT         PRIMARY KEY
                                REFERENCES personas(id_persona) ON DELETE RESTRICT,
    tipo_tutor  VARCHAR(60) NOT NULL
);

-- Tutores_Ninos (reemplaza Padres_Ninos + Tutores_Temporales_Ninos)
CREATE TABLE IF NOT EXISTS tutores_ninos (
    id_tutor  INT NOT NULL REFERENCES tutores(id_persona) ON DELETE CASCADE,
    id_nino   INT NOT NULL REFERENCES ninos(id_persona)   ON DELETE RESTRICT,
    PRIMARY KEY (id_tutor, id_nino)
);

-- ================================================================
-- PASO 7: Crear tablas de perfil del personal
-- ================================================================

CREATE TABLE IF NOT EXISTS personal_info_personal (
    id_persona      INT          PRIMARY KEY
                                     REFERENCES personal_sistema(id_persona) ON DELETE CASCADE,
    estado_civil    estado_civil NOT NULL DEFAULT 'Soltero',
    nombre_conyuge  VARCHAR(100),
    tiene_hijos     BOOLEAN      NOT NULL DEFAULT FALSE,
    numero_hijos    SMALLINT,
    direccion       TEXT,
    CONSTRAINT chk_conyuge
        CHECK (estado_civil NOT IN ('Casado','Acompañado') OR nombre_conyuge IS NOT NULL),
    CONSTRAINT chk_numero_hijos
        CHECK (tiene_hijos = FALSE OR (numero_hijos IS NOT NULL AND numero_hijos > 0))
);

CREATE TABLE IF NOT EXISTS personal_info_iglesia (
    id_persona            INT              PRIMARY KEY
                                               REFERENCES personal_sistema(id_persona) ON DELETE CASCADE,
    id_red                INT              REFERENCES redes(id_red),
    estado_liderazgo      estado_liderazgo,
    id_mentor             INT              REFERENCES personal_sistema(id_persona),
    circulo_amistad       VARCHAR(100),
    tiempo_iglesia_meses  INT              CHECK (tiempo_iglesia_meses >= 0),
    ministerio_adicional  VARCHAR(150),
    CONSTRAINT chk_mentor_requiere_liderazgo
        CHECK (id_mentor IS NULL OR estado_liderazgo IN ('Gap','Lider')),
    CONSTRAINT chk_circulo_solo_lider
        CHECK (circulo_amistad IS NULL OR estado_liderazgo = 'Lider')
);

CREATE TABLE IF NOT EXISTS personal_requisitos (
    id_personal     INT     NOT NULL REFERENCES personal_sistema(id_persona) ON DELETE CASCADE,
    id_requisito    INT     NOT NULL REFERENCES requisitos(id_requisito),
    cumplido        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_cumplido  DATE,
    notas           TEXT,
    PRIMARY KEY (id_personal, id_requisito),
    CONSTRAINT chk_fecha_cumplido
        CHECK (cumplido = FALSE OR fecha_cumplido IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS personal_turnos (
    id_personal       INT     NOT NULL REFERENCES personal_sistema(id_persona) ON DELETE RESTRICT,
    id_turno          INT     NOT NULL REFERENCES turnos(id_turno),
    fecha_asignacion  DATE    NOT NULL DEFAULT CURRENT_DATE,
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_personal, id_turno)
);

-- ================================================================
-- PASO 8: Crear tablas de solicitudes
-- ================================================================

CREATE TABLE IF NOT EXISTS solicitudes_personal (
    id_solicitud          SERIAL           PRIMARY KEY,
    id_persona            INT              NOT NULL REFERENCES personas(id_persona) ON DELETE RESTRICT,
    id_rol_solicitado     INT              NOT NULL REFERENCES roles(id_rol),
    id_gestionado_por     INT              NOT NULL REFERENCES personal_sistema(id_persona),
    id_resuelto_por       INT              REFERENCES personal_sistema(id_persona),
    estado                estado_solicitud NOT NULL DEFAULT 'Borrador',
    fecha_solicitud       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    fecha_resolucion      TIMESTAMPTZ,
    notas_staff           TEXT,
    notas_coordinador     TEXT,
    estado_civil          estado_civil,
    nombre_conyuge        VARCHAR(100),
    tiene_hijos           BOOLEAN          NOT NULL DEFAULT FALSE,
    numero_hijos          SMALLINT,
    direccion             TEXT,
    id_red                INT              REFERENCES redes(id_red),
    estado_liderazgo      estado_liderazgo,
    id_mentor_propuesto   INT              REFERENCES personal_sistema(id_persona),
    circulo_amistad       VARCHAR(100),
    tiempo_iglesia_meses  INT              CHECK (tiempo_iglesia_meses >= 0),
    ministerio_adicional  VARCHAR(150),
    CONSTRAINT chk_sol_fecha_resolucion
        CHECK (fecha_resolucion IS NULL OR fecha_resolucion >= fecha_solicitud),
    CONSTRAINT chk_sol_resolucion_completa
        CHECK (
            estado IN ('Borrador','Pendiente')
            OR (
                estado IN ('Aprobado','Rechazado')
                AND id_resuelto_por IS NOT NULL
                AND fecha_resolucion IS NOT NULL
            )
        ),
    CONSTRAINT chk_sol_conyuge
        CHECK (estado_civil IS NULL
               OR estado_civil NOT IN ('Casado','Acompañado')
               OR nombre_conyuge IS NOT NULL),
    CONSTRAINT chk_sol_hijos
        CHECK (tiene_hijos = FALSE OR (numero_hijos IS NOT NULL AND numero_hijos > 0)),
    CONSTRAINT chk_sol_mentor_liderazgo
        CHECK (id_mentor_propuesto IS NULL OR estado_liderazgo IN ('Gap','Lider')),
    CONSTRAINT chk_sol_circulo_lider
        CHECK (circulo_amistad IS NULL OR estado_liderazgo = 'Lider')
);

CREATE TABLE IF NOT EXISTS solicitudes_requisitos (
    id_solicitud    INT     NOT NULL REFERENCES solicitudes_personal(id_solicitud) ON DELETE CASCADE,
    id_requisito    INT     NOT NULL REFERENCES requisitos(id_requisito),
    cumplido        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_cumplido  DATE,
    notas           TEXT,
    PRIMARY KEY (id_solicitud, id_requisito),
    CONSTRAINT chk_sr_fecha_cumplido
        CHECK (cumplido = FALSE OR fecha_cumplido IS NOT NULL)
);

-- FK diferida: Personal_Sistema → Solicitudes_Personal
ALTER TABLE personal_sistema
    ADD CONSTRAINT fk_solicitud_origen
        FOREIGN KEY (id_solicitud_origen)
        REFERENCES solicitudes_personal(id_solicitud)
        ON DELETE SET NULL;

-- ================================================================
-- PASO 9: Agregar FKs a tablas modificadas
-- ================================================================

-- Asistencia_Ninos: FKs nuevas
ALTER TABLE asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_turno_fkey
        FOREIGN KEY (id_turno) REFERENCES turnos(id_turno);

ALTER TABLE asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_evento_fkey
        FOREIGN KEY (id_evento) REFERENCES eventos(id_evento);

-- Asistencia_Maestros: FKs nuevas
ALTER TABLE asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_id_turno_fkey
        FOREIGN KEY (id_turno) REFERENCES turnos(id_turno);

ALTER TABLE asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_id_evento_fkey
        FOREIGN KEY (id_evento) REFERENCES eventos(id_evento);

-- Personal_Grupos: agregar ID_Turno a la PK
-- Primero eliminar PK antigua
ALTER TABLE personal_grupos DROP CONSTRAINT IF EXISTS personal_grupos_pkey;
-- Agregar nueva PK con ID_Turno
ALTER TABLE personal_grupos ADD CONSTRAINT personal_grupos_pkey PRIMARY KEY (id_personal, id_grupo, id_turno);
-- Agregar FK para ID_Turno
ALTER TABLE personal_grupos
    ADD CONSTRAINT personal_grupos_id_turno_fkey
        FOREIGN KEY (id_turno) REFERENCES turnos(id_turno);

-- ================================================================
-- PASO 10: Agregar constraints CHECK nuevas
-- ================================================================

-- Asistencia_Ninos: constraint de excepción
ALTER TABLE asistencia_ninos
    ADD CONSTRAINT chk_excepcion_asist_motivo
        CHECK (es_excepcion_asistencia = FALSE OR motivo_excepcion_asistencia IS NOT NULL);

-- Asistencia_Ninos: constraint de estado retirado
ALTER TABLE asistencia_ninos
    ADD CONSTRAINT chk_estado_retirado CHECK (Estado = 'Presente' OR (Estado = 'Retirado' AND ID_Retirado_Por IS NOT NULL AND Hora_Salida IS NOT NULL));

-- Asistencia_Maestros: constraint de razón injustificada
ALTER TABLE asistencia_maestros
    ADD CONSTRAINT chk_razon_injustificado
        CHECK (estado_llegada <> 'Injustificado' OR razon_ausencia IS NOT NULL);

-- Asistencia_Ninos: UNIQUE por turno
-- Primero eliminar UNIQUE antiguo
ALTER TABLE asistencia_ninos DROP CONSTRAINT IF EXISTS uq_nino_fecha;
-- Agregar nuevo UNIQUE con ID_Turno
ALTER TABLE asistencia_ninos
    ADD CONSTRAINT uq_nino_fecha_turno UNIQUE (id_nino, fecha, id_turno);

-- Asistencia_Maestros: UNIQUE por turno
ALTER TABLE asistencia_maestros DROP CONSTRAINT IF EXISTS uq_personal_fecha;
ALTER TABLE asistencia_maestros
    ADD CONSTRAINT uq_personal_fecha_turno UNIQUE (id_personal, fecha, id_turno);

-- ================================================================
-- PASO 11: Crear índices nuevos
-- ================================================================

-- Fichas
CREATE INDEX IF NOT EXISTS idx_fichas_grupo ON fichas (id_grupo);
CREATE INDEX IF NOT EXISTS idx_fichas_codigo ON fichas (codigo_ficha);

-- Requisitos
CREATE INDEX IF NOT EXISTS idx_requisitos_tipo_activo ON requisitos (tipo, activo);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_turno ON eventos (id_turno, fecha);

-- Tutores_Ninos
CREATE INDEX IF NOT EXISTS idx_tutores_ninos ON tutores_ninos (id_nino);

-- Ninos
CREATE INDEX IF NOT EXISTS idx_ninos_persona ON ninos (id_persona);

-- Info_Medica_Ninos
CREATE INDEX IF NOT EXISTS idx_medica_nino_tipo ON info_medica_ninos (id_nino, tipo);

-- Personal_Sistema
CREATE INDEX IF NOT EXISTS idx_personal_rol_activo ON personal_sistema (id_rol, activo);

-- Personal_Requisitos
CREATE INDEX IF NOT EXISTS idx_personal_requisitos ON personal_requisitos (id_personal);

-- Solicitudes_Personal
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_personal (estado, fecha_solicitud DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_persona ON solicitudes_personal (id_persona);

-- Solicitudes_Requisitos
CREATE INDEX IF NOT EXISTS idx_sol_requisitos ON solicitudes_requisitos (id_solicitud);

-- Asistencia_Ninos
CREATE INDEX IF NOT EXISTS idx_asistencia_turno ON asistencia_ninos (id_turno, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asistencia_ficha_ent ON asistencia_ninos (id_ficha_entrada);
-- Actualizar índice parcial de salida pendiente
DROP INDEX IF EXISTS idx_salida_pendiente;
CREATE INDEX idx_salida_pendiente ON asistencia_ninos (fecha, id_nino) WHERE estado = 'Presente';

-- Asistencia_Maestros
CREATE INDEX IF NOT EXISTS idx_asist_maestro_turno ON asistencia_maestros (id_turno, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asist_maestro_estado ON asistencia_maestros (estado_llegada, fecha DESC);

-- Personal_Grupos
CREATE INDEX IF NOT EXISTS idx_personal_grupos ON personal_grupos (id_personal, id_grupo);

-- Personal_Info_Iglesia
CREATE INDEX IF NOT EXISTS idx_iglesia_liderazgo ON personal_info_iglesia (estado_liderazgo) WHERE estado_liderazgo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iglesia_red ON personal_info_iglesia (id_red) WHERE id_red IS NOT NULL;

-- ================================================================
-- PASO 12: Crear triggers y funciones
-- ================================================================

-- 12a. Validar fecha de nacimiento en niños
CREATE OR REPLACE FUNCTION fn_validar_fecha_nac_nino()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT fecha_nacimiento FROM personas WHERE id_persona = NEW.id_persona) IS NULL THEN
        RAISE EXCEPTION
            'El niño (ID_Persona: %) debe tener Fecha_Nacimiento registrada en Personas.',
            NEW.id_persona;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_nino_fecha_nac ON ninos;
CREATE TRIGGER trg_nino_fecha_nac
    BEFORE INSERT ON ninos
    FOR EACH ROW EXECUTE FUNCTION fn_validar_fecha_nac_nino();

-- 12b. Auto-asignar grupo por edad al registrar asistencia
CREATE OR REPLACE FUNCTION fn_autoasignar_grupo_asistencia()
RETURNS TRIGGER AS $$
DECLARE
    v_fecha_nac DATE;
    v_edad      INT;
    v_id_grupo  INT;
BEGIN
    SELECT p.fecha_nacimiento INTO v_fecha_nac
    FROM personas p WHERE p.id_persona = NEW.id_nino;

    IF v_fecha_nac IS NULL THEN
        RAISE EXCEPTION 'El niño (ID: %) no tiene Fecha_Nacimiento registrada.', NEW.id_nino;
    END IF;

    v_edad := DATE_PART('year', AGE(NEW.fecha, v_fecha_nac))::INT;

    SELECT id_grupo INTO v_id_grupo
    FROM grupos
    WHERE activo = TRUE
      AND v_edad >= edad_minima
      AND v_edad <= edad_maxima
    LIMIT 1;

    IF NEW.id_grupo_asistido IS NULL THEN
        IF v_id_grupo IS NULL THEN
            RAISE EXCEPTION
                'No existe un grupo activo para un niño de % años. Asigne el grupo manualmente.', v_edad;
        END IF;
        NEW.id_grupo_asistido          := v_id_grupo;
        NEW.es_excepcion_asistencia    := FALSE;
        NEW.motivo_excepcion_asistencia := NULL;
    ELSE
        IF v_id_grupo IS NULL OR NEW.id_grupo_asistido <> v_id_grupo THEN
            NEW.es_excepcion_asistencia := TRUE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_autoasignar_grupo_asistencia ON asistencia_ninos;
CREATE TRIGGER trg_autoasignar_grupo_asistencia
    BEFORE INSERT ON asistencia_ninos
    FOR EACH ROW EXECUTE FUNCTION fn_autoasignar_grupo_asistencia();

-- 12c. Validar retiro de niño (actualizado para Tutores)
CREATE OR REPLACE FUNCTION fn_validar_retiro_nino()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_retirado_por IS NOT NULL AND OLD.id_retirado_por IS NULL THEN

        -- Caso 1: la misma persona que ingresó
        IF NEW.id_retirado_por = OLD.id_ingresado_por THEN
            NEW.estado := 'Retirado';
            RETURN NEW;
        END IF;

        -- Caso 2: tutor registrado del niño
        IF EXISTS (
            SELECT 1 FROM tutores_ninos tn
            WHERE tn.id_nino  = NEW.id_nino
              AND tn.id_tutor = NEW.id_retirado_por
        ) THEN
            NEW.estado := 'Retirado';
            RETURN NEW;
        END IF;

        RAISE EXCEPTION
            'Persona (ID: %) NO autorizada para retirar al niño (ID: %).',
            NEW.id_retirado_por, NEW.id_nino;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_retiro_nino ON asistencia_ninos;
CREATE TRIGGER trg_validar_retiro_nino
    BEFORE UPDATE ON asistencia_ninos
    FOR EACH ROW EXECUTE FUNCTION fn_validar_retiro_nino();

-- 12d. Validar requisitos obligatorios al enviar solicitud
CREATE OR REPLACE FUNCTION fn_validar_requisitos_solicitud()
RETURNS TRIGGER AS $$
DECLARE
    v_faltantes TEXT;
BEGIN
    IF OLD.estado = 'Borrador' AND NEW.estado = 'Pendiente' THEN

        SELECT STRING_AGG(r.nombre, ', ' ORDER BY r.nombre)
        INTO   v_faltantes
        FROM   requisitos r
        WHERE  r.activo       = TRUE
          AND  r.obligatorio  = TRUE
          AND (r.id_rol_requerido IS NULL OR r.id_rol_requerido = NEW.id_rol_solicitado)
          AND NOT EXISTS (
              SELECT 1 FROM solicitudes_requisitos sr
              WHERE sr.id_solicitud = NEW.id_solicitud
                AND sr.id_requisito = r.id_requisito
                AND sr.cumplido     = TRUE
          );

        IF v_faltantes IS NOT NULL THEN
            RAISE EXCEPTION
                'La solicitud no puede enviarse. Requisitos obligatorios no cumplidos: [%].',
                v_faltantes;
        END IF;
    END IF;

    -- Bloquear retroceso
    IF OLD.estado <> 'Borrador' AND NEW.estado = 'Borrador' THEN
        RAISE EXCEPTION 'No se puede regresar una solicitud al estado Borrador una vez enviada.';
    END IF;

    -- Solo el Coordinador puede aprobar/rechazar
    IF NEW.estado IN ('Aprobado','Rechazado') AND OLD.estado = 'Borrador' THEN
        RAISE EXCEPTION 'La solicitud debe pasar por estado Pendiente antes de ser resuelta.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_requisitos_solicitud ON solicitudes_personal;
CREATE TRIGGER trg_validar_requisitos_solicitud
    BEFORE UPDATE OF estado ON solicitudes_personal
    FOR EACH ROW EXECUTE FUNCTION fn_validar_requisitos_solicitud();

-- 12e. Validar autorización al crear/modificar Personal_Sistema
CREATE OR REPLACE FUNCTION fn_validar_autorizacion_staff()
RETURNS TRIGGER AS $$
DECLARE
    v_nivel_creador    INT;
    v_nivel_autorizado INT;
    v_nivel_nuevo      INT;
BEGIN
    SELECT r.nivel_jerarquico INTO v_nivel_nuevo
    FROM roles r WHERE r.id_rol = NEW.id_rol;

    IF NEW.id_creado_por IS NOT NULL THEN
        SELECT r.nivel_jerarquico INTO v_nivel_creador
        FROM personal_sistema ps
        JOIN roles r ON ps.id_rol = r.id_rol
        WHERE ps.id_persona = NEW.id_creado_por;

        IF v_nivel_creador = 3 AND v_nivel_nuevo >= 3 THEN
            IF NEW.id_autorizado_por IS NULL THEN
                RAISE EXCEPTION
                    'Un Staff que registra otro Staff o superior requiere ID_Autorizado_Por del Coordinador General.';
            END IF;

            SELECT r.nivel_jerarquico INTO v_nivel_autorizado
            FROM personal_sistema ps
            JOIN roles r ON ps.id_rol = r.id_rol
            WHERE ps.id_persona = NEW.id_autorizado_por;

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

DROP TRIGGER IF EXISTS trg_validar_autorizacion_staff ON personal_sistema;
CREATE TRIGGER trg_validar_autorizacion_staff
    BEFORE INSERT OR UPDATE ON personal_sistema
    FOR EACH ROW EXECUTE FUNCTION fn_validar_autorizacion_staff();

-- 12f. Propagar datos aprobados de Solicitud → tablas de perfil
CREATE OR REPLACE FUNCTION fn_propagar_datos_solicitud_aprobada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'Aprobado' AND OLD.estado = 'Pendiente' THEN

        -- Insertar info personal
        INSERT INTO personal_info_personal (
            id_persona, estado_civil, nombre_conyuge,
            tiene_hijos, numero_hijos, direccion
        )
        SELECT
            ps.id_persona,
            NEW.estado_civil,
            NEW.nombre_conyuge,
            NEW.tiene_hijos,
            NEW.numero_hijos,
            NEW.direccion
        FROM personal_sistema ps
        WHERE ps.id_persona = NEW.id_persona
          AND ps.id_solicitud_origen = NEW.id_solicitud
        ON CONFLICT (id_persona) DO NOTHING;

        -- Insertar info iglesia
        INSERT INTO personal_info_iglesia (
            id_persona, id_red, estado_liderazgo,
            id_mentor, circulo_amistad,
            tiempo_iglesia_meses, ministerio_adicional
        )
        SELECT
            ps.id_persona,
            NEW.id_red,
            NEW.estado_liderazgo,
            NEW.id_mentor_propuesto,
            NEW.circulo_amistad,
            NEW.tiempo_iglesia_meses,
            NEW.ministerio_adicional
        FROM personal_sistema ps
        WHERE ps.id_persona = NEW.id_persona
          AND ps.id_solicitud_origen = NEW.id_solicitud
        ON CONFLICT (id_persona) DO NOTHING;

        -- Copiar requisitos
        INSERT INTO personal_requisitos (id_personal, id_requisito, cumplido, fecha_cumplido, notas)
        SELECT
            ps.id_persona,
            sr.id_requisito,
            sr.cumplido,
            sr.fecha_cumplido,
            sr.notas
        FROM solicitudes_requisitos sr
        JOIN personal_sistema ps ON ps.id_persona = NEW.id_persona
                                AND ps.id_solicitud_origen = NEW.id_solicitud
        ON CONFLICT (id_personal, id_requisito) DO NOTHING;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_propagar_datos_solicitud ON solicitudes_personal;
CREATE TRIGGER trg_propagar_datos_solicitud
    AFTER UPDATE OF estado ON solicitudes_personal
    FOR EACH ROW EXECUTE FUNCTION fn_propagar_datos_solicitud_aprobada();

-- ================================================================
-- PASO 13: Crear vistas
-- ================================================================

-- 13a. Niños presentes
CREATE OR REPLACE VIEW v_ninos_presentes AS
SELECT
    an.fecha,
    t.nombre                            AS turno,
    p.nombres  || ' ' || p.apellidos   AS nino,
    g.nombre                            AS grupo,
    an.es_excepcion_asistencia,
    an.acompanante_en_aula,
    an.hora_entrada,
    f.codigo_ficha                      AS ficha_entrada,
    an.estado
FROM asistencia_ninos an
JOIN personas p   ON an.id_nino           = p.id_persona
JOIN grupos   g   ON an.id_grupo_asistido = g.id_grupo
JOIN turnos   t   ON an.id_turno          = t.id_turno
JOIN fichas   f   ON an.id_ficha_entrada  = f.id_ficha
WHERE an.estado = 'Presente'
ORDER BY an.fecha DESC, t.nombre, g.nombre, p.apellidos;

-- 13b. Asistencia mensual de niños
CREATE OR REPLACE VIEW v_asistencia_mensual_ninos AS
SELECT
    DATE_TRUNC('month', an.fecha)  AS mes,
    t.nombre                       AS turno,
    COUNT(DISTINCT an.id_nino)     AS ninos_distintos,
    COUNT(*)                       AS total_registros
FROM asistencia_ninos an
JOIN turnos t ON an.id_turno = t.id_turno
GROUP BY DATE_TRUNC('month', an.fecha), t.nombre
ORDER BY mes DESC, turno;

-- 13c. Comparativa mensual
CREATE OR REPLACE VIEW v_comparativa_mensual AS
SELECT
    DATE_TRUNC('month', fecha)   AS mes,
    COUNT(DISTINCT id_nino)      AS total_ninos,
    LAG(COUNT(DISTINCT id_nino)) OVER (ORDER BY DATE_TRUNC('month', fecha)) AS mes_anterior,
    COUNT(DISTINCT id_nino)
      - LAG(COUNT(DISTINCT id_nino)) OVER (ORDER BY DATE_TRUNC('month', fecha)) AS diferencia
FROM asistencia_ninos
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;

-- 13d. Inasistencias personal
CREATE OR REPLACE VIEW v_inasistencias_personal AS
SELECT
    am.fecha,
    t.nombre                           AS turno,
    p.nombres || ' ' || p.apellidos   AS personal,
    r.nombre_rol                       AS rol,
    am.estado_llegada,
    am.razon_ausencia,
    am.comentarios
FROM asistencia_maestros am
JOIN personal_sistema ps ON am.id_personal = ps.id_persona
JOIN personas p          ON ps.id_persona  = p.id_persona
JOIN roles r             ON ps.id_rol      = r.id_rol
JOIN turnos t            ON am.id_turno    = t.id_turno
WHERE am.estado_llegada IN ('Injustificado','Tarde')
ORDER BY am.fecha DESC, t.nombre;

-- 13e. Cumplimiento personal
CREATE OR REPLACE VIEW v_cumplimiento_personal AS
SELECT
    DATE_TRUNC('month', am.fecha)      AS mes,
    t.nombre                           AS turno,
    p.nombres || ' ' || p.apellidos   AS personal,
    r.nombre_rol                       AS rol,
    COUNT(*)                           AS total_sesiones,
    COUNT(*) FILTER (WHERE am.estado_llegada = 'Temprano')      AS temprano,
    COUNT(*) FILTER (WHERE am.estado_llegada = 'Tarde')         AS tarde,
    COUNT(*) FILTER (WHERE am.estado_llegada = 'Justificado')   AS justificado,
    COUNT(*) FILTER (WHERE am.estado_llegada = 'Injustificado') AS injustificado,
    ROUND(
        100.0
        * COUNT(*) FILTER (WHERE am.estado_llegada IN ('Temprano','Tarde','Justificado'))
        / NULLIF(COUNT(*), 0), 2
    )                                  AS pct_asistencia
FROM asistencia_maestros am
JOIN personal_sistema ps ON am.id_personal = ps.id_persona
JOIN personas p          ON ps.id_persona  = p.id_persona
JOIN roles r             ON ps.id_rol      = r.id_rol
JOIN turnos t            ON am.id_turno    = t.id_turno
GROUP BY DATE_TRUNC('month', am.fecha), t.nombre, p.nombres, p.apellidos, r.nombre_rol
ORDER BY mes DESC, turno, personal;

-- 13f. Solicitudes pendientes
CREATE OR REPLACE VIEW v_solicitudes_pendientes AS
SELECT
    sp.id_solicitud,
    p_cand.nombres  || ' ' || p_cand.apellidos   AS candidato,
    p_cand.telefono                               AS telefono,
    r.nombre_rol                                  AS rol_solicitado,
    p_staff.nombres || ' ' || p_staff.apellidos  AS gestionado_por,
    sp.fecha_solicitud,
    sp.estado_liderazgo,
    sp.tiempo_iglesia_meses,
    (SELECT COUNT(*) FROM solicitudes_requisitos sr
     JOIN requisitos req ON sr.id_requisito = req.id_requisito
     WHERE sr.id_solicitud = sp.id_solicitud
       AND sr.cumplido = TRUE
       AND req.obligatorio = TRUE)               AS req_obligatorios_cumplidos,
    (SELECT COUNT(*) FROM requisitos req
     WHERE req.obligatorio = TRUE AND req.activo = TRUE
       AND (req.id_rol_requerido IS NULL OR req.id_rol_requerido = sp.id_rol_solicitado))
                                                   AS req_obligatorios_total,
    sp.notas_staff
FROM solicitudes_personal sp
JOIN personas p_cand      ON sp.id_persona        = p_cand.id_persona
JOIN roles r              ON sp.id_rol_solicitado = r.id_rol
JOIN personal_sistema ps  ON sp.id_gestionado_por = ps.id_persona
JOIN personas p_staff     ON ps.id_persona        = p_staff.id_persona
WHERE sp.estado = 'Pendiente'
ORDER BY sp.fecha_solicitud ASC;

-- 13g. Requisitos personal
CREATE OR REPLACE VIEW v_requisitos_personal AS
SELECT
    p.nombres || ' ' || p.apellidos   AS personal,
    r_rol.nombre_rol                  AS rol,
    req.nombre                        AS requisito,
    req.tipo,
    req.obligatorio,
    COALESCE(pr.cumplido, FALSE)      AS cumplido,
    pr.fecha_cumplido,
    pr.notas
FROM personal_sistema ps
JOIN  personas p     ON ps.id_persona = p.id_persona
JOIN  roles r_rol    ON ps.id_rol     = r_rol.id_rol
CROSS JOIN requisitos req
LEFT JOIN  personal_requisitos pr
       ON  pr.id_personal  = ps.id_persona
       AND pr.id_requisito = req.id_requisito
WHERE req.activo = TRUE
ORDER BY personal, req.tipo, req.nombre;

-- 13h. Alertas médicas
CREATE OR REPLACE VIEW v_alertas_medicas_ninos AS
SELECT
    p.nombres || ' ' || p.apellidos   AS nino,
    im.tipo,
    im.descripcion,
    im.severidad,
    im.instrucciones
FROM info_medica_ninos im
JOIN ninos   n ON im.id_nino    = n.id_persona
JOIN personas p ON n.id_persona = p.id_persona
ORDER BY
    CASE im.severidad WHEN 'Alta' THEN 1 WHEN 'Moderada' THEN 2 WHEN 'Leve' THEN 3 ELSE 4 END,
    CASE im.tipo      WHEN 'Condicion' THEN 1 WHEN 'Alergia' THEN 2 WHEN 'Medicamento' THEN 3 END;

-- 13i. Cumpleaños del mes
CREATE OR REPLACE VIEW v_cumpleanos_mes AS
SELECT
    p.nombres,
    p.apellidos,
    p.fecha_nacimiento,
    EXTRACT(DAY FROM p.fecha_nacimiento) AS dia_cumpleanos
FROM personas p
JOIN ninos n ON p.id_persona = n.id_persona
WHERE EXTRACT(MONTH FROM p.fecha_nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY EXTRACT(DAY FROM p.fecha_nacimiento);

-- 13j. Eventos del mes
CREATE OR REPLACE VIEW v_eventos_mes AS
SELECT
    e.fecha,
    e.numero_semana,
    t.nombre                       AS turno,
    e.nombre                       AS evento,
    e.tipo,
    e.descripcion
FROM eventos e
LEFT JOIN turnos t ON e.id_turno = t.id_turno
WHERE e.activo = TRUE
  AND DATE_TRUNC('month', e.fecha) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY e.fecha, t.hora_inicio;

COMMIT;

-- ================================================================
-- FIN DE MIGRACIÓN v3 → v4
-- ================================================================
