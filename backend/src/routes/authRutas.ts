// src/routes/authRutas.ts — Rutas de autenticación (CLAUDE.md §3.2)
import { Router } from 'express';
import { login } from '../controllers/authControlador.js';
import { limitadorLogin } from '../middlewares/rateLimiting.js';
import { validar, esquemaLogin } from '../middlewares/validacion.js';

const enrutador = Router();

/**
 * POST /api/auth/login
 * 1. limitadorLogin  → máximo 3 intentos/IP (CLAUDE.md §4.2)
 * 2. validar()       → Zod valida correo y contraseña
 * 3. login           → controlador
 */
enrutador.post(
  '/login',
  limitadorLogin,
  validar(esquemaLogin),
  login
);

export default enrutador;
