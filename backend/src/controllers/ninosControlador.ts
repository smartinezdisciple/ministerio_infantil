// src/controllers/ninosControlador.ts — Controlador de niños (MVP-01)
import type { Request, Response } from 'express';
import { registrarNino, registrarNinoConPadres, listarNinos, buscarNinoPorId, buscarNinoCompleto, actualizarNinoExistente, borrarNino, obtenerExpedientesNino, registrarExpedienteNino, resolverExpedienteNinoExistente } from '../services/ninosServicio.js';
import { obtenerNinosIngreso } from '../repositories/ninosRepositorio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

/**
 * POST /api/ninos
 * Registra un nuevo niño con su asignación de grupo (MVP-01 + MVP-02).
 * Requiere nivel ≥ 3 (Staff / Coordinador).
 */
export const crearNino = async (req: Request, res: Response): Promise<void> => {
  try {
    const nino = await registrarNino(req.body);
    respuestaExito(res, nino, 201);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el niño.';
    respuestaError(res, mensaje, 400);
  }
};

/**
 * POST /api/ninos/con-padres
 * Registra un nuevo niño junto con sus padres/responsables en una sola transacción (MVP-01 + MVP-03).
 * Requiere nivel ≥ 3 (Staff / Coordinador).
 */
export const crearNinoConPadresControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await registrarNinoConPadres(req.body);
    respuestaExito(res, resultado, 201);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el niño con sus responsables.';
    respuestaError(res, mensaje, 400);
  }
};

/**
 * GET /api/ninos
 * Lista todos los niños con su grupo. Nivel ≥ 1.
 */
export const listar = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ninos = await listarNinos();
    respuestaExito(res, ninos);
  } catch {
    respuestaError(res, 'Error al obtener la lista de niños.', 500);
  }
};

/**
 * GET /api/ninos/ingreso
 * Lista niños con adulto responsable y hora de creación para la página de Ingreso (MVP-01).
 * Nivel ≥ 1.
 */
export const listarIngreso = async (_req: Request, res: Response): Promise<void> => {
  try {
    const datos = await obtenerNinosIngreso();
    respuestaExito(res, datos);
  } catch {
    respuestaError(res, 'Error al obtener el listado de ingreso.', 500);
  }
};

/**
 * GET /api/ninos/:id
 * Obtiene un niño por su ID. Nivel ≥ 1.
 */
export const obtenerPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const id   = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }
    const nino = await buscarNinoPorId(id);
    if (!nino) {
      respuestaError(res, `Niño con ID ${id} no encontrado.`, 404);
      return;
    }
    respuestaExito(res, nino);
  } catch {
    respuestaError(res, 'Error al buscar el niño.', 500);
  }
};

/**
 * GET /api/ninos/:id/completo
 * Obtiene un niño con todos sus datos (grupo, padres) para edición. Nivel ≥ 3.
 */
export const obtenerCompleto = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }
    const nino = await buscarNinoCompleto(id);
    if (!nino) {
      respuestaError(res, `Niño con ID ${id} no encontrado.`, 404);
      return;
    }
    respuestaExito(res, nino);
  } catch {
    respuestaError(res, 'Error al buscar el niño.', 500);
  }
};

/**
 * PUT /api/ninos/:id
 * Actualiza los datos de un niño existente. Nivel ≥ 3.
 */
export const actualizarNino = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }
    const nino = await actualizarNinoExistente(id, req.body);
    respuestaExito(res, nino);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar el niño.';
    if (mensaje.includes('CONCURRENCY_CONFLICT')) {
      respuestaError(res, 'Los datos del niño han sido actualizados por otro usuario. Por favor recarga e intenta de nuevo.', 409);
      return;
    }
    respuestaError(res, mensaje, 400);
  }
};

/**
 * DELETE /api/ninos/:id
 * Elimina un niño y todos sus datos relacionados. Nivel ≥ 3.
 */
export const eliminarNino = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      respuestaError(res, 'El ID debe ser un número entero positivo.', 400);
      return;
    }
    await borrarNino(id);
    respuestaExito(res, { mensaje: 'Niño eliminado correctamente.' });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al eliminar el niño.';
    respuestaError(res, mensaje, 400);
  }
};

/**
 * GET /api/ninos/:id/expedientes
 * Obtiene el historial de expedientes/conducta de un niño.
 */
export const listarExpedientesNinoControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const idNino = Number(req.params.id);
    if (!Number.isInteger(idNino) || idNino <= 0) {
      respuestaError(res, 'El ID de niño debe ser un número entero positivo.', 400);
      return;
    }
    const expedientes = await obtenerExpedientesNino(idNino);
    respuestaExito(res, expedientes);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al obtener los expedientes.';
    respuestaError(res, mensaje, 500);
  }
};

/**
 * POST /api/ninos/:id/expedientes
 * Registra un nuevo reporte en el expediente de conducta del niño.
 */
export const crearExpedienteNinoControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const idNino = Number(req.params.id);
    if (!Number.isInteger(idNino) || idNino <= 0) {
      respuestaError(res, 'El ID de niño debe ser un número entero positivo.', 400);
      return;
    }
    const idReportadoPor = req.usuario!.idPersona;
    
    const { tipo, descripcion, idTurno, idEvento } = req.body;
    if (!tipo || !descripcion) {
      respuestaError(res, 'El tipo y la descripción son requeridos.', 400);
      return;
    }

    const nuevoExp = await registrarExpedienteNino(idNino, {
      tipo,
      descripcion,
      idTurno: idTurno ? Number(idTurno) : null,
      idEvento: idEvento ? Number(idEvento) : null,
      idReportadoPor,
    });
    respuestaExito(res, nuevoExp, 201);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el expediente.';
    respuestaError(res, mensaje, 500);
  }
};

/**
 * PATCH /api/ninos/:id/expedientes/:idExp/resolver
 * Resuelve un reporte del expediente.
 */
export const resolverExpedienteNinoControlador = async (req: Request, res: Response): Promise<void> => {
  try {
    const idNino = Number(req.params.id);
    const idExp = Number(req.params.idExp);
    if (!Number.isInteger(idNino) || idNino <= 0 || !Number.isInteger(idExp) || idExp <= 0) {
      respuestaError(res, 'Los IDs deben ser números enteros positivos.', 400);
      return;
    }
    const { notasResolucion } = req.body;
    if (!notasResolucion || !notasResolucion.trim()) {
      respuestaError(res, 'Las notas de resolución son requeridas.', 400);
      return;
    }

    const expResuelto = await resolverExpedienteNinoExistente(idNino, idExp, notasResolucion.trim());
    if (!expResuelto) {
      respuestaError(res, 'No se pudo encontrar o resolver el expediente especificado.', 404);
      return;
    }
    respuestaExito(res, expResuelto);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al resolver el expediente.';
    respuestaError(res, mensaje, 500);
  }
};
