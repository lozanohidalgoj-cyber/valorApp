/**
 * Funciones auxiliares para el clasificador de expedientes
 */
import type { ConsumoMensual } from '../../types';

/**
 * Verifica si un mes es estacional (verano/invierno)
 * Meses de verano (julio, agosto) e invierno (diciembre, enero)
 */
export function esEstacional(mes: number): boolean {
  return mes === 7 || mes === 8 || mes === 12 || mes === 1;
}

/**
 * Cuenta el número de cambios de potencia significativos (≥ 0.5 kW)
 */
export function contarCambiosPotencia(consumos: ConsumoMensual[]): number {
  let cambios = 0;

  for (let i = 1; i < consumos.length; i++) {
    const potenciaActual = consumos[i].potenciaPromedio;
    const potenciaAnterior = consumos[i - 1].potenciaPromedio;

    if (
      potenciaActual !== null &&
      potenciaAnterior !== null &&
      Math.abs(potenciaActual - potenciaAnterior) >= 0.5
    ) {
      cambios++;
    }
  }

  return cambios;
}

/**
 * Calcula la tendencia global de consumo (kWh/mes) usando regresión lineal simple
 */
export function calcularTendenciaGlobal(consumos: ConsumoMensual[]): number {
  if (consumos.length < 3) return 0;

  const n = consumos.length;
  let sumaX = 0;
  let sumaY = 0;
  let sumaXY = 0;
  let sumaX2 = 0;

  consumos.forEach((c, index) => {
    const x = index;
    const y = c.consumoActivaTotal;
    sumaX += x;
    sumaY += y;
    sumaXY += x * y;
    sumaX2 += x * x;
  });

  // Pendiente de la regresión lineal
  const pendiente = (n * sumaXY - sumaX * sumaY) / (n * sumaX2 - sumaX * sumaX);

  return pendiente; // kWh/mes
}

/**
 * Verifica si hubo cambio de potencia cerca del inicio de la anomalía (±2 periodos)
 */
export function verificarCambioPotenciaEnAnomalia(
  consumos: ConsumoMensual[],
  indiceAnomalia: number
): { variacion: number } | null {
  const rango = 2; // Buscar ±2 periodos

  for (
    let i = Math.max(0, indiceAnomalia - rango);
    i <= Math.min(consumos.length - 1, indiceAnomalia + rango);
    i++
  ) {
    if (i === 0) continue; // Saltar primer periodo (no tiene anterior)

    const potenciaActual = consumos[i].potenciaPromedio;
    const potenciaAnterior = consumos[i - 1].potenciaPromedio;

    if (
      potenciaActual !== null &&
      potenciaAnterior !== null &&
      Math.abs(potenciaActual - potenciaAnterior) >= 0.5
    ) {
      return {
        variacion: potenciaActual - potenciaAnterior,
      };
    }
  }

  return null;
}
