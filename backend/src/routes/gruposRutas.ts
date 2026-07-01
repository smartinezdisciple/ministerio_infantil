// src/routes/gruposRutas.ts — Rutas de grupos y asistencia por grupo
import { Router } from 'express';
import { verificarToken, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { listarGrupos } from '../controllers/gruposControlador.js';

const router = Router();

router.use(verificarToken);
router.use(restringirSiSoloLectura);

/** GET /api/grupos — Lista todos los grupos */
router.get('/', listarGrupos);

export default router;
