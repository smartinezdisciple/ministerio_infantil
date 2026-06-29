// src/routes/dashboardRutas.ts — Rutas del Tablero (Spec §9.1)
// Sub-endpoints separados para que coincidan con las 8 llamadas del frontend.
import { Router } from 'express';
import {
  obtenerDashboard,
  obtenerMetricas,
  obtenerCumpleaneros,
  obtenerAlertasMedicas,
  obtenerAsistenciaMensual,
  obtenerDistribucionGrupos,
  obtenerAsistenciaPorRol,
  obtenerComparativaMensual,
  obtenerSolicitudesPendientes,
  obtenerNinosGraduacion,
  obtenerNinosTransicion,
  obtenerPersonalDisponibleDashboard,
} from '../controllers/dashboardControlador.js';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/** GET /api/dashboard — Endpoint legado (bloque completo) */
enrutador.get('/', requerirNivel(1), obtenerDashboard);

/** GET /api/dashboard/metricas */
enrutador.get('/metricas', requerirNivel(1), obtenerMetricas);

/** GET /api/dashboard/cumpleaneros */
enrutador.get('/cumpleaneros', requerirNivel(1), obtenerCumpleaneros);

/** GET /api/dashboard/alertas-medicas */
enrutador.get('/alertas-medicas', requerirNivel(1), obtenerAlertasMedicas);

/** GET /api/dashboard/asistencia-mensual */
enrutador.get('/asistencia-mensual', requerirNivel(1), obtenerAsistenciaMensual);

/** GET /api/dashboard/distribucion-grupos */
enrutador.get('/distribucion-grupos', requerirNivel(1), obtenerDistribucionGrupos);

/** GET /api/dashboard/asistencia-por-rol */
enrutador.get('/asistencia-por-rol', requerirNivel(1), obtenerAsistenciaPorRol);

/** GET /api/dashboard/comparativa-mensual */
enrutador.get('/comparativa-mensual', requerirNivel(1), obtenerComparativaMensual);

/** GET /api/dashboard/solicitudes-pendientes (solo Staff+) */
enrutador.get('/solicitudes-pendientes', requerirNivel(3), obtenerSolicitudesPendientes);

/** GET /api/dashboard/ninos-graduacion — Niños que cumplen 13 años este año */
enrutador.get('/ninos-graduacion', requerirNivel(3), obtenerNinosGraduacion);

/** GET /api/dashboard/ninos-transicion — Niños que deben cambiar de grupo */
enrutador.get('/ninos-transicion', requerirNivel(3), obtenerNinosTransicion);

/** GET /api/dashboard/personal-disponible — Personal activo sin suspensión vigente */
enrutador.get('/personal-disponible', requerirNivel(3), obtenerPersonalDisponibleDashboard);

export default enrutador;
