// src/routes/circulosRutas.ts — Catálogo de Círculos de Amistad
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarCirculos,
  crearCirculo,
  actualizarCirculo,
} from '../controllers/circulosControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/** GET /api/circulos — Listar círculos activos (nivel 1+) */
enrutador.get('/', requerirNivel(1), listarCirculos);

/** POST /api/circulos — Crear círculo (nivel 4+) */
enrutador.post('/', requerirNivel(4), limitadorGeneral, crearCirculo);

/** PATCH /api/circulos/:id — Editar nombre/descripción (nivel 4+) */
enrutador.patch('/:id', requerirNivel(4), limitadorGeneral, actualizarCirculo);

export default enrutador;
