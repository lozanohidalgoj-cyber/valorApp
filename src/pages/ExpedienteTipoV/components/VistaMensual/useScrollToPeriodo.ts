/**
 * Hook para manejo de scroll a periodo específico en VistaMensual
 */

import { useRef, useCallback } from 'react';

interface UseScrollToPeriodoReturn {
  tableRef: React.RefObject<HTMLTableElement | null>;
  handleScrollToPeriodo: (periodo: string) => void;
}

/**
 * Hook que maneja el scroll y highlight de filas por periodo
 * @returns Ref de tabla y función de scroll
 */
export const useScrollToPeriodo = (): UseScrollToPeriodoReturn => {
  const tableRef = useRef<HTMLTableElement>(null);

  const handleScrollToPeriodo = useCallback((periodo: string) => {
    if (!tableRef.current) return;

    // Buscar la fila con el periodo
    const row = tableRef.current.querySelector(`[data-periodo="${periodo}"]`) as HTMLElement;
    if (!row) return;

    // Hacer scroll del elemento dentro de su contenedor padre más cercano scrolleable
    const tableWrapper = tableRef.current.closest(
      '.expediente-mensual__table-wrapper'
    ) as HTMLElement;

    if (tableWrapper) {
      const rowTop = row.offsetTop;
      const rowHeight = row.offsetHeight;
      const containerHeight = tableWrapper.clientHeight;

      // Calcular posición para centrar la fila
      const scrollTo = rowTop - containerHeight / 2 + rowHeight / 2;
      tableWrapper.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }

    // También hacer scroll del viewport
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight temporal
    row.classList.add('expediente-mensual__row--highlighted');
    setTimeout(() => {
      row.classList.remove('expediente-mensual__row--highlighted');
    }, 3000);
  }, []);

  return { tableRef, handleScrollToPeriodo };
};
