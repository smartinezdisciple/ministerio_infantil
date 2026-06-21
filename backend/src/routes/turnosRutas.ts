// src/routes/turnosRutas.ts — Rutas para el módulo de Turnos
import { Router } from 'express';
import { verificarToken, requerirNivel } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarTurnos,
  actualizarTurno,
} from '../controllers/turnosEventosControlador.js';

const enrutador = Router();

// Todos los endpoints requieren token válido
enrutador.use(verificarToken);

// GET /api/turnos — Lista todos los turnos (nivel ≥ 1)
enrutador.get('/', requerirNivel(1), listarTurnos);

// PATCH /api/turnos/:id — Actualiza el campo Activo de un turno (nivel ≥ 3)
enrutador.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarTurno);

export default enrutador;
