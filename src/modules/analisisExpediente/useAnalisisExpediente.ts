import { useCallback, useEffect, useMemo, useState } from 'react'
import { ANALISIS_STORAGE_KEY, AnalisisMetrics, ExpedienteAnalisis } from './types'
import { parseAnalisisExcel, parseAnalisisFromWorkbook } from './parseExcel'

export function useAnalisisExpediente() {
  const [items, setItems] = useState<ExpedienteAnalisis[]>(() => {
    try {
      const raw = localStorage.getItem(ANALISIS_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as ExpedienteAnalisis[]) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try { localStorage.setItem(ANALISIS_STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  const onUpload = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseAnalisisExcel(file)
      setItems(parsed)
    } catch (e: any) {
      setError(e?.message || 'Error al procesar el Excel')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const setFromParsed = useCallback((parsed: ExpedienteAnalisis[]) => {
    setItems(parsed)
  }, [])

  const setFromWorkbook = useCallback((wb: any) => {
    try {
      const parsed = parseAnalisisFromWorkbook(wb)
      setItems(parsed)
    } catch (e) {
      // noop o manejar error externo
    }
  }, [])

  const metrics: AnalisisMetrics = useMemo(() => {
    const count = items.length
    if (!count) return { count: 0, pinzasOkPct: 0, diferenciaOkPct: 0 }
    const pinzasOk = items.filter(i => i.flags.pinzasOk).length
    const difOk = items.filter(i => i.flags.diferenciaOk).length
    return {
      count,
      pinzasOkPct: +(pinzasOk * 100 / count).toFixed(1),
      diferenciaOkPct: +(difOk * 100 / count).toFixed(1),
    }
  }, [items])

  return { items, loading, error, onUpload, clear, metrics, setFromParsed, setFromWorkbook }
}
