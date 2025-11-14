/**
 * ⚙️ Hook del Contexto - useAppContext
 *
 * Hook personalizado para acceder al contexto global de la aplicación.
 * Proporciona validación de que el componente está dentro del proveedor.
 */

import { useContext } from 'react';
import { AppContext, type AppContextType } from './AppContextDefinition';

/**
 * Hook para acceder al contexto global de la aplicación
 * @throws Error si se usa fuera de AppProvider
 * @returns Objeto con el estado y métodos del contexto
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }

  return context;
};
