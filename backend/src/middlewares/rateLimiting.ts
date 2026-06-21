// src/middlewares/rateLimiting.ts — Rate limiting estricto (CLAUDE.md §4.2)
import rateLimit from 'express-rate-limit';
import { respuestaError } from '../utils/respuesta.js';

const minutosBloqueo = Number(process.env.MINUTOS_BLOQUEO_LOGIN ?? 15);

/**
 * Rate limiter para el endpoint de login.
 * Máximo 3 intentos fallidos → bloqueo de IP por MINUTOS_BLOQUEO_LOGIN minutos (CLAUDE.md §4.2).
 */
export const limitadorLogin = rateLimit({
  windowMs:         minutosBloqueo * 60 * 1000,
  max:              3,
  standardHeaders:  true,
  legacyHeaders:    false,
  skipSuccessfulRequests: true, // Solo cuenta intentos fallidos (status >= 400)
  skip:             () => process.env.NODE_ENV === 'test',
  handler: (_req, res) => {
    respuestaError(
      res,
      `Demasiados intentos fallidos. Intente de nuevo en ${minutosBloqueo} minutos.`,
      429
    );
  },
  keyGenerator: (req) => req.ip ?? 'sin-ip',
});

/**
 * Rate limiter general para rutas críticas (registro de personal, check-in).
 * 20 peticiones por minuto por IP.
 */
export const limitadorGeneral = rateLimit({
  windowMs:        60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            () => process.env.NODE_ENV === 'test',
  handler: (_req, res) => {
    respuestaError(res, 'Demasiadas solicitudes. Intente más tarde.', 429);
  },
});
