/**
 * Hook para calcular baseline y celdas de detección de anomalías
 */
import { useMemo } from 'react';
import type { ConsumoMensual } from '../../types';

export interface CeldaAnomalia {
  periodo: string;
  año: number;
  mes: number;
  consumoTotal: number;
  consumoPromedioDiario: number;
  dias: number;
  esAnomalia: boolean;
  severidad: 'normal' | 'moderado' | 'alto' | 'critico';
  descripcion: string;
}

interface UseDeteccionAnomaliaResult {
  baseline: number;
  celdas: CeldaAnomalia[];
  años: number[];
}

/**
 * Calcula el baseline y clasifica cada periodo según su nivel de anomalía
 * @param datos - Array de consumos mensuales
 * @returns Baseline, celdas clasificadas y años únicos
 */
export const useDeteccionAnomalia = (datos: ConsumoMensual[]): UseDeteccionAnomaliaResult => {
  // Calcular baseline usando promedio diario de los primeros 12 meses (o 30% de los datos)
  const { baseline, celdas } = useMemo(() => {
    if (datos.length < 3) {
      return { baseline: 0, celdas: [] };
    }

    // Calcular baseline del consumo promedio diario
    const periodoBaseline = Math.min(12, Math.floor(datos.length * 0.3));
    const datosBaseline = datos.slice(0, periodoBaseline);
    const promediosBaseline = datosBaseline
      .map((d) => d.consumoPromedioDiario)
      .filter((p) => p > 0);
    const baselinePromedioDiario =
      promediosBaseline.reduce((sum, val) => sum + val, 0) / promediosBaseline.length;

    // Analizar cada celda
    const celdasCalculadas: CeldaAnomalia[] = datos.map((consumo) => {
      const consumoPromedioDiario = consumo.consumoPromedioDiario;
      const porcentajeVsBaseline = (consumoPromedioDiario / baselinePromedioDiario) * 100;

      let severidad: CeldaAnomalia['severidad'] = 'normal';
      let esAnomalia = false;
      let descripcion = 'Consumo normal';

      // Clasificar por rangos de anomalía basados en consumo promedio diario
      if (consumoPromedioDiario === 0) {
        severidad = 'critico';
        esAnomalia = true;
        descripcion = 'Consumo CERO - Posible fraude/avería';
      } else if (porcentajeVsBaseline < 20) {
        severidad = 'critico';
        esAnomalia = true;
        descripcion = `Consumo crítico (${porcentajeVsBaseline.toFixed(0)}% vs normal)`;
      } else if (porcentajeVsBaseline < 40) {
        severidad = 'alto';
        esAnomalia = true;
        descripcion = `Descenso severo (${porcentajeVsBaseline.toFixed(0)}% vs normal)`;
      } else if (porcentajeVsBaseline < 60) {
        severidad = 'moderado';
        esAnomalia = true;
        descripcion = `Descenso moderado (${porcentajeVsBaseline.toFixed(0)}% vs normal)`;
      } else if (porcentajeVsBaseline > 150) {
        severidad = 'moderado';
        esAnomalia = true;
        descripcion = `Consumo elevado (${porcentajeVsBaseline.toFixed(0)}% vs normal)`;
      } else {
        severidad = 'normal';
        esAnomalia = false;
        descripcion = `Consumo normal (${porcentajeVsBaseline.toFixed(0)}% vs histórico)`;
      }

      return {
        periodo: consumo.periodo,
        año: consumo.año,
        mes: consumo.mes,
        consumoTotal: consumo.consumoActivaTotal,
        consumoPromedioDiario,
        dias: consumo.dias,
        esAnomalia,
        severidad,
        descripcion,
      };
    });

    return { baseline: baselinePromedioDiario, celdas: celdasCalculadas };
  }, [datos]);

  // Obtener años únicos y ordenados
  const años = useMemo(() => {
    const añosUnicos = Array.from(new Set(celdas.map((c) => c.año))).sort((a, b) => a - b);
    return añosUnicos;
  }, [celdas]);

  return { baseline, celdas, años };
};
