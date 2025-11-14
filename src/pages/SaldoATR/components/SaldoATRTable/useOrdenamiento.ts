/**
 * Hook para ordenamiento de tabla
 */
import { useState, useMemo, useCallback } from 'react';

interface UseOrdenamientoProps<T> {
  items: T[];
}

/**
 * Hook que maneja estado y lógica de ordenamiento de columnas
 */
export const useOrdenamiento = <T extends Record<string, unknown>>({
  items,
}: UseOrdenamientoProps<T>) => {
  const [columnaOrden, setColumnaOrden] = useState<string | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const handleOrdenarColumna = useCallback(
    (columna: string) => {
      if (columnaOrden === columna) {
        setDireccionOrden((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setColumnaOrden(columna);
        setDireccionOrden('asc');
      }
    },
    [columnaOrden]
  );

  const itemsOrdenados = useMemo(() => {
    if (!columnaOrden) return items;

    const ordenados = [...items].sort((a, b) => {
      const aRow = a as Record<string, string>;
      const bRow = b as Record<string, string>;

      const aValue = aRow[columnaOrden] ?? '';
      const bValue = bRow[columnaOrden] ?? '';

      // Intentar conversión numérica
      const aNum = Number(aValue);
      const bNum = Number(bValue);

      let comparacion = 0;
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        comparacion = aNum - bNum;
      } else {
        comparacion = aValue.localeCompare(bValue, 'es', { numeric: true });
      }

      return direccionOrden === 'asc' ? comparacion : -comparacion;
    });

    return ordenados;
  }, [items, columnaOrden, direccionOrden]);

  return {
    columnaOrden,
    direccionOrden,
    itemsOrdenados,
    handleOrdenarColumna,
  };
};
