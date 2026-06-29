import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { limitadorGeneral } from '../middlewares/rateLimiting.js';
import { listarRequisitos, crearRequisito, actualizarRequisito } from '../controllers/requisitosControlador.js';

const enrutador = Router();

// Verificar token en todas las rutas de requisitos
enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

// GET / — Listar requisitos (nivel 1 o superior)
enrutador.get('/', requerirNivel(1), listarRequisitos);

// POST / — Crear requisito (nivel 3 o superior)
enrutador.post('/', requerirNivel(3), limitadorGeneral, crearRequisito);

// PATCH /:id — Actualizar requisito (nivel 3 o superior)
enrutador.patch('/:id', requerirNivel(3), limitadorGeneral, actualizarRequisito);

export default enrutador;
