-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.10 — Sistema Hosanna Infantil
-- Auditoría de cambios de perfil (Personal_Historial_Cambios)
-- ============================================================

BEGIN;

-- ============================================================
-- Tabla de auditoría genérica para cambios en el perfil
-- ============================================================
CREATE TABLE IF NOT EXISTS Personal_Historial_Cambios (
    ID_Historial      SERIAL       PRIMARY KEY,
    ID_Personal       INT          NOT NULL
                                       REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Tabla_Afectada    VARCHAR(50)  NOT NULL,
    Campo             VARCHAR(50)  NOT NULL,
    Valor_Anterior    TEXT,
    Valor_Nuevo       TEXT,
    Fecha_Cambio      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    ID_Cambiado_Por   INT          REFERENCES Personal_Sistema(ID_Persona),
    Creado_En         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_cambios_personal
    ON Personal_Historial_Cambios (ID_Personal, Fecha_Cambio DESC);

-- ============================================================
-- Función genérica de auditoría para Personas
-- ============================================================
CREATE OR REPLACE FUNCTION fn_auditar_cambios_personas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;

    IF OLD.Nombres IS DISTINCT FROM NEW.Nombres THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas', 'Nombres',
                COALESCE(OLD.Nombres::TEXT, ''), COALESCE(NEW.Nombres::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Apellidos IS DISTINCT FROM NEW.Apellidos THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas', 'Apellidos',
                COALESCE(OLD.Apellidos::TEXT, ''), COALESCE(NEW.Apellidos::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Sexo IS DISTINCT FROM NEW.Sexo THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas', 'Sexo',
                COALESCE(OLD.Sexo::TEXT, ''), COALESCE(NEW.Sexo::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Cedula IS DISTINCT FROM NEW.Cedula THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas', 'Cedula',
                COALESCE(OLD.Cedula::TEXT, ''), COALESCE(NEW.Cedula::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Fecha_Nacimiento IS DISTINCT FROM NEW.Fecha_Nacimiento THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas', 'Fecha_Nacimiento',
                COALESCE(OLD.Fecha_Nacimiento::TEXT, ''), COALESCE(NEW.Fecha_Nacimiento::TEXT, ''), v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditar_cambios_personas ON Personas;
CREATE TRIGGER trg_auditar_cambios_personas
    AFTER UPDATE ON Personas
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambios_personas();

-- ============================================================
-- Función de auditoría para Personal_Info_Personal
-- ============================================================
CREATE OR REPLACE FUNCTION fn_auditar_cambios_info_personal()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;

    IF OLD.Estado_Civil IS DISTINCT FROM NEW.Estado_Civil THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Estado_Civil',
                COALESCE(OLD.Estado_Civil::TEXT, ''), COALESCE(NEW.Estado_Civil::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Nombre_Conyuge IS DISTINCT FROM NEW.Nombre_Conyuge THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Nombre_Conyuge',
                COALESCE(OLD.Nombre_Conyuge::TEXT, ''), COALESCE(NEW.Nombre_Conyuge::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Tiene_Hijos IS DISTINCT FROM NEW.Tiene_Hijos THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Tiene_Hijos',
                COALESCE(OLD.Tiene_Hijos::TEXT, ''), COALESCE(NEW.Tiene_Hijos::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Numero_Hijos IS DISTINCT FROM NEW.Numero_Hijos THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Numero_Hijos',
                COALESCE(OLD.Numero_Hijos::TEXT, ''), COALESCE(NEW.Numero_Hijos::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Ocupacion IS DISTINCT FROM NEW.Ocupacion THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Ocupacion',
                COALESCE(OLD.Ocupacion::TEXT, ''), COALESCE(NEW.Ocupacion::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Centro_Laboral IS DISTINCT FROM NEW.Centro_Laboral THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Centro_Laboral',
                COALESCE(OLD.Centro_Laboral::TEXT, ''), COALESCE(NEW.Centro_Laboral::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Nivel_Academico IS DISTINCT FROM NEW.Nivel_Academico THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Personal', 'Nivel_Academico',
                COALESCE(OLD.Nivel_Academico::TEXT, ''), COALESCE(NEW.Nivel_Academico::TEXT, ''), v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditar_cambios_info_personal ON Personal_Info_Personal;
CREATE TRIGGER trg_auditar_cambios_info_personal
    AFTER UPDATE ON Personal_Info_Personal
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambios_info_personal();

-- ============================================================
-- Función de auditoría para Personal_Info_Iglesia
-- ============================================================
CREATE OR REPLACE FUNCTION fn_auditar_cambios_info_iglesia()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;

    IF OLD.Estado_Operativo IS DISTINCT FROM NEW.Estado_Operativo THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Estado_Operativo',
                COALESCE(OLD.Estado_Operativo::TEXT, ''), COALESCE(NEW.Estado_Operativo::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Bautizado_Agua IS DISTINCT FROM NEW.Bautizado_Agua THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Bautizado_Agua',
                COALESCE(OLD.Bautizado_Agua::TEXT, ''), COALESCE(NEW.Bautizado_Agua::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Fecha_Bautismo IS DISTINCT FROM NEW.Fecha_Bautismo THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Fecha_Bautismo',
                COALESCE(OLD.Fecha_Bautismo::TEXT, ''), COALESCE(NEW.Fecha_Bautismo::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Tiempo_Iglesia_Meses IS DISTINCT FROM NEW.Tiempo_Iglesia_Meses THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Tiempo_Iglesia_Meses',
                COALESCE(OLD.Tiempo_Iglesia_Meses::TEXT, ''), COALESCE(NEW.Tiempo_Iglesia_Meses::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Ministerio_Adicional IS DISTINCT FROM NEW.Ministerio_Adicional THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Ministerio_Adicional',
                COALESCE(OLD.Ministerio_Adicional::TEXT, ''), COALESCE(NEW.Ministerio_Adicional::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Clases_Biblicas_Ninos IS DISTINCT FROM NEW.Clases_Biblicas_Ninos THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Clases_Biblicas_Ninos',
                COALESCE(OLD.Clases_Biblicas_Ninos::TEXT, ''), COALESCE(NEW.Clases_Biblicas_Ninos::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Capacitacion_Ensenanza IS DISTINCT FROM NEW.Capacitacion_Ensenanza THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Capacitacion_Ensenanza',
                COALESCE(OLD.Capacitacion_Ensenanza::TEXT, ''), COALESCE(NEW.Capacitacion_Ensenanza::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Observaciones_Espirituales IS DISTINCT FROM NEW.Observaciones_Espirituales THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Observaciones_Espirituales',
                COALESCE(OLD.Observaciones_Espirituales::TEXT, ''), COALESCE(NEW.Observaciones_Espirituales::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Circulo_Amistad_Desde IS DISTINCT FROM NEW.Circulo_Amistad_Desde THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personal_Info_Iglesia', 'Circulo_Amistad_Desde',
                COALESCE(OLD.Circulo_Amistad_Desde::TEXT, ''), COALESCE(NEW.Circulo_Amistad_Desde::TEXT, ''), v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditar_cambios_info_iglesia ON Personal_Info_Iglesia;
CREATE TRIGGER trg_auditar_cambios_info_iglesia
    AFTER UPDATE ON Personal_Info_Iglesia
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambios_info_iglesia();

-- ============================================================
-- Función de auditoría para Telefonos_Personas
-- ============================================================
CREATE OR REPLACE FUNCTION fn_auditar_cambios_telefonos()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;

    IF OLD.Tipo IS DISTINCT FROM NEW.Tipo THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Telefonos_Personas', 'Tipo',
                COALESCE(OLD.Tipo::TEXT, ''), COALESCE(NEW.Tipo::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Numero IS DISTINCT FROM NEW.Numero THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Telefonos_Personas', 'Numero',
                COALESCE(OLD.Numero::TEXT, ''), COALESCE(NEW.Numero::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Tiene_Whatsapp IS DISTINCT FROM NEW.Tiene_Whatsapp THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Telefonos_Personas', 'Tiene_Whatsapp',
                COALESCE(OLD.Tiene_Whatsapp::TEXT, ''), COALESCE(NEW.Tiene_Whatsapp::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Es_Principal IS DISTINCT FROM NEW.Es_Principal THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Telefonos_Personas', 'Es_Principal',
                COALESCE(OLD.Es_Principal::TEXT, ''), COALESCE(NEW.Es_Principal::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Activo IS DISTINCT FROM NEW.Activo THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Telefonos_Personas', 'Activo',
                COALESCE(OLD.Activo::TEXT, ''), COALESCE(NEW.Activo::TEXT, ''), v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditar_cambios_telefonos ON Telefonos_Personas;
CREATE TRIGGER trg_auditar_cambios_telefonos
    AFTER UPDATE ON Telefonos_Personas
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambios_telefonos();

-- ============================================================
-- Función de auditoría para Personas_Direcciones
-- ============================================================
CREATE OR REPLACE FUNCTION fn_auditar_cambios_direcciones()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;

    IF OLD.Tipo_Direccion IS DISTINCT FROM NEW.Tipo_Direccion THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Tipo_Direccion',
                COALESCE(OLD.Tipo_Direccion::TEXT, ''), COALESCE(NEW.Tipo_Direccion::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Ciudad_Departamento IS DISTINCT FROM NEW.Ciudad_Departamento THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Ciudad_Departamento',
                COALESCE(OLD.Ciudad_Departamento::TEXT, ''), COALESCE(NEW.Ciudad_Departamento::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Municipio IS DISTINCT FROM NEW.Municipio THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Municipio',
                COALESCE(OLD.Municipio::TEXT, ''), COALESCE(NEW.Municipio::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Distrito IS DISTINCT FROM NEW.Distrito THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Distrito',
                COALESCE(OLD.Distrito::TEXT, ''), COALESCE(NEW.Distrito::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Barrio IS DISTINCT FROM NEW.Barrio THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Barrio',
                COALESCE(OLD.Barrio::TEXT, ''), COALESCE(NEW.Barrio::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Direccion_Exacta IS DISTINCT FROM NEW.Direccion_Exacta THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Direccion_Exacta',
                COALESCE(OLD.Direccion_Exacta::TEXT, ''), COALESCE(NEW.Direccion_Exacta::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Es_Principal IS DISTINCT FROM NEW.Es_Principal THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Es_Principal',
                COALESCE(OLD.Es_Principal::TEXT, ''), COALESCE(NEW.Es_Principal::TEXT, ''), v_autorizador);
    END IF;
    IF OLD.Activo IS DISTINCT FROM NEW.Activo THEN
        INSERT INTO Personal_Historial_Cambios
            (ID_Personal, Tabla_Afectada, Campo, Valor_Anterior, Valor_Nuevo, ID_Cambiado_Por)
        VALUES (NEW.ID_Persona, 'Personas_Direcciones', 'Activo',
                COALESCE(OLD.Activo::TEXT, ''), COALESCE(NEW.Activo::TEXT, ''), v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditar_cambios_direcciones ON Personas_Direcciones;
CREATE TRIGGER trg_auditar_cambios_direcciones
    AFTER UPDATE ON Personas_Direcciones
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambios_direcciones();

COMMIT;
