import 'dotenv/config';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , USER, PASSWORD] = process.argv;
if (!USER || !PASSWORD) {
  console.error('Uso: npx tsx scripts/importar_solicitudes_11am.ts <usuario_admin> <contraseña_admin>');
  process.exit(1);
}

const API = 'http://localhost:3001/api';
const EXCEL_PATH = path.resolve(__dirname, '../../actualizada.xlsx');

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const serialToDate = (serial: unknown): string | null => {
  if (!serial && serial !== 0) return null;
  if (typeof serial === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(serial)) return serial;
    const m = serial.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return null;
  }
  const d = new Date(Date.UTC(1899, 11, 30 + (serial as number)));
  return d.toISOString().split('T')[0];
};

const formatCedula = (ced: unknown): string | null => {
  if (!ced) return null;
  const c = String(ced).trim().replace(/\s+/g, '');
  if (/^\d{3}-\d{6}-\d{4}[A-Za-z]$/.test(c)) return c.toUpperCase();
  const m = c.match(/^(\d{3})(\d{6})(\d{4})([A-Za-z])$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}${m[4].toUpperCase()}`;
  return c.toUpperCase();
};

const splitNombre = (full: string): { nombres: string; apellidos: string } => {
  if (!full) return { nombres: 'Candidato', apellidos: 'Temp' };
  const parts = String(full).trim().split(/\s+/);
  const nombres = parts[0] || 'Candidato';
  const apellidos = parts.slice(1).join(' ') || 'Temp';
  return { nombres, apellidos };
};

const cleanText = (val: unknown): string | null => {
  if (!val) return null;
  const s = String(val).trim();
  if (s === '' || s === 'No aplica' || s === 'no aplica' || s === 'No tengo' || s === 'no tengo' || s === 'No' || s === 'no' || s === '-' || s === '—') return null;
  return s;
};

const mapNivelAcademico = (val: unknown): string | null => {
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

const mapRequisitoTexto = (val: unknown): boolean => {
  if (!val) return false;
  const v = String(val).trim().toLowerCase();
  return v === 'terminado';
};

const mapEstadoCivil = (val: unknown, subVal: unknown): { estadoCivil: string; condicionCivil: string } => {
  const v = String(val || '').trim().toLowerCase();
  const sv = String(subVal || '').trim().toLowerCase();

  if (v.includes('casado')) {
    let cond = 'Primer_Matrimonio';
    if (sv.includes('matrimonio 2') || sv.includes('2do') || sv.includes('segundo')) cond = 'Segundo_Matrimonio';
    else if (sv.includes('matrimonio 3') || sv.includes('3ro') || sv.includes('tercer')) cond = 'Tercer_Matrimonio';
    else if (sv.includes('matrimonio 4') || sv.includes('otro')) cond = 'Otro_Matrimonio';
    return { estadoCivil: 'Casado', condicionCivil: cond };
  }

  let cond = 'Ninguna';
  if (sv.includes('divorciado')) cond = 'Divorciado_1er_Matrimonio';
  else if (sv.includes('viudo')) cond = 'Viudo';
  return { estadoCivil: 'Soltero', condicionCivil: cond };
};

const mapLiderazgo = (val: unknown): string | null => {
  if (!val) return null;
  const v = String(val).trim();
  const lc = v.toLowerCase();
  if (lc === 'miembro') return 'Miembro';
  if (lc === 'lider') return 'Lider';
  if (lc.includes('lider apoyo') || lc.includes('lider_apoyo')) return 'Lider_Apoyo';
  if (lc === 'gap') return 'Gap';
  return null;
};

const mapRedId = (redText: unknown): number | null => {
  if (!redText) return null;
  const r = String(redText).trim().toLowerCase();
  const normalized = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized === 'ajh') return 1;
  if (normalized === 'jah') return 2;
  if (normalized === 'ruiz') return 3;
  return null;
};

const parseTiempoMeses = (val: unknown): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val * 12;
  const s = String(val).trim().toLowerCase();
  if (s === 'no' || s === 'no aplica' || s === '' || s === 'no tengo') return null;
  const m = s.match(/(\d+)/);
  if (m) return parseInt(m[1], 10) * 12;
  return null;
};

const parseDateFromText = (text: unknown, keywords: string[]): { date: string | null; precision: string | null } => {
  if (!text) return { date: null, precision: null };
  const s = String(text);
  const dateMatch = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (dateMatch) {
    return {
      date: `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`,
      precision: 'Dia',
    };
  }
  const kwPattern = keywords.join('|');
  const re = new RegExp(`(${kwPattern})\\s*[:.\\-]?\\s*(\\d{4})`, 'i');
  const m = s.match(re);
  if (m) return { date: `${m[2]}-01-01`, precision: 'Ano' };
  const yearM = s.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearM) return { date: `${yearM[1]}-01-01`, precision: 'Ano' };
  return { date: null, precision: null };
};

const isYes = (val: unknown): boolean => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return s === 'si' || s === 'sí';
};

const mapDenominacion = (text: unknown): string | null => {
  if (!text) return null;
  const s = String(text).toLowerCase();
  if (s.includes('católico') || s.includes('catolica')) return 'Católico';
  if (s.includes('evangelico') || s.includes('evangélico')) return 'Evangelico';
  if (s.includes('pentecostal')) return 'Pentecostal';
  if (s.includes('testigo') || s.includes('jehová') || s.includes('jehova')) return 'Testigo de Jehová';
  return 'Otro';
};

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

(async () => {
  console.log('📋 Importación Turno 11 AM');
  console.log(`📁 Leyendo: ${EXCEL_PATH}`);
  console.log('');

  try {
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: USER, contrasena: PASSWORD }),
    });
    if (!loginRes.ok) {
      const errBody = await loginRes.json().catch(() => ({}));
      throw new Error((errBody as any).mensaje || `Error HTTP ${loginRes.status}`);
    }
    console.log('✅ Sesión iniciada\n');
  } catch (err: any) {
    console.error('❌ Error de autenticación:', err.message);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets['Respuestas de formulario 1'];
  if (!sheet) {
    console.error('❌ No se encontró la hoja "Respuestas de formulario 1"');
    process.exit(1);
  }

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  const dataRows = rows.slice(1);

  let personas = dataRows.filter(row => {
    const turno = String(row[COL.TURNO] || '').trim();
    return turno === 'Turno 11 AM';
  });

  const seenCedulas = new Set<string>();
  personas = personas.filter(row => {
    const cedula = formatCedula(row[COL.CEDULA]);
    if (!cedula) return true;
    if (seenCedulas.has(cedula)) return false;
    seenCedulas.add(cedula);
    return true;
  });

  console.log(`👥 Personas Turno 11 AM: ${personas.length}\n`);

  if (personas.length === 0) {
    console.log('No hay personas. Saliendo.');
    process.exit(0);
  }

  const { rows: reqRows } = await pool.query(
    `SELECT ID_Requisito AS id, Nombre FROM Requisitos WHERE Activo = TRUE`
  );
  const reqMap = new Map<string, number>();
  for (const r of reqRows as Array<{ id: number; nombre: string }>) {
    reqMap.set(r.nombre.toLowerCase().trim(), r.id);
  }
  console.log(`📋 Requisitos en BD: ${reqMap.size}`);
  for (const [nombre, id] of reqMap) {
    console.log(`   [${id}] ${nombre}`);
  }
  console.log('');

  const { rows: rolRows } = await pool.query(
    `SELECT ID_Rol AS id FROM Roles WHERE Nombre_Rol = 'Colaborador' LIMIT 1`
  );
  const idRolColaborador = (rolRows[0] as any)?.id;
  if (!idRolColaborador) {
    console.error('❌ No se encontró el rol Colaborador');
    process.exit(1);
  }
  const { rows: adminRows } = await pool.query(
    `SELECT ps.ID_Persona AS id FROM Personal_Sistema ps
     JOIN Personas p ON p.ID_Persona = ps.ID_Persona
     WHERE ps.Usuario = $1 LIMIT 1`,
    [USER]
  );
  const idAdminPersona = (adminRows[0] as any)?.id;
  if (!idAdminPersona) {
    console.error('❌ No se encontró el usuario admin en Personal_Sistema');
    process.exit(1);
  }
  console.log(`📋 Admin ID: ${idAdminPersona}`);

  console.log(`📋 Rol: Colaborador (ID: ${idRolColaborador})`);
  console.log(`📋 Turno: Domingo_11am (ID: 3)\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < personas.length; i++) {
    const row = personas[i];
    const nombreCompleto = String(row[COL.NOMBRE] || '').trim();
    console.log(`${i + 1}/${personas.length} ${nombreCompleto}`);

    try {
      const { nombres, apellidos } = splitNombre(nombreCompleto);
      const cedula = formatCedula(row[COL.CEDULA]);
      const sexo = row[COL.SEXO] ? String(row[COL.SEXO]).trim() : null;
      const fechaNac = serialToDate(row[COL.FECHA_NAC]);

      const telClaro = cleanText(row[COL.TEL_CLARO]) || cleanText(row[COL.TEL_TIGO]) || null;
      const telCasa = cleanText(row[COL.TEL_CASA]) || null;
      const telTrabajo = cleanText(row[COL.TEL_TRABAJO]) || null;
      const telefonoPrincipal = telClaro || telCasa || telTrabajo;

      const dirCiudad = cleanText(row[COL.DEPTO]);
      const dirMunicipio = cleanText(row[COL.MUNICIPIO]);
      let dirDistrito = cleanText(row[COL.DISTRITO]);
      if (dirDistrito) {
        dirDistrito = dirDistrito.replace(/\|/g, 'I').replace(/[iI]+$/, match => 'I'.repeat(match.length));
        dirDistrito = dirDistrito.charAt(0).toUpperCase() + dirDistrito.slice(1).toLowerCase();
        if (!dirDistrito.toLowerCase().startsWith('distrito')) {
          dirDistrito = `Distrito ${dirDistrito}`;
        }
      }
      const dirBarrio = cleanText(row[COL.BARRIO]);
      const dirExacta = cleanText(row[COL.DIR_EXACTA]);

      const ec = mapEstadoCivil(row[COL.ESTADO_CIVIL], row[COL.CONDICION_CIVIL]);
      const nombreConyuge = cleanText(row[COL.CONYUGE_NOMBRE]);
      const conyugeOcupacion = cleanText(row[COL.CONYUGE_OCUPACION]);
      const conyugeCentroLaboral = cleanText(row[COL.CONYUGE_LABORAL]);

      const numHijosVal = row[COL.NUM_HIJOS];
      let tieneHijos = false;
      let numeroHijos = 0;
      if (numHijosVal !== null && numHijosVal !== undefined) {
        const s = String(numHijosVal).trim().toLowerCase();
        if (!['no', 'no tengo', '', '0', '-'].includes(s)) {
          const n = parseInt(s, 10);
          if (!isNaN(n) && n > 0) { tieneHijos = true; numeroHijos = n; }
        }
      }

      const ocupacion = cleanText(row[COL.OCUPACION]);
      const centroLaboral = cleanText(row[COL.CENTRO_LABORAL]);
      const nivelAcademico = mapNivelAcademico(row[COL.NIVEL_ACAD]);
      const estadoLiderazgo = mapLiderazgo(row[COL.LIDERAZGO]);
      const idRed = mapRedId(row[COL.RED]);

      const liderNombreCompleto = cleanText(row[COL.LIDER_NOMBRE]);
      let liderNombres = null;
      let liderApellidos = null;
      let liderTel = cleanText(row[COL.LIDER_TEL]);
      if (liderNombreCompleto) {
        const ln = splitNombre(liderNombreCompleto);
        liderNombres = ln.nombres;
        liderApellidos = ln.apellidos;
      }

      const reqBautismo = mapRequisitoTexto(row[COL.REQ_BAUTISMO]);
      const reqRetiro = mapRequisitoTexto(row[COL.REQ_RETIRO]);
      const reqNuevosCreyentes = mapRequisitoTexto(row[COL.REQ_NUEVOS_CREYENTES]);
      const reqObreros = mapRequisitoTexto(row[COL.REQ_OBREROS]);
      const reqCirculo = mapRequisitoTexto(row[COL.REQ_CIRCULO]);
      const bautizadoAgua = reqBautismo;

      const detalles = row[COL.DETALLE_FECHAS];
      const fechaBautismo = parseDateFromText(detalles, ['bautismo', 'bautizo', 'bautizado', 'bauti']);
      const circuloAmistadDesde = parseDateFromText(detalles, ['circulo', 'circulo de amistad', 'círculo']);

      const asistioOtraIglesia = isYes(row[COL.OTRA_IGLESIA]);
      const nombreIglesiaAnterior = asistioOtraIglesia ? cleanText(row[COL.IGLESIA_ANTERIOR]) : null;
      const denominacionOtraIglesia = asistioOtraIglesia ? mapDenominacion(row[COL.IGLESIA_ANTERIOR]) : null;

      const tiempoIglesiaMeses = parseTiempoMeses(row[COL.TIEMPO_IGLESIA]);

      const clasesBiblicasTexto = cleanText(row[COL.CLASES_BIBLICAS]);
      let clasesBiblicasNinos = false;
      let clasesBiblicasDetalle = null;
      if (clasesBiblicasTexto && !['no', 'no tengo experiencia', 'no aplica'].includes(clasesBiblicasTexto.toLowerCase())) {
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

      const ministerioAdicional = cleanText(row[COL.MINISTERIO_ADICIONAL]);
      let ministerioFinal = null;
      if (ministerioAdicional) {
        const m = ministerioAdicional.toLowerCase();
        if (!['no', 'noo', 'noo solo infantil', 'no he estado en ningún otro ministerio', 'no estuve solo infantil', 'ninguno', 'no aplica'].includes(m)) {
          ministerioFinal = ministerioAdicional;
        }
      }

      const cliente = await pool.connect();
      try {
        await cliente.query('BEGIN');

        let idPersona: number | null = null;

        if (cedula) {
          const q = await cliente.query(
            'SELECT ID_Persona AS id FROM Personas WHERE Cedula = $1',
            [cedula]
          );
          if (q.rows.length > 0) {
            idPersona = (q.rows[0] as any).id;
          }
        }

        if (!idPersona) {
          const personaRes = await cliente.query(
            `INSERT INTO Personas (Nombres, Apellidos, Telefono, Fecha_Nacimiento, Sexo, Cedula)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING ID_Persona AS id`,
            [nombres, apellidos, telefonoPrincipal, fechaNac, sexo, cedula]
          );
          idPersona = (personaRes.rows[0] as any).id;
          process.stdout.write('  ✅ Persona creada');
        } else {
          process.stdout.write('  ℹ️  Persona existente');
        }
        process.stdout.write(` (ID: ${idPersona})\n`);

        const solExistente = await cliente.query(
          `SELECT ID_Solicitud AS id FROM Solicitudes_Personal
           WHERE ID_Persona = $1 AND Estado = 'Aprobado'
           LIMIT 1`,
          [idPersona]
        );
        if (solExistente.rows.length > 0) {
          console.log(`  ⏭️  Ya tiene solicitud aprobada (ID: ${(solExistente.rows[0] as any).id}), saltando`);
          await cliente.query('ROLLBACK');
          cliente.release();
          skippedCount++;
          continue;
        }

        const solicitudRes = await cliente.query(
          `INSERT INTO Solicitudes_Personal (
            ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, Estado,
            Notas_Staff,
            Sexo_Candidato, Cedula_Candidato, Ocupacion_Candidato,
            Centro_Laboral_Candidato, Nivel_Academico_Candidato,
            Tel_Casa, Tel_Oficina, Tel_Claro,
            Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
            Estado_Civil, Condicion_Civil, Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
            Tiene_Hijos, Numero_Hijos,
            ID_Red,
            Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
            Circulo_Amistad_Desde, Circulo_Amistad_Precision,
            Tiempo_Iglesia_Meses, Ministerio_Adicional,
            Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
            Capacitacion_Ensenanza, Capacitacion_Detalle,
            Estado_Liderazgo,
            Lider_Nombres, Lider_Apellidos, Lider_Telefono,
            Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
          ) VALUES (
            $1, $2, $3, 'Pendiente',
            $4,
            $5, $6, $7,
            $8, $9,
            $10, $11, $12,
            $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22,
            $23, $24,
            $25,
            $26, $27, $28,
            $29, $30,
            $31, $32,
            $33, $34,
            $35, $36,
            $37,
            $38, $39, $40,
            $41, $42, $43
          ) RETURNING ID_Solicitud AS id`,
          [
            idPersona, idRolColaborador, idAdminPersona,
            'Importación desde actualizada.xlsx - Turno 11 AM',
            sexo, cedula, ocupacion,
            centroLaboral, nivelAcademico,
            telCasa, telTrabajo, telClaro,
            dirCiudad, dirMunicipio, dirDistrito, dirBarrio, dirExacta,
            ec.estadoCivil, ec.condicionCivil, nombreConyuge, conyugeOcupacion, conyugeCentroLaboral,
            tieneHijos, tieneHijos ? numeroHijos : null,
            idRed,
            bautizadoAgua, fechaBautismo.date, fechaBautismo.precision,
            circuloAmistadDesde.date, circuloAmistadDesde.precision,
            tiempoIglesiaMeses, ministerioFinal,
            clasesBiblicasNinos, clasesBiblicasDetalle,
            capacitacionEnsenanza, capacitacionDetalle,
            estadoLiderazgo,
            liderNombres, liderApellidos, liderTel,
            asistioOtraIglesia, nombreIglesiaAnterior, denominacionOtraIglesia,
          ]
        );
        const idSolicitud = (solicitudRes.rows[0] as any).id;
        process.stdout.write(`  📋 Solicitud creada (ID: ${idSolicitud})\n`);

        const requisitosData: Array<{ idRequisito: number; cumplido: boolean }> = [];

        const reqBautismoId = reqMap.get('bautizado en agua');
        if (reqBautismoId) requisitosData.push({ idRequisito: reqBautismoId, cumplido: reqBautismo });

        const reqNuevosCreyentesId = reqMap.get('escuela de nuevos creyentes');
        if (reqNuevosCreyentesId) requisitosData.push({ idRequisito: reqNuevosCreyentesId, cumplido: reqNuevosCreyentes });

        const reqObrerosId = reqMap.get('escuela de obreros');
        if (reqObrerosId) requisitosData.push({ idRequisito: reqObrerosId, cumplido: reqObreros });

        const reqCirculoId = reqMap.get('pertenecer a círculo de amistad');
        if (reqCirculoId) requisitosData.push({ idRequisito: reqCirculoId, cumplido: reqCirculo });

        let reqRetiroId = reqMap.get('retiro de sanidad y liberacion');
        if (!reqRetiroId) {
          for (const [nombre, id] of reqMap) {
            if (nombre.includes('retiro')) { reqRetiroId = id; break; }
          }
        }
        if (reqRetiroId) requisitosData.push({ idRequisito: reqRetiroId, cumplido: reqRetiro });

        for (const [nombre, id] of reqMap) {
          if (!requisitosData.some(r => r.idRequisito === id)) {
            requisitosData.push({ idRequisito: id, cumplido: false });
          }
        }

        for (const r of requisitosData) {
          await cliente.query(
            `INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
             VALUES ($1, $2, $3, $4)`,
            [idSolicitud, r.idRequisito, r.cumplido, r.cumplido ? new Date() : null]
          );
        }

        const tempUsuario = `temp_${idPersona}`;
        const tempPassword = crypto.randomUUID();
        const hash = await bcrypt.hash(tempPassword, 12);

        await cliente.query(
          `INSERT INTO Personal_Sistema
             (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7)`,
          [idPersona, idRolColaborador, tempUsuario, hash, idAdminPersona, idAdminPersona, idSolicitud]
        );
        process.stdout.write(`  🔐 Personal_Sistema creado (usuario: ${tempUsuario})\n`);

        await cliente.query(
          `INSERT INTO Personal_Turnos (ID_Personal, ID_Turno)
           VALUES ($1, 3)`,
          [idPersona]
        );
        process.stdout.write(`  ⏰ Turno 11 AM asignado\n`);

        await cliente.query(`SET LOCAL app.id_autorizador = '${idAdminPersona}'`);
        await cliente.query(
          `UPDATE Solicitudes_Personal
           SET Estado = 'Aprobado',
               ID_Resuelto_Por = $1,
               Fecha_Resolucion = NOW(),
               Notas_Coordinador = 'Aprobada automáticamente - Importación Turno 11 AM'
           WHERE ID_Solicitud = $2`,
          [idAdminPersona, idSolicitud]
        );

        await cliente.query('COMMIT');
        console.log(`  ✅ Completado! (Solicitud: ${idSolicitud}, Pass: ${tempPassword})`);
        successCount++;

      } catch (errTrans) {
        await cliente.query('ROLLBACK');
        throw errTrans;
      } finally {
        cliente.release();
      }

      await sleep(500);

    } catch (err: any) {
      console.error(`  ❌ Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ ${successCount} solicitudes aprobadas`);
  if (skippedCount > 0) console.log(`⏭️  ${skippedCount} saltadas (ya existían)`);
  if (errorCount > 0) console.log(`❌ ${errorCount} errores`);
  console.log('═'.repeat(50));

  await pool.end();
})();
