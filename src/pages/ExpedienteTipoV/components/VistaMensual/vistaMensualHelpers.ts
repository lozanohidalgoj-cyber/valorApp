/**
 * Helpers para ordenamiento de datos en VistaMensual
 */

import type { ConsumoMensual } from '../../../../types';

/**
 * Ordena consumos mensuales por año y mes
 * @param datos - Array de consumos mensuales
 * @returns Array ordenado cronológicamente
 */
export const ordenarConsumosCronologicamente = (datos: ConsumoMensual[]): ConsumoMensual[] => {
  return [...datos].sort((a, b) => {
    if (a.año === b.año) return a.mes - b.mes;
    return a.año - b.año;
  });
};
