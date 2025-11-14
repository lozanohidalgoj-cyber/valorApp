/**
 * Tabla de datos de derivación con paginación avanzada
 * Permite navegar por páginas, cambiar cantidad de items por página
 * y visualizar información de registros actuales
 */

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import type { DerivacionData } from '../../../types';

/**
 * Props del componente DataTable
 */
interface DataTableProps {
  /** Array de datos a mostrar en la tabla */
  data: DerivacionData[];
  /** Array de nombres de columnas */
  columns: string[];
}

/**
 * Genera array de números de página con elipsis para navegación
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @returns Array con números de página y elipsis
 */
const generarNumerosPagina = (currentPage: number, totalPages: number): (number | string)[] => {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  // Páginas iniciales
  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, '...', totalPages);
    return pages;
  }

  // Páginas finales
  if (currentPage >= totalPages - 2) {
    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }

  // Páginas del medio
  pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  return pages;
};

/**
 * Componente de tabla con paginación avanzada
 * Muestra datos tabulares con controles de navegación y selección de items por página
 */
export const DataTable = ({ data, columns }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Calcular paginación
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentData = useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

  const pageNumbers = useMemo(
    () => generarNumerosPagina(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  return (
    <>
      <div className="expediente-table-wrapper">
        <table className="expediente-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={startIndex + index}>
                {columns.map((column) => (
                  <td key={`${startIndex + index}-${column}`}>
                    {String((row as unknown as Record<string, unknown>)[column] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="expediente-pagination-container">
          <div className="expediente-pagination-selector">
            <label htmlFor="items-per-page">Filas:</label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="expediente-pagination-select"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="expediente-pagination">
            <button
              className="expediente-pagination-btn expediente-pagination-btn--icon"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="Primera página"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              className="expediente-pagination-btn expediente-pagination-btn--icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="expediente-pagination-numbers">
              {pageNumbers.map((page, idx) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${currentPage}-${idx}`}
                    className="expediente-pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`expediente-pagination-number ${
                      currentPage === page ? 'active' : ''
                    }`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              className="expediente-pagination-btn expediente-pagination-btn--icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>

            <button
              className="expediente-pagination-btn expediente-pagination-btn--icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              <ChevronsRight size={18} />
            </button>
          </div>

          <div className="expediente-pagination-info">
            {startIndex + 1}-{Math.min(endIndex, data.length)} de {data.length}
          </div>
        </div>
      )}
    </>
  );
};
