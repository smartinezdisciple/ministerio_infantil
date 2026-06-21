// src/server.ts — Punto de entrada del servidor (CLAUDE.md §1)
import 'dotenv/config';

// La importación de db.ts activa la verificación de variables críticas.
// verificarConexionDB() prueba la conexión real solo en el servidor, no en tests.
import { verificarConexionDB } from './config/db.js';
import app from './app.js';

verificarConexionDB();

const PUERTO = Number(process.env.PORT ?? process.env.PUERTO ?? 3001);

app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PUERTO}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`📋 Health check: http://localhost:${PUERTO}/api/salud`);
});
