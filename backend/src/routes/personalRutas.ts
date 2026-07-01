// src/routes/personalRutas.ts — Rutas de personal v5.1
import { Router } from 'express';
import { verificarToken, requerirNivel, permitirPropioONivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarPersonalHoy,
  misTurnos,
  registrarAsistenciaPersonal,
  listarCoordinadores,
  registrarPersonal,
  obtenerPersonalCompleto,
  actualizarPersonal,
  obtenerPerfilCompleto,
  listarPersonalDisponible,
  listarSuspensiones,
  suspenderPersonal,
  levantarSuspension,
  actualizarLider,
  listarPersonalCompleto,
  configurarAccesoPersonal,
  obtenerHistorialCambios,
} from '../controllers/personalControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/** GET /api/personal/asistencia-hoy — Nivel 1+ */
enrutador.get('/asistencia-hoy', listarPersonalHoy);

/** GET /api/personal/coordinadores — Lista staff/coordinadores para dropdown */
enrutador.get('/coordinadores', listarCoordinadores);

/** GET /api/personal/disponible — Personal sin suspensión vigente (nivel 3+) */
enrutador.get('/disponible', requerirNivel(3), listarPersonalDisponible);

/** GET /api/personal/mis-turnos — Turnos asignados al usuario logueado (nivel 1+) */
enrutador.get('/mis-turnos', misTurnos);

/** POST /api/personal/asistencia — Nivel 2+ (Maestro y superior) */
enrutador.post('/asistencia', requerirNivel(2), limitadorGeneral, registrarAsistenciaPersonal);

/** GET /api/personal/lista-completa — Todos los usuarios del sistema (nivel 4) */
enrutador.get('/lista-completa', requerirNivel(4), listarPersonalCompleto);

/** POST /api/personal — Registrar nuevo miembro (nivel 3+) */
enrutador.post('/', requerirNivel(3), limitadorGeneral, registrarPersonal);

// ─── Rutas con sufijos específicos ANTES de /:id ──────────────────────────────

/** GET /api/personal/:id/perfil-completo — Vista unificada v5.1 (nivel 3+ o propio usuario) */
enrutador.get('/:id/perfil-completo', permitirPropioONivel(3), obtenerPerfilCompleto);

/** GET /api/personal/:id/completo — Datos básicos para edición (nivel 3+) */
enrutador.get('/:id/completo', requerirNivel(3), obtenerPersonalCompleto);

/** PUT /api/personal/:id/configurar-acceso — Configurar usuario/contraseña/rol (nivel 4) */
enrutador.put('/:id/configurar-acceso', requerirNivel(4), limitadorGeneral, configurarAccesoPersonal);

/** GET /api/personal/:id/historial-cambios — Historial completo de cambios de perfil (nivel 3+ o propio) */
enrutador.get('/:id/historial-cambios', permitirPropioONivel(3), obtenerHistorialCambios);

/** GET /api/personal/:id/suspensiones — Historial de suspensiones (nivel 3+) */
enrutador.get('/:id/suspensiones', requerirNivel(3), listarSuspensiones);

/** POST /api/personal/:id/suspender — Registrar suspensión (nivel 4+) */
enrutador.post('/:id/suspender', requerirNivel(4), limitadorGeneral, suspenderPersonal);

/** PATCH /api/personal/:id/suspensiones/:idSus/levantar — Levantar suspensión (nivel 4+) */
enrutador.patch('/:id/suspensiones/:idSus/levantar', requerirNivel(4), limitadorGeneral, levantarSuspension);

/** PATCH /api/personal/:id/lider — Cambiar líder espiritual (nivel 3+) */
enrutador.patch('/:id/lider', requerirNivel(3), limitadorGeneral, actualizarLider);

/** PUT /api/personal/:id — Actualizar datos de un miembro (nivel 3+) */
enrutador.put('/:id', requerirNivel(3), limitadorGeneral, actualizarPersonal);

export default enrutador;
