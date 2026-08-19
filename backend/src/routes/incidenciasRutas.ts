// src/routes/incidenciasRutas.ts — Rutas del módulo de incidencias
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import { validar, esquemaIncidencia } from '../middlewares/validacion.js';
import {
  listarIncidenciasControlador,
  crearIncidenciaControlador,
  eliminarIncidenciaControlador,
} from '../controllers/incidenciasControlador.js';

const router = Router();

router.use(verificarToken);
router.use(restringirSiSoloLectura);

/** GET /api/incidencias?turno=<id> — visible solo para Staff y Coordinador (nivel ≥ 3) */
router.get('/', requerirNivel(3), listarIncidenciasControlador);

/** POST /api/incidencias — registrar una incidencia para un turno */
router.post('/', requerirNivel(3), limitadorGeneral, validar(esquemaIncidencia), crearIncidenciaControlador);

/** DELETE /api/incidencias/:id — eliminar una incidencia */
router.delete('/:id', requerirNivel(3), limitadorGeneral, eliminarIncidenciaControlador);

export default router;