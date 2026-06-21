-- backend/migracion_v5_4.sql — v5.4
-- Modifica la vista predictiva v_ninos_graduacion_mes para incluir la Edad e integridad de graduaciones (cumpleaños 13 en el futuro).

BEGIN;

DROP VIEW IF EXISTS v_ninos_graduacion_mes;

CREATE OR REPLACE VIEW v_ninos_graduacion_mes AS
SELECT
    p.Nombres,
    p.Apellidos,
    p.Fecha_Nacimiento,
    DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT AS Edad,
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
  -- Asegurar que aún no ha cumplido los 13 años (su cumpleaños 13 es hoy o en el futuro)
  AND (DATE_TRUNC('year', CURRENT_DATE)
      + (EXTRACT(MONTH FROM p.Fecha_Nacimiento) - 1 || ' months')::INTERVAL
      + (EXTRACT(DAY   FROM p.Fecha_Nacimiento) - 1 || ' days')::INTERVAL
  )::DATE >= CURRENT_DATE
ORDER BY Mes_Cumpleanos, Dia_Cumpleanos;

DROP VIEW IF EXISTS v_ninos_transicion_grupo_mes CASCADE;

CREATE OR REPLACE VIEW v_ninos_transicion_grupo_mes AS
WITH edad_calculada AS (
    SELECT
        p.ID_Persona,
        p.Nombres,
        p.Apellidos,
        p.Fecha_Nacimiento,
        -- Edad actual a día de hoy
        DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT AS Edad_Hoy,
        -- Edad proyectada a 3 meses
        DATE_PART('year', AGE((CURRENT_DATE + INTERVAL '3 months')::DATE, p.Fecha_Nacimiento))::INT AS Edad_Proyectada
    FROM Personas p
    JOIN Ninos n ON p.ID_Persona = n.ID_Persona
    -- Rango de edad normal de la escuela dominical (2 a 12 años)
    WHERE p.Fecha_Nacimiento BETWEEN
        (CURRENT_DATE - INTERVAL '14 years')::DATE
        AND
        (CURRENT_DATE - INTERVAL '2 years')::DATE
),
grupo_asignado AS (
    SELECT DISTINCT ON (ng.ID_Nino)
        ng.ID_Nino,
        ng.ID_Grupo                     AS ID_Grupo_Actual,
        g.Nombre                        AS Nombre_Grupo_Actual,
        g.Edad_Minima                   AS Actual_Edad_Min,
        g.Edad_Maxima                   AS Actual_Edad_Max
    FROM Ninos_Grupos ng
    JOIN Grupos g ON ng.ID_Grupo = g.ID_Grupo
    WHERE ng.Activo = TRUE
    ORDER BY ng.ID_Nino, ng.Fecha_Asignacion DESC
),
grupo_sugerido AS (
    SELECT
        ec.ID_Persona,
        g.ID_Grupo                      AS ID_Grupo_Sugerido,
        g.Nombre                        AS Nombre_Grupo_Sugerido
    FROM edad_calculada ec
    JOIN Grupos g
      ON ec.Edad_Proyectada >= g.Edad_Minima
     AND ec.Edad_Proyectada <= g.Edad_Maxima
     AND g.Activo = TRUE
)
SELECT
    ec.ID_Persona,
    ec.Nombres,
    ec.Apellidos,
    ec.Fecha_Nacimiento,
    ec.Edad_Hoy                        AS Edad_Este_Mes, -- Mantenemos alias para compatibilidad
    ga.Nombre_Grupo_Actual             AS Grupo_Actual,
    gs.Nombre_Grupo_Sugerido           AS Grupo_Sugerido,
    CASE
        WHEN ga.ID_Grupo_Actual IS NULL           THEN 'Sin_Asignacion'
        WHEN gs.ID_Grupo_Sugerido IS NULL         THEN 'Fuera_De_Rango'
        WHEN ga.ID_Grupo_Actual <> gs.ID_Grupo_Sugerido THEN 'Debe_Transicionar'
        ELSE 'En_Grupo_Correcto'
    END                                AS Estado_Transicion
FROM edad_calculada ec
LEFT JOIN grupo_asignado ga ON ec.ID_Persona = ga.ID_Nino
LEFT JOIN grupo_sugerido gs ON ec.ID_Persona = gs.ID_Persona
WHERE
    -- Caso 1: No está asignado a ningún grupo
    ga.ID_Grupo_Actual IS NULL
    -- Caso 2: Debe subir de grupo porque su edad proyectada a 3 meses es mayor que la edad máxima de su grupo actual.
    -- Pero excluimos si la edad proyectada ya lo saca de la escuela dominical (>= 13 años), ya que para eso se gradúa.
    OR (
        ga.ID_Grupo_Actual IS NOT NULL
        AND ec.Edad_Proyectada > ga.Actual_Edad_Max
        AND ec.Edad_Proyectada < 13
    )
ORDER BY ec.Edad_Proyectada DESC, ec.Apellidos;

COMMIT;
