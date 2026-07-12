import type { Request, Response } from 'express';
import {
  listarAsistencia,
  realizarCheckIn,
  realizarCheckOut,
  modificarAsistencia,
  removerAsistencia,
} from '../services/asistenciaServicio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

export const listarAsistenciaDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const fecha   = req.query.fecha as string | undefined;
    const idGrupo = req.query.grupo ? Number(req.query.grupo) : undefined;
    const idTurno = req.query.turno ? Number(req.query.turno) : undefined;

    const resultado = await listarAsistencia(fecha, idGrupo, idTurno);
    respuestaExito(res, resultado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al listar la asistencia.';
    respuestaError(res, mensaje, 500);
  }
};

export const registrarCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRegistradoPor = req.usuario!.idPersona;
    const resultado = await realizarCheckIn(req.body, idRegistradoPor);
    respuestaExito(res, resultado, 201);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el check-in.';
    const codigo = mensaje.includes('ya fue utilizada') || mensaje.includes('ya tiene') || mensaje.includes('no está activa') ? 409 : 400;
    respuestaError(res, mensaje, codigo);
  }
};

export const registrarCheckOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const idAsistencia  = Number(req.params.id);
    if (!Number.isInteger(idAsistencia) || idAsistencia <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }

    const { idRetiradoPor, id_ficha_salida } = req.body;
    const idCheckoutPor = req.usuario!.idPersona;

    const resultado = await realizarCheckOut(idAsistencia, idRetiradoPor, idCheckoutPor, id_ficha_salida);
    respuestaExito(res, resultado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el check-out.';
    if (mensaje.includes('NO autorizada')) {
      respuestaError(res, 'Persona no autorizada para retirar a este niño.', 403);
      return;
    }
    if (mensaje.includes('no encontrado')) {
      respuestaError(res, mensaje, 404);
      return;
    }
    if (mensaje.includes('ya fue retirado')) {
      respuestaError(res, mensaje, 409);
      return;
    }
    respuestaError(res, mensaje, 400);
  }
};

export const actualizarAsistencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const idAsistencia = Number(req.params.id);
    if (!Number.isInteger(idAsistencia) || idAsistencia <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }

    const nivelJerarquico = req.usuario!.nivelJerarquico;
    const resultado = await modificarAsistencia(idAsistencia, req.body, nivelJerarquico);
    respuestaExito(res, resultado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar la asistencia.';
    if (mensaje.includes('no encontrado')) {
      respuestaError(res, mensaje, 404);
      return;
    }
    if (mensaje.includes('No tiene permisos')) {
      respuestaError(res, mensaje, 403);
      return;
    }
    respuestaError(res, mensaje, 400);
  }
};

export const eliminarAsistencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const idAsistencia = Number(req.params.id);
    if (!Number.isInteger(idAsistencia) || idAsistencia <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }

    const nivelJerarquico = req.usuario!.nivelJerarquico;
    await removerAsistencia(idAsistencia, nivelJerarquico);
    respuestaExito(res, { mensaje: 'Registro de asistencia eliminado correctamente.' });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al eliminar la asistencia.';
    if (mensaje.includes('no encontrado')) {
      respuestaError(res, mensaje, 404);
      return;
    }
    if (mensaje.includes('No tiene permisos')) {
      respuestaError(res, mensaje, 403);
      return;
    }
    respuestaError(res, mensaje, 400);
  }
};
