/**
 * Hook para manejo de paginación de tabla
 */
import { useState, useMemo } from 'react';

interface UsePaginacionProps<T> {
  items: T[];
  itemsPorPaginaInicial?: number;
}

/**
 * Hook que maneja estado y lógica de paginación
 */
export const usePaginacion = <T>({ items, itemsPorPaginaInicial = 15 }: UsePaginacionProps<T>) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(itemsPorPaginaInicial);

  const totalPaginas = Math.ceil(items.length / itemsPorPagina);

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return items.slice(inicio, fin);
  }, [items, paginaActual, itemsPorPagina]);

  const irAPagina = (pagina: number) => {
    const paginaValida = Math.max(1, Math.min(pagina, totalPaginas));
    setPaginaActual(paginaValida);
  };

  const cambiarItemsPorPagina = (cantidad: number) => {
    setItemsPorPagina(cantidad);
    setPaginaActual(1); // Resetear a primera página
  };

  return {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    itemsPaginados,
    irAPagina,
    cambiarItemsPorPagina,
    setPaginaActual,
    setItemsPorPagina,
  };
};
