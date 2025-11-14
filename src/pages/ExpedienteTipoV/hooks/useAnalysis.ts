/**
 * Hook personalizado para manejar la lógica de análisis de datos
 */

import { useState, useCallback } from 'react';
import { analizarConsumoCompleto } from '../../../services/analisisConsumoService';
import type { DerivacionData, ResultadoAnalisis } from '../../../types';

type VistaAnalisis = 'anual' | 'mensual' | 'listado' | 'grafico' | 'anomalia';

interface UseAnalysisReturn {
  resultado: ResultadoAnalisis | null;
  mostrandoAnalisis: boolean;
  vistaActual: VistaAnalisis;
  analisisHabilitado: boolean;
  ejecutarAnalisis: (datos: DerivacionData[], vistaInicial?: VistaAnalisis) => boolean;
  cambiarVista: (vista: VistaAnalisis) => void;
  habilitarAnalisis: () => void;
  resetAnalisis: () => void;
  setMostrandoAnalisis: (mostrar: boolean) => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [mostrandoAnalisis, setMostrandoAnalisis] = useState(false);
  const [vistaActual, setVistaActual] = useState<VistaAnalisis>('anual');
  const [analisisHabilitado, setAnalisisHabilitado] = useState(false);

  const ejecutarAnalisis = useCallback(
    (datos: DerivacionData[], vistaInicial: VistaAnalisis = 'anual'): boolean => {
      if (datos.length === 0) return false;

      try {
        const resultadoAnalisis = analizarConsumoCompleto(datos);
        setResultado(resultadoAnalisis);
        setMostrandoAnalisis(true);
        setVistaActual(vistaInicial);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const cambiarVista = useCallback((vista: VistaAnalisis) => {
    setVistaActual(vista);
  }, []);

  const habilitarAnalisis = useCallback(() => {
    setAnalisisHabilitado(true);
  }, []);

  const resetAnalisis = useCallback(() => {
    setResultado(null);
    setMostrandoAnalisis(false);
    setVistaActual('anual');
    setAnalisisHabilitado(false);
  }, []);

  const toggleMostrarAnalisis = useCallback((mostrar: boolean) => {
    setMostrandoAnalisis(mostrar);
  }, []);

  return {
    resultado,
    mostrandoAnalisis,
    vistaActual,
    analisisHabilitado,
    ejecutarAnalisis,
    cambiarVista,
    habilitarAnalisis,
    resetAnalisis,
    setMostrandoAnalisis: toggleMostrarAnalisis,
  };
};
