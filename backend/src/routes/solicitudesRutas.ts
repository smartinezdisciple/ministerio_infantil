// src/routes/solicitudesRutas.ts — Rutas del módulo de Solicitudes de Personal v5.1
// Sin estado 'Borrador' → sin ruta /enviar. Flujo: Pendiente → Aprobado/Rechazado/En_Revision.
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarSolicitudes,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  marcarEnRevision,
  actualizarSolicitud,
  obtenerRequisitosSolicitud,
  actualizarRequisitoSolicitud,
  obtenerHistorialSolicitud,
} from '../controllers/solicitudesControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

// GET / — Listar solicitudes con filtro opcional por estado (nivel 3+)
enrutador.get('/', requerirNivel(3), listarSolicitudes);

// POST / — Crear nueva solicitud en estado Pendiente (nivel 3+)
enrutador.post('/', requerirNivel(3), limitadorGeneral, crearSolicitud);

// ─── Rutas con sufijos específicos ANTES de /:id ─────────────────────────────

// PATCH /:id/aprobar — Aprobar solicitud (solo nivel 4: Coordinador General)
enrutador.patch('/:id/aprobar', requerirNivel(3), limitadorGeneral, aprobarSolicitud);

// PATCH /:id/rechazar — Rechazar solicitud (solo nivel 4: Coordinador General)
enrutador.patch('/:id/rechazar', requerirNivel(3), limitadorGeneral, rechazarSolicitud);

// PATCH /:id/revisar — Marcar como En_Revision (nivel 3+)
enrutador.patch('/:id/revisar', requerirNivel(3), limitadorGeneral, marcarEnRevision);

// GET /:id/requisitos — Obtener requisitos de una solicitud (nivel 3+)
enrutador.get('/:id/requisitos', requerirNivel(3), obtenerRequisitosSolicitud);

// PATCH /:id/requisitos/:idRequisito — Actualizar un requisito (nivel 3+)
enrutador.patch(
  '/:id/requisitos/:idRequisito',
  requerirNivel(3),
  limitadorGeneral,
  actualizarRequisitoSolicitud
);

// GET /:id/historial — Historial de cambios de estado (nivel 3+)
enrutador.get('/:id/historial', requerirNivel(3), obtenerHistorialSolicitud);

// ─── Ruta genérica /:id al FINAL ─────────────────────────────────────────────

// PATCH /:id — Actualizar campos de una solicitud Pendiente (nivel 3+)
enrutador.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarSolicitud);

export default enrutador;
