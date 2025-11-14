/**
 * 🌐 Definición del Contexto - AppContext
 *
 * Define los tipos y crea la instancia del contexto global.
 * Separado en archivo independiente para cumplir con React Fast Refresh.
 */

import { createContext } from 'react';
import type { EstadoApp, ConsumoEnergetico, Anomalia } from '../types';

export interface AppContextType extends EstadoApp {
  cargarConsumos: (consumos: ConsumoEnergetico[]) => void;
  establecerAnomalias: (anomalias: Anomalia[]) => void;
  seleccionarPeriodo: (periodo: string | null) => void;
  establecerProcesando: (procesando: boolean) => void;
  establecerError: (error: string | null) => void;
  limpiarDatos: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
