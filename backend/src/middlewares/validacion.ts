// src/middlewares/validacion.ts — Validación de inputs con Zod (CLAUDE.md §4.4)
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { respuestaError } from '../utils/respuesta.js';

/** Esquema de validación de contraseña (CLAUDE.md §4.5 — innegociable) */
export const esquemaContrasena = z
  .string()
  .min(8,        { message: 'La contraseña debe tener al menos 8 caracteres.' })
  .regex(/[A-Z]/, { message: 'La contraseña debe tener al menos una letra mayúscula.' })
  .regex(/[0-9]/, { message: 'La contraseña debe tener al menos un número.' })
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'La contraseña debe tener al menos un carácter especial (!@#$%^&*...).',
  });

/** Esquema del body de login */
export const esquemaLogin = z.object({
  usuario:    z.string().min(1, { message: 'El usuario o correo es requerido.' }),
  contrasena: z.string().min(1, { message: 'La contraseña es requerida.' }),
});

/** Esquema de creación de niño (MVP-01) */
export const esquemaNino = z.object({
  nombres:                z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  apellidos:              z.string().min(2, { message: 'Los apellidos son requeridos.' }),
  fechaNacimiento:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha debe tener formato YYYY-MM-DD.' }),
  observacionesGenerales: z.string().optional(),
  idGrupo:                z.number().int().positive({ message: 'Se debe asignar un grupo válido.' }).optional(),
  motivoExcepcion:        z.string().optional(), // Requerido si fuera de rango de edad (validado en servicio)
  sexo:                   z.enum(['Masculino', 'Femenino']).nullable().optional(),
  activo:                 z.boolean().optional(),
});

/** Esquema de un padre/responsable (MVP-01, MVP-03) */
export const esquemaPadre = z.object({
  nombres:   z.string().min(2, { message: 'El nombre del responsable debe tener al menos 2 caracteres.' }),
  apellidos: z.string().min(2, { message: 'Los apellidos del responsable son requeridos.' }),
  telefono:  z.string().min(7, { message: 'El teléfono debe tener al menos 7 dígitos.' }),
});

/** Esquema de creación de niño con uno o más padres (MVP-01 + MVP-03) */
export const esquemaNinoConPadres = z.object({
  nombres:                z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  apellidos:              z.string().min(2, { message: 'Los apellidos son requeridos.' }),
  fechaNacimiento:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha debe tener formato YYYY-MM-DD.' }),
  observacionesGenerales: z.string().optional(),
  idGrupo:                z.number().int().positive({ message: 'Se debe asignar un grupo válido.' }).optional(),
  motivoExcepcion:        z.string().optional(),
  padres:                 z.array(esquemaPadre).min(0).optional(),
  sexo:                   z.enum(['Masculino', 'Femenino']).nullable().optional(),
  activo:                 z.boolean().optional(),
});

/** Esquema de registro de personal (MVP-04) — Personal_Sistema */
export const esquemaPersonal = z.object({
  nombres:            z.string().min(2),
  apellidos:          z.string().min(2),
  /** Personal_Sistema.Usuario — VARCHAR(30), sin espacios */
  usuario:            z.string()
    .min(3, { message: 'El usuario debe tener al menos 3 caracteres.' })
    .max(30, { message: 'El usuario no puede superar 30 caracteres.' })
    .regex(/^[a-zA-Z0-9._-]+$/, { message: 'Solo se permiten letras, números, puntos y guiones.' }),
  contrasena:         esquemaContrasena,
  rol:                z.enum(['Colaborador', 'Maestro', 'Staff', 'Coordinador General']),
  /** Fecha_Ingreso_Servicio */
  fechaIngreso:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha debe tener formato YYYY-MM-DD.' }),
  idAutorizadoPor:    z.number().int().positive().optional(),
  idPersonaExistente: z.number().int().positive().optional(),
});

/**
 * Fábrica de middleware de validación Zod.
 * Valida req.body contra el esquema. Si falla → 400 con detalles específicos.
 */
export const validar =
  <T extends z.ZodTypeAny>(esquema: T) =>
  (req: Request, res: Response, siguiente: NextFunction): void => {
    const resultado = esquema.safeParse(req.body);
    if (!resultado.success) {
      console.log('❌ Validación fallida. Body:', JSON.stringify(req.body, null, 2));
      console.log('❌ Errores Zod:', JSON.stringify(resultado.error.issues, null, 2));
      const mensajes = resultado.error.issues.map((e) => ({
        campo:   e.path.join('.'),
        mensaje: e.message,
      }));
      respuestaError(res, 'Datos de entrada inválidos.', 400, mensajes);
      return;
    }
    req.body = resultado.data;
    siguiente();
  };
