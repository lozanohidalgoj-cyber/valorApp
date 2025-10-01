import React from 'react'
import { ATRRegistro } from '../../types/atr'
import { formatDateToSpanish } from '../../utils/formatting'
import styles from './ATRTable.module.css'

interface ATRTableProps {
  registros: ATRRegistro[]
}

export const ATRTable: React.FC<ATRTableProps> = ({ registros }) => {
  if (!registros.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h4 className={styles.emptyTitle}>No se encontraron registros</h4>
        <p className={styles.emptyMessage}>
          Intente ajustar los filtros o importe un archivo CSV con datos ATR.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Gestión</th>
            <th>Tipo Fraude</th>
            <th>Tipo Valor</th>
            <th>kWh</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(registro => (
            <tr key={registro.id}>
              <td>{formatDateToSpanish(registro.fechaISO)}</td>
              <td className={styles.clienteId}>{registro.clienteId}</td>
              <td>
                <span
                  className={
                    registro.gestion === 'fraude' 
                      ? styles.gestionFraude 
                      : styles.gestionAveria
                  }
                >
                  {registro.gestion === 'fraude' ? '⚠️ Fraude' : '🔧 Avería'}
                </span>
              </td>
              <td>{registro.fraudeTipo ?? '-'}</td>
              <td>
                <span
                  className={
                    registro.valorTipo === 'real' 
                      ? styles.valorReal 
                      : styles.valorEstimado
                  }
                >
                  {registro.valorTipo === 'real' ? '✓ Real' : '~ Estimado'}
                </span>
              </td>
              <td className={styles.kwh}>{registro.kWh.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}