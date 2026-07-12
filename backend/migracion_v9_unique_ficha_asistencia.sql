-- migracion_v9_unique_ficha_asistencia.sql
-- Previene concurrencia: dos check-in con la misma ficha en el mismo turno y fecha.
-- Ver especificación en AGENTS.md — Opción 1 para concurrencia en asistencia.

CREATE UNIQUE INDEX IF NOT EXISTS uq_asistencia_ficha_fecha_turno
ON Asistencia_Ninos (ID_Ficha_Entrada, Fecha, ID_Turno)
WHERE ID_Ficha_Entrada IS NOT NULL;
