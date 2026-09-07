// src/routes/ligaBiblicaRutas.ts — Rutas del módulo Liga Bíblica
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import {
  obtenerParticipantes,
  inscribir,
  actualizarTutorDelParticipante,
  eliminar,
} from '../controllers/ligaBiblicaControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/** GET /api/liga-biblica — Lista participantes (opcional ?mes=YYYY-MM) */
enrutador.get('/', requerirNivel(2), obtenerParticipantes);

/** POST /api/liga-biblica — Inscribe un niño con su turno y tutor único */
enrutador.post('/', requerirNivel(2), inscribir);

/** PATCH /api/liga-biblica/:id — Actualiza el tutor seleccionado */
enrutador.patch('/:id', requerirNivel(2), actualizarTutorDelParticipante);

/** DELETE /api/liga-biblica/:id — Elimina un participante */
enrutador.delete('/:id', requerirNivel(2), eliminar);

export default enrutador;