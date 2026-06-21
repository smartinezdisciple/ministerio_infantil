-- migracion_v5_11.sql - Baja lógica de niños en base de datos
-- Agregar columna Activo a la tabla Ninos, por defecto TRUE

ALTER TABLE Ninos
ADD COLUMN Activo BOOLEAN NOT NULL DEFAULT TRUE;
