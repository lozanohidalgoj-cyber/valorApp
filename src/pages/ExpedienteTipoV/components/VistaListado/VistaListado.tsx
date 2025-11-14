/**
 * Vista de listado completo de datos con ordenamiento por columnas
 */

import { ArrowUp, ArrowDown, ClipboardList } from 'lucide-react';
import type { DerivacionData } from '../../../../types';
import { useListadoOrdenamiento } from './useListadoOrdenamiento';

interface VistaListadoProps {
  data: DerivacionData[];
  columns: string[];
}

export const VistaListado = ({ data, columns }: VistaListadoProps) => {
  const columnasVisibles = columns.slice(0, 10);
  const totalRegistros = data.length;
  const totalColumnas = columns.length;

  // Hook de ordenamiento
  const { itemsOrdenados, columnaOrden, direccionOrden, handleOrdenarColumna } =
    useListadoOrdenamiento({ items: data });

  return (
    <div className="expediente-table-wrapper expediente-table-wrapper--listado">
      <div className="listado-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={20} />
          <div>
            <h3 style={{ margin: 0 }}>Listado Completo de Registros</h3>
            <p className="listado-subtitle">Vista resumida de las columnas más consultadas</p>
          </div>
        </div>
        <span className="listado-badge" aria-label={`Total de registros: ${totalRegistros}`}>
          {totalRegistros} registros
        </span>
      </div>
      <table className="expediente-table expediente-table-listado" role="table">
        <thead>
          <tr>
            {columnasVisibles.map((column) => {
              const isSort = columnaOrden === column;
              return (
                <th
                  key={column}
                  className={`${isSort ? 'th-sorted' : ''}`}
                  scope="col"
                  onClick={() => handleOrdenarColumna(column)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOrdenarColumna(column);
                    }
                  }}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="col-header-listado">
                    <span>{column}</span>
                    {isSort && (
                      <span className="sort-icon-listado">
                        {direccionOrden === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {itemsOrdenados.map((row: DerivacionData) => {
            // Crear una clave única basada en los primeros valores disponibles del registro
            const keyValue = columnasVisibles
              .map((col) =>
                String((row as unknown as Record<string, string>)[col] ?? '').slice(0, 5)
              )
              .join('-');
            return (
              <tr key={keyValue || Math.random()}>
                {columnasVisibles.map((column) => (
                  <td
                    key={`${column}-${keyValue}`}
                    className="expediente-table-cell"
                    data-title={column}
                  >
                    {String((row as unknown as Record<string, string>)[column] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="listado-nota" role="note">
        ℹ️ Mostrando las primeras 10 columnas. Total de columnas disponibles: {totalColumnas}
      </div>
    </div>
  );
};
