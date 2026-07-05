--
-- PostgreSQL database dump
--

\restrict ssuDHLVHVy19vh6f04c7v92z5HgfLDr09slNL0XsUitZjrMjsKgxLFndsPOLeHT

-- Dumped from database version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: categoria_motivo_suspension; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_motivo_suspension AS ENUM (
    'Conducta',
    'Enfermedad',
    'Personal',
    'Disciplina',
    'Otro'
);


--
-- Name: condicion_civil; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.condicion_civil AS ENUM (
    'Ninguna',
    'Divorciado_1er_Matrimonio',
    'Divorciado_2do_Matrimonio',
    'Divorciado_3er_Matrimonio',
    'Viudo',
    'Primer_Matrimonio',
    'Tercer_Matrimonio',
    'Otro_Matrimonio',
    'Segundo_Matrimonio'
);


--
-- Name: estado_asistencia_nino; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_asistencia_nino AS ENUM (
    'Presente',
    'Retirado'
);


--
-- Name: estado_civil; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_civil AS ENUM (
    'Soltero',
    'Acompañado',
    'Casado',
    'Divorciado',
    'Viudo',
    'Union_Libre',
    'Segundo_Matrimonio',
    'Separado',
    'Madre_Soltera',
    'Padre_Soltero'
);


--
-- Name: estado_liderazgo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_liderazgo AS ENUM (
    'Gap',
    'Lider',
    'Mentor',
    'Miembro',
    'Lider_Apoyo'
);


--
-- Name: estado_llegada; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_llegada AS ENUM (
    'Temprano',
    'Tarde',
    'Justificado',
    'Injustificado'
);


--
-- Name: estado_operativo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_operativo AS ENUM (
    'Lider',
    'En_Formacion'
);


--
-- Name: estado_solicitud; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_solicitud AS ENUM (
    'Borrador',
    'Pendiente',
    'Aprobado',
    'Rechazado'
);


--
-- Name: ficha_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ficha_estado AS ENUM (
    'Activa',
    'Inactiva',
    'Extraviada'
);


--
-- Name: nivel_academico; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_academico AS ENUM (
    'Primaria',
    'Secundaria',
    'Nivel_Tecnico',
    'Licenciatura',
    'Ingenieria',
    'Postgrado',
    'Maestria',
    'Doctorado',
    'Otro'
);


--
-- Name: nombre_turno; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nombre_turno AS ENUM (
    'Miercoles',
    'Domingo_8am',
    'Domingo_11am',
    'Domingo_5pm'
);


--
-- Name: rol_nombre; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rol_nombre AS ENUM (
    'Colaborador',
    'Maestro',
    'Staff',
    'Coordinador General'
);


--
-- Name: severidad_medica; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.severidad_medica AS ENUM (
    'Leve',
    'Moderada',
    'Alta'
);


--
-- Name: tipo_denominacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_denominacion AS ENUM (
    'Pentecostal',
    'Evangelico',
    'Católico',
    'Testigo de Jehová',
    'Otro'
);


--
-- Name: tipo_direccion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_direccion AS ENUM (
    'Residencial',
    'Laboral',
    'Referencia',
    'Otro'
);


--
-- Name: tipo_evaluacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_evaluacion AS ENUM (
    'Desempeno',
    'Formacion',
    'Conducta',
    'Ascenso',
    'Otro'
);


--
-- Name: tipo_evento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_evento AS ENUM (
    'Servicio Regular',
    'Party Mix',
    'Power Day',
    'Semana Santa',
    'Navidad',
    'Especial',
    'Otro'
);


--
-- Name: tipo_expediente_nino; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_expediente_nino AS ENUM (
    'Conducta',
    'Incidente',
    'Observacion',
    'Medico'
);


--
-- Name: tipo_info_medica; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_info_medica AS ENUM (
    'Alergia',
    'Medicamento',
    'Condicion'
);


--
-- Name: tipo_precision_fecha; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_precision_fecha AS ENUM (
    'Dia',
    'Mes',
    'Ano'
);


--
-- Name: tipo_relacion_persona; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_relacion_persona AS ENUM (
    'Conyuge',
    'Familiar',
    'Otro'
);


--
-- Name: tipo_requisito; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_requisito AS ENUM (
    'Formacion',
    'Estado_Ministerial',
    'Otro'
);


--
-- Name: tipo_resultado_evaluacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_resultado_evaluacion AS ENUM (
    'Satisfactorio',
    'En_Proceso',
    'Insatisfactorio'
);


--
-- Name: tipo_sexo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_sexo AS ENUM (
    'Masculino',
    'Femenino'
);


--
-- Name: tipo_telefono; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_telefono AS ENUM (
    'Casa',
    'Oficina',
    'Claro',
    'Movistar',
    'Otro'
);


--
-- Name: fn_auditar_cambios_direcciones(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditar_cambios_direcciones() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_autorizador INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Persona) THEN
        RETURN NEW;
    END IF;

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


--
-- Name: fn_auditar_cambios_info_iglesia(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditar_cambios_info_iglesia() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_autorizador INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Persona) THEN
        RETURN NEW;
    END IF;

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


--
-- Name: fn_auditar_cambios_info_personal(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditar_cambios_info_personal() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_autorizador INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Persona) THEN
        RETURN NEW;
    END IF;

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


--
-- Name: fn_auditar_cambios_telefonos(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditar_cambios_telefonos() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_autorizador INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Persona) THEN
        RETURN NEW;
    END IF;

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


--
-- Name: fn_auditoria_cambio_estado_solicitud(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_cambio_estado_solicitud() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: fn_auditoria_cambio_lider(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_cambio_lider() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: fn_auditoria_cambio_rol(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auditoria_cambio_rol() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: fn_autoasignar_grupo_asistencia(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_autoasignar_grupo_asistencia() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_propagar_datos_solicitud_aprobada(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_propagar_datos_solicitud_aprobada() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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

        -- Personal_Info_Personal (Incluye Condicion_Civil y actualiza en caso de conflicto)
        INSERT INTO Personal_Info_Personal (
            ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge,
            Tiene_Hijos, Numero_Hijos, Direccion,
            Ocupacion, Centro_Laboral, Nivel_Academico)
        SELECT ps.ID_Persona,
               NEW.Estado_Civil, NEW.Condicion_Civil, NEW.Nombre_Conyuge,
               NEW.Tiene_Hijos, NEW.Numero_Hijos,
               NEW.Dir_Exacta,
               NEW.Ocupacion_Candidato,
               NEW.Centro_Laboral_Candidato,
               NEW.Nivel_Academico_Candidato
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO UPDATE SET
            Estado_Civil = EXCLUDED.Estado_Civil,
            Condicion_Civil = EXCLUDED.Condicion_Civil,
            Nombre_Conyuge = EXCLUDED.Nombre_Conyuge,
            Tiene_Hijos = EXCLUDED.Tiene_Hijos,
            Numero_Hijos = EXCLUDED.Numero_Hijos,
            Direccion = EXCLUDED.Direccion,
            Ocupacion = EXCLUDED.Ocupacion,
            Centro_Laboral = EXCLUDED.Centro_Laboral,
            Nivel_Academico = EXCLUDED.Nivel_Academico;

        -- Personal_Info_Iglesia (Propaga Estado_Liderazgo, calcula Estado_Operativo y añade historial de otras iglesias)
        INSERT INTO Personal_Info_Iglesia (
            ID_Persona, ID_Red, Estado_Liderazgo, Estado_Operativo, ID_Lider,
            ID_Circulo, Tiempo_Iglesia_Meses, Ministerio_Adicional,
            Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
            Circulo_Amistad_Desde, Circulo_Amistad_Precision,
            Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
            Capacitacion_Ensenanza, Capacitacion_Detalle,
            Observaciones_Espirituales,
            Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia)
        SELECT ps.ID_Persona,
               NEW.ID_Red,
               NEW.Estado_Liderazgo,
               CASE NEW.Estado_Liderazgo
                   WHEN 'Lider'       THEN 'Lider'::estado_operativo
                   WHEN 'Mentor'      THEN 'Lider'::estado_operativo
                   WHEN 'Lider_Apoyo' THEN 'Lider'::estado_operativo
                   WHEN 'Gap'         THEN 'En_Formacion'::estado_operativo
                   ELSE 'En_Formacion'::estado_operativo
               END,
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
               NEW.Observaciones_Espirituales_Sol,
               NEW.Asistio_Otra_Iglesia,
               NEW.Nombre_Otra_Iglesia,
               NEW.Denominacion_Otra_Iglesia
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO UPDATE SET
            ID_Red = EXCLUDED.ID_Red,
            Estado_Liderazgo = EXCLUDED.Estado_Liderazgo,
            Estado_Operativo = EXCLUDED.Estado_Operativo,
            ID_Lider = EXCLUDED.ID_Lider,
            ID_Circulo = EXCLUDED.ID_Circulo,
            Tiempo_Iglesia_Meses = EXCLUDED.Tiempo_Iglesia_Meses,
            Ministerio_Adicional = EXCLUDED.Ministerio_Adicional,
            Bautizado_Agua = EXCLUDED.Bautizado_Agua,
            Fecha_Bautismo = EXCLUDED.Fecha_Bautismo,
            Fecha_Bautismo_Precision = EXCLUDED.Fecha_Bautismo_Precision,
            Circulo_Amistad_Desde = EXCLUDED.Circulo_Amistad_Desde,
            Circulo_Amistad_Precision = EXCLUDED.Circulo_Amistad_Precision,
            Clases_Biblicas_Ninos = EXCLUDED.Clases_Biblicas_Ninos,
            Clases_Biblicas_Detalle = EXCLUDED.Clases_Biblicas_Detalle,
            Capacitacion_Ensenanza = EXCLUDED.Capacitacion_Ensenanza,
            Capacitacion_Detalle = EXCLUDED.Capacitacion_Detalle,
            Observaciones_Espirituales = EXCLUDED.Observaciones_Espirituales,
            Asistio_Otra_Iglesia = EXCLUDED.Asistio_Otra_Iglesia,
            Nombre_Otra_Iglesia = EXCLUDED.Nombre_Otra_Iglesia,
            Denominacion_Otra_Iglesia = EXCLUDED.Denominacion_Otra_Iglesia;

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


--
-- Name: fn_registrar_conyuge(integer, integer, jsonb, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_registrar_conyuge(p_id_a integer, p_id_b integer, p_datos_adicionales jsonb DEFAULT NULL::jsonb, p_fecha_inicio date DEFAULT CURRENT_DATE) RETURNS void
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: fn_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.Actualizado_En = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: fn_validar_autorizacion_staff(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_autorizacion_staff() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_validar_fecha_nac_nino(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_fecha_nac_nino() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT fecha_nacimiento FROM personas WHERE id_persona = NEW.id_persona) IS NULL THEN
        RAISE EXCEPTION
            'El niño (ID_Persona: %) debe tener Fecha_Nacimiento registrada en Personas.',
            NEW.id_persona;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_validar_hash_bcrypt(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_hash_bcrypt() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF NEW.Password_Hash IS NOT NULL
       AND NEW.Password_Hash NOT SIMILAR TO '\$2[aby]\$%' THEN
        RAISE EXCEPTION
            'Password_Hash debe ser un hash bcrypt válido ($2a$, $2b$ o $2y$). '
            'Nunca almacenar contraseñas en texto plano.';
    END IF;
    RETURN NEW;
END;
$_$;


--
-- Name: fn_validar_requisitos_solicitud(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_requisitos_solicitud() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_validar_retiro_nino(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_retiro_nino() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_validar_suspension(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validar_suspension() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT (SELECT Activo FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Personal) THEN
        RAISE EXCEPTION
            'No se puede suspender al personal inactivo (ID: %). Usar Soft Delete es suficiente.',
            NEW.ID_Personal;
    END IF;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asistencia_maestros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asistencia_maestros (
    id_asistencia_maestro integer NOT NULL,
    fecha date NOT NULL,
    id_personal integer NOT NULL,
    id_grupo integer NOT NULL,
    estado_llegada public.estado_llegada NOT NULL,
    hora_llegada time without time zone NOT NULL,
    comentarios text,
    id_turno integer,
    id_evento integer,
    razon_ausencia text,
    CONSTRAINT chk_razon_injustificado CHECK (((estado_llegada <> 'Injustificado'::public.estado_llegada) OR (razon_ausencia IS NOT NULL)))
);


--
-- Name: asistencia_maestros_id_asistencia_maestro_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asistencia_maestros_id_asistencia_maestro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asistencia_maestros_id_asistencia_maestro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asistencia_maestros_id_asistencia_maestro_seq OWNED BY public.asistencia_maestros.id_asistencia_maestro;


--
-- Name: asistencia_ninos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asistencia_ninos (
    id_asistencia integer NOT NULL,
    fecha date NOT NULL,
    id_nino integer NOT NULL,
    id_grupo_asistido integer NOT NULL,
    id_ficha_entrada integer NOT NULL,
    id_ficha_salida integer,
    id_ingresado_por integer NOT NULL,
    id_retirado_por integer,
    hora_entrada time without time zone NOT NULL,
    hora_salida time without time zone,
    registrado_por integer NOT NULL,
    checkout_por integer,
    acompanante_en_aula boolean DEFAULT false NOT NULL,
    notas text,
    id_turno integer,
    id_evento integer,
    estado public.estado_asistencia_nino DEFAULT 'Presente'::public.estado_asistencia_nino NOT NULL,
    es_excepcion_asistencia boolean DEFAULT false NOT NULL,
    motivo_excepcion_asistencia character varying(255),
    es_primera_vez boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_estado_retirado CHECK (((estado = 'Presente'::public.estado_asistencia_nino) OR ((estado = 'Retirado'::public.estado_asistencia_nino) AND (id_retirado_por IS NOT NULL) AND (hora_salida IS NOT NULL)))),
    CONSTRAINT chk_excepcion_asist_motivo CHECK (((es_excepcion_asistencia = false) OR (motivo_excepcion_asistencia IS NOT NULL))),
    CONSTRAINT chk_fichas_distintas CHECK (((id_ficha_salida IS NULL) OR (id_ficha_entrada <> id_ficha_salida)))
);


--
-- Name: asistencia_ninos_id_asistencia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asistencia_ninos_id_asistencia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asistencia_ninos_id_asistencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asistencia_ninos_id_asistencia_seq OWNED BY public.asistencia_ninos.id_asistencia;


--
-- Name: circulos_amistad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.circulos_amistad (
    id_circulo integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: circulos_amistad_id_circulo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.circulos_amistad_id_circulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: circulos_amistad_id_circulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.circulos_amistad_id_circulo_seq OWNED BY public.circulos_amistad.id_circulo;


--
-- Name: eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos (
    id_evento integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    fecha date NOT NULL,
    id_turno integer,
    tipo public.tipo_evento DEFAULT 'Servicio Regular'::public.tipo_evento NOT NULL,
    numero_semana smallint GENERATED ALWAYS AS ((((((EXTRACT(day FROM fecha))::integer - 1) / 7) + 1))::smallint) STORED,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: eventos_id_evento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eventos_id_evento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eventos_id_evento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eventos_id_evento_seq OWNED BY public.eventos.id_evento;


--
-- Name: fichas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fichas (
    id_ficha integer NOT NULL,
    codigo_ficha character varying(20) NOT NULL,
    estado public.ficha_estado DEFAULT 'Activa'::public.ficha_estado NOT NULL,
    id_grupo integer NOT NULL,
    tipo character varying(20) DEFAULT 'Entrada'::character varying
);


--
-- Name: fichas_id_ficha_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fichas_id_ficha_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fichas_id_ficha_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fichas_id_ficha_seq OWNED BY public.fichas.id_ficha;


--
-- Name: grupos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grupos (
    id_grupo integer NOT NULL,
    nombre character varying(50) NOT NULL,
    edad_minima smallint NOT NULL,
    edad_maxima smallint NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_edades_grupo CHECK (((edad_minima >= 0) AND (edad_maxima <= 12) AND (edad_minima < edad_maxima)))
);


--
-- Name: grupos_id_grupo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grupos_id_grupo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grupos_id_grupo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grupos_id_grupo_seq OWNED BY public.grupos.id_grupo;


--
-- Name: info_medica_ninos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.info_medica_ninos (
    id_info integer NOT NULL,
    id_nino integer NOT NULL,
    tipo public.tipo_info_medica NOT NULL,
    descripcion text NOT NULL,
    severidad public.severidad_medica,
    instrucciones text
);


--
-- Name: info_medica_ninos_id_info_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.info_medica_ninos_id_info_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: info_medica_ninos_id_info_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.info_medica_ninos_id_info_seq OWNED BY public.info_medica_ninos.id_info;


--
-- Name: ninos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ninos (
    id_persona integer NOT NULL,
    observaciones_generales text,
    activo boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: ninos_expedientes_conducta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ninos_expedientes_conducta (
    id_expediente integer NOT NULL,
    id_nino integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    id_turno integer,
    id_evento integer,
    tipo public.tipo_expediente_nino DEFAULT 'Observacion'::public.tipo_expediente_nino NOT NULL,
    descripcion text NOT NULL,
    id_reportado_por integer NOT NULL,
    resuelto boolean DEFAULT false NOT NULL,
    notas_resolucion text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ninos_expedientes_conducta_id_expediente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ninos_expedientes_conducta_id_expediente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ninos_expedientes_conducta_id_expediente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ninos_expedientes_conducta_id_expediente_seq OWNED BY public.ninos_expedientes_conducta.id_expediente;


--
-- Name: ninos_grupos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ninos_grupos (
    id_nino integer NOT NULL,
    id_grupo integer NOT NULL,
    es_excepcion boolean DEFAULT false NOT NULL,
    motivo_excepcion character varying(255),
    fecha_asignacion date DEFAULT CURRENT_DATE NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_excepcion_motivo CHECK (((es_excepcion = false) OR (motivo_excepcion IS NOT NULL)))
);


--
-- Name: personal_expedientes_evaluacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_expedientes_evaluacion (
    id_evaluacion integer NOT NULL,
    id_personal integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    tipo public.tipo_evaluacion DEFAULT 'Desempeno'::public.tipo_evaluacion NOT NULL,
    descripcion text NOT NULL,
    resultado public.tipo_resultado_evaluacion,
    id_evaluador integer NOT NULL,
    notas text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: personal_expedientes_evaluacion_id_evaluacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_expedientes_evaluacion_id_evaluacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_expedientes_evaluacion_id_evaluacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_expedientes_evaluacion_id_evaluacion_seq OWNED BY public.personal_expedientes_evaluacion.id_evaluacion;


--
-- Name: personal_grupos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_grupos (
    id_personal integer NOT NULL,
    id_grupo integer NOT NULL,
    fecha_asignacion date NOT NULL,
    id_turno integer NOT NULL
);


--
-- Name: personal_historial_cambios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_historial_cambios (
    id_historial integer NOT NULL,
    id_personal integer NOT NULL,
    tabla_afectada character varying(50) NOT NULL,
    campo character varying(50) NOT NULL,
    valor_anterior text,
    valor_nuevo text,
    fecha_cambio timestamp with time zone DEFAULT now() NOT NULL,
    id_cambiado_por integer,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: personal_historial_cambios_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_historial_cambios_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_historial_cambios_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_historial_cambios_id_historial_seq OWNED BY public.personal_historial_cambios.id_historial;


--
-- Name: personal_historial_lideres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_historial_lideres (
    id_historial integer NOT NULL,
    id_personal integer NOT NULL,
    id_lider_anterior integer,
    id_lider_nuevo integer,
    fecha_cambio date DEFAULT CURRENT_DATE NOT NULL,
    id_registrado_por integer NOT NULL,
    notas text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: personal_historial_lideres_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_historial_lideres_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_historial_lideres_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_historial_lideres_id_historial_seq OWNED BY public.personal_historial_lideres.id_historial;


--
-- Name: personal_historial_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_historial_roles (
    id_historial integer NOT NULL,
    id_personal integer NOT NULL,
    id_rol_anterior integer,
    id_rol_nuevo integer NOT NULL,
    fecha_cambio date DEFAULT CURRENT_DATE NOT NULL,
    id_autorizado_por integer NOT NULL,
    notas text
);


--
-- Name: personal_historial_roles_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_historial_roles_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_historial_roles_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_historial_roles_id_historial_seq OWNED BY public.personal_historial_roles.id_historial;


--
-- Name: personal_info_iglesia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_info_iglesia (
    id_persona integer NOT NULL,
    id_red integer,
    estado_liderazgo public.estado_liderazgo,
    id_mentor integer,
    circulo_amistad character varying(100),
    tiempo_iglesia_meses integer,
    ministerio_adicional character varying(150),
    estado_operativo public.estado_operativo,
    bautizado_agua boolean DEFAULT false NOT NULL,
    fecha_bautismo date,
    fecha_bautismo_precision public.tipo_precision_fecha,
    id_circulo integer,
    circulo_amistad_desde date,
    circulo_amistad_precision public.tipo_precision_fecha,
    clases_biblicas_ninos boolean DEFAULT false NOT NULL,
    clases_biblicas_detalle text,
    capacitacion_ensenanza boolean DEFAULT false NOT NULL,
    capacitacion_detalle text,
    observaciones_espirituales text,
    id_lider integer,
    asistio_otra_iglesia boolean DEFAULT false,
    nombre_otra_iglesia text,
    denominacion_otra_iglesia public.tipo_denominacion,
    CONSTRAINT chk_bautismo_precision CHECK (((fecha_bautismo IS NULL) OR (fecha_bautismo_precision IS NOT NULL))),
    CONSTRAINT chk_capacitacion_detalle CHECK (((capacitacion_ensenanza = false) OR (capacitacion_detalle IS NOT NULL))),
    CONSTRAINT chk_circulo_precision CHECK (((circulo_amistad_desde IS NULL) OR (circulo_amistad_precision IS NOT NULL))),
    CONSTRAINT chk_circulo_solo_lider CHECK (((circulo_amistad IS NULL) OR (estado_liderazgo = 'Lider'::public.estado_liderazgo))),
    CONSTRAINT chk_clases_detalle CHECK (((clases_biblicas_ninos = false) OR (clases_biblicas_detalle IS NOT NULL))),
    CONSTRAINT chk_mentor_requiere_liderazgo CHECK (((id_mentor IS NULL) OR (estado_liderazgo = ANY (ARRAY['Gap'::public.estado_liderazgo, 'Lider'::public.estado_liderazgo])))),
    CONSTRAINT personal_info_iglesia_tiempo_iglesia_meses_check CHECK ((tiempo_iglesia_meses >= 0))
);


--
-- Name: personal_info_personal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_info_personal (
    id_persona integer NOT NULL,
    estado_civil public.estado_civil DEFAULT 'Soltero'::public.estado_civil NOT NULL,
    nombre_conyuge character varying(100),
    tiene_hijos boolean DEFAULT false NOT NULL,
    numero_hijos smallint,
    direccion text,
    ocupacion character varying(150) DEFAULT NULL::character varying,
    centro_laboral character varying(150) DEFAULT NULL::character varying,
    nivel_academico public.nivel_academico,
    condicion_civil public.condicion_civil DEFAULT 'Ninguna'::public.condicion_civil NOT NULL,
    CONSTRAINT chk_conyuge CHECK (((estado_civil <> 'Casado'::public.estado_civil) OR (nombre_conyuge IS NOT NULL))),
    CONSTRAINT chk_numero_hijos CHECK (((tiene_hijos = false) OR ((numero_hijos IS NOT NULL) AND (numero_hijos > 0))))
);


--
-- Name: personal_lideres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_lideres (
    id_lider integer NOT NULL,
    id_persona integer NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: personal_lideres_id_lider_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_lideres_id_lider_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_lideres_id_lider_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_lideres_id_lider_seq OWNED BY public.personal_lideres.id_lider;


--
-- Name: personal_requisitos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_requisitos (
    id_personal integer NOT NULL,
    id_requisito integer NOT NULL,
    cumplido boolean DEFAULT false NOT NULL,
    fecha_cumplido date,
    notas text,
    CONSTRAINT chk_fecha_cumplido CHECK (((cumplido = false) OR (fecha_cumplido IS NOT NULL)))
);


--
-- Name: personal_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_sistema (
    id_persona integer NOT NULL,
    id_rol integer NOT NULL,
    usuario character varying(30) NOT NULL,
    password_hash character varying(255) NOT NULL,
    fecha_ingreso_servicio date NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    id_creado_por integer,
    id_autorizado_por integer,
    id_solicitud_origen integer,
    version integer DEFAULT 1 NOT NULL,
    solo_lectura boolean DEFAULT false NOT NULL
);


--
-- Name: personal_suspensiones_servicio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_suspensiones_servicio (
    id_suspension integer NOT NULL,
    id_personal integer NOT NULL,
    fecha_inicio date DEFAULT CURRENT_DATE NOT NULL,
    fecha_fin date,
    categoria_motivo public.categoria_motivo_suspension DEFAULT 'Otro'::public.categoria_motivo_suspension NOT NULL,
    motivo text NOT NULL,
    id_registrado_por integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone,
    CONSTRAINT chk_suspension_fechas CHECK (((fecha_fin IS NULL) OR (fecha_fin > fecha_inicio)))
);


--
-- Name: personal_suspensiones_servicio_id_suspension_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_suspensiones_servicio_id_suspension_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_suspensiones_servicio_id_suspension_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_suspensiones_servicio_id_suspension_seq OWNED BY public.personal_suspensiones_servicio.id_suspension;


--
-- Name: personal_turnos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_turnos (
    id_personal integer NOT NULL,
    id_turno integer NOT NULL,
    fecha_asignacion date DEFAULT CURRENT_DATE NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personas (
    id_persona integer NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    telefono character varying(20),
    fecha_nacimiento date,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    sexo public.tipo_sexo,
    cedula character varying(20) DEFAULT NULL::character varying,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: personas_direcciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personas_direcciones (
    id_direccion integer NOT NULL,
    id_persona integer NOT NULL,
    tipo_direccion public.tipo_direccion DEFAULT 'Residencial'::public.tipo_direccion NOT NULL,
    ciudad_departamento character varying(60),
    municipio character varying(60),
    distrito character varying(60),
    barrio character varying(60),
    direccion_exacta text,
    es_principal boolean DEFAULT true NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone
);


--
-- Name: personas_direcciones_id_direccion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personas_direcciones_id_direccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personas_direcciones_id_direccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personas_direcciones_id_direccion_seq OWNED BY public.personas_direcciones.id_direccion;


--
-- Name: personas_id_persona_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personas_id_persona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personas_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personas_id_persona_seq OWNED BY public.personas.id_persona;


--
-- Name: redes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redes (
    id_red integer NOT NULL,
    nombre character varying(60) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: redes_id_red_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.redes_id_red_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: redes_id_red_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.redes_id_red_seq OWNED BY public.redes.id_red;


--
-- Name: relaciones_personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relaciones_personas (
    id_persona_a integer NOT NULL,
    id_persona_b integer NOT NULL,
    tipo_relacion public.tipo_relacion_persona NOT NULL,
    datos_adicionales jsonb,
    fecha_inicio date,
    fecha_fin date,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone,
    CONSTRAINT chk_no_autorelacion CHECK ((id_persona_a <> id_persona_b)),
    CONSTRAINT chk_relacion_fechas CHECK (((fecha_fin IS NULL) OR (fecha_fin > fecha_inicio)))
);


--
-- Name: requisitos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisitos (
    id_requisito integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    tipo public.tipo_requisito DEFAULT 'Formacion'::public.tipo_requisito NOT NULL,
    id_rol_requerido integer,
    obligatorio boolean DEFAULT false NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: requisitos_id_requisito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.requisitos_id_requisito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requisitos_id_requisito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.requisitos_id_requisito_seq OWNED BY public.requisitos.id_requisito;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol public.rol_nombre NOT NULL,
    nivel_jerarquico integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT roles_nivel_jerarquico_check CHECK (((nivel_jerarquico >= 1) AND (nivel_jerarquico <= 4)))
);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: solicitudes_historial_estado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_historial_estado (
    id_historial integer NOT NULL,
    id_solicitud integer NOT NULL,
    estado_anterior public.estado_solicitud,
    estado_nuevo public.estado_solicitud NOT NULL,
    fecha_cambio timestamp with time zone DEFAULT now() NOT NULL,
    id_cambiado_por integer NOT NULL,
    notas text
);


--
-- Name: solicitudes_historial_estado_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_historial_estado_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_historial_estado_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_historial_estado_id_historial_seq OWNED BY public.solicitudes_historial_estado.id_historial;


--
-- Name: solicitudes_personal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_personal (
    id_solicitud integer NOT NULL,
    id_persona integer NOT NULL,
    id_rol_solicitado integer NOT NULL,
    id_gestionado_por integer NOT NULL,
    id_resuelto_por integer,
    estado public.estado_solicitud DEFAULT 'Borrador'::public.estado_solicitud NOT NULL,
    fecha_solicitud timestamp with time zone DEFAULT now() NOT NULL,
    fecha_resolucion timestamp with time zone,
    notas_staff text,
    notas_coordinador text,
    estado_civil public.estado_civil,
    nombre_conyuge character varying(100),
    tiene_hijos boolean DEFAULT false NOT NULL,
    numero_hijos smallint,
    direccion text,
    id_red integer,
    estado_liderazgo public.estado_liderazgo,
    id_mentor_propuesto integer,
    circulo_amistad character varying(100),
    tiempo_iglesia_meses integer,
    ministerio_adicional character varying(150),
    sexo_candidato public.tipo_sexo,
    cedula_candidato character varying(20) DEFAULT NULL::character varying,
    ocupacion_candidato character varying(150) DEFAULT NULL::character varying,
    centro_laboral_candidato character varying(150) DEFAULT NULL::character varying,
    nivel_academico_candidato public.nivel_academico,
    dir_ciudad character varying(60) DEFAULT NULL::character varying,
    dir_municipio character varying(60) DEFAULT NULL::character varying,
    dir_distrito character varying(60) DEFAULT NULL::character varying,
    dir_barrio character varying(60) DEFAULT NULL::character varying,
    dir_exacta text,
    tel_casa character varying(20) DEFAULT NULL::character varying,
    tel_oficina character varying(20) DEFAULT NULL::character varying,
    tel_claro character varying(20) DEFAULT NULL::character varying,
    tel_movistar character varying(20) DEFAULT NULL::character varying,
    conyuge_ocupacion character varying(150) DEFAULT NULL::character varying,
    conyuge_centro_laboral character varying(150) DEFAULT NULL::character varying,
    bautizado_agua boolean DEFAULT false NOT NULL,
    fecha_bautismo date,
    fecha_bautismo_precision public.tipo_precision_fecha,
    circulo_amistad_desde date,
    circulo_amistad_precision public.tipo_precision_fecha,
    clases_biblicas_ninos boolean DEFAULT false NOT NULL,
    clases_biblicas_detalle text,
    capacitacion_ensenanza boolean DEFAULT false NOT NULL,
    capacitacion_detalle text,
    observaciones_espirituales_sol text,
    estado_operativo_candidato public.estado_operativo,
    id_lider_propuesto integer,
    condicion_civil public.condicion_civil DEFAULT 'Ninguna'::public.condicion_civil NOT NULL,
    lider_nombres text,
    lider_apellidos text,
    lider_telefono text,
    asistio_otra_iglesia boolean DEFAULT false,
    nombre_otra_iglesia text,
    denominacion_otra_iglesia public.tipo_denominacion,
    CONSTRAINT chk_sol_circulo_lider CHECK (((circulo_amistad IS NULL) OR (estado_liderazgo = 'Lider'::public.estado_liderazgo))),
    CONSTRAINT chk_sol_conyuge CHECK (((estado_civil IS NULL) OR (estado_civil <> 'Casado'::public.estado_civil) OR (nombre_conyuge IS NOT NULL))),
    CONSTRAINT chk_sol_fecha_resolucion CHECK (((fecha_resolucion IS NULL) OR (fecha_resolucion >= fecha_solicitud))),
    CONSTRAINT chk_sol_hijos CHECK (((tiene_hijos = false) OR ((numero_hijos IS NOT NULL) AND (numero_hijos > 0)))),
    CONSTRAINT chk_sol_mentor_liderazgo CHECK (((id_mentor_propuesto IS NULL) OR (estado_liderazgo = ANY (ARRAY['Gap'::public.estado_liderazgo, 'Lider'::public.estado_liderazgo])))),
    CONSTRAINT chk_sol_resolucion_completa CHECK (((estado = ANY (ARRAY['Borrador'::public.estado_solicitud, 'Pendiente'::public.estado_solicitud])) OR ((estado = ANY (ARRAY['Aprobado'::public.estado_solicitud, 'Rechazado'::public.estado_solicitud])) AND (id_resuelto_por IS NOT NULL) AND (fecha_resolucion IS NOT NULL)))),
    CONSTRAINT solicitudes_personal_tiempo_iglesia_meses_check CHECK ((tiempo_iglesia_meses >= 0))
);


--
-- Name: solicitudes_personal_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_personal_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_personal_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_personal_id_solicitud_seq OWNED BY public.solicitudes_personal.id_solicitud;


--
-- Name: solicitudes_requisitos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_requisitos (
    id_solicitud integer NOT NULL,
    id_requisito integer NOT NULL,
    cumplido boolean DEFAULT false NOT NULL,
    fecha_cumplido date,
    notas text,
    CONSTRAINT chk_sr_fecha_cumplido CHECK (((cumplido = false) OR (fecha_cumplido IS NOT NULL)))
);


--
-- Name: telefonos_personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telefonos_personas (
    id_telefono integer NOT NULL,
    id_persona integer NOT NULL,
    tipo public.tipo_telefono DEFAULT 'Otro'::public.tipo_telefono NOT NULL,
    numero character varying(20) NOT NULL,
    tiene_whatsapp boolean DEFAULT false NOT NULL,
    es_principal boolean DEFAULT false NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone
);


--
-- Name: telefonos_personas_id_telefono_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.telefonos_personas_id_telefono_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: telefonos_personas_id_telefono_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.telefonos_personas_id_telefono_seq OWNED BY public.telefonos_personas.id_telefono;


--
-- Name: turnos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.turnos (
    id_turno integer NOT NULL,
    nombre public.nombre_turno NOT NULL,
    dia_semana smallint NOT NULL,
    hora_inicio time without time zone NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT turnos_dia_semana_check CHECK ((dia_semana = ANY (ARRAY[0, 3])))
);


--
-- Name: turnos_id_turno_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.turnos_id_turno_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: turnos_id_turno_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.turnos_id_turno_seq OWNED BY public.turnos.id_turno;


--
-- Name: tutores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutores (
    id_persona integer NOT NULL,
    tipo_tutor character varying(60) NOT NULL
);


--
-- Name: tutores_ninos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutores_ninos (
    id_tutor integer NOT NULL,
    id_nino integer NOT NULL,
    parentesco character varying(60) DEFAULT 'Padre/Madre'::character varying NOT NULL
);


--
-- Name: v_alertas_medicas_ninos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_alertas_medicas_ninos AS
 SELECT (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS nino,
    im.tipo,
    im.descripcion,
    im.severidad,
    im.instrucciones
   FROM ((public.info_medica_ninos im
     JOIN public.ninos n ON ((im.id_nino = n.id_persona)))
     JOIN public.personas p ON ((n.id_persona = p.id_persona)))
  ORDER BY
        CASE im.severidad
            WHEN 'Alta'::public.severidad_medica THEN 1
            WHEN 'Moderada'::public.severidad_medica THEN 2
            WHEN 'Leve'::public.severidad_medica THEN 3
            ELSE 4
        END,
        CASE im.tipo
            WHEN 'Condicion'::public.tipo_info_medica THEN 1
            WHEN 'Alergia'::public.tipo_info_medica THEN 2
            WHEN 'Medicamento'::public.tipo_info_medica THEN 3
            ELSE NULL::integer
        END;


--
-- Name: v_asistencia_mensual_ninos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_asistencia_mensual_ninos AS
 SELECT date_trunc('month'::text, (an.fecha)::timestamp with time zone) AS mes,
    t.nombre AS turno,
    count(DISTINCT an.id_nino) AS ninos_distintos,
    count(*) AS total_registros
   FROM (public.asistencia_ninos an
     JOIN public.turnos t ON ((an.id_turno = t.id_turno)))
  GROUP BY (date_trunc('month'::text, (an.fecha)::timestamp with time zone)), t.nombre
  ORDER BY (date_trunc('month'::text, (an.fecha)::timestamp with time zone)) DESC, t.nombre;


--
-- Name: v_comparativa_mensual; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_comparativa_mensual AS
 SELECT date_trunc('month'::text, (fecha)::timestamp with time zone) AS mes,
    count(DISTINCT id_nino) AS total_ninos,
    lag(count(DISTINCT id_nino)) OVER (ORDER BY (date_trunc('month'::text, (fecha)::timestamp with time zone))) AS mes_anterior,
    (count(DISTINCT id_nino) - lag(count(DISTINCT id_nino)) OVER (ORDER BY (date_trunc('month'::text, (fecha)::timestamp with time zone)))) AS diferencia
   FROM public.asistencia_ninos
  GROUP BY (date_trunc('month'::text, (fecha)::timestamp with time zone))
  ORDER BY (date_trunc('month'::text, (fecha)::timestamp with time zone)) DESC;


--
-- Name: v_cumpleanos_mes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_cumpleanos_mes AS
 SELECT p.nombres,
    p.apellidos,
    p.fecha_nacimiento,
    EXTRACT(day FROM p.fecha_nacimiento) AS dia_cumpleanos
   FROM (public.personas p
     JOIN public.ninos n ON ((p.id_persona = n.id_persona)))
  WHERE (EXTRACT(month FROM p.fecha_nacimiento) = EXTRACT(month FROM CURRENT_DATE))
  ORDER BY (EXTRACT(day FROM p.fecha_nacimiento));


--
-- Name: v_cumplimiento_personal; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_cumplimiento_personal AS
 SELECT date_trunc('month'::text, (am.fecha)::timestamp with time zone) AS mes,
    t.nombre AS turno,
    (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS personal,
    r.nombre_rol AS rol,
    count(*) AS total_sesiones,
    count(*) FILTER (WHERE (am.estado_llegada = 'Temprano'::public.estado_llegada)) AS temprano,
    count(*) FILTER (WHERE (am.estado_llegada = 'Tarde'::public.estado_llegada)) AS tarde,
    count(*) FILTER (WHERE (am.estado_llegada = 'Justificado'::public.estado_llegada)) AS justificado,
    count(*) FILTER (WHERE (am.estado_llegada = 'Injustificado'::public.estado_llegada)) AS injustificado,
    round(((100.0 * (count(*) FILTER (WHERE (am.estado_llegada = ANY (ARRAY['Temprano'::public.estado_llegada, 'Tarde'::public.estado_llegada, 'Justificado'::public.estado_llegada]))))::numeric) / (NULLIF(count(*), 0))::numeric), 2) AS pct_asistencia
   FROM ((((public.asistencia_maestros am
     JOIN public.personal_sistema ps ON ((am.id_personal = ps.id_persona)))
     JOIN public.personas p ON ((ps.id_persona = p.id_persona)))
     JOIN public.roles r ON ((ps.id_rol = r.id_rol)))
     JOIN public.turnos t ON ((am.id_turno = t.id_turno)))
  GROUP BY (date_trunc('month'::text, (am.fecha)::timestamp with time zone)), t.nombre, p.nombres, p.apellidos, r.nombre_rol
  ORDER BY (date_trunc('month'::text, (am.fecha)::timestamp with time zone)) DESC, t.nombre, (((p.nombres)::text || ' '::text) || (p.apellidos)::text);


--
-- Name: v_eventos_mes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_eventos_mes AS
 SELECT e.fecha,
    e.numero_semana,
    t.nombre AS turno,
    e.nombre AS evento,
    e.tipo,
    e.descripcion
   FROM (public.eventos e
     LEFT JOIN public.turnos t ON ((e.id_turno = t.id_turno)))
  WHERE ((e.activo = true) AND (date_trunc('month'::text, (e.fecha)::timestamp with time zone) = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))
  ORDER BY e.fecha, t.hora_inicio;


--
-- Name: v_inasistencias_personal; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_inasistencias_personal AS
 SELECT am.fecha,
    t.nombre AS turno,
    (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS personal,
    r.nombre_rol AS rol,
    am.estado_llegada,
    am.razon_ausencia,
    am.comentarios
   FROM ((((public.asistencia_maestros am
     JOIN public.personal_sistema ps ON ((am.id_personal = ps.id_persona)))
     JOIN public.personas p ON ((ps.id_persona = p.id_persona)))
     JOIN public.roles r ON ((ps.id_rol = r.id_rol)))
     JOIN public.turnos t ON ((am.id_turno = t.id_turno)))
  WHERE (am.estado_llegada = ANY (ARRAY['Injustificado'::public.estado_llegada, 'Tarde'::public.estado_llegada]))
  ORDER BY am.fecha DESC, t.nombre;


--
-- Name: v_ninos_graduacion_mes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ninos_graduacion_mes AS
 SELECT p.nombres,
    p.apellidos,
    p.fecha_nacimiento,
    (date_part('year'::text, age((CURRENT_DATE)::timestamp with time zone, (p.fecha_nacimiento)::timestamp with time zone)))::integer AS edad,
    (EXTRACT(month FROM p.fecha_nacimiento))::integer AS mes_cumpleanos,
    (EXTRACT(day FROM p.fecha_nacimiento))::integer AS dia_cumpleanos,
    g.nombre AS grupo_actual,
    (((date_trunc('year'::text, (CURRENT_DATE)::timestamp with time zone) + (((EXTRACT(month FROM p.fecha_nacimiento) - (1)::numeric) || ' months'::text))::interval) + (((EXTRACT(day FROM p.fecha_nacimiento) - (1)::numeric) || ' days'::text))::interval))::date AS fecha_graduacion_este_anio,
        CASE
            WHEN ((((date_trunc('year'::text, (CURRENT_DATE)::timestamp with time zone) + (((EXTRACT(month FROM p.fecha_nacimiento) - (1)::numeric) || ' months'::text))::interval) + (((EXTRACT(day FROM p.fecha_nacimiento) - (1)::numeric) || ' days'::text))::interval))::date < CURRENT_DATE) THEN true
            ELSE false
        END AS ya_graduo_este_anio
   FROM ((public.personas p
     JOIN public.ninos n ON ((p.id_persona = n.id_persona)))
     LEFT JOIN LATERAL ( SELECT g2.nombre
           FROM (public.ninos_grupos ng
             JOIN public.grupos g2 ON ((ng.id_grupo = g2.id_grupo)))
          WHERE (ng.id_nino = n.id_persona)
          ORDER BY ng.fecha_asignacion DESC
         LIMIT 1) g ON (true))
  WHERE ((p.fecha_nacimiento >= make_date(((EXTRACT(year FROM CURRENT_DATE))::integer - 13), 1, 1)) AND (p.fecha_nacimiento <= make_date(((EXTRACT(year FROM CURRENT_DATE))::integer - 13), 12, 31)) AND ((((date_trunc('year'::text, (CURRENT_DATE)::timestamp with time zone) + (((EXTRACT(month FROM p.fecha_nacimiento) - (1)::numeric) || ' months'::text))::interval) + (((EXTRACT(day FROM p.fecha_nacimiento) - (1)::numeric) || ' days'::text))::interval))::date >= CURRENT_DATE))
  ORDER BY ((EXTRACT(month FROM p.fecha_nacimiento))::integer), ((EXTRACT(day FROM p.fecha_nacimiento))::integer);


--
-- Name: v_ninos_presentes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ninos_presentes AS
 SELECT an.fecha,
    t.nombre AS turno,
    (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS nino,
    g.nombre AS grupo,
    an.es_excepcion_asistencia,
    an.acompanante_en_aula,
    an.hora_entrada,
    f.codigo_ficha AS ficha_entrada,
    an.estado
   FROM ((((public.asistencia_ninos an
     JOIN public.personas p ON ((an.id_nino = p.id_persona)))
     JOIN public.grupos g ON ((an.id_grupo_asistido = g.id_grupo)))
     JOIN public.turnos t ON ((an.id_turno = t.id_turno)))
     JOIN public.fichas f ON ((an.id_ficha_entrada = f.id_ficha)))
  WHERE (an.estado = 'Presente'::public.estado_asistencia_nino)
  ORDER BY an.fecha DESC, t.nombre, g.nombre, p.apellidos;


--
-- Name: v_ninos_transicion_grupo_mes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ninos_transicion_grupo_mes AS
 WITH edad_calculada AS (
         SELECT p.id_persona,
            p.nombres,
            p.apellidos,
            p.fecha_nacimiento,
            (date_part('year'::text, age((CURRENT_DATE)::timestamp with time zone, (p.fecha_nacimiento)::timestamp with time zone)))::integer AS edad_hoy,
            (date_part('year'::text, age((((CURRENT_DATE + '3 mons'::interval))::date)::timestamp with time zone, (p.fecha_nacimiento)::timestamp with time zone)))::integer AS edad_proyectada,
                CASE
                    WHEN ((((date_trunc('year'::text, (CURRENT_DATE)::timestamp with time zone) + (((EXTRACT(month FROM p.fecha_nacimiento) - (1)::numeric) || ' months'::text))::interval) + (((EXTRACT(day FROM p.fecha_nacimiento) - (1)::numeric) || ' days'::text))::interval))::date >= ((CURRENT_DATE - '1 mon'::interval))::date) THEN (((date_trunc('year'::text, (CURRENT_DATE)::timestamp with time zone) + (((EXTRACT(month FROM p.fecha_nacimiento) - (1)::numeric) || ' months'::text))::interval) + (((EXTRACT(day FROM p.fecha_nacimiento) - (1)::numeric) || ' days'::text))::interval))::date
                    ELSE ((((date_trunc('year'::text, (CURRENT_DATE)::timestamp with time zone) + '1 year'::interval) + (((EXTRACT(month FROM p.fecha_nacimiento) - (1)::numeric) || ' months'::text))::interval) + (((EXTRACT(day FROM p.fecha_nacimiento) - (1)::numeric) || ' days'::text))::interval))::date
                END AS fecha_transicion
           FROM (public.personas p
             JOIN public.ninos n ON ((p.id_persona = n.id_persona)))
          WHERE ((p.fecha_nacimiento >= ((CURRENT_DATE - '14 years'::interval))::date) AND (p.fecha_nacimiento <= ((CURRENT_DATE - '2 years'::interval))::date))
        ), grupo_asignado AS (
         SELECT DISTINCT ON (ng.id_nino) ng.id_nino,
            ng.id_grupo AS id_grupo_actual,
            g.nombre AS nombre_grupo_actual,
            g.edad_minima AS actual_edad_min,
            g.edad_maxima AS actual_edad_max
           FROM (public.ninos_grupos ng
             JOIN public.grupos g ON ((ng.id_grupo = g.id_grupo)))
          WHERE (ng.activo = true)
          ORDER BY ng.id_nino, ng.fecha_asignacion DESC
        ), grupo_sugerido AS (
         SELECT ec_1.id_persona,
            g.id_grupo AS id_grupo_sugerido,
            g.nombre AS nombre_grupo_sugerido
           FROM (edad_calculada ec_1
             JOIN public.grupos g ON (((ec_1.edad_proyectada >= g.edad_minima) AND (ec_1.edad_proyectada <= g.edad_maxima) AND (g.activo = true))))
        )
 SELECT ec.id_persona,
    ec.nombres,
    ec.apellidos,
    ec.fecha_nacimiento,
    ec.edad_hoy AS edad_este_mes,
    ga.nombre_grupo_actual AS grupo_actual,
    gs.nombre_grupo_sugerido AS grupo_sugerido,
        CASE
            WHEN (ga.id_grupo_actual IS NULL) THEN 'Sin_Asignacion'::text
            WHEN (gs.id_grupo_sugerido IS NULL) THEN 'Fuera_De_Rango'::text
            WHEN (ga.id_grupo_actual <> gs.id_grupo_sugerido) THEN 'Debe_Transicionar'::text
            ELSE 'En_Grupo_Correcto'::text
        END AS estado_transicion,
    ec.fecha_transicion
   FROM ((edad_calculada ec
     LEFT JOIN grupo_asignado ga ON ((ec.id_persona = ga.id_nino)))
     LEFT JOIN grupo_sugerido gs ON ((ec.id_persona = gs.id_persona)))
  WHERE ((ga.id_grupo_actual IS NULL) OR ((ga.id_grupo_actual IS NOT NULL) AND (ec.edad_proyectada > ga.actual_edad_max) AND (ec.edad_proyectada < 13)))
  ORDER BY ec.edad_proyectada DESC, ec.apellidos;


--
-- Name: v_perfil_completo_personal; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_perfil_completo_personal AS
 SELECT ps.id_persona,
    (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS nombre_completo,
    p.sexo,
    p.cedula,
    p.fecha_nacimiento,
    (date_part('year'::text, age((CURRENT_DATE)::timestamp with time zone, (p.fecha_nacimiento)::timestamp with time zone)))::integer AS edad,
    r.nombre_rol AS rol,
    ps.activo,
    pd.ciudad_departamento,
    pd.municipio,
    pd.distrito,
    pd.barrio,
    pd.direccion_exacta,
    tp.numero AS telefono_principal,
    tp.tipo AS tipo_telefono_principal,
    tp.tiene_whatsapp AS principal_tiene_whatsapp,
    pip.estado_civil,
    pip.nombre_conyuge,
    pip.tiene_hijos,
    pip.numero_hijos,
    pip.ocupacion,
    pip.centro_laboral,
    pip.nivel_academico,
    pii.bautizado_agua,
    pii.fecha_bautismo,
    pii.estado_operativo,
    rd.nombre AS red,
    ca.nombre AS circulo_amistad,
    pii.circulo_amistad_desde,
    pii.tiempo_iglesia_meses,
    pii.ministerio_adicional,
    pii.clases_biblicas_ninos,
    pii.capacitacion_ensenanza,
    pii.observaciones_espirituales,
    pl.id_lider,
    (((p_lider.nombres)::text || ' '::text) || (p_lider.apellidos)::text) AS nombre_lider,
    tp_lider.numero AS tel_lider,
        CASE
            WHEN (sus.id_suspension IS NOT NULL) THEN true
            ELSE false
        END AS en_suspension,
    sus.fecha_inicio AS suspension_desde,
    sus.fecha_fin AS suspension_hasta,
    sus.categoria_motivo AS categoria_suspension,
    sus.motivo AS motivo_suspension
   FROM ((((((((((((public.personal_sistema ps
     JOIN public.personas p ON ((ps.id_persona = p.id_persona)))
     JOIN public.roles r ON ((ps.id_rol = r.id_rol)))
     LEFT JOIN public.personal_info_personal pip ON ((ps.id_persona = pip.id_persona)))
     LEFT JOIN public.personal_info_iglesia pii ON ((ps.id_persona = pii.id_persona)))
     LEFT JOIN public.redes rd ON ((pii.id_red = rd.id_red)))
     LEFT JOIN public.circulos_amistad ca ON ((pii.id_circulo = ca.id_circulo)))
     LEFT JOIN public.personal_lideres pl ON ((pii.id_lider = pl.id_lider)))
     LEFT JOIN public.personas p_lider ON ((pl.id_persona = p_lider.id_persona)))
     LEFT JOIN public.telefonos_personas tp_lider ON (((p_lider.id_persona = tp_lider.id_persona) AND (tp_lider.es_principal = true) AND (tp_lider.activo = true))))
     LEFT JOIN public.personas_direcciones pd ON (((ps.id_persona = pd.id_persona) AND (pd.es_principal = true) AND (pd.activo = true))))
     LEFT JOIN public.telefonos_personas tp ON (((ps.id_persona = tp.id_persona) AND (tp.es_principal = true) AND (tp.activo = true))))
     LEFT JOIN LATERAL ( SELECT pss.id_suspension,
            pss.fecha_inicio,
            pss.fecha_fin,
            pss.categoria_motivo,
            pss.motivo
           FROM public.personal_suspensiones_servicio pss
          WHERE ((pss.id_personal = ps.id_persona) AND (pss.activo = true) AND (pss.fecha_inicio <= CURRENT_DATE) AND ((pss.fecha_fin IS NULL) OR (pss.fecha_fin >= CURRENT_DATE)))
         LIMIT 1) sus ON (true))
  ORDER BY p.apellidos, p.nombres;


--
-- Name: v_personal_disponible_servicio; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_personal_disponible_servicio AS
 SELECT ps.id_persona,
    (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS nombre_completo,
    r.nombre_rol AS rol,
    ps.fecha_ingreso_servicio
   FROM ((public.personal_sistema ps
     JOIN public.personas p ON ((ps.id_persona = p.id_persona)))
     JOIN public.roles r ON ((ps.id_rol = r.id_rol)))
  WHERE ((ps.activo = true) AND (NOT (EXISTS ( SELECT 1
           FROM public.personal_suspensiones_servicio pss
          WHERE ((pss.id_personal = ps.id_persona) AND (pss.activo = true) AND (pss.fecha_inicio <= CURRENT_DATE) AND ((pss.fecha_fin IS NULL) OR (pss.fecha_fin >= CURRENT_DATE)))))))
  ORDER BY r.nivel_jerarquico DESC, p.apellidos, p.nombres;


--
-- Name: v_requisitos_personal; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_requisitos_personal AS
 SELECT (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS personal,
    r_rol.nombre_rol AS rol,
    req.nombre AS requisito,
    req.tipo,
    req.obligatorio,
    COALESCE(pr.cumplido, false) AS cumplido,
    pr.fecha_cumplido,
    pr.notas
   FROM ((((public.personal_sistema ps
     JOIN public.personas p ON ((ps.id_persona = p.id_persona)))
     JOIN public.roles r_rol ON ((ps.id_rol = r_rol.id_rol)))
     CROSS JOIN public.requisitos req)
     LEFT JOIN public.personal_requisitos pr ON (((pr.id_personal = ps.id_persona) AND (pr.id_requisito = req.id_requisito))))
  WHERE (req.activo = true)
  ORDER BY (((p.nombres)::text || ' '::text) || (p.apellidos)::text), req.tipo, req.nombre;


--
-- Name: v_solicitud_formulario_completo; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_solicitud_formulario_completo AS
 SELECT sp.id_solicitud,
    (sp.fecha_solicitud)::date AS fecha_formulario,
    (((p.nombres)::text || ' '::text) || (p.apellidos)::text) AS candidato,
    sp.sexo_candidato AS sexo,
    sp.cedula_candidato AS cedula,
    p.fecha_nacimiento,
    sp.tel_casa,
    sp.tel_oficina,
    sp.tel_claro,
    sp.tel_movistar,
    sp.dir_ciudad,
    sp.dir_municipio,
    sp.dir_distrito,
    sp.dir_barrio,
    sp.dir_exacta,
    sp.ocupacion_candidato,
    sp.centro_laboral_candidato,
    sp.nivel_academico_candidato AS nivel_academico,
    sp.estado_civil,
    sp.nombre_conyuge,
    sp.conyuge_ocupacion,
    sp.conyuge_centro_laboral,
    sp.bautizado_agua,
    sp.fecha_bautismo,
    sp.fecha_bautismo_precision,
    sp.circulo_amistad,
    sp.circulo_amistad_desde,
    sp.clases_biblicas_ninos,
    sp.clases_biblicas_detalle,
    sp.capacitacion_ensenanza,
    sp.capacitacion_detalle,
    sp.observaciones_espirituales_sol AS observaciones_espirituales,
    sp.estado_operativo_candidato,
    r_sol.nombre_rol AS rol_solicitado,
    sp.estado,
    (((p_lider.nombres)::text || ' '::text) || (p_lider.apellidos)::text) AS lider_propuesto,
    tp_lider.numero AS tel_lider,
    (((p_staff.nombres)::text || ' '::text) || (p_staff.apellidos)::text) AS gestionado_por,
    sp.notas_staff,
    sp.notas_coordinador
   FROM (((((((public.solicitudes_personal sp
     JOIN public.personas p ON ((sp.id_persona = p.id_persona)))
     JOIN public.roles r_sol ON ((sp.id_rol_solicitado = r_sol.id_rol)))
     JOIN public.personal_sistema ps_staff ON ((sp.id_gestionado_por = ps_staff.id_persona)))
     JOIN public.personas p_staff ON ((ps_staff.id_persona = p_staff.id_persona)))
     LEFT JOIN public.personal_lideres pl ON ((sp.id_lider_propuesto = pl.id_lider)))
     LEFT JOIN public.personas p_lider ON ((pl.id_persona = p_lider.id_persona)))
     LEFT JOIN public.telefonos_personas tp_lider ON (((p_lider.id_persona = tp_lider.id_persona) AND (tp_lider.es_principal = true) AND (tp_lider.activo = true))))
  ORDER BY sp.fecha_solicitud DESC;


--
-- Name: v_solicitudes_pendientes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_solicitudes_pendientes AS
 SELECT sp.id_solicitud,
    (((p_cand.nombres)::text || ' '::text) || (p_cand.apellidos)::text) AS candidato,
    p_cand.telefono,
    r.nombre_rol AS rol_solicitado,
    (((p_staff.nombres)::text || ' '::text) || (p_staff.apellidos)::text) AS gestionado_por,
    sp.fecha_solicitud,
    sp.estado_liderazgo,
    sp.tiempo_iglesia_meses,
    ( SELECT count(*) AS count
           FROM (public.solicitudes_requisitos sr
             JOIN public.requisitos req ON ((sr.id_requisito = req.id_requisito)))
          WHERE ((sr.id_solicitud = sp.id_solicitud) AND (sr.cumplido = true) AND (req.obligatorio = true))) AS req_obligatorios_cumplidos,
    ( SELECT count(*) AS count
           FROM public.requisitos req
          WHERE ((req.obligatorio = true) AND (req.activo = true) AND ((req.id_rol_requerido IS NULL) OR (req.id_rol_requerido = sp.id_rol_solicitado)))) AS req_obligatorios_total,
    sp.notas_staff
   FROM ((((public.solicitudes_personal sp
     JOIN public.personas p_cand ON ((sp.id_persona = p_cand.id_persona)))
     JOIN public.roles r ON ((sp.id_rol_solicitado = r.id_rol)))
     JOIN public.personal_sistema ps ON ((sp.id_gestionado_por = ps.id_persona)))
     JOIN public.personas p_staff ON ((ps.id_persona = p_staff.id_persona)))
  WHERE (sp.estado = 'Pendiente'::public.estado_solicitud)
  ORDER BY sp.fecha_solicitud;


--
-- Name: asistencia_maestros id_asistencia_maestro; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros ALTER COLUMN id_asistencia_maestro SET DEFAULT nextval('public.asistencia_maestros_id_asistencia_maestro_seq'::regclass);


--
-- Name: asistencia_ninos id_asistencia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos ALTER COLUMN id_asistencia SET DEFAULT nextval('public.asistencia_ninos_id_asistencia_seq'::regclass);


--
-- Name: circulos_amistad id_circulo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circulos_amistad ALTER COLUMN id_circulo SET DEFAULT nextval('public.circulos_amistad_id_circulo_seq'::regclass);


--
-- Name: eventos id_evento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos ALTER COLUMN id_evento SET DEFAULT nextval('public.eventos_id_evento_seq'::regclass);


--
-- Name: fichas id_ficha; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fichas ALTER COLUMN id_ficha SET DEFAULT nextval('public.fichas_id_ficha_seq'::regclass);


--
-- Name: grupos id_grupo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupos ALTER COLUMN id_grupo SET DEFAULT nextval('public.grupos_id_grupo_seq'::regclass);


--
-- Name: info_medica_ninos id_info; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.info_medica_ninos ALTER COLUMN id_info SET DEFAULT nextval('public.info_medica_ninos_id_info_seq'::regclass);


--
-- Name: ninos_expedientes_conducta id_expediente; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_expedientes_conducta ALTER COLUMN id_expediente SET DEFAULT nextval('public.ninos_expedientes_conducta_id_expediente_seq'::regclass);


--
-- Name: personal_expedientes_evaluacion id_evaluacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_expedientes_evaluacion ALTER COLUMN id_evaluacion SET DEFAULT nextval('public.personal_expedientes_evaluacion_id_evaluacion_seq'::regclass);


--
-- Name: personal_historial_cambios id_historial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_cambios ALTER COLUMN id_historial SET DEFAULT nextval('public.personal_historial_cambios_id_historial_seq'::regclass);


--
-- Name: personal_historial_lideres id_historial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_lideres ALTER COLUMN id_historial SET DEFAULT nextval('public.personal_historial_lideres_id_historial_seq'::regclass);


--
-- Name: personal_historial_roles id_historial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_roles ALTER COLUMN id_historial SET DEFAULT nextval('public.personal_historial_roles_id_historial_seq'::regclass);


--
-- Name: personal_lideres id_lider; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lideres ALTER COLUMN id_lider SET DEFAULT nextval('public.personal_lideres_id_lider_seq'::regclass);


--
-- Name: personal_suspensiones_servicio id_suspension; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_suspensiones_servicio ALTER COLUMN id_suspension SET DEFAULT nextval('public.personal_suspensiones_servicio_id_suspension_seq'::regclass);


--
-- Name: personas id_persona; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas ALTER COLUMN id_persona SET DEFAULT nextval('public.personas_id_persona_seq'::regclass);


--
-- Name: personas_direcciones id_direccion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas_direcciones ALTER COLUMN id_direccion SET DEFAULT nextval('public.personas_direcciones_id_direccion_seq'::regclass);


--
-- Name: redes id_red; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redes ALTER COLUMN id_red SET DEFAULT nextval('public.redes_id_red_seq'::regclass);


--
-- Name: requisitos id_requisito; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisitos ALTER COLUMN id_requisito SET DEFAULT nextval('public.requisitos_id_requisito_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: solicitudes_historial_estado id_historial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_historial_estado ALTER COLUMN id_historial SET DEFAULT nextval('public.solicitudes_historial_estado_id_historial_seq'::regclass);


--
-- Name: solicitudes_personal id_solicitud; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitudes_personal_id_solicitud_seq'::regclass);


--
-- Name: telefonos_personas id_telefono; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telefonos_personas ALTER COLUMN id_telefono SET DEFAULT nextval('public.telefonos_personas_id_telefono_seq'::regclass);


--
-- Name: turnos id_turno; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos ALTER COLUMN id_turno SET DEFAULT nextval('public.turnos_id_turno_seq'::regclass);


--
-- Data for Name: asistencia_maestros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asistencia_maestros (id_asistencia_maestro, fecha, id_personal, id_grupo, estado_llegada, hora_llegada, comentarios, id_turno, id_evento, razon_ausencia) FROM stdin;
\.


--
-- Data for Name: asistencia_ninos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asistencia_ninos (id_asistencia, fecha, id_nino, id_grupo_asistido, id_ficha_entrada, id_ficha_salida, id_ingresado_por, id_retirado_por, hora_entrada, hora_salida, registrado_por, checkout_por, acompanante_en_aula, notas, id_turno, id_evento, estado, es_excepcion_asistencia, motivo_excepcion_asistencia, es_primera_vez) FROM stdin;
345	2026-06-21	170	2	56	\N	757	171	17:04:12	22:43:44	491	775	f	\N	3	\N	Retirado	f	\N	t
448	2026-06-24	289	3	81	\N	88	88	00:36:15	02:23:25	828	1	f	\N	1	\N	Retirado	f	\N	t
447	2026-06-24	87	2	54	\N	88	88	00:35:53	02:23:29	828	832	f	\N	1	\N	Retirado	f	\N	t
442	2026-06-24	144	3	2	\N	145	145	00:24:24	02:23:44	828	1	f	\N	1	\N	Retirado	f	\N	t
391	2026-06-21	123	2	53	\N	791	791	23:04:23	23:30:21	775	775	f	\N	4	\N	Retirado	f	\N	t
251	2026-06-14	279	1	18	\N	98	\N	23:49:29	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
381	2026-06-21	776	1	18	\N	777	777	22:48:40	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
382	2026-06-21	778	1	19	\N	779	779	22:50:42	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
383	2026-06-21	782	1	20	\N	783	783	22:52:29	23:59:59	775	\N	f	\N	4	\N	Retirado	t		t
384	2026-06-21	780	2	50	\N	781	781	22:53:17	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
390	2026-06-21	330	1	24	\N	790	331	23:03:33	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
396	2026-06-21	795	1	25	\N	796	796	23:11:53	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
398	2026-06-21	799	2	57	\N	801	800	23:17:07	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
399	2026-06-21	802	1	26	\N	803	803	23:19:04	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
400	2026-06-21	804	2	58	\N	805	805	23:20:39	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
401	2026-06-21	806	2	59	\N	803	803	23:20:54	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
402	2026-06-21	326	3	3	\N	807	327	23:21:34	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
403	2026-06-21	268	2	60	\N	809	269	23:23:05	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
404	2026-06-21	808	3	81	\N	805	805	23:23:45	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
405	2026-06-21	361	1	27	\N	810	362	23:23:46	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	t
406	2026-06-21	811	2	53	\N	812	812	23:34:27	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
409	2026-06-21	813	1	28	\N	812	812	23:37:21	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
411	2026-06-21	332	1	29	\N	333	333	23:38:03	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
414	2026-06-21	814	3	86	\N	815	815	23:40:57	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
415	2026-06-21	816	2	63	\N	817	817	23:44:29	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
419	2026-06-21	818	2	62	\N	819	819	23:55:44	23:59:59	1	\N	f	\N	4	\N	Retirado	f	\N	t
451	2026-06-24	137	2	56	\N	138	138	00:37:57	02:15:33	828	1	f	\N	1	\N	Retirado	f	\N	t
444	2026-06-24	829	3	3	\N	830	830	00:27:19	02:22:35	1	1	f	\N	1	\N	Retirado	f	\N	t
457	2026-06-24	833	1	24	\N	834	834	01:01:16	02:27:43	1	828	f	\N	1	\N	Retirado	f	\N	t
481	2026-06-28	858	2	54	\N	859	859	14:25:59	16:00:59	1	1	f	\N	2	\N	Retirado	f	\N	t
482	2026-06-28	860	2	56	\N	861	861	14:27:34	16:01:11	839	1	f	\N	2	\N	Retirado	f	\N	t
252	2026-06-14	97	1	19	\N	98	\N	23:49:45	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
488	2026-06-28	854	1	207	\N	855	855	15:11:28	16:03:04	1	839	f	\N	2	\N	Retirado	f	\N	t
487	2026-06-28	868	1	22	\N	869	869	15:10:43	16:03:58	1	839	f	\N	2	\N	Retirado	f	\N	t
479	2026-06-28	81	2	53	\N	82	82	14:13:20	16:04:22	1	1	f	\N	2	\N	Retirado	f	\N	t
483	2026-06-28	862	3	84	\N	863	863	14:31:36	16:06:11	1	838	f	\N	2	\N	Retirado	f	\N	t
475	2026-06-28	849	3	82	\N	850	850	14:04:50	16:12:45	1	838	f	\N	2	\N	Retirado	f	\N	t
474	2026-06-28	847	2	51	\N	848	848	14:00:57	16:13:02	1	1	f	\N	2	\N	Retirado	f	\N	t
486	2026-06-28	866	2	58	\N	867	867	14:57:04	16:13:13	1	1	f	\N	2	\N	Retirado	f	\N	t
478	2026-06-28	856	1	20	\N	857	857	14:12:49	16:13:18	1	839	f	\N	2	\N	Retirado	t	Si	t
476	2026-06-28	851	3	282	\N	852	852	14:06:03	16:13:48	1	838	f	\N	2	\N	Retirado	f	\N	t
485	2026-06-28	864	1	217	\N	865	865	14:40:09	16:13:49	1	839	f	\N	2	\N	Retirado	f	\N	t
477	2026-06-28	853	1	206	\N	852	852	14:07:02	16:14:04	1	839	f	\N	2	\N	Retirado	f	\N	t
489	2026-06-28	870	2	227	\N	871	871	15:16:58	16:14:34	1	1	f	\N	2	\N	Retirado	f	\N	t
464	2026-06-28	840	2	226	\N	841	841	13:45:16	16:15:57	1	1	f	\N	2	\N	Retirado	f	\N	t
465	2026-06-28	842	3	278	\N	843	843	13:48:33	16:16:26	1	838	f	\N	2	\N	Retirado	f	\N	t
499	2026-06-28	876	3	81	\N	877	877	17:03:56	19:13:43	1	491	f	\N	3	\N	Retirado	f	\N	t
519	2026-06-28	881	2	53	\N	882	882	17:15:37	19:13:58	491	491	f	\N	3	\N	Retirado	f	\N	t
502	2026-06-28	878	1	207	\N	879	879	17:05:36	19:14:29	491	1	f	\N	3	\N	Retirado	f	\N	t
526	2026-06-28	883	3	89	\N	884	884	17:25:41	19:14:42	1	491	f	\N	3	\N	Retirado	t	Los padres lo trajeron	t
495	2026-06-28	873	2	50	\N	874	874	16:56:16	19:39:21	1	1	f	\N	3	\N	Retirado	f	\N	t
496	2026-06-28	875	1	18	\N	874	874	16:57:10	19:39:44	1	1	f	\N	3	\N	Retirado	f	\N	t
65	2026-05-31	282	1	23	\N	283	\N	16:37:55	\N	1	\N	t	\N	3	\N	Presente	f	\N	t
80	2026-05-31	450	2	57	\N	451	451	17:08:09	19:02:16	1	1	f	\N	3	\N	Retirado	f	\N	t
68	2026-05-31	446	2	50	\N	447	447	16:50:43	19:22:55	1	1	f	\N	3	\N	Retirado	f	\N	t
73	2026-05-31	180	1	18	\N	181	181	17:00:12	19:23:11	1	1	f	\N	3	\N	Retirado	f	\N	t
75	2026-05-31	448	3	84	\N	449	449	17:03:23	19:26:10	1	1	f	\N	3	\N	Retirado	f	\N	t
81	2026-05-31	355	2	58	\N	452	452	17:09:33	19:31:16	1	1	f	\N	3	\N	Retirado	f	\N	t
71	2026-05-31	378	2	52	\N	377	377	16:58:44	19:31:31	1	1	f	\N	3	\N	Retirado	f	\N	t
69	2026-05-31	302	2	51	\N	303	303	16:57:27	19:31:35	1	1	f	\N	3	\N	Retirado	f	\N	t
70	2026-05-31	376	3	83	\N	377	377	16:58:20	19:34:01	1	1	f	\N	3	\N	Retirado	f	\N	t
12	2026-05-24	360	1	22	\N	215	215	17:03:35	17:43:48	1	1	f	\N	3	\N	Retirado	f	\N	t
34	2026-05-24	287	2	64	\N	288	288	17:23:00	18:41:47	1	1	f	\N	3	\N	Retirado	f	\N	t
17	2026-05-24	182	1	23	\N	183	183	17:07:42	18:45:34	1	1	f	\N	3	\N	Retirado	f	\N	t
18	2026-05-24	286	2	54	\N	183	183	17:08:03	18:45:55	1	1	f	\N	3	\N	Retirado	f	\N	t
3	2026-05-24	216	1	19	\N	217	217	16:53:36	18:58:01	1	1	f	\N	3	\N	Retirado	f	\N	t
44	2026-05-24	358	1	31	\N	359	359	17:42:21	18:59:07	1	1	f	\N	3	\N	Retirado	f	\N	t
56	2026-05-24	356	1	36	\N	357	357	18:17:57	19:08:29	1	1	f	\N	3	\N	Retirado	f	\N	t
55	2026-05-24	304	2	74	\N	175	175	18:12:02	19:08:38	1	1	f	\N	3	\N	Retirado	f	\N	t
54	2026-05-24	174	2	73	\N	175	175	18:11:50	19:08:45	1	1	f	\N	3	\N	Retirado	f	\N	t
53	2026-05-24	367	1	35	\N	366	366	18:11:30	19:08:51	1	1	f	\N	3	\N	Retirado	f	\N	t
52	2026-05-24	365	1	34	\N	366	366	18:10:40	19:08:56	1	1	f	\N	3	\N	Retirado	f	\N	t
51	2026-05-24	411	1	33	\N	412	412	17:53:49	19:09:02	1	1	t	\N	3	\N	Retirado	f	\N	t
441	2026-06-24	279	1	19	\N	98	98	00:21:50	02:33:14	1	828	f	\N	1	\N	Retirado	f	\N	f
50	2026-05-24	210	3	91	\N	211	211	17:49:25	19:09:08	1	1	f	\N	3	\N	Retirado	f	\N	t
49	2026-05-24	410	2	72	\N	409	409	17:47:32	19:09:17	1	1	f	\N	3	\N	Retirado	f	\N	t
48	2026-05-24	408	1	32	\N	409	409	17:46:42	19:09:36	1	1	f	\N	3	\N	Retirado	f	\N	t
46	2026-05-24	364	3	89	\N	68	68	17:45:29	19:09:51	1	1	f	\N	3	\N	Retirado	f	\N	t
45	2026-05-24	363	1	22	\N	112	112	17:44:10	19:10:15	1	1	f	\N	3	\N	Retirado	f	\N	t
43	2026-05-24	299	2	71	\N	219	219	17:37:39	19:10:20	1	1	f	\N	3	\N	Retirado	f	\N	t
42	2026-05-24	218	1	30	\N	219	219	17:37:25	19:10:24	1	1	f	\N	3	\N	Retirado	f	\N	t
41	2026-05-24	228	2	70	\N	229	229	17:37:01	19:10:32	1	1	f	\N	3	\N	Retirado	f	\N	t
40	2026-05-24	406	2	69	\N	407	407	17:36:06	19:10:59	1	1	f	\N	3	\N	Retirado	f	\N	t
39	2026-05-24	273	2	67	\N	274	274	17:34:05	19:11:04	1	1	f	\N	3	\N	Retirado	f	\N	t
38	2026-05-24	154	2	66	\N	155	155	17:30:01	19:11:08	1	1	f	\N	3	\N	Retirado	f	\N	t
37	2026-05-24	202	3	88	\N	155	155	17:29:33	21:40:42	1	1	f	\N	3	\N	Retirado	f	\N	t
36	2026-05-24	301	1	29	\N	155	155	17:29:19	21:40:46	1	1	f	\N	3	\N	Retirado	f	\N	t
35	2026-05-24	69	2	65	\N	70	70	17:28:40	21:40:50	1	1	f	\N	3	\N	Retirado	f	\N	t
33	2026-05-24	195	2	63	\N	196	196	17:20:19	21:40:54	1	1	f	\N	3	\N	Retirado	f	\N	t
32	2026-05-24	259	3	87	\N	260	260	17:20:06	21:40:58	1	1	f	\N	3	\N	Retirado	f	\N	t
31	2026-05-24	317	3	86	\N	260	260	17:19:42	21:41:02	1	1	f	\N	3	\N	Retirado	f	\N	t
30	2026-05-24	266	2	62	\N	267	267	17:18:21	21:41:06	1	1	f	\N	3	\N	Retirado	f	\N	t
29	2026-05-24	296	2	61	\N	267	267	17:18:05	21:41:10	1	1	f	\N	3	\N	Retirado	f	\N	t
28	2026-05-24	328	1	28	\N	226	226	17:17:45	21:41:14	1	1	t	\N	3	\N	Retirado	f	\N	t
27	2026-05-24	225	3	85	\N	226	226	17:17:19	21:41:18	1	1	f	\N	3	\N	Retirado	f	\N	t
26	2026-05-24	280	3	84	\N	281	281	17:17:01	21:41:22	1	1	f	\N	3	\N	Retirado	f	\N	t
25	2026-05-24	325	2	60	\N	281	281	17:16:44	21:41:26	1	1	f	\N	3	\N	Retirado	f	\N	t
24	2026-05-24	404	2	59	\N	405	405	17:16:29	21:41:30	1	1	f	\N	3	\N	Retirado	f	\N	t
23	2026-05-24	402	2	58	\N	403	403	17:14:49	21:41:33	1	1	f	\N	3	\N	Retirado	f	\N	t
22	2026-05-24	186	1	27	\N	187	187	17:12:43	21:41:37	1	1	f	\N	3	\N	Retirado	f	\N	t
21	2026-05-24	401	2	57	\N	400	400	17:10:47	21:41:40	1	1	f	\N	3	\N	Retirado	f	\N	t
20	2026-05-24	399	3	83	\N	400	400	17:10:31	21:41:44	1	1	f	\N	3	\N	Retirado	f	\N	t
19	2026-05-24	198	1	26	\N	199	199	17:08:18	21:41:48	1	1	f	\N	3	\N	Retirado	f	\N	t
16	2026-05-24	207	2	56	\N	98	98	17:07:29	21:41:52	1	1	f	\N	3	\N	Retirado	f	\N	t
15	2026-05-24	97	1	25	\N	98	98	17:07:12	21:41:56	1	1	f	\N	3	\N	Retirado	f	\N	t
14	2026-05-24	279	1	24	\N	98	98	17:06:57	21:42:00	1	1	f	\N	3	\N	Retirado	f	\N	t
13	2026-05-24	308	2	53	\N	309	309	17:04:08	21:42:04	1	1	f	\N	3	\N	Retirado	f	\N	t
11	2026-05-24	258	1	21	\N	112	112	17:03:12	21:42:07	1	1	f	\N	3	\N	Retirado	f	\N	t
10	2026-05-24	323	3	82	\N	324	324	17:00:48	21:42:10	1	1	f	\N	3	\N	Retirado	f	\N	t
9	2026-05-24	334	2	52	\N	335	335	17:00:22	21:42:14	1	1	f	\N	3	\N	Retirado	f	\N	t
8	2026-05-24	397	1	20	\N	398	398	16:59:12	21:42:19	1	1	f	\N	3	\N	Retirado	f	\N	t
7	2026-05-24	133	2	51	\N	134	134	16:55:36	21:42:22	1	1	f	\N	3	\N	Retirado	f	\N	t
6	2026-05-24	256	2	50	\N	140	140	16:55:05	21:42:26	1	1	f	\N	3	\N	Retirado	f	\N	t
5	2026-05-24	73	3	81	\N	74	74	16:54:44	21:42:31	1	1	f	\N	3	\N	Retirado	f	\N	t
4	2026-05-24	119	1	18	\N	120	120	16:54:11	21:42:35	1	1	f	\N	3	\N	Retirado	f	\N	t
2	2026-05-24	99	3	3	\N	100	100	16:47:24	21:42:38	1	1	f	\N	3	\N	Retirado	f	\N	t
1	2026-05-24	242	3	2	\N	100	100	16:47:09	21:42:43	1	1	f	\N	3	\N	Retirado	f	\N	t
128	2026-06-07	552	1	18	\N	553	553	16:30:51	19:03:12	1	1	f	\N	3	\N	Retirado	f	\N	t
151	2026-06-07	107	3	85	\N	108	108	17:09:03	19:05:14	1	1	f	\N	3	\N	Retirado	f	\N	t
150	2026-06-07	135	1	27	\N	136	136	17:08:21	19:06:23	1	1	f	\N	3	\N	Retirado	f	\N	t
153	2026-06-07	111	2	59	\N	112	112	17:10:26	19:06:39	1	1	f	\N	3	\N	Retirado	f	\N	t
155	2026-06-07	129	2	61	\N	130	130	17:11:22	19:06:55	1	1	f	\N	3	\N	Retirado	f	\N	t
145	2026-06-07	557	1	25	\N	558	558	17:02:40	19:08:44	1	1	f	\N	3	\N	Retirado	f	\N	t
135	2026-06-07	275	2	51	\N	276	276	16:46:37	19:09:49	1	1	f	\N	3	\N	Retirado	f	\N	t
147	2026-06-07	561	2	57	\N	560	560	17:06:58	19:15:37	1	1	f	\N	3	\N	Retirado	f	\N	t
146	2026-06-07	559	2	56	\N	560	560	17:05:28	19:15:40	1	1	f	\N	3	\N	Retirado	f	\N	t
142	2026-06-07	205	1	21	\N	206	206	16:58:55	19:15:44	1	1	f	\N	3	\N	Retirado	f	\N	t
130	2026-06-07	9	3	3	\N	10	10	16:34:42	19:16:00	1	1	f	\N	3	\N	Retirado	f	\N	t
129	2026-06-07	554	3	2	\N	553	553	16:33:59	19:16:03	1	1	f	\N	3	\N	Retirado	f	\N	t
90	2026-05-31	220	3	90	\N	221	221	17:33:24	19:03:02	1	1	f	\N	3	\N	Retirado	f	\N	t
112	2026-05-31	474	3	86	\N	475	475	18:46:58	19:03:14	1	1	f	\N	3	\N	Retirado	f	\N	t
84	2026-05-31	322	2	60	\N	177	177	17:10:30	19:04:13	1	1	f	\N	3	\N	Retirado	f	\N	t
85	2026-05-31	176	1	22	\N	177	177	17:10:48	19:04:23	1	1	f	\N	3	\N	Retirado	f	\N	t
92	2026-05-31	457	1	28	\N	458	458	17:36:55	19:10:35	1	1	f	\N	3	\N	Retirado	f	\N	t
110	2026-05-31	453	2	64	\N	454	454	18:43:43	19:10:47	1	1	f	\N	3	\N	Retirado	f	\N	t
88	2026-05-31	172	3	87	\N	173	173	17:28:10	19:21:06	1	1	f	\N	3	\N	Retirado	f	\N	t
91	2026-05-31	166	1	27	\N	167	167	17:34:21	19:21:28	1	1	f	\N	3	\N	Retirado	f	\N	t
100	2026-05-31	79	2	69	\N	80	80	17:48:01	19:21:40	1	1	f	\N	3	\N	Retirado	f	\N	t
102	2026-05-31	340	3	92	\N	341	341	17:53:11	19:22:21	1	1	f	\N	3	\N	Retirado	f	\N	t
99	2026-05-31	461	3	89	\N	462	462	17:46:49	19:26:39	1	1	f	\N	3	\N	Retirado	f	\N	t
111	2026-05-31	463	2	65	\N	464	464	18:44:28	19:26:50	1	1	f	\N	3	\N	Retirado	f	\N	t
109	2026-05-31	473	2	63	\N	468	468	18:37:54	19:27:08	1	1	f	\N	3	\N	Retirado	f	\N	t
108	2026-05-31	471	2	62	\N	472	472	18:11:07	19:29:46	1	1	f	\N	3	\N	Retirado	f	\N	t
107	2026-05-31	470	1	24	\N	466	466	18:09:15	19:29:55	1	1	f	\N	3	\N	Retirado	f	\N	t
101	2026-05-31	465	2	61	\N	466	466	17:51:30	19:30:24	1	1	f	\N	3	\N	Retirado	f	\N	t
105	2026-05-31	272	2	70	\N	233	233	18:05:48	19:30:57	1	1	f	\N	3	\N	Retirado	f	\N	t
106	2026-05-31	232	2	71	\N	233	233	18:06:09	19:31:03	1	1	f	\N	3	\N	Retirado	f	\N	t
96	2026-05-31	381	2	68	\N	382	382	17:41:09	19:31:07	1	1	f	\N	3	\N	Retirado	f	\N	t
97	2026-05-31	388	1	25	\N	389	389	17:41:54	19:32:38	1	1	f	\N	3	\N	Retirado	f	\N	t
77	2026-05-31	212	1	19	\N	213	213	17:04:02	19:32:59	1	1	f	\N	3	\N	Retirado	f	\N	t
103	2026-05-31	467	3	93	\N	468	468	17:59:55	19:33:45	1	1	f	\N	3	\N	Retirado	f	\N	t
95	2026-05-31	337	1	29	\N	338	338	17:38:42	19:33:48	1	1	f	\N	3	\N	Retirado	f	\N	t
89	2026-05-31	455	3	88	\N	456	456	17:30:38	19:33:57	1	1	f	\N	3	\N	Retirado	f	\N	t
157	2026-06-07	257	1	29	\N	253	253	17:12:35	18:57:25	1	1	f	\N	3	\N	Retirado	f	\N	t
156	2026-06-07	252	3	86	\N	253	253	17:12:06	18:57:36	1	1	t	\N	3	\N	Retirado	f	\N	t
208	2026-06-14	208	1	24	\N	209	209	17:07:10	19:19:05	1	1	f	\N	3	\N	Retirado	f	\N	t
201	2026-06-14	580	3	3	\N	581	581	17:03:59	19:19:58	1	1	f	\N	3	\N	Retirado	f	\N	t
198	2026-06-14	178	3	2	\N	179	179	16:58:27	19:20:01	1	1	f	\N	3	\N	Retirado	f	\N	t
134	2026-06-07	555	2	50	\N	556	556	16:45:36	18:18:17	1	1	f	\N	3	\N	Retirado	f	\N	t
143	2026-06-07	238	1	22	\N	239	239	16:59:41	19:02:27	1	1	f	\N	3	\N	Retirado	f	\N	t
175	2026-06-07	564	2	69	\N	565	565	17:26:18	19:06:45	1	1	f	\N	3	\N	Retirado	f	\N	t
181	2026-06-07	566	2	74	\N	567	567	17:37:08	19:07:23	1	1	f	\N	3	\N	Retirado	f	\N	t
179	2026-06-07	562	1	36	\N	563	563	17:30:00	19:08:25	1	1	f	\N	3	\N	Retirado	f	\N	t
185	2026-06-07	318	1	37	\N	84	84	17:50:29	19:08:33	1	1	f	\N	3	\N	Retirado	f	\N	t
186	2026-06-07	569	1	38	\N	570	570	17:52:11	19:08:54	1	1	f	\N	3	\N	Retirado	f	\N	t
138	2026-06-07	370	2	53	\N	371	371	16:51:22	19:10:16	1	1	f	\N	3	\N	Retirado	f	\N	t
194	2026-06-07	576	1	44	\N	577	577	18:33:53	19:12:30	1	1	f	\N	3	\N	Retirado	f	\N	t
192	2026-06-07	575	1	42	\N	574	574	18:00:00	19:12:34	1	1	t	\N	3	\N	Retirado	f	\N	t
191	2026-06-07	223	1	41	\N	224	224	17:56:40	19:14:56	1	1	f	\N	3	\N	Retirado	f	\N	t
189	2026-06-07	571	1	40	\N	572	572	17:55:22	19:15:02	1	1	f	\N	3	\N	Retirado	f	\N	t
601	2026-07-01	862	3	82	\N	863	863	00:23:38	02:12:05	1	832	f	\N	1	\N	Retirado	f	\N	f
613	2026-07-01	816	2	232	\N	817	817	00:55:42	02:23:52	832	1	f	\N	1	\N	Retirado	f	\N	f
200	2026-06-14	198	1	20	\N	199	199	17:01:37	19:19:12	1	1	f	\N	3	\N	Retirado	f	\N	f
207	2026-06-14	234	3	82	\N	235	235	17:06:48	19:16:55	1	1	f	\N	3	\N	Retirado	f	\N	t
369	2026-06-21	772	3	95	\N	773	773	17:49:30	22:42:51	1	1	f	\N	3	\N	Retirado	f	\N	t
354	2026-06-21	292	1	30	\N	293	293	17:14:44	22:42:54	491	775	f	\N	3	\N	Retirado	f	\N	t
352	2026-06-21	760	2	58	\N	761	761	17:12:14	22:43:04	1	775	f	\N	3	\N	Retirado	f	\N	t
344	2026-06-21	756	3	89	\N	755	755	17:04:01	22:43:49	1	775	f	\N	3	\N	Retirado	f	\N	t
364	2026-06-21	768	1	32	\N	769	769	17:39:48	22:43:49	1	1	f	\N	3	\N	Retirado	f	\N	t
343	2026-06-21	164	3	88	\N	165	165	17:03:12	22:43:54	491	775	f	\N	3	\N	Retirado	f	\N	t
342	2026-06-21	754	1	27	\N	755	755	17:01:53	22:43:59	1	775	f	\N	3	\N	Retirado	f	\N	t
363	2026-06-21	766	2	65	\N	767	767	17:34:07	22:44:01	1	1	f	\N	3	\N	Retirado	f	\N	t
337	2026-06-21	227	3	85	\N	752	153	16:58:38	22:44:28	1	775	f	\N	3	\N	Retirado	f	\N	t
336	2026-06-21	115	1	22	\N	116	116	16:58:36	22:44:33	491	775	f	\N	3	\N	Retirado	f	\N	t
335	2026-06-21	255	3	84	\N	116	116	16:58:09	22:44:37	491	775	f	\N	3	\N	Retirado	f	\N	t
321	2026-06-21	573	1	19	\N	574	574	16:30:19	22:45:52	491	775	f	\N	3	\N	Retirado	f	\N	t
602	2026-07-01	195	2	228	\N	568	568	00:29:58	02:18:30	1	1	f	\N	1	\N	Retirado	f	\N	f
614	2026-07-01	370	2	51	\N	371	371	01:18:24	02:21:35	832	1	f	\N	1	\N	Retirado	f	\N	f
250	2026-06-14	207	2	50	\N	98	\N	23:48:33	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
227	2026-06-14	210	3	88	\N	211	211	17:22:52	19:15:59	1	1	f	\N	3	\N	Retirado	f	\N	f
209	2026-06-14	256	2	56	\N	140	140	17:07:37	19:17:43	1	1	f	\N	3	\N	Retirado	f	\N	f
247	2026-06-14	279	1	39	\N	98	98	18:41:34	19:19:46	1	1	f	\N	3	\N	Retirado	f	\N	f
372	2026-06-21	272	2	69	\N	233	233	17:55:00	22:42:28	491	1	f	\N	3	\N	Retirado	f	\N	f
358	2026-06-21	190	2	61	\N	191	191	17:21:33	22:42:32	491	775	f	\N	3	\N	Retirado	f	\N	f
357	2026-06-21	334	2	60	\N	335	335	17:20:26	22:42:36	1	775	f	\N	3	\N	Retirado	f	\N	f
370	2026-06-21	220	3	96	\N	221	221	17:51:30	22:42:39	491	1	f	\N	3	\N	Retirado	f	\N	f
355	2026-06-21	225	3	93	\N	226	226	17:16:41	22:42:47	491	775	f	\N	3	\N	Retirado	f	\N	f
353	2026-06-21	195	2	59	\N	568	568	17:13:03	22:42:59	491	775	f	\N	3	\N	Retirado	f	\N	f
367	2026-06-21	305	2	67	\N	306	306	17:45:19	22:43:09	491	1	f	\N	3	\N	Retirado	f	\N	f
351	2026-06-21	282	1	29	\N	283	283	17:11:32	22:43:10	491	775	f	\N	3	\N	Retirado	f	\N	f
366	2026-06-21	266	2	66	\N	267	267	17:43:24	22:43:17	491	1	f	\N	3	\N	Retirado	f	\N	f
350	2026-06-21	210	3	92	\N	211	211	17:10:54	22:43:18	491	775	f	\N	3	\N	Retirado	f	\N	f
365	2026-06-21	337	1	33	\N	338	338	17:41:27	22:43:26	491	1	f	\N	3	\N	Retirado	f	\N	f
348	2026-06-21	296	2	57	\N	267	267	17:10:12	22:43:29	491	775	f	\N	3	\N	Retirado	f	\N	f
347	2026-06-21	364	3	91	\N	68	68	17:07:37	22:43:34	1	775	f	\N	3	\N	Retirado	f	\N	f
346	2026-06-21	9	3	90	\N	10	10	17:05:05	22:43:39	1	775	f	\N	3	\N	Retirado	f	\N	f
340	2026-06-21	252	3	87	\N	253	253	17:00:11	22:44:09	1	775	f	\N	3	\N	Retirado	f	\N	f
362	2026-06-21	448	3	94	\N	765	449	17:32:15	22:44:15	491	1	f	\N	3	\N	Retirado	f	\N	f
339	2026-06-21	257	1	26	\N	253	253	16:59:47	22:44:18	1	775	f	\N	3	\N	Retirado	f	\N	f
338	2026-06-21	152	3	86	\N	753	153	16:59:11	22:44:23	1	775	f	\N	3	\N	Retirado	f	\N	f
360	2026-06-21	584	2	63	\N	585	585	17:23:43	22:44:35	491	1	f	\N	3	\N	Retirado	f	\N	f
333	2026-06-21	133	2	53	\N	134	134	16:55:53	22:44:52	491	775	f	\N	3	\N	Retirado	f	\N	f
332	2026-06-21	363	1	25	\N	112	112	16:55:12	22:44:58	491	775	f	\N	3	\N	Retirado	f	\N	f
331	2026-06-21	77	1	24	\N	78	78	16:54:43	22:45:03	1	775	f	\N	3	\N	Retirado	f	\N	f
330	2026-06-21	222	3	82	\N	78	78	16:54:17	22:45:08	1	775	f	\N	3	\N	Retirado	f	\N	f
329	2026-06-21	566	2	52	\N	751	567	16:54:16	22:45:12	491	775	f	\N	3	\N	Retirado	f	\N	f
327	2026-06-21	207	2	51	\N	98	98	16:47:59	22:45:21	491	775	f	\N	3	\N	Retirado	f	\N	f
326	2026-06-21	279	1	21	\N	98	98	16:47:51	22:45:26	1	775	f	\N	3	\N	Retirado	f	\N	f
325	2026-06-21	172	3	81	\N	173	173	16:44:15	22:45:31	491	775	f	\N	3	\N	Retirado	f	\N	f
324	2026-06-21	302	2	50	\N	303	303	16:43:44	22:45:36	491	775	f	\N	3	\N	Retirado	f	\N	f
322	2026-06-21	242	3	2	\N	100	100	16:41:11	22:45:47	491	775	f	\N	3	\N	Retirado	f	\N	f
320	2026-06-21	575	1	18	\N	574	574	16:29:44	22:45:57	491	775	f	\N	3	\N	Retirado	f	\N	f
253	2026-06-14	370	2	51	\N	371	\N	23:51:47	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
254	2026-06-14	264	1	20	\N	588	\N	23:53:00	\N	1	\N	t	\N	4	\N	Presente	f	\N	t
379	2026-06-21	774	2	74	\N	773	773	18:21:37	22:41:23	491	1	f	\N	3	\N	Retirado	t	No quiso quedarse con los pequeños	t
440	2026-06-24	97	1	18	\N	98	98	00:21:27	02:33:22	1	828	f	\N	1	\N	Retirado	f	\N	f
376	2026-06-21	95	1	36	\N	96	96	17:57:58	22:41:40	1	1	f	\N	3	\N	Retirado	f	\N	t
375	2026-06-21	316	2	71	\N	96	96	17:57:31	22:41:46	491	1	f	\N	3	\N	Retirado	f	\N	t
380	2026-06-21	119	1	37	\N	469	469	18:22:27	22:39:11	491	1	f	\N	3	\N	Retirado	f	\N	f
378	2026-06-21	304	2	73	\N	175	175	18:04:29	22:41:29	491	1	f	\N	3	\N	Retirado	f	\N	f
377	2026-06-21	174	2	72	\N	175	175	18:04:10	22:41:35	491	1	f	\N	3	\N	Retirado	f	\N	f
374	2026-06-21	411	1	35	\N	412	412	17:56:27	22:41:53	491	1	t	\N	3	\N	Retirado	f	\N	f
373	2026-06-21	232	2	70	\N	233	233	17:55:15	22:42:19	1	1	f	\N	3	\N	Retirado	f	\N	f
356	2026-06-21	328	1	31	\N	226	226	17:17:07	22:42:42	491	775	f	\N	3	\N	Retirado	f	\N	f
341	2026-06-21	256	2	54	\N	140	140	17:00:13	22:44:04	491	775	f	\N	3	\N	Retirado	f	\N	f
361	2026-06-21	275	2	64	\N	764	276	17:30:21	22:44:27	491	1	f	\N	3	\N	Retirado	f	\N	f
334	2026-06-21	247	3	83	\N	248	248	16:56:32	22:44:44	1	775	f	\N	3	\N	Retirado	f	\N	f
328	2026-06-21	97	1	20	\N	98	98	16:48:24	22:45:16	491	775	f	\N	3	\N	Retirado	f	\N	f
323	2026-06-21	99	3	3	\N	100	100	16:41:41	22:45:41	491	775	f	\N	3	\N	Retirado	f	\N	f
359	2026-06-21	762	2	62	\N	763	763	17:23:14	22:42:26	1	775	f	\N	3	\N	Retirado	f	\N	t
368	2026-06-21	770	2	68	\N	771	771	17:46:18	22:43:01	1	1	f	\N	3	\N	Retirado	f	\N	t
349	2026-06-21	758	1	28	\N	759	759	17:10:29	22:43:23	1	775	f	\N	3	\N	Retirado	f	\N	t
603	2026-07-01	247	3	278	\N	248	248	00:33:14	02:21:57	1	1	f	\N	1	\N	Retirado	f	\N	f
615	2026-07-01	361	1	206	\N	362	362	01:21:43	02:25:23	832	407	f	\N	1	\N	Retirado	f	\N	f
449	2026-06-24	234	3	82	\N	235	235	00:36:54	02:24:24	828	1	f	\N	1	\N	Retirado	f	\N	f
446	2026-06-24	816	2	53	\N	817	817	00:35:24	02:25:24	828	832	f	\N	1	\N	Retirado	f	\N	f
388	2026-06-21	208	1	22	\N	788	788	23:01:45	23:06:41	775	1	f	\N	4	\N	Retirado	f	\N	f
385	2026-06-21	264	1	21	\N	784	265	22:54:49	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
386	2026-06-21	172	3	83	\N	785	173	22:57:31	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
387	2026-06-21	109	2	51	\N	623	110	23:00:44	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
389	2026-06-21	234	3	90	\N	789	235	23:02:27	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
392	2026-06-21	317	3	91	\N	792	260	23:05:18	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
393	2026-06-21	259	3	2	\N	793	260	23:06:22	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
394	2026-06-21	195	2	54	\N	794	196	23:07:04	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
395	2026-06-21	457	1	22	\N	797	458	23:11:01	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
397	2026-06-21	308	2	56	\N	798	309	23:11:54	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
407	2026-06-21	605	3	82	\N	604	604	23:35:06	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
408	2026-06-21	603	2	61	\N	604	604	23:35:52	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
410	2026-06-21	364	3	84	\N	68	68	23:37:42	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
412	2026-06-21	9	3	85	\N	10	10	23:38:16	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
413	2026-06-21	608	1	30	\N	609	609	23:39:46	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
416	2026-06-21	610	3	87	\N	611	611	23:45:28	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
417	2026-06-21	105	1	31	\N	106	106	23:46:16	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
418	2026-06-21	571	1	32	\N	572	572	23:47:47	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
420	2026-06-21	347	1	33	\N	348	348	23:57:56	23:59:59	775	\N	f	\N	4	\N	Retirado	f	\N	f
255	2026-06-14	218	1	21	\N	219	\N	23:56:57	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
452	2026-06-24	197	3	84	\N	138	138	00:38:18	02:15:23	828	1	f	\N	1	\N	Retirado	f	\N	t
604	2026-07-01	934	3	282	\N	935	935	00:34:34	02:21:49	832	1	f	\N	1	\N	Retirado	f	\N	t
616	2026-07-01	360	1	207	\N	215	215	01:41:19	02:23:53	832	407	f	\N	1	\N	Retirado	f	\N	f
439	2026-06-24	133	2	51	\N	134	134	00:20:57	02:22:14	1	1	f	\N	1	\N	Retirado	f	\N	f
450	2026-06-24	808	3	83	\N	805	805	00:37:21	02:22:50	828	1	f	\N	1	\N	Retirado	f	\N	f
455	2026-06-24	299	2	57	\N	219	219	00:53:47	02:23:08	1	832	f	\N	1	\N	Retirado	f	\N	f
453	2026-06-24	225	3	85	\N	226	226	00:48:12	02:23:13	1	1	f	\N	1	\N	Retirado	f	\N	f
456	2026-06-24	218	1	22	\N	219	219	00:54:03	02:24:25	1	828	f	\N	1	\N	Retirado	f	\N	f
454	2026-06-24	328	1	21	\N	226	226	00:53:43	02:24:55	828	828	f	\N	1	\N	Retirado	f	\N	f
459	2026-06-24	370	2	59	\N	371	371	01:04:23	02:25:09	828	832	f	\N	1	\N	Retirado	f	\N	f
445	2026-06-24	397	1	20	\N	398	398	00:29:53	02:25:36	828	828	f	\N	1	\N	Retirado	f	\N	f
458	2026-06-24	406	2	58	\N	407	407	01:02:02	02:26:17	1	832	f	\N	1	\N	Retirado	f	\N	f
461	2026-06-24	804	2	51	\N	831	805	02:27:38	02:27:47	1	1	f	\N	1	\N	Retirado	f	\N	f
438	2026-06-24	207	2	50	\N	98	98	00:20:25	02:35:46	1	1	f	\N	1	\N	Retirado	f	\N	f
460	2026-06-24	772	3	86	\N	773	773	01:05:45	20:40:55	828	1	f	\N	1	\N	Retirado	f	\N	f
471	2026-06-28	378	2	231	\N	377	377	13:57:15	16:01:33	1	1	f	\N	2	\N	Retirado	f	\N	f
470	2026-06-28	376	3	81	\N	377	377	13:56:42	16:12:19	1	838	f	\N	2	\N	Retirado	f	\N	f
484	2026-06-28	453	2	57	\N	454	454	14:34:03	16:12:30	1	1	f	\N	2	\N	Retirado	f	\N	f
473	2026-06-28	566	2	232	\N	751	751	14:00:34	16:13:35	839	1	f	\N	2	\N	Retirado	f	\N	f
472	2026-06-28	808	3	279	\N	846	805	13:57:37	16:14:35	839	838	f	\N	2	\N	Retirado	f	\N	f
480	2026-06-28	326	3	83	\N	327	807	14:13:44	16:15:39	1	1	f	\N	2	\N	Retirado	f	\N	f
466	2026-06-28	207	2	50	\N	98	98	13:49:34	16:16:15	1	1	f	\N	2	\N	Retirado	f	\N	f
467	2026-06-28	97	1	202	\N	98	98	13:49:52	16:16:29	1	839	f	\N	2	\N	Retirado	f	\N	f
468	2026-06-28	279	1	18	\N	98	98	13:50:11	16:16:35	1	839	f	\N	2	\N	Retirado	f	\N	f
522	2026-06-28	402	2	54	\N	403	403	17:17:49	18:51:06	491	1	f	\N	3	\N	Retirado	f	\N	f
504	2026-06-28	222	3	282	\N	78	78	17:05:56	18:59:34	1	1	f	\N	3	\N	Retirado	f	\N	f
514	2026-06-28	406	2	232	\N	407	407	17:09:29	19:00:38	491	491	f	\N	3	\N	Retirado	f	\N	f
513	2026-06-28	257	1	217	\N	253	253	17:08:53	19:07:15	491	1	f	\N	3	\N	Retirado	f	\N	f
525	2026-06-28	457	1	23	\N	885	885	17:19:59	19:11:54	1	1	f	\N	3	\N	Retirado	f	\N	f
498	2026-06-28	355	2	227	\N	452	452	17:02:06	19:12:19	1	491	f	\N	3	\N	Retirado	f	\N	f
492	2026-06-28	242	3	14	\N	100	100	16:45:34	19:12:41	1	491	f	\N	3	\N	Retirado	f	\N	f
493	2026-06-28	182	1	202	\N	872	872	16:54:31	19:12:44	1	1	f	\N	3	\N	Retirado	f	\N	f
501	2026-06-28	198	1	206	\N	199	199	17:05:11	19:12:55	1	1	f	\N	3	\N	Retirado	f	\N	f
491	2026-06-28	99	3	278	\N	100	100	16:45:33	19:12:57	491	491	f	\N	3	\N	Retirado	f	\N	f
505	2026-06-28	795	1	20	\N	796	796	17:06:12	19:13:06	491	1	f	\N	3	\N	Retirado	f	\N	f
520	2026-06-28	225	3	88	\N	226	226	17:16:09	19:13:25	491	491	f	\N	3	\N	Retirado	f	\N	f
503	2026-06-28	772	3	82	\N	773	773	17:05:37	19:13:55	1	491	f	\N	3	\N	Retirado	f	\N	f
500	2026-06-28	397	1	19	\N	398	398	17:04:42	19:14:43	1	1	f	\N	3	\N	Retirado	f	\N	f
523	2026-06-28	273	2	56	\N	274	274	17:18:25	19:14:52	491	491	f	\N	3	\N	Retirado	f	\N	f
508	2026-06-28	152	3	84	\N	753	153	17:06:59	19:14:57	1	491	f	\N	3	\N	Retirado	f	\N	f
507	2026-06-28	227	3	83	\N	752	153	17:06:36	19:15:10	1	491	f	\N	3	\N	Retirado	f	\N	f
524	2026-06-28	760	2	57	\N	761	761	17:19:17	19:15:12	491	491	f	\N	3	\N	Retirado	f	\N	f
510	2026-06-28	190	2	231	\N	880	191	17:07:32	19:15:36	1	491	f	\N	3	\N	Retirado	f	\N	f
494	2026-06-28	286	2	226	\N	183	183	16:54:52	19:16:17	491	491	f	\N	3	\N	Retirado	f	\N	f
509	2026-06-28	799	2	228	\N	800	800	17:07:00	19:17:15	491	491	f	\N	3	\N	Retirado	f	\N	f
516	2026-06-28	195	2	51	\N	794	794	17:12:40	19:20:24	491	491	f	\N	3	\N	Retirado	f	\N	f
517	2026-06-28	154	2	52	\N	155	155	17:14:25	20:43:24	1	1	f	\N	2	\N	Retirado	f	\N	f
256	2026-06-14	299	2	52	\N	219	\N	23:57:12	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
261	2026-06-14	406	2	56	\N	407	\N	00:02:45	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
263	2026-06-14	325	2	57	\N	597	\N	00:10:08	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
264	2026-06-14	308	2	58	\N	309	\N	00:15:55	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
271	2026-06-14	571	1	27	\N	572	\N	00:36:31	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
511	2026-06-28	252	3	85	\N	253	253	17:08:00	00:07:32	491	1	t	\N	3	\N	Retirado	f	\N	f
544	2026-06-28	411	1	28	\N	412	412	17:52:00	00:11:44	491	1	t	\N	3	\N	Retirado	f	\N	f
257	2026-06-14	590	3	2	\N	219	\N	23:59:46	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
258	2026-06-14	591	2	53	\N	219	\N	00:00:00	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
259	2026-06-14	592	1	22	\N	219	\N	00:00:54	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
260	2026-06-14	593	2	54	\N	594	\N	00:02:26	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
262	2026-06-14	595	1	24	\N	596	\N	00:06:22	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
265	2026-06-14	598	2	59	\N	599	\N	00:25:30	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
506	2026-06-28	77	1	21	\N	78	78	17:06:17	18:59:49	1	1	f	\N	3	\N	Retirado	f	\N	f
537	2026-06-28	119	1	25	\N	469	469	17:35:59	19:01:05	1	1	f	\N	3	\N	Retirado	f	\N	f
531	2026-06-28	186	1	24	\N	187	187	17:29:02	19:04:43	491	1	f	\N	3	\N	Retirado	f	\N	f
528	2026-06-28	308	2	59	\N	886	798	17:26:48	19:09:27	1	491	f	\N	3	\N	Retirado	f	\N	f
533	2026-06-28	448	3	91	\N	449	449	17:30:15	19:12:03	491	491	f	\N	3	\N	Retirado	f	\N	f
545	2026-06-28	358	1	29	\N	889	359	17:55:12	19:12:19	491	1	f	\N	3	\N	Retirado	f	\N	f
497	2026-06-28	178	3	279	\N	179	179	17:00:17	19:12:24	491	491	f	\N	3	\N	Retirado	f	\N	f
546	2026-06-28	97	1	30	\N	98	98	18:11:05	19:12:32	1	1	f	\N	3	\N	Retirado	f	\N	f
532	2026-06-28	381	2	62	\N	382	382	17:29:59	19:12:42	1	491	f	\N	3	\N	Retirado	f	\N	f
527	2026-06-28	325	2	58	\N	597	281	17:26:04	19:13:06	491	491	f	\N	3	\N	Retirado	f	\N	f
529	2026-06-28	275	2	60	\N	276	276	17:26:49	19:13:20	491	491	f	\N	3	\N	Retirado	f	\N	f
540	2026-06-28	337	1	26	\N	338	338	17:43:24	19:13:45	1	1	f	\N	3	\N	Retirado	f	\N	f
550	2026-06-28	573	1	33	\N	574	574	18:20:09	19:14:08	1	1	f	\N	3	\N	Retirado	f	\N	f
521	2026-06-28	328	1	219	\N	226	226	17:17:24	19:14:17	491	1	f	\N	3	\N	Retirado	f	\N	f
539	2026-06-28	268	2	64	\N	269	269	17:42:28	19:14:36	491	491	f	\N	3	\N	Retirado	f	\N	f
518	2026-06-28	301	1	22	\N	155	155	17:15:17	19:14:57	1	1	f	\N	3	\N	Retirado	f	\N	f
512	2026-06-28	172	3	86	\N	173	173	17:08:13	19:16:11	1	491	f	\N	3	\N	Retirado	f	\N	f
530	2026-06-28	334	2	61	\N	335	335	17:28:08	19:16:45	491	491	f	\N	3	\N	Retirado	f	\N	f
538	2026-06-28	361	1	222	\N	362	362	17:41:52	19:17:00	491	1	f	\N	3	\N	Retirado	f	\N	f
536	2026-06-28	9	3	92	\N	10	10	17:35:27	19:17:08	68	491	f	\N	3	\N	Retirado	f	\N	f
535	2026-06-28	364	3	294	\N	68	68	17:34:36	19:17:16	68	491	f	\N	3	\N	Retirado	f	\N	f
543	2026-06-28	304	2	66	\N	175	175	17:51:31	19:18:34	491	491	f	\N	3	\N	Retirado	f	\N	f
542	2026-06-28	174	2	65	\N	175	175	17:50:24	19:18:48	491	491	f	\N	3	\N	Retirado	f	\N	f
549	2026-06-28	575	1	32	\N	574	574	18:19:49	19:18:55	1	1	f	\N	3	\N	Retirado	f	\N	f
548	2026-06-28	207	2	67	\N	98	98	18:11:53	19:39:14	1	1	f	\N	3	\N	Retirado	f	\N	f
547	2026-06-28	279	1	31	\N	98	98	18:11:32	19:39:35	1	1	f	\N	3	\N	Retirado	f	\N	f
515	2026-06-28	202	3	87	\N	155	155	17:12:36	20:43:17	1	1	f	\N	2	\N	Retirado	f	\N	f
266	2026-06-14	600	1	25	\N	601	\N	00:26:41	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
267	2026-06-14	602	2	60	\N	601	\N	00:27:28	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
268	2026-06-14	603	2	61	\N	604	\N	00:30:29	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
269	2026-06-14	605	3	81	\N	604	\N	00:31:41	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
270	2026-06-14	606	1	26	\N	607	\N	00:33:20	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
272	2026-06-14	459	1	28	\N	460	\N	00:42:54	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
534	2026-06-28	887	2	63	\N	888	888	17:34:09	19:06:21	68	491	f	\N	3	\N	Retirado	f	\N	t
541	2026-06-28	214	1	27	\N	215	215	17:49:40	19:09:15	491	1	f	\N	3	\N	Retirado	f	\N	t
553	2026-06-28	236	3	14	\N	890	237	22:41:52	02:25:51	1	491	f	\N	4	\N	Retirado	t	Está en transición	t
593	2026-07-01	99	3	14	\N	100	100	00:02:11	02:22:51	1	1	f	\N	1	\N	Retirado	f	\N	f
617	2026-07-01	214	1	20	\N	215	215	01:41:46	02:24:11	832	407	f	\N	1	\N	Retirado	f	\N	f
605	2026-07-01	218	1	18	\N	219	219	00:36:06	02:24:39	1	407	f	\N	1	\N	Retirado	f	\N	f
568	2026-06-28	186	1	217	\N	187	187	23:19:28	02:21:37	827	1	f	\N	4	\N	Retirado	f	\N	f
567	2026-06-28	347	1	22	\N	348	348	23:19:26	02:22:48	1	491	f	\N	4	\N	Retirado	f	\N	f
551	2026-06-28	299	2	226	\N	219	219	22:39:33	02:25:42	1	491	f	\N	4	\N	Retirado	f	\N	f
552	2026-06-28	218	1	202	\N	219	219	22:39:58	02:25:46	1	491	f	\N	4	\N	Retirado	f	\N	f
554	2026-06-28	592	1	18	\N	219	219	22:47:34	02:25:55	1	491	f	\N	4	\N	Retirado	f	\N	f
555	2026-06-28	591	2	50	\N	219	219	22:47:54	02:26:00	1	491	f	\N	4	\N	Retirado	f	\N	f
556	2026-06-28	590	3	278	\N	219	219	22:48:11	02:26:05	1	491	f	\N	4	\N	Retirado	f	\N	f
557	2026-06-28	820	3	279	\N	821	821	22:50:46	02:26:09	827	491	f	\N	4	\N	Retirado	f	\N	f
558	2026-06-28	207	2	227	\N	98	98	22:53:13	02:26:14	1	491	f	\N	4	\N	Retirado	f	\N	f
559	2026-06-28	97	1	19	\N	98	98	22:53:28	02:26:18	1	491	f	\N	4	\N	Retirado	f	\N	f
274	2026-06-14	186	1	30	\N	187	\N	00:53:40	\N	1	\N	f	\N	4	\N	Presente	f	\N	f
421	2026-06-21	299	2	64	\N	219	219	06:01:21	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	f
422	2026-06-21	218	1	34	\N	219	219	06:01:45	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	f
423	2026-06-21	592	1	35	\N	219	219	06:02:06	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	f
424	2026-06-21	591	2	52	\N	219	219	06:02:27	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	f
425	2026-06-21	590	3	88	\N	219	219	06:02:45	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	f
426	2026-06-21	624	3	89	\N	625	625	06:03:44	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	f
577	2026-06-28	780	2	53	\N	781	781	23:48:00	00:00:00	827	\N	f	\N	4	\N	Retirado	f	\N	f
576	2026-06-28	778	1	24	\N	902	902	23:47:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
600	2026-07-01	808	3	81	\N	846	846	00:23:13	02:20:21	1	1	f	\N	1	\N	Retirado	f	\N	f
573	2026-06-28	374	3	282	\N	375	375	23:31:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
572	2026-06-28	305	2	51	\N	306	306	23:30:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
571	2026-06-28	561	2	232	\N	560	560	23:22:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
570	2026-06-28	559	2	231	\N	560	560	23:22:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
612	2026-07-01	197	3	87	\N	138	138	00:44:40	02:20:50	1	1	f	\N	1	\N	Retirado	f	\N	f
566	2026-06-28	323	3	82	\N	324	324	23:11:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
606	2026-07-01	299	2	231	\N	219	219	00:37:14	02:21:12	832	1	f	\N	1	\N	Retirado	f	\N	f
564	2026-06-28	595	1	21	\N	596	596	23:03:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
595	2026-07-01	144	3	279	\N	145	145	00:06:13	02:22:29	1	1	f	\N	1	\N	Retirado	f	\N	f
562	2026-06-28	264	1	20	\N	784	588	23:02:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
561	2026-06-28	608	1	207	\N	609	609	23:01:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
560	2026-06-28	279	1	206	\N	98	98	22:53:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	f
133	2026-06-07	99	3	83	\N	100	100	16:41:05	19:06:07	1	1	f	\N	3	\N	Retirado	f	\N	f
63	2026-05-31	364	3	2	\N	68	68	16:32:10	19:25:31	1	1	f	\N	3	\N	Retirado	f	\N	f
82	2026-05-31	286	2	59	\N	183	183	17:09:55	19:31:20	1	1	f	\N	3	\N	Retirado	f	\N	f
72	2026-05-31	133	2	53	\N	134	134	16:59:44	19:31:40	1	1	f	\N	3	\N	Retirado	f	\N	f
76	2026-05-31	69	2	56	\N	70	70	17:03:40	19:31:46	1	1	f	\N	3	\N	Retirado	f	\N	f
66	2026-05-31	242	3	81	\N	100	100	16:47:22	19:33:37	1	1	f	\N	3	\N	Retirado	f	\N	f
67	2026-05-31	99	3	82	\N	100	100	16:48:00	19:33:40	1	1	f	\N	3	\N	Retirado	f	\N	f
273	2026-06-14	608	1	29	\N	609	\N	00:49:29	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
275	2026-06-14	347	1	31	\N	348	\N	00:54:03	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
276	2026-06-14	374	3	82	\N	375	\N	00:54:44	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
277	2026-06-14	305	2	62	\N	306	\N	00:54:59	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
278	2026-06-14	610	3	83	\N	611	\N	00:59:36	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
281	2026-06-14	624	3	84	\N	625	\N	01:20:14	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
282	2026-06-14	109	2	63	\N	110	\N	01:21:29	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
283	2026-06-14	105	1	33	\N	106	\N	01:24:00	\N	1	\N	f	\N	4	\N	Presente	f	\N	t
427	2026-06-21	820	3	92	\N	821	821	06:11:25	01:00:00	775	\N	f	\N	4	\N	Retirado	f	\N	t
578	2026-06-28	903	2	54	\N	904	904	23:59:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	t
575	2026-06-28	900	1	23	\N	901	901	23:35:00	00:00:00	827	\N	t	\N	4	\N	Retirado	f	\N	t
574	2026-06-28	899	2	52	\N	375	375	23:32:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	t
569	2026-06-28	898	1	219	\N	187	187	23:22:00	00:00:00	827	\N	f	\N	4	\N	Retirado	f	\N	t
565	2026-06-28	893	3	81	\N	894	894	23:05:00	00:00:00	1	\N	f	\N	4	\N	Retirado	f	\N	t
563	2026-06-28	891	2	228	\N	892	892	23:02:00	00:00:00	827	\N	f	\N	4	\N	Retirado	f	\N	t
469	2026-06-28	844	1	19	\N	845	845	13:56:00	21:12:57	1	839	f	\N	2	\N	Retirado	f	\N	t
57	2026-05-24	247	3	92	\N	248	248	18:22:00	19:00:00	1	1	f	\N	3	\N	Retirado	f	\N	t
607	2026-07-01	936	3	83	\N	937	937	00:41:32	02:12:25	1	832	f	\N	1	\N	Retirado	f	\N	t
596	2026-07-01	406	2	226	\N	407	407	00:18:33	02:18:08	1	1	f	\N	1	\N	Retirado	f	\N	f
599	2026-07-01	804	2	227	\N	805	805	00:22:13	02:20:38	832	1	f	\N	1	\N	Retirado	f	\N	f
611	2026-07-01	772	3	86	\N	938	938	00:43:43	02:22:17	1	1	f	\N	1	\N	Retirado	f	\N	f
608	2026-07-01	236	3	84	\N	237	237	00:42:03	02:26:55	1	1	f	\N	1	\N	Retirado	t	A solicitud de los padres	f
173	2026-06-07	280	3	90	\N	281	281	17:24:03	19:05:05	1	1	f	\N	3	\N	Retirado	f	\N	f
168	2026-06-07	210	3	88	\N	211	211	17:19:04	19:05:33	1	1	f	\N	3	\N	Retirado	f	\N	f
141	2026-06-07	302	2	54	\N	303	303	16:57:47	19:05:44	1	1	f	\N	3	\N	Retirado	f	\N	f
140	2026-06-07	166	1	20	\N	167	167	16:54:26	19:05:51	1	1	f	\N	3	\N	Retirado	f	\N	f
132	2026-06-07	242	3	82	\N	100	100	16:40:30	19:06:14	1	1	f	\N	3	\N	Retirado	f	\N	f
154	2026-06-07	258	2	60	\N	112	112	17:10:50	19:06:32	1	1	f	\N	3	\N	Retirado	f	\N	f
159	2026-06-07	286	2	62	\N	183	183	17:13:52	19:07:30	1	1	f	\N	3	\N	Retirado	f	\N	f
160	2026-06-07	296	2	63	\N	267	267	17:14:50	19:07:38	1	1	f	\N	3	\N	Retirado	f	\N	f
161	2026-06-07	266	2	64	\N	267	267	17:15:13	19:07:45	1	1	f	\N	3	\N	Retirado	f	\N	f
172	2026-06-07	448	3	89	\N	449	449	17:20:55	19:07:59	1	1	f	\N	3	\N	Retirado	f	\N	f
171	2026-06-07	450	2	67	\N	451	451	17:20:25	19:15:19	1	1	f	\N	3	\N	Retirado	f	\N	f
167	2026-06-07	176	1	33	\N	177	177	17:18:22	19:15:22	1	1	f	\N	3	\N	Retirado	f	\N	f
166	2026-06-07	322	2	66	\N	177	177	17:17:28	19:15:25	1	1	f	\N	3	\N	Retirado	f	\N	f
165	2026-06-07	282	1	32	\N	283	283	17:17:02	19:15:28	1	1	t	\N	3	\N	Retirado	f	\N	f
163	2026-06-07	225	3	87	\N	226	226	17:16:03	19:15:31	1	1	f	\N	3	\N	Retirado	f	\N	f
139	2026-06-07	180	1	19	\N	181	181	16:53:20	19:15:49	1	1	f	\N	3	\N	Retirado	f	\N	f
137	2026-06-07	323	3	84	\N	324	324	16:50:37	19:15:52	1	1	f	\N	3	\N	Retirado	f	\N	f
136	2026-06-07	69	2	52	\N	70	70	16:47:34	19:15:55	1	1	f	\N	3	\N	Retirado	f	\N	f
219	2026-06-14	355	2	59	\N	452	452	17:15:10	19:18:54	1	1	f	\N	3	\N	Retirado	f	\N	f
87	2026-05-31	266	2	67	\N	267	267	17:27:00	19:02:49	1	1	f	\N	3	\N	Retirado	f	\N	f
597	2026-07-01	133	2	50	\N	134	134	00:19:50	02:21:25	1	1	f	\N	1	\N	Retirado	f	\N	f
609	2026-07-01	225	3	85	\N	226	226	00:42:19	02:23:20	1	1	f	\N	1	\N	Retirado	f	\N	f
104	2026-05-31	119	1	31	\N	469	120	18:03:21	19:05:00	1	1	f	\N	3	\N	Retirado	f	\N	f
98	2026-05-31	411	1	30	\N	412	412	17:45:35	19:08:19	1	1	f	\N	3	\N	Retirado	f	\N	f
74	2026-05-31	404	2	54	\N	405	405	17:01:32	19:22:05	1	1	f	\N	3	\N	Retirado	f	\N	f
78	2026-05-31	225	3	85	\N	226	226	17:05:15	19:26:18	1	1	f	\N	3	\N	Retirado	f	\N	f
86	2026-05-31	296	2	66	\N	267	267	17:26:38	19:31:24	1	1	f	\N	3	\N	Retirado	f	\N	f
79	2026-05-31	328	1	20	\N	226	226	17:05:00	19:32:50	1	1	f	\N	3	\N	Retirado	f	\N	f
83	2026-05-31	182	1	21	\N	183	183	17:10:13	19:32:54	1	1	f	\N	3	\N	Retirado	f	\N	f
94	2026-05-31	317	3	94	\N	260	260	17:38:07	19:33:51	1	1	f	\N	3	\N	Retirado	f	\N	f
93	2026-05-31	259	3	91	\N	260	260	17:37:25	19:33:54	1	1	f	\N	3	\N	Retirado	f	\N	f
164	2026-06-07	404	2	65	\N	405	405	17:16:30	18:45:46	1	1	f	\N	3	\N	Retirado	f	\N	f
152	2026-06-07	363	1	28	\N	112	112	17:09:55	18:49:50	1	1	f	\N	3	\N	Retirado	f	\N	f
170	2026-06-07	212	1	35	\N	213	213	17:19:59	19:00:43	1	1	f	\N	3	\N	Retirado	f	\N	f
158	2026-06-07	182	1	30	\N	183	183	17:13:06	19:01:43	1	1	f	\N	3	\N	Retirado	f	\N	f
144	2026-06-07	216	1	24	\N	217	217	17:00:40	19:01:54	1	1	f	\N	3	\N	Retirado	f	\N	f
148	2026-06-07	198	1	26	\N	199	199	17:07:32	19:02:03	1	1	f	\N	3	\N	Retirado	f	\N	f
228	2026-06-14	266	2	64	\N	267	267	17:23:19	19:18:42	1	1	f	\N	3	\N	Retirado	f	\N	f
229	2026-06-14	296	2	65	\N	267	267	17:23:47	19:18:48	1	1	f	\N	3	\N	Retirado	f	\N	f
231	2026-06-14	328	1	31	\N	226	226	17:25:23	19:19:18	1	1	f	\N	3	\N	Retirado	f	\N	f
245	2026-06-14	97	1	37	\N	98	98	18:17:55	19:19:30	1	1	f	\N	3	\N	Retirado	f	\N	f
243	2026-06-14	207	2	72	\N	98	98	18:00:19	19:19:38	1	1	f	\N	3	\N	Retirado	f	\N	f
206	2026-06-14	356	1	22	\N	357	357	17:06:25	19:19:55	1	1	f	\N	3	\N	Retirado	f	\N	f
174	2026-06-07	325	2	68	\N	281	281	17:24:24	19:04:52	1	1	f	\N	3	\N	Retirado	f	\N	f
169	2026-06-07	186	1	34	\N	187	187	17:19:31	18:59:59	1	1	f	\N	3	\N	Retirado	f	\N	f
188	2026-06-07	411	1	39	\N	412	412	17:53:05	19:01:28	1	1	f	\N	3	\N	Retirado	f	\N	f
178	2026-06-07	287	2	72	\N	288	288	17:30:05	19:05:24	1	1	f	\N	3	\N	Retirado	f	\N	f
149	2026-06-07	256	2	58	\N	140	140	17:07:59	19:07:04	1	1	f	\N	3	\N	Retirado	f	\N	f
193	2026-06-07	119	1	43	\N	469	120	18:19:13	19:09:07	1	1	f	\N	3	\N	Retirado	f	\N	f
183	2026-06-07	406	2	76	\N	407	407	17:46:38	19:09:20	1	1	f	\N	3	\N	Retirado	f	\N	f
184	2026-06-07	195	2	77	\N	568	568	17:47:47	19:09:34	1	1	f	\N	3	\N	Retirado	f	\N	f
187	2026-06-07	308	2	78	\N	309	309	17:52:40	19:09:42	1	1	f	\N	3	\N	Retirado	f	\N	f
190	2026-06-07	355	2	79	\N	452	452	17:55:54	19:14:59	1	1	f	\N	3	\N	Retirado	f	\N	f
182	2026-06-07	247	3	91	\N	248	248	17:46:03	19:15:05	1	1	f	\N	3	\N	Retirado	f	\N	f
180	2026-06-07	381	2	73	\N	382	382	17:31:17	19:15:09	1	1	f	\N	3	\N	Retirado	f	\N	f
177	2026-06-07	232	2	71	\N	233	233	17:29:38	19:15:13	1	1	f	\N	3	\N	Retirado	f	\N	f
176	2026-06-07	272	2	70	\N	233	233	17:29:18	19:15:16	1	1	f	\N	3	\N	Retirado	f	\N	f
162	2026-06-07	328	1	31	\N	226	226	17:15:40	19:15:34	1	1	f	\N	3	\N	Retirado	f	\N	f
131	2026-06-07	364	3	81	\N	68	68	16:35:27	19:15:58	1	1	f	\N	3	\N	Retirado	f	\N	f
222	2026-06-14	402	2	61	\N	403	403	17:17:36	18:51:54	1	1	f	\N	3	\N	Retirado	f	\N	f
240	2026-06-14	247	3	90	\N	248	248	17:47:33	18:57:21	1	1	f	\N	3	\N	Retirado	f	\N	f
195	2026-06-14	575	1	18	\N	574	574	16:36:02	18:57:52	1	1	t	\N	3	\N	Retirado	f	\N	f
241	2026-06-14	411	1	35	\N	412	412	17:54:33	19:02:07	1	1	f	\N	3	\N	Retirado	f	\N	f
211	2026-06-14	257	1	26	\N	253	253	17:08:23	19:04:29	1	1	f	\N	3	\N	Retirado	f	\N	f
212	2026-06-14	252	3	83	\N	253	253	17:08:00	19:04:45	1	1	t	\N	3	\N	Retirado	f	\N	f
204	2026-06-14	111	2	53	\N	112	112	17:05:31	19:05:11	1	1	f	\N	3	\N	Retirado	f	\N	f
234	2026-06-14	325	2	66	\N	281	281	17:27:12	19:14:08	1	1	f	\N	3	\N	Retirado	f	\N	f
235	2026-06-14	275	2	67	\N	276	276	17:27:39	19:14:16	1	1	f	\N	3	\N	Retirado	f	\N	f
216	2026-06-14	317	3	85	\N	260	260	17:10:56	19:14:27	1	1	f	\N	3	\N	Retirado	f	\N	f
197	2026-06-14	302	2	51	\N	303	303	16:57:43	19:15:05	1	1	f	\N	3	\N	Retirado	f	\N	f
210	2026-06-14	216	1	25	\N	217	217	17:07:56	19:15:17	1	1	f	\N	3	\N	Retirado	f	\N	f
246	2026-06-14	119	1	38	\N	469	469	18:28:12	19:15:31	1	1	f	\N	3	\N	Retirado	f	\N	f
223	2026-06-14	202	3	87	\N	155	155	17:18:08	19:15:52	1	1	f	\N	3	\N	Retirado	f	\N	f
230	2026-06-14	225	3	89	\N	226	226	17:24:17	19:16:16	1	1	f	\N	3	\N	Retirado	f	\N	f
213	2026-06-14	133	2	57	\N	134	134	17:09:08	19:16:28	1	1	f	\N	3	\N	Retirado	f	\N	f
221	2026-06-14	182	1	28	\N	183	183	17:16:57	19:16:37	1	1	f	\N	3	\N	Retirado	f	\N	f
220	2026-06-14	286	2	60	\N	183	183	17:16:15	19:16:46	1	1	f	\N	3	\N	Retirado	f	\N	f
232	2026-06-14	212	1	32	\N	213	213	17:26:02	19:17:23	1	1	f	\N	3	\N	Retirado	f	\N	f
233	2026-06-14	186	1	33	\N	187	187	17:26:43	19:17:32	1	1	f	\N	3	\N	Retirado	f	\N	f
224	2026-06-14	180	1	29	\N	181	181	17:18:44	19:17:38	1	1	f	\N	3	\N	Retirado	f	\N	f
214	2026-06-14	397	1	27	\N	398	398	17:09:32	19:18:06	1	1	f	\N	3	\N	Retirado	f	\N	f
196	2026-06-14	370	2	50	\N	371	371	16:51:19	19:18:17	1	1	f	\N	3	\N	Retirado	f	\N	f
226	2026-06-14	176	1	30	\N	177	177	17:19:40	18:59:44	1	1	f	\N	3	\N	Retirado	f	\N	f
225	2026-06-14	322	2	62	\N	177	177	17:19:10	18:59:52	1	1	f	\N	3	\N	Retirado	f	\N	f
205	2026-06-14	258	2	54	\N	112	112	17:06:00	19:05:19	1	1	f	\N	3	\N	Retirado	f	\N	f
239	2026-06-14	337	1	34	\N	338	338	17:37:44	19:14:54	1	1	f	\N	3	\N	Retirado	f	\N	f
215	2026-06-14	222	3	84	\N	78	78	17:10:03	19:04:57	1	1	f	\N	3	\N	Retirado	f	\N	t
248	2026-06-14	584	2	63	\N	585	585	18:53:22	18:53:37	1	1	f	\N	3	\N	Retirado	f	\N	t
202	2026-06-14	77	1	21	\N	78	78	17:04:25	19:05:42	1	1	f	\N	3	\N	Retirado	f	\N	t
203	2026-06-14	152	3	81	\N	153	153	17:05:02	19:09:51	1	1	f	\N	3	\N	Retirado	f	\N	t
237	2026-06-14	586	2	69	\N	587	587	17:31:08	19:12:23	1	1	f	\N	3	\N	Retirado	f	\N	t
236	2026-06-14	277	2	68	\N	278	278	17:28:05	19:12:32	1	1	f	\N	3	\N	Retirado	f	\N	t
238	2026-06-14	190	2	70	\N	191	191	17:31:37	19:13:53	1	1	f	\N	3	\N	Retirado	f	\N	t
217	2026-06-14	113	3	86	\N	114	114	17:11:26	19:14:36	1	1	f	\N	3	\N	Retirado	f	\N	t
199	2026-06-14	578	1	19	\N	579	579	17:00:58	19:16:09	1	1	f	\N	3	\N	Retirado	f	\N	t
242	2026-06-14	383	2	71	\N	384	384	17:59:07	19:17:13	1	1	f	\N	3	\N	Retirado	f	\N	t
244	2026-06-14	264	1	36	\N	265	265	18:12:36	19:17:53	1	1	f	\N	3	\N	Retirado	f	\N	t
218	2026-06-14	582	2	58	\N	583	583	17:13:52	19:13:07	1	1	f	\N	3	\N	Retirado	f	\N	t
610	2026-07-01	328	1	19	\N	226	226	00:42:38	02:22:16	1	407	f	\N	1	\N	Retirado	f	\N	f
598	2026-07-01	198	1	202	\N	933	933	00:21:55	02:22:36	1	407	f	\N	1	\N	Retirado	f	\N	f
\.


--
-- Data for Name: circulos_amistad; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.circulos_amistad (id_circulo, nombre, descripcion, activo, creado_en) FROM stdin;
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.eventos (id_evento, nombre, descripcion, fecha, id_turno, tipo, activo) FROM stdin;
\.


--
-- Data for Name: fichas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fichas (id_ficha, codigo_ficha, estado, id_grupo, tipo) FROM stdin;
18	A-2	Activa	1	Entrada
19	A-3	Activa	1	Entrada
20	A-6	Activa	1	Entrada
21	A-7	Activa	1	Entrada
22	A-9	Activa	1	Entrada
24	A-12	Activa	1	Entrada
25	A-13	Activa	1	Entrada
26	A-15	Activa	1	Entrada
27	A-16	Activa	1	Entrada
28	A-17	Activa	1	Entrada
29	A-18	Activa	1	Entrada
30	A-19	Activa	1	Entrada
31	A-20	Activa	1	Entrada
32	A-21	Activa	1	Entrada
33	A-22	Activa	1	Entrada
34	A-24	Activa	1	Entrada
35	A-25	Activa	1	Entrada
36	A-27	Activa	1	Entrada
37	A-28	Activa	1	Entrada
38	A-29	Activa	1	Entrada
39	A-30	Activa	1	Entrada
40	A-31	Activa	1	Entrada
41	A-32	Activa	1	Entrada
42	A-33	Activa	1	Entrada
43	A-34	Activa	1	Entrada
44	A-35	Activa	1	Entrada
45	A-36	Activa	1	Entrada
46	A-37	Activa	1	Entrada
47	A-38	Activa	1	Entrada
48	A-39	Activa	1	Entrada
49	A-41	Activa	1	Entrada
50	B-2	Activa	2	Entrada
51	B-7	Activa	2	Entrada
52	B-8	Activa	2	Entrada
54	B-10	Activa	2	Entrada
53	B-9	Activa	2	Entrada
56	B-11	Activa	2	Entrada
57	B-12	Activa	2	Entrada
58	B-13	Activa	2	Entrada
59	B-14	Activa	2	Entrada
60	B-15	Activa	2	Entrada
61	B-16	Activa	2	Entrada
62	B-17	Activa	2	Entrada
63	B-18	Activa	2	Entrada
64	B-19	Activa	2	Entrada
65	B-20	Activa	2	Entrada
66	B-21	Activa	2	Entrada
67	B-22	Activa	2	Entrada
68	B-23	Activa	2	Entrada
69	B-24	Activa	2	Entrada
70	B-25	Activa	2	Entrada
71	B-26	Activa	2	Entrada
72	B-27	Activa	2	Entrada
73	B-28	Activa	2	Entrada
74	B-29	Activa	2	Entrada
75	B-30	Activa	2	Entrada
76	B-31	Activa	2	Entrada
77	B-32	Activa	2	Entrada
78	B-33	Activa	2	Entrada
79	B-34	Activa	2	Entrada
80	B-35	Activa	2	Entrada
81	C-4	Activa	3	Entrada
82	C-5	Activa	3	Entrada
83	C-7	Activa	3	Entrada
84	C-8	Activa	3	Entrada
85	C-9	Activa	3	Entrada
86	C-10	Activa	3	Entrada
87	C-11	Activa	3	Entrada
88	C-12	Activa	3	Entrada
89	C-13	Activa	3	Entrada
90	C-14	Activa	3	Entrada
91	C-15	Activa	3	Entrada
92	C-17	Activa	3	Entrada
93	C-18	Activa	3	Entrada
94	C-19	Activa	3	Entrada
95	C-20	Activa	3	Entrada
96	C-21	Activa	3	Entrada
97	C-22	Activa	3	Entrada
98	C-23	Activa	3	Entrada
99	C-24	Activa	3	Entrada
100	C-25	Activa	3	Entrada
101	C-26	Activa	3	Entrada
103	C-27	Activa	3	Entrada
105	C-28	Activa	3	Entrada
106	C-29	Activa	3	Entrada
107	C-30	Activa	3	Entrada
108	C-31	Activa	3	Entrada
109	C-32	Activa	3	Entrada
110	C-33	Activa	3	Entrada
2	C-02	Extraviada	3	Entrada
202	A-1	Activa	1	Entrada
3	C-03	Extraviada	3	Entrada
23	A-11	Activa	1	Entrada
206	A-4	Activa	1	Entrada
207	A-5	Activa	1	Entrada
309	A-42	Activa	1	Entrada
217	A-8	Activa	1	Entrada
219	A-10	Activa	1	Entrada
227	B-3	Activa	2	Entrada
222	A-14	Activa	1	Entrada
223	A-23	Activa	1	Entrada
224	A-26	Activa	1	Entrada
225	A-40	Activa	1	Entrada
226	B-1	Activa	2	Entrada
232	B-6	Activa	2	Entrada
318	C-34	Activa	3	Entrada
319	C-35	Activa	3	Entrada
228	B-4	Activa	2	Entrada
231	B-5	Activa	2	Entrada
14	C-1	Activa	3	Entrada
320	C-36	Activa	3	Entrada
321	C-37	Activa	3	Entrada
322	C-38	Activa	3	Entrada
323	C-39	Activa	3	Entrada
324	C-40	Activa	3	Entrada
325	C-41	Activa	3	Entrada
326	C-42	Activa	3	Entrada
268	B-36	Activa	2	Entrada
269	B-37	Activa	2	Entrada
271	B-38	Activa	2	Entrada
272	B-39	Activa	2	Entrada
273	B-40	Activa	2	Entrada
274	B-41	Activa	2	Entrada
275	B-42	Activa	2	Entrada
278	C-2	Activa	3	Entrada
279	C-3	Activa	3	Entrada
282	C-6	Activa	3	Entrada
315	B-03	Extraviada	2	Entrada
294	C-16	Activa	3	Entrada
\.


--
-- Data for Name: grupos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grupos (id_grupo, nombre, edad_minima, edad_maxima, activo) FROM stdin;
2	7-9 años	7	9	t
3	10-12 años	10	12	t
1	4-6 años	0	6	t
\.


--
-- Data for Name: info_medica_ninos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.info_medica_ninos (id_info, id_nino, tipo, descripcion, severidad, instrucciones) FROM stdin;
\.


--
-- Data for Name: ninos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ninos (id_persona, observaciones_generales, activo, version) FROM stdin;
69	\N	t	1
73	\N	t	1
75	\N	t	1
77	\N	t	1
79	\N	t	1
81	\N	t	1
83	\N	t	1
85	\N	t	1
87	\N	t	1
89	\N	t	1
91	\N	t	1
93	\N	t	1
95	\N	t	1
97	\N	t	1
101	\N	t	1
103	\N	t	1
105	\N	t	1
107	\N	t	1
109	\N	t	1
111	\N	t	1
113	\N	t	1
115	\N	t	1
117	\N	t	1
119	\N	t	1
121	\N	t	1
123	\N	t	1
125	\N	t	1
127	\N	t	1
129	\N	t	1
131	\N	t	1
133	\N	t	1
135	\N	t	1
137	\N	t	1
139	\N	t	1
141	\N	t	1
143	\N	t	1
144	\N	t	1
146	\N	t	1
148	\N	t	1
150	\N	t	1
152	\N	t	1
154	\N	t	1
156	\N	t	1
158	\N	t	1
160	\N	t	1
162	\N	t	1
164	\N	t	1
166	\N	t	1
168	\N	t	1
170	\N	t	1
172	\N	t	1
174	\N	t	1
176	\N	t	1
178	\N	t	1
180	\N	t	1
182	\N	t	1
184	\N	t	1
186	\N	t	1
188	\N	t	1
190	\N	t	1
192	\N	t	1
194	\N	t	1
195	\N	t	1
197	\N	t	1
198	\N	t	1
200	\N	t	1
202	\N	t	1
203	\N	t	1
205	\N	t	1
207	\N	t	1
208	\N	t	1
210	\N	t	1
212	\N	t	1
214	\N	t	1
216	\N	t	1
220	\N	t	1
223	\N	t	1
225	\N	t	1
227	\N	t	1
228	\N	t	1
230	\N	t	1
232	\N	t	1
234	\N	t	1
236	\N	t	1
238	\N	t	1
240	\N	t	1
242	\N	t	1
243	\N	t	1
245	\N	t	1
247	\N	t	1
249	\N	t	1
250	\N	t	1
252	\N	t	1
254	\N	t	1
255	\N	t	1
256	\N	t	1
257	\N	t	1
259	\N	t	1
261	\N	t	1
263	\N	t	1
264	\N	t	1
266	\N	t	1
268	\N	t	1
270	\N	t	1
272	\N	t	1
273	\N	t	1
275	\N	t	1
277	\N	t	1
279	\N	t	1
280	\N	t	1
282	\N	t	1
284	\N	t	1
286	\N	t	1
287	\N	t	1
289	\N	t	1
290	\N	t	1
292	\N	t	1
294	\N	t	1
296	\N	t	1
297	\N	t	1
300	\N	t	1
301	\N	t	1
302	\N	t	1
304	\N	t	1
305	\N	t	1
307	\N	t	1
308	\N	t	1
310	\N	t	1
312	\N	t	1
314	\N	t	1
316	\N	t	1
317	\N	t	1
318	\N	t	1
319	\N	t	1
320	\N	t	1
322	\N	t	1
323	\N	t	1
325	\N	t	1
326	\N	t	1
328	\N	t	1
329	\N	t	1
330	\N	t	1
332	\N	t	1
334	\N	t	1
336	\N	t	1
337	\N	t	1
339	\N	t	1
340	\N	t	1
342	\N	t	1
343	\N	t	1
345	\N	t	1
347	\N	t	1
349	\N	t	1
351	\N	t	1
353	\N	t	1
355	\N	t	1
356	\N	t	1
358	\N	t	1
360	\N	t	1
361	\N	t	1
363	\N	t	1
364	\N	t	1
365	\N	t	1
367	\N	t	1
368	\N	t	1
370	\N	t	1
372	\N	t	1
374	\N	t	1
379	\N	t	1
381	\N	t	1
383	\N	t	1
385	\N	t	1
386	\N	t	1
388	\N	t	1
397	\N	t	1
399	\N	t	1
401	\N	t	1
402	\N	t	1
404	\N	t	1
99	\N	t	1
406	\N	t	1
408	\N	t	1
258	\N	t	1
410	\N	t	1
446	\N	t	1
448	\N	t	1
411	\N	t	1
450	\N	t	1
453	\N	t	1
455	\N	t	1
457	\N	t	1
459	\N	t	1
461	\N	t	1
463	\N	t	1
465	\N	t	1
467	\N	t	1
470	\N	t	1
471	\N	t	1
473	\N	t	1
474	\N	t	1
552	\N	t	1
554	alergia mariscos	t	1
555	\N	t	1
557	\N	t	1
559	\N	t	1
561	\N	t	1
564	\N	t	1
562	\N	t	1
566	\N	t	1
569	\N	t	1
571	\N	t	1
576	\N	t	1
578	\N	t	1
580	\N	t	1
582	\N	t	1
584	\N	t	1
586	\N	t	1
573	\N	t	1
9	\N	t	1
575	\N	t	1
299	\N	t	2
218	\N	t	2
378	\N	t	2
222	\N	t	1
589	\N	t	1
591	\N	t	1
592	\N	t	1
593	\N	t	1
595	\N	t	1
598	\N	t	1
600	\N	t	1
602	\N	t	1
603	\N	t	1
605	\N	t	1
606	\N	t	1
608	\N	t	1
610	\N	t	1
612	\N	t	1
590	\N	t	1
624	\N	t	1
754	\N	t	1
756	\N	t	1
758	\N	t	1
760	\N	t	1
762	\N	t	1
766	\N	t	1
768	\N	t	1
770	\N	t	1
772	\N	t	1
774	\N	t	1
776	\N	t	1
780	Alergia a leche y derivados y Asma	t	1
786	Sinusitis	t	1
795	\N	t	1
799	\N	t	1
802	\N	t	1
804	Renitis Alergica	t	1
806	\N	t	1
808	Ranitis Alergica	t	1
811	\N	t	1
813	\N	t	1
814	\N	t	1
816	\N	t	1
818	\N	t	1
820	\N	t	1
782	\N	t	1
829	\N	t	1
833	\N	t	1
840	\N	t	1
842	\N	t	1
844	\N	t	1
376	\N	t	2
847	\N	t	2
849	\N	t	1
851	\N	t	1
853	\N	t	1
854	\N	t	1
856	\N	t	2
858	\N	t	1
860	\N	t	1
862	\N	t	1
864	\N	t	1
866	\N	t	1
868	\N	t	1
870	\N	t	2
873	Piquete	t	1
875	\N	t	1
876	\N	t	1
883	\N	t	1
887	\N	t	1
891	\N	t	1
893	\N	t	1
895	Asma	t	1
898	\N	t	1
899	\N	t	1
900	Autista	t	1
778	Alergia a los lacteos, huevo, chocolate	t	2
903	\N	t	1
881	\N	t	2
878	ninguna	t	2
934	\N	t	1
936	\N	t	1
\.


--
-- Data for Name: ninos_expedientes_conducta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ninos_expedientes_conducta (id_expediente, id_nino, fecha, id_turno, id_evento, tipo, descripcion, id_reportado_por, resuelto, notas_resolucion, creado_en) FROM stdin;
\.


--
-- Data for Name: ninos_grupos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ninos_grupos (id_nino, id_grupo, es_excepcion, motivo_excepcion, fecha_asignacion, activo) FROM stdin;
69	2	f	\N	2026-05-24	t
73	3	f	\N	2026-05-24	t
75	1	f	\N	2026-05-24	t
77	1	f	\N	2026-05-24	t
79	2	f	\N	2026-05-24	t
81	2	f	\N	2026-05-24	t
83	1	f	\N	2026-05-24	t
85	1	f	\N	2026-05-24	t
87	2	f	\N	2026-05-24	t
89	1	f	\N	2026-05-24	t
91	3	f	\N	2026-05-24	t
93	2	f	\N	2026-05-24	t
95	1	f	\N	2026-05-24	t
97	1	f	\N	2026-05-24	t
101	2	f	\N	2026-05-24	t
103	1	f	\N	2026-05-24	t
105	1	f	\N	2026-05-24	t
107	3	f	\N	2026-05-24	t
109	2	f	\N	2026-05-24	t
111	2	f	\N	2026-05-24	t
113	3	f	\N	2026-05-24	t
115	1	f	\N	2026-05-24	t
117	1	f	\N	2026-05-24	t
119	1	f	\N	2026-05-24	t
121	2	f	\N	2026-05-24	t
123	2	f	\N	2026-05-24	t
125	3	f	\N	2026-05-24	t
127	1	f	\N	2026-05-24	t
129	2	f	\N	2026-05-24	t
131	2	f	\N	2026-05-24	t
133	2	f	\N	2026-05-24	t
135	1	f	\N	2026-05-24	t
137	2	f	\N	2026-05-24	t
139	2	f	\N	2026-05-24	t
141	2	f	\N	2026-05-24	t
143	2	f	\N	2026-05-24	t
144	3	f	\N	2026-05-24	t
146	3	f	\N	2026-05-24	t
148	2	f	\N	2026-05-24	t
150	3	f	\N	2026-05-24	t
152	3	f	\N	2026-05-24	t
154	2	f	\N	2026-05-24	t
156	3	f	\N	2026-05-24	t
158	1	f	\N	2026-05-24	t
160	1	f	\N	2026-05-24	t
162	1	f	\N	2026-05-24	t
164	3	f	\N	2026-05-24	t
166	1	f	\N	2026-05-24	t
168	3	f	\N	2026-05-24	t
170	2	f	\N	2026-05-24	t
172	3	f	\N	2026-05-24	t
174	2	f	\N	2026-05-24	t
176	1	f	\N	2026-05-24	t
178	3	f	\N	2026-05-24	t
180	1	f	\N	2026-05-24	t
182	1	f	\N	2026-05-24	t
184	1	f	\N	2026-05-24	t
186	1	f	\N	2026-05-24	t
188	1	f	\N	2026-05-24	t
190	2	f	\N	2026-05-24	t
192	3	f	\N	2026-05-24	t
194	2	f	\N	2026-05-24	t
195	2	f	\N	2026-05-24	t
197	3	f	\N	2026-05-24	t
198	1	f	\N	2026-05-24	t
200	3	f	\N	2026-05-24	t
202	3	f	\N	2026-05-24	t
203	1	f	\N	2026-05-24	t
205	1	f	\N	2026-05-24	t
207	2	f	\N	2026-05-24	t
208	1	f	\N	2026-05-24	t
210	3	f	\N	2026-05-24	t
212	1	f	\N	2026-05-24	t
214	1	f	\N	2026-05-24	t
216	1	f	\N	2026-05-24	t
220	3	f	\N	2026-05-24	t
223	1	f	\N	2026-05-24	t
225	3	f	\N	2026-05-24	t
227	3	f	\N	2026-05-24	t
228	2	f	\N	2026-05-24	t
230	3	f	\N	2026-05-24	t
232	2	f	\N	2026-05-24	t
234	3	f	\N	2026-05-24	t
236	3	f	\N	2026-05-24	t
238	1	f	\N	2026-05-24	t
240	2	f	\N	2026-05-24	t
242	3	f	\N	2026-05-24	t
243	1	f	\N	2026-05-24	t
245	3	f	\N	2026-05-24	t
247	3	f	\N	2026-05-24	t
249	3	f	\N	2026-05-24	t
250	2	f	\N	2026-05-24	t
252	3	f	\N	2026-05-24	t
254	3	f	\N	2026-05-24	t
255	3	f	\N	2026-05-24	t
256	2	f	\N	2026-05-24	t
257	1	f	\N	2026-05-24	t
259	3	f	\N	2026-05-24	t
261	1	f	\N	2026-05-24	t
263	2	f	\N	2026-05-24	t
264	1	f	\N	2026-05-24	t
266	2	f	\N	2026-05-24	t
268	2	f	\N	2026-05-24	t
270	3	f	\N	2026-05-24	t
272	2	f	\N	2026-05-24	t
273	2	f	\N	2026-05-24	t
275	2	f	\N	2026-05-24	t
277	2	f	\N	2026-05-24	t
279	1	f	\N	2026-05-24	t
280	3	f	\N	2026-05-24	t
282	1	f	\N	2026-05-24	t
284	1	f	\N	2026-05-24	t
286	2	f	\N	2026-05-24	t
287	2	f	\N	2026-05-24	t
289	3	f	\N	2026-05-24	t
290	1	f	\N	2026-05-24	t
292	1	f	\N	2026-05-24	t
294	2	f	\N	2026-05-24	t
296	2	f	\N	2026-05-24	t
297	3	f	\N	2026-05-24	t
300	2	f	\N	2026-05-24	t
301	1	f	\N	2026-05-24	t
302	2	f	\N	2026-05-24	t
304	2	f	\N	2026-05-24	t
305	2	f	\N	2026-05-24	t
307	2	f	\N	2026-05-24	t
308	2	f	\N	2026-05-24	t
310	3	f	\N	2026-05-24	t
312	1	f	\N	2026-05-24	t
314	3	f	\N	2026-05-24	t
316	2	f	\N	2026-05-24	t
317	3	f	\N	2026-05-24	t
318	1	f	\N	2026-05-24	t
319	1	f	\N	2026-05-24	t
320	3	f	\N	2026-05-24	t
322	2	f	\N	2026-05-24	t
323	3	f	\N	2026-05-24	t
325	2	f	\N	2026-05-24	t
326	3	f	\N	2026-05-24	t
328	1	f	\N	2026-05-24	t
329	2	f	\N	2026-05-24	t
330	1	f	\N	2026-05-24	t
332	1	f	\N	2026-05-24	t
334	2	f	\N	2026-05-24	t
336	2	f	\N	2026-05-24	t
337	1	f	\N	2026-05-24	t
339	3	f	\N	2026-05-24	t
340	3	f	\N	2026-05-24	t
342	3	f	\N	2026-05-24	t
343	1	f	\N	2026-05-24	t
345	3	f	\N	2026-05-24	t
347	1	f	\N	2026-05-24	t
299	2	f	\N	2026-05-24	t
218	1	f	\N	2026-05-24	t
349	1	f	\N	2026-05-24	t
351	2	f	\N	2026-05-24	t
353	1	f	\N	2026-05-24	t
355	2	f	\N	2026-05-24	t
356	1	f	\N	2026-05-24	t
358	1	f	\N	2026-05-24	t
360	1	f	\N	2026-05-24	t
361	1	f	\N	2026-05-24	t
363	1	f	\N	2026-05-24	t
364	3	f	\N	2026-05-24	t
365	2	f	\N	2026-05-24	t
367	1	f	\N	2026-05-24	t
368	2	f	\N	2026-05-24	t
370	2	f	\N	2026-05-24	t
372	2	f	\N	2026-05-24	t
374	3	f	\N	2026-05-24	t
99	3	f	\N	2026-05-24	t
258	2	f	\N	2026-05-24	t
222	3	f	\N	2026-05-24	t
379	3	f	\N	2026-05-24	t
381	2	f	\N	2026-05-24	t
383	2	f	\N	2026-05-24	t
385	2	f	\N	2026-05-24	t
386	1	f	\N	2026-05-24	t
388	1	f	\N	2026-05-24	t
397	1	f	\N	2026-05-24	t
399	3	f	\N	2026-05-24	t
401	2	f	\N	2026-05-24	t
402	2	f	\N	2026-05-24	t
404	2	f	\N	2026-05-24	t
406	2	f	\N	2026-05-24	t
408	1	f	\N	2026-05-24	t
411	1	f	\N	2026-05-24	t
410	2	f	\N	2026-05-24	t
446	2	f	\N	2026-05-31	t
448	3	f	\N	2026-05-31	t
450	2	f	\N	2026-05-31	t
453	2	f	\N	2026-05-31	t
455	3	f	\N	2026-05-31	t
457	1	f	\N	2026-05-31	t
459	1	f	\N	2026-05-31	t
461	3	f	\N	2026-05-31	t
463	2	f	\N	2026-05-31	t
465	2	f	\N	2026-05-31	t
467	3	f	\N	2026-05-31	t
470	1	f	\N	2026-05-31	t
471	2	f	\N	2026-05-31	t
473	3	t	Solicitud de la tia	2026-05-31	t
474	3	f	\N	2026-05-31	t
552	1	f	\N	2026-06-07	t
554	3	f	\N	2026-06-07	t
555	2	f	\N	2026-06-07	t
557	1	f	\N	2026-06-07	t
559	2	f	\N	2026-06-07	t
561	2	f	\N	2026-06-07	t
564	2	f	\N	2026-06-07	t
562	1	f	\N	2026-06-07	t
566	2	f	\N	2026-06-07	t
569	1	f	\N	2026-06-07	t
571	1	f	\N	2026-06-07	t
576	1	f	\N	2026-06-07	t
578	1	f	\N	2026-06-14	t
580	3	f	\N	2026-06-14	t
582	2	f	\N	2026-06-14	t
584	2	f	\N	2026-06-14	t
586	2	f	\N	2026-06-14	t
589	1	f	\N	2026-06-14	t
591	2	f	\N	2026-06-14	t
592	1	f	\N	2026-06-14	t
593	2	f	\N	2026-06-14	t
595	1	f	\N	2026-06-14	t
598	2	f	\N	2026-06-14	t
600	1	f	\N	2026-06-14	t
602	2	f	\N	2026-06-14	t
603	2	f	\N	2026-06-14	t
605	3	f	\N	2026-06-14	t
606	1	f	\N	2026-06-14	t
608	1	f	\N	2026-06-14	t
610	3	f	\N	2026-06-14	t
612	1	f	\N	2026-06-15	t
590	3	f	\N	2026-06-14	t
624	3	f	\N	2026-06-15	t
9	3	f	\N	2026-05-24	t
573	1	f	\N	2026-06-07	t
575	1	f	\N	2026-06-07	t
754	1	f	\N	2026-06-21	t
756	3	f	\N	2026-06-21	t
758	1	f	\N	2026-06-21	t
760	2	f	\N	2026-06-21	t
762	2	f	\N	2026-06-21	t
766	2	f	\N	2026-06-21	t
768	1	f	\N	2026-06-21	t
770	2	f	\N	2026-06-21	t
772	3	f	\N	2026-06-21	t
774	1	f	\N	2026-06-21	t
776	1	f	\N	2026-06-21	t
780	2	f	\N	2026-06-21	t
786	2	f	\N	2026-06-21	t
795	1	f	\N	2026-06-21	t
799	2	f	\N	2026-06-21	t
802	1	f	\N	2026-06-21	t
804	2	f	\N	2026-06-21	t
806	2	f	\N	2026-06-21	t
808	3	f	\N	2026-06-21	t
811	2	f	\N	2026-06-21	t
813	1	f	\N	2026-06-21	t
814	3	f	\N	2026-06-21	t
816	2	f	\N	2026-06-21	t
818	2	f	\N	2026-06-21	t
820	3	f	\N	2026-06-22	t
782	2	f	\N	2026-06-21	t
868	1	f	\N	2026-06-28	t
829	3	f	\N	2026-06-25	t
833	1	f	\N	2026-06-25	t
840	2	f	\N	2026-06-28	t
842	3	f	\N	2026-06-28	t
844	1	f	\N	2026-06-28	t
376	3	f	\N	2026-05-24	t
378	2	f	\N	2026-05-24	t
847	2	f	\N	2026-06-28	t
849	3	f	\N	2026-06-28	t
851	3	f	\N	2026-06-28	t
853	1	f	\N	2026-06-28	t
854	1	f	\N	2026-06-28	t
856	1	f	\N	2026-06-28	t
858	2	f	\N	2026-06-28	t
860	2	f	\N	2026-06-28	t
862	3	f	\N	2026-06-28	t
864	1	f	\N	2026-06-28	t
866	2	f	\N	2026-06-28	t
870	2	f	\N	2026-06-28	t
873	2	f	\N	2026-06-28	t
875	1	f	\N	2026-06-28	t
876	3	f	\N	2026-06-28	t
883	3	f	\N	2026-06-28	t
887	2	f	\N	2026-06-28	t
891	2	f	\N	2026-06-28	t
893	3	f	\N	2026-06-28	t
895	2	f	\N	2026-06-28	t
898	1	f	\N	2026-06-28	t
899	2	f	\N	2026-06-28	t
900	1	f	\N	2026-06-28	t
778	1	f	\N	2026-06-21	t
903	2	f	\N	2026-06-28	t
881	2	f	\N	2026-06-28	t
878	1	f	\N	2026-06-28	t
934	3	f	\N	2026-07-02	t
936	3	f	\N	2026-07-02	t
\.


--
-- Data for Name: personal_expedientes_evaluacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_expedientes_evaluacion (id_evaluacion, id_personal, fecha, tipo, descripcion, resultado, id_evaluador, notas, creado_en) FROM stdin;
\.


--
-- Data for Name: personal_grupos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_grupos (id_personal, id_grupo, fecha_asignacion, id_turno) FROM stdin;
897	1	2026-06-28	4
324	3	2026-06-28	4
\.


--
-- Data for Name: personal_historial_cambios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_historial_cambios (id_historial, id_personal, tabla_afectada, campo, valor_anterior, valor_nuevo, fecha_cambio, id_cambiado_por, creado_en) FROM stdin;
\.


--
-- Data for Name: personal_historial_lideres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_historial_lideres (id_historial, id_personal, id_lider_anterior, id_lider_nuevo, fecha_cambio, id_registrado_por, notas, creado_en) FROM stdin;
\.


--
-- Data for Name: personal_historial_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_historial_roles (id_historial, id_personal, id_rol_anterior, id_rol_nuevo, fecha_cambio, id_autorizado_por, notas) FROM stdin;
1	897	1	2	2026-06-28	1	\N
\.


--
-- Data for Name: personal_info_iglesia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_info_iglesia (id_persona, id_red, estado_liderazgo, id_mentor, circulo_amistad, tiempo_iglesia_meses, ministerio_adicional, estado_operativo, bautizado_agua, fecha_bautismo, fecha_bautismo_precision, id_circulo, circulo_amistad_desde, circulo_amistad_precision, clases_biblicas_ninos, clases_biblicas_detalle, capacitacion_ensenanza, capacitacion_detalle, observaciones_espirituales, id_lider, asistio_otra_iglesia, nombre_otra_iglesia, denominacion_otra_iglesia) FROM stdin;
491	1	Lider	\N	\N	32	\N	Lider	t	2016-01-01	Ano	\N	2023-01-01	Ano	f	\N	f	\N	\N	\N	f	\N	\N
826	1	Lider_Apoyo	\N	\N	33	\N	Lider	t	2016-01-01	Dia	\N	2022-12-10	Dia	f	\N	f	\N	\N	\N	f	\N	\N
827	2	Lider	\N	\N	168	\N	Lider	t	2013-09-28	Dia	\N	2016-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
832	3	Lider	\N	\N	108	\N	Lider	t	2017-01-01	Dia	\N	2017-01-01	Dia	f	\N	f	\N	\N	\N	t	Iglesia Maria Inmaculada	Católico
407	3	Lider	\N	\N	108	Ujieres 	Lider	t	2017-01-01	Dia	\N	2017-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
836	2	Lider	\N	\N	84	\N	Lider	t	2007-01-01	Dia	\N	2017-01-01	Dia	t	Iglesia Cristiana Josué 	f	\N	\N	\N	t	Iglesia Cristiana Josué 	Evangelico
821	2	Lider	\N	\N	72	\N	Lider	t	1999-01-01	Dia	\N	2020-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
837	2	Mentor	\N	\N	216	\N	Lider	t	2008-01-01	Dia	\N	2016-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
68	2	Lider	\N	\N	144	\N	Lider	t	2013-01-01	Dia	\N	2014-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
838	1	Lider	\N	\N	168	HTV	Lider	t	2017-12-09	Dia	\N	2016-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
839	2	Lider_Apoyo	\N	\N	228	\N	Lider	t	2008-01-01	Dia	\N	2007-01-01	Dia	f	\N	t	Si	\N	\N	f	\N	\N
897	1	Gap	\N	\N	203	\N	En_Formacion	t	2023-05-27	Dia	\N	2021-01-01	Dia	f	\N	f	\N	\N	\N	f	\N	\N
324	1	Gap	\N	\N	46	\N	En_Formacion	t	2014-12-05	Dia	\N	2022-01-01	Dia	f	\N	f	\N	\N	\N	t	Iglesia de Dios	Pentecostal
\.


--
-- Data for Name: personal_info_personal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_info_personal (id_persona, estado_civil, nombre_conyuge, tiene_hijos, numero_hijos, direccion, ocupacion, centro_laboral, nivel_academico, condicion_civil) FROM stdin;
491	Soltero	\N	f	\N	De donde fue el cosep 1c al sur, 1c y 10 varas abajo\nManagua	Estudiante	-	Ingenieria	Ninguna
826	Soltero	\N	f	\N	De donde fue el cosep 2 c al lago, 3c y 10 varas abajo	Estudiante	-	Licenciatura	Ninguna
827	Soltero	\N	f	\N	De los semáforos del Seminario 3C al Este, 1C al Norte, casa · 75	-	-	Maestria	Divorciado_1er_Matrimonio
832	Casado	Adrián Joel Medina Aguinaga	f	\N	Residencial santa edubije, calle 8, casa o 32	Ama de casa 	-	Licenciatura	Primer_Matrimonio
407	Soltero	\N	f	\N	Residencial santa eduvige, calle 8, segunda etapa casa o32	\N	\N	\N	Ninguna
836	Soltero	\N	f	\N	Las Brisas Casa O-45	Financiera 	ALMA	Maestria	Ninguna
821	Soltero	\N	t	2	estación 2 de policía,2c al norte, 2c al oeste,75 varas al norte, casa 108	Comerciante	Oficina en casa	Nivel_Tecnico	Divorciado_1er_Matrimonio
837	Casado	Moisés Abraham Ramírez Rocha	t	1	Km 18. Carretera Nueva a León. Casa Y-64. Vieja Etapa	Lic. Comunicación Social 	ALMA	Licenciatura	Primer_Matrimonio
68	Casado	Aubrey Ullite	t	2	Residencial san Andrés casa SS10	Administrador	Yang & Asociados	Ingenieria	Primer_Matrimonio
838	Soltero	\N	f	\N	Hsshjs	Estudiante 	-	Licenciatura	Ninguna
839	Soltero	\N	t	1	De los semáforos de la Asamblea Nacional 4 c abajo, 2 c al lago, 1 1/2 c arrival, Casa D39	Ejecutiva de ventas	Central Azucarera de Nicaragua S. A. 	Licenciatura	Divorciado_1er_Matrimonio
897	Soltero	\N	f	\N	Calle 27 de mayo, del pali, 75 varas arriba	Estudiante	\N	Secundaria	Ninguna
324	Casado	Ernesto José Artola Mayorga	t	3	Urb. Valle sta rosa, bloque A-3, casa #74.	Ama de casa	\N	Licenciatura	Primer_Matrimonio
\.


--
-- Data for Name: personal_lideres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_lideres (id_lider, id_persona, activo) FROM stdin;
1	483	t
2	491	t
\.


--
-- Data for Name: personal_requisitos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_requisitos (id_personal, id_requisito, cumplido, fecha_cumplido, notas) FROM stdin;
491	1	t	2015-12-31	\N
491	5	t	2023-12-31	\N
491	6	t	2015-12-31	\N
491	7	t	2022-12-31	\N
491	8	t	2022-12-31	\N
826	1	t	2015-12-31	\N
826	5	t	2023-12-31	\N
826	6	t	2015-12-31	\N
826	7	t	2022-12-31	\N
826	8	t	2022-12-31	\N
827	1	t	2015-12-31	\N
827	5	t	2023-12-31	\N
827	6	t	2015-12-31	\N
827	7	t	2022-12-31	\N
827	8	t	2022-12-31	\N
832	1	t	2015-12-31	\N
832	5	t	2023-12-31	\N
832	6	t	2015-12-31	\N
832	7	t	2022-12-31	\N
832	8	t	2022-12-31	\N
407	1	t	2015-12-31	\N
407	5	t	2023-12-31	\N
407	6	t	2015-12-31	\N
407	7	t	2022-12-31	\N
407	8	t	2022-12-31	\N
836	1	t	2015-12-31	\N
836	5	t	2023-12-31	\N
836	6	t	2015-12-31	\N
836	7	t	2022-12-31	\N
836	8	t	2022-12-31	\N
821	1	t	2015-12-31	\N
821	5	t	2023-12-31	\N
821	6	t	2015-12-31	\N
821	7	t	2022-12-31	\N
821	8	t	2022-12-31	\N
837	1	t	2015-12-31	\N
837	5	t	2023-12-31	\N
837	6	t	2015-12-31	\N
837	7	t	2022-12-31	\N
837	8	t	2022-12-31	\N
68	1	t	2015-12-31	\N
68	5	t	2023-12-31	\N
68	6	t	2015-12-31	\N
68	7	t	2022-12-31	\N
68	8	t	2022-12-31	\N
838	1	t	2015-12-31	\N
838	5	t	2023-12-31	\N
838	6	t	2015-12-31	\N
838	7	t	2022-12-31	\N
838	8	t	2022-12-31	\N
839	1	t	2015-12-31	\N
839	5	t	2023-12-31	\N
839	6	t	2015-12-31	\N
839	7	t	2022-12-31	\N
839	8	t	2022-12-31	\N
897	1	t	2015-12-31	\N
897	5	t	2023-12-31	\N
897	6	t	2015-12-31	\N
897	7	t	2022-12-31	\N
897	8	t	2022-12-31	\N
324	1	t	2015-12-31	\N
324	5	t	2023-12-31	\N
324	6	t	2015-12-31	\N
324	7	t	2022-12-31	\N
324	8	t	2022-12-31	\N
\.


--
-- Data for Name: personal_sistema; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_sistema (id_persona, id_rol, usuario, password_hash, fecha_ingreso_servicio, activo, id_creado_por, id_autorizado_por, id_solicitud_origen, version, solo_lectura) FROM stdin;
1	4	admin	$2a$12$9A/KxSkZN99heAM3i3ixF.bW9rJ.x9iLP7E5PvzUBltMtcYnLOBv6	2026-05-24	t	\N	\N	\N	1	f
491	3	sergio.daniel	$2a$12$cLPuywyvP/yP6zPriZ6wEOlPGK0TW0L5WdWHozMdg2EVDIg0a2FLS	2026-06-20	t	1	1	7	1	f
775	3	staff.5pm	$2a$12$vu6VkT0BLktCaF/fsNDuTez0tFlx1KE06YV5j3A.ecW96ndPuiOwy	2026-06-21	t	\N	\N	\N	1	f
826	3	angie.lorena	$2a$12$vTGHsP1SQ3guxxNb5AywzeKx6T6..Ik6ISY5zFwpIPy.gnuloCfiS	2026-06-24	t	1	1	8	1	f
827	3	anahit.sarjovna	$2a$12$xmcrkMeQZpE4DqgKnzNlmexaJ6iRsA3k4obnl1GNZZgY2yag2IpqC	2026-06-24	t	1	1	9	1	f
832	3	maria.gabriela	$2a$12$/ttLqAUgXixQxQPOnISUtO4YGtnolZJKJVx4wM7Wn4J/JiQ6GFTDG	2026-06-25	t	1	1	10	1	f
835	3	staff_miercoles2	$2a$12$CVZxPaUS2Amx3GDnyUDjNul71AEvbKkPXQEHbf/ng.DJNUvB6R6ju	2026-06-25	t	\N	\N	\N	1	f
828	3	staff_miercoles	$2a$12$ceGs3eHnx2adJacbVj9v.eOU9hgVkbCkFeCo.5cR1WDQmk4NM4qtq	2026-06-24	t	\N	\N	\N	1	f
407	3	adrian.joel	$2a$12$uUR4YMWNPUe.Z7pGWUybOuGVS5x8w98DBZerQPEjpikkCKybuNRtS	2026-06-25	t	1	1	11	1	f
836	3	olga.arminda	$2a$12$icD2IMjEBOH.WK1CInLRxeirp0fLplGpjAU0v8k7tEA0HY0RQC3N2	2026-06-25	t	1	1	12	1	f
821	3	noel.alexander	$2a$12$/u4v9sVfOv0FgKOifHmEEeJ2tHD7CI8RNSCcbC4HCcu46T49i14uO	2026-06-25	t	1	1	13	1	f
837	4	maria.antonia	$2a$12$3zC17knLxK.SY9dsX4lsYuaYyh/OMpbTsvsfd8kn/REaZTtXpQ4zy	2026-06-25	t	1	1	14	1	f
68	3	yajaira.suyen	$2a$12$7V3cNJ3BkUY/yG865/Pb2uhFu16G4pI7j/b6wA57YBjxCPKuWFIFi	2026-06-26	t	1	1	15	1	f
838	3	melannye.ratchel	$2a$12$zmgCJMMG6YMIu4Fz3qBqSeVWDzcjFTQAqAN3FxSm.kTQLfXRrux86	2026-06-27	t	1	1	16	1	f
839	3	karen.marcela	$2a$12$B9L2pEtLDmqBdukIkTMG3eUe5EgFm8jcR1JKOhEQXpSDxGsdomef6	2026-06-27	t	1	1	17	1	f
897	2	aurora.elena	$2a$12$z7AG96l2EZ0bkDQAUWVoTOsyak9xzYJwz57Fj1S3V7Jc1eblNFdf6	2026-06-28	t	1	1	18	2	f
324	2	xochitl.danelia	$2a$12$O.QHy6rvYGM8syb.KqyUDO8zF61Q9Q3RsuzlmJicRvPu0RbaQO6dW	2026-06-28	t	1	1	19	1	f
905	4	lectura	$2a$12$hAvFdZDtuE4/BNiAZdcn.eHI71q1tIajK3jWSv2MH3uA52gqR1TJC	2026-06-29	t	\N	\N	\N	1	t
\.


--
-- Data for Name: personal_suspensiones_servicio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_suspensiones_servicio (id_suspension, id_personal, fecha_inicio, fecha_fin, categoria_motivo, motivo, id_registrado_por, activo, creado_en, actualizado_en) FROM stdin;
\.


--
-- Data for Name: personal_turnos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_turnos (id_personal, id_turno, fecha_asignacion, activo) FROM stdin;
1	1	2026-05-24	t
1	2	2026-05-24	t
1	3	2026-05-24	t
1	4	2026-05-24	t
491	3	2026-06-20	t
775	4	2026-06-21	t
826	3	2026-06-24	t
827	4	2026-06-24	t
828	1	2026-06-24	t
832	1	2026-06-25	t
835	1	2026-06-25	t
407	1	2026-06-25	t
836	4	2026-06-25	t
821	4	2026-06-25	t
837	2	2026-06-25	t
837	4	2026-06-25	t
837	3	2026-06-25	t
837	1	2026-06-25	t
68	3	2026-06-26	t
838	2	2026-06-27	t
839	2	2026-06-27	t
897	4	2026-06-28	t
324	4	2026-06-28	t
905	2	2026-06-29	t
905	3	2026-06-29	t
905	4	2026-06-29	t
905	1	2026-06-29	t
\.


--
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personas (id_persona, nombres, apellidos, telefono, fecha_nacimiento, creado_en, actualizado_en, sexo, cedula, version) FROM stdin;
1	Administrador	Sistema	0000-SEED-ADMIN	1990-01-01	2026-05-24 00:40:27.505096-05	2026-05-24 00:40:27.505096-05	\N	\N	1
910	Pepe	Juarez	1111-1111	\N	2026-07-01 15:50:47.743097-05	2026-07-01 15:50:47.743097-05	\N	\N	1
918	Pepe	Grande	1111-1111	\N	2026-07-01 17:14:25.464721-05	2026-07-01 17:14:25.464721-05	\N	\N	1
933	Gladys	Benita Caballero Núñez	7640-1901	\N	2026-07-01 19:21:53.699151-05	2026-07-01 19:21:53.699151-05	\N	\N	1
69	Abby	Martinez Castillo	\N	2019-01-02	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
73	Abel	Calero Perez	\N	2014-08-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
72	Elizabeth	Sin Apellido	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
74	Celina	Perez	+505 88839470	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
76	Janixe	Estrada	+505 78457746	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
80	Ericka	Roa Flores	77256303	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
82	Blessing Lidia	Arias Rosales	82391996	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
84	Alejandra	Guadamuz	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
86	Gissele Karina	Mejia Coronado	77505554	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
88	Xilone	Rodriguez	+505 88839470	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
90	Alex	Cortez	+505 88051997	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
92	Melissa	Duarte	+505 75238404	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
94	Jaqueline	Hernandez Alvarez	86157869	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
96	Barbara	Fernanda	+505 82511966	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
102	Katherine Judith	Valle Martinez	+505 84291110	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
104	Bismarck	Duarte	88648369	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
106	Joselin	Rodriguez	+505 84757772	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
108	Massiel	Carrero	+505 89606386	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
110	Maria Jose	Centeno Mejia	78126781	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
114	Luvis	Morales	+505 82168196	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
116	Anielka	Guadamuz	+505 58464133	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
118	Liliana Linora	Martinez Urbina	+505 89051270	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
120	Carlos Jose	Martinez Esquivel	88064944	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
122	Ana Julia	Garcia Sotelo	88536889	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
124	Carelia	Sin Apellido	+505 75240099	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
126	Arlen	Torres Estrada	+505 86471393	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
128	Jessica	Ruiz	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
130	Carlos	Cortez	+505 88649613	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
132	Dani	Morales	+505 77524589	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
134	Dara	Rodriguez	83577798	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
136	Daniela	Lopez	+505 83268829	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
138	Jessy	Navarro	85775181	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
140	Jairo	Beteta	+505 84291110	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
142	Wilfredo	Lopez	82492189	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
147	Melisa	Mayorga	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
149	Leidi	Cantarero	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
151	Johana	Narvaez	+505 88699717	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
153	Crisanto	Davila	83795406	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
155	Karen	Diaz	81687109	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
157	Jeamy	Solano	81264606	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
159	Monica Guadalupe	Bustamante Gaitan	84492417	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
912	adfa	adfa	1111-1111	\N	2026-07-01 15:53:02.877749-05	2026-07-01 15:53:02.877749-05	\N	\N	1
920	jkj	jh	7777-7777	\N	2026-07-01 17:38:03.778535-05	2026-07-01 17:38:03.778535-05	\N	\N	1
934	Natasha	Melendez	\N	2013-08-18	2026-07-01 19:34:15.144329-05	2026-07-01 19:34:15.144329-05	Femenino	\N	1
935	Romana	Lopez	8283-3230	\N	2026-07-01 19:34:16.042341-05	2026-07-01 19:34:16.042341-05	\N	\N	1
162	Emma	Valentina Reyes	\N	2022-06-14	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
161	Ahastary	Flores	88567628	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
163	Alisson	Vado	+505 76776403	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
100	Jose	Castro	+505 76515167	\N	2026-05-24 07:11:23.655252-05	2026-05-24 12:28:12.43722-05	\N	\N	1
70	Patricia	Castillo	+505 58772737	\N	2026-05-24 07:11:23.655252-05	2026-05-24 12:28:55.026249-05	\N	\N	1
112	Jeymi	Solano	81264606	\N	2026-05-24 07:11:23.655252-05	2026-05-24 16:44:07.249325-05	\N	\N	1
165	Darling	Suazo	89606386	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
167	Henry	Jarquin Artiles	89990450	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
169	Iris	Mairena	+505 89215231	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
171	Andrea	Herrera	75071336	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
173	Ana	Fuentes	+505 81315889	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
177	Lorena	Rodriguez	77678109	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
179	Claudia	Mendoza	+505 86203552	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
181	Valeri	Palacios	+505 87881957	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
183	Maxwell	Hernandez	+505 86131774	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
185	Esther	Hernandez	+505 86107962	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
187	Shayra	Castillo	84909167	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
189	Rosario	Castillo	84909167	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
191	Mariela	Espinoza	+505 87017799	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
193	Tania	Bermudez	58063773	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
199	Alan	Hernandez	+505 88847545	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
201	Lizbeth	Lacayo	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
204	Yajaira De	Los Angeles Soriano	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
206	Edith	Mariana	+505 84274227	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
209	Jose	Napolion Valez	86546210	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
211	Elieth	Fedrick	87063020	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
213	Fiorela	Josephs	+505 84136190	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
215	Yahoska Maricela	Ruiz Guevara	86469329	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
217	Carol	Stefanie	+505 86244558	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
224	Miriam	Moreno	89773757	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
229	Mariela	Valverde	84503825	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
231	Reyna	Chavez	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
233	Gema	Garcia	+505 58649209	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
237	Danelia	Silva Reyes	89759692	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
239	Ema	Garcia Morales	+505 85808644	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
241	Luz	Marina Martinez	87736250	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
244	Zildheam	Jarquin	82527187	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
246	Jessenia	Bermudez	+505 83268829	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
248	Roxana	Lopez	+505 76515167	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
251	Scarlett	Duarte	84423454	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
196	Orlando	Burgos	+505 86131774	\N	2026-05-24 07:11:23.655252-05	2026-06-07 19:46:02.545691-05	\N	\N	1
253	Massiel	Beltrano	+505 82854884	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
219	Michelle	James	57418415	\N	2026-05-24 07:11:23.655252-05	2026-06-24 19:55:31.544545-05	\N	\N	1
914	adfad	adfadf	1111-1111	\N	2026-07-01 15:54:31.258731-05	2026-07-01 15:54:31.258731-05	\N	\N	1
922	Pepe	Mayor	7777-7777	\N	2026-07-01 17:42:37.010242-05	2026-07-01 17:42:37.010242-05	\N	\N	1
936	Johan Danilo	Nailen Molina	\N	2015-05-28	2026-07-01 19:41:17.682426-05	2026-07-01 19:41:17.682426-05	Masculino	\N	1
937	Katherine Tatiana	Molina Guerrero	7657-9001	\N	2026-07-01 19:41:18.436039-05	2026-07-01 19:41:18.436039-05	\N	\N	1
254	Lester	Rodriguez	\N	2015-05-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
256	Linsey	Beteta Rivas	\N	2018-04-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
262	Sheyla	Reyes	75238009	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
265	Magdiela	Guillen	+505 81412825	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
267	Martha	Beteta	+505 75475604	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
175	Ruth	Usman	87362946	\N	2026-05-24 07:11:23.655252-05	2026-05-24 13:12:19.603513-05	\N	\N	1
269	Norwin	Montano	+505 58745739	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
271	Lenin	Toruño	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
274	Luciana	Montiel	+505 81442442	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
276	Rosa	Altamirano	+505 81687109	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
278	Ana	Morales	84574799	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
281	Jonathan	Rosales	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
283	Juana	Hernandez	86890094	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
285	Maria	Lopez	58615187	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
288	Patricia	Zuniga Rivas	77785017	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
291	Jahoska	Guevara	86469329	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
293	Katherine	Velasquez	+505 77349004	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
295	Miguel	David Cruz	76747720	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
298	Daisy	Corea	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
303	Angela	Baltodano	+505 76456542	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
309	Stefany	Solis	+505 57921097	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
311	Never	Espinoza Bentraño	+505 88991460	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
313	Orlando	Jose Mena	86950601	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
315	Osmin	Soto	88535322	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
321	Zorayda	Bareas	88677182	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
327	Denia	Arias	89973500	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
331	Grisela	Jara	+505 81601890	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
333	Sergio	Martinez	+505 87967935	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
335	Marvin Antonio	Baez Dtrinidad	+505 87362946	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
341	Martha	Rivas	83314568	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
344	Carely	Zeledon	+505 88991337	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
346	Miguel Jose	Zamora Ramirez	85249503	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
306	Esther	Perez	+505 85925109	\N	2026-05-24 07:11:23.655252-05	2026-06-14 18:55:28.989756-05	\N	\N	1
348	Mileydi	Sarrias	8796-7935	\N	2026-05-24 07:11:23.655252-05	2026-06-28 18:20:22.244758-05	\N	\N	1
916	dfadf	dfad	1111-1111	\N	2026-07-01 16:01:57.542784-05	2026-07-01 16:01:57.542784-05	\N	\N	1
924	adf	adfa	1111-1111	\N	2026-07-01 17:44:59.942577-05	2026-07-01 17:44:59.942577-05	\N	\N	1
938	Javiera	Argueda Gadea	8282-0862	\N	2026-07-01 19:43:40.883708-05	2026-07-01 19:43:40.883708-05	\N	\N	1
350	Henry Gustavo	Blanco Gonzales	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
351	Xiomara	Margarita Castillo	\N	2016-09-22	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
352	Joselin	Gomez	84789402	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
354	Maineri	Diaz	+505 55035037	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
357	Lenin	Cruz	87643244	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
359	Jacquelin	Calderon	86562802	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
362	Katerine	Reynosa	+505 86546210	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
366	Alicia	Centeno	83569916	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
369	Minena	Guadalupe Bustamante	77003879	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
371	Yaremith	Andino	57648021	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
373	Jennyfer	Gabriela Meza	83787633	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
380	Maria Libertad	Mendoza T.	89857676	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
382	Adriana	Hernandez	89066328	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
384	Betis	Osedas	86217978	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
387	Josbel	Rodriguez	\N	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
389	Alexandra	Isabel Janes	76954542	\N	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
398	Katherine	Delgado	86284191	\N	2026-05-24 11:58:45.440984-05	2026-05-24 11:58:45.440984-05	\N	\N	1
400	Katherine	Reyes	86529095	\N	2026-05-24 12:09:37.643846-05	2026-05-24 12:09:37.643846-05	\N	\N	1
403	Ninoska	Espinoza Castro	89111257	\N	2026-05-24 12:14:31.551274-05	2026-05-24 12:14:31.551274-05	\N	\N	1
405	Jennifer Gabriela	Meza Brione	83787633	\N	2026-05-24 12:16:09.610647-05	2026-05-24 12:16:09.610647-05	\N	\N	1
260	Jacqueline	García	+505 85925109	\N	2026-05-24 07:11:23.655252-05	2026-05-24 12:21:37.599767-05	\N	\N	1
414	Juano	Montano	77777777	\N	2026-05-24 16:47:07.795944-05	2026-05-24 16:47:07.795944-05	\N	\N	1
415	Juanita	Montana	77777777	\N	2026-05-24 17:01:31.733523-05	2026-05-24 17:01:31.733523-05	\N	\N	1
412	Gema	Velasquez	88988356	\N	2026-05-24 12:53:15.438671-05	2026-05-31 01:24:05.434326-05	\N	\N	1
445	Karen	Lanuza	77777777	\N	2026-05-31 08:03:36.188424-05	2026-05-31 08:03:36.188424-05	\N	\N	1
409	Karen	Lanuza	58633842	\N	2026-05-24 12:46:24.446003-05	2026-05-31 08:10:22.037848-05	\N	\N	1
447	Amanda	Sequeira	88892922	\N	2026-05-31 11:50:07.840433-05	2026-05-31 11:50:07.840433-05	\N	\N	1
449	Fernando Samuel	Martinez Navaz	88433422	\N	2026-05-31 12:02:48.907079-05	2026-05-31 12:02:48.907079-05	\N	\N	1
226	Vanessa	Perez	57921097	\N	2026-05-24 07:11:23.655252-05	2026-05-31 12:06:14.767397-05	\N	\N	1
451	Jader	Araica	82626163	\N	2026-05-31 12:07:45.766371-05	2026-05-31 12:07:45.766371-05	\N	\N	1
452	Miriam	Moreno	89773757	\N	2026-05-31 12:09:32.572879-05	2026-05-31 12:09:32.572879-05	\N	\N	1
454	Raquel	Solis	76860761	\N	2026-05-31 12:29:03.489931-05	2026-05-31 12:29:03.489931-05	\N	\N	1
456	Wilber	Garcia Esquivel	89722717	\N	2026-05-31 12:30:12.814109-05	2026-05-31 12:30:12.814109-05	\N	\N	1
221	Barbara	Muñoz	+505 84548979	\N	2026-05-24 07:11:23.655252-05	2026-05-31 12:33:47.103155-05	\N	\N	1
458	Kati	Cerda	84700015	\N	2026-05-31 12:36:31.368725-05	2026-05-31 12:36:31.368725-05	\N	\N	1
338	Lari Lorena	Zapata Estrada	+505 83268829	\N	2026-05-24 07:11:23.655252-05	2026-05-31 12:38:56.305314-05	\N	\N	1
462	Madre De Neiyeli	Apellido	77777777	\N	2026-05-31 12:46:27.078707-05	2026-05-31 12:46:27.078707-05	\N	\N	1
464	Emily	Urroz	83773908	\N	2026-05-31 12:49:33.186628-05	2026-05-31 12:49:33.186628-05	\N	\N	1
469	Maria	Rivas	88664944	\N	2026-05-31 13:03:21.067213-05	2026-05-31 13:03:21.067213-05	\N	\N	1
460	Karelia	Rigby	7874-6435	\N	2026-05-31 12:43:06.129331-05	2026-06-14 18:43:17.639227-05	\N	\N	1
466	Marcela	Muñoz	83806948	\N	2026-05-31 12:50:32.151372-05	2026-05-31 13:08:14.879205-05	\N	\N	1
375	Esther	Ayerdis	ESTHER LIDER	\N	2026-05-24 07:11:23.655252-05	2026-06-14 18:55:19.653407-05	\N	\N	1
472	Yessenia	Garcia	88455949	\N	2026-05-31 13:10:35.50308-05	2026-05-31 13:10:35.50308-05	\N	\N	1
483	Guillermo	Jimenez	7819-3646	\N	2026-06-07 06:18:28.049128-05	2026-06-07 06:18:28.049128-05	\N	\N	1
491	Sergio Daniel	Martínez González	8248-1440	\N	2026-06-07 06:48:53.851796-05	2026-06-20 18:10:45.006626-05	Masculino	001-230804-1030S	1
926	dfadf	adfa	1111-1111	\N	2026-07-01 17:46:15.224599-05	2026-07-01 17:46:15.224599-05	\N	\N	1
940	Paula Betania	Morales Pineda	8450-1615	\N	2026-07-03 12:12:19.218175-05	2026-07-03 12:12:19.218175-05	\N	\N	1
475	Yessenia	Jerez	87725460	\N	2026-05-31 13:46:37.610622-05	2026-05-31 14:04:01.066759-05	\N	\N	1
692	Pepe Grande	Lopez	7777-7777	\N	2026-06-20 12:15:26.587427-05	2026-06-20 12:17:34.672798-05	\N	\N	1
742	Pepita	Lopez	1111-1111	\N	2026-06-21 00:19:26.62541-05	2026-06-21 00:19:26.62541-05	\N	\N	1
552	Maynor Gael	Cordoba Garcia	\N	2020-12-11	2026-06-07 11:29:55.435626-05	2026-06-07 11:29:55.435626-05	Femenino	\N	1
553	Dayana	Garcia Idiaquez	8685-0777	\N	2026-06-07 11:29:55.462076-05	2026-06-07 11:29:55.462076-05	\N	\N	1
556	Larry	Delgado	8952-9147	\N	2026-06-07 11:44:52.269398-05	2026-06-07 11:44:52.269398-05	\N	\N	1
558	Maria Mercedes	Espino Reyes	7762-8507	\N	2026-06-07 12:02:10.326648-05	2026-06-07 12:02:10.326648-05	\N	\N	1
560	Maycol	Perez	7634-4037	\N	2026-06-07 12:04:55.154192-05	2026-06-07 12:04:55.154192-05	\N	\N	1
565	Magdalena	Centeno	8793-3491	\N	2026-06-07 12:25:39.628612-05	2026-06-07 12:25:39.628612-05	\N	\N	1
567	Vanessa	Garcia Carranza	7557-7363	\N	2026-06-07 12:36:27.977241-05	2026-06-07 12:36:27.977241-05	\N	\N	1
563	Rosayda	Luna	5726-2595	\N	2026-06-07 12:22:30.259792-05	2026-06-07 12:42:39.069357-05	\N	\N	1
568	Maria	Gabriela Lopez	8607-3718	\N	2026-06-07 12:47:46.469745-05	2026-06-07 12:47:46.469745-05	\N	\N	1
570	Alejandra	Guadamuz	8376-9983	\N	2026-06-07 12:51:41.057908-05	2026-06-07 12:51:41.057908-05	\N	\N	1
572	Antonia	Guevara	8763-5949	\N	2026-06-07 12:54:56.023347-05	2026-06-07 12:54:56.023347-05	\N	\N	1
577	Arnoldo	Saavedra	8919-6671	\N	2026-06-07 13:33:29.811323-05	2026-06-07 13:33:29.811323-05	\N	\N	1
579	Veronica	Garcia	7726-5092	\N	2026-06-14 12:00:03.59175-05	2026-06-14 12:00:03.59175-05	\N	\N	1
581	Luis	Cuba	7878-3825	\N	2026-06-14 12:03:26.517075-05	2026-06-14 12:03:26.517075-05	\N	\N	1
583	Ruth	Paguaga	8861-2136	\N	2026-06-14 12:13:01.431986-05	2026-06-14 12:13:01.431986-05	\N	\N	1
585	Maria	Campos	8880-9275	\N	2026-06-14 12:21:43.84578-05	2026-06-14 12:21:43.84578-05	\N	\N	1
587	Ana	Moraga	8457-4799	\N	2026-06-14 12:30:37.675527-05	2026-06-14 12:30:37.675527-05	\N	\N	1
78	Jenny	Martinez Martinez	85731311	\N	2026-05-24 07:11:23.655252-05	2026-06-14 14:04:10.379217-05	\N	\N	1
588	Francisca	Martínez	8535-6524	\N	2026-06-14 17:53:24.744463-05	2026-06-14 17:53:24.744463-05	\N	\N	1
594	Reina	Ortega	8953-4198	\N	2026-06-14 18:01:56.915244-05	2026-06-14 18:01:56.915244-05	\N	\N	1
596	Jairo	Lopez Gayo	8353-2555	\N	2026-06-14 18:06:03.775154-05	2026-06-14 18:06:03.775154-05	\N	\N	1
597	Gilsa	Alejandra	5756-3629	\N	2026-06-14 18:10:07.873625-05	2026-06-14 18:10:07.873625-05	\N	\N	1
599	Hasel	Roa	8786-0012	\N	2026-06-14 18:25:09.613178-05	2026-06-14 18:25:09.613178-05	\N	\N	1
601	Alicia	Vargas	7663-7310	\N	2026-06-14 18:26:24.062193-05	2026-06-14 18:26:24.062193-05	\N	\N	1
604	Dinora	Torrez	8121-1110	\N	2026-06-14 18:30:06.642051-05	2026-06-14 18:30:06.642051-05	\N	\N	1
607	Axel	Cornavaca	8734-4822	\N	2026-06-14 18:33:00.123687-05	2026-06-14 18:33:00.123687-05	\N	\N	1
609	Tania	Calero	8377-5897	\N	2026-06-14 18:49:12.309613-05	2026-06-14 18:49:12.309613-05	\N	\N	1
611	Sonia	Vasquez	8975-7198	\N	2026-06-14 18:59:16.666474-05	2026-06-14 18:59:16.666474-05	\N	\N	1
613	Maritza	Fernandez	8884-3267	\N	2026-06-14 19:04:25.538868-05	2026-06-14 19:04:25.538868-05	\N	\N	1
625	Xilonem	Castro	8674-8331	\N	2026-06-14 19:19:48.282931-05	2026-06-14 19:19:48.282931-05	\N	\N	1
755	Valquiria Del Socorro	Acebedo Palacio	8380-5627	\N	2026-06-21 12:01:33.547292-05	2026-06-21 12:01:33.547292-05	\N	\N	1
574	Daniel Francisco	Guadamuz	7896-6362	\N	2026-06-07 12:58:57.583214-05	2026-06-21 11:33:23.548776-05	\N	\N	1
751	Cristian	Noguera	8577-3856	\N	2026-06-21 11:54:14.698848-05	2026-06-21 11:54:14.698848-05	\N	\N	1
752	Elizabeth	Blandon	8779-1799	\N	2026-06-21 11:58:37.173703-05	2026-06-21 11:58:37.173703-05	\N	\N	1
753	Elizabeth	Blandon	1111-1111	\N	2026-06-21 11:59:09.956827-05	2026-06-21 11:59:09.956827-05	\N	\N	1
757	Franklin	Otero	8160-6283	\N	2026-06-21 12:04:11.100598-05	2026-06-21 12:04:11.100598-05	\N	\N	1
759	Eva	Ruiz	8787-9021	\N	2026-06-21 12:10:10.421834-05	2026-06-21 12:10:10.421834-05	\N	\N	1
761	Arlen	Torres	8983-4386	\N	2026-06-21 12:11:55.577773-05	2026-06-21 12:11:55.577773-05	\N	\N	1
763	Yeymi Mariso	Navarrete Choza	8780-2100	\N	2026-06-21 12:22:33.563065-05	2026-06-21 12:22:33.563065-05	\N	\N	1
928	Peleo	Fuerte	1111-1111	\N	2026-07-01 17:56:48.077005-05	2026-07-01 17:56:48.077005-05	\N	\N	1
775	Staff 5pm	Servicio	555-1700	1995-01-01	2026-06-21 17:30:19.162763-05	2026-06-21 17:30:19.162763-05	\N	\N	1
836	Olga	Arminda Urbina Molina	8630-7914	\N	2026-06-24 22:16:50.35645-05	2026-06-24 22:16:50.35645-05	Femenino	888-300187-0000S	1
832	Maria	Gabriela López Zeledon	5058-6073	\N	2026-06-24 19:38:37.386267-05	2026-06-24 19:38:37.386267-05	Femenino	001-060988-0043H	1
826	Angie	Lorena Rodríguez Estrada	\N	\N	2026-06-23 19:19:02.718619-05	2026-06-23 19:19:02.718619-05	Femenino	001-070904-1029N	1
827	Anahit	Sarjovna Rayo Ruiz	8941-5405	\N	2026-06-24 09:55:34.862954-05	2026-06-24 09:55:34.862954-05	Femenino	001-120377-0037K	1
828	Staff	Miercoles	555-MIERCOLES	1995-05-15	2026-06-24 18:06:22.296263-05	2026-06-24 18:06:22.296263-05	Masculino	\N	1
835	Staff2	Miercoles	555-MIERCOLES-2	1996-06-20	2026-06-24 20:06:53.030763-05	2026-06-24 20:06:53.030763-05	Femenino	\N	1
837	María	Antonia Guevara Martínez	\N	\N	2026-06-25 15:45:57.660012-05	2026-06-25 15:45:57.660012-05	Femenino	0011611820022C	1
838	Melannye	Ratchel Montiel Velázquez	5780-3747	\N	2026-06-27 14:51:39.124938-05	2026-06-27 14:51:39.124938-05	Femenino	001-020104-1010E	1
839	Karen	Marcela Cáceres Lazo	\N	\N	2026-06-27 15:05:52.228571-05	2026-06-27 15:05:52.228571-05	Femenino	001-100386-00000R	1
769	Claudia	Largaespada	7546-7616	\N	2026-06-21 12:39:18.588056-05	2026-06-21 12:39:18.588056-05	\N	\N	1
768	Lizzie Abigail	Siles Largaespada	\N	2021-08-21	2026-06-21 12:39:17.738405-05	2026-06-21 12:39:17.738405-05	Femenino	\N	1
771	Teresa	Baldelomar	5	\N	2026-06-21 12:45:34.636024-05	2026-06-21 12:45:34.636024-05	\N	\N	1
773	Eglis	Fornos	5701-1178	\N	2026-06-21 12:49:00.735743-05	2026-06-21 12:49:00.735743-05	\N	\N	1
777	Carlos	Vasquez	8855-2042	\N	2026-06-21 17:48:16.60498-05	2026-06-21 17:48:16.60498-05	\N	\N	1
779	William	Hernandez	8865-9079	\N	2026-06-21 17:50:19.490745-05	2026-06-21 17:50:19.490745-05	\N	\N	1
781	Adriana Del Socorro	Moreno Lira	8757-0868	\N	2026-06-21 17:50:33.927716-05	2026-06-21 17:50:33.927716-05	\N	\N	1
784	Isaias	Medina	8982-0497	\N	2026-06-21 17:54:47.351237-05	2026-06-21 17:54:47.351237-05	\N	\N	1
785	Ana	Fuentes	8367-0950	\N	2026-06-21 17:57:29.918734-05	2026-06-21 17:57:29.918734-05	\N	\N	1
787	Nissin Candelaria	Reyes Mendoza	5725-4978	\N	2026-06-21 18:00:32.97077-05	2026-06-21 18:00:32.97077-05	\N	\N	1
788	Jahaira	Soreano	8624-4558	\N	2026-06-21 18:01:43.708424-05	2026-06-21 18:01:43.708424-05	\N	\N	1
789	Jahaira	Soriano	8624-4558	\N	2026-06-21 18:02:25.357259-05	2026-06-21 18:02:25.357259-05	\N	\N	1
790	Grisela	Jara	8160-1890	\N	2026-06-21 18:03:30.932464-05	2026-06-21 18:03:30.932464-05	\N	\N	1
791	Carelia	Vilchez	5757-0980	\N	2026-06-21 18:04:21.303514-05	2026-06-21 18:04:21.303514-05	\N	\N	1
792	Jaqueline	Garcia	8592-5109	\N	2026-06-21 18:05:15.99534-05	2026-06-21 18:05:15.99534-05	\N	\N	1
793	Jacqueline	Garcia	8592-5109	\N	2026-06-21 18:06:21.120428-05	2026-06-21 18:06:21.120428-05	\N	\N	1
794	Janira	Burgos	8592-5109	\N	2026-06-21 18:07:02.417384-05	2026-06-21 18:07:02.417384-05	\N	\N	1
796	Jennifer De Los Angeles	Sanchez	8506-2737	\N	2026-06-21 18:10:05.899266-05	2026-06-21 18:10:05.899266-05	\N	\N	1
797	Katty	Cerda	8470-0015	\N	2026-06-21 18:10:59.463806-05	2026-06-21 18:10:59.463806-05	\N	\N	1
798	Jeseenia	Santana	8798-9787	\N	2026-06-21 18:11:52.575138-05	2026-06-21 18:11:52.575138-05	\N	\N	1
800	Laura Cristina	Urbina Gamez	5726-8282	\N	2026-06-21 18:14:38.418556-05	2026-06-21 18:14:38.418556-05	\N	\N	1
801	Laura	Cristina Urbina Game	5726-8282	\N	2026-06-21 18:17:05.562935-05	2026-06-21 18:17:05.562935-05	\N	\N	1
803	Hazell	Colomer	8219-0045	\N	2026-06-21 18:18:16.219713-05	2026-06-21 18:18:16.219713-05	\N	\N	1
807	Danidl	Arguello	8958-8200	\N	2026-06-21 18:21:32.617471-05	2026-06-21 18:21:32.617471-05	\N	\N	1
809	Norwuin	Montano	8701-7799	\N	2026-06-21 18:23:04.136912-05	2026-06-21 18:23:04.136912-05	\N	\N	1
810	Norwin	Montano	8701-7799	\N	2026-06-21 18:23:44.711266-05	2026-06-21 18:23:44.711266-05	\N	\N	1
812	Janira	Gaitan Siles	8362-2408	\N	2026-06-21 18:33:38.668499-05	2026-06-21 18:33:38.668499-05	\N	\N	1
815	Maria Isabel	Sanchez Garcia	8295-1750	\N	2026-06-21 18:40:17.580839-05	2026-06-21 18:40:17.580839-05	\N	\N	1
817	Itzel Yarezi	Gutierrez Navarro	8557-1515	\N	2026-06-21 18:43:36.537928-05	2026-06-21 18:43:36.537928-05	\N	\N	1
930	adf	adf	1111-1111	\N	2026-07-01 18:00:07.0422-05	2026-07-01 18:00:07.0422-05	\N	\N	1
905	Consulta	General	0000-SEED-LECTURA	1990-01-01	2026-06-28 19:11:27.846759-05	2026-06-28 19:11:27.846759-05	\N	\N	1
897	Aurora	Elena Cordero Hurtado	\N	\N	2026-06-28 18:18:11.498589-05	2026-06-28 18:18:11.498589-05	Femenino	001-240409-1043F	1
906	Moisés Abraham	Ramírez Rocha	88376442	\N	2026-06-28 19:56:11.742703-05	2026-06-28 19:56:11.742703-05	Masculino	0012912860026U	1
847	Snileh	Rivas Mendoza	\N	2018-12-09	2026-06-28 09:00:20.687255-05	2026-06-28 09:00:43.955935-05	Masculino	\N	1
849	Elias Azael	García Samora	\N	2015-11-21	2026-06-28 09:04:35.038135-05	2026-06-28 09:04:35.038135-05	Masculino	\N	1
851	Esther Alejandra	Alvarado Barahona	\N	2015-03-09	2026-06-28 09:05:47.078338-05	2026-06-28 09:05:47.078338-05	Femenino	\N	1
848	Mercedes Socorro	Murillo Guevara	8587-4125	\N	2026-06-28 09:00:21.374304-05	2026-06-28 09:00:44.697158-05	\N	\N	1
850	Ippsia Jackdale	Samora Calero	8681-1843	\N	2026-06-28 09:04:35.715441-05	2026-06-28 09:04:35.715441-05	\N	\N	1
75	Abner Obed	Perez Estrada	\N	2019-05-29	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
77	Adela Joan	Solazon Martinez	\N	2020-09-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
79	Adriana Belen	Morales Roa	\N	2017-10-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
81	Ainhoa Jassary	Quintana Arias	\N	2018-10-08	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
83	Alejandro Alberto	Velasquez Guadmuz	\N	2019-09-05	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
85	Alejandro Jose	Guadamuz Mejia	\N	2020-09-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
87	Alex	Caleb Molina	\N	2018-08-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
89	Alex Sebastian	Cortez Aguirre	\N	2022-01-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
853	Matías Rafael	Luis Barahona	\N	2020-10-15	2026-06-28 09:06:50.294885-05	2026-06-28 09:06:50.294885-05	Masculino	\N	1
854	Carlos Haziel	Sequeira Martinez	\N	2020-08-18	2026-06-28 09:08:01.748024-05	2026-06-28 09:08:01.748024-05	Masculino	\N	1
856	Alía Isabella	Doña Rugama	\N	2019-08-08	2026-06-28 09:12:11.893851-05	2026-06-28 09:15:38.247062-05	Femenino	\N	1
858	Renata Sophia	Cubillo Fonseca	\N	2016-12-01	2026-06-28 09:25:42.901991-05	2026-06-28 09:25:42.901991-05	Femenino	\N	1
883	Lester	Zeledon	\N	2013-01-25	2026-06-28 12:18:02.710823-05	2026-06-28 12:18:02.710823-05	Masculino	\N	1
852	Maria Auxiliadora	Barahona Perez	5867-5450	\N	2026-06-28 09:05:47.733636-05	2026-06-28 09:05:47.733636-05	\N	\N	1
855	Liliana Dinora	Mártinez Urbina	8905-1270	\N	2026-06-28 09:08:02.551432-05	2026-06-28 09:08:02.551432-05	\N	\N	1
857	Cristina Del Carmen	Rugama Duran	8939-4727	\N	2026-06-28 09:12:12.567879-05	2026-06-28 09:15:39.023235-05	\N	\N	1
859	Erwing Javier	Cubillo Hernández	7723-0966	\N	2026-06-28 09:25:43.560666-05	2026-06-28 09:25:43.560666-05	\N	\N	1
861	Erwin	Cubillo	8888-8888	\N	2026-06-28 09:27:05.411247-05	2026-06-28 09:27:05.411247-05	\N	\N	1
863	Jacqueline Del Socorro	Mojica Hernandez	8159-0109	\N	2026-06-28 09:31:15.787909-05	2026-06-28 09:31:15.787909-05	\N	\N	1
865	Karen Maria	Vega Espinoza	8964-3140	\N	2026-06-28 09:39:43.787756-05	2026-06-28 09:39:43.787756-05	\N	\N	1
867	Johany Jessenia	Garcia Zuniga	7789-6025	\N	2026-06-28 09:56:46.826633-05	2026-06-28 09:56:46.826633-05	\N	\N	1
869	Dameris	Medina Guzmán	5760-9929	\N	2026-06-28 10:10:23.981241-05	2026-06-28 10:10:23.981241-05	\N	\N	1
871	Maria	Betanco	5777-6025	\N	2026-06-28 10:16:30.251832-05	2026-06-28 10:18:05.417091-05	\N	\N	1
872	Carol	Isayana Fernández García	8576-4060	\N	2026-06-28 11:54:29.383131-05	2026-06-28 11:54:29.383131-05	\N	\N	1
874	Tamara Elieth	Estrada Pérez	7864-3413	\N	2026-06-28 11:55:59.312651-05	2026-06-28 11:55:59.312651-05	\N	\N	1
877	Gengis Héctor	López Leal	8664-5564	\N	2026-06-28 12:03:42.062899-05	2026-06-28 12:03:42.062899-05	\N	\N	1
880	Edwin	Mendoza	7667-0359	\N	2026-06-28 12:07:30.314907-05	2026-06-28 12:07:30.314907-05	\N	\N	1
884	Lester	Zeledon	8263-8506	\N	2026-06-28 12:18:03.361994-05	2026-06-28 12:18:03.361994-05	\N	\N	1
885	Bayardo	Hernández	8685-1172	\N	2026-06-28 12:19:57.873166-05	2026-06-28 12:19:57.873166-05	\N	\N	1
886	Norman	Solís	0000-0000	\N	2026-06-28 12:26:47.028709-05	2026-06-28 12:26:47.028709-05	\N	\N	1
888	Keyner	Escoto	8705-9512	\N	2026-06-28 12:33:46.898024-05	2026-06-28 12:33:46.898024-05	\N	\N	1
889	Axel	Corbanava	8734-4822	\N	2026-06-28 12:55:10.411524-05	2026-06-28 12:55:10.411524-05	\N	\N	1
890	Nabyarina	Almendarez	8884-9098	\N	2026-06-28 17:41:50.737267-05	2026-06-28 17:41:50.737267-05	\N	\N	1
892	Gladys Mercedes	Balmaceda Castro	8899-3546	\N	2026-06-28 18:01:51.779453-05	2026-06-28 18:01:51.779453-05	\N	\N	1
894	Scarleth Del Carmen	Centeno González	8679-1995	\N	2026-06-28 18:05:11.515877-05	2026-06-28 18:05:11.515877-05	\N	\N	1
896	Hassel Dayana	Urroz Artola	8236-0987	\N	2026-06-28 18:10:34.285373-05	2026-06-28 18:10:34.285373-05	\N	\N	1
908	Vhii	Adfa	8888-8888	\N	2026-07-01 13:57:06.186619-05	2026-07-01 13:57:06.186619-05	\N	\N	1
91	Alexa	Garcia	\N	2015-12-28	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
93	Alexis	Alexander Valle	\N	2017-08-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
95	Aleyda Paola	Sequeira Fernanda	\N	2019-10-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
97	Alicia	Espinoza	\N	2021-03-14	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
101	Angel Matias	Martinez Valle	\N	2018-06-11	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
103	Angie Alejandra	Duarte Cerda	\N	2023-04-18	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
105	Ansel Nathaniel	Medina Rodriguez	\N	2019-12-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
107	Antonela Valentina	Delfs Carrero	\N	2014-03-20	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
109	Aurora Marcela	Flores Centeno	\N	2019-03-19	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
111	Bekir	Medina Solano	\N	2017-11-20	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
113	Britany	Padilla	\N	2016-04-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
115	Caleb Enrique	Garcia Guadamuz	\N	2020-03-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
117	Carlos Haziel	Sequeira Martinez	\N	2020-02-18	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
119	Carlos Julian	Martinez Rivas	\N	2020-01-18	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
121	Carlos Omar	Carrillo Soto	\N	2017-01-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
123	Cassie	Camila	\N	2017-10-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
125	Clauded Leonela	Reyes Torres	\N	2014-05-05	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
127	Claudio Jose	Castrillo Ruiz	\N	2020-11-15	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
129	Dana	Antonela Trochez	\N	2017-09-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
131	Daniela Belen	Morales Picado	\N	2018-05-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
133	Danna Antonella	Trochez Rodriguez	\N	2017-09-18	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
135	Danny Xasviere	Sanchez Lopez	\N	2021-01-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
137	Dara Sofia	Escorcia Navarro	\N	2018-08-15	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
139	Datsari	Artoal Beteta	\N	2019-03-21	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
141	Dereck	Lopez Barahona	\N	2017-06-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
143	Derick	Lopez	\N	2017-04-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
144	Diego Alberto	Rodriguez Mendoza	\N	2015-11-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
146	Diego Jose	Garcia Mayorga	\N	2013-06-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
148	Dominick	Guerrero	\N	2017-07-24	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
150	Dominick	Javier Martinez	\N	2015-05-21	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
152	Dorian	Davila	\N	2016-02-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
154	Efrain	Diaz	\N	2018-08-29	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
156	Elisa	Mena Solano	\N	2015-03-09	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
158	Emiliana Guadalupe	Martinez Bustamante	\N	2024-02-27	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
160	Emily Fernanda	Sanchez Flores	\N	2021-08-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
164	Estefania	Medal Suazo	\N	2013-08-19	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
166	Esther	Jarquin Gonzalez	\N	2023-01-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
168	Eymi	Sophia Mairena	\N	2014-04-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
170	Fabiana Marieth	Otero Herrera	\N	2016-10-11	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
172	Gabriel	Ruiz	\N	2014-10-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
174	Gabriela	Montiel	\N	2017-10-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
176	Galatea Valentina	Tinoco Rojas	\N	2020-04-24	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
178	Genesis Nicole	Chavarria Mendoza	\N	2014-07-05	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
180	Gerald	Blandon	\N	2022-09-25	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
182	Grace	Hernandez Fernandez	\N	2020-01-27	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
184	Grace	Hernandez Velasquez	\N	2019-12-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
186	Greshawn	Clair Castillo	\N	2019-11-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
188	Grisell	Leiva	\N	2021-06-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
190	Hadasha	Mendoza	\N	2018-10-31	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
192	Hanan Jocabed	Gomez Bermudez	\N	2013-12-08	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
194	Ian Fernando	Acebedo Torres	\N	2018-10-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
195	Iker	Burgos	\N	2018-03-20	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
197	Isaac	Escorcia Navarro	\N	2016-02-20	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
198	Isabella	Hernandez	\N	2020-07-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
200	Israel Efren	Vasquez Aguilar	\N	2016-04-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
202	Jacob Asael	Galeano Diaz	\N	2016-04-11	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
203	Jader Mateo	Valdez Soriano	\N	2021-02-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
205	Jafet	Aldana Reyes	\N	2021-12-29	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
207	Jared	Espinoza	\N	2018-02-15	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
208	Jared	Mateo Valdez	\N	2021-06-02	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
210	Jaslene Elvira	Lopez Fedrick	\N	2015-10-20	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
212	Jasmin	Garzon	\N	2020-05-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
214	Jayden Matias	Sanchez Ruiz	\N	2019-12-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
216	Jean	Zaid	\N	2021-11-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
220	Jennifer Abigail	Rivera Muñoz	\N	2013-10-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
223	Jeshua Raul	Hernandez Moreno	\N	2023-01-29	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
225	Jesus Mateo	Rios Perez	\N	2016-05-10	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
227	Jilian	Rodriguez	\N	2016-04-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
228	Jimena	Sofia Zeledon	\N	2018-03-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
230	Joel Alejandro	Martinez Chavarria	\N	2015-08-02	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
232	Joeli	Martinez	\N	2018-10-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
234	Jose Angel	Valdez Soriano	\N	2015-07-11	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
236	Jose Ismael	Escobar Silva	\N	2013-06-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
238	Jose	Luis Fonseca	\N	2022-12-30	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
240	Jose	Ramon Guevara	\N	2017-10-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
242	José Santiago	Castro Roman	\N	2013-10-24	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
243	Keyla Valentina	Barberena Jarquin	\N	2021-03-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
245	Kiara	Bermudez	\N	2016-02-10	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
247	Kristen	Gutierrez Lopez	\N	2013-10-25	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
249	Lea Rochell	Campos Jiros	\N	2016-03-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
250	Lea Valentina	Blandino Duarte	\N	2019-02-05	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
222	Jeremias Ezer	Solano Martinez	\N	2016-06-03	2026-05-24 07:11:23.655252-05	2026-06-14 14:04:10.321431-05	Masculino	\N	1
252	Leandro Misael	Riceño Beltrano	\N	2014-03-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
218	Jeheily Hilda	Washington James	\N	2019-12-06	2026-05-24 07:11:23.655252-05	2026-06-24 19:55:30.826437-05	Femenino	\N	1
255	Liam Jared	Garcia Guadamuz	\N	2016-02-12	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
257	Lisandra Massiel	Riceño Beltrano	\N	2020-11-12	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
259	Luka	Garcia	\N	2014-03-30	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
261	Luziana	Gutierrez	\N	2022-07-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
263	Maddy Johan	Campos Jiros	\N	2018-12-08	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
264	Magdiela Isai	Medina Guillen	\N	2019-08-21	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
266	Marcela	Mendoza	\N	2017-12-28	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
258	Luci	Medina Solano	\N	2019-03-10	2026-05-24 07:11:23.655252-05	2026-05-24 16:44:07.227686-05	\N	\N	1
268	Marcelo	Montano	\N	2018-05-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
270	Marcelo	Toruño	\N	2013-08-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
272	Marian	Martinez	\N	2018-10-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
273	Maricela	Castillo	\N	2019-04-12	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
275	Mariel Esther	Lopez Ruiz	\N	2017-02-25	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
277	Marvin Gadiel	Sanchez Morales	\N	2018-03-26	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
279	Mateo	Espinoza	\N	2021-03-14	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
280	Mateo	Rosales	\N	2014-03-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
282	Matias	Gonzalez Miranda	\N	2019-08-29	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
284	Matias Gael	Duartes Lopez	\N	2021-01-19	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
286	Matias	Hernandez Fernandez	\N	2017-10-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
287	Matias Javier	Davila Zuniga	\N	2018-12-01	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
289	Matias	Misael Molina	\N	2014-02-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
290	Matias	Sanchez Guevara	\N	2019-12-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
292	Mauricio	Daniel Delgado	\N	2021-06-03	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
294	Maycol	Bismark Cruz	\N	2016-10-18	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
296	Mia	Mendoza	\N	2019-03-26	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
297	Miguel Angel	Palacios Castillo	\N	2015-07-31	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
300	Monse	Rodriguez	\N	2016-07-12	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
301	Nadib	Galeano Diaz	\N	2019-10-18	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
302	Naima Esther	Navarro Baltodano	\N	2016-08-12	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
304	Nazareth	Montiel	\N	2018-09-15	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
305	Nicole	Ayerdis Vega	\N	2016-08-16	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
307	Norma Stefany	Palacios Castillo	\N	2016-08-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
308	Norman	Solis Santana	\N	2016-11-21	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
310	Oliver	Espinoza	\N	2015-01-28	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
312	Orlando Joel	Mena Guzman	\N	2020-11-17	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
314	Osmin Matias	Soto Gonzalez	\N	2014-05-30	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
316	Otoniel David	Sequeira Fernanda	\N	2017-02-21	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
317	Pier	Garcia	\N	2016-04-20	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
318	Reina	Merary Guadamuz	\N	2021-11-30	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
319	Reyna	Merari Gudamuz	\N	2021-11-30	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
320	Robzy Belen	Guevara Bareas	\N	2016-02-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
322	Rolando Fernell	Tinoco Rojas	\N	2016-07-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
323	Samantha	Artola	\N	2014-03-31	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
325	Samantha	Rosales	\N	2016-12-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
326	Samuel	Alejandro Arguello	\N	2016-03-27	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
328	Santiago	Rios Perez	\N	2022-01-26	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
329	Santiago Alfonso	Vargas Amador	\N	2016-11-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
330	Santiago	Soto	\N	2022-05-25	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
332	Sergio Adrian	Martinez Juarez	\N	2020-01-07	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
334	Sergio Antonio	Baez Leiva	\N	2018-01-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
336	Sofia Isabela	Sanchez Flores	\N	2019-05-10	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
337	Sofia Isabella	Fernandez Zapata	\N	2020-08-09	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
339	Sofia	Valentina Delgado	\N	2015-04-13	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
340	Stefanie	Rivas	\N	2016-05-10	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
342	Sthephania Azucena	Medal Suazo	\N	2013-09-19	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
343	Svaenny	Zeledon	\N	2020-01-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
345	Thiago Isai	Zamora Aguirre	\N	2016-01-10	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
347	Valeria	Urbina	\N	2020-06-25	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
349	Victoria Jael	Blanco Torrez	\N	2023-01-05	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
353	Zoe Abigail	Funes Diaz	\N	2022-09-19	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
355	Zoe Cristin	Hernandez Moreno	\N	2018-12-11	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
356	Zoe Denisse	Cruz Matute	\N	2020-08-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
358	Zoe Fernanda	Cornavaca Calderon	\N	2020-02-09	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
360	Zoe Maricela	Sanchez Ruiz	\N	2023-05-04	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
361	Zoe	Valentina Montano	\N	2022-01-29	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
363	Zoe	Sanchez Solano	\N	2023-08-15	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
364	Zoe Xitlaly	Ullitte Parrales	\N	2014-02-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
365	Wilber Mathias	Centeno Ramirez	\N	2019-05-25	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
367	Samantha	Gomez	\N	2019-10-10	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
368	Gadiel Adrian	Rivera Bustamante	\N	2019-03-12	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
370	Grace Alejandra	Perez Andino	\N	2019-05-01	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
372	Grabiela Alexandra	Hernandez Meza	\N	2017-09-02	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
374	Darrell	Castro	\N	2013-11-28	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
379	Diego	Rodriguez Mendoza	\N	2015-11-23	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
381	Ariana	Nicole Gutierrez	\N	2018-09-22	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
383	Valentina	Mayorga	\N	2017-06-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
385	Yajaira	Gutierrez	\N	2018-01-06	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
386	Moises	Rodriguez	\N	2024-01-01	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
388	Valentina Abigail	Nogera Janes	\N	2021-02-08	2026-05-24 07:11:23.655252-05	2026-05-24 07:11:23.655252-05	\N	\N	1
397	Diego Andres	Gerez Delgado	\N	2019-10-03	2026-05-24 11:58:45.367482-05	2026-05-24 11:58:45.367482-05	\N	\N	1
399	Amaya Lucía	Soto Reyes	\N	2016-03-17	2026-05-24 12:09:37.587328-05	2026-05-24 12:09:37.587328-05	\N	\N	1
401	Adrian	Reyes Pérez	\N	2017-12-23	2026-05-24 12:10:10.816672-05	2026-05-24 12:10:10.816672-05	\N	\N	1
402	Carmen Alejandra	Leiva Castro	\N	2016-08-19	2026-05-24 12:14:31.501018-05	2026-05-24 12:14:31.501018-05	\N	\N	1
404	Gabriela Alexandra	Hernandez Meza	\N	2017-12-02	2026-05-24 12:16:09.545148-05	2026-05-24 12:16:09.545148-05	\N	\N	1
99	Amalia Abigail	Castro Roman	\N	2014-05-20	2026-05-24 07:11:23.655252-05	2026-05-24 12:28:12.380716-05	\N	\N	1
406	Gabriel	Medina Lopez	\N	2018-08-22	2026-05-24 12:35:45.021707-05	2026-05-24 12:35:45.021707-05	\N	\N	1
408	Danna	Larios	\N	2021-07-30	2026-05-24 12:46:24.382859-05	2026-05-24 12:46:24.382859-05	\N	\N	1
411	Adaya	Cerna Velasquez	\N	2023-09-13	2026-05-24 12:53:15.37799-05	2026-05-31 01:24:05.415084-05	Femenino	\N	1
410	Isabella	Larios	\N	2018-09-27	2026-05-24 12:47:10.516101-05	2026-05-31 08:10:21.987049-05	Femenino	\N	1
446	Isabeau	Miranda Lopez	\N	2016-08-25	2026-05-31 11:50:07.779712-05	2026-05-31 11:50:07.779712-05	Femenino	\N	1
448	Fernando Gael	Martinez Luna	\N	2015-05-21	2026-05-31 12:02:48.849668-05	2026-05-31 12:02:48.849668-05	Masculino	\N	1
450	Emma Luciana	Araica	\N	2018-10-29	2026-05-31 12:07:45.710446-05	2026-05-31 12:07:45.710446-05	Femenino	\N	1
453	Thiago Andres	Acosta Solis	\N	2018-08-01	2026-05-31 12:29:03.430252-05	2026-05-31 12:29:03.430252-05	Masculino	\N	1
455	Abril	Prado Reyes	\N	2015-01-01	2026-05-31 12:30:12.795594-05	2026-05-31 12:30:12.795594-05	Femenino	\N	1
457	Sofia Belen	Hernandez	\N	2019-10-08	2026-05-31 12:36:31.340287-05	2026-05-31 12:36:31.340287-05	Femenino	\N	1
459	Deyrell	Moise	\N	2021-11-02	2026-05-31 12:43:06.064089-05	2026-05-31 12:43:06.064089-05	Masculino	\N	1
461	Neiyeli	Sin Apellido	\N	2016-05-05	2026-05-31 12:46:27.020998-05	2026-05-31 12:46:27.020998-05	Femenino	\N	1
463	Emanuel	Siria	\N	2017-12-09	2026-05-31 12:49:33.128389-05	2026-05-31 12:49:33.128389-05	Masculino	\N	1
465	Pablo	Laines	\N	2016-06-17	2026-05-31 12:50:32.095862-05	2026-05-31 12:50:32.095862-05	Masculino	\N	1
470	Sara	Laines	\N	2021-11-13	2026-05-31 13:08:46.421783-05	2026-05-31 13:08:46.421783-05	Femenino	\N	1
467	Laura	Santos	\N	2016-05-26	2026-05-31 12:55:46.006894-05	2026-05-31 12:55:46.006894-05	Femenino	\N	1
471	Keitlin Nicole	Garcia Centeno	\N	2019-01-10	2026-05-31 13:10:35.450326-05	2026-05-31 13:10:35.450326-05	Femenino	\N	1
473	Marcus	Santos	\N	2017-02-22	2026-05-31 13:14:24.687372-05	2026-05-31 13:14:24.687372-05	Masculino	\N	1
474	Luciana	Villachica	\N	2015-10-20	2026-05-31 13:46:37.58823-05	2026-05-31 13:46:37.58823-05	Femenino	\N	1
376	Camila Sofía	Lanuza Pineda	\N	2016-03-17	2026-05-24 07:11:23.655252-05	2026-06-28 08:57:53.128942-05	Femenino	\N	1
554	Dayana Victoria	Icabalzeta Garcia	\N	2015-05-07	2026-06-07 11:33:01.79719-05	2026-06-07 11:33:01.79719-05	Femenino	\N	1
555	Larissa Marcela	Delgado Alvarez	\N	2017-04-10	2026-06-07 11:44:52.208939-05	2026-06-07 11:44:52.208939-05	Femenino	\N	1
557	Sharon Issabella	Gutierrez Espino	\N	2020-02-03	2026-06-07 12:02:10.26794-05	2026-06-07 12:02:10.26794-05	Femenino	\N	1
559	Samuel	Perez Navaez	\N	2016-10-15	2026-06-07 12:04:55.094803-05	2026-06-07 12:04:55.094803-05	Masculino	\N	1
561	Isaac	Perez Narvaez	\N	2018-04-30	2026-06-07 12:06:32.598259-05	2026-06-07 12:06:32.598259-05	Masculino	\N	1
564	Andy Dariel	Maleaños Centeno	\N	2018-11-20	2026-06-07 12:25:39.569218-05	2026-06-07 12:25:39.569218-05	Masculino	\N	1
562	Victoria	Martinez	\N	2023-09-01	2026-06-07 12:22:30.203683-05	2026-06-07 12:28:09.98648-05	Femenino	\N	1
566	Camila Victoria	Noguera Garcia	\N	2016-07-22	2026-06-07 12:36:27.917784-05	2026-06-07 12:36:27.917784-05	Femenino	\N	1
569	Alejandro Alberto	Velasquez Guadamuz	\N	2019-09-05	2026-06-07 12:51:40.991938-05	2026-06-07 12:51:40.991938-05	Masculino	\N	1
571	Antonella	Ramirez	\N	2021-06-07	2026-06-07 12:54:55.955966-05	2026-06-07 12:54:55.955966-05	Femenino	\N	1
576	Evans Jorel	Saavedra Sanchez	\N	2020-10-20	2026-06-07 13:33:29.73068-05	2026-06-07 13:33:29.73068-05	Masculino	\N	1
578	William Uriel	Tapia Garcia	\N	2021-09-09	2026-06-14 12:00:03.552091-05	2026-06-14 12:00:03.552091-05	Masculino	\N	1
580	Dorian	Cortez	\N	2015-11-02	2026-06-14 12:03:26.466878-05	2026-06-14 12:03:26.466878-05	Masculino	\N	1
582	Daniel	Rayo Paguaga	\N	2016-07-09	2026-06-14 12:13:01.377036-05	2026-06-14 12:13:01.377036-05	Masculino	\N	1
584	Abril	Blanco	\N	2018-06-30	2026-06-14 12:21:43.797606-05	2026-06-14 12:21:43.797606-05	Femenino	\N	1
586	Jashary	Sanchez Moraga	\N	2017-01-15	2026-06-14 12:30:37.635901-05	2026-06-14 12:30:37.635901-05	Femenino	\N	1
589	Isa Marcela	Medina	\N	2024-07-31	2026-06-14 17:54:12.32804-05	2026-06-14 17:54:12.32804-05	Femenino	\N	1
591	Loisi	Simons	\N	2016-09-20	2026-06-14 17:59:25.816859-05	2026-06-14 17:59:25.816859-05	Femenino	\N	1
592	Ketsi	Simons	\N	2019-10-01	2026-06-14 18:00:39.538284-05	2026-06-14 18:00:39.538284-05	Femenino	\N	1
593	Itsamar Yakarelys	Zepeda Sevilla	\N	2016-11-06	2026-06-14 18:01:56.864293-05	2026-06-14 18:01:56.864293-05	Femenino	\N	1
595	Gianna Camila	Lopez Tijerino	\N	2021-07-09	2026-06-14 18:06:03.722968-05	2026-06-14 18:06:03.722968-05	Femenino	\N	1
598	Luciana Sofia	Martinez	\N	2018-04-26	2026-06-14 18:25:09.559248-05	2026-06-14 18:25:09.559248-05	Femenino	\N	1
600	Diana	Cano	\N	2019-12-03	2026-06-14 18:26:24.01369-05	2026-06-14 18:26:24.01369-05	Femenino	\N	1
602	Diego	Cano	\N	2017-05-24	2026-06-14 18:27:10.000387-05	2026-06-14 18:27:10.000387-05	Masculino	\N	1
603	Dominick Sebastian	Mendieta Torrez	\N	2017-05-01	2026-06-14 18:30:06.580277-05	2026-06-14 18:30:06.580277-05	Masculino	\N	1
605	Rosmery	Mendieta Torrez	\N	2014-05-16	2026-06-14 18:31:20.771616-05	2026-06-14 18:31:20.771616-05	Femenino	\N	1
606	Zoe	Cornavaca	\N	2020-02-09	2026-06-14 18:33:00.074302-05	2026-06-14 18:33:00.074302-05	Femenino	\N	1
608	Liam	Lira	\N	2021-08-29	2026-06-14 18:49:12.252577-05	2026-06-14 18:49:12.252577-05	Masculino	\N	1
610	Matias	Garcia	\N	2016-02-10	2026-06-14 18:59:16.61644-05	2026-06-14 18:59:16.61644-05	Masculino	\N	1
612	Vicente	Valdez	\N	2025-09-17	2026-06-14 19:04:25.491322-05	2026-06-14 19:04:25.491322-05	Masculino	\N	1
590	Maudy	Simons	\N	2014-02-11	2026-06-14 17:58:45.36134-05	2026-06-14 19:08:31.454724-05	Femenino	\N	1
624	Isabela Sofia	Castrillo Rivas	\N	2015-12-03	2026-06-14 19:19:48.236531-05	2026-06-14 19:19:48.236531-05	Femenino	\N	1
9	Elías Josué	Ullite Parales	\N	2016-04-24	2026-05-24 00:43:18.940558-05	2026-06-21 11:00:22.17756-05	Masculino	\N	1
573	Elias Daniel	Guadamuz Torres	\N	2024-12-04	2026-06-07 12:58:57.562914-05	2026-06-21 11:32:30.744782-05	Masculino	\N	1
575	Abdiel Santiago	Guadamuz Torres	\N	2022-08-25	2026-06-07 13:00:09.661666-05	2026-06-21 11:33:22.72549-05	Masculino	\N	1
754	Matias Eduardo	Padilla Acebedo	\N	2020-03-25	2026-06-21 12:01:32.669503-05	2026-06-21 12:01:32.669503-05	Masculino	\N	1
756	Valentina Stayci	Padilla Acebedo	\N	2013-06-28	2026-06-21 12:03:29.935341-05	2026-06-21 12:03:29.935341-05	Femenino	\N	1
758	Ivana Noelia	Zapata Ruiz	\N	2021-11-03	2026-06-21 12:10:09.620737-05	2026-06-21 12:10:09.620737-05	Femenino	\N	1
760	Arlerick Margarita	Somarriba Torres	\N	2018-03-04	2026-06-21 12:11:54.628752-05	2026-06-21 12:11:54.628752-05	Femenino	\N	1
762	Yeymy Monserrat	Navarrete	\N	2016-07-02	2026-06-21 12:22:32.706917-05	2026-06-21 12:22:32.706917-05	Femenino	\N	1
766	Mia Charlotte	Mojica Tinoco	\N	2019-04-01	2026-06-21 12:33:24.612625-05	2026-06-21 12:33:24.612625-05	Femenino	\N	1
770	Leana Sarai	Baldelomar Bustos	\N	2018-04-30	2026-06-21 12:45:33.773289-05	2026-06-21 12:45:33.773289-05	Femenino	\N	1
772	Vanean Sofia	Fornos Lacayo	\N	2016-01-15	2026-06-21 12:49:00.035234-05	2026-06-21 12:49:00.035234-05	Femenino	\N	1
774	Jose Adrian	Fornos Lacayo	\N	2020-01-20	2026-06-21 12:50:55.27059-05	2026-06-21 12:50:55.27059-05	Masculino	\N	1
776	Fernando Sebastian	Vasquez Idiaquez	\N	2021-01-15	2026-06-21 17:48:15.857719-05	2026-06-21 17:48:15.857719-05	Masculino	\N	1
780	Sara Nazareth	Hernandez Moreno	\N	2016-10-02	2026-06-21 17:50:33.210356-05	2026-06-21 17:50:33.210356-05	Femenino	\N	1
786	Jeniss Arleth	Sandoval Reyes	\N	2018-03-09	2026-06-21 18:00:32.220849-05	2026-06-21 18:00:32.220849-05	Femenino	\N	1
795	Santiago Alejandro	López Sánchez	\N	2020-01-27	2026-06-21 18:10:05.072295-05	2026-06-21 18:10:05.072295-05	Masculino	\N	1
799	Abigair Luciana	Roque Chavez	\N	2017-03-17	2026-06-21 18:14:37.209709-05	2026-06-21 18:14:37.209709-05	Femenino	\N	1
802	Jessia Arleth	Colomer Mejia	\N	2021-07-14	2026-06-21 18:18:15.487278-05	2026-06-21 18:18:15.487278-05	Femenino	\N	1
804	Celsa Aribeth	Urbina Avila	\N	2018-02-14	2026-06-21 18:19:01.474596-05	2026-06-21 18:19:01.474596-05	Femenino	\N	1
806	Freydelin Junieth	Altamirano Mejia	\N	2017-02-17	2026-06-21 18:20:12.154924-05	2026-06-21 18:20:12.154924-05	Femenino	\N	1
808	Eva Samantha	Urbina Avila	\N	2015-05-14	2026-06-21 18:22:26.089666-05	2026-06-21 18:22:26.089666-05	Femenino	\N	1
811	Humberto Caleb	López Gaitan	\N	2016-08-28	2026-06-21 18:33:37.92607-05	2026-06-21 18:33:37.92607-05	Masculino	\N	1
813	Abraham Nicolas	Lopez Gaitan	\N	2022-09-07	2026-06-21 18:35:59.390752-05	2026-06-21 18:35:59.390752-05	Masculino	\N	1
814	Adriel Asael	Obando Sanchez	\N	2015-10-09	2026-06-21 18:40:16.767125-05	2026-06-21 18:40:16.767125-05	Masculino	\N	1
816	Samara Noemi	Gutierrez Navarro	\N	2017-09-11	2026-06-21 18:43:35.281116-05	2026-06-21 18:43:35.281116-05	Femenino	\N	1
818	Luis Andres	Bravo Medina	\N	2017-11-16	2026-06-21 18:55:24.831268-05	2026-06-21 18:55:24.831268-05	Masculino	\N	1
820	Carlos Noel	Juarez Chavarria	\N	2014-10-21	2026-06-21 19:10:59.094076-05	2026-06-21 19:10:59.094076-05	Masculino	\N	1
782	Mateo Nayon	Hernandez	\N	2019-06-06	2026-06-21 17:51:59.619384-05	2026-06-22 13:11:35.827236-05	Masculino	\N	1
299	Misheyli Jamally	Washington James	\N	2017-06-09	2026-05-24 07:11:23.655252-05	2026-06-24 19:55:08.422958-05	Femenino	\N	1
833	Eva Sofía	Ramirez	\N	2023-05-24	2026-06-24 20:00:16.177438-05	2026-06-24 20:00:16.177438-05	Femenino	\N	1
829	Roderick José	Hernández López	\N	2016-01-12	2026-06-24 19:26:51.35648-05	2026-06-24 19:26:51.35648-05	Masculino	\N	1
840	Mateo Isaac	Jarquin Vallecillo	\N	2018-02-20	2026-06-28 08:44:56.504368-05	2026-06-28 08:44:56.504368-05	Masculino	\N	1
842	Rayib Sharif	Salem Garcia	\N	2015-10-09	2026-06-28 08:48:03.698615-05	2026-06-28 08:48:03.698615-05	Masculino	\N	1
844	Norsha Evane	Castillo Imgra	\N	2022-02-15	2026-06-28 08:55:46.60759-05	2026-06-28 08:55:46.60759-05	Femenino	\N	1
378	Mateo Mauricio	Lanuza Pineda	\N	2018-01-20	2026-05-24 07:11:23.655252-05	2026-06-28 08:58:24.37861-05	Masculino	\N	1
860	Leah Michelle	Cubillo Fonseca	\N	2018-10-25	2026-06-28 09:27:04.752848-05	2026-06-28 09:27:04.752848-05	Femenino	\N	1
862	Moisés David	Uriarte Mojica	\N	2015-10-17	2026-06-28 09:31:15.111129-05	2026-06-28 09:31:15.111129-05	Masculino	\N	1
864	Caleth Javier	Ocampo Vega	\N	2021-09-02	2026-06-28 09:39:42.169526-05	2026-06-28 09:39:42.169526-05	Masculino	\N	1
866	Emma Alexandra	Romero García	\N	2018-07-10	2026-06-28 09:56:46.157897-05	2026-06-28 09:56:46.157897-05	Femenino	\N	1
868	Adara Laila	Romero Medina	\N	2020-01-21	2026-06-28 10:10:23.289576-05	2026-06-28 10:10:23.289576-05	Femenino	\N	1
870	Evangeline Isabel	Guerrero Betanco	\N	2017-04-26	2026-06-28 10:16:29.579233-05	2026-06-28 10:18:04.675916-05	Femenino	\N	1
873	Marco Natanael	Murillo Estrada	\N	2018-01-19	2026-06-28 11:55:58.650662-05	2026-06-28 11:55:58.650662-05	Masculino	\N	1
875	Amauri José	Murillo Estrada	\N	2021-01-19	2026-06-28 11:56:53.762395-05	2026-06-28 11:56:53.762395-05	Masculino	\N	1
876	Yubam Yassir	Palacios Córdoba	\N	2014-07-31	2026-06-28 12:03:41.371291-05	2026-06-28 12:03:41.371291-05	Masculino	\N	1
887	Adriana	Escoto	\N	2018-10-03	2026-06-28 12:33:45.878362-05	2026-06-28 12:33:45.878362-05	Femenino	\N	1
891	Sofia Isabella	Torres Balmaceda	\N	2017-08-01	2026-06-28 18:01:51.086145-05	2026-06-28 18:01:51.086145-05	Femenino	\N	1
893	Jeremy Josue	Sevilla Centeno	\N	2014-01-10	2026-06-28 18:05:10.820535-05	2026-06-28 18:05:10.820535-05	Masculino	\N	1
895	Camila Fernanda	Gomez Urroz	\N	2018-02-15	2026-06-28 18:10:33.608193-05	2026-06-28 18:10:33.608193-05	Femenino	\N	1
898	Isayana Kristal	Clair Castillo	\N	2025-04-15	2026-06-28 18:21:13.681475-05	2026-06-28 18:21:13.681475-05	Femenino	\N	1
899	Lucas Adrián	Sambrana Guerrero	\N	2019-02-15	2026-06-28 18:32:22.469435-05	2026-06-28 18:32:22.469435-05	Masculino	\N	1
900	Abdel Thair	Chacon Narvaez	\N	2020-05-25	2026-06-28 18:34:41.106127-05	2026-06-28 18:34:41.106127-05	Masculino	\N	1
778	Lucas Liam	Hernandez Moreno	\N	2020-09-16	2026-06-21 17:50:18.7764-05	2026-06-28 18:48:12.778138-05	Masculino	\N	1
903	Daniela Sofía	Rodríguez Carrion	\N	2016-12-18	2026-06-28 18:59:00.167041-05	2026-06-28 18:59:00.167041-05	Femenino	\N	1
881	Miguel Alejandro	Lopez Carballo	\N	2019-06-21	2026-06-28 12:15:08.670973-05	2026-07-01 14:37:37.313486-05	Masculino	\N	1
878	Romina	Guevara	\N	2021-09-19	2026-06-28 12:04:56.987426-05	2026-07-01 14:38:01.805932-05	Femenino	\N	1
98	Ricardo	Espinoza	8871-2571	\N	2026-05-24 07:11:23.655252-05	2026-06-14 17:48:56.60285-05	\N	\N	1
68	Yajaira Suyen	Parrales Obando	5770-0139	\N	2026-05-24 07:11:23.655252-05	2026-06-26 16:00:21.033475-05	Femenino	0010502900010N	1
10	Yajaira	Parales	5770 0139	\N	2026-05-24 00:43:18.958789-05	2026-06-21 11:00:23.119861-05	\N	\N	1
145	Maria Libertad	Mendoza Toruño	+505 89857676	\N	2026-05-24 07:11:23.655252-05	2026-06-24 19:40:20.146066-05	\N	\N	1
468	Yang-Tse	Loaisiga	88888888	\N	2026-05-31 12:55:46.06566-05	2026-05-31 13:13:48.086275-05	\N	\N	1
377	Emily	Rosales	86776243	\N	2026-05-24 07:11:23.655252-05	2026-06-28 08:58:25.085327-05	\N	\N	1
764	Carlos	Francisco	8471-3930	\N	2026-06-21 12:30:19.706654-05	2026-06-21 12:30:19.706654-05	\N	\N	1
765	Fernando	José Martinez	8843-3422	\N	2026-06-21 12:32:14.156706-05	2026-06-21 12:32:14.156706-05	\N	\N	1
767	Danelia Del Carmen	Tinoco Torrez	7740-4493	\N	2026-06-21 12:33:25.287974-05	2026-06-21 12:33:25.287974-05	\N	\N	1
819	Sofia	Medina	8806-4071	\N	2026-06-21 18:55:25.542624-05	2026-06-21 18:55:25.542624-05	\N	\N	1
783	Martha	Ibara	8864-3083	\N	2026-06-21 17:52:00.308299-05	2026-06-22 13:11:36.557052-05	\N	\N	1
823	Pepito	Grande	7777-7777	\N	2026-06-22 18:22:13.036121-05	2026-06-22 18:22:13.036121-05	\N	\N	1
825	Pepe	Grande	7777-7777	\N	2026-06-22 18:42:43.14156-05	2026-06-22 18:42:43.14156-05	\N	\N	1
805	Evelyn De Los Angeles	Avila Arias	5842-3936	\N	2026-06-21 18:19:02.271057-05	2026-06-24 19:32:50.231837-05	\N	\N	1
235	Jose	Napoleon	+505 86546210	\N	2026-05-24 07:11:23.655252-05	2026-06-24 19:41:27.739541-05	\N	\N	1
830	Rodolfo José	Hernández López	7754-9522	\N	2026-06-24 19:26:52.069119-05	2026-06-24 19:26:52.069119-05	\N	\N	1
407	Adrian Joel	Medina Aguinaga	89136694	\N	2026-05-24 12:35:45.072681-05	2026-06-24 20:49:12.884837-05	Masculino	001-031179-0010C	1
831	Evelyn	Avila	5842-3936	\N	2026-06-24 19:27:16.080667-05	2026-06-24 21:26:37.960471-05	\N	\N	1
821	Noel Alexander	Juarez Prado	8984-5570	\N	2026-06-21 19:10:59.800747-05	2026-06-25 11:45:38.314616-05	Masculino	001-281082-0100G	1
834	Junior Evaristo	Ramírez Rojas	8774-5061	\N	2026-06-24 20:00:16.798068-05	2026-06-25 13:48:46.468875-05	\N	\N	1
841	Erick Vidal	Jarquin Gonzalez	8717-0585	\N	2026-06-28 08:44:57.291574-05	2026-06-28 08:44:57.291574-05	\N	\N	1
843	Verónica Isabel	García Barbosa	7726-5092	\N	2026-06-28 08:48:04.991316-05	2026-06-28 08:48:04.991316-05	\N	\N	1
845	Kiersha Kelisha	Imgra Bennett	8350-7484	\N	2026-06-28 08:55:47.248048-05	2026-06-28 08:55:47.248048-05	\N	\N	1
846	Celsa	Arsbeth Urbina Áviles	5842-3936	\N	2026-06-28 08:57:35.275002-05	2026-06-28 08:57:35.275002-05	\N	\N	1
901	Belén Isamar	Narvaez Parrales	5847-5728	\N	2026-06-28 18:34:41.819795-05	2026-06-28 18:34:41.819795-05	\N	\N	1
324	Xochitl Danelia	Munguia	8250-8991	\N	2026-05-24 07:11:23.655252-05	2026-06-28 18:35:15.61884-05	Femenino	001-091081-0108E	1
623	Joseph Leonardo	Flores Centeno	8488-8716	\N	2026-06-14 19:17:46.662326-05	2026-06-28 18:40:51.272211-05	\N	\N	1
902	Adriana	Moreno Lira	8757-0868	\N	2026-06-28 18:47:30.440021-05	2026-06-28 18:48:13.474314-05	\N	\N	1
904	Paula Urania	Carrión Hernández	8841-1383	\N	2026-06-28 18:59:00.820694-05	2026-06-28 18:59:00.820694-05	\N	\N	1
882	María Teresa	Carballo	8413-5668	\N	2026-06-28 12:15:09.388279-05	2026-07-01 14:37:38.031375-05	\N	\N	1
879	Dexter	Guevara	7607-0420	\N	2026-06-28 12:04:57.749301-05	2026-07-01 14:38:02.521498-05	\N	\N	1
932	Hshsjs	Sushhs	1111-1111	\N	2026-07-01 18:04:03.169383-05	2026-07-01 18:04:03.169383-05	\N	\N	1
\.


--
-- Data for Name: personas_direcciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personas_direcciones (id_direccion, id_persona, tipo_direccion, ciudad_departamento, municipio, distrito, barrio, direccion_exacta, es_principal, activo, creado_en, actualizado_en) FROM stdin;
4	491	Residencial	Managua	Managua	Distrito I	San Sebastián	De donde fue el cosep 1c al sur, 1c y 10 varas abajo\nManagua	t	t	2026-06-20 18:41:31.63198-05	\N
13	826	Residencial	Managua	Managua	Distrito I	San Sebastián	De donde fue el cosep 2 c al lago, 3c y 10 varas abajo	t	t	2026-06-23 20:28:52.165944-05	\N
14	827	Residencial	Managua	Managua	Distrito II	Miraflores	De los semáforos del Seminario 3C al Este, 1C al Norte, casa · 75	t	t	2026-06-24 09:56:13.776441-05	\N
15	832	Residencial	Managua 	Managua 	Distrito VI	Ciudad Sandino	Residencial santa edubije, calle 8, casa o 32	t	t	2026-06-24 19:39:02.229911-05	\N
16	407	Residencial	Managua 	Managua 	Distrito VI	Ciudad sandino	Residencial santa eduvige, calle 8, segunda etapa casa o32	t	t	2026-06-24 20:49:41.250976-05	\N
17	836	Residencial	Managua 	Managua 	Distrito II	Las brisas 	Las Brisas Casa O-45	t	t	2026-06-24 22:17:14.589349-05	\N
18	821	Residencial	Managua	Managua	Distrito II	Linda Vista Norte	estación 2 de policía,2c al norte, 2c al oeste,75 varas al norte, casa 108	t	t	2026-06-25 11:46:24.971984-05	\N
19	837	Residencial	Managua	Mateare	Mateare	Res. Ciudad el Doral 	Km 18. Carretera Nueva a León. Casa Y-64. Vieja Etapa	t	t	2026-06-25 15:47:27.033774-05	\N
20	68	Residencial	Managua 	Ciudad Sandino	Distrito X	Residencial San Andres	Residencial san Andrés casa SS10	t	t	2026-06-26 16:06:01.295307-05	\N
21	838	Residencial	Managua 	Managua 	Distrito II	Las brisas	Hsshjs	t	t	2026-06-27 14:52:17.594451-05	\N
22	839	Residencial	Managua 	Managua 	Distrito II	Reparto San Antonio	De los semáforos de la Asamblea Nacional 4 c abajo, 2 c al lago, 1 1/2 c arrival, Casa D39	t	t	2026-06-27 15:06:44.823779-05	\N
23	897	Residencial	Managua 	Managua 	I	Marta quezada	Calle 27 de mayo, del pali, 75 varas arriba	t	t	2026-06-28 18:23:40.472755-05	\N
24	324	Residencial	Managua 	Ciudad Sandino	Distrito X	Urb.Valle sta Rosa	Urb. Valle sta rosa, bloque A-3, casa #74.	t	t	2026-06-28 18:38:52.923218-05	\N
\.


--
-- Data for Name: redes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.redes (id_red, nombre, activo) FROM stdin;
1	AJH	t
2	JAH	t
3	Ruíz	t
\.


--
-- Data for Name: relaciones_personas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.relaciones_personas (id_persona_a, id_persona_b, tipo_relacion, datos_adicionales, fecha_inicio, fecha_fin, activo, creado_en, actualizado_en) FROM stdin;
\.


--
-- Data for Name: requisitos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requisitos (id_requisito, nombre, descripcion, tipo, id_rol_requerido, obligatorio, activo) FROM stdin;
1	Escuela de Nuevos Creyentes	\N	Formacion	\N	t	t
6	Bautizado en Agua	\N	Estado_Ministerial	\N	t	t
7	Pertenecer a Círculo de Amistad	\N	Estado_Ministerial	\N	t	t
5	Escuela de Obreros	\N	Formacion	\N	t	t
2	PEEH	\N	Formacion	\N	f	t
4	Escuela de Artes	\N	Formacion	\N	f	t
8	Retiro de sanidad y liberación		Estado_Ministerial	\N	t	t
3	BEE	\N	Formacion	\N	f	t
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id_rol, nombre_rol, nivel_jerarquico, activo) FROM stdin;
2	Maestro	2	t
3	Staff	3	t
4	Coordinador General	4	t
1	Colaborador	1	t
\.


--
-- Data for Name: solicitudes_historial_estado; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitudes_historial_estado (id_historial, id_solicitud, estado_anterior, estado_nuevo, fecha_cambio, id_cambiado_por, notas) FROM stdin;
4	7	Pendiente	Aprobado	2026-06-20 18:41:31.63198-05	1	\N
13	8	Pendiente	Aprobado	2026-06-23 20:28:52.165944-05	1	\N
14	9	Pendiente	Aprobado	2026-06-24 09:56:13.776441-05	1	\N
15	10	Pendiente	Aprobado	2026-06-24 19:39:02.229911-05	1	\N
16	11	Pendiente	Aprobado	2026-06-24 20:49:41.250976-05	1	\N
17	12	Pendiente	Aprobado	2026-06-24 22:17:14.589349-05	1	\N
18	13	Pendiente	Aprobado	2026-06-25 11:46:24.971984-05	1	\N
19	14	Pendiente	Aprobado	2026-06-25 15:47:27.033774-05	1	\N
20	15	Pendiente	Aprobado	2026-06-26 16:06:01.295307-05	1	\N
21	16	Pendiente	Aprobado	2026-06-27 14:52:17.594451-05	1	\N
22	17	Pendiente	Aprobado	2026-06-27 15:06:44.823779-05	1	\N
23	18	Pendiente	Aprobado	2026-06-28 18:23:40.472755-05	1	\N
24	19	Pendiente	Aprobado	2026-06-28 18:38:52.923218-05	1	\N
\.


--
-- Data for Name: solicitudes_personal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitudes_personal (id_solicitud, id_persona, id_rol_solicitado, id_gestionado_por, id_resuelto_por, estado, fecha_solicitud, fecha_resolucion, notas_staff, notas_coordinador, estado_civil, nombre_conyuge, tiene_hijos, numero_hijos, direccion, id_red, estado_liderazgo, id_mentor_propuesto, circulo_amistad, tiempo_iglesia_meses, ministerio_adicional, sexo_candidato, cedula_candidato, ocupacion_candidato, centro_laboral_candidato, nivel_academico_candidato, dir_ciudad, dir_municipio, dir_distrito, dir_barrio, dir_exacta, tel_casa, tel_oficina, tel_claro, tel_movistar, conyuge_ocupacion, conyuge_centro_laboral, bautizado_agua, fecha_bautismo, fecha_bautismo_precision, circulo_amistad_desde, circulo_amistad_precision, clases_biblicas_ninos, clases_biblicas_detalle, capacitacion_ensenanza, capacitacion_detalle, observaciones_espirituales_sol, estado_operativo_candidato, id_lider_propuesto, condicion_civil, lider_nombres, lider_apellidos, lider_telefono, asistio_otra_iglesia, nombre_otra_iglesia, denominacion_otra_iglesia) FROM stdin;
7	491	3	1	1	Aprobado	2026-06-20 18:35:39.115843-05	2026-06-20 18:41:31.63198-05	\N	\N	Soltero	\N	f	\N	\N	1	Lider	\N	\N	32	\N	Masculino	001-230804-1030S	Estudiante	-	Ingenieria	Managua	Managua	Distrito I	San Sebastián	De donde fue el cosep 1c al sur, 1c y 10 varas abajo\nManagua	\N	\N	8248-1440	\N	\N	\N	t	2016-01-01	Ano	2023-01-01	Ano	f	\N	f	\N	\N	Lider	\N	Ninguna	Ericka del Carmen 	Reyes	8252-7076	f	\N	\N
8	826	3	1	1	Aprobado	2026-06-23 19:19:03.188014-05	2026-06-23 20:28:52.165944-05	\N	\N	Soltero	\N	f	\N	\N	1	Lider_Apoyo	\N	\N	33	\N	Femenino	001-070904-1029N	Estudiante	-	Licenciatura	Managua	Managua	Distrito I	San Sebastián	De donde fue el cosep 2 c al lago, 3c y 10 varas abajo	\N	\N	\N	8188-8645	\N	\N	t	2016-01-01	Dia	2022-12-10	Dia	f	\N	f	\N	\N	Lider	\N	Ninguna	Ericka del Carmen 	Reyes	8252-7076	f	\N	\N
9	827	3	1	1	Aprobado	2026-06-24 09:55:35.459864-05	2026-06-24 09:56:13.776441-05	\N	\N	Soltero	\N	f	\N	\N	2	Lider	\N	\N	168	\N	Femenino	001-120377-0037K	-	-	Maestria	Managua	Managua	Distrito II	Miraflores	De los semáforos del Seminario 3C al Este, 1C al Norte, casa · 75	2266-6706	\N	8941-5405	\N	\N	\N	t	2013-09-28	Dia	2016-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Divorciado_1er_Matrimonio	Moisés y Antonia	Rámirez	8763-5949	f	\N	\N
10	832	3	1	1	Aprobado	2026-06-24 19:38:38.00608-05	2026-06-24 19:39:02.229911-05	\N	\N	Casado	Adrián Joel Medina Aguinaga	f	\N	\N	3	Lider	\N	\N	108	\N	Femenino	001-060988-0043H	Ama de casa 	-	Licenciatura	Managua 	Managua 	Distrito VI	Ciudad Sandino	Residencial santa edubije, calle 8, casa o 32	\N	\N	5058-6073	\N	Contador 	Curacao	t	2017-01-01	Dia	2017-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Primer_Matrimonio	Orlando	Burgos	8377-6875	t	Iglesia Maria Inmaculada	Católico
11	407	3	1	1	Aprobado	2026-06-24 20:49:14.366731-05	2026-06-24 20:49:41.250976-05	\N	\N	Soltero	\N	f	\N	\N	3	Lider	\N	\N	108	Ujieres 	Masculino	001-031179-0010C	\N	\N	\N	Managua 	Managua 	Distrito VI	Ciudad sandino	Residencial santa eduvige, calle 8, segunda etapa casa o32	\N	\N	89136694	\N	\N	\N	t	2017-01-01	Dia	2017-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Ninguna	Orlando 	Burgos	8377-6875	f	\N	\N
12	836	3	1	1	Aprobado	2026-06-24 22:16:51.075812-05	2026-06-24 22:17:14.589349-05	\N	\N	Soltero	\N	f	\N	\N	2	Lider	\N	\N	84	\N	Femenino	888-300187-0000S	Financiera 	ALMA	Maestria	Managua 	Managua 	Distrito II	Las brisas 	Las Brisas Casa O-45	2266-7575	\N	8630-7914	\N	\N	\N	t	2007-01-01	Dia	2017-01-01	Dia	t	Iglesia Cristiana Josué 	f	\N	\N	Lider	\N	Ninguna	Moisés y Antonia 	Ramírez	8837-6442	t	Iglesia Cristiana Josué 	Evangelico
13	821	3	1	1	Aprobado	2026-06-25 11:45:39.364193-05	2026-06-25 11:46:24.971984-05	\N	\N	Soltero	\N	t	2	\N	2	Lider	\N	\N	72	\N	Masculino	001-281082-0100G	Comerciante	Oficina en casa	Nivel_Tecnico	Managua	Managua	Distrito II	Linda Vista Norte	estación 2 de policía,2c al norte, 2c al oeste,75 varas al norte, casa 108	\N	\N	\N	8984-5570	\N	\N	t	1999-01-01	Dia	2020-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Divorciado_1er_Matrimonio	Moises y Antonia	Ramirez	8837-6462	f	\N	\N
14	837	4	1	1	Aprobado	2026-06-25 15:45:58.069-05	2026-06-25 15:47:27.033774-05	\N	\N	Casado	Moisés Abraham Ramírez Rocha	t	1	\N	2	Mentor	\N	\N	216	\N	Femenino	0011611820022C	Lic. Comunicación Social 	ALMA	Licenciatura	Managua	Mateare	Mateare	Res. Ciudad el Doral 	Km 18. Carretera Nueva a León. Casa Y-64. Vieja Etapa	\N	\N	\N	8763-5949	Gerente de Mantenimiento	Walmart	t	2008-01-01	Dia	2016-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Primer_Matrimonio	Moisés 	Torres	8808-9330	f	\N	\N
15	68	3	1	1	Aprobado	2026-06-26 16:00:21.897274-05	2026-06-26 16:06:01.295307-05	\N	\N	Casado	Aubrey Ullite	t	2	\N	2	Lider	\N	\N	144	\N	Femenino	0010502900010N	Administrador	Yang & Asociados	Ingenieria	Managua 	Ciudad Sandino	Distrito X	Residencial San Andres	Residencial san Andrés casa SS10	\N	\N	5770-0139	\N	Coordinador 	Sika s.a	t	2013-01-01	Dia	2014-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Primer_Matrimonio	Moises y Antonia 	Ramirez	8763-5949	f	\N	\N
16	838	3	1	1	Aprobado	2026-06-27 14:51:39.808278-05	2026-06-27 14:52:17.594451-05	\N	\N	Soltero	\N	f	\N	\N	1	Lider	\N	\N	168	HTV	Femenino	001-020104-1010E	Estudiante 	-	Licenciatura	Managua 	Managua 	Distrito II	Las brisas	Hsshjs	\N	\N	5780-3747	8553-1759	\N	\N	t	2017-12-09	Dia	2016-01-01	Dia	f	\N	f	\N	\N	Lider	\N	Ninguna	Roberto	Jarquín	7772-8003	f	\N	\N
17	839	3	1	1	Aprobado	2026-06-27 15:05:52.848377-05	2026-06-27 15:06:44.823779-05	\N	\N	Soltero	\N	t	1	\N	2	Lider_Apoyo	\N	\N	228	\N	Femenino	001-100386-00000R	Ejecutiva de ventas	Central Azucarera de Nicaragua S. A. 	Licenciatura	Managua 	Managua 	Distrito II	Reparto San Antonio	De los semáforos de la Asamblea Nacional 4 c abajo, 2 c al lago, 1 1/2 c arrival, Casa D39	\N	\N	\N	8991-7970	\N	\N	t	2008-01-01	Dia	2007-01-01	Dia	f	\N	t	Si	\N	Lider	\N	Divorciado_1er_Matrimonio	Samoko 	Moreno	8810-8348	f	\N	\N
18	897	1	491	1	Aprobado	2026-06-28 18:18:12.421456-05	2026-06-28 18:23:40.472755-05	\N	\N	Soltero	\N	f	\N	\N	1	Gap	\N	\N	203	\N	Femenino	001-240409-1043F	Estudiante	\N	Secundaria	Managua 	Managua 	I	Marta quezada	Calle 27 de mayo, del pali, 75 varas arriba	\N	\N	\N	7876-5128	\N	\N	t	2023-05-27	Dia	2021-01-01	Dia	f	\N	f	\N	\N	En_Formacion	\N	Ninguna	Gisselle Jamila 	Calero Hurtado	8252-3748	f	\N	\N
19	324	2	491	1	Aprobado	2026-06-28 18:35:16.870658-05	2026-06-28 18:38:52.923218-05	\N	\N	Casado	Ernesto José Artola Mayorga	t	3	\N	1	Gap	\N	\N	46	\N	Femenino	001-091081-0108E	Ama de casa	\N	Licenciatura	Managua 	Ciudad Sandino	Distrito X	Urb.Valle sta Rosa	Urb. Valle sta rosa, bloque A-3, casa #74.	\N	\N	8250-8991	\N	Jefe de ventas canal detalle	UNIMAR	t	2014-12-05	Dia	2022-01-01	Dia	f	\N	f	\N	\N	En_Formacion	\N	Primer_Matrimonio	Francisco y Nohemy	Sin apellido	8242-3344	t	Iglesia de Dios	Pentecostal
20	906	4	1	\N	Pendiente	2026-06-28 19:56:27.194058-05	\N	\N	\N	Casado	María Antonia Guevara Martínez	t	1	\N	2	Mentor	\N	\N	132	\N	Masculino	0012912860026U	Gerente de Mantenimiento	WALMART	Ingenieria	Managua	Mateare	\N	Res. Ciudad el Doral	Km 18. Carretera Nueva a León. Casa Y-64. Vieja Etapa	\N	\N	88376442	\N	Asistente	ALMA	t	2010-01-01	Ano	\N	\N	f	\N	f	\N	\N	Lider	\N	Primer_Matrimonio	Pastor Moisés	Torres	88089330	t	\N	\N
\.


--
-- Data for Name: solicitudes_requisitos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitudes_requisitos (id_solicitud, id_requisito, cumplido, fecha_cumplido, notas) FROM stdin;
7	1	t	2015-12-31	\N
7	5	t	2023-12-31	\N
7	6	t	2015-12-31	\N
7	7	t	2022-12-31	\N
7	8	t	2022-12-31	\N
8	1	t	2016-01-01	\N
8	5	t	2025-09-07	\N
8	6	t	2016-01-01	\N
8	7	t	2022-12-10	\N
8	8	t	2023-01-01	\N
9	1	t	2016-08-13	\N
9	5	t	2023-01-01	\N
9	6	t	2013-09-28	\N
9	7	t	2016-01-01	\N
9	8	t	2017-01-01	\N
10	1	t	2022-01-01	\N
10	5	t	2023-01-01	\N
10	6	t	2017-01-01	\N
10	7	t	2017-01-01	\N
10	8	t	2017-01-01	\N
11	1	t	2017-01-01	\N
11	5	t	2023-01-01	\N
11	6	t	2017-01-01	\N
11	7	t	2017-01-01	\N
11	8	t	2017-01-01	\N
12	1	t	2017-01-01	\N
12	5	t	2019-01-01	\N
12	6	t	2007-01-01	\N
12	7	t	2017-01-01	\N
12	8	t	2017-01-01	\N
13	1	t	2020-11-01	\N
13	5	t	2024-01-01	\N
13	6	t	1999-01-01	\N
13	7	t	2020-01-01	\N
13	8	t	2020-01-01	\N
14	1	t	2015-01-01	\N
14	5	t	2017-01-01	\N
14	6	t	2008-01-01	\N
14	7	t	2016-01-01	\N
14	8	t	2015-01-01	\N
15	1	t	2014-01-01	\N
15	5	t	2016-01-01	\N
15	6	t	2013-01-01	\N
15	7	t	2014-01-01	\N
15	8	t	2020-01-01	\N
16	1	t	2018-11-24	\N
16	5	t	2021-11-14	\N
16	6	t	2017-12-09	\N
16	7	t	2016-01-01	\N
16	8	t	2019-03-29	\N
17	1	t	2015-08-26	\N
17	5	t	2017-06-26	\N
17	6	t	2008-01-01	\N
17	7	t	2007-01-01	\N
17	8	t	2015-01-01	\N
18	1	t	2024-09-01	\N
18	5	f	\N	\N
18	6	t	2023-05-27	\N
18	7	t	2021-01-01	\N
18	8	f	\N	\N
19	1	t	2023-09-01	\N
19	6	t	2014-12-05	\N
19	7	t	2022-01-01	\N
19	8	t	2022-11-01	\N
20	1	f	\N	\N
20	6	f	\N	\N
20	7	f	\N	\N
20	5	f	\N	\N
20	2	f	\N	\N
20	3	f	\N	\N
20	4	f	\N	\N
20	8	f	\N	\N
\.


--
-- Data for Name: telefonos_personas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.telefonos_personas (id_telefono, id_persona, tipo, numero, tiene_whatsapp, es_principal, activo, creado_en, actualizado_en) FROM stdin;
1	1	Casa	0000-SEED-ADMIN	f	t	t	2026-05-31 00:14:41.630307-05	\N
3	74	Casa	+505 88839470	f	t	t	2026-05-31 00:14:41.630307-05	\N
4	76	Casa	+505 78457746	f	t	t	2026-05-31 00:14:41.630307-05	\N
6	80	Casa	77256303	f	t	t	2026-05-31 00:14:41.630307-05	\N
7	82	Casa	82391996	f	t	t	2026-05-31 00:14:41.630307-05	\N
8	86	Casa	77505554	f	t	t	2026-05-31 00:14:41.630307-05	\N
9	88	Casa	+505 88839470	f	t	t	2026-05-31 00:14:41.630307-05	\N
10	90	Casa	+505 88051997	f	t	t	2026-05-31 00:14:41.630307-05	\N
11	92	Casa	+505 75238404	f	t	t	2026-05-31 00:14:41.630307-05	\N
12	94	Casa	86157869	f	t	t	2026-05-31 00:14:41.630307-05	\N
13	96	Casa	+505 82511966	f	t	t	2026-05-31 00:14:41.630307-05	\N
14	102	Casa	+505 84291110	f	t	t	2026-05-31 00:14:41.630307-05	\N
15	104	Casa	88648369	f	t	t	2026-05-31 00:14:41.630307-05	\N
16	106	Casa	+505 84757772	f	t	t	2026-05-31 00:14:41.630307-05	\N
17	108	Casa	+505 89606386	f	t	t	2026-05-31 00:14:41.630307-05	\N
18	110	Casa	78126781	f	t	t	2026-05-31 00:14:41.630307-05	\N
19	114	Casa	+505 82168196	f	t	t	2026-05-31 00:14:41.630307-05	\N
20	116	Casa	+505 58464133	f	t	t	2026-05-31 00:14:41.630307-05	\N
21	118	Casa	+505 89051270	f	t	t	2026-05-31 00:14:41.630307-05	\N
22	120	Casa	88064944	f	t	t	2026-05-31 00:14:41.630307-05	\N
23	122	Casa	88536889	f	t	t	2026-05-31 00:14:41.630307-05	\N
24	124	Casa	+505 75240099	f	t	t	2026-05-31 00:14:41.630307-05	\N
25	126	Casa	+505 86471393	f	t	t	2026-05-31 00:14:41.630307-05	\N
26	130	Casa	+505 88649613	f	t	t	2026-05-31 00:14:41.630307-05	\N
27	132	Casa	+505 77524589	f	t	t	2026-05-31 00:14:41.630307-05	\N
28	134	Casa	83577798	f	t	t	2026-05-31 00:14:41.630307-05	\N
29	136	Casa	+505 83268829	f	t	t	2026-05-31 00:14:41.630307-05	\N
30	138	Casa	85775181	f	t	t	2026-05-31 00:14:41.630307-05	\N
31	140	Casa	+505 84291110	f	t	t	2026-05-31 00:14:41.630307-05	\N
32	142	Casa	82492189	f	t	t	2026-05-31 00:14:41.630307-05	\N
34	151	Casa	+505 88699717	f	t	t	2026-05-31 00:14:41.630307-05	\N
35	153	Casa	83795406	f	t	t	2026-05-31 00:14:41.630307-05	\N
36	155	Casa	81687109	f	t	t	2026-05-31 00:14:41.630307-05	\N
37	157	Casa	81264606	f	t	t	2026-05-31 00:14:41.630307-05	\N
38	159	Casa	84492417	f	t	t	2026-05-31 00:14:41.630307-05	\N
39	161	Casa	88567628	f	t	t	2026-05-31 00:14:41.630307-05	\N
40	163	Casa	+505 76776403	f	t	t	2026-05-31 00:14:41.630307-05	\N
41	100	Casa	+505 76515167	f	t	t	2026-05-31 00:14:41.630307-05	\N
42	70	Casa	+505 58772737	f	t	t	2026-05-31 00:14:41.630307-05	\N
43	112	Casa	81264606	f	t	t	2026-05-31 00:14:41.630307-05	\N
44	165	Casa	89606386	f	t	t	2026-05-31 00:14:41.630307-05	\N
45	167	Casa	89990450	f	t	t	2026-05-31 00:14:41.630307-05	\N
46	169	Casa	+505 89215231	f	t	t	2026-05-31 00:14:41.630307-05	\N
47	171	Casa	75071336	f	t	t	2026-05-31 00:14:41.630307-05	\N
48	173	Casa	+505 81315889	f	t	t	2026-05-31 00:14:41.630307-05	\N
49	177	Casa	77678109	f	t	t	2026-05-31 00:14:41.630307-05	\N
50	179	Casa	+505 86203552	f	t	t	2026-05-31 00:14:41.630307-05	\N
51	181	Casa	+505 87881957	f	t	t	2026-05-31 00:14:41.630307-05	\N
52	183	Casa	+505 86131774	f	t	t	2026-05-31 00:14:41.630307-05	\N
53	185	Casa	+505 86107962	f	t	t	2026-05-31 00:14:41.630307-05	\N
54	187	Casa	84909167	f	t	t	2026-05-31 00:14:41.630307-05	\N
55	189	Casa	84909167	f	t	t	2026-05-31 00:14:41.630307-05	\N
56	191	Casa	+505 87017799	f	t	t	2026-05-31 00:14:41.630307-05	\N
57	193	Casa	58063773	f	t	t	2026-05-31 00:14:41.630307-05	\N
59	199	Casa	+505 88847545	f	t	t	2026-05-31 00:14:41.630307-05	\N
60	206	Casa	+505 84274227	f	t	t	2026-05-31 00:14:41.630307-05	\N
61	209	Casa	86546210	f	t	t	2026-05-31 00:14:41.630307-05	\N
62	211	Casa	87063020	f	t	t	2026-05-31 00:14:41.630307-05	\N
63	213	Casa	+505 84136190	f	t	t	2026-05-31 00:14:41.630307-05	\N
64	215	Casa	86469329	f	t	t	2026-05-31 00:14:41.630307-05	\N
65	217	Casa	+505 86244558	f	t	t	2026-05-31 00:14:41.630307-05	\N
67	221	Casa	+505 89722717	f	t	t	2026-05-31 00:14:41.630307-05	\N
68	224	Casa	89773757	f	t	t	2026-05-31 00:14:41.630307-05	\N
69	229	Casa	84503825	f	t	t	2026-05-31 00:14:41.630307-05	\N
70	233	Casa	+505 58649209	f	t	t	2026-05-31 00:14:41.630307-05	\N
72	237	Casa	89759692	f	t	t	2026-05-31 00:14:41.630307-05	\N
73	239	Casa	+505 85808644	f	t	t	2026-05-31 00:14:41.630307-05	\N
74	241	Casa	87736250	f	t	t	2026-05-31 00:14:41.630307-05	\N
75	244	Casa	82527187	f	t	t	2026-05-31 00:14:41.630307-05	\N
76	246	Casa	+505 83268829	f	t	t	2026-05-31 00:14:41.630307-05	\N
77	248	Casa	+505 76515167	f	t	t	2026-05-31 00:14:41.630307-05	\N
78	251	Casa	84423454	f	t	t	2026-05-31 00:14:41.630307-05	\N
79	253	Casa	+505 82854884	f	t	t	2026-05-31 00:14:41.630307-05	\N
80	262	Casa	75238009	f	t	t	2026-05-31 00:14:41.630307-05	\N
81	265	Casa	+505 81412825	f	t	t	2026-05-31 00:14:41.630307-05	\N
82	267	Casa	+505 75475604	f	t	t	2026-05-31 00:14:41.630307-05	\N
83	175	Casa	87362946	f	t	t	2026-05-31 00:14:41.630307-05	\N
84	269	Casa	+505 58745739	f	t	t	2026-05-31 00:14:41.630307-05	\N
85	274	Casa	+505 81442442	f	t	t	2026-05-31 00:14:41.630307-05	\N
86	276	Casa	+505 81687109	f	t	t	2026-05-31 00:14:41.630307-05	\N
87	278	Casa	84574799	f	t	t	2026-05-31 00:14:41.630307-05	\N
88	283	Casa	86890094	f	t	t	2026-05-31 00:14:41.630307-05	\N
89	285	Casa	58615187	f	t	t	2026-05-31 00:14:41.630307-05	\N
90	288	Casa	77785017	f	t	t	2026-05-31 00:14:41.630307-05	\N
91	291	Casa	86469329	f	t	t	2026-05-31 00:14:41.630307-05	\N
92	293	Casa	+505 77349004	f	t	t	2026-05-31 00:14:41.630307-05	\N
93	295	Casa	76747720	f	t	t	2026-05-31 00:14:41.630307-05	\N
94	303	Casa	+505 76456542	f	t	t	2026-05-31 00:14:41.630307-05	\N
96	309	Casa	+505 57921097	f	t	t	2026-05-31 00:14:41.630307-05	\N
97	311	Casa	+505 88991460	f	t	t	2026-05-31 00:14:41.630307-05	\N
98	313	Casa	86950601	f	t	t	2026-05-31 00:14:41.630307-05	\N
99	315	Casa	88535322	f	t	t	2026-05-31 00:14:41.630307-05	\N
100	321	Casa	88677182	f	t	t	2026-05-31 00:14:41.630307-05	\N
101	327	Casa	89973500	f	t	t	2026-05-31 00:14:41.630307-05	\N
102	331	Casa	+505 81601890	f	t	t	2026-05-31 00:14:41.630307-05	\N
103	333	Casa	+505 87967935	f	t	t	2026-05-31 00:14:41.630307-05	\N
104	335	Casa	+505 87362946	f	t	t	2026-05-31 00:14:41.630307-05	\N
105	338	Casa	+505 89903862	f	t	t	2026-05-31 00:14:41.630307-05	\N
106	341	Casa	83314568	f	t	t	2026-05-31 00:14:41.630307-05	\N
107	344	Casa	+505 88991337	f	t	t	2026-05-31 00:14:41.630307-05	\N
108	346	Casa	85249503	f	t	t	2026-05-31 00:14:41.630307-05	\N
109	352	Casa	84789402	f	t	t	2026-05-31 00:14:41.630307-05	\N
110	354	Casa	+505 55035037	f	t	t	2026-05-31 00:14:41.630307-05	\N
111	357	Casa	87643244	f	t	t	2026-05-31 00:14:41.630307-05	\N
112	359	Casa	86562802	f	t	t	2026-05-31 00:14:41.630307-05	\N
5	78	Casa	85731311	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-14 14:04:10.381877-05
95	306	Casa	+505 85925109	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-14 18:55:29.022924-05
113	362	Casa	+505 86546210	f	t	t	2026-05-31 00:14:41.630307-05	\N
114	366	Casa	83569916	f	t	t	2026-05-31 00:14:41.630307-05	\N
71	235	Casa	+505 86546210	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-24 19:41:27.859684-05
66	219	Casa	57418415	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-24 19:55:31.665194-05
115	369	Casa	77003879	f	t	t	2026-05-31 00:14:41.630307-05	\N
116	371	Casa	57648021	f	t	t	2026-05-31 00:14:41.630307-05	\N
117	373	Casa	83787633	f	t	t	2026-05-31 00:14:41.630307-05	\N
119	380	Casa	89857676	f	t	t	2026-05-31 00:14:41.630307-05	\N
120	382	Casa	89066328	f	t	t	2026-05-31 00:14:41.630307-05	\N
121	384	Casa	86217978	f	t	t	2026-05-31 00:14:41.630307-05	\N
122	389	Casa	76954542	f	t	t	2026-05-31 00:14:41.630307-05	\N
123	398	Casa	86284191	f	t	t	2026-05-31 00:14:41.630307-05	\N
124	400	Casa	86529095	f	t	t	2026-05-31 00:14:41.630307-05	\N
125	403	Casa	89111257	f	t	t	2026-05-31 00:14:41.630307-05	\N
126	405	Casa	83787633	f	t	t	2026-05-31 00:14:41.630307-05	\N
127	260	Casa	+505 85925109	f	t	t	2026-05-31 00:14:41.630307-05	\N
129	409	Casa	58633842	f	t	t	2026-05-31 00:14:41.630307-05	\N
130	412	Casa	88988356	f	t	t	2026-05-31 00:14:41.630307-05	\N
131	414	Casa	77777777	f	t	t	2026-05-31 00:14:41.630307-05	\N
132	415	Casa	77777777	f	t	t	2026-05-31 00:14:41.630307-05	\N
133	466	Casa	83806948	f	t	t	2026-05-31 13:08:14.909935-05	\N
134	472	Casa	88455949	f	t	t	2026-05-31 13:10:35.50308-05	\N
135	468	Casa	88888888	f	t	t	2026-05-31 13:13:48.118221-05	\N
136	475	Casa	87725460	f	t	t	2026-05-31 13:46:37.610622-05	2026-05-31 14:04:01.098818-05
137	483	Otro	7819-3646	f	t	t	2026-06-07 06:18:28.049128-05	\N
139	553	Casa	8685-0777	f	t	t	2026-06-07 11:29:55.462076-05	\N
140	556	Casa	8952-9147	f	t	t	2026-06-07 11:44:52.269398-05	\N
141	558	Casa	7762-8507	f	t	t	2026-06-07 12:02:10.326648-05	\N
142	560	Casa	7634-4037	f	t	t	2026-06-07 12:04:55.154192-05	\N
144	565	Casa	8793-3491	f	t	t	2026-06-07 12:25:39.628612-05	\N
145	567	Casa	7557-7363	f	t	t	2026-06-07 12:36:27.977241-05	\N
143	563	Casa	5726-2595	f	t	t	2026-06-07 12:22:30.259792-05	2026-06-07 12:42:39.072121-05
146	568	Casa	8607-3718	f	t	t	2026-06-07 12:47:46.469745-05	\N
147	570	Casa	8376-9983	f	t	t	2026-06-07 12:51:41.057908-05	\N
148	572	Casa	8763-5949	f	t	t	2026-06-07 12:54:56.023347-05	\N
150	577	Casa	8919-6671	f	t	t	2026-06-07 13:33:29.811323-05	\N
58	196	Casa	+505 86131774	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-07 19:46:02.557017-05
152	579	Casa	7726-5092	f	t	t	2026-06-14 12:00:03.59175-05	\N
153	581	Casa	7878-3825	f	t	t	2026-06-14 12:03:26.517075-05	\N
154	583	Casa	8861-2136	f	t	t	2026-06-14 12:13:01.431986-05	\N
155	585	Casa	8880-9275	f	t	t	2026-06-14 12:21:43.84578-05	\N
156	587	Casa	8457-4799	f	t	t	2026-06-14 12:30:37.675527-05	\N
157	98	Casa	8871-2571	f	t	t	2026-06-14 17:48:56.643839-05	\N
158	588	Casa	8535-6524	f	t	t	2026-06-14 17:53:24.744463-05	\N
159	594	Casa	8953-4198	f	t	t	2026-06-14 18:01:56.915244-05	\N
160	596	Casa	8353-2555	f	t	t	2026-06-14 18:06:03.775154-05	\N
161	597	Casa	5756-3629	f	t	t	2026-06-14 18:10:07.873625-05	\N
162	599	Casa	8786-0012	f	t	t	2026-06-14 18:25:09.613178-05	\N
163	601	Casa	7663-7310	f	t	t	2026-06-14 18:26:24.062193-05	\N
164	604	Casa	8121-1110	f	t	t	2026-06-14 18:30:06.642051-05	\N
165	607	Casa	8734-4822	f	t	t	2026-06-14 18:33:00.123687-05	\N
166	460	Casa	7874-6435	f	t	t	2026-06-14 18:43:17.672891-05	\N
167	609	Casa	8377-5897	f	t	t	2026-06-14 18:49:12.309613-05	\N
118	375	Casa	ESTHER LIDER	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-14 18:55:19.68743-05
168	611	Casa	8975-7198	f	t	t	2026-06-14 18:59:16.666474-05	\N
169	613	Casa	8884-3267	f	t	t	2026-06-14 19:04:25.538868-05	\N
171	625	Casa	8674-8331	f	t	t	2026-06-14 19:19:48.282931-05	\N
172	692	Casa	7777-7777	f	t	t	2026-06-20 12:15:26.587427-05	2026-06-20 12:17:34.675258-05
138	491	Otro	8248-1440	f	t	t	2026-06-07 06:48:53.851796-05	2026-06-20 18:10:45.006626-05
177	742	Casa	1111-1111	f	t	t	2026-06-21 00:19:26.62541-05	\N
2	10	Casa	5770 0139	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-21 11:00:23.25812-05
214	809	Casa	8701-7799	f	t	t	2026-06-21 18:23:04.136912-05	\N
149	574	Casa	7896-6362	f	t	t	2026-06-07 12:58:57.583214-05	2026-06-21 11:33:23.688208-05
178	751	Casa	8577-3856	f	t	t	2026-06-21 11:54:14.698848-05	\N
179	752	Casa	8779-1799	f	t	t	2026-06-21 11:58:37.173703-05	\N
180	753	Casa	1111-1111	f	t	t	2026-06-21 11:59:09.956827-05	\N
181	755	Casa	8380-5627	f	t	t	2026-06-21 12:01:33.547292-05	\N
182	757	Casa	8160-6283	f	t	t	2026-06-21 12:04:11.100598-05	\N
183	759	Casa	8787-9021	f	t	t	2026-06-21 12:10:10.421834-05	\N
184	761	Casa	8983-4386	f	t	t	2026-06-21 12:11:55.577773-05	\N
185	763	Casa	8780-2100	f	t	t	2026-06-21 12:22:33.563065-05	\N
186	764	Casa	8471-3930	f	t	t	2026-06-21 12:30:19.706654-05	\N
187	765	Casa	8843-3422	f	t	t	2026-06-21 12:32:14.156706-05	\N
188	767	Casa	7740-4493	f	t	t	2026-06-21 12:33:25.287974-05	\N
189	769	Casa	7546-7616	f	t	t	2026-06-21 12:39:18.588056-05	\N
190	771	Casa	5	f	t	t	2026-06-21 12:45:34.636024-05	\N
191	773	Casa	5701-1178	f	t	t	2026-06-21 12:49:00.735743-05	\N
192	777	Casa	8855-2042	f	t	t	2026-06-21 17:48:16.60498-05	\N
193	779	Casa	8865-9079	f	t	t	2026-06-21 17:50:19.490745-05	\N
194	781	Casa	8757-0868	f	t	t	2026-06-21 17:50:33.927716-05	\N
196	784	Casa	8982-0497	f	t	t	2026-06-21 17:54:47.351237-05	\N
197	785	Casa	8367-0950	f	t	t	2026-06-21 17:57:29.918734-05	\N
198	787	Casa	5725-4978	f	t	t	2026-06-21 18:00:32.97077-05	\N
199	788	Casa	8624-4558	f	t	t	2026-06-21 18:01:43.708424-05	\N
200	789	Casa	8624-4558	f	t	t	2026-06-21 18:02:25.357259-05	\N
201	790	Casa	8160-1890	f	t	t	2026-06-21 18:03:30.932464-05	\N
202	791	Casa	5757-0980	f	t	t	2026-06-21 18:04:21.303514-05	\N
203	792	Casa	8592-5109	f	t	t	2026-06-21 18:05:15.99534-05	\N
204	793	Casa	8592-5109	f	t	t	2026-06-21 18:06:21.120428-05	\N
205	794	Casa	8592-5109	f	t	t	2026-06-21 18:07:02.417384-05	\N
206	796	Casa	8506-2737	f	t	t	2026-06-21 18:10:05.899266-05	\N
207	797	Casa	8470-0015	f	t	t	2026-06-21 18:10:59.463806-05	\N
208	798	Casa	8798-9787	f	t	t	2026-06-21 18:11:52.575138-05	\N
209	800	Casa	5726-8282	f	t	t	2026-06-21 18:14:38.418556-05	\N
210	801	Casa	5726-8282	f	t	t	2026-06-21 18:17:05.562935-05	\N
211	803	Casa	8219-0045	f	t	t	2026-06-21 18:18:16.219713-05	\N
213	807	Casa	8958-8200	f	t	t	2026-06-21 18:21:32.617471-05	\N
215	810	Casa	8701-7799	f	t	t	2026-06-21 18:23:44.711266-05	\N
216	812	Casa	8362-2408	f	t	t	2026-06-21 18:33:38.668499-05	\N
217	815	Casa	8295-1750	f	t	t	2026-06-21 18:40:17.580839-05	\N
218	817	Casa	8557-1515	f	t	t	2026-06-21 18:43:36.537928-05	\N
219	819	Casa	8806-4071	f	t	t	2026-06-21 18:55:25.542624-05	\N
195	783	Casa	8864-3083	f	t	t	2026-06-21 17:52:00.308299-05	2026-06-22 13:11:36.69934-05
222	823	Casa	7777-7777	f	t	t	2026-06-22 18:22:13.036121-05	\N
223	825	Casa	7777-7777	f	t	t	2026-06-22 18:42:43.14156-05	\N
232	826	Movistar	8188-8645	f	t	t	2026-06-23 20:28:52.165944-05	\N
233	827	Otro	8941-5405	f	t	t	2026-06-24 09:55:34.862954-05	\N
235	827	Claro	8941-5405	f	f	t	2026-06-24 09:56:13.776441-05	\N
170	623	Casa	8488-8716	f	t	t	2026-06-14 19:17:46.662326-05	2026-06-28 18:40:51.390799-05
221	377	Casa	86776243	f	t	t	2026-06-22 13:32:02.03512-05	2026-06-28 08:58:25.202871-05
236	830	Casa	7754-9522	f	t	t	2026-06-24 19:26:52.069119-05	\N
212	805	Casa	5842-3936	f	t	t	2026-06-21 18:19:02.271057-05	2026-06-24 19:32:50.356582-05
238	832	Otro	5058-6073	f	t	t	2026-06-24 19:38:37.386267-05	\N
33	145	Casa	+505 89857676	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-24 19:40:20.269771-05
128	407	Casa	89136694	f	t	t	2026-05-31 00:14:41.630307-05	2026-06-24 20:49:12.884837-05
237	831	Casa	5842-3936	f	t	t	2026-06-24 19:27:16.080667-05	2026-06-24 21:26:38.110035-05
242	836	Otro	8630-7914	f	t	t	2026-06-24 22:16:50.35645-05	\N
244	836	Claro	8630-7914	f	f	t	2026-06-24 22:17:14.589349-05	\N
220	821	Casa	8984-5570	f	t	t	2026-06-21 19:10:59.800747-05	2026-06-25 11:45:38.314616-05
240	834	Casa	8774-5061	f	t	t	2026-06-24 20:00:16.798068-05	2026-06-25 13:48:46.617522-05
246	837	Movistar	8763-5949	f	t	t	2026-06-25 15:47:27.033774-05	\N
247	68	Casa	5770-0139	f	t	t	2026-06-26 15:52:37.546106-05	2026-06-26 16:00:21.033475-05
249	838	Otro	5780-3747	f	t	t	2026-06-27 14:51:39.124938-05	\N
251	838	Movistar	8553-1759	f	f	t	2026-06-27 14:52:17.594451-05	\N
252	839	Movistar	8991-7970	f	t	t	2026-06-27 15:06:44.823779-05	\N
253	841	Casa	8717-0585	f	t	t	2026-06-28 08:44:57.291574-05	\N
254	843	Casa	7726-5092	f	t	t	2026-06-28 08:48:04.991316-05	\N
255	845	Casa	8350-7484	f	t	t	2026-06-28 08:55:47.248048-05	\N
256	846	Casa	5842-3936	f	t	t	2026-06-28 08:57:35.275002-05	\N
257	848	Casa	8587-4125	f	t	t	2026-06-28 09:00:21.374304-05	2026-06-28 09:00:44.818984-05
258	850	Casa	8681-1843	f	t	t	2026-06-28 09:04:35.715441-05	\N
259	852	Casa	5867-5450	f	t	t	2026-06-28 09:05:47.733636-05	\N
260	855	Casa	8905-1270	f	t	t	2026-06-28 09:08:02.551432-05	\N
261	857	Casa	8939-4727	f	t	t	2026-06-28 09:12:12.567879-05	2026-06-28 09:15:39.143633-05
262	859	Casa	7723-0966	f	t	t	2026-06-28 09:25:43.560666-05	\N
263	861	Casa	8888-8888	f	t	t	2026-06-28 09:27:05.411247-05	\N
264	863	Casa	8159-0109	f	t	t	2026-06-28 09:31:15.787909-05	\N
265	865	Casa	8964-3140	f	t	t	2026-06-28 09:39:43.787756-05	\N
266	867	Casa	7789-6025	f	t	t	2026-06-28 09:56:46.826633-05	\N
267	869	Casa	5760-9929	f	t	t	2026-06-28 10:10:23.981241-05	\N
268	871	Casa	5777-6025	f	t	t	2026-06-28 10:16:30.251832-05	2026-06-28 10:18:05.540146-05
269	872	Casa	8576-4060	f	t	t	2026-06-28 11:54:29.383131-05	\N
270	874	Casa	7864-3413	f	t	t	2026-06-28 11:55:59.312651-05	\N
271	877	Casa	8664-5564	f	t	t	2026-06-28 12:03:42.062899-05	\N
273	880	Casa	7667-0359	f	t	t	2026-06-28 12:07:30.314907-05	\N
275	884	Casa	8263-8506	f	t	t	2026-06-28 12:18:03.361994-05	\N
276	885	Casa	8685-1172	f	t	t	2026-06-28 12:19:57.873166-05	\N
277	886	Casa	0000-0000	f	t	t	2026-06-28 12:26:47.028709-05	\N
278	888	Casa	8705-9512	f	t	t	2026-06-28 12:33:46.898024-05	\N
279	889	Casa	8734-4822	f	t	t	2026-06-28 12:55:10.411524-05	\N
280	890	Casa	8884-9098	f	t	t	2026-06-28 17:41:50.737267-05	\N
281	892	Casa	8899-3546	f	t	t	2026-06-28 18:01:51.779453-05	\N
282	894	Casa	8679-1995	f	t	t	2026-06-28 18:05:11.515877-05	\N
283	896	Casa	8236-0987	f	t	t	2026-06-28 18:10:34.285373-05	\N
285	348	Casa	8796-7935	f	t	t	2026-06-28 18:20:22.365232-05	\N
286	897	Movistar	7876-5128	f	t	t	2026-06-28 18:23:40.472755-05	\N
287	901	Casa	5847-5728	f	t	t	2026-06-28 18:34:41.819795-05	\N
284	324	Casa	8250-8991	f	t	t	2026-06-28 18:11:33.736815-05	2026-06-28 18:35:15.61884-05
289	902	Casa	8757-0868	f	t	t	2026-06-28 18:47:30.440021-05	2026-06-28 18:48:13.592787-05
290	904	Casa	8841-1383	f	t	t	2026-06-28 18:59:00.820694-05	\N
291	906	Otro	88376442	f	t	t	2026-06-28 19:56:11.742703-05	\N
292	908	Casa	8888-8888	f	t	t	2026-07-01 13:57:06.186619-05	\N
274	882	Casa	8413-5668	f	t	t	2026-06-28 12:15:09.388279-05	2026-07-01 14:37:38.181797-05
272	879	Casa	7607-0420	f	t	t	2026-06-28 12:04:57.749301-05	2026-07-01 14:38:02.665592-05
293	910	Casa	1111-1111	f	t	t	2026-07-01 15:50:47.743097-05	\N
294	912	Casa	1111-1111	f	t	t	2026-07-01 15:53:02.877749-05	\N
295	914	Casa	1111-1111	f	t	t	2026-07-01 15:54:31.258731-05	\N
296	916	Casa	1111-1111	f	t	t	2026-07-01 16:01:57.542784-05	\N
297	918	Casa	1111-1111	f	t	t	2026-07-01 17:14:25.464721-05	\N
298	920	Casa	7777-7777	f	t	t	2026-07-01 17:38:03.778535-05	\N
299	922	Casa	7777-7777	f	t	t	2026-07-01 17:42:37.010242-05	\N
300	924	Casa	1111-1111	f	t	t	2026-07-01 17:44:59.942577-05	\N
301	926	Casa	1111-1111	f	t	t	2026-07-01 17:46:15.224599-05	\N
302	928	Casa	1111-1111	f	t	t	2026-07-01 17:56:48.077005-05	\N
303	930	Casa	1111-1111	f	t	t	2026-07-01 18:00:07.0422-05	\N
304	932	Casa	1111-1111	f	t	t	2026-07-01 18:04:03.169383-05	\N
305	933	Casa	7640-1901	f	t	t	2026-07-01 19:21:53.699151-05	\N
306	935	Casa	8283-3230	f	t	t	2026-07-01 19:34:16.042341-05	\N
307	937	Casa	7657-9001	f	t	t	2026-07-01 19:41:18.436039-05	\N
308	938	Casa	8282-0862	f	t	t	2026-07-01 19:43:40.883708-05	\N
309	940	Casa	8450-1615	f	t	t	2026-07-03 12:12:19.218175-05	\N
\.


--
-- Data for Name: turnos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.turnos (id_turno, nombre, dia_semana, hora_inicio, activo) FROM stdin;
2	Domingo_8am	0	08:00:00	t
3	Domingo_11am	0	11:00:00	t
4	Domingo_5pm	0	17:00:00	t
1	Miercoles	3	18:30:00	t
\.


--
-- Data for Name: tutores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutores (id_persona, tipo_tutor) FROM stdin;
72	Padre/Madre
74	Padre/Madre
76	Padre/Madre
80	Padre/Madre
82	Padre/Madre
84	Padre/Madre
86	Padre/Madre
88	Padre/Madre
90	Padre/Madre
92	Padre/Madre
94	Padre/Madre
96	Padre/Madre
102	Padre/Madre
104	Padre/Madre
106	Padre/Madre
108	Padre/Madre
110	Padre/Madre
114	Padre/Madre
116	Padre/Madre
118	Padre/Madre
120	Padre/Madre
122	Padre/Madre
124	Padre/Madre
126	Padre/Madre
128	Padre/Madre
130	Padre/Madre
132	Padre/Madre
134	Padre/Madre
136	Padre/Madre
138	Padre/Madre
140	Padre/Madre
142	Padre/Madre
147	Padre/Madre
149	Padre/Madre
151	Padre/Madre
153	Padre/Madre
155	Padre/Madre
157	Padre/Madre
159	Padre/Madre
161	Padre/Madre
163	Padre/Madre
165	Padre/Madre
167	Padre/Madre
169	Padre/Madre
171	Padre/Madre
173	Padre/Madre
177	Padre/Madre
179	Padre/Madre
181	Padre/Madre
183	Padre/Madre
185	Padre/Madre
187	Padre/Madre
189	Padre/Madre
191	Padre/Madre
193	Padre/Madre
199	Padre/Madre
201	Padre/Madre
204	Padre/Madre
206	Padre/Madre
209	Padre/Madre
211	Padre/Madre
213	Padre/Madre
215	Padre/Madre
217	Padre/Madre
224	Padre/Madre
229	Padre/Madre
231	Padre/Madre
233	Padre/Madre
237	Padre/Madre
239	Padre/Madre
241	Padre/Madre
244	Padre/Madre
246	Padre/Madre
248	Padre/Madre
251	Padre/Madre
253	Padre/Madre
262	Padre/Madre
265	Padre/Madre
267	Padre/Madre
269	Padre/Madre
271	Padre/Madre
274	Padre/Madre
276	Padre/Madre
278	Padre/Madre
281	Padre/Madre
283	Padre/Madre
285	Padre/Madre
288	Padre/Madre
291	Padre/Madre
293	Padre/Madre
295	Padre/Madre
298	Padre/Madre
303	Padre/Madre
309	Padre/Madre
311	Padre/Madre
313	Padre/Madre
315	Padre/Madre
321	Padre/Madre
327	Padre/Madre
331	Padre/Madre
333	Padre/Madre
335	Padre/Madre
341	Padre/Madre
344	Padre/Madre
346	Padre/Madre
350	Padre/Madre
352	Padre/Madre
354	Padre/Madre
357	Padre/Madre
359	Padre/Madre
362	Padre/Madre
366	Padre/Madre
369	Padre/Madre
371	Padre/Madre
373	Padre/Madre
380	Padre/Madre
382	Padre/Madre
384	Padre/Madre
387	Padre/Madre
389	Padre/Madre
398	Padre/Madre
400	Padre/Madre
403	Padre/Madre
405	Padre/Madre
260	Padre/Madre
100	Padre/Madre
70	Padre/Madre
175	Padre/Madre
112	Padre/Madre
414	Padre/Madre
415	Padre/Madre
456	Tío/a
221	Padre/Madre
458	Padre/Madre
412	Padre/Madre
445	Padre/Madre
409	Padre/Madre
447	Otro familiar
449	Hermano/a
226	Padre/Madre
451	Padre/Madre
452	Padre/Madre
454	Padre/Madre
338	Padre/Madre
462	Padre/Madre
464	Tío/a
472	Padre/Madre
469	Padre/Madre
466	Padre/Madre
468	Padre/Madre
475	Padre/Madre
553	Padre/Madre
556	Padre/Madre
558	Padre/Madre
560	Padre/Madre
565	Padre/Madre
568	Autorizado
567	Padre/Madre
563	Padre/Madre
570	Padre/Madre
572	Padre/Madre
577	Padre/Madre
196	Hermano/Hermana
579	Padre/Madre
581	Padre/Madre
583	Padre/Madre
98	Padre/Madre
460	Padre/Madre
375	Hermano/Hermana
306	Otro
585	Abuelo/a
587	Padre/Madre
78	Padre/Madre
588	Abuelo/a
594	Abuelo/a
596	Padre/Madre
377	Padre/Madre
235	Padre/Madre
145	Padre/Madre
407	Padre/Madre
68	Padre/Madre
348	Padre/Madre
324	Padre/Madre
597	Padre/Madre
599	Padre/Madre
601	Padre/Madre
604	Padre/Madre
607	Padre/Madre
609	Padre/Madre
611	Padre/Madre
613	Abuelo/a
625	Padre/Madre
692	Padre/Madre
742	Padre/Madre
10	Padre/Madre
574	Padre/Madre
751	Padre/Madre
752	Tío/a
753	Padre/Madre
755	Padre/Madre
757	Padre/Madre
759	Padre/Madre
761	Padre/Madre
763	Padre/Madre
764	Tío/a
765	Padre/Madre
767	Padre/Madre
769	Padre/Madre
771	Padre/Madre
773	Padre/Madre
777	Padre/Madre
779	Padre/Madre
781	Padre/Madre
784	Padre/Madre
785	Padre/Madre
787	Padre/Madre
788	Padre/Madre
789	Padre/Madre
790	Padre/Madre
791	Padre/Madre
792	Padre/Madre
793	Padre/Madre
794	Padre/Madre
796	Padre/Madre
797	Padre/Madre
798	Padre/Madre
800	Tío/a
801	Tío/a
803	Tío/a
807	Padre/Madre
809	Padre/Madre
810	Padre/Madre
812	Padre/Madre
815	Padre/Madre
817	Hermano/a
819	Padre/Madre
821	Padre/Madre
783	Abuelo/a
823	Padre/Madre
825	Padre/Madre
830	Padre/Madre
805	Padre/Madre
219	Padre/Madre
831	Abuelo/Abuela
834	Padre/Madre
841	Padre/Madre
843	Padre/Madre
845	Padre/Madre
846	Padre/Madre
848	Abuelo/a
850	Padre/Madre
852	Padre/Madre
855	Padre/Madre
857	Padre/Madre
859	Padre/Madre
861	Padre/Madre
863	Padre/Madre
865	Padre/Madre
867	Padre/Madre
869	Padre/Madre
871	Padre/Madre
872	Padre/Madre
874	Padre/Madre
877	Autorizado
880	Padre/Madre
884	Padre/Madre
885	Padre/Madre
886	Padre/Madre
888	Padre/Madre
889	Padre/Madre
890	Autorizado
892	Padre/Madre
894	Padre/Madre
896	Padre/Madre
901	Padre/Madre
623	Hermano/Hermana
902	Padre/Madre
904	Abuelo/a
908	Padre/Madre
882	Padre/Madre
879	Padre/Madre
910	Padre/Madre
912	Padre/Madre
914	Padre/Madre
916	Padre/Madre
918	Padre/Madre
920	Padre/Madre
922	Padre/Madre
924	Padre/Madre
926	Padre/Madre
928	Padre/Madre
930	Padre/Madre
932	Padre/Madre
933	Padre/Madre
935	Padre/Madre
937	Padre/Madre
938	Otro familiar
940	Padre/Madre
\.


--
-- Data for Name: tutores_ninos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutores_ninos (id_tutor, id_nino, parentesco) FROM stdin;
10	9	Padre/Madre
70	69	Padre/Madre
74	73	Padre/Madre
76	75	Padre/Madre
78	77	Padre/Madre
80	79	Padre/Madre
82	81	Padre/Madre
84	83	Padre/Madre
86	85	Padre/Madre
88	87	Padre/Madre
90	89	Padre/Madre
92	91	Padre/Madre
94	93	Padre/Madre
96	95	Padre/Madre
98	97	Padre/Madre
100	99	Padre/Madre
102	101	Padre/Madre
104	103	Padre/Madre
106	105	Padre/Madre
108	107	Padre/Madre
110	109	Padre/Madre
112	111	Padre/Madre
114	113	Padre/Madre
116	115	Padre/Madre
118	117	Padre/Madre
120	119	Padre/Madre
122	121	Padre/Madre
124	123	Padre/Madre
126	125	Padre/Madre
128	127	Padre/Madre
130	129	Padre/Madre
132	131	Padre/Madre
134	133	Padre/Madre
136	135	Padre/Madre
138	137	Padre/Madre
140	139	Padre/Madre
142	141	Padre/Madre
142	143	Padre/Madre
145	144	Padre/Madre
147	146	Padre/Madre
149	148	Padre/Madre
151	150	Padre/Madre
153	152	Padre/Madre
155	154	Padre/Madre
157	156	Padre/Madre
159	158	Padre/Madre
161	160	Padre/Madre
163	162	Padre/Madre
165	164	Padre/Madre
167	166	Padre/Madre
169	168	Padre/Madre
171	170	Padre/Madre
173	172	Padre/Madre
175	174	Padre/Madre
177	176	Padre/Madre
179	178	Padre/Madre
181	180	Padre/Madre
183	182	Padre/Madre
185	184	Padre/Madre
187	186	Padre/Madre
189	188	Padre/Madre
191	190	Padre/Madre
193	192	Padre/Madre
126	194	Padre/Madre
196	195	Hermano/Hermana
138	197	Padre/Madre
199	198	Padre/Madre
201	200	Padre/Madre
155	202	Padre/Madre
204	203	Padre/Madre
206	205	Padre/Madre
98	207	Padre/Madre
209	208	Padre/Madre
211	210	Padre/Madre
213	212	Padre/Madre
215	214	Padre/Madre
217	216	Padre/Madre
219	218	Padre/Madre
221	220	Padre/Madre
78	222	Padre/Madre
224	223	Padre/Madre
226	225	Padre/Madre
153	227	Padre/Madre
229	228	Padre/Madre
231	230	Padre/Madre
233	232	Padre/Madre
235	234	Padre/Madre
237	236	Padre/Madre
239	238	Padre/Madre
241	240	Padre/Madre
100	242	Padre/Madre
244	243	Padre/Madre
246	245	Padre/Madre
248	247	Padre/Madre
126	249	Padre/Madre
251	250	Padre/Madre
253	252	Padre/Madre
153	254	Padre/Madre
116	255	Padre/Madre
140	256	Padre/Madre
253	257	Padre/Madre
112	258	Padre/Madre
260	259	Padre/Madre
262	261	Padre/Madre
126	263	Padre/Madre
265	264	Padre/Madre
267	266	Padre/Madre
269	268	Padre/Madre
271	270	Padre/Madre
233	272	Padre/Madre
274	273	Padre/Madre
276	275	Padre/Madre
278	277	Padre/Madre
98	279	Padre/Madre
281	280	Padre/Madre
283	282	Padre/Madre
285	284	Padre/Madre
183	286	Padre/Madre
288	287	Padre/Madre
88	289	Padre/Madre
291	290	Padre/Madre
293	292	Padre/Madre
295	294	Padre/Madre
267	296	Padre/Madre
298	297	Padre/Madre
219	299	Padre/Madre
92	300	Padre/Madre
155	301	Padre/Madre
303	302	Padre/Madre
175	304	Padre/Madre
306	305	Otro
577	576	Padre/Madre
579	578	Padre/Madre
581	580	Padre/Madre
583	582	Padre/Madre
585	584	Abuelo/a
587	586	Padre/Madre
298	307	Padre/Madre
309	308	Padre/Madre
311	310	Padre/Madre
313	312	Padre/Madre
315	314	Padre/Madre
96	316	Padre/Madre
260	317	Padre/Madre
84	318	Padre/Madre
84	319	Padre/Madre
321	320	Padre/Madre
177	322	Padre/Madre
324	323	Padre/Madre
281	325	Padre/Madre
327	326	Padre/Madre
226	328	Padre/Madre
189	329	Padre/Madre
331	330	Padre/Madre
333	332	Padre/Madre
335	334	Padre/Madre
161	336	Padre/Madre
338	337	Padre/Madre
293	339	Padre/Madre
341	340	Padre/Madre
165	342	Padre/Madre
344	343	Padre/Madre
346	345	Padre/Madre
348	347	Padre/Madre
350	349	Padre/Madre
352	351	Padre/Madre
354	353	Padre/Madre
357	356	Padre/Madre
359	358	Padre/Madre
215	360	Padre/Madre
362	361	Padre/Madre
112	363	Padre/Madre
68	364	Padre/Madre
366	365	Padre/Madre
366	367	Padre/Madre
369	368	Padre/Madre
371	370	Padre/Madre
373	372	Padre/Madre
375	374	Hermano/Hermana
377	376	Padre/Madre
377	378	Padre/Madre
380	379	Padre/Madre
382	381	Padre/Madre
384	383	Padre/Madre
384	385	Padre/Madre
387	386	Padre/Madre
389	388	Padre/Madre
398	397	Padre/Madre
400	399	Padre/Madre
400	401	Padre/Madre
403	402	Padre/Madre
405	404	Padre/Madre
407	406	Padre/Madre
409	408	Padre/Madre
409	410	Padre/Madre
412	411	Padre/Madre
447	446	Otro familiar
449	448	Hermano/a
451	450	Padre/Madre
452	355	Padre/Madre
454	453	Padre/Madre
456	455	Tío/a
458	457	Padre/Madre
460	459	Padre/Madre
462	461	Padre/Madre
464	463	Tío/a
466	465	Padre/Madre
468	467	Padre/Madre
469	119	Padre/Madre
466	470	Padre/Madre
472	471	Padre/Madre
468	473	Padre/Madre
475	474	Padre/Madre
553	552	Padre/Madre
553	554	Padre/Madre
556	555	Padre/Madre
558	557	Padre/Madre
560	559	Padre/Madre
560	561	Padre/Madre
563	562	Padre/Madre
565	564	Padre/Madre
567	566	Padre/Madre
568	195	Autorizado
570	569	Padre/Madre
572	571	Padre/Madre
574	573	Padre/Madre
574	575	Padre/Madre
588	264	Abuelo/a
588	589	Abuelo/a
219	590	Padre/Madre
219	591	Padre/Madre
219	592	Padre/Madre
594	593	Abuelo/a
596	595	Padre/Madre
597	325	Padre/Madre
599	598	Padre/Madre
601	600	Padre/Madre
601	602	Padre/Madre
607	606	Padre/Madre
609	608	Padre/Madre
611	610	Padre/Madre
613	612	Abuelo/a
625	624	Padre/Madre
751	566	Padre/Madre
752	227	Tío/a
753	152	Padre/Madre
755	754	Padre/Madre
755	756	Padre/Madre
757	170	Padre/Madre
759	758	Padre/Madre
761	760	Padre/Madre
763	762	Padre/Madre
764	275	Tío/a
765	448	Padre/Madre
767	766	Padre/Madre
769	768	Padre/Madre
771	770	Padre/Madre
773	772	Padre/Madre
773	774	Padre/Madre
777	776	Padre/Madre
779	778	Padre/Madre
781	780	Padre/Madre
783	782	Abuelo/a
784	264	Padre/Madre
785	172	Padre/Madre
787	786	Padre/Madre
623	109	Padre/Madre
788	208	Padre/Madre
789	234	Padre/Madre
790	330	Padre/Madre
791	123	Padre/Madre
792	317	Padre/Madre
793	259	Padre/Madre
794	195	Padre/Madre
796	795	Padre/Madre
797	457	Padre/Madre
798	308	Padre/Madre
800	799	Tío/a
801	799	Tío/a
805	804	Padre/Madre
803	802	Padre/Madre
803	806	Padre/Madre
807	326	Padre/Madre
805	808	Padre/Madre
809	268	Padre/Madre
810	361	Padre/Madre
812	811	Padre/Madre
604	605	Padre/Madre
604	603	Padre/Madre
812	813	Padre/Madre
815	814	Padre/Madre
817	816	Hermano/a
819	818	Padre/Madre
821	820	Padre/Madre
830	829	Padre/Madre
831	804	Padre/Madre
834	833	Padre/Madre
841	840	Padre/Madre
843	842	Padre/Madre
845	844	Padre/Madre
846	808	Padre/Madre
848	847	Abuelo/a
850	849	Padre/Madre
852	851	Padre/Madre
852	853	Padre/Madre
855	854	Padre/Madre
857	856	Padre/Madre
859	858	Padre/Madre
861	860	Padre/Madre
863	862	Padre/Madre
865	864	Padre/Madre
867	866	Padre/Madre
869	868	Padre/Madre
871	870	Padre/Madre
872	182	Padre/Madre
874	873	Padre/Madre
874	875	Padre/Madre
877	876	Autorizado
879	878	Padre/Madre
880	190	Padre/Madre
882	881	Padre/Madre
884	883	Padre/Madre
885	457	Padre/Madre
886	308	Padre/Madre
888	887	Padre/Madre
889	358	Padre/Madre
890	236	Autorizado
892	891	Padre/Madre
894	893	Padre/Madre
896	895	Padre/Madre
187	898	Padre/Madre
375	899	Tío/a
901	900	Padre/Madre
902	778	Padre/Madre
904	903	Abuelo/a
933	198	Padre/Madre
935	934	Padre/Madre
937	936	Padre/Madre
938	772	Otro familiar
\.


--
-- Name: asistencia_maestros_id_asistencia_maestro_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asistencia_maestros_id_asistencia_maestro_seq', 1, false);


--
-- Name: asistencia_ninos_id_asistencia_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asistencia_ninos_id_asistencia_seq', 620, true);


--
-- Name: circulos_amistad_id_circulo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.circulos_amistad_id_circulo_seq', 1, false);


--
-- Name: eventos_id_evento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.eventos_id_evento_seq', 1, false);


--
-- Name: fichas_id_ficha_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fichas_id_ficha_seq', 329, true);


--
-- Name: grupos_id_grupo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grupos_id_grupo_seq', 3, true);


--
-- Name: info_medica_ninos_id_info_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.info_medica_ninos_id_info_seq', 1, false);


--
-- Name: ninos_expedientes_conducta_id_expediente_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ninos_expedientes_conducta_id_expediente_seq', 1, true);


--
-- Name: personal_expedientes_evaluacion_id_evaluacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_expedientes_evaluacion_id_evaluacion_seq', 1, false);


--
-- Name: personal_historial_cambios_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_historial_cambios_id_historial_seq', 3, true);


--
-- Name: personal_historial_lideres_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_historial_lideres_id_historial_seq', 1, false);


--
-- Name: personal_historial_roles_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_historial_roles_id_historial_seq', 1, true);


--
-- Name: personal_lideres_id_lider_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_lideres_id_lider_seq', 2, true);


--
-- Name: personal_suspensiones_servicio_id_suspension_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_suspensiones_servicio_id_suspension_seq', 1, false);


--
-- Name: personas_direcciones_id_direccion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personas_direcciones_id_direccion_seq', 24, true);


--
-- Name: personas_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personas_id_persona_seq', 948, true);


--
-- Name: redes_id_red_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.redes_id_red_seq', 3, true);


--
-- Name: requisitos_id_requisito_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.requisitos_id_requisito_seq', 8, true);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 4, true);


--
-- Name: solicitudes_historial_estado_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.solicitudes_historial_estado_id_historial_seq', 24, true);


--
-- Name: solicitudes_personal_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.solicitudes_personal_id_solicitud_seq', 20, true);


--
-- Name: telefonos_personas_id_telefono_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.telefonos_personas_id_telefono_seq', 309, true);


--
-- Name: turnos_id_turno_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.turnos_id_turno_seq', 4, true);


--
-- Name: asistencia_maestros asistencia_maestros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_pkey PRIMARY KEY (id_asistencia_maestro);


--
-- Name: asistencia_ninos asistencia_ninos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_pkey PRIMARY KEY (id_asistencia);


--
-- Name: circulos_amistad circulos_amistad_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circulos_amistad
    ADD CONSTRAINT circulos_amistad_pkey PRIMARY KEY (id_circulo);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id_evento);


--
-- Name: fichas fichas_codigo_ficha_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fichas
    ADD CONSTRAINT fichas_codigo_ficha_key UNIQUE (codigo_ficha);


--
-- Name: fichas fichas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fichas
    ADD CONSTRAINT fichas_pkey PRIMARY KEY (id_ficha);


--
-- Name: grupos grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_pkey PRIMARY KEY (id_grupo);


--
-- Name: info_medica_ninos info_medica_ninos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.info_medica_ninos
    ADD CONSTRAINT info_medica_ninos_pkey PRIMARY KEY (id_info);


--
-- Name: ninos_expedientes_conducta ninos_expedientes_conducta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_expedientes_conducta
    ADD CONSTRAINT ninos_expedientes_conducta_pkey PRIMARY KEY (id_expediente);


--
-- Name: ninos_grupos ninos_grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_grupos
    ADD CONSTRAINT ninos_grupos_pkey PRIMARY KEY (id_nino, id_grupo);


--
-- Name: ninos ninos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos
    ADD CONSTRAINT ninos_pkey PRIMARY KEY (id_persona);


--
-- Name: personal_expedientes_evaluacion personal_expedientes_evaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_expedientes_evaluacion
    ADD CONSTRAINT personal_expedientes_evaluacion_pkey PRIMARY KEY (id_evaluacion);


--
-- Name: personal_grupos personal_grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_grupos
    ADD CONSTRAINT personal_grupos_pkey PRIMARY KEY (id_personal, id_grupo, id_turno);


--
-- Name: personal_historial_cambios personal_historial_cambios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_cambios
    ADD CONSTRAINT personal_historial_cambios_pkey PRIMARY KEY (id_historial);


--
-- Name: personal_historial_lideres personal_historial_lideres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_lideres
    ADD CONSTRAINT personal_historial_lideres_pkey PRIMARY KEY (id_historial);


--
-- Name: personal_historial_roles personal_historial_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_roles
    ADD CONSTRAINT personal_historial_roles_pkey PRIMARY KEY (id_historial);


--
-- Name: personal_info_iglesia personal_info_iglesia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_iglesia
    ADD CONSTRAINT personal_info_iglesia_pkey PRIMARY KEY (id_persona);


--
-- Name: personal_info_personal personal_info_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_personal
    ADD CONSTRAINT personal_info_personal_pkey PRIMARY KEY (id_persona);


--
-- Name: personal_lideres personal_lideres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lideres
    ADD CONSTRAINT personal_lideres_pkey PRIMARY KEY (id_lider);


--
-- Name: personal_requisitos personal_requisitos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_requisitos
    ADD CONSTRAINT personal_requisitos_pkey PRIMARY KEY (id_personal, id_requisito);


--
-- Name: personal_sistema personal_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT personal_sistema_pkey PRIMARY KEY (id_persona);


--
-- Name: personal_sistema personal_sistema_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT personal_sistema_usuario_key UNIQUE (usuario);


--
-- Name: personal_suspensiones_servicio personal_suspensiones_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_suspensiones_servicio
    ADD CONSTRAINT personal_suspensiones_servicio_pkey PRIMARY KEY (id_suspension);


--
-- Name: personal_turnos personal_turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_turnos
    ADD CONSTRAINT personal_turnos_pkey PRIMARY KEY (id_personal, id_turno);


--
-- Name: personas_direcciones personas_direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas_direcciones
    ADD CONSTRAINT personas_direcciones_pkey PRIMARY KEY (id_direccion);


--
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id_persona);


--
-- Name: redes redes_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redes
    ADD CONSTRAINT redes_nombre_key UNIQUE (nombre);


--
-- Name: redes redes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redes
    ADD CONSTRAINT redes_pkey PRIMARY KEY (id_red);


--
-- Name: relaciones_personas relaciones_personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_personas
    ADD CONSTRAINT relaciones_personas_pkey PRIMARY KEY (id_persona_a, id_persona_b, tipo_relacion);


--
-- Name: requisitos requisitos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisitos
    ADD CONSTRAINT requisitos_nombre_key UNIQUE (nombre);


--
-- Name: requisitos requisitos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisitos
    ADD CONSTRAINT requisitos_pkey PRIMARY KEY (id_requisito);


--
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: solicitudes_historial_estado solicitudes_historial_estado_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_historial_estado
    ADD CONSTRAINT solicitudes_historial_estado_pkey PRIMARY KEY (id_historial);


--
-- Name: solicitudes_personal solicitudes_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_pkey PRIMARY KEY (id_solicitud);


--
-- Name: solicitudes_requisitos solicitudes_requisitos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_requisitos
    ADD CONSTRAINT solicitudes_requisitos_pkey PRIMARY KEY (id_solicitud, id_requisito);


--
-- Name: telefonos_personas telefonos_personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telefonos_personas
    ADD CONSTRAINT telefonos_personas_pkey PRIMARY KEY (id_telefono);


--
-- Name: turnos turnos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_nombre_key UNIQUE (nombre);


--
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id_turno);


--
-- Name: tutores_ninos tutores_ninos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutores_ninos
    ADD CONSTRAINT tutores_ninos_pkey PRIMARY KEY (id_tutor, id_nino);


--
-- Name: tutores tutores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutores
    ADD CONSTRAINT tutores_pkey PRIMARY KEY (id_persona);


--
-- Name: circulos_amistad uq_circulo_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circulos_amistad
    ADD CONSTRAINT uq_circulo_nombre UNIQUE (nombre);


--
-- Name: eventos uq_evento_fecha_turno; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT uq_evento_fecha_turno UNIQUE (fecha, id_turno);


--
-- Name: personal_lideres uq_lider_persona; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lideres
    ADD CONSTRAINT uq_lider_persona UNIQUE (id_persona);


--
-- Name: asistencia_ninos uq_nino_fecha_turno; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT uq_nino_fecha_turno UNIQUE (id_nino, fecha, id_turno);


--
-- Name: asistencia_maestros uq_personal_fecha_turno; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros
    ADD CONSTRAINT uq_personal_fecha_turno UNIQUE (id_personal, fecha, id_turno);


--
-- Name: idx_asist_maestro_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asist_maestro_estado ON public.asistencia_maestros USING btree (estado_llegada, fecha DESC);


--
-- Name: idx_asist_maestro_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asist_maestro_fecha ON public.asistencia_maestros USING btree (fecha, id_personal);


--
-- Name: idx_asist_maestro_turno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asist_maestro_turno ON public.asistencia_maestros USING btree (id_turno, fecha DESC);


--
-- Name: idx_asistencia_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asistencia_fecha ON public.asistencia_ninos USING btree (fecha);


--
-- Name: idx_asistencia_ficha_ent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asistencia_ficha_ent ON public.asistencia_ninos USING btree (id_ficha_entrada);


--
-- Name: idx_asistencia_nino; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asistencia_nino ON public.asistencia_ninos USING btree (id_nino, fecha DESC);


--
-- Name: idx_asistencia_turno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asistencia_turno ON public.asistencia_ninos USING btree (id_turno, fecha DESC);


--
-- Name: idx_circulos_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_circulos_activo ON public.circulos_amistad USING btree (activo) WHERE (activo = true);


--
-- Name: idx_direcciones_persona; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direcciones_persona ON public.personas_direcciones USING btree (id_persona);


--
-- Name: idx_evaluacion_personal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluacion_personal ON public.personal_expedientes_evaluacion USING btree (id_personal, fecha DESC);


--
-- Name: idx_evaluacion_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluacion_tipo ON public.personal_expedientes_evaluacion USING btree (tipo, resultado);


--
-- Name: idx_eventos_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_fecha ON public.eventos USING btree (fecha DESC);


--
-- Name: idx_eventos_turno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_turno ON public.eventos USING btree (id_turno, fecha);


--
-- Name: idx_expediente_nino; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expediente_nino ON public.ninos_expedientes_conducta USING btree (id_nino, fecha DESC);


--
-- Name: idx_expediente_nino_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expediente_nino_activo ON public.ninos_expedientes_conducta USING btree (id_nino, resuelto) WHERE (resuelto = false);


--
-- Name: idx_expediente_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expediente_tipo ON public.ninos_expedientes_conducta USING btree (tipo, resuelto);


--
-- Name: idx_fichas_activas; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fichas_activas ON public.fichas USING btree (estado) WHERE (estado = 'Activa'::public.ficha_estado);


--
-- Name: idx_fichas_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fichas_codigo ON public.fichas USING btree (codigo_ficha);


--
-- Name: idx_fichas_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fichas_grupo ON public.fichas USING btree (id_grupo);


--
-- Name: idx_historial_cambios_personal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historial_cambios_personal ON public.personal_historial_cambios USING btree (id_personal, fecha_cambio DESC);


--
-- Name: idx_historial_estado_solicitud; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historial_estado_solicitud ON public.solicitudes_historial_estado USING btree (id_solicitud, fecha_cambio DESC);


--
-- Name: idx_historial_lideres_personal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historial_lideres_personal ON public.personal_historial_lideres USING btree (id_personal, fecha_cambio DESC);


--
-- Name: idx_historial_personal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historial_personal ON public.personal_historial_roles USING btree (id_personal, fecha_cambio DESC);


--
-- Name: idx_iglesia_liderazgo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iglesia_liderazgo ON public.personal_info_iglesia USING btree (estado_liderazgo) WHERE (estado_liderazgo IS NOT NULL);


--
-- Name: idx_iglesia_red; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iglesia_red ON public.personal_info_iglesia USING btree (id_red) WHERE (id_red IS NOT NULL);


--
-- Name: idx_lideres_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lideres_activo ON public.personal_lideres USING btree (activo) WHERE (activo = true);


--
-- Name: idx_medica_nino_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medica_nino_tipo ON public.info_medica_ninos USING btree (id_nino, tipo);


--
-- Name: idx_ninos_persona; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ninos_persona ON public.ninos USING btree (id_persona);


--
-- Name: idx_personal_grupos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_grupos ON public.personal_grupos USING btree (id_personal, id_grupo);


--
-- Name: idx_personal_requisitos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_requisitos ON public.personal_requisitos USING btree (id_personal);


--
-- Name: idx_personal_rol_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_rol_activo ON public.personal_sistema USING btree (id_rol, activo);


--
-- Name: idx_personal_rol_ingreso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_rol_ingreso ON public.personal_sistema USING btree (id_rol, fecha_ingreso_servicio);


--
-- Name: idx_personal_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_usuario ON public.personal_sistema USING btree (usuario);


--
-- Name: idx_personas_dia_nac; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personas_dia_nac ON public.personas USING btree (EXTRACT(day FROM fecha_nacimiento)) WHERE (fecha_nacimiento IS NOT NULL);


--
-- Name: idx_personas_mes_nac; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personas_mes_nac ON public.personas USING btree (EXTRACT(month FROM fecha_nacimiento)) WHERE (fecha_nacimiento IS NOT NULL);


--
-- Name: idx_relaciones_a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_relaciones_a ON public.relaciones_personas USING btree (id_persona_a);


--
-- Name: idx_relaciones_b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_relaciones_b ON public.relaciones_personas USING btree (id_persona_b);


--
-- Name: idx_requisitos_tipo_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requisitos_tipo_activo ON public.requisitos USING btree (tipo, activo);


--
-- Name: idx_salida_pendiente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salida_pendiente ON public.asistencia_ninos USING btree (fecha, id_nino) WHERE (estado = 'Presente'::public.estado_asistencia_nino);


--
-- Name: idx_sol_requisitos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_requisitos ON public.solicitudes_requisitos USING btree (id_solicitud);


--
-- Name: idx_solicitudes_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_estado ON public.solicitudes_personal USING btree (estado, fecha_solicitud DESC);


--
-- Name: idx_solicitudes_persona; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_persona ON public.solicitudes_personal USING btree (id_persona);


--
-- Name: idx_suspensiones_personal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suspensiones_personal ON public.personal_suspensiones_servicio USING btree (id_personal, activo, fecha_inicio, fecha_fin);


--
-- Name: idx_telefonos_persona; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telefonos_persona ON public.telefonos_personas USING btree (id_persona);


--
-- Name: idx_tutores_ninos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tutores_ninos ON public.tutores_ninos USING btree (id_nino);


--
-- Name: uq_personas_cedula; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_personas_cedula ON public.personas USING btree (cedula) WHERE (cedula IS NOT NULL);


--
-- Name: uq_un_principal_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_un_principal_activo ON public.telefonos_personas USING btree (id_persona) WHERE ((es_principal = true) AND (activo = true));


--
-- Name: uq_una_dir_principal; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_una_dir_principal ON public.personas_direcciones USING btree (id_persona) WHERE ((es_principal = true) AND (activo = true));


--
-- Name: personas_direcciones trg_auditar_cambios_direcciones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditar_cambios_direcciones AFTER UPDATE ON public.personas_direcciones FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_direcciones();


--
-- Name: personal_info_iglesia trg_auditar_cambios_info_iglesia; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditar_cambios_info_iglesia AFTER UPDATE ON public.personal_info_iglesia FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_info_iglesia();


--
-- Name: personal_info_personal trg_auditar_cambios_info_personal; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditar_cambios_info_personal AFTER UPDATE ON public.personal_info_personal FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_info_personal();


--
-- Name: telefonos_personas trg_auditar_cambios_telefonos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditar_cambios_telefonos AFTER UPDATE ON public.telefonos_personas FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_telefonos();


--
-- Name: solicitudes_personal trg_auditoria_cambio_estado_solicitud; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_cambio_estado_solicitud AFTER UPDATE OF estado ON public.solicitudes_personal FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_cambio_estado_solicitud();


--
-- Name: personal_info_iglesia trg_auditoria_cambio_lider; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_cambio_lider AFTER UPDATE OF id_lider ON public.personal_info_iglesia FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_cambio_lider();


--
-- Name: personal_sistema trg_auditoria_cambio_rol; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_cambio_rol AFTER UPDATE OF id_rol ON public.personal_sistema FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_cambio_rol();


--
-- Name: personas_direcciones trg_auditoria_updated_at_direcciones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_updated_at_direcciones BEFORE UPDATE ON public.personas_direcciones FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: relaciones_personas trg_auditoria_updated_at_relaciones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_updated_at_relaciones BEFORE UPDATE ON public.relaciones_personas FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: personal_suspensiones_servicio trg_auditoria_updated_at_suspensiones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_updated_at_suspensiones BEFORE UPDATE ON public.personal_suspensiones_servicio FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: telefonos_personas trg_auditoria_updated_at_telefonos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auditoria_updated_at_telefonos BEFORE UPDATE ON public.telefonos_personas FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: asistencia_ninos trg_autoasignar_grupo_asistencia; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autoasignar_grupo_asistencia BEFORE INSERT ON public.asistencia_ninos FOR EACH ROW EXECUTE FUNCTION public.fn_autoasignar_grupo_asistencia();


--
-- Name: ninos trg_nino_fecha_nac; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nino_fecha_nac BEFORE INSERT ON public.ninos FOR EACH ROW EXECUTE FUNCTION public.fn_validar_fecha_nac_nino();


--
-- Name: solicitudes_personal trg_propagar_datos_solicitud; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_propagar_datos_solicitud AFTER UPDATE OF estado ON public.solicitudes_personal FOR EACH ROW EXECUTE FUNCTION public.fn_propagar_datos_solicitud_aprobada();


--
-- Name: personal_sistema trg_validar_autorizacion_staff; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_autorizacion_staff BEFORE INSERT OR UPDATE ON public.personal_sistema FOR EACH ROW EXECUTE FUNCTION public.fn_validar_autorizacion_staff();


--
-- Name: personal_sistema trg_validar_hash_bcrypt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_hash_bcrypt BEFORE INSERT OR UPDATE OF password_hash ON public.personal_sistema FOR EACH ROW EXECUTE FUNCTION public.fn_validar_hash_bcrypt();


--
-- Name: solicitudes_personal trg_validar_requisitos_solicitud; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_requisitos_solicitud BEFORE UPDATE OF estado ON public.solicitudes_personal FOR EACH ROW EXECUTE FUNCTION public.fn_validar_requisitos_solicitud();


--
-- Name: asistencia_ninos trg_validar_retiro_nino; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_retiro_nino BEFORE UPDATE ON public.asistencia_ninos FOR EACH ROW EXECUTE FUNCTION public.fn_validar_retiro_nino();


--
-- Name: personal_suspensiones_servicio trg_validar_suspension; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_suspension BEFORE INSERT ON public.personal_suspensiones_servicio FOR EACH ROW EXECUTE FUNCTION public.fn_validar_suspension();


--
-- Name: asistencia_maestros asistencia_maestros_id_evento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.eventos(id_evento);


--
-- Name: asistencia_maestros asistencia_maestros_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupos(id_grupo);


--
-- Name: asistencia_maestros asistencia_maestros_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: asistencia_maestros asistencia_maestros_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_maestros
    ADD CONSTRAINT asistencia_maestros_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno);


--
-- Name: asistencia_ninos asistencia_ninos_checkout_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_checkout_por_fkey FOREIGN KEY (checkout_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: asistencia_ninos asistencia_ninos_id_evento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.eventos(id_evento);


--
-- Name: asistencia_ninos asistencia_ninos_id_ficha_entrada_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_ficha_entrada_fkey FOREIGN KEY (id_ficha_entrada) REFERENCES public.fichas(id_ficha);


--
-- Name: asistencia_ninos asistencia_ninos_id_ficha_salida_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_ficha_salida_fkey FOREIGN KEY (id_ficha_salida) REFERENCES public.fichas(id_ficha);


--
-- Name: asistencia_ninos asistencia_ninos_id_grupo_asistido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_grupo_asistido_fkey FOREIGN KEY (id_grupo_asistido) REFERENCES public.grupos(id_grupo);


--
-- Name: asistencia_ninos asistencia_ninos_id_nino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_nino_fkey FOREIGN KEY (id_nino) REFERENCES public.ninos(id_persona) ON DELETE RESTRICT;


--
-- Name: asistencia_ninos asistencia_ninos_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno);


--
-- Name: asistencia_ninos asistencia_ninos_registrado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_ninos
    ADD CONSTRAINT asistencia_ninos_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: eventos eventos_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno);


--
-- Name: fichas fichas_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fichas
    ADD CONSTRAINT fichas_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupos(id_grupo);


--
-- Name: personal_sistema fk_solicitud_origen; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT fk_solicitud_origen FOREIGN KEY (id_solicitud_origen) REFERENCES public.solicitudes_personal(id_solicitud) ON DELETE SET NULL;


--
-- Name: info_medica_ninos info_medica_ninos_id_nino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.info_medica_ninos
    ADD CONSTRAINT info_medica_ninos_id_nino_fkey FOREIGN KEY (id_nino) REFERENCES public.ninos(id_persona) ON DELETE CASCADE;


--
-- Name: ninos_expedientes_conducta ninos_expedientes_conducta_id_evento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_expedientes_conducta
    ADD CONSTRAINT ninos_expedientes_conducta_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.eventos(id_evento);


--
-- Name: ninos_expedientes_conducta ninos_expedientes_conducta_id_nino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_expedientes_conducta
    ADD CONSTRAINT ninos_expedientes_conducta_id_nino_fkey FOREIGN KEY (id_nino) REFERENCES public.ninos(id_persona) ON DELETE RESTRICT;


--
-- Name: ninos_expedientes_conducta ninos_expedientes_conducta_id_reportado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_expedientes_conducta
    ADD CONSTRAINT ninos_expedientes_conducta_id_reportado_por_fkey FOREIGN KEY (id_reportado_por) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: ninos_expedientes_conducta ninos_expedientes_conducta_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_expedientes_conducta
    ADD CONSTRAINT ninos_expedientes_conducta_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno);


--
-- Name: ninos_grupos ninos_grupos_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_grupos
    ADD CONSTRAINT ninos_grupos_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupos(id_grupo);


--
-- Name: ninos_grupos ninos_grupos_id_nino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos_grupos
    ADD CONSTRAINT ninos_grupos_id_nino_fkey FOREIGN KEY (id_nino) REFERENCES public.ninos(id_persona) ON DELETE RESTRICT;


--
-- Name: ninos ninos_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninos
    ADD CONSTRAINT ninos_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_expedientes_evaluacion personal_expedientes_evaluacion_id_evaluador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_expedientes_evaluacion
    ADD CONSTRAINT personal_expedientes_evaluacion_id_evaluador_fkey FOREIGN KEY (id_evaluador) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_expedientes_evaluacion personal_expedientes_evaluacion_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_expedientes_evaluacion
    ADD CONSTRAINT personal_expedientes_evaluacion_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_grupos personal_grupos_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_grupos
    ADD CONSTRAINT personal_grupos_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupos(id_grupo);


--
-- Name: personal_grupos personal_grupos_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_grupos
    ADD CONSTRAINT personal_grupos_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_grupos personal_grupos_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_grupos
    ADD CONSTRAINT personal_grupos_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno);


--
-- Name: personal_historial_cambios personal_historial_cambios_id_cambiado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_cambios
    ADD CONSTRAINT personal_historial_cambios_id_cambiado_por_fkey FOREIGN KEY (id_cambiado_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: personal_historial_cambios personal_historial_cambios_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_cambios
    ADD CONSTRAINT personal_historial_cambios_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_historial_lideres personal_historial_lideres_id_lider_anterior_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_lideres
    ADD CONSTRAINT personal_historial_lideres_id_lider_anterior_fkey FOREIGN KEY (id_lider_anterior) REFERENCES public.personal_lideres(id_lider);


--
-- Name: personal_historial_lideres personal_historial_lideres_id_lider_nuevo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_lideres
    ADD CONSTRAINT personal_historial_lideres_id_lider_nuevo_fkey FOREIGN KEY (id_lider_nuevo) REFERENCES public.personal_lideres(id_lider);


--
-- Name: personal_historial_lideres personal_historial_lideres_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_lideres
    ADD CONSTRAINT personal_historial_lideres_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_historial_lideres personal_historial_lideres_id_registrado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_lideres
    ADD CONSTRAINT personal_historial_lideres_id_registrado_por_fkey FOREIGN KEY (id_registrado_por) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_historial_roles personal_historial_roles_id_autorizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_roles
    ADD CONSTRAINT personal_historial_roles_id_autorizado_por_fkey FOREIGN KEY (id_autorizado_por) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_historial_roles personal_historial_roles_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_roles
    ADD CONSTRAINT personal_historial_roles_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_historial_roles personal_historial_roles_id_rol_anterior_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_roles
    ADD CONSTRAINT personal_historial_roles_id_rol_anterior_fkey FOREIGN KEY (id_rol_anterior) REFERENCES public.roles(id_rol);


--
-- Name: personal_historial_roles personal_historial_roles_id_rol_nuevo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_historial_roles
    ADD CONSTRAINT personal_historial_roles_id_rol_nuevo_fkey FOREIGN KEY (id_rol_nuevo) REFERENCES public.roles(id_rol);


--
-- Name: personal_info_iglesia personal_info_iglesia_id_circulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_iglesia
    ADD CONSTRAINT personal_info_iglesia_id_circulo_fkey FOREIGN KEY (id_circulo) REFERENCES public.circulos_amistad(id_circulo) ON DELETE SET NULL;


--
-- Name: personal_info_iglesia personal_info_iglesia_id_lider_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_iglesia
    ADD CONSTRAINT personal_info_iglesia_id_lider_fkey FOREIGN KEY (id_lider) REFERENCES public.personal_lideres(id_lider) ON DELETE SET NULL;


--
-- Name: personal_info_iglesia personal_info_iglesia_id_mentor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_iglesia
    ADD CONSTRAINT personal_info_iglesia_id_mentor_fkey FOREIGN KEY (id_mentor) REFERENCES public.personal_sistema(id_persona);


--
-- Name: personal_info_iglesia personal_info_iglesia_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_iglesia
    ADD CONSTRAINT personal_info_iglesia_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personal_sistema(id_persona) ON DELETE CASCADE;


--
-- Name: personal_info_iglesia personal_info_iglesia_id_red_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_iglesia
    ADD CONSTRAINT personal_info_iglesia_id_red_fkey FOREIGN KEY (id_red) REFERENCES public.redes(id_red);


--
-- Name: personal_info_personal personal_info_personal_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_info_personal
    ADD CONSTRAINT personal_info_personal_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personal_sistema(id_persona) ON DELETE CASCADE;


--
-- Name: personal_lideres personal_lideres_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lideres
    ADD CONSTRAINT personal_lideres_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_requisitos personal_requisitos_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_requisitos
    ADD CONSTRAINT personal_requisitos_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE CASCADE;


--
-- Name: personal_requisitos personal_requisitos_id_requisito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_requisitos
    ADD CONSTRAINT personal_requisitos_id_requisito_fkey FOREIGN KEY (id_requisito) REFERENCES public.requisitos(id_requisito);


--
-- Name: personal_sistema personal_sistema_id_autorizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT personal_sistema_id_autorizado_por_fkey FOREIGN KEY (id_autorizado_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: personal_sistema personal_sistema_id_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT personal_sistema_id_creado_por_fkey FOREIGN KEY (id_creado_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: personal_sistema personal_sistema_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT personal_sistema_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_sistema personal_sistema_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_sistema
    ADD CONSTRAINT personal_sistema_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- Name: personal_suspensiones_servicio personal_suspensiones_servicio_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_suspensiones_servicio
    ADD CONSTRAINT personal_suspensiones_servicio_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_suspensiones_servicio personal_suspensiones_servicio_id_registrado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_suspensiones_servicio
    ADD CONSTRAINT personal_suspensiones_servicio_id_registrado_por_fkey FOREIGN KEY (id_registrado_por) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_turnos personal_turnos_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_turnos
    ADD CONSTRAINT personal_turnos_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: personal_turnos personal_turnos_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_turnos
    ADD CONSTRAINT personal_turnos_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno);


--
-- Name: personas_direcciones personas_direcciones_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas_direcciones
    ADD CONSTRAINT personas_direcciones_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE CASCADE;


--
-- Name: relaciones_personas relaciones_personas_id_persona_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_personas
    ADD CONSTRAINT relaciones_personas_id_persona_a_fkey FOREIGN KEY (id_persona_a) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: relaciones_personas relaciones_personas_id_persona_b_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_personas
    ADD CONSTRAINT relaciones_personas_id_persona_b_fkey FOREIGN KEY (id_persona_b) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: requisitos requisitos_id_rol_requerido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisitos
    ADD CONSTRAINT requisitos_id_rol_requerido_fkey FOREIGN KEY (id_rol_requerido) REFERENCES public.roles(id_rol);


--
-- Name: solicitudes_historial_estado solicitudes_historial_estado_id_cambiado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_historial_estado
    ADD CONSTRAINT solicitudes_historial_estado_id_cambiado_por_fkey FOREIGN KEY (id_cambiado_por) REFERENCES public.personal_sistema(id_persona) ON DELETE RESTRICT;


--
-- Name: solicitudes_historial_estado solicitudes_historial_estado_id_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_historial_estado
    ADD CONSTRAINT solicitudes_historial_estado_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES public.solicitudes_personal(id_solicitud) ON DELETE RESTRICT;


--
-- Name: solicitudes_personal solicitudes_personal_id_gestionado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_gestionado_por_fkey FOREIGN KEY (id_gestionado_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: solicitudes_personal solicitudes_personal_id_lider_propuesto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_lider_propuesto_fkey FOREIGN KEY (id_lider_propuesto) REFERENCES public.personal_lideres(id_lider) ON DELETE SET NULL;


--
-- Name: solicitudes_personal solicitudes_personal_id_mentor_propuesto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_mentor_propuesto_fkey FOREIGN KEY (id_mentor_propuesto) REFERENCES public.personal_sistema(id_persona);


--
-- Name: solicitudes_personal solicitudes_personal_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: solicitudes_personal solicitudes_personal_id_red_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_red_fkey FOREIGN KEY (id_red) REFERENCES public.redes(id_red);


--
-- Name: solicitudes_personal solicitudes_personal_id_resuelto_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_resuelto_por_fkey FOREIGN KEY (id_resuelto_por) REFERENCES public.personal_sistema(id_persona);


--
-- Name: solicitudes_personal solicitudes_personal_id_rol_solicitado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_personal
    ADD CONSTRAINT solicitudes_personal_id_rol_solicitado_fkey FOREIGN KEY (id_rol_solicitado) REFERENCES public.roles(id_rol);


--
-- Name: solicitudes_requisitos solicitudes_requisitos_id_requisito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_requisitos
    ADD CONSTRAINT solicitudes_requisitos_id_requisito_fkey FOREIGN KEY (id_requisito) REFERENCES public.requisitos(id_requisito);


--
-- Name: solicitudes_requisitos solicitudes_requisitos_id_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_requisitos
    ADD CONSTRAINT solicitudes_requisitos_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES public.solicitudes_personal(id_solicitud) ON DELETE CASCADE;


--
-- Name: telefonos_personas telefonos_personas_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telefonos_personas
    ADD CONSTRAINT telefonos_personas_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE CASCADE;


--
-- Name: tutores tutores_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutores
    ADD CONSTRAINT tutores_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id_persona) ON DELETE RESTRICT;


--
-- Name: tutores_ninos tutores_ninos_id_nino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutores_ninos
    ADD CONSTRAINT tutores_ninos_id_nino_fkey FOREIGN KEY (id_nino) REFERENCES public.ninos(id_persona) ON DELETE RESTRICT;


--
-- Name: tutores_ninos tutores_ninos_id_tutor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutores_ninos
    ADD CONSTRAINT tutores_ninos_id_tutor_fkey FOREIGN KEY (id_tutor) REFERENCES public.tutores(id_persona) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict ssuDHLVHVy19vh6f04c7v92z5HgfLDr09slNL0XsUitZjrMjsKgxLFndsPOLeHT

