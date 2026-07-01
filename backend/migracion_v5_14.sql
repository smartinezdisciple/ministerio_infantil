-- migracion_v5_14.sql — Columna Es_Primera_Vez en Asistencia_Ninos
--
-- Permite identificar si un registro de asistencia corresponde a la
-- primera vez que el niño asiste (sin subconsultas GROUP BY pesadas).

ALTER TABLE Asistencia_Ninos
  ADD COLUMN IF NOT EXISTS Es_Primera_Vez BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: marcar como primera vez toda asistencia que no tenga
-- ninguna otra asistencia anterior del mismo niño.
-- El índice (ID_Nino, Fecha) hace esto eficiente.
UPDATE Asistencia_Ninos an
SET Es_Primera_Vez = TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM Asistencia_Ninos an2
  WHERE an2.ID_Nino = an.ID_Nino AND an2.Fecha < an.Fecha
);
