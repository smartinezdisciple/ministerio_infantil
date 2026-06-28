/**
 * validacionEntrada.ts
 * Utilidades centralizadas para filtrar y validar entradas de texto en formularios.
 * - Campos de nombre/apellido: solo letras (con tildes, diéresis, ñ) y espacios.
 * - Campos de teléfono: solo dígitos y guión (-).
 */

// ──────────────────────────────────────────────────────────────────────────────
// TEXTO — nombres y apellidos
// ──────────────────────────────────────────────────────────────────────────────

/** Caracteres permitidos en nombres/apellidos: letras (incl. tildes, ñ) y espacios. */
export const REGEX_SOLO_LETRAS =
  /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ\s]+$/;

/**
 * Elimina en tiempo real cualquier carácter que no sea letra o espacio.
 * Uso: onChange={(e) => setState(filtrarSoloLetras(e.target.value))}
 */
export const filtrarSoloLetras = (valor: string): string =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ\s]/g, '');

// ──────────────────────────────────────────────────────────────────────────────
// TELÉFONO
// ──────────────────────────────────────────────────────────────────────────────

/** Caracteres permitidos en teléfonos: dígitos y guión. Sin +, espacios ni letras. */
export const REGEX_TELEFONO = /^[\d\-]+$/;

/**
 * Elimina en tiempo real cualquier carácter que no sea dígito o guión.
 * Uso: onChange={(e) => setState(filtrarTelefono(e.target.value))}
 */
export const filtrarTelefono = (valor: string): string =>
  valor.replace(/[^0-9\-]/g, '');

/**
 * Filtra y formatea en tiempo real un número de teléfono.
 * Si se escribe el 4to dígito, añade un guión automáticamente (ej: 8888-).
 * Si se está borrando, no auto-completa el guión para permitir un borrado natural.
 */
/** Genera enlace de WhatsApp con formato internacional */
export const enlaceWhatsApp = (telefono: string): string => {
  const digitos = telefono.replace(/[-\s]/g, '');
  return `https://wa.me/505${digitos}`;
};

export const formatearTelefono = (valor: string, valorAnterior: string = ''): string => {
  const limpio = valor.replace(/[^0-9\-]/g, '');
  const digitos = limpio.replace(/\D/g, '');
  
  // Si se está borrando (longitud actual menor a la anterior), no auto-completamos el guión
  if (valor.length < valorAnterior.length) {
    return limpio.slice(0, 9);
  }
  
  if (digitos.length > 4) {
    return `${digitos.slice(0, 4)}-${digitos.slice(4, 8)}`;
  }
  if (digitos.length === 4) {
    return `${digitos}-`;
  }
  return limpio.slice(0, 9);
};

