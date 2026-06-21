import { Router } from 'express';
import { verificarToken, requerirNivel } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import { listarRoles, crearRol, actualizarRol } from '../controllers/rolesControlador.js';

const enrutador = Router();

// Verificar token en todas las rutas de roles
enrutador.use(verificarToken);

// GET / — Listar roles (nivel 1 o superior)
enrutador.get('/', requerirNivel(1), listarRoles);

// POST / — Crear rol (nivel 3 o superior)
enrutador.post('/', requerirNivel(3), limitadorGeneral, crearRol);

// PATCH /:id — Actualizar rol (nivel 3 o superior)
enrutador.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarRol);

export default enrutador;
