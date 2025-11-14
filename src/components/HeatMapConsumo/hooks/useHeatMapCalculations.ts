/**
 * Hook personalizado para cálculos del HeatMap
 * Encapsula lógica de métricas, años, mapas y baseline
 */
import { useMemo } from 'react';
import type { ConsumoMensual } from '../../../types';
import type { HeatmapMetricConfig, HeatmapMetricId } from '../types';
import { METRICAS } from '../utils';

interface UseHeatMapCalculationsProps {
  datos: ConsumoMensual[];
  metricaSeleccionada: HeatmapMetricId;
}

/**
 * Hook que calcula métricas, años, mapas y baseline del HeatMap
 */
export const useHeatMapCalculations = ({
  datos,
  metricaSeleccionada,
}: UseHeatMapCalculationsProps) => {
  // Métrica actual seleccionada
  const metricaActual = useMemo<HeatmapMetricConfig>(
    () => METRICAS.find((metrica) => metrica.id === metricaSeleccionada) ?? METRICAS[0],
    [metricaSeleccionada]
  );

  // Años únicos ordenados
  const años = useMemo(() => {
    return Array.from(new Set(datos.map((d) => d.año))).sort((a, b) => a - b);
  }, [datos]);

  // Mapa periodo → ConsumoMensual para acceso rápido
  const mapaPorPeriodo = useMemo(() => {
    const m = new Map<string, ConsumoMensual>();
    datos.forEach((d) => m.set(`${d.año}-${d.mes}`, d));
    return m;
  }, [datos]);

  // Resumen estadístico de la métrica actual
  const resumenMetricas = useMemo(() => {
    const valores = datos
      .map((dato) => metricaActual.extractor(dato))
      .filter((valor) => Number.isFinite(valor));

    if (valores.length === 0) {
      return { minimo: 0, maximo: 0, promedio: 0 };
    }

    return {
      minimo: Math.min(...valores),
      maximo: Math.max(...valores),
      promedio: valores.reduce((acc, val) => acc + val, 0) / valores.length,
    };
  }, [datos, metricaActual]);

  // Baseline para detección de anomalías (primeros 30% datos)
  const baselineAnomalias = useMemo(() => {
    if (metricaSeleccionada !== 'deteccionAnomalias' || datos.length < 3) {
      return 0;
    }

    const periodoBaseline = Math.min(12, Math.floor(datos.length * 0.3));
    const datosBaseline = datos.slice(0, periodoBaseline);
    const promediosBaseline = datosBaseline
      .map((d) => d.consumoPromedioDiario)
      .filter((p) => p > 0);

    if (promediosBaseline.length === 0) return 0;

    return promediosBaseline.reduce((sum, val) => sum + val, 0) / promediosBaseline.length;
  }, [datos, metricaSeleccionada]);

  return {
    metricaActual,
    años,
    mapaPorPeriodo,
    resumenMetricas,
    baselineAnomalias,
  };
};
