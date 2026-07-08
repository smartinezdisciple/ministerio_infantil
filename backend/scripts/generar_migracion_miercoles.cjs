// scripts/generar_migracion_miercoles.cjs
// Lee Formulario.xlsx, filtra Turno Miercoles, genera migración SQL con solicitudes aprobadas.
// Uso: node scripts/generar_migracion_miercoles.cjs <idGestionadoPor> [archivoSalida]
//   idGestionadoPor = ID del usuario en Personal_Sistema que gestiona/aprueba (ej: 1)
//   archivoSalida   = ruta del SQL generado (default: migracion_v8_miercoles_solicitudes.sql)

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const [,, ID_GESTIONADO] = process.argv;
if (!ID_GESTIONADO || isNaN(Number(ID_GESTIONADO))) {
  console.error('Uso: node scripts/generar_migracion_miercoles.cjs <idGestionadoPor> [archivoSalida]');
  process.exit(1);
}

const EXCEL_PATH = path.resolve(__dirname, '../../Formulario2.xlsx');
const SALIDA = process.argv[3] || path.resolve(__dirname, '../migracion_v8_miercoles_solicitudes.sql');

// ── Helpers ──────────────────────────────────────────────────────────────────

const serialToDate = (serial) => {
  if (!serial && serial !== 0) return null;
  if (typeof serial === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(serial)) return serial;
    const m = serial.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    return null;
  }
  const d = new Date(Date.UTC(1899, 11, 30 + serial));
  return d.toISOString().split('T')[0];
};

const esc = (val) => {
  if (val === null || val === undefined) return 'NULL';
  const s = String(val).trim();
  if (s === '' || s === '-' || s === '—') return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
};

const escBool = (val) => val ? 'TRUE' : 'FALSE';

