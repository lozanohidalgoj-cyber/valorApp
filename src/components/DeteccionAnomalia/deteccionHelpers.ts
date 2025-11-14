/**
 * Helpers y constantes para DeteccionAnomalia
 */

import type { CeldaAnomalia } from './useDeteccionAnomalia';

/**
 * Nombres cortos de meses para headers
 */
export const NOMBRES_MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

/**
 * Organiza las celdas en una matriz año x mes
 * @param celdas - Celdas de anomalías calculadas
 * @param años - Años únicos
 * @returns Matriz de celdas indexada por año y mes
 */
export const organizarDatosPorAñoMes = (
  celdas: CeldaAnomalia[],
  años: number[]
): Record<number, Record<number, CeldaAnomalia | null>> => {
  const matriz: Record<number, Record<number, CeldaAnomalia | null>> = {};

  años.forEach((año) => {
    matriz[año] = {};
    for (let mes = 1; mes <= 12; mes++) {
      matriz[año][mes] = celdas.find((c) => c.año === año && c.mes === mes) || null;
    }
  });

  return matriz;
};

/**
 * Calcula estadísticas de anomalías
 * @param celdas - Celdas calculadas
 * @returns Conteo y porcentaje de anomalías
 */
export const calcularEstadisticasAnomalias = (celdas: CeldaAnomalia[]) => {
  const conteoAnomalias = celdas.filter((c) => c.esAnomalia).length;
  const totalCeldas = celdas.length;
  const porcentajeAnomalias = totalCeldas > 0 ? (conteoAnomalias / totalCeldas) * 100 : 0;

  return {
    conteoAnomalias,
    totalCeldas,
    porcentajeAnomalias,
  };
};
