import { Router } from 'express';
import { verificarToken, requerirNivel } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import { listarRedes, crearRed, actualizarRed } from '../controllers/redesControlador.js';

const enrutador = Router();

// Verificar token en todas las rutas de redes
enrutador.use(verificarToken);

// GET / — Listar redes (nivel 1 o superior)
enrutador.get('/', requerirNivel(1), listarRedes);

// POST / — Crear red (nivel 3 o superior)
enrutador.post('/', requerirNivel(3), limitadorGeneral, crearRed);

// PATCH /:id — Actualizar red (nivel 3 o superior)
enrutador.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarRed);

export default enrutador;
