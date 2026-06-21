// src/controllers/authControlador.ts — Controlador de autenticación (CLAUDE.md §3.2)
import type { Request, Response } from 'express';
import { iniciarSesion } from '../services/authServicio.js';
import { respuestaExito, respuestaError } from '../utils/respuesta.js';

/**
 * POST /api/auth/login
 * Body validado por Zod en middleware (correo, contrasena).
 * Rate limiting: 3 intentos → bloqueo 15 min (CLAUDE.md §4.2).
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario, contrasena } = req.body as { usuario: string; contrasena: string };
    const resultado = await iniciarSesion(usuario, contrasena);
    respuestaExito(res, resultado, 200);
  } catch (error) {
    // Error genérico — no revelar detalles internos (anti-enumeración)
    const mensaje = error instanceof Error ? error.message : 'Error al iniciar sesión.';
    respuestaError(res, mensaje, 401);
  }
};
