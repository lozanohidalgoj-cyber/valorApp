/**
 * Hook de ordenamiento para VistaListado
 * Extrae la lógica de ordenamiento de columnas de VistaListado
 */

import { useState, useMemo, useCallback } from 'react';

interface UseListadoOrdenamientoParams<T> {
  items: T[];
}

interface UseListadoOrdenamientoReturn<T> {
  itemsOrdenados: T[];
  columnaOrden: string | null;
  direccionOrden: 'asc' | 'desc';
  handleOrdenarColumna: (columna: string) => void;
}

/**
 * Hook genérico para ordenar items por columna
 * @param items - Array de items a ordenar
 * @returns Items ordenados y funciones de control
 */
export const useListadoOrdenamiento = <T>({
  items,
}: UseListadoOrdenamientoParams<T>): UseListadoOrdenamientoReturn<T> => {
  const [columnaOrden, setColumnaOrden] = useState<string | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const itemsOrdenados = useMemo(() => {
    if (!columnaOrden) return items;

    const sorted = [...items].sort((a, b) => {
      const aRow = a as unknown as Record<string, unknown>;
      const bRow = b as unknown as Record<string, unknown>;

      const aValue = String(aRow[columnaOrden] ?? '');
      const bValue = String(bRow[columnaOrden] ?? '');

      // Intentar conversión numérica
      const aNum = Number(aValue);
      const bNum = Number(bValue);

      let comparison = 0;
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = aValue.localeCompare(bValue, 'es', { numeric: true });
      }

      return direccionOrden === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [items, columnaOrden, direccionOrden]);

  const handleOrdenarColumna = useCallback(
    (columna: string) => {
      if (columnaOrden === columna) {
        setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
      } else {
        setColumnaOrden(columna);
        setDireccionOrden('asc');
      }
    },
    [columnaOrden, direccionOrden]
  );

  return {
    itemsOrdenados,
    columnaOrden,
    direccionOrden,
    handleOrdenarColumna,
  };
};
