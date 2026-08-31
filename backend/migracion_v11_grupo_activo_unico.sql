-- migracion_v11_grupo_activo_unico.sql
-- Garantiza a nivel de BD que un niño tenga a lo sumo UNA fila ACTIVA en Ninos_Grupos.
-- Complementa el fix de actualizarNino (upsert ON CONFLICT en ninosRepositorio.ts):
-- incluso si otro flujo futuro intentara dejar dos asignaciones activas, la BD lo rechaza.
-- Verificado: 0 violaciones en producción al momento de crear esta migración.

CREATE UNIQUE INDEX IF NOT EXISTS uq_ninos_grupos_una_activa
ON Ninos_Grupos (ID_Nino)
WHERE Activo = TRUE;