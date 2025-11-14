/**
 * Hook para manejo de ordenamiento de tabla de anomalías
 */
import { useState, useCallback, useMemo } from 'react';
import type { ConsumoMensual } from '../../../../types';

/**
 * Hook que encapsula lógica de ordenamiento de columnas
 */
export const useAnomaliasSorting = (datos: ConsumoMensual[]) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Manejador de clic en columna para ordenar
  const handleColumnSort = useCallback(
    (column: string) => {
      setSortDirection((prev) => {
        if (sortColumn === column) {
          return prev === 'asc' ? 'desc' : 'asc';
        }
        return 'asc';
      });
      setSortColumn(column);
    },
    [sortColumn]
  );

  // Función de comparación por periodo
  const compararPorPeriodo = (a: ConsumoMensual, b: ConsumoMensual) => {
    if (a.año === b.año) {
      return a.mes - b.mes;
    }
    return a.año - b.año;
  };

  // Datos ordenados según columna y dirección
  const sortedDatos = useMemo(() => {
    if (!sortColumn) return datos;

    return [...datos].sort((a, b) => {
      if (sortColumn === 'periodo') {
        return sortDirection === 'asc' ? compararPorPeriodo(a, b) : compararPorPeriodo(b, a);
      }

      // Mapeo de columnas a propiedades
      const aValue = a[sortColumn as keyof ConsumoMensual];
      const bValue = b[sortColumn as keyof ConsumoMensual];

      const isNumeric = typeof aValue === 'number' && typeof bValue === 'number';

      if (isNumeric) {
        const numA = aValue as number;
        const numB = bValue as number;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      // Ordenamiento string
      const strA = String(aValue ?? '');
      const strB = String(bValue ?? '');
      const comparison = strA.localeCompare(strB, 'es');

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [datos, sortColumn, sortDirection]);

  // Resetear ordenamiento
  const resetSort = useCallback(() => {
    setSortColumn(null);
    setSortDirection('asc');
  }, []);

  return {
    sortColumn,
    sortDirection,
    sortedDatos,
    handleColumnSort,
    resetSort,
  };
};
