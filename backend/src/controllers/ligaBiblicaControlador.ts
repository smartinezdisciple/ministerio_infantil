// src/controllers/ligaBiblicaControlador.ts — Endpoints del módulo Liga Bíblica
import type { Request, Response } from 'express';
import {
  listarParticipantes,
  insertarParticipante,
  actualizarParticipante,
  eliminarParticipante,
  obtenerDiaSemanaTurno,
  esTutorDeNino,
} from '../repositories/ligaBiblicaRepositorio.js';
import { obtenerIdsTurnosDePersonal } from '../repositories/incidenciasRepositorio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

/** Devuelve YYYY-MM-DD del último día de la semana (0=Domingo, 3=Miércoles) de un mes dado. */
const ultimoDiaSemanaDelMes = (anio: number, mes: number, diaSemana: number): string => {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  for (let d = ultimoDia; d >= 1; d--) {
    const fecha = new Date(anio, mes, d);
    if (fecha.getDay() === diaSemana) {
      const dd = String(d).padStart(2, '0');
      const mm = String(mes + 1).padStart(2, '0');
      return `${anio}-${mm}-${dd}`;
    }
  }
  return '';
};

/** Normaliza un mes (YYYY-MM o YYYY-MM-DD) a formato YYYY-MM-01. */
const normalizarMes = (mes: string): string | null => {
  if (/^\d{4}-\d{2}$/.test(mes)) return `${mes}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(mes)) return mes;
  return null;
};

const esIdValido = (id: unknown): id is number =>
  Number.isInteger(id) && ((id as number) > 0);

/**
 * GET /api/liga-biblica[?mes=YYYY-MM] — Lista participantes (historial por mes o completo).
 */
export const obtenerParticipantes = async (req: Request, res: Response) => {
  try {
    const mesRaw = req.query.mes as string | undefined;
    const mes = mesRaw && normalizarMes(mesRaw);
    if (mesRaw !== undefined && !mes) {
      respuestaError(res, 'Formato de mes inválido. Use YYYY-MM.', 400);
      return;
    }
    const datos = await listarParticipantes(mes ?? undefined);
    respuestaExito(res, datos);
  } catch (error) {
    console.error('Error listando participantes de Liga Bíblica:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};

/**
 * POST /api/liga-biblica
 * Body: { mes, idNino, idTutor, idTurno }
 * - El turno debe pertenecer al usuario autenticado (Personal_Turnos), salvo nivel ≥ 4.
 * - La Fecha_Liga se deriva del turno: último domingo o último miércoles del mes.
 * - El tutor debe estar vinculado al niño (único tutor que recibirá la guía).
 */
export const inscribir = async (req: Request, res: Response) => {
  try {
    const { mes: mesRaw, idNino, idTutor, idTurno } = req.body as {
      mes?: string;
      idNino?: number;
      idTutor?: number;
      idTurno?: number;
    };
    const idRegistradoPor = req.usuario!.idPersona;

    const mes = mesRaw ? normalizarMes(mesRaw) : null;
    if (!mes) {
      respuestaError(res, 'Mes obligatorio con formato YYYY-MM.', 400);
      return;
    }
    if (!esIdValido(idNino) || !esIdValido(idTutor) || !esIdValido(idTurno)) {
      respuestaError(res, 'idNino, idTutor e idTurno son obligatorios.', 400);
      return;
    }

    // Turno según el usuario que inscribe (Personal_Turnos), salvo nivel ≥ 4.
    if ((req.usuario!.nivelJerarquico ?? 0) < 4) {
      const turnosUsuario = await obtenerIdsTurnosDePersonal(idRegistradoPor);
      if (!turnosUsuario.includes(idTurno)) {
        respuestaError(
          res,
          'El turno indicado no corresponde a los turnos asignados al usuario.',
          403
        );
        return;
      }
    }

    // El tutor debe ser tutor real del niño (selección única para la guía).
    if (!(await esTutorDeNino(idTutor, idNino))) {
      respuestaError(res, 'El tutor seleccionado no está vinculado al niño.', 400);
      return;
    }

    // Fecha de la liga derivada del turno (último domingo/miércoles del mes).
    const diaSemana = await obtenerDiaSemanaTurno(idTurno);
    if (diaSemana === null) {
      respuestaError(res, 'Turno no encontrado.', 400);
      return;
    }
    const [aa, mm] = mes.split('-').map(Number);
    const fechaLiga = ultimoDiaSemanaDelMes(aa, mm - 1, diaSemana);
    if (!fechaLiga) {
      respuestaError(res, 'No existe día de liga para el mes y turno seleccionados.', 400);
      return;
    }

    await insertarParticipante({ fechaLiga, idTurno, idNino, idTutor, idRegistradoPor });
    const datos = await listarParticipantes(mes);
    respuestaExito(res, datos);
  } catch (error) {
    console.error('Error inscribiendo participante en Liga Bíblica:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};

/**
 * PATCH /api/liga-biblica/:id — Actualiza el tutor seleccionado de un participante.
 */
export const actualizarTutorDelParticipante = async (req: Request, res: Response) => {
  try {
    const idLiga = Number(req.params.id);
    const { idTutor } = req.body as { idTutor?: number };
    if (!esIdValido(idLiga) || !esIdValido(idTutor)) {
      respuestaError(res, 'ID y idTutor son obligatorios.', 400);
      return;
    }
    const actualizado = await actualizarParticipante(idLiga, idTutor);
    if (!actualizado) {
      respuestaError(res, 'Participante no encontrado.', 404);
      return;
    }
    respuestaExito(res, { actualizado });
  } catch (error) {
    console.error('Error actualizando tutor de participante:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};

/** DELETE /api/liga-biblica/:id — Elimina un participante */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!esIdValido(id)) {
      respuestaError(res, 'ID inválido.', 400);
      return;
    }
    const eliminado = await eliminarParticipante(id);
    if (!eliminado) {
      respuestaError(res, 'Participante no encontrado.', 404);
      return;
    }
    respuestaExito(res, { eliminado });
  } catch (error) {
    console.error('Error eliminando participante:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};