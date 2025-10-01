import React from 'react'
import { Card, CardHeader, Button } from '../../components/ui'
import { FilterBar } from './FilterBar'
import { StatsSummary } from './StatsSummary'
import { ATRTable } from './ATRTable'
import { SaldoATRPanel } from './SaldoATRPanel'
import { useDashboard } from './useDashboard'
import styles from './Dashboard.module.css'

export const Dashboard: React.FC = () => {
  const {
    registros,
    saldoATR,
    saldoSelection,
    stats,
    filteredStats,
    filters,
    saldoFilters,
    updateFilter,
    clearFilters,
    setSaldoFilters,
    importError,
    showSaldo,
    setShowSaldo,
    fileInputRef,
    triggerImport,
    handleFileChange,
    clearAllRegistros,
    toggleSaldoSelection,
    createRegistrosFromSaldo,
  } = useDashboard()

  // Empty state - no registros at all
  if (!stats.total) {
    return (
      <Card className={styles.emptyCard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h3 className={styles.emptyTitle}>No hay registros aún</h3>
          <p className={styles.emptyMessage}>
            Importe un archivo CSV con saldo ATR para comenzar a valorar el consumo energético.
          </p>
          
          <div className={styles.emptyActions}>
            <Button
              variant="success"
              size="lg"
              onClick={triggerImport}
            >
              📥 Importar saldo ATR
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          
          {importError && (
            <div className={styles.alert}>
              ⚠️ {importError}
            </div>
          )}
        </div>

        <SaldoATRPanel
          saldoData={saldoATR}
          selection={saldoSelection}
          filters={saldoFilters}
          showPanel={showSaldo}
          onTogglePanel={() => setShowSaldo(prev => !prev)}
          onToggleSelection={toggleSaldoSelection}
          onCreateRegistros={createRegistrosFromSaldo}
          onFiltersChange={setSaldoFilters}
        />
      </Card>
    )
  }

  return (
    <div className={styles.container}>
      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        onClearAll={clearAllRegistros}
        hasActiveFilters={false} // Will be updated when implementing filters count
      />

      {/* Main content */}
      <Card>
        <CardHeader>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Registros ATR</h3>
              <StatsSummary
                totalCount={stats.total}
                filteredCount={filteredStats.count}
                totalKWh={stats.totalKWh}
                filteredKWh={filteredStats.totalKWh}
              />
            </div>
            
            <div className={styles.headerActions}>
              <Button
                variant="secondary"
                onClick={triggerImport}
              >
                📥 Importar saldo ATR
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </CardHeader>

        {/* Error message */}
        {importError && (
          <div className={styles.alert}>
            ⚠️ {importError}
          </div>
        )}

        {/* Saldo ATR Panel */}
        <SaldoATRPanel
          saldoData={saldoATR}
          selection={saldoSelection}
          filters={saldoFilters}
          showPanel={showSaldo}
          onTogglePanel={() => setShowSaldo(prev => !prev)}
          onToggleSelection={toggleSaldoSelection}
          onCreateRegistros={createRegistrosFromSaldo}
          onFiltersChange={setSaldoFilters}
        />

        {/* ATR Table */}
        <ATRTable registros={registros} />
      </Card>
    </div>
  )
}