/**
 * ⚙️ Página de Selección de Tipo de Avería
 *
 * Pantalla que permite seleccionar el tipo específico de avería a analizar:
 * WART, ERROR DE MONTAJE o ERROR DE AVERÍA.
 */

import { useNavigate } from 'react-router-dom';
import { AveriaButton } from './AveriaButton';
import { BackIcon } from './BackIcon';
import { TIPOS_AVERIA } from './averiaConfig';

export const Averia = () => {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate('/');
  };

  const handleTipoAveriaClick = (tipoId: string) => {
    const tipo = TIPOS_AVERIA.find((t) => t.id === tipoId);
    if (tipo?.habilitado && tipo.ruta) {
      navigate(tipo.ruta);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
      <div className="relative max-w-5xl w-full">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
          className="absolute top-0 left-0 w-11 h-11 flex items-center justify-center rounded-full 
                     bg-primary text-white shadow-lg hover:bg-primary-light 
                     hover:ring-2 hover:ring-white/50
                     transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/40"
        >
          <BackIcon />
        </button>

        <div className="text-center mb-12 mt-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Seleccione el subtipo de Avería
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto font-light">
            Elija una opción para continuar con el proceso de valoración
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {TIPOS_AVERIA.map((tipo) => (
            <AveriaButton
              key={tipo.id}
              nombre={tipo.nombre}
              onClick={() => handleTipoAveriaClick(tipo.id)}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleVolver}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 
                     text-white font-semibold 
                     py-2 px-4 rounded-lg border border-white/30
                     hover:border-white/50 hover:scale-105
                     transition-all duration-300 ease-out
                     focus:outline-none focus:ring-4 focus:ring-white/30
                     flex items-center justify-center gap-2 text-sm"
          >
            <BackIcon className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
      </div>
    </div>
  );
};
