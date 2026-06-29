// src/services/authServicio.ts — Lógica de negocio de autenticación (CLAUDE.md §3.2)
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encontrarUsuarioPorNombre } from '../repositories/authRepositorio.js';

export interface RespuestaLogin {
  token:   string;
  usuario: {
    idPersona:       number;
    nombreCompleto:  string;
    usuario:         string;
    rol:             string;
    nivelJerarquico: number;
    soloLectura:     boolean;
  };
}

/**
 * Valida las credenciales y retorna un JWT firmado.
 * - Bcrypt para comparar hash (CLAUDE.md §4.3)
 * - JWT con expiración configurable
 * - Nunca expone el hash ni información interna en la respuesta
 */
export const iniciarSesion = async (
  usuarioInput: string,
  contrasena: string
): Promise<RespuestaLogin> => {
  // 1. Buscar usuario (no revelar si existe o no en el mensaje de error)
  const usuario = await encontrarUsuarioPorNombre(usuarioInput);

  if (!usuario || !usuario.activo) {
    throw new Error('Credenciales incorrectas. Verifique su usuario y contraseña.');
  }

  // 2. Comparar contraseña con hash bcrypt (CLAUDE.md §4.3)
  const contrasenaValida = await bcrypt.compare(contrasena, usuario.passwordHash);
  if (!contrasenaValida) {
    throw new Error('Credenciales incorrectas. Verifique su usuario y contraseña.');
  }

  // 3. Generar JWT con payload mínimo necesario
  const secreto    = process.env.JWT_SECRET as string;
  const expiraEn   = process.env.JWT_EXPIRA_EN ?? '8h';
  const payload    = {
    idPersona:       usuario.idPersona,
    usuario:         usuario.usuario,
    rol:             usuario.nombreRol,
    nivelJerarquico: usuario.nivelJerarquico,
    soloLectura:     usuario.soloLectura,
  };

  const token = jwt.sign(payload, secreto, { expiresIn: expiraEn as jwt.SignOptions['expiresIn'] });

  return {
    token,
    usuario: {
      idPersona:       usuario.idPersona,
      nombreCompleto:  usuario.nombreCompleto,
      usuario:         usuario.usuario,
      rol:             usuario.nombreRol,
      nivelJerarquico: usuario.nivelJerarquico,
      soloLectura:     usuario.soloLectura,
    },
  };
};
