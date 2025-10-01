import React from 'react'
import { Button, Input } from '../../components/ui'
import { ATRSaldoRow } from '../../types/atr'
import styles from './SaldoATRPanel.module.css'

interface SaldoATRPanelProps {
  saldoData: { rows: Array<{ row: ATRSaldoRow; idx: number }>; total: number }
  selection: Set<number>
  filters: {
    query: string
    fuente: 'all' | 'real' | 'no-real'
    minKwh: string
    maxKwh: string
    sort: string
  }
  showPanel: boolean
  onTogglePanel: () => void
  onToggleSelection: (idx: number) => void
  onCreateRegistros: () => void
  onFiltersChange: (filters: any) => void
}

export const SaldoATRPanel: React.FC<SaldoATRPanelProps> = ({
  saldoData,
  selection,
  filters,
  showPanel,
  onTogglePanel,
  onToggleSelection,
  onCreateRegistros,
  onFiltersChange,
}) => {
  if (!saldoData.total) return null

  const resetFilters = () => {
    onFiltersChange({
      query: '',
      fuente: 'all',
      minKwh: '',
      maxKwh: '',
      sort: 'fecha-desc'
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.info}>
          <strong>Saldo ATR importado:</strong> {saldoData.total} filas • visibles {saldoData.rows.length}
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onTogglePanel}
          >
            {showPanel ? 'Ocultar' : 'Mostrar'}
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            disabled={!selection.size}
            onClick={onCreateRegistros}
          >
            ➕ Crear registros ({selection.size})
          </Button>
        </div>
      </div>

      {showPanel && (
        <>
          <div className={styles.filters}>
            <div className={styles.filtersGrid}>
              <Input
                label="Buscar"
                placeholder="CUPS, contrato, factura..."
                value={filters.query}
                onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
              />

              <div className={styles.formGroup}>
                <label className={styles.label}>Fuente</label>
                <select
                  className={styles.select}
                  value={filters.fuente}
                  onChange={e => onFiltersChange({ ...filters, fuente: e.target.value })}
                >
                  <option value="all">Todas</option>
                  <option value="real">Real</option>
                  <option value="no-real">No real</option>
                </select>
              </div>

              <Input
                label="kWh mín"
                type="number"
                step="0.001"
                value={filters.minKwh}
                onChange={e => onFiltersChange({ ...filters, minKwh: e.target.value })}
              />

              <Input
                label="kWh máx"
                type="number"
                step="0.001"
                value={filters.maxKwh}
                onChange={e => onFiltersChange({ ...filters, maxKwh: e.target.value })}
              />

              <div className={styles.formGroup}>
                <label className={styles.label}>Orden</label>
                <select
                  className={styles.select}
                  value={filters.sort}
                  onChange={e => onFiltersChange({ ...filters, sort: e.target.value })}
                >
                  <option value="fecha-desc">Fecha (reciente primero)</option>
                  <option value="fecha-asc">Fecha (antiguo primero)</option>
                  <option value="kwh-desc">kWh (mayor primero)</option>
                  <option value="kwh-asc">kWh (menor primero)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>&nbsp;</label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>CUPS</th>
                  <th>Contrato</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>kWh</th>
                  <th>Fuente</th>
                  <th>Estado medida</th>
                  <th>Factura</th>
                  <th>Tipo factura</th>
                  <th>Estado factura</th>
                  <th>Nº serie contador</th>
                  <th>F. envío facturar</th>
                  <th>Pot(kW)</th>
                  <th>Autofactura</th>
                </tr>
              </thead>
              <tbody>
                {saldoData.rows.map(({ row, idx }) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selection.has(idx)}
                        onChange={() => onToggleSelection(idx)}
                      />
                    </td>
                    <td className={styles.smallText}>{row.cups}</td>
                    <td className={styles.smallText}>{row.contratoATR}</td>
                    <td>{row.fechaDesde}</td>
                    <td>{row.fechaHasta}</td>
                    <td className={styles.numberCell}>{row.consumoTotalActivaKWh.toFixed(3)}</td>
                    <td>{row.fuenteAgregada}</td>
                    <td>{row.estadoMedida}</td>
                    <td className={styles.smallText}>{row.codigoFactura}</td>
                    <td>{row.tipoFactura}</td>
                    <td>{row.estadoFactura}</td>
                    <td className={styles.smallText}>{row.numeroSerieContador}</td>
                    <td className={styles.smallText}>{row.fechaEnvioAFacturar}</td>
                    <td>{row.potenciaKW}</td>
                    <td>{row.autoFactura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}