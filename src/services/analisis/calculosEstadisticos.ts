/**
 * Funciones de cálculos estadísticos para análisis de consumo
 */
import type { ConsumoMensual } from '../../types';

/**
 * Calcula el Z-Score del consumo actual vs histórico reciente (últimos 6 meses)
 * @param consumos - Array de consumos mensuales ordenados cronológicamente
 * @param indiceActual - Índice del mes actual en el array
 * @returns Z-Score (desviaciones estándar del promedio) o null si no hay suficientes datos
 */
export function calcularZScore(consumos: number[], indiceActual: number): number | null {
  if (indiceActual < 2) return null; // Necesitamos al menos 3 datos históricos

  // Tomar hasta 6 meses previos (sin incluir el actual)
  const inicio = Math.max(0, indiceActual - 6);
  const historicos = consumos.slice(inicio, indiceActual);

  if (historicos.length < 2) return null;

  // Calcular media
  const media = historicos.reduce((sum, val) => sum + val, 0) / historicos.length;

  // Calcular desviación estándar
  const varianza =
    historicos.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / historicos.length;
  const desviacion = Math.sqrt(varianza);

  if (desviacion === 0) return 0; // Consumo totalmente estable

  // Calcular Z-Score
  const consumoActual = consumos[indiceActual];
  const zScore = (consumoActual - media) / desviacion;

  return zScore;
}

/**
 * Calcula el índice estacional (consumo actual / promedio histórico del mes * 100)
 * @param consumoActual - Consumo del periodo actual
 * @param promedioHistorico - Promedio histórico del mes
 * @returns Índice estacional (100 = normal) o null si no hay histórico
 */
export function calcularIndiceEstacional(
  consumoActual: number,
  promedioHistorico: number | null
): number | null {
  if (!promedioHistorico || promedioHistorico === 0) return null;
  return (consumoActual / promedioHistorico) * 100;
}

/**
 * Calcula la tendencia en kWh/mes sobre los últimos 3 meses
 * @param consumos - Array de consumos mensuales
 * @param indiceActual - Índice del mes actual
 * @returns Tendencia en kWh/mes o null si no hay suficientes datos
 */
export function calcularTendencia3M(consumos: number[], indiceActual: number): number | null {
  if (indiceActual < 2) return null; // Necesitamos al menos 3 meses

  const consumoActual = consumos[indiceActual];
  const consumoHace3Meses = consumos[indiceActual - 2];

  // Tendencia = (consumoActual - consumoHace3Meses) / 3
  const tendencia = (consumoActual - consumoHace3Meses) / 3;

  return tendencia;
}

/**
 * Calcula días transcurridos desde la última anomalía
 * @param comparativa - Array de consumos mensuales
 * @param indiceActual - Índice del periodo actual
 * @returns Número de días desde última anomalía o null si no hay anomalías previas
 */
export function calcularDiasDesdeAnomalia(
  comparativa: Partial<ConsumoMensual>[],
  indiceActual: number
): number | null {
  // Buscar hacia atrás la última anomalía
  for (let i = indiceActual - 1; i >= 0; i--) {
    if (comparativa[i].esAnomalia) {
      // Calcular días entre periodos (aproximado)
      const diasTranscurridos = (indiceActual - i) * 30; // Aproximación
      return diasTranscurridos;
    }
  }

  return null; // No hay anomalías previas
}

/**
 * Calcula el ratio Consumo/Potencia
 * @param consumoTotal - Consumo total en kWh
 * @param potencia - Potencia contratada en kW
 * @param dias - Número de días del periodo
 * @returns Ratio entre 0 y 1, o null si no hay potencia
 */
export function calcularRatioConsumoPotencia(
  consumoTotal: number,
  potencia: number | null,
  dias: number
): number | null {
  if (!potencia || potencia === 0 || dias === 0) return null;

  // Ratio = consumoTotal / (potencia * dias * 24)
  const consumoMaximoPosible = potencia * dias * 24;
  const ratio = consumoTotal / consumoMaximoPosible;

  return ratio;
}

/**
 * Calcula el coeficiente de variación histórico (desviación estándar / media * 100)
 * @param consumos - Array de todos los consumos históricos
 * @returns Coeficiente de variación en % o null si no hay suficientes datos
 */
export function calcularCoeficienteVariacion(consumos: number[]): number | null {
  if (consumos.length < 3) return null;

  const media = consumos.reduce((sum, val) => sum + val, 0) / consumos.length;
  if (media === 0) return null;

  const varianza =
    consumos.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / consumos.length;
  const desviacion = Math.sqrt(varianza);

  const cv = (desviacion / media) * 100;

  return cv;
}