const formatCedula = (ced) => {
  if (!ced) return null;
  const c = String(ced).trim().replace(/\s+/g, '');
  if (/^\d{3}-\d{6}-\d{4}[A-Za-z]$/.test(c)) return c.toUpperCase();
  const m = c.match(/^(\d{3})(\d{6})(\d{4})([A-Za-z])$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}${m[4].toUpperCase()}`;
  // Handle formats like 001-28-03-1966
  const m2 = c.match(/^(\d{3})-(\d{2})-(\d{2})-(\d{4})$/);
  if (m2) return `${m2[1]}-${m2[2]}${m2[3]}${m2[4]}X`; // best guess with X
  // Handle 001 170469 0014v
  const m3 = c.match(/^(\d{3})\s+(\d{6})\s+(\d{4})([A-Za-z])$/);
  if (m3) return `${m3[1]}-${m3[2]}-${m3[3]}${m3[4].toUpperCase()}`;
  // Handle 281-010306-1002Q (already correct)
  const m4 = c.match(/^(\d{3})-(\d{6})-(\d{4})([A-Za-z])$/);
  if (m4) return c.toUpperCase();
  return c.toUpperCase();
};

const splitNombre = (full) => {
  if (!full) return { nombres: 'Candidato', apellidos: 'Temp' };
  const parts = String(full).trim().split(/\s+/);
  const nombres = parts[0] || 'Candidato';
  const apellidos = parts.slice(1).join(' ') || 'Temp';
  return { nombres, apellidos };
};

const mapEstadoCivil = (val, subVal) => {
  const v = String(val || '').trim().toLowerCase();
  const sv = String(subVal || '').trim().toLowerCase();
  if (v.includes('casado')) return { estadoCivil: 'Casado', condicionCivil: mapCondicionCasado(sv) };
  return { estadoCivil: 'Soltero', condicionCivil: mapCondicionSoltero(sv) };
};

const mapCondicionCasado = (sv) => {
  if (sv.includes('matrimonio 2') || sv.includes('2do') || sv.includes('segundo')) return 'Segundo_Matrimonio';
  if (sv.includes('matrimonio 3') || sv.includes('3ro') || sv.includes('tercer')) return 'Tercer_Matrimonio';
  if (sv.includes('matrimonio 4') || sv.includes('otro')) return 'Otro_Matrimonio';
  return 'Primer_Matrimonio';
};

const mapCondicionSoltero = (sv) => {
  if (sv.includes('divorciado') || sv.includes('divorciada')) return 'Divorciado_1er_Matrimonio';
  if (sv.includes('viudo') || sv.includes('viuda')) return 'Viudo';
  return 'Ninguna';
};

const cleanText = (val) => {
  if (!val) return null;
  const s = String(val).trim();
  if (s === '' || s === 'No aplica' || s === 'no aplica' || s === 'No tengo' || s === 'no tengo' || s === 'No' || s === 'no' || s === '-' || s === '—' || s === 'No tengo experiencia') return null;
  return s;
};

const isYes = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return s === 'si' || s === 'sí';
};

const mapRequisitoTexto = (val) => {
  if (!val) return false;
  const v = String(val).trim().toLowerCase();
  return v === 'terminado';
};

const mapLiderazgo = (val) => {
  if (!val) return null;
  const v = String(val).trim();
  const lc = v.toLowerCase();
  if (lc === 'miembro') return 'Miembro';
  if (lc === 'lider') return 'Lider';
  if (lc.includes('lider apoyo') || lc.includes('lider_apoyo')) return 'Lider_Apoyo';
  if (lc === 'gap') return 'Gap';
  return null;
};

const mapNivelAcademico = (val) => {
  if (!val) return null;
  const v = String(val).trim().toLowerCase();
  if (v.includes('licenciatura') || v.includes('universitario')) return 'Licenciatura';
  if (v.includes('ingenieria')) return 'Ingenieria';
  if (v === 'tecnico' || v === 'nivel_tecnico') return 'Nivel_Tecnico';
  if (v.includes('secundaria')) return 'Secundaria';
  if (v.includes('primaria')) return 'Primaria';
  if (v.includes('maestria')) return 'Maestria';
  if (v.includes('postgrado')) return 'Postgrado';
  if (v.includes('doctorado')) return 'Doctorado';
  return null;
};

const parseTiempoMeses = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return Math.round(val * 12);
  const s = String(val).trim().toLowerCase();
  if (s === 'no' || s === 'no aplica' || s === '' || s === 'no tengo') return null;
  const m = s.match(/(\d+)/);
  if (m) {
    // Check if it says "9-10 años" - take first number
    const num = parseInt(m[1], 10);
    return num * 12;
  }
  return null;
};

const extractYear = (text) => {
  if (!text) return null;
  const s = String(text);
  const m = s.match(/\b(19\d{2}|20\d{2})\b/);
  return m ? m[1] : null;
};

const parseDateFromText = (text, keywords) => {
  if (!text) return { date: null, precision: null };
  const s = String(text);
  const dateMatch = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (dateMatch) {
    return {
      date: `${dateMatch[3]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[1].padStart(2,'0')}`,
      precision: 'Dia',
    };
  }
  // Try keyword + month name + year
  const kwPattern = keywords.join('|');
  const monthNames = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre';
  const reMonth = new RegExp(`(${kwPattern})\\s*[:.\\-]?\\s*(?:\\w+\\s+)?(\\d{4})`, 'i');
  const mMonth = s.match(reMonth);
  if (mMonth) {
    return { date: `${mMonth[2]}-01-01`, precision: 'Ano' };
  }
  const re = new RegExp(`(${kwPattern})\\s*[:.\\-]?\\s*(\\d{4})`, 'i');
  const m = s.match(re);
  if (m) {
    return { date: `${m[2]}-01-01`, precision: 'Ano' };
  }
  const year = extractYear(s);
  if (year) {
    return { date: `${year}-01-01`, precision: 'Ano' };
  }
  return { date: null, precision: null };
};

const mapRedId = (redText) => {
  if (!redText) return null;
  const r = String(redText).trim().toLowerCase();
  const normalized = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized === 'ajh') return 1;
  if (normalized === 'jah') return 2;
  if (normalized === 'ruiz') return 3;
  return null;
};

const mapDenominacion = (text) => {
  if (!text) return null;
  const s = String(text).toLowerCase();
  if (s.includes('católico') || s.includes('catolica')) return 'Católico';
  if (s.includes('evangelico') || s.includes('evangélico') || s.includes('evangelico')) return 'Evangelico';
  if (s.includes('pentecostal') || s.includes('pentecostes')) return 'Pentecostal';
  if (s.includes('testigo') || s.includes('jehová') || s.includes('jehova') || s.includes('morava')) return 'Otro';
  return 'Otro';
};

// ── Correcciones manuales ─────────────────────────────────────────────────────

const CORRECCIONES = {};

// ── Columnas Excel ────────────────────────────────────────────────────────────

const COL = {
  NOMBRE: 1, TURNO: 2, CEDULA: 3, SEXO: 4, FECHA_NAC: 5,
  TEL_CASA: 6, TEL_TRABAJO: 7, TEL_TIGO: 8, TEL_CLARO: 9,
  DEPTO: 10, MUNICIPIO: 11, DISTRITO: 12, BARRIO: 13, DIR_EXACTA: 14,
  ESTADO_CIVIL: 15, CONDICION_CIVIL: 16,
  CONYUGE_NOMBRE: 17, CONYUGE_OCUPACION: 18, CONYUGE_LABORAL: 19,
  OCUPACION: 20, CENTRO_LABORAL: 21, NIVEL_ACAD: 22, NUM_HIJOS: 23,
  REQ_BAUTISMO: 24, REQ_RETIRO: 25, REQ_NUEVOS_CREYENTES: 26,
  REQ_OBREROS: 27, REQ_CIRCULO: 28,
  DETALLE_FECHAS: 29,
  LIDERAZGO: 30, RED: 31,
  LIDER_NOMBRE: 32, LIDER_TEL: 33,
  OTRA_IGLESIA: 34, IGLESIA_ANTERIOR: 35,
  TIEMPO_IGLESIA: 36,
  CLASES_BIBLICAS: 37, CAPACITACION: 38,
  MINISTERIO_ADICIONAL: 39,
};

// Requisito IDs (debe coincidir con la BD)
const REQ_IDS = {
  nuevosCreyentes: 1,
  obreros: 5,
  bautismo: 6,
  circulo: 7,
  retiro: 8,
};

// ── Script principal ─────────────────────────────────────────────────────────

(async () => {
  console.log('📋 Generando migración SQL para Turno Miercoles');
  console.log(`📁 Leyendo Excel: ${EXCEL_PATH}`);

  // 1. Leer Excel
  let workbook;
  try {
    workbook = XLSX.readFile(EXCEL_PATH);
  } catch (err) {
    console.error('❌ Error al leer el archivo Excel:', err.message);
    process.exit(1);
  }

  const sheet = workbook.Sheets['Respuestas de formulario 1'];
  if (!sheet) {
    console.error('❌ No se encontró la hoja "Respuestas de formulario 1"');
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rows.length < 2) {
    console.error('❌ El Excel no tiene datos');
    process.exit(1);
  }

  const dataRows = rows.slice(1);

  // Filtrar Turno Miercoles
  let personas = dataRows.filter(row => {
    const turno = String(row[COL.TURNO] || '').trim();
    return turno === 'Turno Miercoles';
  }).filter(row => {
    const nombre = String(row[COL.NOMBRE] || '').trim().toLowerCase();
    return !['maria antonia'].some(excl => nombre.includes(excl));
  });

  // Deduplicar por cédula
  const seenCedulas = new Set();
  personas = personas.filter(row => {
    const cedula = formatCedula(row[COL.CEDULA]);
    if (!cedula) return true;
    if (seenCedulas.has(cedula)) return false;
    seenCedulas.add(cedula);
    return true;
  });

  console.log(`👥 Personas encontradas: ${personas.length}`);
  if (personas.length === 0) {
    console.log('No hay personas para procesar. Saliendo.');
    process.exit(0);
  }

  // ── Generar SQL ──────────────────────────────────────────────────────

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const fechaHoy = new Date().toISOString().split('T')[0];

  let sql = `-- ============================================================================
-- migracion_v8_miercoles_solicitudes.sql
-- Generado: ${now}
-- Propósito: Importar solicitudes aprobadas de Turno Miercoles desde Formulario.xlsx
-- Uso: Aplicar contra Neon: psql <connection_string> -f migracion_v8_miercoles_solicitudes.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREAR PERSONAS (solo si no existen, identificadas por cédula única)
-- ============================================================================

`;

  const insertStatements = [];

  for (let i = 0; i < personas.length; i++) {
    const row = personas[i];
    const nombreCompleto = String(row[COL.NOMBRE] || '').trim();
    const { nombres, apellidos } = splitNombre(nombreCompleto);
    const cedula = formatCedula(row[COL.CEDULA]);
    const sexo = row[COL.SEXO] ? String(row[COL.SEXO]).trim() : null;
    const fechaNac = serialToDate(row[COL.FECHA_NAC]);

    const telClaro = cleanText(row[COL.TEL_CLARO]);
    const telTigo = cleanText(row[COL.TEL_TIGO]);
    const telCasa = cleanText(row[COL.TEL_CASA]);
    const telTrabajo = cleanText(row[COL.TEL_TRABAJO]);
    const telefonoPrincipal = telClaro || telTigo || telCasa || telTrabajo || null;

    // Estado civil
    const ec = mapEstadoCivil(row[COL.ESTADO_CIVIL], row[COL.CONDICION_CIVIL]);

    // Cónyuge
    const nombreConyuge = cleanText(row[COL.CONYUGE_NOMBRE]);
    const conyugeOcupacion = cleanText(row[COL.CONYUGE_OCUPACION]);
    const conyugeCentroLaboral = cleanText(row[COL.CONYUGE_LABORAL]);

    // Hijos
    const numHijosVal = row[COL.NUM_HIJOS];
    let tieneHijos = false;
    let numeroHijos = 0;
    if (numHijosVal !== null && numHijosVal !== undefined) {
      const s = String(numHijosVal).trim().toLowerCase();
      if (s === 'no' || s === 'no tengo' || s === '' || s === '0' || s === '-') {
        tieneHijos = false;
        numeroHijos = 0;
      } else {
        const n = parseInt(s, 10);
        if (!isNaN(n) && n > 0) {
          tieneHijos = true;
          numeroHijos = n;
        }
      }
    }

    // Ocupación
    const ocupacion = cleanText(row[COL.OCUPACION]);
    const centroLaboral = cleanText(row[COL.CENTRO_LABORAL]);

    // Nivel académico
    const nivelAcademico = mapNivelAcademico(row[COL.NIVEL_ACAD]);

    // Estado liderazgo
    const estadoLiderazgo = mapLiderazgo(row[COL.LIDERAZGO]);

    // Red
    const idRed = mapRedId(row[COL.RED]);

    // Líder
    const liderNombreCompleto = cleanText(row[COL.LIDER_NOMBRE]);
    let liderTel = cleanText(row[COL.LIDER_TEL]);
    let liderNombres = null;
    let liderApellidos = null;
    if (liderNombreCompleto) {
      const ln = splitNombre(liderNombreCompleto);
      liderNombres = ln.nombres;
      liderApellidos = ln.apellidos;
    }

    // Aplicar correcciones manuales
    const key = nombreCompleto.toLowerCase().trim().replace(/\.$/, '');
    const correccion = CORRECCIONES[key];

    const cedulaFinal = correccion?.cedula ? formatCedula(correccion.cedula) : cedula;

    // Requisitos
    const reqBautismo = mapRequisitoTexto(row[COL.REQ_BAUTISMO]);
    const reqRetiro = mapRequisitoTexto(row[COL.REQ_RETIRO]);
    const reqNuevosCreyentes = mapRequisitoTexto(row[COL.REQ_NUEVOS_CREYENTES]);
    const reqObreros = mapRequisitoTexto(row[COL.REQ_OBREROS]);
    const reqCirculo = mapRequisitoTexto(row[COL.REQ_CIRCULO]);

    const bautizadoAgua = reqBautismo;

    // Fechas
    const detalles = row[COL.DETALLE_FECHAS];
    const fechaBautismo = parseDateFromText(detalles, ['bautismo', 'bautizo', 'bautizado', 'bauti', 'baut']);
    const circuloAmistadDesde = parseDateFromText(detalles, ['circulo', 'circulo de amistad', 'círculo', 'c. amistad', 'c:a']);

    // Otra iglesia
    const asistioOtraIglesia = isYes(row[COL.OTRA_IGLESIA]);
    const nombreIglesiaAnterior = asistioOtraIglesia ? cleanText(row[COL.IGLESIA_ANTERIOR]) : null;
    const denominacionOtraIglesia = asistioOtraIglesia ? mapDenominacion(row[COL.IGLESIA_ANTERIOR]) : null;

    // Tiempo iglesia
    const tiempoIglesiaMeses = parseTiempoMeses(row[COL.TIEMPO_IGLESIA]);

    // Clases bíblicas / Capacitación
    const clasesBiblicasTexto = cleanText(row[COL.CLASES_BIBLICAS]);
    let clasesBiblicasNinos = false;
    let clasesBiblicasDetalle = null;
    if (clasesBiblicasTexto && !['no', 'no tengo experiencia', 'no tengo experiencia de impartir clases en otra iglesia', 'no aplica'].includes(clasesBiblicasTexto.toLowerCase())) {
      clasesBiblicasNinos = true;
      clasesBiblicasDetalle = clasesBiblicasTexto;
    }

    const capacitacionTexto = cleanText(row[COL.CAPACITACION]);
    let capacitacionEnsenanza = false;
    let capacitacionDetalle = null;
    if (capacitacionTexto && !['no', 'no tengo experiencia', 'no aplica'].includes(capacitacionTexto.toLowerCase())) {
      capacitacionEnsenanza = true;
      capacitacionDetalle = capacitacionTexto;
    }

    // Ministerio adicional
    const ministerioAdicional = cleanText(row[COL.MINISTERIO_ADICIONAL]);
    let ministerioFinal = null;
    if (ministerioAdicional) {
      const m = ministerioAdicional.toLowerCase();
      if (!['no', 'noo', 'noo solo infantil', 'no he estado en ningún otro ministerio', 'no estuve solo infantil', 'ninguno', 'no aplica', 'no, solo ministerio infantil'].includes(m)) {
        ministerioFinal = ministerioAdicional;
      }
    }

    // Correcciones de líder
    if (correccion?.liderNombre) {
      const ln = splitNombre(correccion.liderNombre);
      liderNombres = ln.nombres;
      liderApellidos = ln.apellidos;
    }
    if (correccion?.liderTelefono) {
      liderTel = correccion.liderTelefono;
    }
    const liderRed = correccion?.red ? mapRedId(correccion.red) : null;
    const estadoLiderazgoFinal = correccion?.liderazgo || estadoLiderazgo;

    // ── Construir INSERT para Persona ────────────────────────────────

    const colsPersona = ['Nombres', 'Apellidos'];
    const valsPersona = [esc(nombres), esc(apellidos)];
    if (sexo) { colsPersona.push('Sexo'); valsPersona.push(esc(sexo)); }
    if (cedulaFinal) { colsPersona.push('Cedula'); valsPersona.push(esc(cedulaFinal)); }
    if (fechaNac) { colsPersona.push('Fecha_Nacimiento'); valsPersona.push(esc(fechaNac)); }

    sql += `-- ${nombreCompleto}\n`;
    sql += `INSERT INTO Personas (${colsPersona.join(', ')})\n`;
    sql += `SELECT ${valsPersona.join(', ')}\n`;
    sql += `WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE`;
    if (cedulaFinal) {
      sql += ` Cedula = ${esc(cedulaFinal)}`;
    } else {
      sql += ` Nombres = ${esc(nombres)} AND Apellidos = ${esc(apellidos)}`;
    }
    sql += `);\n\n`;

    // ── Obtener o usar el ID de persona ────────────────────────────

    const idPersonaRef = cedulaFinal
      ? `(SELECT ID_Persona FROM Personas WHERE Cedula = ${esc(cedulaFinal)})`
      : `(SELECT ID_Persona FROM Personas WHERE Nombres = ${esc(nombres)} AND Apellidos = ${esc(apellidos)} AND Cedula IS NULL)`;

    // ── Telefonos_Personas ─────────────────────────────────────────

    const telefonos = [];
    if (telCasa) telefonos.push({ tipo: 'Casa', numero: telCasa, orden: 1 });
    if (telTrabajo) telefonos.push({ tipo: 'Oficina', numero: telTrabajo, orden: 2 });
    if (telClaro) telefonos.push({ tipo: 'Claro', numero: telClaro, orden: 3 });
    if (telTigo) telefonos.push({ tipo: 'Movistar', numero: telTigo, orden: 4 });

    if (telefonos.length > 0) {
      sql += `-- Teléfonos: ${nombreCompleto}\n`;
      telefonos.forEach((tel, idx) => {
        sql += `INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)\n`;
        const esPrincipal = idx === 0 ? 'TRUE' : 'FALSE';
        sql += `SELECT ${idPersonaRef}, ${esc(tel.tipo)}, ${esc(tel.numero)}, ${esPrincipal}\n`;
        sql += `WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = ${idPersonaRef} AND Tipo = ${esc(tel.tipo)} AND Numero = ${esc(tel.numero)});\n`;
      });
      sql += '\n';
    }

    // ── Personas_Direcciones ────────────────────────────────────────

    const dirCiudad = cleanText(row[COL.DEPTO]);
    let dirDistrito = cleanText(row[COL.DISTRITO]);
    if (dirDistrito) {
      dirDistrito = dirDistrito.replace(/\|/g, 'I').replace(/[iI]+$/, match => 'I'.repeat(match.length));
      dirDistrito = dirDistrito.charAt(0).toUpperCase() + dirDistrito.slice(1).toLowerCase();
      if (!dirDistrito.toLowerCase().startsWith('distrito')) {
        dirDistrito = `Distrito ${dirDistrito}`;
      }
    }
    const dirMunicipio = cleanText(row[COL.MUNICIPIO]);
    const dirBarrio = cleanText(row[COL.BARRIO]);
    const dirExacta = cleanText(row[COL.DIR_EXACTA]);

    const tieneDireccion = dirCiudad || dirMunicipio || dirDistrito || dirBarrio || dirExacta;
    if (tieneDireccion) {
      sql += `-- Dirección: ${nombreCompleto}\n`;
      sql += `INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)\n`;
      sql += `SELECT ${idPersonaRef}, 'Residencial', ${esc(dirCiudad)}, ${esc(dirMunicipio)}, ${esc(dirDistrito)}, ${esc(dirBarrio)}, ${esc(dirExacta)}, TRUE\n`;
      sql += `WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = ${idPersonaRef} AND Es_Principal = TRUE);\n\n`;
    }

    // ── Solicitud (ya aprobada) ────────────────────────────────────

    // Determinar red final (corrección > dato excel)
    const idRedFinal = liderRed || idRed;

    // Estado_Civil defaults
    const ecFinal = ec.estadoCivil || 'Soltero';
    const ccFinal = ec.condicionCivil || 'Ninguna';

    sql += `-- Solicitud aprobada: ${nombreCompleto}\n`;
    sql += `INSERT INTO Solicitudes_Personal (\n`;
    sql += `  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,\n`;
    sql += `  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,\n`;
    sql += `  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,\n`;
    sql += `  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,\n`;
    sql += `  Tiene_Hijos, Numero_Hijos,\n`;
    sql += `  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,\n`;
    sql += `  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,\n`;
    sql += `  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,\n`;
    sql += `  ID_Red, Estado_Liderazgo,\n`;
    sql += `  Circulo_Amistad_Desde, Circulo_Amistad_Precision,\n`;
    sql += `  Tiempo_Iglesia_Meses, Ministerio_Adicional,\n`;
    sql += `  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,\n`;
    sql += `  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,\n`;
    sql += `  Capacitacion_Ensenanza, Capacitacion_Detalle,\n`;
    sql += `  Observaciones_Espirituales_Sol,\n`;
    sql += `  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia\n`;
    sql += `) VALUES (\n`;
    sql += `  ${idPersonaRef}, 1, ${ID_GESTIONADO}, ${ID_GESTIONADO},\n`;
    sql += `  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',\n`;
    sql += `  ${esc(sexo)}, ${esc(cedulaFinal)}, ${esc(ecFinal)}, ${esc(ccFinal)},\n`;
    sql += `  ${esc(nombreConyuge)}, ${esc(conyugeOcupacion)}, ${esc(conyugeCentroLaboral)},\n`;
    sql += `  ${escBool(tieneHijos)}, ${tieneHijos ? numeroHijos : 'NULL'},\n`;
    sql += `  ${esc(dirCiudad)}, ${esc(dirMunicipio)}, ${esc(dirDistrito)}, ${esc(dirBarrio)}, ${esc(dirExacta)},\n`;
    sql += `  ${esc(telCasa)}, ${esc(telTrabajo)}, ${esc(telClaro)}, ${esc(telTigo)},\n`;
    sql += `  ${esc(ocupacion)}, ${esc(centroLaboral)}, ${esc(nivelAcademico)},\n`;
    sql += `  ${idRedFinal ?? 'NULL'}, ${esc(estadoLiderazgoFinal)},\n`;
    sql += `  ${esc(circuloAmistadDesde.date)}, ${esc(circuloAmistadDesde.precision)},\n`;
    sql += `  ${tiempoIglesiaMeses ?? 'NULL'}, ${esc(ministerioFinal)},\n`;
    sql += `  ${escBool(bautizadoAgua)}, ${esc(fechaBautismo.date)}, ${esc(fechaBautismo.precision)},\n`;
    sql += `  ${escBool(clasesBiblicasNinos)}, ${esc(clasesBiblicasDetalle || 'Completado')},\n`;
    sql += `  ${escBool(capacitacionEnsenanza)}, ${esc(capacitacionDetalle || 'Completado')},\n`;
    sql += `  NULL,\n`;
    sql += `  ${escBool(asistioOtraIglesia)}, ${esc(nombreIglesiaAnterior)}, ${esc(denominacionOtraIglesia)}\n`;
    sql += `);\n\n`;

    const idSolicitudRef = `(SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = ${idPersonaRef})`;

    // ── Solicitudes_Requisitos ──────────────────────────────────────

    const requisitos = [
      { id: REQ_IDS.bautismo, cumplido: reqBautismo },
      { id: REQ_IDS.retiro, cumplido: reqRetiro },
      { id: REQ_IDS.nuevosCreyentes, cumplido: reqNuevosCreyentes },
      { id: REQ_IDS.obreros, cumplido: reqObreros },
      { id: REQ_IDS.circulo, cumplido: reqCirculo },
    ];

    const reqsConCumplido = requisitos.filter(r => r.cumplido);
    if (reqsConCumplido.length > 0) {
      sql += `-- Requisitos: ${nombreCompleto}\n`;
      reqsConCumplido.forEach(r => {
        sql += `INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)\n`;
        sql += `SELECT ${idSolicitudRef}, ${r.id}, TRUE, CURRENT_DATE\n`;
        sql += `WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = ${idSolicitudRef} AND ID_Requisito = ${r.id});\n`;
      });
      sql += '\n';
    }

    // ── Personal_Sistema ──────────────────────────────────────────

    sql += `-- Personal_Sistema: ${nombreCompleto}\n`;
    sql += `INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)\n`;
    sql += `SELECT ${idPersonaRef}, 1,\n`;
    sql += `  ${esc(`temp_${i + 1}_miercoles`)},\n`;
    sql += `  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',\n`;
    sql += `  CURRENT_DATE, ${ID_GESTIONADO}, ${ID_GESTIONADO}, ${idSolicitudRef}\n`;
    sql += `WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = ${idPersonaRef});\n\n`;

    // ── Personal_Info_Personal ────────────────────────────────────

    sql += `-- Info Personal: ${nombreCompleto}\n`;
    sql += `INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)\n`;
    sql += `SELECT ${idPersonaRef}, ${esc(ecFinal)}, ${esc(ccFinal)}, ${esc(nombreConyuge)}, ${esc(conyugeOcupacion)}, ${esc(conyugeCentroLaboral)}, ${escBool(tieneHijos)}, ${tieneHijos ? numeroHijos : 'NULL'}, ${esc(dirExacta)}, ${esc(ocupacion)}, ${esc(centroLaboral)}, ${esc(nivelAcademico)}\n`;
    sql += `WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = ${idPersonaRef});\n\n`;

    // ── Personal_Info_Iglesia ─────────────────────────────────────

    sql += `-- Info Iglesia: ${nombreCompleto}\n`;
    sql += `INSERT INTO Personal_Info_Iglesia (\n`;
    sql += `  ID_Persona, ID_Red, Estado_Liderazgo,\n`;
    sql += `  Tiempo_Iglesia_Meses, Ministerio_Adicional,\n`;
    sql += `  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,\n`;
    sql += `  Circulo_Amistad_Desde, Circulo_Amistad_Precision,\n`;
    sql += `  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,\n`;
    sql += `  Capacitacion_Ensenanza, Capacitacion_Detalle,\n`;
    sql += `  Observaciones_Espirituales,\n`;
    sql += `  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia\n`;
    sql += `) SELECT\n`;
    sql += `  ${idPersonaRef}, ${idRedFinal ?? 'NULL'}, ${esc(estadoLiderazgoFinal)},\n`;
    sql += `  ${tiempoIglesiaMeses ?? 'NULL'}, ${esc(ministerioFinal)},\n`;
    sql += `  ${escBool(bautizadoAgua)}, ${esc(fechaBautismo.date)}, ${esc(fechaBautismo.precision)},\n`;
    sql += `  ${esc(circuloAmistadDesde.date)}, ${esc(circuloAmistadDesde.precision)},\n`;
    sql += `  ${escBool(clasesBiblicasNinos)}, ${esc(clasesBiblicasDetalle || 'Completado')},\n`;
    sql += `  ${escBool(capacitacionEnsenanza)}, ${esc(capacitacionDetalle || 'Completado')},\n`;
    sql += `  NULL,\n`;
    sql += `  ${escBool(asistioOtraIglesia)}, ${esc(nombreIglesiaAnterior)}, ${esc(denominacionOtraIglesia)}\n`;
    sql += `WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = ${idPersonaRef});\n\n`;

    // ── Personal_Requisitos ───────────────────────────────────────

    sql += `-- Personal Requisitos: ${nombreCompleto}\n`;
    reqsConCumplido.forEach(r => {
      sql += `INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)\n`;
      sql += `SELECT ${idPersonaRef}, ${r.id}, TRUE, CURRENT_DATE\n`;
      sql += `WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = ${idPersonaRef} AND ID_Requisito = ${r.id});\n`;
    });
    sql += '\n';

    console.log(`  ✅ ${nombreCompleto}`);
  }

  sql += `-- ============================================================================\n`;
  sql += `-- FIN: ${personas.length} personas procesadas\n`;
  sql += `-- ============================================================================\n\n`;
  sql += `COMMIT;\n`;

  // Escribir archivo
  fs.writeFileSync(SALIDA, sql, 'utf-8');
  console.log(`\n✅ Migración generada: ${SALIDA}`);
  console.log(`📊 Total: ${personas.length} personas`);

})();
