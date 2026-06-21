-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.5 — Sistema Hosanna Infantil
-- Rediseño de Estado Civil: solo 'Soltero' y 'Casado'
-- con nuevo ENUM condicion_civil para detallar historial.
-- ============================================================
-- PREREQUISITO: esquema v5.1 ya aplicado.
-- Ejecutar en BD de STAGING primero y verificar con las
-- consultas de validación al final antes de correr en PROD.
-- ============================================================

BEGIN;

-- ============================================================
-- PASO 1: Crear nuevo ENUM condicion_civil
-- ============================================================
DO $$ BEGIN
  CREATE TYPE condicion_civil AS ENUM (
    'Ninguna',                   -- Soltero sin historial de matrimonios
    'Divorciado_1er_Matrimonio', -- Soltero, divorciado del 1er matrimonio
    'Divorciado_2do_Matrimonio', -- Soltero, divorciado del 2do matrimonio
    'Divorciado_3er_Matrimonio', -- Soltero, divorciado del 3er matrimonio
    'Viudo',                     -- Soltero, viudo/a
    'Primer_Matrimonio'          -- Casado en su primer matrimonio (único valor para Casado)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PASO 2: Agregar columna Condicion_Civil en Solicitudes_Personal
-- ============================================================
ALTER TABLE Solicitudes_Personal
  ADD COLUMN IF NOT EXISTS Condicion_Civil condicion_civil NOT NULL DEFAULT 'Ninguna';

-- ============================================================
-- PASO 3: Agregar columna Condicion_Civil en Personal_Info_Personal
-- ============================================================
ALTER TABLE Personal_Info_Personal
  ADD COLUMN IF NOT EXISTS Condicion_Civil condicion_civil NOT NULL DEFAULT 'Ninguna';

COMMIT;

-- ============================================================
-- PASO 4: Migrar datos históricos en Solicitudes_Personal
-- Nota: ADD VALUE en PostgreSQL no puede correr dentro de una
-- transacción con DDL previo, por eso este bloque es separado.
-- ============================================================

-- Casados (primer matrimonio): incluye valores legacy de "casado"
UPDATE Solicitudes_Personal SET
  Estado_Civil   = 'Casado',
  Condicion_Civil = 'Primer_Matrimonio'
WHERE Estado_Civil IN ('Casado', 'Segundo_Matrimonio', 'Union_Libre', 'Acompañado');

-- Divorciados/Separados: mapear a Soltero con condición de 1er matrimonio
UPDATE Solicitudes_Personal SET
  Estado_Civil    = 'Soltero',
  Condicion_Civil = 'Divorciado_1er_Matrimonio'
WHERE Estado_Civil IN ('Divorciado', 'Separado', 'Madre_Soltera', 'Padre_Soltero');

-- Viudos: mantener como Soltero con condición Viudo
UPDATE Solicitudes_Personal SET
  Estado_Civil    = 'Soltero',
  Condicion_Civil = 'Viudo'
WHERE Estado_Civil = 'Viudo';

-- Solteros sin condición especial: Ninguna (ya es el DEFAULT, pero por claridad)
UPDATE Solicitudes_Personal SET
  Condicion_Civil = 'Ninguna'
WHERE Estado_Civil = 'Soltero' AND Condicion_Civil = 'Ninguna';

-- Casados: asegurar condicion correcta
UPDATE Solicitudes_Personal SET
  Condicion_Civil = 'Primer_Matrimonio'
WHERE Estado_Civil = 'Casado' AND Condicion_Civil = 'Ninguna';

-- ============================================================
-- PASO 5: Migrar datos en Personal_Info_Personal
-- ============================================================
UPDATE Personal_Info_Personal SET
  Estado_Civil    = 'Casado',
  Condicion_Civil = 'Primer_Matrimonio'
WHERE Estado_Civil IN ('Casado', 'Segundo_Matrimonio', 'Union_Libre', 'Acompañado');

UPDATE Personal_Info_Personal SET
  Estado_Civil    = 'Soltero',
  Condicion_Civil = 'Divorciado_1er_Matrimonio'
WHERE Estado_Civil IN ('Divorciado', 'Separado', 'Madre_Soltera', 'Padre_Soltero');

UPDATE Personal_Info_Personal SET
  Estado_Civil    = 'Soltero',
  Condicion_Civil = 'Viudo'
WHERE Estado_Civil = 'Viudo';

UPDATE Personal_Info_Personal SET
  Condicion_Civil = 'Primer_Matrimonio'
WHERE Estado_Civil = 'Casado' AND Condicion_Civil = 'Ninguna';

-- ============================================================
-- PASO 6: Actualizar constraints de cónyuge
-- Ahora solo 'Casado' requiere nombre de cónyuge.
-- ============================================================
BEGIN;

ALTER TABLE Personal_Info_Personal DROP CONSTRAINT IF EXISTS chk_conyuge;
ALTER TABLE Personal_Info_Personal
  ADD CONSTRAINT chk_conyuge
    CHECK (
      Estado_Civil <> 'Casado'
      OR Nombre_Conyuge IS NOT NULL
    );

ALTER TABLE Solicitudes_Personal DROP CONSTRAINT IF EXISTS chk_sol_conyuge;
ALTER TABLE Solicitudes_Personal
  ADD CONSTRAINT chk_sol_conyuge
    CHECK (
      Estado_Civil IS NULL
      OR Estado_Civil <> 'Casado'
      OR Nombre_Conyuge IS NOT NULL
    );

COMMIT;

-- ============================================================
-- CONSULTAS DE VALIDACIÓN — Ejecutar antes de aplicar en PROD
-- ============================================================

-- 1. Ninguna solicitud debe tener valores de estado civil eliminados
SELECT COUNT(*) AS solicitudes_con_valor_no_mapeado
FROM Solicitudes_Personal
WHERE Estado_Civil NOT IN ('Soltero', 'Casado');
-- Resultado esperado: 0

-- 2. Todos los casados deben tener condición = Primer_Matrimonio
SELECT COUNT(*) AS casados_sin_condicion_correcta
FROM Solicitudes_Personal
WHERE Estado_Civil = 'Casado' AND Condicion_Civil <> 'Primer_Matrimonio';
-- Resultado esperado: 0

-- 3. Verificar que el constraint de cónyuge no afecta registros existentes
SELECT COUNT(*) AS casados_sin_conyuge
FROM Solicitudes_Personal
WHERE Estado_Civil = 'Casado' AND Nombre_Conyuge IS NULL;
-- Resultado esperado: 0 (si hay valores, corregir manualmente antes de aplicar constraint)

-- 4. Verificar distribución de condicion_civil en Solicitudes_Personal
SELECT Estado_Civil, Condicion_Civil, COUNT(*) AS total
FROM Solicitudes_Personal
GROUP BY Estado_Civil, Condicion_Civil
ORDER BY Estado_Civil, Condicion_Civil;
