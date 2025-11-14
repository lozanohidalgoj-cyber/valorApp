/**
 * 🏠 Página Principal - Home
 *
 * Pantalla inicial que permite seleccionar entre análisis de Fraude o Avería.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  const handleAveriaClick = () => {
    navigate('/averia');
  };

  const handleFraudeClick = () => {
    // Funcionalidad de Fraude próximamente
  };

  const handleExpedientesClick = () => {
    navigate('/expediente-tipo-v');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-4xl w-full">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-poppins">
          ValorApp
        </h1>

        <p className="text-xl md:text-2xl text-white/80 mb-16 font-light max-w-2xl mx-auto">
          Seleccione el tipo de análisis que desea realizar
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-12">
          <button
            onClick={handleFraudeClick}
            className="group relative w-full sm:w-72 bg-gradient-to-br from-secondary to-secondary-dark 
                     text-white font-semibold text-lg
                     py-6 px-10 rounded-2xl shadow-pink-glow 
                     hover:shadow-pink-glow-lg hover:scale-110
                     transform transition-all duration-300 ease-out
                     focus:outline-none focus:ring-4 focus:ring-white/30
                     overflow-hidden"
          >
            <span className="relative z-10 text-2xl font-bold">Fraude</span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
            />
          </button>

          <button
            onClick={handleAveriaClick}
            className="group relative w-full sm:w-72 bg-gradient-to-br from-secondary to-secondary-dark 
                     text-white font-semibold text-lg
                     py-6 px-10 rounded-2xl shadow-pink-glow 
                     hover:shadow-pink-glow-lg hover:scale-110
                     transform transition-all duration-300 ease-out
                     focus:outline-none focus:ring-4 focus:ring-white/30
                     overflow-hidden"
          >
            <span className="relative z-10 text-2xl font-bold">Avería</span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
            />
          </button>
        </div>
        {/* Botón fijo inferior derecho: Análisis de expedientes */}
        <div className="fixed right-6 bottom-6 z-50">
          <button
            onClick={handleExpedientesClick}
            className="group bg-gradient-to-br from-primary to-primary-dark text-white font-semibold text-base md:text-lg
                       py-3 px-6 md:py-4 md:px-8 rounded-xl shadow-blue-glow
                       hover:shadow-blue-glow hover:scale-[1.02]
                       transform transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-white/30"
            title="Análisis de expedientes"
          >
            <span className="relative z-10 font-bold inline-flex items-center gap-3">
              Análisis de expedientes
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1 group-active:translate-x-2" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
