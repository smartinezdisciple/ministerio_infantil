// src/routes/asistenciaRutas.ts — Rutas de asistencia de niños (check-in / check-out)
import { Router } from 'express';
import { verificarToken } from '../middlewares/autenticacion.js';
import {
  listarAsistenciaDia,
  registrarCheckIn,
  registrarCheckOut,
  actualizarAsistencia,
  eliminarAsistencia,
} from '../controllers/asistenciaControlador.js';

const router = Router();

router.use(verificarToken);

/** GET /api/asistencia?fecha=YYYY-MM-DD&grupo=<id>&turno=<id> */
router.get('/', listarAsistenciaDia);

/** POST /api/asistencia/checkin */
router.post('/checkin', registrarCheckIn);

/** PATCH /api/asistencia/:id/checkout */
router.patch('/:id/checkout', registrarCheckOut);

/** PATCH /api/asistencia/:id */
router.patch('/:id', actualizarAsistencia);

/** DELETE /api/asistencia/:id */
router.delete('/:id', eliminarAsistencia);

export default router;
