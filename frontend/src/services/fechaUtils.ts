// src/services/fechaUtils.ts — Utilidades de fecha en hora local (sin desfase UTC)

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD usando la hora LOCAL del navegador,
 * NO en UTC. Esto evita el problema de que a las 7pm CST (-05:00) ya sea el día
 * siguiente en UTC, lo que causaría desfases al comparar con fechas en la base de datos.
 */
export const fechaLocalHoy = (): string => {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd   = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Convierte un objeto Date a string YYYY-MM-DD en hora local.
 */
export const dateToLocalString = (fecha: Date): string => {
  const yyyy = fecha.getFullYear();
  const mm   = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd   = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Calcula la edad exacta en años a partir de una fecha de nacimiento en formato YYYY-MM-DD.
 * Evita problemas de zona horaria procesando las partes locales directamente.
 */
export const calcularEdad = (fechaNacimientoStr: string): number => {
  if (!fechaNacimientoStr) return 0;
  const partes = fechaNacimientoStr.split('T')[0].split('-');
  if (partes.length !== 3) return 0;
  
  const yyyy = parseInt(partes[0], 10);
  const mm   = parseInt(partes[1], 10) - 1; // Mes en JS es 0-indexed
  const dd   = parseInt(partes[2], 10);
  
  const hoy = new Date();
  let edad = hoy.getFullYear() - yyyy;
  const mesDiff = hoy.getMonth() - mm;
  
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < dd)) {
    edad--;
  }
  return edad;
};

const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const ABREV_MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

/**
 * Parsea un string de fecha ingresado por el usuario a formato YYYY-MM-DD.
 * Admite formatos:
 * - DD-MM-YY o DD-MM-YYYY (ej. 08-06-26, 08-06-2026)
 * - DD/MM/YY o DD/MM/YYYY
 * - DD-Mes-YY o DD-Mes-YYYY (ej. 08-Junio-26, 08-Jun-2026)
 * - DD de Mes de YYYY
 */
export const parsearFechaUsuario = (fechaStr: string): string => {
  if (!fechaStr) return '';
  const limpia = fechaStr.trim().toLowerCase();
  
  // Reemplazar " de " por "-" para admitir formato "08 de Junio de 2026"
  let normalizada = limpia.replace(/\s+de\s+/g, '-').replace(/[\/\s]/g, '-');
  
  const partes = normalizada.split('-');
  if (partes.length !== 3) return ''; // Formato inválido
  
  let [diaStr, mesStr, anioStr] = partes;
  
  // Validar y parsear día
  const dia = parseInt(diaStr, 10);
  if (isNaN(dia) || dia < 1 || dia > 31) return '';
  
  // Validar y parsear mes
  let mes = parseInt(mesStr, 10);
  if (isNaN(mes)) {
    // Es un nombre de mes
    const idxCompleto = NOMBRES_MESES.indexOf(mesStr);
    if (idxCompleto !== -1) {
      mes = idxCompleto + 1;
    } else {
      const idxAbrev = ABREV_MESES.indexOf(mesStr.substring(0, 3));
      if (idxAbrev !== -1) {
        mes = idxAbrev + 1;
      } else {
        return ''; // Mes no reconocido
      }
    }
  }
  if (mes < 1 || mes > 12) return '';
  
  // Validar y parsear año
  let anio = parseInt(anioStr, 10);
  if (isNaN(anio)) return '';
  if (anioStr.length === 2) {
    // Si es YY, asumimos siglo 21 (20YY)
    anio = 2000 + anio;
  }
  if (anio < 1900 || anio > 2100) return '';
  
  const dd = String(dia).padStart(2, '0');
  const mm = String(mes).padStart(2, '0');
  const yyyy = String(anio);
  
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formatea una fecha YYYY-MM-DD al formato de visualización DD-MM-YYYY.
 */
export const formatearFechaVisual = (fechaDb: string): string => {
  if (!fechaDb) return '';
  const limpia = fechaDb.split('T')[0];
  const partes = limpia.split('-');
  if (partes.length !== 3) return fechaDb;
  const [yyyy, mm, dd] = partes;
  const diaSinCero = String(parseInt(dd, 10));
  return `${diaSinCero}-${mm}-${yyyy}`;
};

/**
 * Formatea una fecha YYYY-MM-DD al formato con nombre de mes (ej. 08-Junio-2026).
 */
export const formatearFechaConMesTexto = (fechaDb: string): string => {
  if (!fechaDb) return '';
  const limpia = fechaDb.split('T')[0];
  const partes = limpia.split('-');
  if (partes.length !== 3) return fechaDb;
  const [yyyy, mm, dd] = partes;
  const diaSinCero = String(parseInt(dd, 10));
  const mIdx = parseInt(mm, 10) - 1;
  const mesNombre = NOMBRES_MESES[mIdx];
  // Capitalizar nombre de mes
  const mesCap = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
  return `${diaSinCero}-${mesCap}-${yyyy}`;
};

/**
 * Compara el mes y día de una fecha de nacimiento con una fecha de referencia.
 * Retorna true si coinciden (es decir, el niño cumple años en la fecha de referencia).
 */
export const esCumpleanosHoy = (fechaNacimientoStr: string, fechaReferenciaStr: string): boolean => {
  if (!fechaNacimientoStr || !fechaReferenciaStr) return false;
  
  const partesNac = fechaNacimientoStr.split('T')[0].split('-');
  const partesRef = fechaReferenciaStr.split('T')[0].split('-');
  if (partesNac.length !== 3 || partesRef.length !== 3) return false;
  
  const [_, mesNac, diaNac] = partesNac;
  const [__, mesRef, diaRef] = partesRef;
  
  return mesNac === mesRef && diaNac === diaRef;
};



