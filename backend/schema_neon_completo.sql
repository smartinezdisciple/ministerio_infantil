-- ==================================================================
-- SCHEMA MAESTRO — Sistema Ministerio Infantil HLV
-- Creación desde cero para Neon PostgreSQL (sin dependencias previas)
-- Versión final: v5.11
-- ==================================================================

-- ==================================================================
-- PARTE 1: ENUMs
-- ==================================================================

DO $$ BEGIN CREATE TYPE estado_civil AS ENUM ('Soltero','Casado','Divorciado','Viudo','Acompañado','Union_Libre','Segundo_Matrimonio','Separado','Madre_Soltera','Padre_Soltero'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE condicion_civil AS ENUM ('Ninguna','Divorciado_1er_Matrimonio','Divorciado_2do_Matrimonio','Divorciado_3er_Matrimonio','Viudo','Primer_Matrimonio','Segundo_Matrimonio','Tercer_Matrimonio','Otro_Matrimonio'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE estado_liderazgo AS ENUM ('Gap','Lider','Mentor','Miembro','Lider_Apoyo'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE nombre_turno AS ENUM ('Miercoles','Domingo_8am','Domingo_11am','Domingo_5pm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_evento AS ENUM ('Servicio Regular','Party Mix','Power Day','Semana Santa','Navidad','Especial','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_requisito AS ENUM ('Formacion','Estado_Ministerial','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE estado_solicitud AS ENUM ('Pendiente','Aprobado','Rechazado','En_Revision'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE estado_asistencia_nino AS ENUM ('Presente','Retirado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE estado_llegada AS ENUM ('Temprano','Tarde','Justificado','Injustificado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ficha_estado AS ENUM ('Activa','Inactiva','Extraviada'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_sexo AS ENUM ('Masculino','Femenino'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_telefono AS ENUM ('Casa','Oficina','Claro','Movistar','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_direccion AS ENUM ('Residencial','Laboral','Referencia','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE nivel_academico AS ENUM ('Primaria','Secundaria','Nivel_Tecnico','Licenciatura','Ingenieria','Postgrado','Maestria','Doctorado','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_relacion_persona AS ENUM ('Conyuge','Familiar','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_precision_fecha AS ENUM ('Dia','Mes','Ano'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE estado_operativo AS ENUM ('Lider','En_Formacion'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE categoria_motivo_suspension AS ENUM ('Conducta','Enfermedad','Personal','Disciplina','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_expediente_nino AS ENUM ('Conducta','Incidente','Observacion','Medico'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_evaluacion AS ENUM ('Desempeno','Formacion','Conducta','Ascenso','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_resultado_evaluacion AS ENUM ('Satisfactorio','En_Proceso','Insatisfactorio'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_info_medica AS ENUM ('Alergia','Medicamento','Condicion'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE severidad_medica AS ENUM ('Leve','Moderada','Alta'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tipo_denominacion AS ENUM ('Pentecostal','Evangelico','Católico','Testigo de Jehová','Otro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==================================================================
-- PARTE 2: TABLAS BASE (sin dependencias entre sí)
-- ==================================================================

CREATE TABLE IF NOT EXISTS Personas (
    ID_Persona       SERIAL       PRIMARY KEY,
    Nombres          VARCHAR(100) NOT NULL,
    Apellidos        VARCHAR(100) NOT NULL,
    Fecha_Nacimiento DATE,
    Telefono         VARCHAR(20),
    Sexo             tipo_sexo    DEFAULT NULL,
    Cedula           VARCHAR(20)  DEFAULT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_personas_cedula ON Personas (Cedula) WHERE Cedula IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personas_mes_nac ON Personas (EXTRACT(MONTH FROM Fecha_Nacimiento)) WHERE Fecha_Nacimiento IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personas_dia_nac ON Personas (EXTRACT(DAY FROM Fecha_Nacimiento)) WHERE Fecha_Nacimiento IS NOT NULL;

CREATE TABLE IF NOT EXISTS Roles (
    ID_Rol           SERIAL      PRIMARY KEY,
    Nombre_Rol       VARCHAR(60) NOT NULL UNIQUE,
    Nivel_Jerarquico SMALLINT    NOT NULL CHECK (Nivel_Jerarquico BETWEEN 1 AND 4),
    Activo           BOOLEAN     NOT NULL DEFAULT TRUE
);

INSERT INTO Roles (Nombre_Rol, Nivel_Jerarquico) VALUES
    ('Colaborador',         1),
    ('Maestro',             2),
    ('Staff',               3),
    ('Coordinador General', 4)
ON CONFLICT (Nombre_Rol) DO NOTHING;

CREATE TABLE IF NOT EXISTS Grupos (
    ID_Grupo    SERIAL      PRIMARY KEY,
    Nombre      VARCHAR(60) NOT NULL UNIQUE,
    Edad_Minima SMALLINT    NOT NULL,
    Edad_Maxima SMALLINT    NOT NULL,
    Activo      BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_edades_grupo CHECK (Edad_Minima >= 0 AND Edad_Maxima <= 12 AND Edad_Minima < Edad_Maxima)
);

INSERT INTO Grupos (Nombre, Edad_Minima, Edad_Maxima) VALUES
    ('4-6 años',   0,  6),
    ('7-9 años',   7,  9),
    ('10-12 años', 10, 12)
ON CONFLICT (Nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS Redes (
    ID_Red  SERIAL      PRIMARY KEY,
    Nombre  VARCHAR(60) NOT NULL UNIQUE,
    Activo  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Turnos (
    ID_Turno    SERIAL       PRIMARY KEY,
    Nombre      nombre_turno NOT NULL UNIQUE,
    Dia_Semana  SMALLINT     NOT NULL CHECK (Dia_Semana IN (0, 3)),
    Hora_Inicio TIME         NOT NULL,
    Activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO Turnos (Nombre, Dia_Semana, Hora_Inicio) VALUES
    ('Miercoles',    3, '18:30:00'),
    ('Domingo_8am',  0, '08:00:00'),
    ('Domingo_11am', 0, '11:00:00'),
    ('Domingo_5pm',  0, '17:00:00')
ON CONFLICT (Nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS Eventos (
    ID_Evento     SERIAL      PRIMARY KEY,
    Nombre        VARCHAR(100) NOT NULL,
    Descripcion   TEXT,
    Fecha         DATE         NOT NULL,
    ID_Turno      INT          REFERENCES Turnos(ID_Turno),
    Tipo          tipo_evento  NOT NULL DEFAULT 'Servicio Regular',
    Numero_Semana SMALLINT     GENERATED ALWAYS AS ((((EXTRACT(DAY FROM Fecha))::INT - 1) / 7 + 1)::SMALLINT) STORED,
    Activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_evento_fecha_turno UNIQUE (Fecha, ID_Turno)
);

CREATE INDEX IF NOT EXISTS idx_eventos_fecha  ON Eventos (Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_turno  ON Eventos (ID_Turno, Fecha);

CREATE TABLE IF NOT EXISTS Requisitos (
    ID_Requisito     SERIAL         PRIMARY KEY,
    Nombre           VARCHAR(100)   NOT NULL UNIQUE,
    Descripcion      TEXT,
    Tipo             tipo_requisito NOT NULL DEFAULT 'Formacion',
    ID_Rol_Requerido INT            REFERENCES Roles(ID_Rol),
    Obligatorio      BOOLEAN        NOT NULL DEFAULT FALSE,
    Activo           BOOLEAN        NOT NULL DEFAULT TRUE
);

INSERT INTO Requisitos (Nombre, Tipo, Obligatorio) VALUES
    ('Escuela de Nuevos Creyentes',   'Formacion',          TRUE),
    ('PEEH',                           'Formacion',          FALSE),
    ('BEE',                            'Formacion',          FALSE),
    ('Escuela de Artes',               'Formacion',          FALSE),
    ('Escuela de Obreros',             'Formacion',          TRUE),
    ('Bautizado en Agua',              'Estado_Ministerial', TRUE),
    ('Pertenecer a Círculo de Amistad','Estado_Ministerial', TRUE)
ON CONFLICT (Nombre) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_requisitos_tipo_activo ON Requisitos (Tipo, Activo);

-- ==================================================================
-- PARTE 3: TABLAS QUE DEPENDEN DE Personas Y Roles
-- ==================================================================

CREATE TABLE IF NOT EXISTS Ninos (
    ID_Persona              INT     PRIMARY KEY REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Observaciones_Generales TEXT,
    Activo                  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_ninos_persona ON Ninos (ID_Persona);

CREATE TABLE IF NOT EXISTS Info_Medica_Ninos (
    ID_Info       SERIAL          PRIMARY KEY,
    ID_Nino       INT             NOT NULL REFERENCES Ninos(ID_Persona) ON DELETE CASCADE,
    Tipo          tipo_info_medica NOT NULL,
    Descripcion   TEXT            NOT NULL,
    Severidad     severidad_medica NOT NULL DEFAULT 'Leve',
    Instrucciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_medica_nino_tipo ON Info_Medica_Ninos (ID_Nino, Tipo);

CREATE TABLE IF NOT EXISTS Ninos_Grupos (
    ID_Nino          INT     NOT NULL REFERENCES Ninos(ID_Persona) ON DELETE RESTRICT,
    ID_Grupo         INT     NOT NULL REFERENCES Grupos(ID_Grupo),
    Fecha_Asignacion DATE    NOT NULL DEFAULT CURRENT_DATE,
    Activo           BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Nino, ID_Grupo)
);

CREATE TABLE IF NOT EXISTS Fichas (
    ID_Ficha     SERIAL       PRIMARY KEY,
    Codigo_Ficha VARCHAR(20)  NOT NULL UNIQUE,
    Estado       ficha_estado NOT NULL DEFAULT 'Activa',
    ID_Grupo     INT          NOT NULL REFERENCES Grupos(ID_Grupo),
    Tipo         VARCHAR(10)  CHECK (Tipo IN ('Entrada','Salida'))
);

CREATE INDEX IF NOT EXISTS idx_fichas_grupo  ON Fichas (ID_Grupo);
CREATE INDEX IF NOT EXISTS idx_fichas_codigo ON Fichas (Codigo_Ficha);

CREATE TABLE IF NOT EXISTS Tutores (
    ID_Persona  INT         PRIMARY KEY REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Tipo_Tutor  VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS Tutores_Ninos (
    ID_Tutor  INT NOT NULL REFERENCES Tutores(ID_Persona) ON DELETE CASCADE,
    ID_Nino   INT NOT NULL REFERENCES Ninos(ID_Persona)   ON DELETE RESTRICT,
    PRIMARY KEY (ID_Tutor, ID_Nino)
);

CREATE INDEX IF NOT EXISTS idx_tutores_ninos ON Tutores_Ninos (ID_Nino);

CREATE TABLE IF NOT EXISTS Personal_Sistema (
    ID_Persona           INT         PRIMARY KEY REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Usuario              VARCHAR(30) NOT NULL UNIQUE,
    Password_Hash        VARCHAR(60) NOT NULL,
    ID_Rol               INT         NOT NULL REFERENCES Roles(ID_Rol),
    Activo               BOOLEAN     NOT NULL DEFAULT TRUE,
    Fecha_Ingreso_Servicio DATE       NOT NULL DEFAULT CURRENT_DATE,
    ID_Creado_Por        INT         REFERENCES Personal_Sistema(ID_Persona),
    ID_Autorizado_Por    INT         REFERENCES Personal_Sistema(ID_Persona),
    ID_Solicitud_Origen  INT
);

CREATE INDEX IF NOT EXISTS idx_personal_rol_activo ON Personal_Sistema (ID_Rol, Activo);

-- ==================================================================
-- PARTE 4: TABLAS NUEVAS v5.1 (dependen de Personal_Sistema)
-- ==================================================================

-- Función de auditoría updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.Actualizado_En = NOW();
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS Telefonos_Personas (
    ID_Telefono    SERIAL        PRIMARY KEY,
    ID_Persona     INT           NOT NULL REFERENCES Personas(ID_Persona) ON DELETE CASCADE,
    Tipo           tipo_telefono NOT NULL DEFAULT 'Otro',
    Numero         VARCHAR(20)   NOT NULL,
    Tiene_Whatsapp BOOLEAN       NOT NULL DEFAULT FALSE,
    Es_Principal   BOOLEAN       NOT NULL DEFAULT FALSE,
    Activo         BOOLEAN       NOT NULL DEFAULT TRUE,
    Creado_En      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    Actualizado_En TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_telefonos_persona ON Telefonos_Personas (ID_Persona);
CREATE UNIQUE INDEX IF NOT EXISTS uq_un_principal_activo ON Telefonos_Personas (ID_Persona) WHERE Es_Principal = TRUE AND Activo = TRUE;

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_telefonos ON Telefonos_Personas;
CREATE TRIGGER trg_auditoria_updated_at_telefonos BEFORE UPDATE ON Telefonos_Personas FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE IF NOT EXISTS Personas_Direcciones (
    ID_Direccion        SERIAL         PRIMARY KEY,
    ID_Persona          INT            NOT NULL REFERENCES Personas(ID_Persona) ON DELETE CASCADE,
    Tipo_Direccion      tipo_direccion NOT NULL DEFAULT 'Residencial',
    Ciudad_Departamento VARCHAR(60),
    Municipio           VARCHAR(60),
    Distrito            VARCHAR(60),
    Barrio              VARCHAR(60),
    Direccion_Exacta    TEXT,
    Es_Principal        BOOLEAN        NOT NULL DEFAULT TRUE,
    Activo              BOOLEAN        NOT NULL DEFAULT TRUE,
    Creado_En           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    Actualizado_En      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_direcciones_persona ON Personas_Direcciones (ID_Persona);
CREATE UNIQUE INDEX IF NOT EXISTS uq_una_dir_principal ON Personas_Direcciones (ID_Persona) WHERE Es_Principal = TRUE AND Activo = TRUE;

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_direcciones ON Personas_Direcciones;
CREATE TRIGGER trg_auditoria_updated_at_direcciones BEFORE UPDATE ON Personas_Direcciones FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE IF NOT EXISTS Personal_Lideres (
    ID_Lider   SERIAL  PRIMARY KEY,
    ID_Persona INT     NOT NULL REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Activo     BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_lider_persona UNIQUE (ID_Persona)
);

CREATE INDEX IF NOT EXISTS idx_lideres_activo ON Personal_Lideres (Activo) WHERE Activo = TRUE;

CREATE TABLE IF NOT EXISTS Circulos_Amistad (
    ID_Circulo  SERIAL       PRIMARY KEY,
    Nombre      VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    Creado_En   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_circulo_nombre UNIQUE (Nombre)
);

CREATE INDEX IF NOT EXISTS idx_circulos_activo ON Circulos_Amistad (Activo) WHERE Activo = TRUE;

CREATE TABLE IF NOT EXISTS Personal_Info_Personal (
    ID_Persona      INT             PRIMARY KEY REFERENCES Personal_Sistema(ID_Persona) ON DELETE CASCADE,
    Estado_Civil    estado_civil    NOT NULL DEFAULT 'Soltero',
    Condicion_Civil condicion_civil NOT NULL DEFAULT 'Ninguna',
    Nombre_Conyuge  VARCHAR(100),
    Tiene_Hijos     BOOLEAN         NOT NULL DEFAULT FALSE,
    Numero_Hijos    SMALLINT,
    Direccion       TEXT,
    Ocupacion       VARCHAR(150)    DEFAULT NULL,
    Centro_Laboral  VARCHAR(150)    DEFAULT NULL,
    Nivel_Academico nivel_academico DEFAULT NULL,
    CONSTRAINT chk_conyuge      CHECK (Estado_Civil <> 'Casado' OR Nombre_Conyuge IS NOT NULL),
    CONSTRAINT chk_numero_hijos CHECK (Tiene_Hijos = FALSE OR (Numero_Hijos IS NOT NULL AND Numero_Hijos > 0))
);

CREATE TABLE IF NOT EXISTS Personal_Info_Iglesia (
    ID_Persona                  INT              PRIMARY KEY REFERENCES Personal_Sistema(ID_Persona) ON DELETE CASCADE,
    ID_Red                      INT              REFERENCES Redes(ID_Red),
    Estado_Liderazgo            estado_liderazgo,
    Estado_Operativo            estado_operativo  DEFAULT NULL,
    ID_Lider                    INT              REFERENCES Personal_Lideres(ID_Lider) ON DELETE SET NULL,
    ID_Circulo                  INT              REFERENCES Circulos_Amistad(ID_Circulo) ON DELETE SET NULL,
    Tiempo_Iglesia_Meses        INT              CHECK (Tiempo_Iglesia_Meses >= 0),
    Ministerio_Adicional        VARCHAR(150),
    Bautizado_Agua              BOOLEAN          NOT NULL DEFAULT FALSE,
    Fecha_Bautismo              DATE             DEFAULT NULL,
    Fecha_Bautismo_Precision    tipo_precision_fecha DEFAULT NULL,
    Circulo_Amistad_Desde       DATE             DEFAULT NULL,
    Circulo_Amistad_Precision   tipo_precision_fecha DEFAULT NULL,
    Clases_Biblicas_Ninos       BOOLEAN          NOT NULL DEFAULT FALSE,
    Clases_Biblicas_Detalle     TEXT             DEFAULT NULL,
    Capacitacion_Ensenanza      BOOLEAN          NOT NULL DEFAULT FALSE,
    Capacitacion_Detalle        TEXT             DEFAULT NULL,
    Observaciones_Espirituales  TEXT             DEFAULT NULL,
    Asistio_Otra_Iglesia        BOOLEAN          DEFAULT FALSE,
    Nombre_Otra_Iglesia         TEXT             DEFAULT NULL,
    Denominacion_Otra_Iglesia   tipo_denominacion DEFAULT NULL,
    CONSTRAINT chk_bautismo_precision  CHECK (Fecha_Bautismo IS NULL OR Fecha_Bautismo_Precision IS NOT NULL),
    CONSTRAINT chk_circulo_precision   CHECK (Circulo_Amistad_Desde IS NULL OR Circulo_Amistad_Precision IS NOT NULL),
    CONSTRAINT chk_clases_detalle      CHECK (Clases_Biblicas_Ninos = FALSE OR Clases_Biblicas_Detalle IS NOT NULL),
    CONSTRAINT chk_capacitacion_detalle CHECK (Capacitacion_Ensenanza = FALSE OR Capacitacion_Detalle IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_iglesia_liderazgo ON Personal_Info_Iglesia (Estado_Liderazgo) WHERE Estado_Liderazgo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iglesia_red        ON Personal_Info_Iglesia (ID_Red) WHERE ID_Red IS NOT NULL;

CREATE TABLE IF NOT EXISTS Personal_Requisitos (
    ID_Personal    INT     NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE CASCADE,
    ID_Requisito   INT     NOT NULL REFERENCES Requisitos(ID_Requisito),
    Cumplido       BOOLEAN NOT NULL DEFAULT FALSE,
    Fecha_Cumplido DATE,
    Notas          TEXT,
    PRIMARY KEY (ID_Personal, ID_Requisito),
    CONSTRAINT chk_fecha_cumplido CHECK (Cumplido = FALSE OR Fecha_Cumplido IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_personal_requisitos ON Personal_Requisitos (ID_Personal);

CREATE TABLE IF NOT EXISTS Personal_Turnos (
    ID_Personal      INT     NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Turno         INT     NOT NULL REFERENCES Turnos(ID_Turno),
    Fecha_Asignacion DATE    NOT NULL DEFAULT CURRENT_DATE,
    Activo           BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Personal, ID_Turno)
);

CREATE TABLE IF NOT EXISTS Personal_Grupos (
    ID_Personal INT NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Grupo    INT NOT NULL REFERENCES Grupos(ID_Grupo),
    ID_Turno    INT NOT NULL REFERENCES Turnos(ID_Turno),
    PRIMARY KEY (ID_Personal, ID_Grupo, ID_Turno)
);

CREATE INDEX IF NOT EXISTS idx_personal_grupos ON Personal_Grupos (ID_Personal, ID_Grupo);

-- ==================================================================
-- PARTE 5: SOLICITUDES (depende de Personal_Sistema, Roles, Redes, etc.)
-- ==================================================================

CREATE TABLE IF NOT EXISTS Solicitudes_Personal (
    ID_Solicitud                  SERIAL           PRIMARY KEY,
    ID_Persona                    INT              NOT NULL REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    ID_Rol_Solicitado             INT              NOT NULL REFERENCES Roles(ID_Rol),
    ID_Gestionado_Por             INT              NOT NULL REFERENCES Personal_Sistema(ID_Persona),
    ID_Resuelto_Por               INT              REFERENCES Personal_Sistema(ID_Persona),
    Estado                        estado_solicitud NOT NULL DEFAULT 'Pendiente',
    Fecha_Solicitud               TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    Fecha_Resolucion              TIMESTAMPTZ,
    Notas_Staff                   TEXT,
    Notas_Coordinador             TEXT,
    -- Snapshot del formulario
    Sexo_Candidato                tipo_sexo            DEFAULT NULL,
    Cedula_Candidato              VARCHAR(20)          DEFAULT NULL,
    Estado_Civil                  estado_civil,
    Condicion_Civil               condicion_civil      NOT NULL DEFAULT 'Ninguna',
    Nombre_Conyuge                VARCHAR(100),
    Conyuge_Ocupacion             VARCHAR(150)         DEFAULT NULL,
    Conyuge_Centro_Laboral        VARCHAR(150)         DEFAULT NULL,
    Tiene_Hijos                   BOOLEAN              NOT NULL DEFAULT FALSE,
    Numero_Hijos                  SMALLINT,
    Dir_Ciudad                    VARCHAR(60)          DEFAULT NULL,
    Dir_Municipio                 VARCHAR(60)          DEFAULT NULL,
    Dir_Distrito                  VARCHAR(60)          DEFAULT NULL,
    Dir_Barrio                    VARCHAR(60)          DEFAULT NULL,
    Dir_Exacta                    TEXT                 DEFAULT NULL,
    Tel_Casa                      VARCHAR(20)          DEFAULT NULL,
    Tel_Oficina                   VARCHAR(20)          DEFAULT NULL,
    Tel_Claro                     VARCHAR(20)          DEFAULT NULL,
    Tel_Movistar                  VARCHAR(20)          DEFAULT NULL,
    Ocupacion_Candidato           VARCHAR(150)         DEFAULT NULL,
    Centro_Laboral_Candidato      VARCHAR(150)         DEFAULT NULL,
    Nivel_Academico_Candidato     nivel_academico      DEFAULT NULL,
    ID_Red                        INT                  REFERENCES Redes(ID_Red),
    Estado_Liderazgo              estado_liderazgo,
    Estado_Operativo_Candidato    estado_operativo     DEFAULT NULL,
    ID_Lider_Propuesto            INT                  REFERENCES Personal_Lideres(ID_Lider) ON DELETE SET NULL,
    Circulo_Amistad               VARCHAR(100),
    Circulo_Amistad_Desde         DATE                 DEFAULT NULL,
    Circulo_Amistad_Precision     tipo_precision_fecha DEFAULT NULL,
    Tiempo_Iglesia_Meses          INT                  CHECK (Tiempo_Iglesia_Meses >= 0),
    Ministerio_Adicional          VARCHAR(150),
    Bautizado_Agua                BOOLEAN              NOT NULL DEFAULT FALSE,
    Fecha_Bautismo                DATE                 DEFAULT NULL,
    Fecha_Bautismo_Precision      tipo_precision_fecha DEFAULT NULL,
    Clases_Biblicas_Ninos         BOOLEAN              NOT NULL DEFAULT FALSE,
    Clases_Biblicas_Detalle       TEXT                 DEFAULT NULL,
    Capacitacion_Ensenanza        BOOLEAN              NOT NULL DEFAULT FALSE,
    Capacitacion_Detalle          TEXT                 DEFAULT NULL,
    Observaciones_Espirituales_Sol TEXT                DEFAULT NULL,
    Asistio_Otra_Iglesia          BOOLEAN              DEFAULT FALSE,
    Nombre_Otra_Iglesia           TEXT                 DEFAULT NULL,
    Denominacion_Otra_Iglesia     tipo_denominacion    DEFAULT NULL,
    CONSTRAINT chk_sol_fecha_resolucion  CHECK (Fecha_Resolucion IS NULL OR Fecha_Resolucion >= Fecha_Solicitud),
    CONSTRAINT chk_sol_conyuge           CHECK (Estado_Civil IS NULL OR Estado_Civil <> 'Casado' OR Nombre_Conyuge IS NOT NULL),
    CONSTRAINT chk_sol_hijos             CHECK (Tiene_Hijos = FALSE OR (Numero_Hijos IS NOT NULL AND Numero_Hijos > 0))
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado  ON Solicitudes_Personal (Estado, Fecha_Solicitud DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_persona ON Solicitudes_Personal (ID_Persona);

-- FK diferida: Personal_Sistema → Solicitudes_Personal
ALTER TABLE Personal_Sistema
    ADD CONSTRAINT fk_solicitud_origen
        FOREIGN KEY (ID_Solicitud_Origen)
        REFERENCES Solicitudes_Personal(ID_Solicitud)
        ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS Solicitudes_Requisitos (
    ID_Solicitud   INT     NOT NULL REFERENCES Solicitudes_Personal(ID_Solicitud) ON DELETE CASCADE,
    ID_Requisito   INT     NOT NULL REFERENCES Requisitos(ID_Requisito),
    Cumplido       BOOLEAN NOT NULL DEFAULT FALSE,
    Fecha_Cumplido DATE,
    Notas          TEXT,
    PRIMARY KEY (ID_Solicitud, ID_Requisito),
    CONSTRAINT chk_sr_fecha_cumplido CHECK (Cumplido = FALSE OR Fecha_Cumplido IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_sol_requisitos ON Solicitudes_Requisitos (ID_Solicitud);

CREATE TABLE IF NOT EXISTS Solicitudes_Historial_Estado (
    ID_Historial    SERIAL           PRIMARY KEY,
    ID_Solicitud    INT              NOT NULL REFERENCES Solicitudes_Personal(ID_Solicitud) ON DELETE RESTRICT,
    Estado_Anterior estado_solicitud,
    Estado_Nuevo    estado_solicitud NOT NULL,
    Fecha_Cambio    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    ID_Cambiado_Por INT              NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas           TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_estado_solicitud ON Solicitudes_Historial_Estado (ID_Solicitud, Fecha_Cambio DESC);

-- ==================================================================
-- PARTE 6: ASISTENCIA
-- ==================================================================

CREATE TABLE IF NOT EXISTS Asistencia_Ninos (
    ID_Asistencia              SERIAL                  PRIMARY KEY,
    ID_Nino                    INT                     NOT NULL REFERENCES Ninos(ID_Persona) ON DELETE RESTRICT,
    Fecha                      DATE                    NOT NULL DEFAULT CURRENT_DATE,
    ID_Turno                   INT                     NOT NULL REFERENCES Turnos(ID_Turno),
    ID_Evento                  INT                     REFERENCES Eventos(ID_Evento),
    ID_Grupo_Asistido          INT                     REFERENCES Grupos(ID_Grupo),
    ID_Ficha_Entrada           INT                     NOT NULL REFERENCES Fichas(ID_Ficha),
    ID_Ficha_Salida            INT                     REFERENCES Fichas(ID_Ficha),
    Hora_Entrada               TIME                    NOT NULL DEFAULT CURRENT_TIME,
    Hora_Salida                TIME,
    Estado                     estado_asistencia_nino  NOT NULL DEFAULT 'Presente',
    ID_Ingresado_Por           INT                     NOT NULL REFERENCES Personal_Sistema(ID_Persona),
    ID_Retirado_Por            INT                     REFERENCES Tutores(ID_Persona),
    Acompanante_En_Aula        BOOLEAN                 NOT NULL DEFAULT FALSE,
    Es_Excepcion_Asistencia    BOOLEAN                 NOT NULL DEFAULT FALSE,
    Motivo_Excepcion_Asistencia VARCHAR(255),
    Notas                      TEXT,
    CONSTRAINT uq_nino_fecha_turno       UNIQUE (ID_Nino, Fecha, ID_Turno),
    CONSTRAINT chk_estado_retirado       CHECK (Estado = 'Presente' OR (Estado = 'Retirado' AND ID_Retirado_Por IS NOT NULL AND Hora_Salida IS NOT NULL)),
    CONSTRAINT chk_excepcion_asist_motivo CHECK (Es_Excepcion_Asistencia = FALSE OR Motivo_Excepcion_Asistencia IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_asistencia_turno    ON Asistencia_Ninos (ID_Turno, Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asistencia_ficha_ent ON Asistencia_Ninos (ID_Ficha_Entrada);
CREATE INDEX IF NOT EXISTS idx_salida_pendiente     ON Asistencia_Ninos (Fecha, ID_Nino) WHERE Estado = 'Presente';

CREATE TABLE IF NOT EXISTS Asistencia_Maestros (
    ID_Asistencia  SERIAL          PRIMARY KEY,
    ID_Personal    INT             NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Fecha          DATE            NOT NULL DEFAULT CURRENT_DATE,
    ID_Turno       INT             NOT NULL REFERENCES Turnos(ID_Turno),
    ID_Evento      INT             REFERENCES Eventos(ID_Evento),
    Estado_Llegada estado_llegada  NOT NULL,
    Hora_Llegada   TIME,
    Razon_Ausencia TEXT,
    Comentarios    TEXT,
    CONSTRAINT uq_personal_fecha_turno UNIQUE (ID_Personal, Fecha, ID_Turno),
    CONSTRAINT chk_razon_injustificado CHECK (Estado_Llegada <> 'Injustificado' OR Razon_Ausencia IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_asist_maestro_turno  ON Asistencia_Maestros (ID_Turno, Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asist_maestro_estado ON Asistencia_Maestros (Estado_Llegada, Fecha DESC);

-- ==================================================================
-- PARTE 7: TABLAS COMPLEMENTARIAS
-- ==================================================================

CREATE TABLE IF NOT EXISTS Personal_Historial_Lideres (
    ID_Historial      SERIAL      PRIMARY KEY,
    ID_Personal       INT         NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Lider_Anterior INT         REFERENCES Personal_Lideres(ID_Lider),
    ID_Lider_Nuevo    INT         REFERENCES Personal_Lideres(ID_Lider),
    Fecha_Cambio      DATE        NOT NULL DEFAULT CURRENT_DATE,
    ID_Registrado_Por INT         NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas             TEXT,
    Creado_En         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_lideres_personal ON Personal_Historial_Lideres (ID_Personal, Fecha_Cambio DESC);

CREATE TABLE IF NOT EXISTS Personal_Historial_Roles (
    ID_Historial     SERIAL  PRIMARY KEY,
    ID_Personal      INT     NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Rol_Anterior  INT     REFERENCES Roles(ID_Rol),
    ID_Rol_Nuevo     INT     NOT NULL REFERENCES Roles(ID_Rol),
    Fecha_Cambio     DATE    NOT NULL DEFAULT CURRENT_DATE,
    ID_Autorizado_Por INT    NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas            TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_personal ON Personal_Historial_Roles (ID_Personal, Fecha_Cambio DESC);

CREATE TABLE IF NOT EXISTS Personal_Suspensiones_Servicio (
    ID_Suspension     SERIAL                      PRIMARY KEY,
    ID_Personal       INT                         NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Fecha_Inicio      DATE                        NOT NULL DEFAULT CURRENT_DATE,
    Fecha_Fin         DATE,
    Categoria_Motivo  categoria_motivo_suspension NOT NULL DEFAULT 'Otro',
    Motivo            TEXT                        NOT NULL,
    ID_Registrado_Por INT                         NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Activo            BOOLEAN                     NOT NULL DEFAULT TRUE,
    Creado_En         TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    Actualizado_En    TIMESTAMPTZ,
    CONSTRAINT chk_suspension_fechas CHECK (Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio)
);

CREATE INDEX IF NOT EXISTS idx_suspensiones_personal ON Personal_Suspensiones_Servicio (ID_Personal, Activo, Fecha_Inicio, Fecha_Fin);

DROP TRIGGER IF EXISTS trg_auditoria_updated_at_suspensiones ON Personal_Suspensiones_Servicio;
CREATE TRIGGER trg_auditoria_updated_at_suspensiones BEFORE UPDATE ON Personal_Suspensiones_Servicio FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE IF NOT EXISTS Ninos_Expedientes_Conducta (
    ID_Expediente    SERIAL               PRIMARY KEY,
    ID_Nino          INT                  NOT NULL REFERENCES Ninos(ID_Persona) ON DELETE RESTRICT,
    Fecha            DATE                 NOT NULL DEFAULT CURRENT_DATE,
    ID_Turno         INT                  REFERENCES Turnos(ID_Turno),
    ID_Evento        INT                  REFERENCES Eventos(ID_Evento),
    Tipo             tipo_expediente_nino NOT NULL DEFAULT 'Observacion',
    Descripcion      TEXT                 NOT NULL,
    ID_Reportado_Por INT                  NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Resuelto         BOOLEAN              NOT NULL DEFAULT FALSE,
    Notas_Resolucion TEXT,
    Creado_En        TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expediente_nino       ON Ninos_Expedientes_Conducta (ID_Nino, Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_expediente_tipo       ON Ninos_Expedientes_Conducta (Tipo, Resuelto);
CREATE INDEX IF NOT EXISTS idx_expediente_nino_activo ON Ninos_Expedientes_Conducta (ID_Nino, Resuelto) WHERE Resuelto = FALSE;

CREATE TABLE IF NOT EXISTS Relaciones_Personas (
    ID_Persona_A      INT                   NOT NULL REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    ID_Persona_B      INT                   NOT NULL REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
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

-- ==================================================================
-- PARTE 8: TRIGGERS DE NEGOCIO
-- ==================================================================

-- Validar fecha de nacimiento al insertar niño
CREATE OR REPLACE FUNCTION fn_validar_fecha_nac_nino()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT Fecha_Nacimiento FROM Personas WHERE ID_Persona = NEW.ID_Persona) IS NULL THEN
        RAISE EXCEPTION 'El niño (ID_Persona: %) debe tener Fecha_Nacimiento registrada.', NEW.ID_Persona;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_nino_fecha_nac ON Ninos;
CREATE TRIGGER trg_nino_fecha_nac BEFORE INSERT ON Ninos FOR EACH ROW EXECUTE FUNCTION fn_validar_fecha_nac_nino();

-- Auto-asignar grupo por edad al registrar asistencia
CREATE OR REPLACE FUNCTION fn_autoasignar_grupo_asistencia()
RETURNS TRIGGER AS $$
DECLARE
    v_fecha_nac DATE;
    v_edad      INT;
    v_id_grupo  INT;
BEGIN
    SELECT p.Fecha_Nacimiento INTO v_fecha_nac FROM Personas p WHERE p.ID_Persona = NEW.ID_Nino;
    IF v_fecha_nac IS NULL THEN
        RAISE EXCEPTION 'El niño (ID: %) no tiene Fecha_Nacimiento registrada.', NEW.ID_Nino;
    END IF;
    v_edad := DATE_PART('year', AGE(NEW.Fecha, v_fecha_nac))::INT;
    SELECT ID_Grupo INTO v_id_grupo FROM Grupos WHERE Activo = TRUE AND v_edad >= Edad_Minima AND v_edad <= Edad_Maxima LIMIT 1;
    IF NEW.ID_Grupo_Asistido IS NULL THEN
        IF v_id_grupo IS NULL THEN
            RAISE EXCEPTION 'No existe grupo activo para un niño de % años.', v_edad;
        END IF;
        NEW.ID_Grupo_Asistido           := v_id_grupo;
        NEW.Es_Excepcion_Asistencia     := FALSE;
        NEW.Motivo_Excepcion_Asistencia := NULL;
    ELSE
        IF v_id_grupo IS NULL OR NEW.ID_Grupo_Asistido <> v_id_grupo THEN
            NEW.Es_Excepcion_Asistencia := TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_autoasignar_grupo_asistencia ON Asistencia_Ninos;
CREATE TRIGGER trg_autoasignar_grupo_asistencia BEFORE INSERT ON Asistencia_Ninos FOR EACH ROW EXECUTE FUNCTION fn_autoasignar_grupo_asistencia();

-- Validar retiro de niño
CREATE OR REPLACE FUNCTION fn_validar_retiro_nino()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ID_Retirado_Por IS NOT NULL AND OLD.ID_Retirado_Por IS NULL THEN
        IF NEW.ID_Retirado_Por = OLD.ID_Ingresado_Por THEN
            NEW.Estado := 'Retirado'; RETURN NEW;
        END IF;
        IF EXISTS (SELECT 1 FROM Tutores_Ninos tn WHERE tn.ID_Nino = NEW.ID_Nino AND tn.ID_Tutor = NEW.ID_Retirado_Por) THEN
            NEW.Estado := 'Retirado'; RETURN NEW;
        END IF;
        RAISE EXCEPTION 'Persona (ID: %) NO autorizada para retirar al niño (ID: %).', NEW.ID_Retirado_Por, NEW.ID_Nino;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_retiro_nino ON Asistencia_Ninos;
CREATE TRIGGER trg_validar_retiro_nino BEFORE UPDATE ON Asistencia_Ninos FOR EACH ROW EXECUTE FUNCTION fn_validar_retiro_nino();

-- Validar bcrypt en Personal_Sistema
CREATE OR REPLACE FUNCTION fn_validar_hash_bcrypt()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Password_Hash IS NOT NULL AND NEW.Password_Hash NOT SIMILAR TO '\$2[aby]\$%' THEN
        RAISE EXCEPTION 'Password_Hash debe ser un hash bcrypt válido.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_hash_bcrypt ON Personal_Sistema;
CREATE TRIGGER trg_validar_hash_bcrypt BEFORE INSERT OR UPDATE OF Password_Hash ON Personal_Sistema FOR EACH ROW EXECUTE FUNCTION fn_validar_hash_bcrypt();

-- Auditoría cambio de rol
CREATE OR REPLACE FUNCTION fn_auditoria_cambio_rol()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_autorizador INT;
BEGIN
    IF OLD.ID_Rol IS DISTINCT FROM NEW.ID_Rol THEN
        v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_autorizador IS NULL THEN
            RAISE EXCEPTION 'app.id_autorizador no está definido. Usar SET LOCAL app.id_autorizador = <id> antes del UPDATE.';
        END IF;
        INSERT INTO Personal_Historial_Roles (ID_Personal, ID_Rol_Anterior, ID_Rol_Nuevo, ID_Autorizado_Por)
        VALUES (NEW.ID_Persona, OLD.ID_Rol, NEW.ID_Rol, v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditoria_cambio_rol ON Personal_Sistema;
CREATE TRIGGER trg_auditoria_cambio_rol AFTER UPDATE OF ID_Rol ON Personal_Sistema FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_rol();

-- Auditoría cambio de estado de solicitud
CREATE OR REPLACE FUNCTION fn_auditoria_cambio_estado_solicitud()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_responsable INT;
BEGIN
    IF OLD.Estado IS DISTINCT FROM NEW.Estado THEN
        v_responsable := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_responsable IS NULL THEN
            RAISE EXCEPTION 'app.id_autorizador no está definido.';
        END IF;
        INSERT INTO Solicitudes_Historial_Estado (ID_Solicitud, Estado_Anterior, Estado_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Solicitud, OLD.Estado, NEW.Estado, v_responsable);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditoria_cambio_estado_solicitud ON Solicitudes_Personal;
CREATE TRIGGER trg_auditoria_cambio_estado_solicitud AFTER UPDATE OF Estado ON Solicitudes_Personal FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_estado_solicitud();

-- Propagación de datos al aprobar solicitud (versión final v5.9)
CREATE OR REPLACE FUNCTION fn_propagar_datos_solicitud_aprobada()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Estado = 'Aprobado' AND OLD.Estado = 'Pendiente' THEN
        UPDATE Personas SET
            Sexo   = COALESCE(Personas.Sexo,   NEW.Sexo_Candidato),
            Cedula = COALESCE(Personas.Cedula,  NEW.Cedula_Candidato)
        WHERE ID_Persona = NEW.ID_Persona;

        INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
        SELECT NEW.ID_Persona, tipo, numero, (ROW_NUMBER() OVER (ORDER BY orden) = 1)
        FROM (VALUES (1,'Casa'::tipo_telefono,NEW.Tel_Casa),(2,'Oficina'::tipo_telefono,NEW.Tel_Oficina),(3,'Claro'::tipo_telefono,NEW.Tel_Claro),(4,'Movistar'::tipo_telefono,NEW.Tel_Movistar)) AS t(orden,tipo,numero)
        WHERE numero IS NOT NULL ON CONFLICT DO NOTHING;

        INSERT INTO Personas_Direcciones (ID_Persona,Tipo_Direccion,Ciudad_Departamento,Municipio,Distrito,Barrio,Direccion_Exacta,Es_Principal)
        SELECT NEW.ID_Persona,'Residencial',NEW.Dir_Ciudad,NEW.Dir_Municipio,NEW.Dir_Distrito,NEW.Dir_Barrio,NEW.Dir_Exacta,TRUE
        WHERE NEW.Dir_Exacta IS NOT NULL OR NEW.Dir_Ciudad IS NOT NULL ON CONFLICT DO NOTHING;

        INSERT INTO Personal_Info_Personal (ID_Persona,Estado_Civil,Condicion_Civil,Nombre_Conyuge,Tiene_Hijos,Numero_Hijos,Direccion,Ocupacion,Centro_Laboral,Nivel_Academico)
        SELECT ps.ID_Persona,NEW.Estado_Civil,NEW.Condicion_Civil,NEW.Nombre_Conyuge,NEW.Tiene_Hijos,NEW.Numero_Hijos,NEW.Dir_Exacta,NEW.Ocupacion_Candidato,NEW.Centro_Laboral_Candidato,NEW.Nivel_Academico_Candidato
        FROM Personal_Sistema ps WHERE ps.ID_Persona = NEW.ID_Persona AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO UPDATE SET Estado_Civil=EXCLUDED.Estado_Civil,Condicion_Civil=EXCLUDED.Condicion_Civil,Nombre_Conyuge=EXCLUDED.Nombre_Conyuge,Tiene_Hijos=EXCLUDED.Tiene_Hijos,Numero_Hijos=EXCLUDED.Numero_Hijos,Ocupacion=EXCLUDED.Ocupacion,Centro_Laboral=EXCLUDED.Centro_Laboral,Nivel_Academico=EXCLUDED.Nivel_Academico;

        INSERT INTO Personal_Info_Iglesia (ID_Persona,ID_Red,Estado_Liderazgo,Estado_Operativo,ID_Lider,ID_Circulo,Tiempo_Iglesia_Meses,Ministerio_Adicional,Bautizado_Agua,Fecha_Bautismo,Fecha_Bautismo_Precision,Circulo_Amistad_Desde,Circulo_Amistad_Precision,Clases_Biblicas_Ninos,Clases_Biblicas_Detalle,Capacitacion_Ensenanza,Capacitacion_Detalle,Observaciones_Espirituales,Asistio_Otra_Iglesia,Nombre_Otra_Iglesia,Denominacion_Otra_Iglesia)
        SELECT ps.ID_Persona,NEW.ID_Red,NEW.Estado_Liderazgo,CASE NEW.Estado_Liderazgo WHEN 'Lider' THEN 'Lider'::estado_operativo WHEN 'Mentor' THEN 'Lider'::estado_operativo WHEN 'Lider_Apoyo' THEN 'Lider'::estado_operativo ELSE 'En_Formacion'::estado_operativo END,NEW.ID_Lider_Propuesto,(SELECT ID_Circulo FROM Circulos_Amistad WHERE TRIM(Nombre)=TRIM(NEW.Circulo_Amistad) LIMIT 1),NEW.Tiempo_Iglesia_Meses,NEW.Ministerio_Adicional,NEW.Bautizado_Agua,NEW.Fecha_Bautismo,NEW.Fecha_Bautismo_Precision,NEW.Circulo_Amistad_Desde,NEW.Circulo_Amistad_Precision,NEW.Clases_Biblicas_Ninos,NEW.Clases_Biblicas_Detalle,NEW.Capacitacion_Ensenanza,NEW.Capacitacion_Detalle,NEW.Observaciones_Espirituales_Sol,NEW.Asistio_Otra_Iglesia,NEW.Nombre_Otra_Iglesia,NEW.Denominacion_Otra_Iglesia
        FROM Personal_Sistema ps WHERE ps.ID_Persona = NEW.ID_Persona AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        INSERT INTO Personal_Requisitos (ID_Personal,ID_Requisito,Cumplido,Fecha_Cumplido,Notas)
        SELECT ps.ID_Persona,sr.ID_Requisito,sr.Cumplido,sr.Fecha_Cumplido,sr.Notas
        FROM Solicitudes_Requisitos sr JOIN Personal_Sistema ps ON ps.ID_Persona=NEW.ID_Persona AND ps.ID_Solicitud_Origen=NEW.ID_Solicitud
        ON CONFLICT (ID_Personal,ID_Requisito) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_propagar_datos_solicitud ON Solicitudes_Personal;
CREATE TRIGGER trg_propagar_datos_solicitud AFTER UPDATE OF Estado ON Solicitudes_Personal FOR EACH ROW EXECUTE FUNCTION fn_propagar_datos_solicitud_aprobada();

-- ==================================================================
-- PARTE 9: VISTAS
-- ==================================================================

CREATE OR REPLACE VIEW v_personal_disponible_servicio AS
SELECT ps.ID_Persona, p.Nombres||' '||p.Apellidos AS Nombre_Completo, r.Nombre_Rol AS Rol, ps.Fecha_Ingreso_Servicio
FROM Personal_Sistema ps JOIN Personas p ON ps.ID_Persona=p.ID_Persona JOIN Roles r ON ps.ID_Rol=r.ID_Rol
WHERE ps.Activo=TRUE AND NOT EXISTS (SELECT 1 FROM Personal_Suspensiones_Servicio pss WHERE pss.ID_Personal=ps.ID_Persona AND pss.Activo=TRUE AND pss.Fecha_Inicio<=CURRENT_DATE AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin>=CURRENT_DATE))
ORDER BY r.Nivel_Jerarquico DESC, p.Apellidos, p.Nombres;

CREATE OR REPLACE VIEW v_ninos_presentes AS
SELECT an.Fecha, t.Nombre AS Turno, p.Nombres||' '||p.Apellidos AS Nino, g.Nombre AS Grupo, an.Es_Excepcion_Asistencia, an.Acompanante_En_Aula, an.Hora_Entrada, f.Codigo_Ficha AS Ficha_Entrada, an.Estado
FROM Asistencia_Ninos an JOIN Personas p ON an.ID_Nino=p.ID_Persona JOIN Grupos g ON an.ID_Grupo_Asistido=g.ID_Grupo JOIN Turnos t ON an.ID_Turno=t.ID_Turno JOIN Fichas f ON an.ID_Ficha_Entrada=f.ID_Ficha
WHERE an.Estado='Presente' ORDER BY an.Fecha DESC, t.Nombre, g.Nombre, p.Apellidos;

CREATE OR REPLACE VIEW v_ninos_graduacion_mes AS
SELECT p.Nombres, p.Apellidos, p.Fecha_Nacimiento, DATE_PART('year',AGE(CURRENT_DATE,p.Fecha_Nacimiento))::INT AS Edad, EXTRACT(MONTH FROM p.Fecha_Nacimiento)::INT AS Mes_Cumpleanos, EXTRACT(DAY FROM p.Fecha_Nacimiento)::INT AS Dia_Cumpleanos, g.Nombre AS Grupo_Actual,
(DATE_TRUNC('year',CURRENT_DATE)+(EXTRACT(MONTH FROM p.Fecha_Nacimiento)-1||' months')::INTERVAL+(EXTRACT(DAY FROM p.Fecha_Nacimiento)-1||' days')::INTERVAL)::DATE AS Fecha_Graduacion_Este_Anio,
CASE WHEN (DATE_TRUNC('year',CURRENT_DATE)+(EXTRACT(MONTH FROM p.Fecha_Nacimiento)-1||' months')::INTERVAL+(EXTRACT(DAY FROM p.Fecha_Nacimiento)-1||' days')::INTERVAL)::DATE<CURRENT_DATE THEN TRUE ELSE FALSE END AS Ya_Graduo_Este_Anio
FROM Personas p JOIN Ninos n ON p.ID_Persona=n.ID_Persona
LEFT JOIN LATERAL (SELECT g2.Nombre FROM Ninos_Grupos ng JOIN Grupos g2 ON ng.ID_Grupo=g2.ID_Grupo WHERE ng.ID_Nino=n.ID_Persona ORDER BY ng.Fecha_Asignacion DESC LIMIT 1) g ON TRUE
WHERE p.Fecha_Nacimiento BETWEEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT-13,1,1) AND MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT-13,12,31)
AND (DATE_TRUNC('year',CURRENT_DATE)+(EXTRACT(MONTH FROM p.Fecha_Nacimiento)-1||' months')::INTERVAL+(EXTRACT(DAY FROM p.Fecha_Nacimiento)-1||' days')::INTERVAL)::DATE>=CURRENT_DATE
ORDER BY Mes_Cumpleanos, Dia_Cumpleanos;

CREATE OR REPLACE VIEW v_ninos_transicion_grupo_mes AS
WITH ec AS (SELECT p.ID_Persona,p.Nombres,p.Apellidos,p.Fecha_Nacimiento,DATE_PART('year',AGE(CURRENT_DATE,p.Fecha_Nacimiento))::INT AS Edad_Hoy,DATE_PART('year',AGE((CURRENT_DATE+INTERVAL '3 months')::DATE,p.Fecha_Nacimiento))::INT AS Edad_Proyectada,(CASE WHEN (DATE_TRUNC('year',CURRENT_DATE)+(EXTRACT(MONTH FROM p.Fecha_Nacimiento)-1||' months')::INTERVAL+(EXTRACT(DAY FROM p.Fecha_Nacimiento)-1||' days')::INTERVAL)::DATE>=(CURRENT_DATE-INTERVAL '1 month')::DATE THEN (DATE_TRUNC('year',CURRENT_DATE)+(EXTRACT(MONTH FROM p.Fecha_Nacimiento)-1||' months')::INTERVAL+(EXTRACT(DAY FROM p.Fecha_Nacimiento)-1||' days')::INTERVAL)::DATE ELSE (DATE_TRUNC('year',CURRENT_DATE)+INTERVAL '1 year'+(EXTRACT(MONTH FROM p.Fecha_Nacimiento)-1||' months')::INTERVAL+(EXTRACT(DAY FROM p.Fecha_Nacimiento)-1||' days')::INTERVAL)::DATE END) AS Fecha_Transicion FROM Personas p JOIN Ninos n ON p.ID_Persona=n.ID_Persona WHERE p.Fecha_Nacimiento BETWEEN (CURRENT_DATE-INTERVAL '14 years')::DATE AND (CURRENT_DATE-INTERVAL '2 years')::DATE),
ga AS (SELECT DISTINCT ON(ng.ID_Nino) ng.ID_Nino,ng.ID_Grupo AS ID_Grupo_Actual,g.Nombre AS Nombre_Grupo_Actual,g.Edad_Minima AS Actual_Edad_Min,g.Edad_Maxima AS Actual_Edad_Max FROM Ninos_Grupos ng JOIN Grupos g ON ng.ID_Grupo=g.ID_Grupo WHERE ng.Activo=TRUE ORDER BY ng.ID_Nino,ng.Fecha_Asignacion DESC),
gs AS (SELECT ec.ID_Persona,g.ID_Grupo AS ID_Grupo_Sugerido,g.Nombre AS Nombre_Grupo_Sugerido FROM ec JOIN Grupos g ON ec.Edad_Proyectada>=g.Edad_Minima AND ec.Edad_Proyectada<=g.Edad_Maxima AND g.Activo=TRUE)
SELECT ec.ID_Persona,ec.Nombres,ec.Apellidos,ec.Fecha_Nacimiento,ec.Edad_Hoy AS Edad_Este_Mes,ga.Nombre_Grupo_Actual AS Grupo_Actual,gs.Nombre_Grupo_Sugerido AS Grupo_Sugerido,
CASE WHEN ga.ID_Grupo_Actual IS NULL THEN 'Sin_Asignacion' WHEN gs.ID_Grupo_Sugerido IS NULL THEN 'Fuera_De_Rango' WHEN ga.ID_Grupo_Actual<>gs.ID_Grupo_Sugerido THEN 'Debe_Transicionar' ELSE 'En_Grupo_Correcto' END AS Estado_Transicion, ec.Fecha_Transicion
FROM ec LEFT JOIN ga ON ec.ID_Persona=ga.ID_Nino LEFT JOIN gs ON ec.ID_Persona=gs.ID_Persona
WHERE ga.ID_Grupo_Actual IS NULL OR (ga.ID_Grupo_Actual IS NOT NULL AND ec.Edad_Proyectada>ga.Actual_Edad_Max AND ec.Edad_Proyectada<13)
ORDER BY ec.Edad_Proyectada DESC, ec.Apellidos;

CREATE OR REPLACE VIEW v_perfil_completo_personal AS
SELECT ps.ID_Persona, p.Nombres||' '||p.Apellidos AS Nombre_Completo, p.Sexo, p.Cedula, p.Fecha_Nacimiento, DATE_PART('year',AGE(CURRENT_DATE,p.Fecha_Nacimiento))::INT AS Edad, r.Nombre_Rol AS Rol, ps.Activo,
pd.Ciudad_Departamento,pd.Municipio,pd.Distrito,pd.Barrio,pd.Direccion_Exacta,tp.Numero AS Telefono_Principal,tp.Tipo AS Tipo_Telefono_Principal,tp.Tiene_Whatsapp AS Principal_Tiene_Whatsapp,
pip.Estado_Civil,pip.Nombre_Conyuge,pip.Tiene_Hijos,pip.Numero_Hijos,pip.Ocupacion,pip.Centro_Laboral,pip.Nivel_Academico,
pii.Bautizado_Agua,pii.Fecha_Bautismo,pii.Estado_Operativo,rd.Nombre AS Red,ca.Nombre AS Circulo_Amistad,pii.Circulo_Amistad_Desde,pii.Tiempo_Iglesia_Meses,pii.Ministerio_Adicional,pii.Clases_Biblicas_Ninos,pii.Capacitacion_Ensenanza,pii.Observaciones_Espirituales,
pl.ID_Lider, p_lider.Nombres||' '||p_lider.Apellidos AS Nombre_Lider, tp_lider.Numero AS Tel_Lider,
CASE WHEN sus.ID_Suspension IS NOT NULL THEN TRUE ELSE FALSE END AS En_Suspension, sus.Fecha_Inicio AS Suspension_Desde, sus.Fecha_Fin AS Suspension_Hasta, sus.Categoria_Motivo AS Categoria_Suspension, sus.Motivo AS Motivo_Suspension
FROM Personal_Sistema ps JOIN Personas p ON ps.ID_Persona=p.ID_Persona JOIN Roles r ON ps.ID_Rol=r.ID_Rol
LEFT JOIN Personal_Info_Personal pip ON ps.ID_Persona=pip.ID_Persona LEFT JOIN Personal_Info_Iglesia pii ON ps.ID_Persona=pii.ID_Persona
LEFT JOIN Redes rd ON pii.ID_Red=rd.ID_Red LEFT JOIN Circulos_Amistad ca ON pii.ID_Circulo=ca.ID_Circulo LEFT JOIN Personal_Lideres pl ON pii.ID_Lider=pl.ID_Lider LEFT JOIN Personas p_lider ON pl.ID_Persona=p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider ON p_lider.ID_Persona=tp_lider.ID_Persona AND tp_lider.Es_Principal=TRUE AND tp_lider.Activo=TRUE
LEFT JOIN Personas_Direcciones pd ON ps.ID_Persona=pd.ID_Persona AND pd.Es_Principal=TRUE AND pd.Activo=TRUE
LEFT JOIN Telefonos_Personas tp ON ps.ID_Persona=tp.ID_Persona AND tp.Es_Principal=TRUE AND tp.Activo=TRUE
LEFT JOIN LATERAL (SELECT ID_Suspension,Fecha_Inicio,Fecha_Fin,Categoria_Motivo,Motivo FROM Personal_Suspensiones_Servicio pss WHERE pss.ID_Personal=ps.ID_Persona AND pss.Activo=TRUE AND pss.Fecha_Inicio<=CURRENT_DATE AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin>=CURRENT_DATE) LIMIT 1) sus ON TRUE
ORDER BY p.Apellidos, p.Nombres;

-- ==================================================================
-- FIN DEL SCHEMA
-- Versión: v5.11 — Desde cero para Neon PostgreSQL
-- ==================================================================
