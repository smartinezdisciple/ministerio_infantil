-- migracion_v5_12.sql — Concurrencia Optimista
-- Agrega columna de control de versiones a las tablas críticas del sistema

ALTER TABLE Personas ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
ALTER TABLE Ninos ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
ALTER TABLE Personal_Sistema ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
