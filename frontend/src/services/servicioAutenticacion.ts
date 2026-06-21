// servicioAutenticacion.ts — Llamada al API de login (CLAUDE.md §3.1: async/await con try/catch)
import type { RespuestaLogin } from './tipos';

const URL_BASE_API = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/auth`;


/**
 * Envía las credenciales al backend para autenticación.
 * Maneja los códigos HTTP: 200, 401, 429 y errores de servidor.
 */
export const iniciarSesion = async (
  usuario: string,
  contrasena: string
): Promise<RespuestaLogin> => {
  try {
    const respuesta = await fetch(`${URL_BASE_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena }),
    });

    // 200 OK — Login exitoso
    if (respuesta.ok) {
      const json = await respuesta.json();
      return {
        exito: true,
        token: json.datos.token,
        usuario: json.datos.usuario,
      };
    }

    // 401 Unauthorized — Credenciales incorrectas
    if (respuesta.status === 401) {
      const datos = await respuesta.json();
      return {
        exito: false,
        error: {
          tipo: 'credencialesInvalidas',
          mensaje: 'Usuario o contraseña incorrectos.',
          intentosRestantes: datos.intentosRestantes ?? undefined,
        },
      };
    }

    // 429 Too Many Requests — Rate limit alcanzado (CLAUDE.md §4.2)
    if (respuesta.status === 429) {
      const retryAfter = respuesta.headers.get('Retry-After');
      const segundosBloqueo = retryAfter ? parseInt(retryAfter, 10) : 900; // 15 min por defecto
      return {
        exito: false,
        error: {
          tipo: 'rateLimitAlcanzado',
          mensaje: 'Cuenta bloqueada temporalmente por exceder el límite de intentos.',
          tiempoBloqueoSegundos: segundosBloqueo,
        },
      };
    }

    // Cualquier otro error del servidor
    return {
      exito: false,
      error: {
        tipo: 'errorServidor',
        mensaje: 'Error de conexión. Intenta más tarde.',
      },
    };
  } catch (errorRed) {
    // Error de red (servidor caído, sin conexión, etc.)
    return {
      exito: false,
      error: {
        tipo: 'errorServidor',
        mensaje: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      },
    };
  }
};
