import React from 'react'

interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}

const useAtrCsv = (): ParsedCSV | null => {
  try {
    const s = localStorage.getItem('valorApp.analisis.atrCsv')
    if (!s) return null
    return JSON.parse(s)
  } catch {
    return null
  }
}

const ATRPreview: React.FC = () => {
  const data = useAtrCsv()
  
  // Filtrar columna "Autofactura" de los encabezados
  const filteredData = React.useMemo(() => {
    if (!data?.headers || !data?.rows) return null
    
    // Filtrar encabezados que no sean "Autofactura"
    const filteredHeaders = data.headers.filter(h => 
      (h || '').toLowerCase().trim() !== 'autofactura'
    )
    
    // Si no hay cambios en los encabezados, retornar data original
    if (filteredHeaders.length === data.headers.length) {
      return data
    }
    
    // Filtrar las columnas de cada fila
    const filteredRows = data.rows.map(row => {
      const newRow: Record<string, string> = {}
      filteredHeaders.forEach(header => {
        if (header in row) {
          newRow[header] = row[header]
        }
      })
      return newRow
    })
    
    return {
      headers: filteredHeaders,
      rows: filteredRows
    }
  }, [data])
  
  const [filteredRows, setFilteredRows] = React.useState<Record<string,string>[]>(() => filteredData?.rows || [])
  const [removedRows, setRemovedRows] = React.useState<Record<string,string>[]>([])
  const [keptRows, setKeptRows] = React.useState<Record<string,string>[]>([])
  const [anuladas, setAnuladas] = React.useState<number>(0)
  const [detalleAnuladas, setDetalleAnuladas] = React.useState<{comp: number; anuladas: number; enviados: number}>({ comp: 0, anuladas: 0, enviados: 0 })
  const [ordenado, setOrdenado] = React.useState<boolean>(false)
  const [viewMode, setViewMode] = React.useState<'restantes' | 'filtradas'>('restantes')
  const [showFilteredModal, setShowFilteredModal] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState<'vista' | 'eliminadas'>('vista')
  const [showYearPanel, setShowYearPanel] = React.useState<boolean>(false)
  // Modal de previsualización de anulación por Estado/Tipo
  const [showAnularPreview, setShowAnularPreview] = React.useState<boolean>(false)
  const [anularPreviewRows, setAnularPreviewRows] = React.useState<Record<string,string>[]>([])
  const [anularPreviewDetalle, setAnularPreviewDetalle] = React.useState<{comp: number; anuladas: number; enviados: number}>({ comp: 0, anuladas: 0, enviados: 0 })
  const total = filteredRows.length
  
  // Actualizar filteredRows cuando cambien los datos
  React.useEffect(() => {
    if (filteredData?.rows) {
      setFilteredRows(filteredData.rows)
      setKeptRows(filteredData.rows)
      setRemovedRows([])
      setViewMode('restantes')
      setOrdenado(false)
      setAnuladas(0)
      setDetalleAnuladas({ comp: 0, anuladas: 0, enviados: 0 })
      setActiveTab('vista')
    }
  }, [filteredData])

  const isContratoHeader = (h: string) => ['Contrato ATR', 'Contrato'].some(x => x.toLowerCase() === (h || '').toLowerCase())
  // Detección robusta de columna de potencia: acepta variantes como "Pot(kW)", "Potencia(kW)", "Potencia kW", etc.
  const isPotenciaHeader = (h: string) => {
    const raw = (h || '')
    const t = stripAccents(raw).toLowerCase().trim()
    // Normalizamos espacios y puntuación común
  const norm = t.replace(/[\s._-]/g, '')
    // Casos explícitos comunes
    if (['potencia', 'potenciakw', 'potenciakW'.toLowerCase()].includes(norm)) return true
    // Heurística: contiene "pot" (pot/potencia) y "kw"
    if (t.includes('pot') && t.includes('kw')) return true
    // Formatos con paréntesis típicos: pot(kw), potencia(kw)
    if (/pot\s*\(\s*kw\s*\)/.test(t) || /potencia\s*\(\s*kw\s*\)/.test(t)) return true
    return false
  }
  const stripAccents = (s: string) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const isFechaEnvioHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'fecha de envio a facturar' || (t.includes('fecha') && t.includes('envio') && (t.includes('factur') || t.includes('facturar')))
  }
  const isFechaDesdeHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'fecha desde' || (t.includes('fecha') && t.includes('desde'))
  }
  const isFechaHastaHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'fecha hasta' || (t.includes('fecha') && t.includes('hasta'))
  }
  // Cabeceras robustas para "Tipo de factura" y "Estado de medida"
  const isTipoFacturaHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'tipo de factura' || t === 'tipo factura' || (t.includes('tipo') && t.includes('factur'))
  }
  const isEstadoMedidaHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'estado de medida' || t === 'estado medida' || (t.includes('estado') && t.includes('medida'))
  }
  const normalizeNumber = (s: string) => {
    // Convierte "2.345,67" o "2,200" a número normalizado para comparar
    const t = (s || '').replace(/\./g, '').replace(/,/g, '.')
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
  }
  const normalizeLabel = (s: string) => {
    const raw = String(s ?? '')
    // Sustituir espacios no separables y otros espacios Unicode por espacio normal
    const withSpaces = raw.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    const t = stripAccents(withSpaces)
      .toLowerCase()
      .replace(/["'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return t
  }

  // Clasifica etiquetas en categorías objetivo con heurística amplia
  type ClaseObjetivo = 'comp' | 'envi' | 'anul' | 'orden' | null
  const classifyLabel = (input: string): ClaseObjetivo => {
    const s = normalizeLabel(input)
    if (!s) return null
    const compact = s.replace(/[\s._-]/g, '')

    // Ordenar facturas
    if (/orden\w*\s+factur\w*/.test(s) || /orden\w*factur\w*/.test(compact)) return 'orden'

    // Complementaria: múltiples variantes y abreviaturas ("compl.", "complement.", "fc", "fact. compl.")
    const hasFact = /fact/.test(s)
    const hasCompl = /(compl\b|complem\w*|complement\w*)/.test(s) || /(compl)/.test(compact)
    if ((hasFact && hasCompl) || /^fc$/.test(compact) || /^factcompl/.test(compact) || /^faccompl/.test(compact)) return 'comp'

    // Enviado/a a facturar o facturación
    if (/(envi\w*).*(factur\w*)/.test(s)) return 'envi'

    // Anulada / Anuladora
    if (/anulad\w*/.test(s) || /anulador\w*/.test(s)) return 'anul'

    return null
  }
  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n))
  const fromExcelSerial = (serial: number): Date => {
    // Excel 1900 date system: serial 1 -> 1899-12-31; tomamos base 1899-12-30 por bug del 1900 leap
    const epoch = Date.UTC(1899, 11, 30)
    return new Date(epoch + Math.round(serial * 86400000))
  }
  const parseDateLoose = (v: any): Date | null => {
    if (v instanceof Date && !isNaN(v.getTime())) return v
    if (typeof v === 'number' && isFinite(v)) {
      // Si parece serial de Excel (rango típico > 20000)
      if (v > 59) return fromExcelSerial(v)
      // Si es timestamp (ms)
      if (v > 1000000000000) return new Date(v)
    }
    if (typeof v === 'string') {
      const s = v.trim()
      // dd/MM/yyyy [HH:mm[:ss]]
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
      if (m) {
        const dd = Number(m[1]); const mm = Number(m[2]) - 1; const yyyy = Number(m[3].length === 2 ? `20${m[3]}` : m[3])
        const HH = Number(m[4] ?? 0); const MM = Number(m[5] ?? 0); const SS = Number(m[6] ?? 0)
        const d = new Date(yyyy, mm, dd, HH, MM, SS)
        if (!isNaN(d.getTime())) return d
      }
      const d2 = new Date(s)
      if (!isNaN(d2.getTime())) return d2
    }
    return null
  }
  const formatDateES = (v: any): string => {
    const d = parseDateLoose(v)
    if (!d) return String(v ?? '')
    const Y = d.getFullYear(); const M = pad2(d.getMonth() + 1); const D = pad2(d.getDate())
    const h = pad2(d.getHours()); const m = pad2(d.getMinutes()); const s = d.getSeconds()
    const time = s ? `${h}:${m}:${pad2(s)}` : `${h}:${m}`
    // Si hora es 00:00 y no hay indicios de tiempo, solo fecha
    if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) return `${D}/${M}/${Y}`
    return `${D}/${M}/${Y} ${time}`
  }

  // Colores por grupo de contrato (pasteles suaves)
  const groupPalette = ['#fefce8', '#eef2ff', '#ecfdf5', '#fdf2f8', '#f0f9ff', '#fff7ed', '#f5f3ff', '#e8f5e9', '#ede7f6', '#fffde7']
  const contractHeader = React.useMemo(() => (filteredData?.headers.find(h => isContratoHeader(h)) || null), [filteredData])
  const fechaEnvioHeader = React.useMemo(() => (filteredData?.headers.find(h => isFechaEnvioHeader(h)) || null), [filteredData])
  const fechaDesdeHeader = React.useMemo(() => (filteredData?.headers.find(h => isFechaDesdeHeader(h)) || null), [filteredData])
  const fechaHastaHeader = React.useMemo(() => (filteredData?.headers.find(h => isFechaHastaHeader(h)) || null), [filteredData])
  const contractColorMap = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!filteredData || !contractHeader) return map
    let idx = 0
    for (const r of filteredRows) {
      const key = String(r[contractHeader] ?? '').trim()
      if (!map.has(key)) {
        map.set(key, groupPalette[idx % groupPalette.length])
        idx++
      }
    }
    return map
  }, [filteredRows, contractHeader, filteredData])

  // Cabecera de potencia principal (si existe)
  const potenciaHeaderMain = React.useMemo(() => (filteredData?.headers.find(h => isPotenciaHeader(h)) || null), [filteredData])

  // Potencias únicas (kW) en las filas visibles actualmente
  const potenciasUnicasVisibles = React.useMemo(() => {
    if (!potenciaHeaderMain) return 0
    const set = new Set<number>()
    for (const r of filteredRows) {
      const n = normalizeNumber(String(r[potenciaHeaderMain] ?? ''))
      if (Number.isFinite(n)) set.add(n)
    }
    return set.size
  }, [filteredRows, potenciaHeaderMain])

  // Resumen por año: contratos/potencias únicos y cambios por transiciones
  type YearSummary = { contratosUnicos: number; potenciasUnicas: number; cambiosContrato: number; cambiosPotencia: number; total: number }
  const yearlySummary = React.useMemo(() => {
    const result = new Map<number, YearSummary>()
    if (!filteredData) return result

    // Estructura temporal por año basada en filas visibles actualmente
    const tmp = new Map<number, { rows: Array<{ d: Date | null; r: Record<string,string> }>; contratos: Set<string>; pots: Set<number> }>()

    for (const r of filteredRows) {
      // Fecha de referencia por orden: Fecha desde -> Fecha hasta -> Fecha envío a facturar
      const dDesde = fechaDesdeHeader ? parseDateLoose(r[fechaDesdeHeader]) : null
      const dHasta = (!dDesde && fechaHastaHeader) ? parseDateLoose(r[fechaHastaHeader]) : null
      const dEnvio = (!dDesde && !dHasta && fechaEnvioHeader) ? parseDateLoose(r[fechaEnvioHeader]) : null
      const d = dDesde || dHasta || dEnvio || null
      if (!d) continue
      const year = d.getFullYear()
      if (!Number.isFinite(year)) continue

      if (!tmp.has(year)) tmp.set(year, { rows: [], contratos: new Set<string>(), pots: new Set<number>() })
      const bucket = tmp.get(year)!
      bucket.rows.push({ d, r })
      if (contractHeader) {
        const c = String(r[contractHeader] ?? '').trim()
        if (c) bucket.contratos.add(c)
      }
      if (potenciaHeaderMain) {
        const n = normalizeNumber(String(r[potenciaHeaderMain] ?? ''))
        if (Number.isFinite(n)) bucket.pots.add(n)
      }
    }

    // Calcular cambios por año (ordenado por fecha)
    for (const [year, bucket] of tmp.entries()) {
      let cambiosContrato = 0
      let cambiosPotencia = 0
      // Orden cronológico
      bucket.rows.sort((a, b) => {
        if (!a.d && !b.d) return 0
        if (!a.d) return -1
        if (!b.d) return 1
        return a.d.getTime() - b.d.getTime()
      })
      let prevContrato: string | null = null
      let prevPot: number | null = null
      for (const { r } of bucket.rows) {
        if (contractHeader) {
          const cur = String(r[contractHeader] ?? '').trim()
          if (prevContrato !== null && cur && prevContrato && cur !== prevContrato) cambiosContrato++
          if (cur) prevContrato = cur
        }
        if (potenciaHeaderMain) {
          const curN = normalizeNumber(String(r[potenciaHeaderMain] ?? ''))
          if (Number.isFinite(curN)) {
            if (prevPot !== null && Number.isFinite(prevPot) && curN !== prevPot) cambiosPotencia++
            prevPot = curN
          }
        }
      }

      result.set(year, {
        contratosUnicos: bucket.contratos.size,
        potenciasUnicas: bucket.pots.size,
        cambiosContrato,
        cambiosPotencia,
        total: bucket.rows.length
      })
    }
    return result
  }, [filteredData, filteredRows, contractHeader, fechaDesdeHeader, fechaHastaHeader, fechaEnvioHeader, potenciaHeaderMain])

  // Contratos por año (lista) para mostrar bajo cada tarjeta del panel CAP
  const yearlyContracts = React.useMemo(() => {
    const map = new Map<number, string[]>()
    if (!filteredData || !contractHeader) return map

    // Basado en filas visibles actualmente
    const tmp = new Map<number, Set<string>>()
    for (const r of filteredRows) {
      // Fecha de referencia por orden: Fecha desde -> Fecha hasta -> Fecha envío a facturar
      const dDesde = fechaDesdeHeader ? parseDateLoose(r[fechaDesdeHeader]) : null
      const dHasta = (!dDesde && fechaHastaHeader) ? parseDateLoose(r[fechaHastaHeader]) : null
      const dEnvio = (!dDesde && !dHasta && fechaEnvioHeader) ? parseDateLoose(r[fechaEnvioHeader]) : null
      const d = dDesde || dHasta || dEnvio || null
      if (!d) continue
      const year = d.getFullYear()
      if (!Number.isFinite(year)) continue

      if (!tmp.has(year)) tmp.set(year, new Set<string>())
      const c = String(r[contractHeader] ?? '').trim()
      if (c) tmp.get(year)!.add(c)
    }

    for (const [y, set] of tmp.entries()) {
      // Orden alfabético natural simple
      map.set(y, Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })))
    }
    return map
  }, [filteredData, filteredRows, contractHeader, fechaDesdeHeader, fechaHastaHeader, fechaEnvioHeader])

  // Años expandidos para ver contratos dentro del panel CAP
  const [expandedYears, setExpandedYears] = React.useState<Set<number>>(new Set())
  const toggleYearExpanded = React.useCallback((y: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev)
      if (next.has(y)) next.delete(y)
      else next.add(y)
      return next
    })
  }, [])


  // Duración total por contrato: desde primera "Fecha desde" hasta última "Fecha hasta"
  const plural = (n: number, s: string, p: string) => (n === 1 ? s : p)
  const diffMonthsDays = (start: Date, end: Date) => {
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    let anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
    if (anchor > end) {
      months--
      anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
    }
    const days = Math.max(0, Math.floor((end.getTime() - anchor.getTime()) / 86400000))
    const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
    return { months, days, totalDays }
  }

  const contractDurationText = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!filteredData || !contractHeader || !fechaDesdeHeader || !fechaHastaHeader) return map
    const acc = new Map<string, { minDesde: Date | null, maxHasta: Date | null }>()
    for (const r of filteredRows) {
      const key = String(r[contractHeader] ?? '').trim()
      const dDesde = parseDateLoose(r[fechaDesdeHeader])
      const dHasta = parseDateLoose(r[fechaHastaHeader])
      if (!acc.has(key)) acc.set(key, { minDesde: null, maxHasta: null })
      const cur = acc.get(key)!
      if (dDesde && (!cur.minDesde || dDesde < cur.minDesde)) cur.minDesde = dDesde
      if (dHasta && (!cur.maxHasta || dHasta > cur.maxHasta)) cur.maxHasta = dHasta
    }
    for (const [key, { minDesde, maxHasta }] of acc) {
      if (minDesde && maxHasta && maxHasta >= minDesde) {
        const { months, days } = diffMonthsDays(minDesde, maxHasta)
        const years = Math.floor(months / 12)
        const remMonths = months % 12
        const parts: string[] = []
        if (years > 0) parts.push(`${years} ${plural(years, 'año', 'años')}`)
        if (remMonths > 0) parts.push(`${remMonths} ${plural(remMonths, 'mes', 'meses')}`)
        if (days > 0) parts.push(`${days} ${plural(days, 'día', 'días')}`)
        if (parts.length === 0) parts.push('0 días')
        let text: string
        if (parts.length === 1) text = parts[0]
        else if (parts.length === 2) text = parts.join(' y ')
        else text = parts.slice(0, -1).join(', ') + ' y ' + parts[parts.length - 1]
        map.set(key, text)
      } else {
        map.set(key, '')
      }
    }
    return map
  }, [filteredRows, contractHeader, fechaDesdeHeader, fechaHastaHeader])


  // Índice de CUPS para insertar la columna a su derecha
  const cupsIndex = React.useMemo(() => (filteredData ? filteredData.headers.findIndex(h => (h || '').toString().toLowerCase().trim() === 'cups') : -1), [filteredData])

  // (Eliminado panel "Información de Contratos" y su cálculo asociado)

  // (Eliminado totalPotencia por no usarse actualmente)

  // Contar cuántas veces hubo cambio de Potencia (kW) por contrato (transiciones)
  const totalCambiosPotencia = React.useMemo(() => {
    if (!filteredData) return 0
    // Tomamos una cabecera de potencia principal para evaluar cambios
    const potenciaHeader = filteredData.headers.find(h => isPotenciaHeader(h))
    if (!potenciaHeader) return 0

    let cambios = 0

    if (contractHeader) {
      const lastByContract = new Map<string, number | undefined>()
      for (const r of filteredRows) {
        const contractKey = String(r[contractHeader] ?? '').trim()
        const current = normalizeNumber(String(r[potenciaHeader] ?? ''))
        const prev = lastByContract.get(contractKey)
        if (Number.isFinite(current) && Number.isFinite(prev) && current !== prev) {
          cambios++
        }
        if (Number.isFinite(current)) {
          lastByContract.set(contractKey, current)
        }
      }
    } else {
      // Sin contrato: contar cambios globales por fila
      let prev: number | undefined = undefined
      for (const r of filteredRows) {
        const current = normalizeNumber(String(r[potenciaHeader] ?? ''))
        if (Number.isFinite(current) && Number.isFinite(prev) && current !== prev) {
          cambios++
        }
        if (Number.isFinite(current)) prev = current
      }
    }

    return cambios
  }, [filteredRows, filteredData, contractHeader])

  const handleOrdenar = React.useCallback(() => {
    if (!filteredData || ordenado) return
    const tipoHeader = filteredData.headers.find(h => isTipoFacturaHeader(h))
    // Solo anulamos por Tipo de factura para: Factura complementaria, Enviado a facturar, Anulada
    if (!tipoHeader) return
  const valoresAnularTipo = new Set(['factura complementaria','anulada','enviado a facturar','enviada a facturar','enviado a facturacion','enviada a facturacion'])
    // Usar filteredData.rows para trabajar con datos ya filtrados (sin columna autofactura)
  const originales = filteredData.rows
  const restantes: Record<string,string>[] = []
  const eliminadas: Record<string,string>[] = []
    let count = 0
    let comp = 0, anul = 0, enviados = 0
    for (const r of originales) {
      const tipo = normalizeLabel(r[tipoHeader])
      const porTipo = valoresAnularTipo.has(tipo) ||
        ((tipo.includes('factura') || tipo.includes('fact')) && (tipo.includes('complementaria') || tipo.includes('complem') || tipo.includes('compl'))) ||
        (tipo.includes('envi') && tipo.includes('factur')) ||
        (tipo.includes('anulad'))
      if (porTipo) {
        count++
        if ((tipo.includes('factura') || tipo.includes('fact')) && (tipo.includes('complementaria') || tipo.includes('complem') || tipo.includes('compl'))) comp++
        else if (tipo.includes('envi') && tipo.includes('factur')) enviados++
        else if (tipo.includes('anulad')) anul++
        eliminadas.push(r)
        continue
      }
      restantes.push(r)
    }
    setFilteredRows(restantes)
    setKeptRows(restantes)
    setRemovedRows(eliminadas)
    setAnuladas(count)
    setDetalleAnuladas({ comp, anuladas: anul, enviados })
    setOrdenado(true)
    setViewMode('restantes')
  }, [filteredData, ordenado])

  const toggleView = React.useCallback(() => {
    if (!ordenado) return
    if (viewMode === 'restantes') {
      setFilteredRows(removedRows)
      setViewMode('filtradas')
      setActiveTab('eliminadas')
    } else {
      setFilteredRows(keptRows)
      setViewMode('restantes')
      setActiveTab('vista')
    }
  }, [ordenado, viewMode, removedRows, keptRows])

  // Cambiar pestañas entre Vista previa y Eliminadas
  const setTab = React.useCallback((tab: 'vista' | 'eliminadas') => {
    if (!ordenado) return
    setActiveTab(tab)
    if (tab === 'vista') {
      setFilteredRows(keptRows)
      setViewMode('restantes')
    } else {
      setFilteredRows(removedRows)
      setViewMode('filtradas')
    }
  }, [ordenado, keptRows, removedRows])

  // Eliminar datos ATR cargados y redirigir a exportación
  const handleEliminar = React.useCallback(() => {
    const ok = window.confirm('¿Eliminar los datos ATR cargados? Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      localStorage.removeItem('valorApp.analisis.atrCsv')
    } catch {
      // ignorar errores de almacenamiento
    }
    // Limpiar estados locales y navegar a exportación
    setFilteredRows([])
    setAnuladas(0)
    setDetalleAnuladas({ comp: 0, anuladas: 0, enviados: 0 })
    setOrdenado(false)
    window.location.hash = '#/export-saldo-atr'
  }, [])

  // Botón: Filtrar (selecciona por cualquier columna que contenga Complementaria / Enviado a facturar / Anulada / Anuladora y abre ventana con filtradas)
  const handleFiltrar = React.useCallback(() => {
    if (!filteredData) return
    // Criterios: detectar por cualquier columna usando la heurística classifyLabel
  // Tomar como base las filas restantes (keptRows) para no volver a previsualizar anuladas
  const originales = keptRows.length > 0 ? keptRows : (filteredRows.length > 0 ? filteredRows : filteredData.rows)
    const seleccionadas: Record<string,string>[] = []
    let comp = 0, anul = 0, enviados = 0

    for (const r of originales) {
      let claseDetectada: ClaseObjetivo = null
      // Recorremos todas las columnas para encontrar la primera coincidencia significativa
      for (const h of filteredData.headers) {
        const v = String(r[h] ?? '')
        const c = classifyLabel(v)
        if (c === 'comp' || c === 'envi' || c === 'anul') {
          // Priorizamos: compl > envi > anul para recuentos
          if (claseDetectada === null) claseDetectada = c
          else if (claseDetectada !== 'comp' && c === 'comp') claseDetectada = 'comp'
          else if (claseDetectada === 'anul' && c === 'envi') claseDetectada = 'envi'
        }
      }
      if (claseDetectada) {
        if (claseDetectada === 'comp') comp++
        else if (claseDetectada === 'envi') enviados++
        else if (claseDetectada === 'anul') anul++
        seleccionadas.push(r)
      }
    }

    setRemovedRows(seleccionadas)
    setDetalleAnuladas({ comp, anuladas: anul, enviados })
    setAnuladas(seleccionadas.length)
    setOrdenado(true)
    setShowFilteredModal(true)
    // Mantener la vista principal en "restantes"; las filtradas se muestran en el modal
    setActiveTab('vista')
    setViewMode('restantes')
  }, [filteredData])

  // Nuevo: Anular/copiar por Estado de medida o Tipo de factura y pasar a pestaña Eliminadas
  const handleAnularEstadoTipo = React.useCallback(() => {
    if (!filteredData) return
    const tipoHeader = filteredData.headers.find(h => isTipoFacturaHeader(h))
    const estadoHeader = filteredData.headers.find(h => isEstadoMedidaHeader(h))
    if (!tipoHeader && !estadoHeader) {
      window.alert('No se encontraron columnas "Tipo de factura" ni "Estado de medida" en el archivo.')
      return
    }

    const mustTipo = new Set([
      'factura complementaria',
      'enviado a facturar',
      'enviada a facturar',
      'enviado a facturacion',
      'enviada a facturacion',
      'anulada'
    ])
    const originales = filteredData.rows
    const seleccionadas: Record<string,string>[] = []
    let comp = 0, anul = 0, enviados = 0

    for (const r of originales) {
      let match: ClaseObjetivo | null = null
      // Revisar columnas objetivo
      if (tipoHeader) {
        const t = normalizeLabel(String(r[tipoHeader] ?? ''))
        if (
          mustTipo.has(t) ||
          ((t.includes('factura') || t.includes('fact')) && (t.includes('complementaria') || t.includes('complem') || t.includes('compl')))
          || (t.includes('envi') && t.includes('factur'))
          || t.includes('anulad')
        ) {
          // Clasificar prioridad: compl > envi > anul
          if ((t.includes('factura') || t.includes('fact')) && (t.includes('complementaria') || t.includes('complem') || t.includes('compl'))) match = 'comp'
          else if (t.includes('envi') && t.includes('factur')) match = 'envi'
          else if (t.includes('anulad')) match = 'anul'
        }
      }
      if (!match && estadoHeader) {
        const e = normalizeLabel(String(r[estadoHeader] ?? ''))
        if (e.includes('anulad')) match = 'anul'
      }
      // Respaldo: buscar por cualquier columna con classifyLabel
      if (!match) {
        for (const h of filteredData.headers) {
          const c = classifyLabel(String(r[h] ?? ''))
          if (c === 'comp' || c === 'envi' || c === 'anul') {
            // Priorización: comp > envi > anul
            match = c
            if (match === 'comp') break
          }
        }
      }
      if (match) {
        if (match === 'comp') comp++
        else if (match === 'envi') enviados++
        else if (match === 'anul') anul++
        seleccionadas.push(r)
      }
    }

    if (seleccionadas.length === 0) {
      window.alert('No se encontraron filas para anular con los criterios indicados.')
      return
    }

    setAnularPreviewRows(seleccionadas)
    setAnularPreviewDetalle({ comp, anuladas: anul, enviados })
    setShowAnularPreview(true)
  }, [filteredData])

  if (!filteredData || !filteredData.headers?.length) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        background: 'linear-gradient(135deg, #0000D0 0%, #2929E5 50%, #5252FF 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(255,49,132,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 10,
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', marginBottom: '1rem', color: '#0000D0', fontWeight: 800, letterSpacing: '-0.01em' }}>Sin datos de ATR</h1>
          <p style={{ color: '#2929E5', fontSize: '1.125rem', marginBottom: '2rem', fontWeight: 500 }}>Primero exporta un archivo ATR.CSV a la aplicación.</p>
          <a 
            href="#/export-saldo-atr"
            style={{ 
              display: 'inline-block',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              padding: '1rem 2rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 25px -8px rgba(255, 49, 132, 0.6)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(255, 49, 132, 0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(255, 49, 132, 0.6)';
            }}
          >Ir a exportar</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      paddingBottom: '70px' // Espacio para bottom bar
    }}>
      {/* Panel lateral izquierdo: Resumen por año (contenido visible cuando showYearPanel = true) */}
      {showYearPanel && (
        <div style={{
          position: 'fixed',
          left: 10,
          top: 12,
          bottom: 86, // deja espacio a la bottom bar
          zIndex: 900,
          display: 'flex',
          alignItems: 'stretch'
        }}>
          <div style={{
            width: 360,
            maxWidth: '92vw',
            height: '100%',
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '0.75rem 0.875rem',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, rgba(0,0,208,0.06) 0%, rgba(41,41,229,0.04) 100%)'
            }}>
              <div style={{ fontWeight: 800, color: '#0000D0' }}>Cambios por año</div>
              <div style={{ fontSize: 12, color: '#334155' }}>Contratos y potencia (kW)</div>
            </div>
            <div style={{ padding: '0.5rem 0.5rem 0.75rem 0.5rem', overflow: 'auto' }}>
              {(() => {
                const years = Array.from(yearlySummary.keys()).sort((a, b) => b - a)
                if (years.length === 0) {
                  return (
                    <div style={{ padding: '0.5rem', color: '#475569', fontSize: 13 }}>
                      No hay datos con fecha para resumir.
                    </div>
                  )
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {years.map(y => {
                      const s = yearlySummary.get(y)!
                      return (
                        <div key={y} style={{
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: 10,
                          padding: '0.625rem 0.75rem',
                          background: 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>Año {y}</div>
                              {/* Badges rápidos: contratos y cambios de contrato */}
                              <span style={{
                                color: '#0f172a',
                                fontSize: 12,
                                background: 'rgba(0,0,208,0.08)',
                                padding: '2px 8px',
                                borderRadius: 999,
                                border: '1px solid rgba(0,0,208,0.15)',
                                fontWeight: 700
                              }}>Contratos: {s.contratosUnicos}</span>
                              <span style={{
                                color: '#0f172a',
                                fontSize: 12,
                                background: 'rgba(0,0,208,0.08)',
                                padding: '2px 8px',
                                borderRadius: 999,
                                border: '1px solid rgba(0,0,208,0.15)',
                                fontWeight: 700
                              }}>Cambios contrato: {s.cambiosContrato}</span>
                              <button
                                type="button"
                                onClick={() => toggleYearExpanded(y)}
                                style={{
                                  border: '1px solid rgba(0,0,0,0.12)',
                                  background: expandedYears.has(y) ? 'rgba(0,0,208,0.08)' : '#ffffff',
                                  color: '#0f172a',
                                  borderRadius: 8,
                                  padding: '0.25rem 0.5rem',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title={expandedYears.has(y) ? 'Ocultar contratos del año' : 'Ver contratos del año'}
                              >{expandedYears.has(y) ? 'Ocultar contratos' : 'Ver contratos'}</button>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{s.total} filas</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                            <div style={{
                              background: 'rgba(0,0,208,0.06)',
                              border: '1px solid rgba(0,0,208,0.12)',
                              borderRadius: 8,
                              padding: '0.5rem'
                            }}>
                              <div style={{ fontSize: 12, color: '#334155' }}>Contratos diferentes</div>
                              <div style={{ fontWeight: 900, color: '#0000D0', fontSize: 18 }}>{s.contratosUnicos}</div>
                              <div style={{ fontSize: 12, color: '#334155' }}>Cambios de contrato</div>
                              <div style={{ fontWeight: 800, color: '#0000D0' }}>{s.cambiosContrato}</div>
                            </div>
                            <div style={{
                              background: 'rgba(255,49,132,0.06)',
                              border: '1px solid rgba(255,49,132,0.12)',
                              borderRadius: 8,
                              padding: '0.5rem'
                            }}>
                              <div style={{ fontSize: 12, color: '#334155' }}>Potencias diferentes (kW)</div>
                              <div style={{ fontWeight: 900, color: '#FF3184', fontSize: 18 }}>{s.potenciasUnicas}</div>
                              <div style={{ fontSize: 12, color: '#334155' }}>Cambios de potencia</div>
                              <div style={{ fontWeight: 800, color: '#FF3184' }}>{s.cambiosPotencia}</div>
                            </div>
                          </div>
                          {/* Línea de resumen bajo el año */}
                          <div style={{ marginTop: 6, fontSize: 12, color: '#334155' }}>
                            Contratos en {y}: <strong style={{ color: '#0000D0' }}>{s.contratosUnicos}</strong>
                          </div>
                          {expandedYears.has(y) && (
                            <div style={{
                              marginTop: 8,
                              borderTop: '1px solid rgba(0,0,0,0.06)',
                              paddingTop: 8,
                              maxHeight: 140,
                              overflow: 'auto'
                            }}>
                              <div style={{ fontSize: 12, color: '#334155', marginBottom: 6, fontWeight: 700 }}>Contratos del año</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(yearlyContracts.get(y) || []).map((c, idx) => (
                                  <span key={idx} style={{
                                    background: 'rgba(0,0,208,0.06)',
                                    color: '#0f172a',
                                    border: '1px solid rgba(0,0,208,0.12)',
                                    borderRadius: 999,
                                    padding: '2px 8px',
                                    fontSize: 12,
                                    fontWeight: 700
                                  }}>{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal (a ancho completo tras quitar sidebar) */}
      <div style={{ 
        flex: 1,
        padding: '0.875rem 1rem',
        overflow: 'hidden'
      }}>
        {anuladas > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
            border: '1.5px solid rgba(0, 200, 83, 0.25)',
            padding: '0.75rem 1rem',
            borderRadius: 10,
            marginBottom: '0.875rem',
            marginLeft: '0.5rem',
            marginRight: '0.5rem',
            color: '#059669',
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.5,
            boxShadow: '0 2px 8px rgba(0, 200, 83, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem' }}>✓</span>
            <strong>Se han filtrado {anuladas} factura{anuladas === 1 ? '' : 's'} del listado.</strong>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Detalle: Factura complementaria: {detalleAnuladas.comp} | Enviadas a facturar: {detalleAnuladas.enviados} | Anuladas/Anuladoras: {detalleAnuladas.anuladas}
          </span>
        </div>
      )}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '0.875rem', 
        marginBottom: '0.875rem',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '0.875rem 1rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 208, 0.06)',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 'clamp(1.375rem, 3.5vw, 1.875rem)', 
            margin: '0 0 0.25rem 0', 
            color: '#0000D0', 
            fontWeight: 700, 
            letterSpacing: '-0.01em',
            fontFamily: "'Lato', sans-serif"
          }}>Vista previa ATR</h1>
          <p style={{ fontSize: '0.875rem', margin: 0, color: '#64748b', fontWeight: 500 }}>
            <span style={{ 
              background: 'rgba(0, 0, 208, 0.08)', 
              padding: '0.25rem 0.625rem', 
              borderRadius: '6px',
              display: 'inline-block',
              color: '#0000D0',
              fontWeight: 600,
              fontSize: '0.8125rem'
            }}>{total} {total === 1 ? 'fila' : 'filas'}</span>
            {ordenado && (
              <span style={{ 
                marginLeft: '0.5rem',
                background: viewMode === 'filtradas' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(0, 0, 208, 0.08)',
                padding: '0.25rem 0.625rem', 
                borderRadius: '6px',
                display: 'inline-block',
                color: viewMode === 'filtradas' ? '#16a34a' : '#0000D0',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}>{viewMode === 'filtradas' ? 'Viendo filtradas' : 'Viendo restantes'}</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Botón 'Filtrar' eliminado por solicitud */}
          {/* Pestañas: Vista previa | Eliminadas */}
          {ordenado && (
            <div style={{
              display: 'inline-flex',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: 10,
              padding: 4,
              marginRight: 8
            }}>
              <button
                type="button"
                onClick={() => setTab('vista')}
                style={{
                  borderRadius: 8,
                  padding: '0.5rem 0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: activeTab === 'vista' ? '#FFFFFF' : '#1e293b',
                  background: activeTab === 'vista' ? '#0000D0' : 'transparent'
                }}
              >Vista previa</button>
              {removedRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTab('eliminadas')}
                  style={{
                    borderRadius: 8,
                    padding: '0.5rem 0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: activeTab === 'eliminadas' ? '#FFFFFF' : '#1e293b',
                    background: activeTab === 'eliminadas' ? '#0000D0' : 'transparent'
                  }}
                >Eliminadas</button>
              )}
            </div>
          )}
          {/* Botón para anular por Estado/Tipo con confirmación previa */}
          <button
            type="button"
            onClick={handleAnularEstadoTipo}
            style={{
              borderRadius: 10,
              padding: '0.625rem 1.25rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 800,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              boxShadow: '0 4px 12px -2px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              fontFamily: "'Open Sans', sans-serif"
            }}
            title="Previsualizar y anular por Tipo de factura (complementaria, enviado a facturar, anulada) o Estado de medida (anulada/anuladora)"
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(239, 68, 68, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(239, 68, 68, 0.35)';
            }}
          >Anular por Estado/Tipo</button>
          {/* Botón "Anular por Estado/Tipo" desactivado por solicitud */}
          {ordenado && removedRows.length > 0 && (
            <button
              type="button"
              onClick={toggleView}
              style={{
                borderRadius: 10,
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                boxShadow: '0 4px 12px -2px rgba(34, 197, 94, 0.35)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                fontFamily: "'Open Sans', sans-serif"
              }}
              title={viewMode === 'restantes' ? 'Ver facturas filtradas' : 'Ver restantes'}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(34, 197, 94, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(34, 197, 94, 0.35)';
              }}
            >{viewMode === 'restantes' ? 'Ver filtradas' : 'Ver restantes'}</button>
          )}
          {ordenado && removedRows.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFilteredModal(true)}
              style={{
                borderRadius: 10,
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                boxShadow: '0 4px 12px -2px rgba(14, 165, 233, 0.35)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                fontFamily: "'Open Sans', sans-serif"
              }}
              title="Ver facturas filtradas en ventana"
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(14, 165, 233, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(14, 165, 233, 0.35)';
              }}
            >Ver filtradas (ventana)</button>
          )}
          <a 
            href="#/export-saldo-atr"
            style={{ 
              borderRadius: 10,
              padding: '0.625rem 1.25rem',
              background: '#0000D0',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 208, 0.35)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'inline-block',
              fontFamily: "'Open Sans', sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0000B8';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0, 0, 208, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0000D0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 208, 0.35)';
            }}
          >Re-exportar</a>
          <a 
            href="#/analisis-expediente"
            style={{ 
              borderRadius: 10,
              padding: '0.625rem 1.25rem',
              background: 'transparent',
              border: '1.5px solid rgba(0, 0, 208, 0.25)',
              color: '#0000D0',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'inline-block',
              fontFamily: "'Open Sans', sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 0, 208, 0.06)';
              e.currentTarget.style.borderColor = '#0000D0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 208, 0.25)';
            }}
          >← Volver</a>
        </div>
      </div>
      <div style={{ 
        color: '#64748b', 
        fontSize: '0.8125rem', 
        marginBottom: '0.75rem',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        background: 'rgba(0, 0, 208, 0.04)',
        padding: '0.625rem 0.875rem',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 208, 0.08)',
        fontFamily: "'Open Sans', sans-serif",
        lineHeight: 1.5
      }}>
        <strong style={{ color: '#475569' }}>Nota:</strong> Se resaltan cambios de <strong style={{ color: '#0000D0' }}>Contrato ATR</strong> y <strong style={{ color: '#FF3184' }}>Potencia (kW)</strong> respecto a la fila anterior.
      </div>

      <div style={{ 
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        overflowY: 'auto', 
        overflowX: 'auto', 
        border: '1.5px solid rgba(0, 0, 208, 0.1)', 
        borderRadius: 12, 
        background: '#FFFFFF', 
        boxShadow: '0 2px 8px rgba(0, 0, 208, 0.06)', 
        maxHeight: 'calc(100vh - 300px)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ 
                position: 'sticky', 
                left: 0, 
                top: 0, 
                zIndex: 3, 
                background: 'linear-gradient(135deg, rgba(0, 0, 208, 0.06) 0%, rgba(41, 41, 229, 0.04) 100%)', 
                borderRight: '1.5px solid rgba(0, 0, 208, 0.12)', 
                color: '#0000D0', 
                padding: '0.625rem 0.875rem',
                fontWeight: 700,
                fontSize: '0.8125rem',
                fontFamily: "'Lato', sans-serif"
              }}></th>
              {filteredData.headers.map((h, idx) => (
                <React.Fragment key={idx}>
                  <th style={{ 
                    padding: '0.625rem 0.875rem', 
                    borderBottom: '1.5px solid rgba(0, 0, 208, 0.12)', 
                    borderRight: '1px solid rgba(0, 0, 208, 0.06)', 
                    color: '#0000D0', 
                    background: 'linear-gradient(135deg, rgba(0, 0, 208, 0.06) 0%, rgba(41, 41, 229, 0.04) 100%)', 
                    textAlign: 'left', 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 2,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontFamily: "'Lato', sans-serif"
                  }}>{h || '\u00A0'}</th>
                  {idx === cupsIndex && (
                    <th style={{ 
                      padding: '0.625rem 0.875rem', 
                      borderBottom: '1.5px solid rgba(0, 0, 208, 0.12)', 
                      borderRight: '1px solid rgba(0, 0, 208, 0.06)', 
                      color: '#0000D0', 
                      background: 'linear-gradient(135deg, rgba(0, 0, 208, 0.06) 0%, rgba(41, 41, 229, 0.04) 100%)', 
                      textAlign: 'left', 
                      position: 'sticky', 
                      top: 0, 
                      zIndex: 2,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      fontFamily: "'Lato', sans-serif"
                    }}>
                      Duración total del contrato
                    </th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => {
              const prev = i > 0 ? filteredRows[i - 1] : null
              const contractKey = contractHeader ? String(r[contractHeader] ?? '').trim() : ''
              const rowBg = contractColorMap.get(contractKey)
              return (
                <tr key={i} style={{ background: rowBg || (i % 2 === 0 ? '#ffffff' : 'rgba(0, 0, 208, 0.02)') }}>
                  <td style={{ 
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 1, 
                    background: rowBg || (i % 2 === 0 ? 'rgba(0, 0, 208, 0.02)' : 'rgba(0, 0, 208, 0.04)'), 
                    borderRight: '1px solid rgba(0, 0, 208, 0.08)', 
                    color: '#64748b', 
                    padding: '0.5rem 0.75rem', 
                    textAlign: 'right',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    fontFamily: "'Open Sans', sans-serif"
                  }}>
                    {i + 1}
                  </td>
                  {filteredData.headers.map((h, j) => {
                    const val = String(r[h] ?? '')
                    const prevVal = prev ? String(prev[h] ?? '') : ''
                    const contrato = isContratoHeader(h)
                    const potencia = isPotenciaHeader(h)
                    let changed = false
                    if (prev) {
                      if (contrato) {
                        changed = val.trim() !== prevVal.trim()
                      } else if (potencia) {
                        const a = normalizeNumber(val)
                        const b = normalizeNumber(prevVal)
                        changed = Number.isFinite(a) && Number.isFinite(b) ? a !== b : val.trim() !== prevVal.trim()
                      }
                    }
                    // Colores corporativos para cambios: contrato -> Primary #0000D0, potencia -> Secondary #FF3184
                    const color = changed ? (contrato ? '#0000D0' : '#FF3184') : '#1e293b'
                    // Fondos corporativos para cambios: contrato -> azul suave, potencia -> rosa suave
                    const bg = changed && contrato 
                      ? 'rgba(0, 0, 208, 0.08)' 
                      : changed && potencia 
                        ? 'rgba(255, 49, 132, 0.08)' 
                        : (rowBg || undefined)
                    const fontWeight = changed ? 700 : 400
                    const isFechaEnvio = isFechaEnvioHeader(h)
                    const isFechaDesde = isFechaDesdeHeader(h)
                    const isFechaHasta = isFechaHastaHeader(h)
                    const isDateCol = isFechaEnvio || isFechaDesde || isFechaHasta
                    const isNumeric = !isDateCol && (potencia || /^-?[0-9.,]+$/.test(val))
                    const align = isNumeric ? 'right' as const : 'left' as const
                    const display = isDateCol
                      ? formatDateES(r[h])
                      : (isNumeric && !isNaN(normalizeNumber(val))
                        ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(normalizeNumber(val))
                        : val)
                    return (
                      <React.Fragment key={j}>
                        <td style={{ 
                          padding: '0.5rem 0.75rem', 
                          borderTop: '1px solid rgba(0, 0, 208, 0.06)', 
                          borderRight: '1px solid rgba(0, 0, 208, 0.06)', 
                          color, 
                          background: bg, 
                          fontWeight, 
                          textAlign: align,
                          fontSize: '0.8125rem',
                          transition: 'background 0.15s ease',
                          fontFamily: "'Open Sans', sans-serif"
                        }}>
                          {display}
                        </td>
                        {j === cupsIndex && (
                          <td style={{ 
                            padding: '0.5rem 0.75rem', 
                            borderTop: '1px solid rgba(0, 0, 208, 0.06)', 
                            borderRight: '1px solid rgba(0, 0, 208, 0.06)', 
                            color: '#0000D0', 
                            background: rowBg || undefined, 
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            fontFamily: "'Open Sans', sans-serif"
                          }}>
                            {contractDurationText.get(contractKey) || ''}
                          </td>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      </div> {/* Cierre del contenido principal */}

      {/* Modal de facturas filtradas */}
      {showFilteredModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            width: 'min(1200px, 96vw)',
            maxHeight: '80vh',
            background: '#FFFFFF',
            borderRadius: 12,
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <div style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(0, 0, 208, 0.06) 0%, rgba(41, 41, 229, 0.04) 100%)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0000D0', fontWeight: 800, fontFamily: "'Lato', sans-serif" }}>
                  Facturas filtradas
                </h3>
                <div style={{ marginTop: 4, fontSize: '0.8125rem', color: '#334155' }}>
                  Total: <strong>{removedRows.length}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFilteredModal(false)}
                style={{
                  borderRadius: 8,
                  padding: '0.5rem 0.875rem',
                  background: '#0000D0',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px -2px rgba(0, 0, 208, 0.35)'
                }}
              >Cerrar</button>
            </div>
            <div style={{ padding: '0.75rem 0.75rem 1rem 0.75rem', overflow: 'auto' }}>
              <div style={{ minWidth: '900px' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      {filteredData.headers.map((h, idx) => (
                        <th key={idx} style={{
                          padding: '0.5rem 0.75rem',
                          borderBottom: '1px solid rgba(0,0,0,0.08)',
                          textAlign: 'left',
                          color: '#0000D0',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          background: 'rgba(0,0,0,0.02)'
                        }}>{h || '\u00A0'}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {removedRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(0,0,0,0.02)' }}>
                        {filteredData.headers.map((h, j) => {
                          const val = String(r[h] ?? '')
                          const isFecha = isFechaEnvioHeader(h) || isFechaDesdeHeader(h) || isFechaHastaHeader(h)
                          const isNumeric = !isFecha && (/^-?[0-9.,]+$/.test(val) || isPotenciaHeader(h))
                          const align = isNumeric ? 'right' as const : 'left' as const
                          const display = isFecha
                            ? formatDateES(r[h])
                            : (isNumeric && !isNaN(normalizeNumber(val))
                              ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(normalizeNumber(val))
                              : val)
                          return (
                            <td key={j} style={{
                              padding: '0.5rem 0.75rem',
                              borderTop: '1px solid rgba(0,0,0,0.06)',
                              borderRight: '1px solid rgba(0,0,0,0.04)',
                              color: '#1e293b',
                              textAlign: align,
                              fontSize: '0.8125rem'
                            }}>
                              {display}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de previsualización para anular por Estado/Tipo */}
      {showAnularPreview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 2100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            width: 'min(1200px, 96vw)', maxHeight: '80vh', background: '#fff', borderRadius: 12,
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <div style={{
              padding: '0.875rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.06) 100%)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#dc2626', fontWeight: 900, fontFamily: "'Lato', sans-serif" }}>
                  Previsualización de anulación
                </h3>
                <div style={{ marginTop: 4, fontSize: '0.8125rem', color: '#334155' }}>
                  Se encontraron <strong>{anularPreviewRows.length}</strong> filas a anular. Detalle: Complementaria: <strong>{anularPreviewDetalle.comp}</strong> · Enviado a facturar: <strong>{anularPreviewDetalle.enviados}</strong> · Anulada/Anuladora: <strong>{anularPreviewDetalle.anuladas}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAnularPreview(false)}
                style={{ borderRadius: 8, padding: '0.5rem 0.875rem', background: '#64748b', border: 'none', color: '#fff', fontWeight: 700 }}
              >Cerrar</button>
            </div>
            <div style={{ padding: '0.75rem', overflow: 'auto' }}>
              <div style={{ minWidth: '900px' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      {filteredData!.headers.map((h, idx) => (
                        <th key={idx} style={{
                          padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(0,0,0,0.08)', textAlign: 'left', color: '#0000D0',
                          fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', background: 'rgba(0,0,0,0.02)'
                        }}>{h || '\u00A0'}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {anularPreviewRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(0,0,0,0.02)' }}>
                        {filteredData!.headers.map((h, j) => {
                          const val = String(r[h] ?? '')
                          const isFecha = isFechaEnvioHeader(h) || isFechaDesdeHeader(h) || isFechaHastaHeader(h)
                          const isNumeric = !isFecha && (/^-?[0-9.,]+$/.test(val) || isPotenciaHeader(h))
                          const align = isNumeric ? 'right' as const : 'left' as const
                          const display = isFecha
                            ? formatDateES(r[h])
                            : (isNumeric && !isNaN(normalizeNumber(val))
                              ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(normalizeNumber(val))
                              : val)
                          return (
                            <td key={j} style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.04)', color: '#1e293b', textAlign: align, fontSize: '0.8125rem' }}>
                              {display}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0.75rem 1rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <button type="button" onClick={() => setShowAnularPreview(false)} style={{
                borderRadius: 8, padding: '0.5rem 0.875rem', background: '#e5e7eb', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700
              }}>Cancelar</button>
              <button type="button" onClick={() => {
                // Al confirmar, mover a Eliminadas y mantener la vista en las restantes
                const originales = filteredData!.rows
                const restantes: Record<string,string>[] = []
                const eliminadas: Record<string,string>[] = []
                // Generar una clave estable por fila usando el orden actual de headers
                const rowKey = (row: Record<string,string>) => filteredData!.headers.map(h => String(row[h] ?? '')).join('||')
                const selKeys = new Set(anularPreviewRows.map(r => rowKey(r)))
                for (const r of originales) {
                  if (selKeys.has(rowKey(r))) eliminadas.push(r)
                  else restantes.push(r)
                }
                // Persistir dataset actualizado (sin anuladas)
                try {
                  localStorage.setItem('valorApp.analisis.atrCsv', JSON.stringify({
                    headers: filteredData!.headers,
                    rows: restantes
                  }))
                } catch {
                  // ignorar errores de almacenamiento
                }
                // Vista principal: mostrar restantes (las anuladas desaparecen de la vista)
                setFilteredRows(restantes)
                setKeptRows(restantes)
                // Guardar eliminadas para poder consultarlas en pestaña/modal si se desea
                setRemovedRows(eliminadas)
                setAnuladas(eliminadas.length)
                setDetalleAnuladas(anularPreviewDetalle)
                setOrdenado(true)
                setViewMode('restantes')
                setActiveTab('vista')
                // Limpiar el estado del modal de previsualización
                setShowAnularPreview(false)
                setAnularPreviewRows([])
                setAnularPreviewDetalle({ comp: 0, anuladas: 0, enviados: 0 })
              }} style={{
                borderRadius: 8, padding: '0.5rem 0.875rem', background: '#dc2626', border: 'none', color: '#fff', fontWeight: 900
              }}>Confirmar anulación</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar - Barra inferior con scroll horizontal */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, rgba(0, 0, 208, 0.96) 0%, rgba(0, 0, 180, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -4px 16px rgba(0, 0, 208, 0.2)',
        zIndex: 1000,
        borderTop: '2px solid rgba(255, 255, 255, 0.15)'
      }}>
        {/* Contenedor con scroll horizontal */}
        <div style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            minWidth: 'max-content',
            gap: '1.5rem'
          }}>
            {/* Sección izquierda - Información (columna con botón CAP arriba y datos debajo) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flexShrink: 0 }}>
              {/* Botón CAP (toggle del panel anual) */}
              <button
                type="button"
                onClick={() => setShowYearPanel(v => !v)}
                title={showYearPanel ? 'Ocultar resumen por año' : 'Mostrar resumen por año'}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: showYearPanel
                    ? 'linear-gradient(135deg, #0000D0 0%, #2929E5 100%)'
                    : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                  color: showYearPanel ? '#ffffff' : '#0f172a',
                  fontWeight: 800,
                  padding: '0.4rem 0.65rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  fontFamily: "'Lato', sans-serif"
                }}>
                {showYearPanel ? '◀ CAP' : '▶ CAP'}
              </button>
              {/* Fila de métricas principales */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '1.125rem', 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontFamily: "'Lato', sans-serif"
                }}>📊</span>
                <span style={{ 
                  color: '#FFFFFF', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  fontFamily: "'Open Sans', sans-serif",
                  whiteSpace: 'nowrap'
                }}>
                  Total: <strong style={{ fontSize: '1rem' }}>{total}</strong> {total === 1 ? 'registro' : 'registros'}
                </span>
                </div>
              
              {ordenado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', color: '#4ade80' }}>✓</span>
                  <span style={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    fontFamily: "'Open Sans', sans-serif",
                    whiteSpace: 'nowrap'
                  }}>
                    {anuladas} factura{anuladas === 1 ? '' : 's'} filtrada{anuladas === 1 ? '' : 's'}
                  </span>
                </div>
              )}
              
              {contractHeader && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontFamily: "'Open Sans', sans-serif",
                    whiteSpace: 'nowrap'
                  }}>
                    Contratos únicos: <strong style={{ color: '#FFFFFF' }}>{contractColorMap.size}</strong>
                  </span>
                </div>
              )}

              {potenciaHeaderMain && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontFamily: "'Open Sans', sans-serif",
                    whiteSpace: 'nowrap'
                  }}>
                    Potencias únicas (kW): <strong style={{ color: '#FFFFFF' }}>{potenciasUnicasVisibles}</strong>
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: "'Open Sans', sans-serif",
                  whiteSpace: 'nowrap'
                }}>
                  Cambios Potencia (kW): <strong style={{ color: '#FFFFFF' }}>{new Intl.NumberFormat('es-ES').format(totalCambiosPotencia)}</strong>
                </span>
              </div>
              </div>
            </div>
            
            {/* Sección derecha - Navegación y metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: "'Open Sans', sans-serif",
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap'
              }}>
                ValorApp ATR v1.0
              </span>
              <div style={{
                width: '1px',
                height: '24px',
                background: 'rgba(255, 255, 255, 0.2)'
              }} />
              <a
                href="#/export-saldo-atr"
                style={{
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Open Sans', sans-serif",
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                📤 Re-exportar
              </a>
              <a
                href="#/analisis-expediente"
                style={{
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Open Sans', sans-serif",
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                ← Regresar
              </a>
            </div>
          </div>
        </div>
        
        {/* Indicador de scroll (opcional) */}
        <div style={{
          height: '3px',
          background: 'rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            background: 'rgba(255, 255, 255, 0.3)',
            width: '30%',
            borderRadius: '3px'
          }} />
        </div>
      </div>
    </div>
  )
}

export default ATRPreview
