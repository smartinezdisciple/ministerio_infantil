-- ============================================================
-- MIGRACIÓN BASE DE DATOS v5.2 — Sistema Hosanna Infantil
-- Basado en feedback de Solicitudes y Requisitos de Formación
-- ============================================================

-- Añadir 'Miembro' al enum estado_liderazgo
ALTER TYPE estado_liderazgo ADD VALUE IF NOT EXISTS 'Miembro';

-- Insertar nuevos requisitos
INSERT INTO requisitos (id_requisito, nombre, tipo, obligatorio) VALUES
    (6, 'Bautizado en Agua', 'Estado_Ministerial', TRUE),
    (7, 'Pertenecer a Círculo de Amistad', 'Estado_Ministerial', TRUE)
ON CONFLICT (id_requisito) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    tipo = EXCLUDED.tipo,
    obligatorio = EXCLUDED.obligatorio;

-- Marcar Escuela de Obreros como obligatorio
UPDATE requisitos SET obligatorio = TRUE WHERE id_requisito = 5;

-- Marcar los demás como opcionales
UPDATE requisitos SET obligatorio = FALSE WHERE id_requisito IN (2, 3, 4);

SELECT setval('requisitos_id_requisito_seq', COALESCE((SELECT MAX(id_requisito) FROM requisitos), 1));
