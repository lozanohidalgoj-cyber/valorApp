/**
 * Tabla de visualización de datos SaldoATR (46 columnas) con paginación y ordenamiento
 * Permite navegar por páginas, cambiar cantidad de items mostrados y ordenar por columnas
 * Memoizado para evitar re-renders innecesarios con grandes datasets
 */

import { memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

import type { SaldoATRRow } from '../../../types';
import { COLUMN_LETTERS, COLUMNS_TO_EMPTY } from '../utils/constants';
import { usePaginacion, useOrdenamiento, generarNumerosPagina } from './SaldoATRTable/index';

/**
 * Props del componente SaldoATRTable
 */
interface SaldoATRTableProps {
  /** Array de filas de datos SaldoATR */
  rows: SaldoATRRow[];
  /** Array de encabezados de columnas */
  headers: string[];
}

/**
 * Componente de tabla SaldoATR con paginación
 * Muestra 46 columnas (A-AT) con capacidad de importación en columnas específicas
 */
const SaldoATRTableComponent = ({ rows, headers }: SaldoATRTableProps) => {
  // Usar hooks personalizados para ordenamiento y paginación
  const { columnaOrden, direccionOrden, itemsOrdenados, handleOrdenarColumna } = useOrdenamiento({
    items: rows,
  });

  const {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    itemsPaginados,
    irAPagina,
    cambiarItemsPorPagina,
  } = usePaginacion({
    items: itemsOrdenados,
    itemsPorPaginaInicial: 15,
  });

  return (
    <>
      <div className="saldoatr-table-wrapper">
        <table className="saldoatr-table">
          <thead>
            <tr>
              {COLUMN_LETTERS.map((col, idx) => {
                const title = headers[idx] ?? `Columna ${col}`;
                const empty = COLUMNS_TO_EMPTY.has(col);
                const isSort = columnaOrden === col;
                return (
                  <th
                    key={col}
                    className={`${empty ? 'th-empty-col' : ''} ${isSort ? 'th-sorted' : ''}`}
                    onClick={() => !empty && handleOrdenarColumna(col)}
                    role={empty ? undefined : 'button'}
                    tabIndex={empty ? undefined : 0}
                    onKeyDown={
                      empty
                        ? undefined
                        : (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOrdenarColumna(col);
                            }
                          }
                    }
                  >
                    <div className="col-header">
                      <div>
                        <div className="col-letter">{col}</div>
                        <div className="col-title">{title}</div>
                      </div>
                      {!empty && columnaOrden === col && (
                        <span className="sort-icon">
                          {direccionOrden === 'asc' ? (
                            <ArrowUp size={16} />
                          ) : (
                            <ArrowDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {itemsPaginados.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_LETTERS.length} className="empty-row">
                  Sin datos cargados. Importa un archivo Saldo ATR.csv para completar las columnas
                  permitidas.
                </td>
              </tr>
            ) : (
              itemsPaginados.map((r, i) => (
                <tr key={i}>
                  {COLUMN_LETTERS.map((c) => {
                    const rowData = r as Record<string, string>;
                    const value = rowData[c] ?? '';
                    const isEmpty = COLUMNS_TO_EMPTY.has(c);
                    return (
                      <td key={c} className={isEmpty ? 'col-force-empty' : 'col-value'}>
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 0 && itemsOrdenados.length > 0 && (
        <div className="saldoatr-pagination-container">
          <div className="saldoatr-pagination-selector">
            <label htmlFor="saldoatr-items-per-page">Filas:</label>
            <select
              id="saldoatr-items-per-page"
              value={itemsPorPagina}
              onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
              className="saldoatr-pagination-select"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="saldoatr-pagination">
            <button
              className="saldoatr-pagination-btn saldoatr-pagination-btn--icon"
              onClick={() => irAPagina(1)}
              disabled={paginaActual === 1}
              title="Primera página"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              className="saldoatr-pagination-btn saldoatr-pagination-btn--icon"
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              title="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="saldoatr-pagination-numbers">
              {generarNumerosPagina(paginaActual, totalPaginas).map((page, idx) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${paginaActual}-${idx}`}
                    className="saldoatr-pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`saldoatr-pagination-number ${paginaActual === page ? 'active' : ''}`}
                    onClick={() => irAPagina(page as number)}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              className="saldoatr-pagination-btn saldoatr-pagination-btn--icon"
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              title="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>

            <button
              className="saldoatr-pagination-btn saldoatr-pagination-btn--icon"
              onClick={() => irAPagina(totalPaginas)}
              disabled={paginaActual === totalPaginas}
              title="Última página"
            >
              <ChevronsRight size={18} />
            </button>
          </div>

          <div className="saldoatr-pagination-info">
            {(paginaActual - 1) * itemsPorPagina + 1}-
            {Math.min(paginaActual * itemsPorPagina, itemsOrdenados.length)} de{' '}
            {itemsOrdenados.length}
          </div>
        </div>
      )}
    </>
  );
};

export const SaldoATRTable = memo(SaldoATRTableComponent);
