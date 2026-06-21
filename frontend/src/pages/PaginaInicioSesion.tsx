// PaginaInicioSesion.tsx — Componente página principal del login
import React from 'react';
import IconoMarca from '../components/IconoMarca';
import FormularioLogin from '../components/FormularioLogin';

/**
 * Página completa de inicio de sesión.
 * Renderiza el layout glassmórfico con la tarjeta centrada.
 * No contiene lógica de negocio, solo composición visual.
 *
 * Diseño base: extraído del proyecto Stitch "Power Biblia Login Screen"
 * y adaptado a React + Tailwind + TypeScript.
 */
const PaginaInicioSesion: React.FC = () => {
  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 relative z-10 bg-background">
      {/* Fondo con overlay glassmórfico */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-secondary/10 via-background to-primary-container/20">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Tarjeta de login — glassmorphism */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-xl border border-white/50 shadow-[0_8px_32px_rgba(1,85,199,0.1)] px-6 py-7 md:px-8 md:py-8 flex flex-col gap-5 relative overflow-hidden">
        {/* Brillo sutil en el borde superior */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        {/* Encabezado: icono + título */}
        <div className="text-center flex flex-col gap-1">
          <IconoMarca />
          <h1 className="font-headline-lg text-headline-md text-secondary">
            Bienvenidos al Ministerio Infantil HLV
          </h1>
        </div>

        {/* Formulario con toda la lógica */}
        <FormularioLogin />

        {/* Enlace de registro */}
        <div className="text-center font-body-md text-body-md text-on-surface-variant">
          ¿No tienes una cuenta?{' '}
          <a
            href="#"
            className="font-label-md text-label-md text-secondary hover:text-error transition-colors duration-200 underline decoration-secondary/30 hover:decoration-error"
          >
            Regístrate aquí
          </a>
        </div>
      </div>

      {/* Estilos de animaciones personalizadas */}
      <style>{`
        @keyframes sacudir {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes aparecer {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default PaginaInicioSesion;
