import { useState, useRef, useMemo, useCallback } from 'react'
import { ATR_SALDO_EXPECTED_HEADERS, mapToATRSaldoRow, ATRSaldoRow } from '../../types/atr'
import { useStore } from '../../state/store'

interface UseSaldoATRResult {
  saldoRows: ATRSaldoRow[]
  filtered: { rows: { row: ATRSaldoRow; idx: number }[]; total: number }
  selection: Set<number>
  query: string
  fuente: 'all' | 'real' | 'no-real'
  minKwh: string
  maxKwh: string
  sort: 'fecha-desc' | 'fecha-asc' | 'kwh-desc' | 'kwh-asc'
  importMessage: string | null
  fileInputRef: React.RefObject<HTMLInputElement>
  setQuery: (v: string) => void
  setFuente: (v: 'all' | 'real' | 'no-real') => void
  setMinKwh: (v: string) => void
  setMaxKwh: (v: string) => void
  setSort: (v: UseSaldoATRResult['sort']) => void
  triggerImport: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  toggleRow: (idx: number) => void
  clearSelection: () => void
}

export function useSaldoATR(): UseSaldoATRResult {
  const { saldoATR, setSaldoATR } = useStore() as any

  const [selection, setSelection] = useState<Set<number>>(new Set())
  const [query, setQuery] = useState('')
  const [fuente, setFuente] = useState<'all' | 'real' | 'no-real'>('all')
  const [minKwh, setMinKwh] = useState('')
  const [maxKwh, setMaxKwh] = useState('')
  const [sort, setSort] = useState<'fecha-desc' | 'fecha-asc' | 'kwh-desc' | 'kwh-asc'>('fecha-desc')
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const triggerImport = useCallback(() => fileInputRef.current?.click(), [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      if (!lines.length) {
        setImportMessage('El archivo está vacío')
        return
      }
      const header = lines[0].split(';').map(h => h.trim())
      const missing = ATR_SALDO_EXPECTED_HEADERS.filter(h => !header.includes(h))
      if (missing.length) {
        setImportMessage('Cabeceras faltantes: ' + missing.join(', '))
        return
      }
      const rows = lines.slice(1)
        .map(l => mapToATRSaldoRow(l.split(';')))
        .filter(Boolean) as ATRSaldoRow[]
      setSaldoATR(rows)
      setImportMessage(`${rows.length} fila(s) importadas correctamente`)
    } catch (err: any) {
      setImportMessage('Error leyendo CSV: ' + (err?.message || 'desconocido'))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTimeout(() => setImportMessage(null), 3000)
    }
  }, [setSaldoATR])

  const toggleRow = useCallback((idx: number) => {
    setSelection(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelection(new Set()), [])

  function ddmmyyyyToDate(s: string): Date {
    const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (!m) return new Date(0)
    const [, dd, mm, yyyy] = m
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = minKwh ? parseFloat(minKwh) : -Infinity
    const max = maxKwh ? parseFloat(maxKwh) : Infinity
    const withIdx = (saldoATR as ATRSaldoRow[]).map((row: ATRSaldoRow, idx: number) => ({ row, idx }))
    let rows = withIdx.filter(({ row }) => {
      if (q) {
        const haystack = `${row.cups} ${row.contratoATR} ${row.codigoFactura} ${row.tipoFactura}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (fuente === 'real' && row.fuenteAgregada.toLowerCase() !== 'real') return false
      if (fuente === 'no-real' && row.fuenteAgregada.toLowerCase() === 'real') return false
      const kwh = row.consumoTotalActivaKWh
      if (kwh < min || kwh > max) return false
      return true
    })
    rows.sort((a, b) => {
      if (sort === 'kwh-desc') return b.row.consumoTotalActivaKWh - a.row.consumoTotalActivaKWh
      if (sort === 'kwh-asc') return a.row.consumoTotalActivaKWh - b.row.consumoTotalActivaKWh
      const da = ddmmyyyyToDate(a.row.fechaHasta || a.row.fechaDesde)
      const db = ddmmyyyyToDate(b.row.fechaHasta || b.row.fechaDesde)
      const cmp = da.getTime() - db.getTime()
      return sort === 'fecha-asc' ? cmp : -cmp
    })
    return { rows, total: saldoATR.length }
  }, [saldoATR, query, fuente, minKwh, maxKwh, sort])

  return {
    saldoRows: saldoATR,
    filtered,
    selection,
    query,
    fuente,
    minKwh,
    maxKwh,
    sort,
    importMessage,
    fileInputRef,
    setQuery,
    setFuente,
    setMinKwh,
    setMaxKwh,
    setSort,
    triggerImport,
    handleFileChange,
    toggleRow,
    clearSelection,
  }
}

export type { ATRSaldoRow }