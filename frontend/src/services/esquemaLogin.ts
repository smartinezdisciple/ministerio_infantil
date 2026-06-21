// esquemaLogin.ts — Validación con Zod (CLAUDE.md §4.4 y §4.5)
import { z } from 'zod';
import type { ValidacionContrasena } from './tipos';

/**
 * Esquema de validación para el formulario de inicio de sesión.
 * Aplica las reglas de CLAUDE.md §4.5 (complejidad de contraseñas).
 */
export const esquemaLogin = z.object({
  usuario: z
    .string()
    .min(1, 'El nombre de usuario es obligatorio')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(
      /^[a-zA-Z0-9._]+$/,
      'El usuario solo puede contener letras, números, puntos y guiones bajos'
    ),
  contrasena: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número')
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Debe incluir al menos un carácter especial'
    ),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;

/**
 * Evalúa la contraseña en tiempo real y retorna el estado de cada requisito.
 * Se usa en el handler onChange del campo de contraseña para dar feedback visual inmediato.
 */
export const evaluarContrasena = (valor: string): ValidacionContrasena => ({
  longitudMinima: valor.length >= 8,
  tieneMayuscula: /[A-Z]/.test(valor),
  tieneNumero: /[0-9]/.test(valor),
  tieneEspecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(valor),
});

/**
 * Verifica si todos los requisitos de la contraseña se cumplen.
 */
export const contrasenaEsValida = (validacion: ValidacionContrasena): boolean =>
  validacion.longitudMinima &&
  validacion.tieneMayuscula &&
  validacion.tieneNumero &&
  validacion.tieneEspecial;
