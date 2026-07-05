-- ==================================================================
-- migracion_v6_limpieza_personal.sql
-- Elimina Estado_Operativo y Estado_Operativo_Candidato (ya no se usan)
-- ==================================================================

-- 1. Recrear v_perfil_completo_personal sin Estado_Operativo
DROP VIEW IF EXISTS v_perfil_completo_personal;

CREATE VIEW v_perfil_completo_personal AS
SELECT
  ps.ID_Persona,
  CONCAT(p.Nombres, ' ', p.Apellidos)                              AS Nombre_Completo,
  p.Sexo,
  p.Cedula,
  p.Fecha_Nacimiento,
  DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT    AS Edad,
  r.Nombre_Rol                                                      AS Rol,
  ps.Activo,
  pd.Ciudad_Departamento,
  pd.Municipio,
  pd.Distrito,
  pd.Barrio,
  pd.Direccion_Exacta,
  tp.Numero                                                         AS Telefono_Principal,
  tp.Tipo                                                           AS Tipo_Telefono_Principal,
  tp.Tiene_Whatsapp                                                 AS Principal_Tiene_Whatsapp,
  pip.Estado_Civil,
  pip.Nombre_Conyuge,
  pip.Tiene_Hijos,
  pip.Numero_Hijos,
  pip.Ocupacion,
  pip.Centro_Laboral,
  pip.Nivel_Academico,
  pii.Bautizado_Agua,
  pii.Fecha_Bautismo,
  rd.Nombre                                                         AS Red,
  ca.Nombre                                                         AS Circulo_Amistad,
  pii.Circulo_Amistad_Desde,
  pii.Tiempo_Iglesia_Meses,
  pii.Ministerio_Adicional,
  pii.Clases_Biblicas_Ninos,
  pii.Capacitacion_Ensenanza,
  pii.Observaciones_Espirituales,
  pl.ID_Lider,
  CONCAT(p_lider.Nombres, ' ', p_lider.Apellidos)                   AS Nombre_Lider,
  tp_lider.Numero                                                   AS Tel_Lider,
  CASE WHEN sus.ID_Suspension IS NOT NULL THEN TRUE ELSE FALSE END  AS En_Suspension,
  sus.Fecha_Inicio                                                  AS Suspension_Desde,
  sus.Fecha_Fin                                                     AS Suspension_Hasta,
  sus.Categoria_Motivo                                              AS Categoria_Suspension,
  sus.Motivo                                                        AS Motivo_Suspension
FROM Personal_Sistema ps
JOIN Personas p ON ps.ID_Persona = p.ID_Persona
JOIN Roles r ON ps.ID_Rol = r.ID_Rol
LEFT JOIN Personal_Info_Personal pip ON ps.ID_Persona = pip.ID_Persona
LEFT JOIN Personal_Info_Iglesia pii ON ps.ID_Persona = pii.ID_Persona
LEFT JOIN Redes rd ON pii.ID_Red = rd.ID_Red
LEFT JOIN Circulos_Amistad ca ON pii.ID_Circulo = ca.ID_Circulo
LEFT JOIN Personal_Lideres pl ON pii.ID_Lider = pl.ID_Lider
LEFT JOIN Personas p_lider ON pl.ID_Persona = p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider
  ON p_lider.ID_Persona = tp_lider.ID_Persona
  AND tp_lider.Es_Principal = TRUE AND tp_lider.Activo = TRUE
LEFT JOIN Personas_Direcciones pd
  ON ps.ID_Persona = pd.ID_Persona
  AND pd.Es_Principal = TRUE AND pd.Activo = TRUE
LEFT JOIN Telefonos_Personas tp
  ON ps.ID_Persona = tp.ID_Persona
  AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
LEFT JOIN LATERAL (
  SELECT pss.ID_Suspension, pss.Fecha_Inicio, pss.Fecha_Fin,
         pss.Categoria_Motivo, pss.Motivo
  FROM Personal_Suspensiones_Servicio pss
  WHERE pss.ID_Personal = ps.ID_Persona
    AND pss.Activo = TRUE
    AND pss.Fecha_Inicio <= CURRENT_DATE
    AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin >= CURRENT_DATE)
  LIMIT 1
) sus ON TRUE
ORDER BY p.Apellidos, p.Nombres;

-- 2. Recrear v_solicitud_formulario_completo sin Estado_Operativo_Candidato
DROP VIEW IF EXISTS v_solicitud_formulario_completo;

CREATE VIEW v_solicitud_formulario_completo AS
SELECT
  sp.ID_Solicitud,
  sp.Fecha_Solicitud::DATE                                          AS Fecha_Formulario,
  CONCAT(p.Nombres, ' ', p.Apellidos)                               AS Candidato,
  sp.Sexo_Candidato                                                 AS Sexo,
  sp.Cedula_Candidato                                               AS Cedula,
  p.Fecha_Nacimiento,
  sp.Tel_Casa,
  sp.Tel_Oficina,
  sp.Tel_Claro,
  sp.Tel_Movistar,
  sp.Dir_Ciudad,
  sp.Dir_Municipio,
  sp.Dir_Distrito,
  sp.Dir_Barrio,
  sp.Dir_Exacta,
  sp.Ocupacion_Candidato,
  sp.Centro_Laboral_Candidato,
  sp.Nivel_Academico_Candidato                                      AS Nivel_Academico,
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
  sp.Observaciones_Espirituales_Sol                                 AS Observaciones_Espirituales,
  r_sol.Nombre_Rol                                                   AS Rol_Solicitado,
  sp.Estado,
  CONCAT(p_lider.Nombres, ' ', p_lider.Apellidos)                   AS Lider_Propuesto,
  tp_lider.Numero                                                    AS Tel_Lider,
  CONCAT(p_staff.Nombres, ' ', p_staff.Apellidos)                   AS Gestionado_Por,
  sp.Notas_Staff,
  sp.Notas_Coordinador
FROM Solicitudes_Personal sp
JOIN Personas p ON sp.ID_Persona = p.ID_Persona
JOIN Roles r_sol ON sp.ID_Rol_Solicitado = r_sol.ID_Rol
JOIN Personal_Sistema ps_staff ON sp.ID_Gestionado_Por = ps_staff.ID_Persona
JOIN Personas p_staff ON ps_staff.ID_Persona = p_staff.ID_Persona
LEFT JOIN Personal_Lideres pl ON sp.ID_Lider_Propuesto = pl.ID_Lider
LEFT JOIN Personas p_lider ON pl.ID_Persona = p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider
  ON p_lider.ID_Persona = tp_lider.ID_Persona
  AND tp_lider.Es_Principal = TRUE AND tp_lider.Activo = TRUE
ORDER BY sp.Fecha_Solicitud DESC;

-- 3. Eliminar columnas
ALTER TABLE Personal_Info_Iglesia DROP COLUMN IF EXISTS Estado_Operativo;
ALTER TABLE Solicitudes_Personal DROP COLUMN IF EXISTS Estado_Operativo_Candidato;

-- 4. Eliminar el ENUM si ya no lo usa ninguna columna
DROP TYPE IF EXISTS estado_operativo;
