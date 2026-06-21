-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.10 — Sistema Hosanna Infantil
-- Modificación de check constraint y grupo etario para incluir menores de 4 años
-- ============================================================

-- Eliminar restricción de edad mínima >= 2
ALTER TABLE Grupos DROP CONSTRAINT IF EXISTS chk_edades_grupo;

-- Agregar nueva restricción que permita edad mínima >= 0
ALTER TABLE Grupos ADD CONSTRAINT chk_edades_grupo 
    CHECK (edad_minima >= 0 AND edad_maxima <= 12 AND edad_minima < edad_maxima);

-- Modificar el grupo 1 para que acepte de 0 a 6 años y se llame '4-6 años'
UPDATE Grupos 
SET Nombre = '4-6 años', Edad_Minima = 0, Edad_Maxima = 6 
WHERE ID_Grupo = 1;
