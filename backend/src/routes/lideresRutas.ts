// src/routes/lideresRutas.ts — Catálogo de Líderes Espirituales
import { Router } from 'express';
import { verificarToken, requerirNivel } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarLideres,
  obtenerLider,
  crearLider,
  inactivarLider,
} from '../controllers/lideresControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);

/** GET /api/lideres — Listar líderes activos (nivel 1+) */
enrutador.get('/', requerirNivel(1), listarLideres);

/** GET /api/lideres/:id — Detalle con supervisados (nivel 3+) */
enrutador.get('/:id', requerirNivel(3), obtenerLider);

/** POST /api/lideres — Registrar un miembro como líder (nivel 4+) */
enrutador.post('/', requerirNivel(4), limitadorGeneral, crearLider);

/** PATCH /api/lideres/:id/inactivar — Soft delete (nivel 4+) */
enrutador.patch('/:id/inactivar', requerirNivel(4), limitadorGeneral, inactivarLider);

export default enrutador;
