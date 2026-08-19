// src/controllers/incidenciasControlador.ts — Controlador del módulo de incidencias
import type { Request, Response } from 'express';
import {
  listarIncidenciasVisibles,
  crearIncidencia,
  eliminarIncidencia,
} from '../services/incidenciasServicio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

/** GET /api/incidencias?turno=<id> — lista incidencias (con permiso por rol) */
export const listarIncidenciasControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const idTurno = req.query.turno ? Number(req.query.turno) : undefined;
    const resultado = await listarIncidenciasVisibles(req.usuario!, idTurno);
    respuestaExito(res, resultado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al listar las incidencias.';
    respuestaError(res, mensaje, 400);
  }
};

/** POST /api/incidencias — registra una incidencia para un turno */
export const crearIncidenciaControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await crearIncidencia(req.usuario!, req.body);
    respuestaExito(res, resultado, 201);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar la incidencia.';
    const codigo = mensaje.includes('No tiene permisos') ? 403 : 400;
    respuestaError(res, mensaje, codigo);
  }
};

/** DELETE /api/incidencias/:id — elimina una incidencia (coord. cualquier; staff la propia) */
export const eliminarIncidenciaControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const idIncidencia = Number(req.params.id);
    if (!Number.isInteger(idIncidencia) || idIncidencia <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }
    await eliminarIncidencia(idIncidencia, req.usuario!);
    respuestaExito(res, { idIncidencia });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al eliminar la incidencia.';
    if (mensaje.includes('no existe')) { respuestaError(res, mensaje, 404); return; }
    if (mensaje.includes('No tiene permisos')) { respuestaError(res, mensaje, 403); return; }
    respuestaError(res, mensaje, 400);
  }
};