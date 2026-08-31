// src/routes/premiadosRutas.ts — Rutas del módulo Premiados
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { obtenerPremiados, guardar, eliminar } from '../controllers/premiadosControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/** GET /api/premiados — Lista premiados (opcional ?mes=YYYY-MM-01) */
enrutador.get('/', requerirNivel(3), obtenerPremiados);

/** POST /api/premiados/guardar — UPSERT de premiados de un mes */
enrutador.post('/guardar', requerirNivel(3), guardar);

/** DELETE /api/premiados/:id — Elimina un premiado */
enrutador.delete('/:id', requerirNivel(3), eliminar);

export default enrutador;
