-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.3 — Sistema Hosanna Infantil
-- Eliminar 'Otro' de tipo_sexo. Preservar 'Masculino' y 'Femenino'.
-- ============================================================

BEGIN;

-- 1. Eliminar vistas que dependen del tipo_sexo
DROP VIEW IF EXISTS v_perfil_completo_personal;
DROP VIEW IF EXISTS v_solicitud_formulario_completo;

-- 2. Renombrar el tipo ENUM antiguo
ALTER TYPE tipo_sexo RENAME TO tipo_sexo_old;

-- 3. Crear el nuevo tipo ENUM sin 'Otro'
CREATE TYPE tipo_sexo AS ENUM ('Masculino', 'Femenino');

-- 4. Alterar las columnas en las tablas correspondientes
ALTER TABLE personas 
  ALTER COLUMN sexo TYPE tipo_sexo USING sexo::text::tipo_sexo;

ALTER TABLE solicitudes_personal 
  ALTER COLUMN sexo_candidato TYPE tipo_sexo USING sexo_candidato::text::tipo_sexo;

-- 5. Recrear la vista v_perfil_completo_personal
CREATE OR REPLACE VIEW v_perfil_completo_personal AS
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
   FROM ((((((((((((personal_sistema ps
     JOIN personas p ON ((ps.id_persona = p.id_persona)))
     JOIN roles r ON ((ps.id_rol = r.id_rol)))
     LEFT JOIN personal_info_personal pip ON ((ps.id_persona = pip.id_persona)))
     LEFT JOIN personal_info_iglesia pii ON ((ps.id_persona = pii.id_persona)))
     LEFT JOIN redes rd ON ((pii.id_red = rd.id_red)))
     LEFT JOIN circulos_amistad ca ON ((pii.id_circulo = ca.id_circulo)))
     LEFT JOIN personal_lideres pl ON ((pii.id_lider = pl.id_lider)))
     LEFT JOIN personas p_lider ON ((pl.id_persona = p_lider.id_persona)))
     LEFT JOIN telefonos_personas tp_lider ON (((p_lider.id_persona = tp_lider.id_persona) AND (tp_lider.es_principal = true) AND (tp_lider.activo = true))))
     LEFT JOIN personas_direcciones pd ON (((ps.id_persona = pd.id_persona) AND (pd.es_principal = true) AND (pd.activo = true))))
     LEFT JOIN telefonos_personas tp ON (((ps.id_persona = tp.id_persona) AND (tp.es_principal = true) AND (tp.activo = true))))
     LEFT JOIN LATERAL ( SELECT pss.id_suspension,
            pss.fecha_inicio,
            pss.fecha_fin,
            pss.categoria_motivo,
            pss.motivo
           FROM personal_suspensiones_servicio pss
          WHERE ((pss.id_personal = ps.id_persona) AND (pss.activo = true) AND (pss.fecha_inicio <= CURRENT_DATE) AND ((pss.fecha_fin IS NULL) OR (pss.fecha_fin >= CURRENT_DATE)))
         LIMIT 1) sus ON (true))
  ORDER BY p.apellidos, p.nombres;

-- 6. Recrear la vista v_solicitud_formulario_completo
CREATE OR REPLACE VIEW v_solicitud_formulario_completo AS
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
   FROM (((((((solicitudes_personal sp
     JOIN personas p ON ((sp.id_persona = p.id_persona)))
     JOIN roles r_sol ON ((sp.id_rol_solicitado = r_sol.id_rol)))
     JOIN personal_sistema ps_staff ON ((sp.id_gestionado_por = ps_staff.id_persona)))
     JOIN personas p_staff ON ((ps_staff.id_persona = p_staff.id_persona)))
     LEFT JOIN personal_lideres pl ON ((sp.id_lider_propuesto = pl.id_lider)))
     LEFT JOIN personas p_lider ON ((pl.id_persona = p_lider.id_persona)))
     LEFT JOIN telefonos_personas tp_lider ON (((p_lider.id_persona = tp_lider.id_persona) AND (tp_lider.es_principal = true) AND (tp_lider.activo = true))))
  ORDER BY sp.fecha_solicitud DESC;

-- 7. Eliminar el tipo ENUM antiguo
DROP TYPE tipo_sexo_old;

COMMIT;
