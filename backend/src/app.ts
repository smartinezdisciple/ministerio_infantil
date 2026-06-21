// src/app.ts — Configuración de Express (separado del punto de entrada para testing)
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import authRutas                from './routes/authRutas.js';
import ninosRutas               from './routes/ninosRutas.js';
import dashboardRutas           from './routes/dashboardRutas.js';
import asistenciaRutas          from './routes/asistenciaRutas.js';
import gruposRutas              from './routes/gruposRutas.js';
import personalRutas            from './routes/personalRutas.js';
import contactosRutas           from './routes/contactosRutas.js';
import fichasRutas              from './routes/fichasRutas.js';
import requisitosRutas          from './routes/requisitosRutas.js';
import rolesRutas               from './routes/rolesRutas.js';
import solicitudesRutas         from './routes/solicitudesRutas.js';
import turnosRutas              from './routes/turnosRutas.js';
import eventosRutas             from './routes/eventosRutas.js';
import redesRutas               from './routes/redesRutas.js';
import reportesRutas            from './routes/reportesRutas.js';
// v5.1 — nuevos módulos
import lideresRutas             from './routes/lideresRutas.js';
import circulosRutas            from './routes/circulosRutas.js';
import telefonosDireccionesRutas from './routes/telefonosDireccionesRutas.js';

const app = express();

// ── Seguridad HTTP (CLAUDE.md §4.4) ──────────────────────────────
app.use(helmet());

// ── CORS con origen explícito (nunca * en producción — CLAUDE.md §4.4) ──
const origenPermitidoRaw = process.env.CORS_ORIGEN;
const origenPermitido = origenPermitidoRaw ? origenPermitidoRaw.replace(/\/$/, '') : undefined;

app.use(cors({
  origin: function (origin, callback) {
    const originNormalizado = origin ? origin.replace(/\/$/, '') : '';
    const esLocalhost = !origin
      || originNormalizado.startsWith('http://localhost:')
      || originNormalizado.startsWith('http://127.0.0.1:');
    const esProduccion = !!origenPermitido && originNormalizado === origenPermitido;

    if (esLocalhost || esProduccion) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origen rechazado por CORS. Esperado: "${origenPermitido}", Recibido: "${originNormalizado}"`);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── Parser de JSON ────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Health check ──────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({ exito: true, mensaje: 'Servidor operativo.' });
});

app.get('/api/salud', (_req, res) => {
  res.json({ exito: true, mensaje: 'API Escuela Dominical operativa.', timestamp: new Date().toISOString() });
});

// ── Rutas del dominio ─────────────────────────────────────────────
app.use('/api/auth',          authRutas);
app.use('/api/ninos',         ninosRutas);
app.use('/api/dashboard',     dashboardRutas);
app.use('/api/asistencia',    asistenciaRutas);
app.use('/api/grupos',        gruposRutas);
app.use('/api/personal',      personalRutas);
app.use('/api/contactos',     contactosRutas);
app.use('/api/fichas',        fichasRutas);
app.use('/api/requisitos',    requisitosRutas);
app.use('/api/roles',         rolesRutas);
app.use('/api/solicitudes',   solicitudesRutas);
app.use('/api/turnos',        turnosRutas);
app.use('/api/eventos',       eventosRutas);
app.use('/api/redes',         redesRutas);
app.use('/api/reportes',      reportesRutas);
// v5.1 — nuevos módulos
app.use('/api/lideres',       lideresRutas);
app.use('/api/circulos',      circulosRutas);
app.use('/api/personas',      telefonosDireccionesRutas);

// ── Ruta no encontrada (404) ──────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ exito: false, mensaje: 'Ruta no encontrada.' });
});

// ── Manejador de errores global ───────────────────────────────────
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error no manejado:', error.message);
  res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
});

export default app;
