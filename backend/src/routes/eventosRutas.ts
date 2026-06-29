// src/routes/eventosRutas.ts — Rutas para el módulo de Eventos
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarEventos,
  crearEvento,
  actualizarEvento,
} from '../controllers/turnosEventosControlador.js';

const enrutador = Router();

// Todos los endpoints requieren token válido
enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

// GET /api/eventos?mes=YYYY-MM — Lista eventos activos (nivel ≥ 1)
enrutador.get('/', requerirNivel(1), listarEventos);

// POST /api/eventos — Crea un nuevo evento (nivel ≥ 3)
enrutador.post('/', requerirNivel(3), limitadorGeneral, crearEvento);

// PATCH /api/eventos/:id — Actualiza parcialmente un evento (nivel ≥ 3)
enrutador.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarEvento);

export default enrutador;
