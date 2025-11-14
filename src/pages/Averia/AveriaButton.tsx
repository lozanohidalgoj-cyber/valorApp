/**
 * Botón de tipo de avería reutilizable
 */

interface AveriaButtonProps {
  nombre: string;
  onClick: () => void;
}

export const AveriaButton = ({ nombre, onClick }: AveriaButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-full bg-gradient-to-br from-secondary to-secondary-dark 
                 text-white font-semibold text-lg
                 py-16 px-6 rounded-2xl shadow-pink-glow 
                 hover:shadow-pink-glow-lg hover:scale-105
                 transform transition-all duration-300 ease-out
                 focus:outline-none focus:ring-4 focus:ring-white/30
                 overflow-hidden"
    >
      <span className="relative z-10 text-2xl font-semibold">{nombre}</span>
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
      />
    </button>
  );
};
