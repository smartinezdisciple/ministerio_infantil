-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.9 — Sistema Hosanna Infantil
-- Incorporación de denominación en historial eclesiástico
-- ============================================================

-- Crear tipo ENUM para denominaciones de iglesias previas
CREATE TYPE tipo_denominacion AS ENUM ('Pentecostal', 'Evangelico', 'Católico', 'Testigo de Jehová', 'Otro');

-- Añadir columna de denominación a Solicitudes_Personal
ALTER TABLE Solicitudes_Personal 
    ADD COLUMN IF NOT EXISTS Denominacion_Otra_Iglesia tipo_denominacion DEFAULT NULL;

-- Añadir columnas de historial eclesiástico a Personal_Info_Iglesia
ALTER TABLE Personal_Info_Iglesia
    ADD COLUMN IF NOT EXISTS Asistio_Otra_Iglesia BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Nombre_Otra_Iglesia TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Denominacion_Otra_Iglesia tipo_denominacion DEFAULT NULL;

-- Redefinir la función de propagación para incluir Asistio_Otra_Iglesia, Nombre_Otra_Iglesia y Denominacion_Otra_Iglesia
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
