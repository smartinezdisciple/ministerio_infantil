-- migracion_v7_actualizar_trigger_aprobacion.sql
-- Elimina la referencia a Estado_Operativo (columna y tipo eliminados en v6)
-- del trigger fn_propagar_datos_solicitud_aprobada.

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

        INSERT INTO Personal_Info_Iglesia (ID_Persona,ID_Red,Estado_Liderazgo,ID_Lider,ID_Circulo,Tiempo_Iglesia_Meses,Ministerio_Adicional,Bautizado_Agua,Fecha_Bautismo,Fecha_Bautismo_Precision,Circulo_Amistad_Desde,Circulo_Amistad_Precision,Clases_Biblicas_Ninos,Clases_Biblicas_Detalle,Capacitacion_Ensenanza,Capacitacion_Detalle,Observaciones_Espirituales,Asistio_Otra_Iglesia,Nombre_Otra_Iglesia,Denominacion_Otra_Iglesia)
        SELECT ps.ID_Persona,NEW.ID_Red,NEW.Estado_Liderazgo,NEW.ID_Lider_Propuesto,(SELECT ID_Circulo FROM Circulos_Amistad WHERE TRIM(Nombre)=TRIM(NEW.Circulo_Amistad) LIMIT 1),NEW.Tiempo_Iglesia_Meses,NEW.Ministerio_Adicional,NEW.Bautizado_Agua,NEW.Fecha_Bautismo,NEW.Fecha_Bautismo_Precision,NEW.Circulo_Amistad_Desde,NEW.Circulo_Amistad_Precision,NEW.Clases_Biblicas_Ninos,NEW.Clases_Biblicas_Detalle,NEW.Capacitacion_Ensenanza,NEW.Capacitacion_Detalle,NEW.Observaciones_Espirituales_Sol,NEW.Asistio_Otra_Iglesia,NEW.Nombre_Otra_Iglesia,NEW.Denominacion_Otra_Iglesia
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

-- Recrear el trigger (por si acaso se dropeó)
DROP TRIGGER IF EXISTS trg_propagar_datos_solicitud ON Solicitudes_Personal;
CREATE TRIGGER trg_propagar_datos_solicitud AFTER UPDATE OF Estado ON Solicitudes_Personal FOR EACH ROW EXECUTE FUNCTION fn_propagar_datos_solicitud_aprobada();
