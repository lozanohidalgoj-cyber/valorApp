import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useATRData } from '../../hooks/business'
import { useFilters } from '../../hooks/ui'

interface SaldoFilters {
  query: string
  fuente: 'all' | 'real' | 'no-real'
  minKwh: string
  maxKwh: string
  sort: 'fecha-desc' | 'fecha-asc' | 'kwh-desc' | 'kwh-asc'
}
import { ATR_SALDO_EXPECTED_HEADERS, mapToATRSaldoRow, ATRSaldoRow } from '../../types/atr'
import { ddmmyyyyToISO, ddmmyyyyToDate } from '../../utils/formatting'
import { STORAGE_KEYS } from '../../constants'

export function useDashboard() {
  const { 
    registros, 
    saldoATR, 
    setSaldoATR, 
    addRegistro, 
    clearAllRegistros,
    generateId,
    stats 
  } = useATRData()

  const { 
    filters, 
    updateFilter, 
    clearFilters,
    debouncedSearchQuery 
  } = useFilters()

  // File import state
  const [importError, setImportError] = useState<string | null>(null)
  const [showSaldo, setShowSaldo] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Saldo ATR state
  const [saldoSelection, setSaldoSelection] = useState<Set<number>>(new Set())
  const [saldoFilters, setSaldoFilters] = useState({
    query: '',
    fuente: 'all' as 'all' | 'real' | 'no-real',
    minKwh: '',
    maxKwh: '',
    sort: 'fecha-desc' as 'fecha-desc' | 'fecha-asc' | 'kwh-desc' | 'kwh-asc'
  })

  // Auto-trigger import if flag is set
  useEffect(() => {
    try {
      const flag = localStorage.getItem(STORAGE_KEYS.TRIGGER_IMPORT)
      if (flag === '1') {
        localStorage.removeItem(STORAGE_KEYS.TRIGGER_IMPORT)
        setTimeout(() => triggerImport(), 100)
      }
    } catch {
      // Ignore errors
    }

    const onEvent = () => triggerImport()
    window.addEventListener('valorApp:triggerImportATR' as any, onEvent)
    ;(window as any).valorApp_openFile = triggerImport

    return () => {
      window.removeEventListener('valorApp:triggerImportATR' as any, onEvent)
      if ((window as any).valorApp_openFile) {
        delete (window as any).valorApp_openFile
      }
    }
  }, [])

  // Clear error messages after delay
  useEffect(() => {
    if (importError) {
      const timer = setTimeout(() => setImportError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [importError])

  // Trigger file import
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle file import
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
      
      if (!lines.length) {
        setImportError('El archivo está vacío')
        return
      }

      const header = lines[0].split(';').map(h => h.trim())
      const missingHeaders = ATR_SALDO_EXPECTED_HEADERS.filter(h => !header.includes(h))
      
      if (missingHeaders.length) {
        setImportError('Cabeceras faltantes: ' + missingHeaders.join(', '))
        return
      }

      const rows = lines.slice(1)
        .map(l => mapToATRSaldoRow(l.split(';')))
        .filter(Boolean) as ATRSaldoRow[]

      setSaldoATR(rows)
      setImportError(`${rows.length} fila(s) importadas correctamente`)
      setShowSaldo(true)
    } catch (err: any) {
      setImportError('Error leyendo CSV: ' + (err?.message || 'desconocido'))
    } finally {
      // Clear input to allow re-importing same file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [setSaldoATR])

  // Toggle saldo row selection
  const toggleSaldoSelection = useCallback((index: number) => {
    setSaldoSelection(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  // Create registros from selected saldo rows
  const createRegistrosFromSaldo = useCallback(() => {
    if (!saldoSelection.size) return

    let count = 0
    saldoSelection.forEach(idx => {
      const row = saldoATR[idx]
      if (!row) return

      const fechaISO = ddmmyyyyToISO(row.fechaHasta || row.fechaDesde)
      const kWh = row.consumoTotalActivaKWh
      
      if (!Number.isFinite(kWh)) return

      const valorTipo = row.fuenteAgregada?.toLowerCase() === 'real' ? 'real' : 'estimado'
      const registro = {
        id: generateId(),
        clienteId: row.cups,
        fechaISO,
        gestion: 'averia' as const,
        valorTipo: valorTipo as 'real' | 'estimado',
        kWh,
        notas: `Factura ${row.codigoFactura} (${row.tipoFactura}) Potencia ${row.potenciaKW}kW`
      }

      const success = addRegistro(registro)
      if (success) count++
    })

    setSaldoSelection(new Set())
    setImportError(`${count} registro(s) creados desde saldo ATR.`)
  }, [saldoSelection, saldoATR, generateId, addRegistro])

  // Filter and sort saldo ATR data
  const filteredSaldoATR = useMemo(() => {
    const query = saldoFilters.query.trim().toLowerCase()
    const min = saldoFilters.minKwh ? parseFloat(saldoFilters.minKwh) : -Infinity
    const max = saldoFilters.maxKwh ? parseFloat(saldoFilters.maxKwh) : Infinity

    const withIndex = saldoATR.map((row, idx) => ({ row, idx }))
    
    let filtered = withIndex.filter(({ row }) => {
      if (query) {
        const searchText = `${row.cups} ${row.contratoATR} ${row.codigoFactura} ${row.tipoFactura}`.toLowerCase()
        if (!searchText.includes(query)) return false
      }

      if (saldoFilters.fuente === 'real' && row.fuenteAgregada.toLowerCase() !== 'real') {
        return false
      }
      if (saldoFilters.fuente === 'no-real' && row.fuenteAgregada.toLowerCase() === 'real') {
        return false
      }

      const kwh = row.consumoTotalActivaKWh
      if (kwh < min || kwh > max) return false

      return true
    })

    // Sort results
    filtered.sort((a, b) => {
      if (saldoFilters.sort === 'kwh-desc') {
        return b.row.consumoTotalActivaKWh - a.row.consumoTotalActivaKWh
      }
      if (saldoFilters.sort === 'kwh-asc') {
        return a.row.consumoTotalActivaKWh - b.row.consumoTotalActivaKWh
      }
      
      const dateA = ddmmyyyyToDate(a.row.fechaHasta || a.row.fechaDesde)
      const dateB = ddmmyyyyToDate(b.row.fechaHasta || b.row.fechaDesde)
      const comparison = dateA.getTime() - dateB.getTime()
      
      return saldoFilters.sort === 'fecha-asc' ? comparison : -comparison
    })

    return { rows: filtered, total: saldoATR.length }
  }, [saldoATR, saldoFilters])

  // Filter registros based on current filters
  const filteredRegistros = useMemo(() => {
    return registros.filter(registro => {
      if (filters.gestionFilter && registro.gestion !== filters.gestionFilter) {
        return false
      }
      if (filters.valorTipoFilter && registro.valorTipo !== filters.valorTipoFilter) {
        return false
      }
      if (debouncedSearchQuery) {
        const searchText = `${registro.clienteId} ${registro.fraudeTipo ?? ''} ${registro.notas ?? ''}`.toLowerCase()
        if (!searchText.includes(debouncedSearchQuery.toLowerCase())) {
          return false
        }
      }
      return true
    })
  }, [registros, filters, debouncedSearchQuery])

  // Calculate totals for filtered registros
  const filteredStats = useMemo(() => {
    const totalKWh = filteredRegistros.reduce((sum, r) => sum + r.kWh, 0)
    return {
      count: filteredRegistros.length,
      totalKWh
    }
  }, [filteredRegistros])

  return {
    // Data
    registros: filteredRegistros,
    allRegistros: registros,
    saldoATR: filteredSaldoATR,
    saldoSelection,
    
    // Stats
    stats,
    filteredStats,
    
    // Filters
    filters,
    saldoFilters,
    updateFilter,
    clearFilters,
    setSaldoFilters,
    
    // File import
    importError,
    showSaldo,
    setShowSaldo,
    fileInputRef,
    triggerImport,
    handleFileChange,
    
    // Actions
    clearAllRegistros,
    toggleSaldoSelection,
    createRegistrosFromSaldo,
  }
}