// src/controllers/tutoresControlador.ts — Controladores de tutores
import type { Request, Response } from 'express';
import { listarTutoresPorNinoRepo, crearTutorYVincularRepo, actualizarTutorRepo, vincularTutorExistenteRepo } from '../repositories/tutoresRepositorio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

export const listarTutoresPorNino = async (req: Request, res: Response): Promise<void> => {
  try {
    const idNino = Number(req.params.id);
    if (!idNino || isNaN(idNino)) {
      respuestaError(res, 'ID de niño inválido', 400);
      return;
    }
    const tutores = await listarTutoresPorNinoRepo(idNino);
    respuestaExito(res, tutores);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    respuestaError(res, mensaje, 500);
  }
};

export const crearTutorYVincularControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idNino, nombres, apellidos, telefono, tipoTutor } = req.body;

    if (!idNino || !nombres || !apellidos || !telefono) {
      respuestaError(res, 'Faltan campos obligatorios: idNino, nombres, apellidos, telefono', 400);
      return;
    }

    const tutor = await crearTutorYVincularRepo({
      idNino: Number(idNino),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim(),
      tipoTutor: tipoTutor?.trim() || 'Padre/Madre',
    });

    respuestaExito(res, tutor, 201);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    respuestaError(res, mensaje, 500);
  }
};

export const actualizarTutorControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const idTutor = Number(req.params.id);
    if (!idTutor || isNaN(idTutor)) {
      respuestaError(res, 'ID de tutor inválido', 400);
      return;
    }

    const { nombres, apellidos, telefono, tipoTutor } = req.body;

    if (!nombres || !apellidos) {
      respuestaError(res, 'Faltan campos obligatorios: nombres, apellidos', 400);
      return;
    }

    const tutor = await actualizarTutorRepo(idTutor, {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono ? telefono.trim() : null,
      tipoTutor: tipoTutor?.trim() || 'Padre/Madre',
    });

    respuestaExito(res, tutor);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    respuestaError(res, mensaje, 500);
  }
};

export const vincularTutorExistenteControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idTutor, idNino, parentesco } = req.body;
    if (!idTutor || !idNino) {
      respuestaError(res, 'Faltan campos obligatorios: idTutor, idNino', 400);
      return;
    }
    await vincularTutorExistenteRepo(Number(idTutor), Number(idNino), parentesco);
    respuestaExito(res, { mensaje: 'Tutor vinculado correctamente' });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    respuestaError(res, mensaje, 500);
  }
};
