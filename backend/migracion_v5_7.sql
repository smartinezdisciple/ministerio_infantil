-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.7 — Sistema Hosanna Infantil
-- Extensión de condiciones de matrimonio para Casados
-- ============================================================

-- Nota: ALTER TYPE ADD VALUE no puede ejecutarse dentro de un bloque de transacción BEGIN/COMMIT en PostgreSQL.
-- Se ejecutan de forma directa e independiente.

-- Agregar valores para casados (2do, 3er u otros matrimonios)
ALTER TYPE condicion_civil ADD VALUE IF NOT EXISTS 'Segundo_Matrimonio';
ALTER TYPE condicion_civil ADD VALUE IF NOT EXISTS 'Tercer_Matrimonio';
ALTER TYPE condicion_civil ADD VALUE IF NOT EXISTS 'Otro_Matrimonio';

-- Redefinir la función de propagación para incluir la columna Condicion_Civil
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
