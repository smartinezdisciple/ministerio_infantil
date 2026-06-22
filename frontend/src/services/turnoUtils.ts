/**
 * Convierte nombres de turno de la BD a formato visual amigable:
 * - "Domingo_8am" -> "Domingo 8am"
 * - "Domingo_11am" -> "Domingo 11am"
 * - "Domingo_5pm" -> "Domingo 5pm"
 * - "Miercoles" -> "Miercoles 6:30pm"
 * - "Miercoles 6:30pm" -> "Miercoles 6:30pm"
 * - Elimina guiones bajos y estandariza nombres
 */
export const formatearTurno = (nombre: string): string => {
  if (!nombre) return '';
  const n = nombre.trim();
  const nLower = n.toLowerCase();
  if (nLower.includes('miercoles') || nLower.includes('miércoles')) {
    return 'Miercoles 6:30pm';
  }
  if (nLower.includes('8am') || nLower.includes('8_am')) {
    return 'Domingo 8am';
  }
  if (nLower.includes('11am') || nLower.includes('11_am')) {
    return 'Domingo 11am';
  }
  if (nLower.includes('5pm') || nLower.includes('5_pm')) {
    return 'Domingo 5pm';
  }
  return n.replace(/_/g, ' ');
};
