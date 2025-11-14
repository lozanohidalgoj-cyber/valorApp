/**
 * 🌐 Proveedor del Contexto Global - AppProvider
 *
 * Gestiona el estado global de la aplicación usando React Context.
 * Centraliza el estado de consumos, anomalías y operaciones globales.
 */

import { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AppContext, type AppContextType } from './AppContextDefinition';
import type { EstadoApp, ConsumoEnergetico, Anomalia } from '../types';

export type { AppContextType } from './AppContextDefinition';

const estadoInicial: EstadoApp = {
  consumos: [],
  anomalias: [],
  periodoSeleccionado: null,
  datosCargados: false,
  procesando: false,
  error: null,
};

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto global de la aplicación
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  const [estado, setEstado] = useState<EstadoApp>(estadoInicial);

  const cargarConsumos = useCallback((consumos: ConsumoEnergetico[]) => {
    setEstado((prev) => ({
      ...prev,
      consumos,
      datosCargados: consumos.length > 0,
      error: null,
    }));
  }, []);

  const establecerAnomalias = useCallback((anomalias: Anomalia[]) => {
    setEstado((prev) => ({
      ...prev,
      anomalias,
    }));
  }, []);

  const seleccionarPeriodo = useCallback((periodo: string | null) => {
    setEstado((prev) => ({
      ...prev,
      periodoSeleccionado: periodo,
    }));
  }, []);

  const establecerProcesando = useCallback((procesando: boolean) => {
    setEstado((prev) => ({
      ...prev,
      procesando,
    }));
  }, []);

  const establecerError = useCallback((error: string | null) => {
    setEstado((prev) => ({
      ...prev,
      error,
      procesando: false,
    }));
  }, []);

  const limpiarDatos = useCallback(() => {
    setEstado(estadoInicial);
  }, []);

  const value: AppContextType = useMemo(
    () => ({
      ...estado,
      cargarConsumos,
      establecerAnomalias,
      seleccionarPeriodo,
      establecerProcesando,
      establecerError,
      limpiarDatos,
    }),
    [
      estado,
      cargarConsumos,
      establecerAnomalias,
      seleccionarPeriodo,
      establecerProcesando,
      establecerError,
      limpiarDatos,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
