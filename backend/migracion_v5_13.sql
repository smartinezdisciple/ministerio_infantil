-- migracion_v5_13.sql — Usuarios de solo lectura
-- Agrega columna Solo_Lectura a Personal_Sistema para usuarios que solo pueden ver datos

ALTER TABLE Personal_Sistema ADD COLUMN IF NOT EXISTS Solo_Lectura BOOLEAN NOT NULL DEFAULT FALSE;
