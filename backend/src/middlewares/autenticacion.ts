// src/middlewares/autenticacion.ts — Verificación de JWT (CLAUDE.md §2)
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { respuestaNoAutorizado, respuestaProhibido } from '../utils/respuesta.js';

/** Payload decodificado del JWT */
export interface PayloadJwt {
  idPersona:        number;
  usuario:          string;
  rol:              string;
  nivelJerarquico:  number;
}

/** Extiende Request para inyectar usuario autenticado */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: PayloadJwt;
    }
  }
}

/**
 * Middleware de verificación de JWT.
 * Lee el header Authorization: Bearer <token>
 */
export const verificarToken = (req: Request, res: Response, siguiente: NextFunction): void => {
  const encabezado = req.headers.authorization;
  if (!encabezado?.startsWith('Bearer ')) {
    respuestaNoAutorizado(res, 'Token de autenticación requerido.');
    return;
  }

  const token = encabezado.split(' ')[1];
  try {
    const secreto = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secreto) as PayloadJwt;
    req.usuario = payload;
    siguiente();
  } catch {
    respuestaNoAutorizado(res, 'Token inválido o expirado.');
  }
};

/**
 * Fábrica de middleware que exige nivel jerárquico mínimo (CLAUDE.md §6, MVP-04).
 * @param nivelMinimo — Nivel requerido: 1=Colaborador, 2=Maestro, 3=Staff, 4=Coordinador
 */
export const requerirNivel = (nivelMinimo: number) =>
  (req: Request, res: Response, siguiente: NextFunction): void => {
    if (!req.usuario || req.usuario.nivelJerarquico < nivelMinimo) {
      respuestaProhibido(res, `Se requiere nivel jerárquico mínimo ${nivelMinimo}.`);
      return;
    }
    siguiente();
  };

/**
 * Middleware que exige nivel jerárquico mínimo O ser el propio usuario solicitando su propia información.
 */
export const permitirPropioONivel = (nivelMinimo: number) =>
  (req: Request, res: Response, siguiente: NextFunction): void => {
    if (!req.usuario) {
      respuestaNoAutorizado(res, 'No autenticado.');
      return;
    }
    const idPersona = Number(req.params.id);
    if (req.usuario.idPersona === idPersona || req.usuario.nivelJerarquico >= nivelMinimo) {
      siguiente();
      return;
    }
    respuestaProhibido(res, `Acceso denegado. Se requiere nivel jerárquico mínimo ${nivelMinimo} o ser el propio usuario.`);
  };

