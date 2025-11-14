/**
 * 🪝 Hook useProcesarDatos
 *
 * Encapsula la lógica de procesamiento de datos de consumo energético,
 * incluyendo limpieza, agrupación y detección de anomalías.
 */

import { useState, useCallback, useMemo } from 'react';
import type { ConsumoEnergetico, ConsumoPeriodo, Anomalia, EstadisticasConsumo } from '../types';
import {
  agruparPorPeriodo,
  calcularEstadisticas,
  limpiarDatos,
  eliminarDuplicados,
} from '../services/dataService';
import { detectarAnomalias } from '../services/anomaliaService';

interface UseProcesarDatosReturn {
  consumosProcesados: ConsumoEnergetico[];
  consumosPorPeriodo: ConsumoPeriodo[];
  anomalias: Anomalia[];
  estadisticas: EstadisticasConsumo;
  hayDatos: boolean;
  procesarConsumos: (consumos: ConsumoEnergetico[]) => void;
  limpiar: () => void;
}

/**
 * Hook para procesar datos de consumo energético
 */
export const useProcesarDatos = (): UseProcesarDatosReturn => {
  const [consumosProcesados, setConsumosProcesados] = useState<ConsumoEnergetico[]>([]);

  const consumosPorPeriodo = useMemo(() => {
    if (consumosProcesados.length === 0) return [];
    return agruparPorPeriodo(consumosProcesados);
  }, [consumosProcesados]);

  const anomalias = useMemo(() => {
    if (consumosPorPeriodo.length === 0) return [];
    return detectarAnomalias(consumosPorPeriodo);
  }, [consumosPorPeriodo]);

  const estadisticas = useMemo(() => {
    if (consumosProcesados.length === 0) {
      return {
        promedio: 0,
        mediana: 0,
        desviacionEstandar: 0,
        minimo: 0,
        maximo: 0,
        totalRegistros: 0,
      };
    }
    return calcularEstadisticas(consumosProcesados);
  }, [consumosProcesados]);

  const procesarConsumos = useCallback((consumos: ConsumoEnergetico[]) => {
    let consumosLimpios = limpiarDatos(consumos);
    consumosLimpios = eliminarDuplicados(consumosLimpios);
    consumosLimpios.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    setConsumosProcesados(consumosLimpios);
  }, []);

  const limpiar = useCallback(() => {
    setConsumosProcesados([]);
  }, []);

  return {
    consumosProcesados,
    consumosPorPeriodo,
    anomalias,
    estadisticas,
    hayDatos: consumosProcesados.length > 0,
    procesarConsumos,
    limpiar,
  };
};
