import React from 'react'
import { Input, Button } from '../../components/ui'
import { FilterState } from '../../hooks/ui/useFilters'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onClearFilters: () => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onClearAll,
  hasActiveFilters,
}) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Filtros</h3>
      
      <div className={styles.grid}>
        <Input
          label="Buscar"
          placeholder="Cliente, tipo fraude, notas..."
          value={filters.searchQuery}
          onChange={e => onFilterChange('searchQuery', e.target.value)}
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Tipo de Gestión</label>
          <select
            className={styles.select}
            value={filters.gestionFilter}
            onChange={e => onFilterChange('gestionFilter', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="averia">Avería</option>
            <option value="fraude">Fraude</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tipo de Valor</label>
          <select
            className={styles.select}
            value={filters.valorTipoFilter}
            onChange={e => onFilterChange('valorTipoFilter', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="estimado">Estimado</option>
            <option value="real">Real</option>
          </select>
        </div>

        <div className={styles.actions}>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearFilters}
            >
              Limpiar Filtros
            </Button>
          )}
          
          <Button
            variant="danger"
            size="sm"
            onClick={onClearAll}
          >
            🗑️ Limpiar Todo
          </Button>
        </div>
      </div>
    </div>
  )
}