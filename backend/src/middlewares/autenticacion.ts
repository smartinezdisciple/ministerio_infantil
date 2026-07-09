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
  soloLectura:      boolean;
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
 * Lee el header Authorization: Bearer <token> o el query param ?token=
 */
export const verificarToken = (req: Request, res: Response, siguiente: NextFunction): void => {
  // Ignorar peticiones OPTIONS preflight para evitar que fallen por falta de token
  if (req.method === 'OPTIONS') {
    siguiente();
    return;
  }

  let token: string | undefined;

  // 1. Intentar desde Authorization header
  const encabezado = req.headers.authorization;
  if (encabezado) {
    const partes = encabezado.split(' ');
    if (partes.length === 2 && partes[0].toLowerCase() === 'bearer') {
      token = partes[1].trim();
    }
  }

  // 2. Fallback: token en query param (para window.open / descargas)
  if (!token) {
    token = req.query.token as string | undefined;
  }

  if (!token) {
    console.warn(`[verificarToken] Token ausente para: ${req.method} ${req.originalUrl}`);
    respuestaNoAutorizado(res, 'Token de autenticación requerido.');
    return;
  }

  try {
    const secreto = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secreto) as PayloadJwt;
    req.usuario = payload;
    siguiente();
  } catch (error: any) {
    console.warn(`[verificarToken] Error al verificar JWT (${error.message}) para: ${req.method} ${req.originalUrl}`);
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

/**
 * Middleware que bloquea operaciones de escritura (POST, PUT, PATCH, DELETE)
 * para usuarios marcados como solo lectura.
 * Debe colocarse DESPUÉS de verificarToken.
 */
export const restringirSiSoloLectura = (req: Request, res: Response, siguiente: NextFunction): void => {
  if (req.usuario?.soloLectura && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    respuestaProhibido(res, 'Usuario de solo lectura. No tiene permisos para modificar datos.');
    return;
  }
  siguiente();
};

