// src/controllers/premiadosControlador.ts — Endpoints del módulo Premiados
import type { Request, Response } from 'express';
import {
  listarPremiados,
  guardarPremiados,
  eliminarPremiado,
} from '../repositories/premiadosRepositorio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

interface RegistroBody {
  idTurno: number;
  idGrupo: number;
  idNino: number;
  fechaPremiacion?: string;
}

/** GET /api/premiados?mes=YYYY-MM-01 — Lista premiados (historial por mes o completo) */
export const obtenerPremiados = async (req: Request, res: Response) => {
  try {
    const mes = req.query.mes as string | undefined;
    if (mes !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(mes)) {
      respuestaError(res, 'Formato de mes inválido. Use YYYY-MM-01.', 400);
      return;
    }
    const datos = await listarPremiados(mes);
    respuestaExito(res, datos);
  } catch (error) {
    console.error('Error listando premiados:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};

/**
 * POST /api/premiados/guardar
 * Body: { mes, registros: [{ idTurno, idGrupo, idNino, fechaPremiacion }] }
 * Aplica UPSERT por (Mes, ID_Turno, ID_Grupo).
 */
export const guardar = async (req: Request, res: Response) => {
  try {
    const { mes, registros } = req.body as {
      mes: string;
      registros: RegistroBody[];
    };
    const idRegistradoPor = req.usuario!.idPersona;

    if (!mes || !/^\d{4}-\d{2}-\d{2}$/.test(mes)) {
      respuestaError(res, 'Mes obligatorio con formato YYYY-MM-01.', 400);
      return;
    }
    if (!Array.isArray(registros) || registros.length === 0) {
      respuestaError(res, 'Debe enviar al menos un registro.', 400);
      return;
    }

    // Validar campos y evitar duplicados de (turno, grupo) en el mismo envío
    const vistos = new Set<string>();
    for (const r of registros) {
      if (!r.idTurno || !r.idGrupo || !r.idNino) {
        respuestaError(res, 'Cada registro requiere idTurno, idGrupo e idNino.', 400);
        return;
      }
      if (!r.fechaPremiacion || !/^\d{4}-\d{2}-\d{2}$/.test(r.fechaPremiacion)) {
        respuestaError(res, 'Cada registro requiere fechaPremiacion (YYYY-MM-DD).', 400);
        return;
      }
      const clave = `${r.idTurno}-${r.idGrupo}`;
      if (vistos.has(clave)) {
        respuestaError(res, `Duplicado: turno ${r.idTurno} con grupo ${r.idGrupo} en el mismo envío.`, 400);
        return;
      }
      vistos.add(clave);
    }

    await guardarPremiados(mes, registros as Array<RegistroBody & { fechaPremiacion: string }>, idRegistradoPor);
    const datos = await listarPremiados(mes);
    respuestaExito(res, datos);
  } catch (error) {
    console.error('Error guardando premiados:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};

/** DELETE /api/premiados/:id — Elimina un premiado */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      respuestaError(res, 'ID inválido.', 400);
      return;
    }
    const eliminado = await eliminarPremiado(id);
    if (!eliminado) {
      respuestaError(res, 'Premiado no encontrado.', 404);
      return;
    }
    respuestaExito(res, { eliminado });
  } catch (error) {
    console.error('Error eliminando premiado:', error);
    respuestaError(res, 'Error interno del servidor.', 500);
  }
};
