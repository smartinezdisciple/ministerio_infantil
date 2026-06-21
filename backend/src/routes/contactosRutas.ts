// src/routes/contactosRutas.ts — Rutas del directorio de contactos
import { Router } from 'express';
import { verificarToken } from '../middlewares/autenticacion.js';
import { listarContactos } from '../controllers/contactosControlador.js';

const router = Router();

router.use(verificarToken);

/** GET /api/contactos */
router.get('/', listarContactos);

export default router;
