// src/routes/gruposRutas.ts — Rutas de grupos y asistencia por grupo
import { Router } from 'express';
import { verificarToken, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { listarGrupos, asistenciaGrupoHoy, turnosDisponiblesHoy } from '../controllers/gruposControlador.js';

const router = Router();

router.use(verificarToken);
router.use(restringirSiSoloLectura);

/** GET /api/grupos — Lista todos los grupos */
router.get('/', listarGrupos);

/** GET /api/grupos/turnos-hoy — Turnos con check-ins hoy (para Coordinador) */
router.get('/turnos-hoy', turnosDisponiblesHoy);

/** GET /api/grupos/:id/asistencia-hoy?idTurno=X */
router.get('/:id/asistencia-hoy', asistenciaGrupoHoy);

export default router;
