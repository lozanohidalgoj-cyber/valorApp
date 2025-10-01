import React from 'react'
import { formatKWh } from '../../utils/formatting'
import styles from './StatsSummary.module.css'

interface StatsSummaryProps {
  totalCount: number
  filteredCount: number
  totalKWh: number
  filteredKWh: number
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  totalCount,
  filteredCount,
  totalKWh,
  filteredKWh,
}) => {
  const isFiltered = filteredCount !== totalCount

  return (
    <div className={styles.container}>
      <div className={styles.stat}>
        <span className={styles.label}>Registros:</span>
        <span className={styles.value}>
          {isFiltered ? (
            <>
              {filteredCount} de {totalCount}
            </>
          ) : (
            totalCount
          )}
        </span>
      </div>

      <div className={styles.separator}>•</div>

      <div className={styles.stat}>
        <span className={styles.label}>Total kWh:</span>
        <span className={styles.value}>
          {isFiltered ? (
            <>
              {formatKWh(filteredKWh)} de {formatKWh(totalKWh)}
            </>
          ) : (
            formatKWh(totalKWh)
          )}
        </span>
      </div>

      {isFiltered && (
        <>
          <div className={styles.separator}>•</div>
          <div className={styles.stat}>
            <span className={styles.label}>Promedio:</span>
            <span className={styles.value}>
              {formatKWh(filteredCount > 0 ? filteredKWh / filteredCount : 0)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}