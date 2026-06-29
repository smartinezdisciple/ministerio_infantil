// src/routes/ninosRutas.ts — Rutas de niños (MVP-01, MVP-02)
import { Router } from 'express';
import { crearNino, crearNinoConPadresControlador, listar, listarIngreso, obtenerPorId, obtenerCompleto, actualizarNino, eliminarNino, listarExpedientesNinoControlador, crearExpedienteNinoControlador, resolverExpedienteNinoControlador } from '../controllers/ninosControlador.js';
import { fichaContactoNino } from '../controllers/contactosControlador.js';
import { listarTutoresPorNino, crearTutorYVincularControlador, actualizarTutorControlador, vincularTutorExistenteControlador } from '../controllers/tutoresControlador.js';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import { validar, esquemaNino, esquemaNinoConPadres } from '../middlewares/validacion.js';

const enrutador = Router();

// Todas las rutas de niños requieren autenticación
enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/**
 * GET /api/ninos — Lista todos los niños (nivel ≥ 1)
 */
enrutador.get('/', requerirNivel(1), listar);

/**
 * GET /api/ninos/ingreso — Lista niños con adulto responsable y hora de creación (nivel ≥ 1)
 */
enrutador.get('/ingreso', requerirNivel(1), listarIngreso);

/**
 * GET /api/ninos/:id — Detalle de un niño (nivel ≥ 1)
 */
enrutador.get('/:id', requerirNivel(1), obtenerPorId);

/**
 * GET /api/ninos/:id/completo — Detalle completo con padres para edición (nivel ≥ 3)
 */
enrutador.get('/:id/completo', requerirNivel(3), obtenerCompleto);

/**
 * GET /api/ninos/:id/contactos — Ficha de contactos del niño (nivel ≥ 1)
 */
enrutador.get('/:id/contactos', requerirNivel(1), fichaContactoNino);

/**
 * GET /api/ninos/:id/tutores — Lista tutores vinculados a un niño (nivel ≥ 1)
 */
enrutador.get('/:id/tutores', requerirNivel(1), listarTutoresPorNino);

/**
 * POST /api/ninos — Registrar nuevo niño sin padres (nivel ≥ 3, limitador + validación)
 */
enrutador.post(
  '/',
  requerirNivel(3),
  limitadorGeneral,
  validar(esquemaNino),
  crearNino
);

/**
 * POST /api/ninos/con-padres — Registrar niño + padres en una sola transacción (MVP-01 + MVP-03)
 * Nivel ≥ 3 (Staff / Coordinador).
 */
enrutador.post(
  '/con-padres',
  requerirNivel(3),
  limitadorGeneral,
  validar(esquemaNinoConPadres),
  crearNinoConPadresControlador
);

/**
 * PUT /api/ninos/:id — Actualizar los datos de un niño existente (MVP-01)
 * Nivel ≥ 3 (Staff / Coordinador).
 */
enrutador.put(
  '/:id',
  requerirNivel(3),
  limitadorGeneral,
  validar(esquemaNino),
  actualizarNino
);

/**
 * POST /api/ninos/tutores — Crear tutor y vincular a niño (nivel ≥ 1)
 */
enrutador.post(
  '/tutores',
  requerirNivel(1),
  limitadorGeneral,
  crearTutorYVincularControlador
);

/**
 * PUT /api/ninos/tutores/:id — Actualizar datos de un tutor (nivel ≥ 1)
 */
enrutador.put(
  '/tutores/:id',
  requerirNivel(1),
  limitadorGeneral,
  actualizarTutorControlador
);

/**
 * POST /api/ninos/tutores/vincular — Vincular tutor existente a un niño (nivel ≥ 1)
 */
enrutador.post(
  '/tutores/vincular',
  requerirNivel(1),
  limitadorGeneral,
  vincularTutorExistenteControlador
);

/**
 * DELETE /api/ninos/:idNino/tutores/:idTutor — Desvincular tutor de niño (P2-04)
 * Nivel ≥ 1 (cualquier staff puede desvincular).
 */
enrutador.delete(
  '/:idNino/tutores/:idTutor',
  requerirNivel(1),
  limitadorGeneral,
  async (req, res) => {
    const { idNino, idTutor } = req.params;
    try {
      const { rowCount } = await (await import('../config/db.js')).default.query(
        'DELETE FROM Tutores_Ninos WHERE ID_Nino = $1 AND ID_Tutor = $2',
        [Number(idNino), Number(idTutor)]
      );
      if ((rowCount ?? 0) === 0) {
        return res.status(404).json({ exito: false, mensaje: 'Vínculo tutor-niño no encontrado.' });
      }
      res.json({ exito: true, mensaje: 'Tutor desvinculado correctamente.' });
    } catch (err) {
      console.error('Error desvinculando tutor:', err);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
    }
  }
);

/**
 * DELETE /api/ninos/:id — Eliminar un niño y todos sus datos relacionados
 * Nivel ≥ 3 (Staff / Coordinador).
 */
enrutador.delete(
  '/:id',
  requerirNivel(3),
  limitadorGeneral,
  eliminarNino
);

/**
 * GET /api/ninos/:id/expedientes — Obtiene expedientes de un niño (nivel ≥ 1)
 */
enrutador.get(
  '/:id/expedientes',
  requerirNivel(1),
  listarExpedientesNinoControlador
);

/**
 * POST /api/ninos/:id/expedientes — Crea un expediente para un niño (nivel ≥ 2)
 */
enrutador.post(
  '/:id/expedientes',
  requerirNivel(2),
  limitadorGeneral,
  crearExpedienteNinoControlador
);

/**
 * PATCH /api/ninos/:id/expedientes/:idExp/resolver — Resuelve un expediente (nivel ≥ 2)
 */
enrutador.patch(
  '/:id/expedientes/:idExp/resolver',
  requerirNivel(2),
  limitadorGeneral,
  resolverExpedienteNinoControlador
);

export default enrutador;
