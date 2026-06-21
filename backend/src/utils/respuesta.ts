// src/utils/respuesta.ts — Helpers para respuestas HTTP estandarizadas (CLAUDE.md §5)
import type { Response } from 'express';

/** Respuesta de éxito estandarizada */
export const respuestaExito = <T>(res: Response, datos: T, codigo = 200): void => {
  res.status(codigo).json({ exito: true, datos });
};

/** Respuesta de error estandarizada */
export const respuestaError = (
  res: Response,
  mensaje: string,
  codigo = 400,
  detalles?: unknown
): void => {
  res.status(codigo).json({ exito: false, mensaje, ...(detalles ? { detalles } : {}) });
};

/** Respuesta 401 Unauthorized */
export const respuestaNoAutorizado = (res: Response, mensaje = 'No autorizado'): void => {
  res.status(401).json({ exito: false, mensaje });
};

/** Respuesta 403 Forbidden */
export const respuestaProhibido = (res: Response, mensaje = 'Acceso denegado'): void => {
  res.status(403).json({ exito: false, mensaje });
};
