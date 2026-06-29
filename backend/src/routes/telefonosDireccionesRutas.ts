// src/routes/telefonosDireccionesRutas.ts — CRUD de Teléfonos y Direcciones normalizados
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import {
  listarTelefonos,
  agregarTelefono,
  editarTelefono,
  eliminarTelefono,
  listarDirecciones,
  agregarDireccion,
  editarDireccion,
  eliminarDireccion,
} from '../controllers/telefonosDireccionesControlador.js';
import {
  listarPersonas,
  crearPersona,
  actualizarPersona,
  asignarRolesPersona,
} from '../controllers/personasControlador.js';

const enrutador = Router({ mergeParams: true }); // mergeParams para acceder a :id de la ruta padre

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

// ── Rutas Raíz de Personas (Gestión de Personas y Roles Funcionales) ──────────
/** GET /api/personas — Nivel 3+ */
enrutador.get('/', requerirNivel(3), listarPersonas);

/** POST /api/personas — Nivel 3+ */
enrutador.post('/', requerirNivel(3), limitadorGeneral, crearPersona);

/** PUT /api/personas/:id — Nivel 3+ */
enrutador.put('/:id', requerirNivel(3), limitadorGeneral, actualizarPersona);

/** PATCH /api/personas/:id/roles — Nivel 3+ */
enrutador.patch('/:id/roles', requerirNivel(3), limitadorGeneral, asignarRolesPersona);


// ── Teléfonos ──────────────────────────────────────────────────────────────
/** GET /api/personas/:id/telefonos */
enrutador.get('/:id/telefonos', requerirNivel(1), listarTelefonos);

/** POST /api/personas/:id/telefonos */
enrutador.post('/:id/telefonos', requerirNivel(3), limitadorGeneral, agregarTelefono);

/** PATCH /api/personas/:id/telefonos/:idTel */
enrutador.patch('/:id/telefonos/:idTel', requerirNivel(3), limitadorGeneral, editarTelefono);

/** DELETE /api/personas/:id/telefonos/:idTel */
enrutador.delete('/:id/telefonos/:idTel', requerirNivel(3), eliminarTelefono);

// ── Direcciones ────────────────────────────────────────────────────────────
/** GET /api/personas/:id/direcciones */
enrutador.get('/:id/direcciones', requerirNivel(1), listarDirecciones);

/** POST /api/personas/:id/direcciones */
enrutador.post('/:id/direcciones', requerirNivel(3), limitadorGeneral, agregarDireccion);

/** PATCH /api/personas/:id/direcciones/:idDir */
enrutador.patch('/:id/direcciones/:idDir', requerirNivel(3), limitadorGeneral, editarDireccion);

/** DELETE /api/personas/:id/direcciones/:idDir */
enrutador.delete('/:id/direcciones/:idDir', requerirNivel(3), eliminarDireccion);

export default enrutador;
