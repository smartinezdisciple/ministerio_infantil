-- Agregar columna Tipo a la tabla Fichas
ALTER TABLE Fichas ADD COLUMN IF NOT EXISTS Tipo VARCHAR(20) DEFAULT 'Entrada';