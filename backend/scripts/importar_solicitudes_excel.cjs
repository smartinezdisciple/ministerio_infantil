// scripts/importar_solicitudes_excel.js
// Lee Formulario.xlsx, filtra Turno 5 PM (excluye Anahit, Noel, Olga), crea personas y solicitudes vía API.
// Uso: node scripts/importar_solicitudes_excel.js <usuario> <contraseña>

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const [,, USER, PASSWORD] = process.argv;
if (!USER || !PASSWORD) {
  console.error('Uso: node scripts/importar_solicitudes_excel.js <usuario> <contraseña>');
  process.exit(1);
}

const API = 'http://localhost:3001/api';
const EXCEL_PATH = path.resolve(__dirname, '../../Formulario.xlsx');

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const serialToDate = (serial) => {
  if (!serial && serial !== 0) return null;
  if (typeof serial === 'string') {
    // Already a date string? Try to parse
    if (/^\d{4}-\d{2}-\d{2}/.test(serial)) return serial;
    // Try dd/mm/yyyy
    const m = serial.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    return null;
  }
  const d = new Date(Date.UTC(1899, 11, 30 + serial));
  return d.toISOString().split('T')[0];
};

const formatCedula = (ced) => {
  if (!ced) return null;
  const c = String(ced).trim().replace(/\s+/g, '');
  // If already has hyphens in correct format
  if (/^\d{3}-\d{6}-\d{4}[A-Za-z]$/.test(c)) return c.toUpperCase();
  // If without hyphens: 0011203770037K
  const m = c.match(/^(\d{3})(\d{6})(\d{4})([A-Za-z])$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}${m[4].toUpperCase()}`;
  // If partial or other format, return cleaned
  return c.toUpperCase();
};

const extractYear = (text) => {
  if (!text) return null;
  const s = String(text);
  // Try to find a 4-digit year
  const m = s.match(/\b(19\d{2}|20\d{2})\b/);
  return m ? m[1] : null;
};

const extractYearFromDetails = (details, keywords) => {
  if (!details) return null;
  const s = String(details);
  const kwPattern = keywords.join('|');
  // Match: keyword :? year
  const re = new RegExp(`(${kwPattern})\\s*[:.\\-]?\\s*(\\d{4})`, 'i');
  const m = s.match(re);
  if (m) return m[2];
  // If no keyword match, try to find any year in the details
  // (conservative: only if the details is mostly just a year number)
  if (/^\d{4}$/.test(s.trim())) return s.trim();
  return null;
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

const mapRequisitoTexto = (val) => {
  if (!val) return false;
  const v = String(val).trim().toLowerCase();
  return v === 'terminado';
};

const parseTiempoMeses = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val * 12;
  const s = String(val).trim().toLowerCase();
  if (s === 'no' || s === 'no aplica' || s === '' || s === 'no tengo') return null;
  const m = s.match(/(\d+)/);
  if (m) return parseInt(m[1], 10) * 12;
  return null;
};

const splitNombre = (full) => {
  if (!full) return { nombres: 'Candidato', apellidos: 'Temp' };
  const parts = String(full).trim().split(/\s+/);
  const nombres = parts[0] || 'Candidato';
  const apellidos = parts.slice(1).join(' ') || 'Temp';
  return { nombres, apellidos };
};

const cleanText = (val) => {
  if (!val) return null;
  const s = String(val).trim();
  if (s === '' || s === 'No aplica' || s === 'no aplica' || s === 'No tengo' || s === 'no tengo' || s === 'No' || s === 'no' || s === '-' || s === '—') return null;
  return s;
};

const isYes = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return s === 'si' || s === 'sí';
};

const parseDateFromText = (text, keywords) => {
  if (!text) return { date: null, precision: null };
  const s = String(text);
  // Try to find explicit date: dd/mm/yyyy or dd/mm/yy
  const dateMatch = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (dateMatch) {
    return {
      date: `${dateMatch[3]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[1].padStart(2,'0')}`,
      precision: 'Dia',
    };
  }
  // Try to find keyword + year
  const kwPattern = keywords.join('|');
  const re = new RegExp(`(${kwPattern})\\s*[:.\\-]?\\s*(\\d{4})`, 'i');
  const m = s.match(re);
  if (m) {
    return { date: `${m[2]}-01-01`, precision: 'Ano' };
  }
  // Just any year
  const year = extractYear(s);
  if (year) {
    return { date: `${year}-01-01`, precision: 'Ano' };
  }
  return { date: null, precision: null };
};

const mapDenominacion = (text) => {
  if (!text) return null;
  const s = String(text).toLowerCase();
  if (s.includes('católico') || s.includes('catolica')) return 'Católico';
  if (s.includes('evangelico') || s.includes('evangélico')) return 'Evangelico';
  if (s.includes('pentecostal')) return 'Pentecostal';
  if (s.includes('testigo') || s.includes('jehová') || s.includes('jehova')) return 'Testigo de Jehová';
  return 'Otro';
};

const mapRedId = (redText) => {
  if (!redText) return null;
  const r = String(redText).trim().toLowerCase();
  // Normalize: remove accents, uppercase
  const normalized = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized === 'ajh') return 1;
  if (normalized === 'jah') return 2;
  if (normalized === 'ruiz') return 3;
  return null;
};

// ── Correcciones manuales por persona ─────────────────────────────────────────
const CORRECCIONES = {
  'tania gabriela lópez alvarado': {
    cedula: '001-091286-0049B',
    red: 'JAH',
    liderNombre: 'Olga Urbina',
    liderTelefono: '86307914',
  },
  'esmeralda saraí espinoza lópez': {
    cedula: '001-130604-1005F',
    red: 'JAH',
  },
  'maría josé montenegro gurdián': {
    red: 'JAH',
    liderazgo: 'Gap',
    liderNombre: 'Alex y Dayana Castillo',
    liderTelefono: '82654244',
  },
  'joseph leonardo flores centeno': {
    liderNombre: 'Joseph Flores',
    liderTelefono: '84888716',
  },
  'michell nayeli james brooks': {
    red: 'Ruiz',
    liderNombre: 'Marlon y Martha Barbosa',
    liderTelefono: '7777 7777',
  },
  'jayner delovy washington cayasso': {
    red: 'Ruiz',
    liderNombre: 'Marlon y Martha Barbosa',
    liderTelefono: '7777 7777',
  },
};

// ── Script principal ─────────────────────────────────────────────────────────

(async () => {
  console.log('📋 Iniciando importación de solicitudes (Turno 5 PM)');
  console.log(`📁 Leyendo Excel: ${EXCEL_PATH}`);
  console.log(`🔐 Autenticando como: ${USER}`);
  console.log('');

  // 1. Login
  let token;
  try {
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: USER, contrasena: PASSWORD }),
    });
    if (!loginRes.ok) {
      const errBody = await loginRes.json().catch(() => ({}));
      throw new Error(errBody.mensaje || `Error HTTP ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    token = loginData.token || loginData.datos?.token;
    if (!token) throw new Error('No se recibió token de autenticación');
    console.log('✅ Sesión iniciada correctamente\n');
  } catch (err) {
    console.error('❌ Error de autenticación:', err.message);
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Leer Excel
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

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Column indices
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

  // Filter Turno 5 PM
  let personas = dataRows.filter(row => {
    const turno = String(row[COL.TURNO] || '').trim();
    return turno === 'Turno 5 PM';
  }).filter(row => {
    const nombre = String(row[COL.NOMBRE] || '').trim().toLowerCase();
    return !['anahit', 'noel', 'olga'].some(excl => nombre.includes(excl));
  });

  // Deduplicar por cédula (quedarse con la primera ocurrencia)
  const seenCedulas = new Set();
  personas = personas.filter(row => {
    const cedula = formatCedula(row[COL.CEDULA]);
    if (!cedula) return true;
    if (seenCedulas.has(cedula)) return false;
    seenCedulas.add(cedula);
    return true;
  });

  console.log(`👥 Personas encontradas con Turno 5 PM (excluyendo Anahit/Noel/Olga y duplicados): ${personas.length}`);
  console.log('');

  if (personas.length === 0) {
    console.log('No hay personas para procesar. Saliendo.');
    process.exit(0);
  }

  // Requisito ID mapping
  const REQ_IDS = {
    bautismo: 6,
    retiro: 8,
    nuevosCreyentes: 1,
    obreros: 5,
    circulo: 7,
  };

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < personas.length; i++) {
    const row = personas[i];
    const nombreCompleto = String(row[COL.NOMBRE] || '').trim();
    console.log(`\n${i + 1}/${personas.length} ${nombreCompleto}`);

    try {
      // ── Transformar datos ──────────────────────────────────

      const { nombres, apellidos } = splitNombre(nombreCompleto);
      let cedula = formatCedula(row[COL.CEDULA]);
      const sexo = row[COL.SEXO] ? String(row[COL.SEXO]).trim() : null;
      const fechaNac = serialToDate(row[COL.FECHA_NAC]);

      // Teléfonos: prioridad Claro > Tigo > Casa > Trabajo
      const telClaro = cleanText(row[COL.TEL_CLARO]) || cleanText(row[COL.TEL_TIGO]) || null;
      const telCasa = cleanText(row[COL.TEL_CASA]) || null;
      const telTrabajo = cleanText(row[COL.TEL_TRABAJO]) || null;
      const telTigo = row[COL.TEL_TIGO] && !row[COL.TEL_CLARO] ? null : cleanText(row[COL.TEL_TIGO]);
      const telefonoPrincipal = telClaro || telCasa || telTrabajo || (row[COL.TEL_TIGO] ? String(row[COL.TEL_TIGO]).trim() : null);

      // Dirección
      const dirCiudad = cleanText(row[COL.DEPTO]);
      const dirMunicipio = cleanText(row[COL.MUNICIPIO]);
      let dirDistrito = cleanText(row[COL.DISTRITO]);
      // Clean common issues: "distrito ||" → "Distrito II"
      if (dirDistrito) {
        dirDistrito = dirDistrito.replace(/\|/g, 'I').replace(/[iI]+$/, match => 'I'.repeat(match.length));
        // Capitalize
        dirDistrito = dirDistrito.charAt(0).toUpperCase() + dirDistrito.slice(1).toLowerCase();
        // Ensure "Distrito" prefix
        if (!dirDistrito.toLowerCase().startsWith('distrito')) {
          dirDistrito = `Distrito ${dirDistrito}`;
        }
      }
      const dirBarrio = cleanText(row[COL.BARRIO]);
      const dirExacta = cleanText(row[COL.DIR_EXACTA]);

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
      let estadoLiderazgo = mapLiderazgo(row[COL.LIDERAZGO]);

      // Red
      let idRed = mapRedId(row[COL.RED]);

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

      // Requisitos
      const reqBautismo = mapRequisitoTexto(row[COL.REQ_BAUTISMO]);
      const reqRetiro = mapRequisitoTexto(row[COL.REQ_RETIRO]);
      const reqNuevosCreyentes = mapRequisitoTexto(row[COL.REQ_NUEVOS_CREYENTES]);
      const reqObreros = mapRequisitoTexto(row[COL.REQ_OBREROS]);
      const reqCirculo = mapRequisitoTexto(row[COL.REQ_CIRCULO]);

      const requisitos = [
        { idRequisito: REQ_IDS.bautismo, cumplido: reqBautismo },
        { idRequisito: REQ_IDS.retiro, cumplido: reqRetiro },
        { idRequisito: REQ_IDS.nuevosCreyentes, cumplido: reqNuevosCreyentes },
        { idRequisito: REQ_IDS.obreros, cumplido: reqObreros },
        { idRequisito: REQ_IDS.circulo, cumplido: reqCirculo },
      ];

      // Bautizado en agua flag
      const bautizadoAgua = reqBautismo;

      // Fechas desde detalle
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
      // Clean "No", "Noo solo infantil" → null
      let ministerioFinal = null;
      if (ministerioAdicional) {
        const m = ministerioAdicional.toLowerCase();
        if (!['no', 'noo', 'noo solo infantil', 'no he estado en ningún otro ministerio', 'no estuve solo infantil', 'ninguno', 'no aplica'].includes(m)) {
          ministerioFinal = ministerioAdicional;
        }
      }

      // ── Aplicar correcciones manuales ──────────────────
      const key = nombreCompleto.toLowerCase().trim().replace(/\.$/, '');
      const correccion = CORRECCIONES[key];
      if (correccion) {
        if (correccion.cedula) {
          cedula = formatCedula(correccion.cedula);
          process.stdout.write(`  📝 Corrección: cédula`);
        }
        if (correccion.red) {
          idRed = mapRedId(correccion.red);
          process.stdout.write(`  📝 Corrección: red → ${correccion.red}`);
        }
        if (correccion.liderazgo) {
          estadoLiderazgo = correccion.liderazgo;
          process.stdout.write(`  📝 Corrección: liderazgo → ${correccion.liderazgo}`);
        }
        if (correccion.liderNombre) {
          const ln = splitNombre(correccion.liderNombre);
          liderNombres = ln.nombres;
          liderApellidos = ln.apellidos;
          process.stdout.write(`  📝 Corrección: líder → ${correccion.liderNombre}`);
        }
        if (correccion.liderTelefono) {
          liderTel = correccion.liderTelefono;
          process.stdout.write(`  📝 Corrección: tel líder → ${correccion.liderTelefono}`);
        }
        process.stdout.write('\n');
      }

      // ── 3. Crear o buscar Persona ────────────────────────

      let idPersona = null;

      // Si tiene cédula, verificar si ya existe en BD
      if (cedula) {
        try {
          const { Pool } = require('pg');
          const pool = new Pool({
            host: process.env.PGHOST || 'localhost',
            port: process.env.PGPORT || 5432,
            database: process.env.PGDATABASE || 'Ministerio_Infantil',
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || 'Srgio2304',
          });
          const q = await pool.query('SELECT id_persona FROM Personas WHERE cedula = $1', [cedula]);
          if (q.rows.length > 0) {
            idPersona = q.rows[0].id_persona;
            process.stdout.write(`  ℹ️  Persona existente (ID: ${idPersona})`);
          }
          await pool.end();
        } catch (dbErr) {
          // Fallback: crear persona si falla la búsqueda
          console.warn('\n  ⚠️  Error al buscar en BD, se intentará crear persona:', dbErr.message);
        }
      }

      if (!idPersona) {
        const personaPayload = {
          nombres,
          apellidos,
          telefono: telefonoPrincipal || undefined,
          sexo: sexo || undefined,
          cedula: cedula || undefined,
          fechaNacimiento: fechaNac || undefined,
        };

        const personaRes = await fetch(`${API}/personas`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(personaPayload),
        });

        if (!personaRes.ok) {
          const errBody = await personaRes.json().catch(() => ({}));
          throw new Error(`Error al crear persona: ${errBody.mensaje || personaRes.status}`);
        }

        const personaData = await personaRes.json();
        idPersona = personaData.idPersona || personaData.datos?.idPersona;
        if (idPersona) process.stdout.write(`  ✅ Persona creada (ID: ${idPersona})`);
      }

      // ── 4. Crear Solicitud ──────────────────────────────

      // Verificar si ya existe una solicitud Pendiente para esta persona
      try {
        const { Pool } = require('pg');
        const pool = new Pool({
          host: process.env.PGHOST || 'localhost',
          port: process.env.PGPORT || 5432,
          database: process.env.PGDATABASE || 'Ministerio_Infantil',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'Srgio2304',
        });
        const existeSol = await pool.query(
          'SELECT id_solicitud FROM Solicitudes_Personal WHERE id_persona = $1 AND estado = $2',
          [idPersona, 'Pendiente']
        );
        if (existeSol.rows.length > 0) {
          console.log(` → ⏭️ Solicitud ya existe (ID: ${existeSol.rows[0].id_solicitud}), saltando`);
          await pool.end();
          successCount++;
          continue;
        }
        await pool.end();
      } catch (dbErr) {
        // Si falla la verificación, continuar e intentar crear
      }

      const solicitudPayload = {
        idPersona,
        idRolSolicitado: 1,
        notasStaff: 'Importación desde formulario Excel - Turno 5 PM',
        estadoCivil: ec.estadoCivil,
        condicionCivil: ec.condicionCivil,
        nombreConyuge: nombreConyuge || undefined,
        conyugeOcupacion: conyugeOcupacion || undefined,
        conyugeCentroLaboral: conyugeCentroLaboral || undefined,
        tieneHijos,
        numeroHijos: tieneHijos ? numeroHijos : undefined,
        idRed: idRed || undefined,
        estadoLiderazgo: estadoLiderazgo || undefined,
        circuloAmistadDesde: circuloAmistadDesde.date || undefined,
        circuloAmistadPrecision: circuloAmistadDesde.precision || undefined,
        tiempoIglesiaMeses: tiempoIglesiaMeses ?? undefined,
        ministerioAdicional: ministerioFinal || undefined,
        sexoCandidato: sexo || undefined,
        cedulaCandidato: cedula || undefined,
        ocupacionCandidato: ocupacion || undefined,
        centroLaboralCandidato: centroLaboral || undefined,
        nivelAcademicoCandidato: nivelAcademico || undefined,
        dirCiudad: dirCiudad || undefined,
        dirMunicipio: dirMunicipio || undefined,
        dirDistrito: dirDistrito || undefined,
        dirBarrio: dirBarrio || undefined,
        dirExacta: dirExacta || undefined,
        telClaro: telClaro || undefined,
        telCasa: telCasa || undefined,
        telOficina: telTrabajo || undefined,
        bautizadoAgua,
        fechaBautismo: fechaBautismo.date || undefined,
        fechaBautismoPrecision: fechaBautismo.precision || undefined,
        clasesBiblicasNinos,
        clasesBiblicasDetalle: clasesBiblicasDetalle || undefined,
        capacitacionEnsenanza,
        capacitacionDetalle: capacitacionDetalle || undefined,
        observacionesEspiritualesSol: null,
        liderNombres: liderNombres || undefined,
        liderApellidos: liderApellidos || undefined,
        liderTelefono: liderTel || undefined,
        asistioOtraIglesia,
        nombreOtraIglesia: nombreIglesiaAnterior || undefined,
        denominacionOtraIglesia: denominacionOtraIglesia || undefined,
        requisitos,
      };

      const solicitudRes = await fetch(`${API}/solicitudes`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(solicitudPayload),
      });

      if (!solicitudRes.ok) {
        const errBody = await solicitudRes.json().catch(() => ({}));
        throw new Error(`Error al crear solicitud: ${errBody.mensaje || solicitudRes.status}`);
      }

      const solicitudData = await solicitudRes.json();
      const idSolicitud = solicitudData.idSolicitud || solicitudData.datos?.idSolicitud;
      console.log(` → Solicitud creada (ID: ${idSolicitud})`);
      successCount++;

      // Pausa para no exceder rate limiter (20/min)
      await sleep(3500);
    } catch (err) {
      console.error(`\n  ❌ Error: ${err.message}`);
      errorCount++;
    }
  }

  // ── Resumen ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Importación completada: ${successCount} solicitudes creadas`);
  if (errorCount > 0) console.log(`❌ ${errorCount} errores`);
  console.log('═'.repeat(50));
})();
