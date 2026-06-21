// FormularioLogin.tsx — Lógica central del login (CLAUDE.md §3.1, §4.2, §4.5)
import React, { useState, useEffect, useCallback } from 'react';
import CampoTexto from './CampoTexto';
import BotonPrimario from './BotonPrimario';
import IndicadorContrasena from './IndicadorContrasena';
import { toast } from 'react-hot-toast';
import { esquemaLogin, evaluarContrasena, contrasenaEsValida } from '../services/esquemaLogin';
import { iniciarSesion } from '../services/servicioAutenticacion';
import { useAuth } from '../contexts/ContextoAuth';
import type { ValidacionContrasena } from '../services/tipos';

/**
 * Formulario principal de inicio de sesión.
 * Gestiona todos los estados: validación local con Zod,
 * validación de contraseña en tiempo real, interacción con backend,
 * rate limiting visual y cuenta regresiva de bloqueo.
 */
const FormularioLogin: React.FC = () => {
  // --- Estados del formulario ---
  const [usuario, establecerUsuario] = useState<string>('');
  const [contrasena, establecerContrasena] = useState<string>('');
  const [mostrarContrasena, establecerMostrarContrasena] = useState<boolean>(false);
  
  // Extraer función de inicio de sesión del contexto global
  const { iniciarSesion: iniciarSesionContext } = useAuth();

  // --- Estados de validación de contraseña en tiempo real (CLAUDE.md §4.5) ---
  const [validacionContrasena, establecerValidacionContrasena] =
    useState<ValidacionContrasena>({
      longitudMinima: false,
      tieneMayuscula: false,
      tieneNumero: false,
      tieneEspecial: false,
    });

  // --- Estados de la interacción con el backend ---
  const [cargando, establecerCargando] = useState<boolean>(false);
  const [intentosRestantes, establecerIntentosRestantes] = useState<number>(3);
  const [bloqueado, establecerBloqueado] = useState<boolean>(false);
  const [tiempoBloqueo, establecerTiempoBloqueo] = useState<number>(0);

  // --- Estado de animación shake ---
  const [sacudir, establecerSacudir] = useState<boolean>(false);

  /**
   * Formatea segundos a formato mm:ss para la cuenta regresiva.
   */
  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  /**
   * Evalúa la contraseña en tiempo real cada vez que cambia.
   */
  const alCambiarContrasena = useCallback((valor: string) => {
    establecerContrasena(valor);
    establecerValidacionContrasena(evaluarContrasena(valor));
  }, []);

  /**
   * Limpia error de usuario al escribir.
   */
  const alCambiarUsuario = useCallback((valor: string) => {
    establecerUsuario(valor);
  }, []);

  /**
   * Timer de cuenta regresiva para el bloqueo por rate limit.
   */
  useEffect(() => {
    if (!bloqueado || tiempoBloqueo <= 0) return;

    const intervalo = setInterval(() => {
      establecerTiempoBloqueo((anterior) => {
        if (anterior <= 1) {
          // Desbloquear al llegar a 0
          establecerBloqueado(false);
          establecerIntentosRestantes(3);
          clearInterval(intervalo);
          return 0;
        }
        return anterior - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [bloqueado, tiempoBloqueo]);

  /**
   * Activa la animación de sacudida en la tarjeta durante 600ms.
   */
  const activarSacudida = () => {
    establecerSacudir(true);
    setTimeout(() => establecerSacudir(false), 600);
  };

  /**
   * Maneja el envío del formulario.
   * 1. Valida localmente con Zod
   * 2. Envía al backend
   * 3. Procesa la respuesta (200, 401, 429, 500+)
   */
  const alEnviarFormulario = async () => {
    // Validación local con Zod (CLAUDE.md §4.4)
    const resultadoValidacion = esquemaLogin.safeParse({ usuario, contrasena });

    if (!resultadoValidacion.success) {
      const errores = resultadoValidacion.error.flatten().fieldErrors;
      if (errores.usuario?.[0]) {
        toast.error(errores.usuario[0]);
      }
      if (errores.contrasena?.[0]) {
        toast.error(errores.contrasena[0]);
      }
      activarSacudida();
      return;
    }

    // Verificar que la contraseña cumple todos los requisitos (§4.5)
    if (!contrasenaEsValida(validacionContrasena)) {
      toast.error('La contraseña no cumple todos los requisitos.');
      activarSacudida();
      return;
    }

    // Enviar al backend
    establecerCargando(true);

    try {
      const respuesta = await iniciarSesion(usuario, contrasena);

      if (respuesta.exito && respuesta.token && respuesta.usuario) {
        // Login exitoso — almacenar en contexto global y redirigir
        iniciarSesionContext(respuesta.token, respuesta.usuario);
        window.location.href = '/dashboard';
        return;
      }

      // Manejar errores del backend
      if (respuesta.error) {
        toast.error(respuesta.error.mensaje);

        switch (respuesta.error.tipo) {
          case 'credencialesInvalidas': {
            const nuevosIntentos =
              respuesta.error.intentosRestantes ?? intentosRestantes - 1;
            establecerIntentosRestantes(nuevosIntentos);
            activarSacudida();
            break;
          }

          case 'rateLimitAlcanzado': {
            const segundos = respuesta.error.tiempoBloqueoSegundos ?? 900;
            establecerBloqueado(true);
            establecerTiempoBloqueo(segundos);
            establecerIntentosRestantes(0);
            break;
          }

          case 'errorServidor':
            activarSacudida();
            break;
        }
      }
    } catch {
      toast.error('Ocurrió un error inesperado.');
    } finally {
      establecerCargando(false);
    }
  };

  // El botón se deshabilita si: está bloqueado, cargando, o la contraseña no es válida
  const botonDeshabilitado =
    bloqueado ||
    cargando ||
    usuario.trim().length === 0 ||
    (contrasena.length > 0 && !contrasenaEsValida(validacionContrasena));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alEnviarFormulario();
      }}
      className={`flex flex-col gap-4 ${
        sacudir ? 'animate-[sacudir_0.6s_ease-in-out]' : ''
      }`}
    >
      {/* Campo de usuario */}
      <CampoTexto
        tipo="text"
        etiqueta="Usuario"
        icono="person"
        placeholder="Ej. Juan2304"
        valor={usuario}
        alCambiar={alCambiarUsuario}
        deshabilitado={bloqueado}
      />

      {/* Campo de contraseña */}
      <CampoTexto
        tipo="password"
        etiqueta="Contraseña"
        icono="lock"
        placeholder="••••••••"
        valor={contrasena}
        alCambiar={alCambiarContrasena}
        deshabilitado={bloqueado}
        mostrarContrasena={mostrarContrasena}
        alAlternarVisibilidad={() => establecerMostrarContrasena(!mostrarContrasena)}
        enlaceAuxiliar={{
          texto: '¿Olvidaste tu contraseña?',
          alHacerClic: () => {
            /* Navegación futura */
          },
        }}
      />

      {/* Indicador de requisitos de contraseña en tiempo real (CLAUDE.md §4.5) */}
      <IndicadorContrasena
        validacion={validacionContrasena}
        visible={contrasena.length > 0}
      />

      {/* Botón de envío */}
      <BotonPrimario
        texto={bloqueado ? `Bloqueado (${formatearTiempo(tiempoBloqueo)})` : 'Iniciar Sesión'}
        cargando={cargando}
        deshabilitado={botonDeshabilitado}
        alHacerClic={alEnviarFormulario}
      />
    </form>
  );
};

export default FormularioLogin;
