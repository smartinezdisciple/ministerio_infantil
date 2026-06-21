// src/routes/fichasRutas.ts — Rutas de fichas/tokens de entrada
import { Router } from 'express';
import { verificarToken, requerirNivel } from '../middlewares/autenticacion.js';
import {
  listarFichas,
  obtenerDisponibilidad,
  crearFicha,
  actualizarFicha,
  historialFicha,
} from '../controllers/fichasControlador.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';

const router = Router();

router.use(verificarToken);

/** GET /api/fichas?estado=Activa */
router.get('/', requerirNivel(1), listarFichas);

/** GET /api/fichas/disponibilidad */
router.get('/disponibilidad', requerirNivel(1), obtenerDisponibilidad);

/** GET /api/fichas/:id/historial — Historial de uso (P3-01) */
router.get('/:id/historial', requerirNivel(1), historialFicha);

/** POST /api/fichas — Crear ficha (nivel ≥ 3) */
router.post('/', requerirNivel(3), limitadorGeneral, crearFicha);

/** PATCH /api/fichas/:id — Actualizar ficha (nivel ≥ 3) */
router.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarFicha);

export default router;
