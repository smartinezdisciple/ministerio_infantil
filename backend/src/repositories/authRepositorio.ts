// src/repositories/authRepositorio.ts — Consultas SQL de autenticación (CLAUDE.md §4.1)
import pool from '../config/db.js';

export interface UsuarioDB {
  idPersona:       number;
  nombreCompleto:  string;
  usuario:         string;
  passwordHash:    string;
  idRol:           number;
  nombreRol:       string;
  nivelJerarquico: number;
  activo:          boolean;
}

/**
 * Busca un usuario del sistema por nombre de usuario.
 * SOLO consultas parametrizadas — inyección SQL tolerancia cero (CLAUDE.md §4.1).
 */
export const encontrarUsuarioPorNombre = async (usuario: string): Promise<UsuarioDB | null> => {
  const resultado = await pool.query<UsuarioDB>(
    `SELECT
       ps.ID_Persona        AS "idPersona",
       p.Nombres || ' ' || p.Apellidos  AS "nombreCompleto",
       ps.Usuario           AS "usuario",
       ps.Password_Hash     AS "passwordHash",
       r.ID_Rol             AS "idRol",
       r.Nombre_Rol         AS "nombreRol",
       r.Nivel_Jerarquico   AS "nivelJerarquico",
       ps.Activo            AS "activo"
     FROM Personal_Sistema ps
     JOIN Personas p  ON p.ID_Persona = ps.ID_Persona
     JOIN Roles    r  ON r.ID_Rol     = ps.ID_Rol
     WHERE ps.Usuario = $1`,
    [usuario]
  );
  return resultado.rows[0] ?? null;
};
