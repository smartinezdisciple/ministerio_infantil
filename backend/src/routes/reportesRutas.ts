// src/routes/reportesRutas.ts — Rutas de exportación de reportes (Spec §9.12)
import { Router } from 'express';
import { verificarToken, requerirNivel, restringirSiSoloLectura } from '../middlewares/autenticacion.js';
import { exportarCSV, exportarExcel, obtenerNinosPorGrupoDatos, obtenerCumpleanosDatos, exportarIncidenciasExcel } from '../controllers/reportesControlador.js';

const enrutador = Router();

enrutador.use(verificarToken);
enrutador.use(restringirSiSoloLectura);

/**
 * GET /api/reportes/ninos-por-grupo/datos
 * Nivel 3+
 */
enrutador.get('/ninos-por-grupo/datos', requerirNivel(3), obtenerNinosPorGrupoDatos);

/**
 * GET /api/reportes/cumpleanos/datos
 * Nivel 3+
 */
enrutador.get('/cumpleanos/datos', requerirNivel(3), obtenerCumpleanosDatos);

/**
 * GET /api/reportes/incidencias/excel
 * Reporte especial con plantilla según día (incidencias_domingo.xlsx o incidencias_miercoles.xlsx)
 */
enrutador.get('/incidencias/excel', requerirNivel(3), exportarIncidenciasExcel);

/**
 * GET /api/reportes/:tipo/csv
 * Tipos: ninos | asistencia-ninos | asistencia-maestros | fichas | solicitudes
 */
enrutador.get('/:tipo/csv', requerirNivel(3), exportarCSV);

/**
 * GET /api/reportes/:tipo/excel
 * Tipos: ninos | asistencia-ninos | asistencia-maestros | fichas | solicitudes
 */
enrutador.get('/:tipo/excel', requerirNivel(3), exportarExcel);

export default enrutador;
