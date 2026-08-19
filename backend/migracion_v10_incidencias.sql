-- migracion_v10_incidencias.sql — Módulo de Incidencias por turno
--
-- Registro de incidencias reportadas por el personal (Staff / Coordinador General).
-- Cada registro pertenece a un turno y a un tipo; el texto admite una o varias
-- incidencias por registro.

BEGIN;

DO $$ BEGIN
  CREATE TYPE tipo_incidencia AS ENUM ('Ninos', 'Maestros', 'Infraestructura', 'Observaciones');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS Incidencias (
    ID_Incidencia SERIAL         PRIMARY KEY,
    ID_Turno      INT            NOT NULL REFERENCES Turnos(ID_Turno) ON DELETE RESTRICT,
    ID_Personal   INT            NOT NULL REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Tipo          tipo_incidencia NOT NULL,
    Descripcion   TEXT           NOT NULL,
    Fecha         DATE           NOT NULL DEFAULT CURRENT_DATE,
    Creado_En     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidencias_turno    ON Incidencias (ID_Turno, Fecha DESC);
CREATE INDEX IF NOT EXISTS idx_incidencias_personal ON Incidencias (ID_Personal);
CREATE INDEX IF NOT EXISTS idx_incidencias_tipo     ON Incidencias (Tipo);

COMMIT;