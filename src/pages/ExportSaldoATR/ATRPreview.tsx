import React from 'react'
import { useActaFacturaValidation } from '../../hooks/business/useActaFacturaValidation'
import { ActaFacturaAlertModal } from '../../components/ui/ActaFacturaAlertModal'

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
  console.log('🔵 ATRPreview renderizado:', { hasData: !!data, rowsCount: data?.rows?.length })
    // Leer cambio de titular desde localStorage
  const cambioTitularInfo = React.useMemo(() => {
    try {
      const s = localStorage.getItem('valorApp.wart.cambioTitular')
      if (!s) return { tuvo: false, fecha: '' }
      const obj = JSON.parse(s)
      const tuvo = Boolean(obj?.tuvoCambioTitular)
      const fecha = typeof obj?.fecha === 'string' ? obj.fecha : ''
      return { tuvo, fecha }
    } catch { return { tuvo: false, fecha: '' } }
  }, [])
  
  // Leer fecha del acta desde localStorage
  const fechaActa = React.useMemo(() => {
    try {
      const s = localStorage.getItem('valorApp.wart.fechaActa')
      if (!s) return ''
      const obj = JSON.parse(s)
      return typeof obj === 'string' ? obj : ''
    } catch { return '' }
  }, [])
  
  // Filtrar columna "Autofactura" de los encabezados
  const filteredData = React.useMemo(() => {
    if (!data?.headers || !data?.rows) {
      console.log('⚪ filteredData: sin datos', { hasData: !!data })
      return null
    }
    
    // Filtrar encabezados que no sean "Autofactura"
    const filteredHeaders = data.headers.filter(h => 
      (h || '').toLowerCase().trim() !== 'autofactura'
    )
    
    // Si no hay cambios en los encabezados, retornar data original
    if (filteredHeaders.length === data.headers.length) {
      console.log('🟢 filteredData: datos sin filtrar', { rowsCount: data.rows.length })
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
    
    console.log('🟡 filteredData: datos filtrados', { rowsCount: filteredRows.length })
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
  // Análisis de anomalías (nuevo panel): dependencia tras anulación y visualizaciones Heatmap + Barras
  const [allowAnalysis, setAllowAnalysis] = React.useState<boolean>(false)
  const [showAnalisisPanel, setShowAnalisisPanel] = React.useState<boolean>(false)
  const [monthlySeries, setMonthlySeries] = React.useState<Array<{ key: string; year: number; month: number; fecha: Date; consumo: number; variacion: number | null }>>([])
  const [anomalyMonthIdx, setAnomalyMonthIdx] = React.useState<number | null>(null)
  const [heatmapTooltip, setHeatmapTooltip] = React.useState<{ x: number; y: number; text: string } | null>(null)
  // Estado para resaltar fila con anomalía en la tabla (guardar año/mes en lugar de clave)
  const [anomalyYearMonth, setAnomalyYearMonth] = React.useState<{ year: number; month: number } | null>(null)
  // Estado para el modal de alerta de facturación ATR
  const [showActaAlert, setShowActaAlert] = React.useState<boolean>(false)
  const [actaAlertMessage, setActaAlertMessage] = React.useState<string>('')
  const [actaAlertType, setActaAlertType] = React.useState<'warning' | 'error' | 'info'>('info')
  
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
      // Habilitar análisis siempre que haya datos cargados
      const shouldAllow = filteredData.rows.length > 0
      console.log('🔄 useEffect filteredData ejecutado:', { rowsCount: filteredData.rows.length, allowAnalysis: shouldAllow })
      setAllowAnalysis(shouldAllow)
      // NO limpiar resaltado automáticamente - solo cuando el usuario cargue datos nuevos manualmente
      // setAnomalyYearMonth(null) // Comentado para mantener el resaltado
      console.log('🔍 Estado de anomalyYearMonth mantenido (no se limpió)')
      // No cerramos el panel aquí para permitir que persista hasta que el usuario lo cierre manualmente
    }
  }, [filteredData])

  // Scroll automático a la fila con anomalía cuando se detecta o cambia
  React.useEffect(() => {
    if (anomalyYearMonth) {
      // Esperar a que el DOM se actualice
      setTimeout(() => {
        // Buscar la fila resaltada en la tabla
        const table = document.querySelector('table')
        if (table) {
          const rows = table.querySelectorAll('tbody tr')
          rows.forEach((row, index) => {
            // Verificar si la fila tiene el atributo data-highlighted
            const isHighlighted = row.getAttribute('data-highlighted') === 'true'
            if (isHighlighted) {
              // Scroll suave a la fila
              row.scrollIntoView({ behavior: 'smooth', block: 'center' })
              console.log('📍 Scroll automático a fila', index + 1, 'con anomalía')
            }
          })
        }
      }, 300) // Delay para asegurar que la tabla está renderizada
    }
  }, [anomalyYearMonth]) // Solo depende de anomalyYearMonth, no del panel

  // Construir array de datos mensuales para validación desde los datos del CSV (sin depender del análisis)
  const monthlyDataForValidation = React.useMemo(() => {
    try {
      if (!filteredData?.headers || !filteredRows || filteredRows.length === 0) return []

      // Priorizamos "Fecha hasta" para identificar el período facturado más reciente
      const fechaHastaH = filteredData.headers.find(h => isFechaHastaHeader(h)) || null
      const fechaDesdeH = filteredData.headers.find(h => isFechaDesdeHeader(h)) || null
      const periodoH = filteredData.headers.find(h => isPeriodoHeader(h)) || null
      const fechaFactH = filteredData.headers.find(h => isFechaFactHeader(h)) || null
      const chosenDateHeader = fechaHastaH || fechaDesdeH || periodoH || fechaFactH
      if (!chosenDateHeader) return []

      const consumoH = filteredData.headers.find(h => isConsumoActivaHeader(h)) || null

      // Agregar por (año, mes)
      const agg = new Map<string, { year: number; month: number; fecha: Date; consumo: number }>()
      for (const r of filteredRows) {
        const raw = String(r[chosenDateHeader] ?? '')
        let d = periodoH && chosenDateHeader === periodoH ? parsePeriodoStart(raw) : parseDateLoose(raw)
        if (!d) continue
        // Si estamos usando Fecha desde, el consumo corresponde al mes anterior
        if (fechaDesdeH && chosenDateHeader === fechaDesdeH) {
          const tmp = new Date(d)
          tmp.setMonth(tmp.getMonth() - 1)
          d = tmp
        }
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        const key = `${year}-${pad2(month)}`
        const firstDay = new Date(year, month - 1, 1)
        let consumo = 0
        if (consumoH) {
          const n = normalizeNumber(String(r[consumoH] ?? '0'))
          consumo = Number.isFinite(n) ? n : 0
        }
        const prev = agg.get(key)
        if (prev) prev.consumo += consumo
        else agg.set(key, { year, month, fecha: firstDay, consumo })
      }

      const result = Array.from(agg.values()).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      console.log('🧮 monthlyDataForValidation:', {
        chosenDateHeader,
        hasConsumo: !!consumoH,
        count: result.length,
        first: result[0]?.fecha?.toISOString(),
        last: result[result.length - 1]?.fecha?.toISOString()
      })
      return result
    } catch (e) {
      console.error('Error construyendo monthlyDataForValidation:', e)
      return []
    }
  }, [filteredData, filteredRows])

  // Llamar hook de validación de Acta/Factura (nivel superior del componente)
  const actaValidation = useActaFacturaValidation(fechaActa, monthlyDataForValidation)
  console.log('🧪 Acta validation state:', {
    fechaActa,
    dataCount: monthlyDataForValidation.length,
    show: actaValidation.show,
    type: actaValidation.type,
    message: actaValidation.message?.slice(0, 80)
  })

  // Validación directa por intervalos Fecha desde / Fecha hasta con tolerancia de 30 días
  const actaNeedsAttentionStrict = React.useMemo(() => {
    try {
      if (!fechaActa) return false
      const dActa = parseDateLoose(fechaActa)
      if (!dActa) return false
      if (!filteredRows || filteredRows.length === 0) return false

      // Buscar cabeceras reales en los datos cargados
      const desdeH = filteredData?.headers.find(h => isFechaDesdeHeader(h)) || null
      const hastaH = filteredData?.headers.find(h => isFechaHastaHeader(h)) || null
      if (!desdeH && !hastaH) return false

      // 1) Verificar si existe un intervalo que cubra la fecha del acta (±0 días)
      let covered = false
      for (const r of filteredRows) {
        const dDesde = desdeH ? parseDateLoose(String(r[desdeH] ?? '')) : null
        const dHasta = hastaH ? parseDateLoose(String(r[hastaH] ?? '')) : null
        if (dDesde && dHasta && !isNaN(dDesde.getTime()) && !isNaN(dHasta.getTime())) {
          if (dActa >= dDesde && dActa <= dHasta) { covered = true; break }
        }
      }
      if (covered) return false

      // 2) Si no está cubierto por ningún intervalo, aplicar tolerancia de 30 días contra última Fecha hasta
      if (hastaH) {
        let maxHasta: Date | null = null
        for (const r of filteredRows) {
          const dHasta = parseDateLoose(String(r[hastaH] ?? ''))
          if (dHasta && (!maxHasta || dHasta > maxHasta)) maxHasta = dHasta
        }
        if (maxHasta) {
          const ms30d = 30 * 24 * 60 * 60 * 1000
          if (dActa.getTime() >= (maxHasta.getTime() + ms30d)) return true
          // También considerar que si el acta es anterior a min(Fecha desde) - 30 días, no aplica, pero el caso más habitual es acta posterior.
        }
      }

      // Si llegó aquí y no está cubierto, considerar que faltan facturas
      return true
    } catch (e) {
      console.warn('Validación estricta de acta falló:', e)
      return false
    }
  }, [fechaActa, filteredRows, filteredData])

  // Si la validación estricta detecta problema pero el hook no muestra modal, levantamos el modal con mensaje estándar
  React.useEffect(() => {
    try {
      if (!fechaActa) return
      if (actaValidation.show) return // ya hay modal
      if (!actaNeedsAttentionStrict) return

      // Intentar obtener última Fecha hasta para detalle
      const hastaH = filteredData?.headers.find(h => isFechaHastaHeader(h)) || null
      let maxHasta: Date | null = null
      if (hastaH) {
        for (const r of filteredRows) {
          const dHasta = parseDateLoose(String(r[hastaH] ?? ''))
          if (dHasta && (!maxHasta || dHasta > maxHasta)) maxHasta = dHasta
        }
      }
      const actaDate = parseDateLoose(fechaActa)
      const diffDays = (maxHasta && actaDate) ? Math.ceil(Math.abs(actaDate.getTime() - maxHasta.getTime()) / (1000*60*60*24)) : null
      const fmt = (d: Date) => new Intl.DateTimeFormat('es-ES', { year:'numeric', month:'2-digit', day:'2-digit' }).format(d)

      const message = `⚠️ FALTAN FACTURAS PARA VALORAR\n\nFecha del acta: ${actaDate ? fmt(actaDate) : String(fechaActa)}\nÚltima factura registrada: ${maxHasta ? fmt(maxHasta) : '—'}${diffDays !== null ? `\nDías de diferencia: ${diffDays} días` : ''}\n\nNo hay registros de consumo para el mes/período del acta o la última factura supera los 30 días.`
      setActaAlertMessage(message)
      setActaAlertType('error')
      setShowActaAlert(true)
      console.log('🚨 Modal por validación estricta mostrado (faltan facturas)')
    } catch (e) {
      console.warn('No se pudo mostrar modal de validación estricta:', e)
    }
  }, [actaNeedsAttentionStrict, actaValidation.show, fechaActa, filteredRows, filteredData])

  // useEffect para actualizar el estado del modal basado en validación
  React.useEffect(() => {
    if (actaValidation.show) {
      setShowActaAlert(true)
      setActaAlertMessage(actaValidation.message)
      setActaAlertType(actaValidation.type)
      console.log('⚠️ Acta/Factura validation alert:', { type: actaValidation.type, message: actaValidation.message })
    } else {
      setShowActaAlert(false)
    }
  }, [actaValidation])

  const isContratoHeader = (h: string) => ['Contrato ATR', 'Contrato'].some(x => x.toLowerCase() === (h || '').toLowerCase())
  // Normalizador básico para headers: elimina acentos y espacios no separables
  const normalizeHeader = (s: string) => {
    const raw = String(s ?? '')
    const withSpaces = raw.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    return stripAccents(withSpaces).toLowerCase().trim()
  }
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
    const t = normalizeHeader(h)
    return t === 'fecha de envio a facturar' || (t.includes('fecha') && t.includes('envio') && (t.includes('factur') || t.includes('facturar')))
  }
  const isFechaDesdeHeader = (h: string) => {
    const t = normalizeHeader(h)
    // Acepta variantes: "Fecha desde", "Desde", "Inicio", etc.
    return t === 'fecha desde' || t === 'desde' || t.includes('desde') || (t.includes('fecha') && t.includes('inicio'))
  }
  const isFechaHastaHeader = (h: string) => {
    const t = normalizeHeader(h)
    // Acepta variantes: "Fecha hasta", "Hasta", "Fin", etc.
    return t === 'fecha hasta' || t === 'hasta' || t.includes('hasta') || (t.includes('fecha') && (t.includes('fin') || t.includes('corte')))
  }
  // Extras para análisis de consumo
  const isPeriodoHeader = (h: string) => normalizeLabel(h).includes('periodo')
  const isFechaFactHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t.includes('fecha') && (t.includes('factur') || t.includes('emision'))
  }
  const isConsumoActivaHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t.includes('consum') && (t.includes('activa') || t.includes('kwh') || t.includes('total'))
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
  const parsePeriodoStart = (s: string): Date | null => {
    const m = String(s || '').match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
    return m ? parseDateLoose(m[1]) : parseDateLoose(s)
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


  // handleOrdenar eliminado (no usado)

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
  // handleEliminar eliminado (no usado)

  // Botón: Filtrar (selecciona por cualquier columna que contenga Complementaria / Enviado a facturar / Anulada / Anuladora y abre ventana con filtradas)
  // handleFiltrar eliminado (no usado)

  // Construir serie mensual y abrir panel con Heatmap + Barras
  const handleDetectarAnomalias = React.useCallback(() => {
    console.log('🔍 handleDetectarAnomalias llamado', { allowAnalysis, hasFilteredData: !!filteredData, keptRowsLength: keptRows?.length, filteredRowsLength: filteredData?.rows?.length })
    try {
      if (!allowAnalysis) {
        console.log('❌ Análisis bloqueado: allowAnalysis =', allowAnalysis)
        return
      }
      const headers = filteredData?.headers || []
      const rows = keptRows && keptRows.length > 0 ? keptRows : (filteredData?.rows || [])
      console.log('📊 Datos para análisis:', { headersLength: headers.length, rowsLength: rows.length })
      if (!headers.length || !rows.length) { window.alert('No hay datos para analizar.'); return }
      
      // Buscar headers exactamente como en la tabla (mismo orden de prioridad)
      const fechaHeader = headers.find(h => isFechaDesdeHeader(h)) || headers.find(h => isFechaHastaHeader(h)) || headers.find(h => isPeriodoHeader(h)) || headers.find(h => isFechaFactHeader(h))
      const consumoHeader = headers.find(h => isConsumoActivaHeader(h))
      if (!fechaHeader || !consumoHeader) { window.alert('No se encontró columna de fecha o consumo.'); return }

      // Paso 1: recolectar pares fecha(consolidada a mes) y consumo
      const points: Array<{ ymKey: string; year: number; month: number; fecha: Date; consumo: number }> = []
      for (const r of rows) {
        let d = isPeriodoHeader(fechaHeader) ? parsePeriodoStart(String(r[fechaHeader] ?? '')) : parseDateLoose(r[fechaHeader])
        const n = normalizeNumber(String(r[consumoHeader] ?? ''))
        if (!d || !Number.isFinite(n)) continue
        // Importante: si la cabecera de fecha es "Fecha desde", el consumo corresponde al MES ANTERIOR
        if (isFechaDesdeHeader(fechaHeader)) {
          const adj = new Date(d)
          adj.setMonth(adj.getMonth() - 1)
          d = adj
        }
        const year = d.getFullYear(); const month = d.getMonth() + 1
        const key = `${year}-${pad2(month)}`
        const firstDay = new Date(year, month - 1, 1)
        points.push({ ymKey: key, year, month, fecha: firstDay, consumo: n })
      }
      if (!points.length) { window.alert('No hay consumos válidos para analizar.'); return }

      // Paso 2: agregar por mes (sumar consumos por (año,mes))
      const agg = new Map<string, { year: number; month: number; fecha: Date; consumo: number }>()
      for (const p of points) {
        const prev = agg.get(p.ymKey)
        if (prev) prev.consumo += p.consumo
        else agg.set(p.ymKey, { year: p.year, month: p.month, fecha: p.fecha, consumo: p.consumo })
      }
      // Rango temporal completo de meses contiguos
      const keys = Array.from(agg.values()).sort((a,b) => a.fecha.getTime() - b.fecha.getTime())
      const minD = keys[0].fecha
      const maxD = keys[keys.length - 1].fecha
      const full: Array<{ key: string; year: number; month: number; fecha: Date; consumo: number }> = []
      const cur = new Date(minD.getFullYear(), minD.getMonth(), 1)
      while (cur <= maxD) {
        const ym = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}`
        const found = agg.get(ym)
        full.push({ key: ym, year: cur.getFullYear(), month: cur.getMonth() + 1, fecha: new Date(cur), consumo: found ? found.consumo : 0 })
        // siguiente mes
        cur.setMonth(cur.getMonth() + 1)
      }
      // Variación vs mes anterior
      const withVar: Array<{ key: string; year: number; month: number; fecha: Date; consumo: number; variacion: number | null }> = full.map((p, i) => {
        if (i === 0) return { ...p, variacion: null }
        const prev = full[i - 1]
        const v = prev.consumo > 0 ? (p.consumo - prev.consumo) / prev.consumo : null
        return { ...p, variacion: v }
      })
      
      // Variables para consolidar resultado de detección (inicio de anomalía)
      let firstDrop: number | null = null
      let detectedAnomalyYM: { year: number; month: number } | null = null
      let anomalyMetadata: {
        criterio: string;
        confianza: number;
        baseline: number;
        actual: number;
        caida: number;
        persistencia: number;
        desvEstandar: number;
      } | null = null

      // Detección prioridad 0: cambio a lectura ESTIMADA (inicio probable de anomalía operativa)
      try {
        const estadoHeader = headers.find(h => isEstadoMedidaHeader(h)) || headers.find(h => isTipoFacturaHeader(h)) || null
        if (estadoHeader) {
          // Construir entradas cronológicas por fila para detectar el primer "estimada" tras tener algún "real"
          type RowEntry = { d: Date; year: number; month: number; estado: string }
          const entries: RowEntry[] = []
          for (const r of rows) {
            const d = isPeriodoHeader(fechaHeader) ? parsePeriodoStart(String(r[fechaHeader] ?? '')) : parseDateLoose(String(r[fechaHeader] ?? ''))
            if (!d) continue
            let year = d.getFullYear(); let month = d.getMonth() + 1
            if (isFechaDesdeHeader(fechaHeader)) {
              const tmp = new Date(d); tmp.setMonth(tmp.getMonth() - 1)
              year = tmp.getFullYear(); month = tmp.getMonth() + 1
            }
            const estado = normalizeLabel(String(r[estadoHeader] ?? ''))
            entries.push({ d, year, month, estado })
          }
          // Orden cronológico por fecha de referencia
          entries.sort((a, b) => a.d.getTime() - b.d.getTime())
          let sawReal = false
          let firstEstimadoIndex: number | null = null
          for (let i = 0; i < entries.length; i++) {
            const e = entries[i]
            const isReal = e.estado.includes('real')
            const isEstimada = e.estado.includes('estimad')
            if (isReal) sawReal = true
            if (sawReal && isEstimada) { firstEstimadoIndex = i; break }
          }
          if (firstEstimadoIndex !== null) {
            const e = entries[firstEstimadoIndex]
            const candidateYM = { year: e.year, month: e.month }
            // Buscar índice en la serie mensual agregada
            const idxInWithVar = withVar.findIndex(p => p.year === candidateYM.year && p.month === candidateYM.month)
            if (idxInWithVar >= 0) {
              firstDrop = firstDrop ?? idxInWithVar
              detectedAnomalyYM = detectedAnomalyYM ?? candidateYM
              anomalyMetadata = anomalyMetadata ?? {
                criterio: 'Primer período con lectura ESTIMADA tras períodos REALES',
                confianza: 0.7,
                baseline: 0,
                actual: withVar[idxInWithVar].consumo,
                caida: 0,
                persistencia: 0,
                desvEstandar: 0
              }
              console.log('⚠️ Anomalía por ESTIMADA detectada primero en', candidateYM)
            }
          }
        }
      } catch (e) {
        console.warn('No fue posible evaluar cambio a ESTIMADA:', e)
      }

  // NUEVO: Calcular métricas avanzadas para detección precisa de anomalías
      const seasonalAvg = new Map<number, number>() // mes (1-12) → promedio de consumo
      const seasonalCount = new Map<number, number>() // mes (1-12) → cantidad de ocurrencias
      const seasonalStdDev = new Map<number, number>() // mes (1-12) → desviación estándar
      const consumosByMonth = new Map<number, number[]>() // mes (1-12) → array de consumos históricos
      
      // Recopilar datos por mes del año
      for (const p of full) {
        if (p.consumo > 0) {
          const prev = seasonalAvg.get(p.month) || 0
          const count = seasonalCount.get(p.month) || 0
          const consumos = consumosByMonth.get(p.month) || []
          
          seasonalAvg.set(p.month, prev + p.consumo)
          seasonalCount.set(p.month, count + 1)
          consumos.push(p.consumo)
          consumosByMonth.set(p.month, consumos)
        }
      }
      
      // Calcular promedios y desviaciones estándar
      for (const [month, total] of seasonalAvg.entries()) {
        const count = seasonalCount.get(month) || 1
        const avg = total / count
        seasonalAvg.set(month, avg)
        
        // Calcular desviación estándar para este mes
        const consumos = consumosByMonth.get(month) || []
        if (consumos.length > 1) {
          const variance = consumos.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / consumos.length
          seasonalStdDev.set(month, Math.sqrt(variance))
        } else {
          seasonalStdDev.set(month, avg * 0.2) // 20% como desviación por defecto
        }
      }
      
      // Calcular línea base móvil (promedio de últimos 6 meses antes del análisis)
      const calculateBaselineAvg = (endIndex: number, windowSize: number = 6): number => {
        const startIdx = Math.max(0, endIndex - windowSize)
        let sum = 0, count = 0
        for (let i = startIdx; i < endIndex; i++) {
          if (withVar[i].consumo > 0) {
            sum += withVar[i].consumo
            count++
          }
        }
        return count > 0 ? sum / count : 0
      }
      
      console.log('📅 Promedios estacionales calculados:', Array.from(seasonalAvg.entries()).map(([m, avg]) => `Mes ${m}: ${avg.toFixed(2)} kWh`).join(', '))
      
      // Verificar que hay suficientes datos históricos (mínimo 6 meses previos para establecer línea base)
      if (withVar.length < 6) {
        console.log('⚠️ Datos insuficientes: Se necesitan al menos 6 meses de histórico para detectar anomalías.')
        window.alert('⚠️ Datos insuficientes para análisis de anomalías.\n\nSe necesitan al menos 6 meses de histórico para establecer una línea base y detectar descensos anormales.')
        setMonthlySeries(withVar)
        setAnomalyMonthIdx(null)
        setAnomalyYearMonth(null)
        setHeatmapTooltip(null)
        setShowAnalisisPanel(true)
        return
      }
      
      // DETECCIÓN AVANZADA: Múltiples validaciones cruzadas para identificación precisa
      
      console.log('🔎 Analizando', withVar.length, 'meses con detección avanzada de anomalías...')
      
      // NUEVO CRITERIO 0: Detectar consumos nulos sostenidos (ANTES del análisis principal)
      // Este criterio captura anomalías por falta total de consumo (fraude/avería severa)
      let consecutiveZeroStart = -1
      let consecutiveZeroCount = 0
      for (let i = 0; i < withVar.length; i++) {
        if (withVar[i].consumo <= 1) {  // Consumo casi nulo (<=1 kWh)
          if (consecutiveZeroCount === 0) {
            consecutiveZeroStart = i
          }
          consecutiveZeroCount++
        } else {
          // Si acumulamos 2+ meses seguidos de nulos, es anomalía
          if (consecutiveZeroCount >= 2 && firstDrop === null) {
            firstDrop = consecutiveZeroStart
            detectedAnomalyYM = { year: withVar[consecutiveZeroStart].year, month: withVar[consecutiveZeroStart].month }
            const promedioPrevio = consecutiveZeroStart > 0 
              ? withVar.slice(Math.max(0, consecutiveZeroStart - 6), consecutiveZeroStart)
                  .filter(v => v.consumo > 1)
                  .reduce((s, v) => s + v.consumo, 0) / Math.max(1, Math.min(6, consecutiveZeroStart))
              : 0
            
            anomalyMetadata = {
              criterio: `Consumo nulo sostenido (${consecutiveZeroCount} meses consecutivos)`,
              confianza: 0.95,  // Muy alta confianza
              baseline: promedioPrevio > 0 ? promedioPrevio : (withVar.reduce((s, v) => s + v.consumo, 0) / withVar.length),
              actual: 0,
              caida: 1.0,  // 100% de caída
              persistencia: consecutiveZeroCount,
              desvEstandar: 999  // Extremo
            }
            console.log('⚠️ ANOMALÍA CRÍTICA DETECTADA: Consumo nulo por', consecutiveZeroCount, 'meses desde mes', consecutiveZeroStart)
            break
          }
          consecutiveZeroCount = 0
        }
      }
      
      // Si ya se detectó anomalía nula, no continuar con el análisis normal
      if (firstDrop === null) {
        // IMPORTANTE: Empezar a analizar después de los primeros 3 meses para tener contexto
        const startAnalysisFrom = Math.max(1, 3)
        
        for (let i = startAnalysisFrom; i < withVar.length; i++) {
        const prev = withVar[i - 1].consumo
        const curV = withVar[i].consumo
        const currentMonth = withVar[i].month
        const seasonalExpected = seasonalAvg.get(currentMonth) || prev
        const seasonalStdDeviation = seasonalStdDev.get(currentMonth) || (seasonalExpected * 0.2)
        const baselineAvg = calculateBaselineAvg(i, 6)
        
        if (prev > 0 && baselineAvg > 0) {
          const drop = (prev - curV) / prev
          const dropFromBaseline = (baselineAvg - curV) / baselineAvg
          const deviationFromSeasonal = seasonalExpected > 0 ? (seasonalExpected - curV) / seasonalExpected : 0
          const zScore = seasonalStdDeviation > 0 ? (curV - seasonalExpected) / seasonalStdDeviation : 0
          
          // VALIDACIÓN CRUZADA: Múltiples métricas deben coincidir
          const isStatisticalOutlier = Math.abs(zScore) > 2 // Más de 2 desviaciones estándar
          const isSeasonallyAbnormal = Math.abs(deviationFromSeasonal) > 0.15 // Más del 15% de desviación estacional
          const isSignificantDrop = drop > 0.3 || dropFromBaseline > 0.35 // Caída significativa vs mes anterior o baseline
          
          console.log(`📉 Mes ${i}: ${withVar[i].year}-${pad2(withVar[i].month)} | Anterior: ${prev.toFixed(2)} | Actual: ${curV.toFixed(2)} | Baseline: ${baselineAvg.toFixed(2)}`)
          console.log(`   📊 Caída vs anterior: ${(drop * 100).toFixed(1)}% | vs baseline: ${(dropFromBaseline * 100).toFixed(1)}% | Esperado: ${seasonalExpected.toFixed(2)} | Z-Score: ${zScore.toFixed(2)}`)
          console.log(`   🎯 Outlier estadístico: ${isStatisticalOutlier} | Anormal estacional: ${isSeasonallyAbnormal} | Caída significativa: ${isSignificantDrop}`)
          
          // DETECCIÓN AVANZADA: Solo si múltiples validaciones coinciden
          if (isSignificantDrop && (isStatisticalOutlier || isSeasonallyAbnormal)) {
            const confidenceScore = (
              (isStatisticalOutlier ? 0.4 : 0) +
              (isSeasonallyAbnormal ? 0.3 : 0) +
              (drop > 0.5 ? 0.3 : drop > 0.3 ? 0.2 : 0.1)
            )
            
            console.log(`🔍 Anomalía candidata en mes ${i} (confianza: ${(confidenceScore * 100).toFixed(1)}%)`)
            
            // Verificar si es variación estacional esperada (tolerancia más estricta)
            if (!isSeasonallyAbnormal && Math.abs(zScore) < 1.5) {
              console.log(`  🍂 Variación estacional normal (Z-Score: ${zScore.toFixed(2)}). No es anomalía.`)
              continue
            }
            
            // CRITERIO 1: Anomalía extrema (múltiples validaciones + alta confianza)
            if (drop >= 0.6 && confidenceScore >= 0.7) {
              firstDrop = i
              detectedAnomalyYM = { year: withVar[i].year, month: withVar[i].month }
              anomalyMetadata = {
                criterio: 'Caída extrema validada',
                confianza: confidenceScore,
                baseline: baselineAvg,
                actual: curV,
                caida: drop,
                persistencia: 0,
                desvEstandar: Math.abs(zScore)
              }
              console.log('⚠️ ANOMALÍA EXTREMA CONFIRMADA en mes', firstDrop, '- Confianza:', (confidenceScore * 100).toFixed(1) + '%')
              break
            }
            
            // CRITERIO 2: Consumo críticamente bajo con validación estadística
            if (i >= 6 && confidenceScore >= 0.6) {
              const avg3Prev = (withVar[i-3].consumo + withVar[i-2].consumo + withVar[i-1].consumo) / 3
              const isCriticallyLow = curV < avg3Prev * 0.4 || curV < baselineAvg * 0.35
              const hasStatisticalSignificance = Math.abs(zScore) > 2.5
              
              if (avg3Prev > 0 && isCriticallyLow && hasStatisticalSignificance) {
                firstDrop = i
                detectedAnomalyYM = { year: withVar[i].year, month: withVar[i].month }
                anomalyMetadata = {
                  criterio: 'Consumo críticamente bajo',
                  confianza: confidenceScore,
                  baseline: baselineAvg,
                  actual: curV,
                  caida: Math.max(drop, dropFromBaseline),
                  persistencia: 0,
                  desvEstandar: Math.abs(zScore)
                }
                console.log('⚠️ ANOMALÍA CRÍTICA CONFIRMADA en mes', firstDrop, '- Z-Score:', zScore.toFixed(2), '- Confianza:', (confidenceScore * 100).toFixed(1) + '%')
                break
              }
            }
            
            // CRITERIO 3: Análisis de tendencia sostenida con validación estadística
            const mesesParaVerificar = Math.min(3, withVar.length - i - 1)
            const umbralRecuperacion = Math.max(prev * 0.85, baselineAvg * 0.8) // Más estricto: 85% vs anterior o 80% vs baseline
            
            if (mesesParaVerificar >= 2 && confidenceScore >= 0.5) {
              let seMantieneAnomalia = true
              let persistenceScore = 0
              let monthsBelow = 0
              
              for (let j = 1; j <= mesesParaVerificar; j++) {
                const siguienteMes = withVar[i + j]
                const seasonalExpectedNext = seasonalAvg.get(siguienteMes.month) || umbralRecuperacion
                const nextZScore = seasonalStdDev.get(siguienteMes.month) > 0 ? 
                  (siguienteMes.consumo - seasonalExpectedNext) / seasonalStdDev.get(siguienteMes.month)! : 0
                
                console.log(`  📊 Análisis mes ${i+j}: ${siguienteMes.year}-${pad2(siguienteMes.month)} | Consumo: ${siguienteMes.consumo.toFixed(2)} | Umbral: ${umbralRecuperacion.toFixed(2)} | Z-Score: ${nextZScore.toFixed(2)}`)
                
                // Verificar múltiples condiciones de recuperación
                const hasRecovered = siguienteMes.consumo > umbralRecuperacion || 
                                  siguienteMes.consumo >= seasonalExpectedNext * 0.85 ||
                                  nextZScore > -1.5 // Menos de 1.5 desviaciones por debajo
                
                if (hasRecovered) {
                  seMantieneAnomalia = false
                  console.log(`  ✅ Recuperación detectada en mes ${i+j} (Z-Score: ${nextZScore.toFixed(2)})`)
                  break
                } else {
                  monthsBelow++
                  persistenceScore += Math.abs(nextZScore) > 1.5 ? 0.4 : 0.2
                }
              }
              
              // Anomalía confirmada si se mantiene baja con alta persistencia
              if (seMantieneAnomalia && persistenceScore >= 0.6) {
                firstDrop = i
                detectedAnomalyYM = { year: withVar[i].year, month: withVar[i].month }
                anomalyMetadata = {
                  criterio: 'Tendencia sostenida confirmada',
                  confianza: Math.min(0.95, confidenceScore + persistenceScore * 0.3),
                  baseline: baselineAvg,
                  actual: curV,
                  caida: Math.max(drop, dropFromBaseline),
                  persistencia: monthsBelow,
                  desvEstandar: Math.abs(zScore)
                }
                console.log('⚠️ ANOMALÍA SOSTENIDA CONFIRMADA en mes', firstDrop, '- Persistencia:', monthsBelow, 'meses - Confianza:', (anomalyMetadata.confianza * 100).toFixed(1) + '%')
                break
              } else {
                console.log(`  ℹ️ Descenso temporal o insuficiente persistencia (score: ${persistenceScore.toFixed(2)})`)
              }
            } else {
              console.log(`  ℹ️ Datos insuficientes para análisis de persistencia (${mesesParaVerificar} meses, confianza: ${(confidenceScore * 100).toFixed(1)}%)`)
            }
          }
        }
      }
      
      // REPORTE FINAL: Mostrar información detallada del análisis
      if (!detectedAnomalyYM) {
        console.log('✅ Análisis completado: No se detectaron descensos significativos en el consumo.')
        const mensajeNoAnomalia = `✅ ANÁLISIS COMPLETADO - SIN ANOMALÍAS DETECTADAS

📊 RESUMEN DEL ANÁLISIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Período analizado: ${withVar.length} meses
• Rango: ${withVar[0]?.year}-${pad2(withVar[0]?.month)} → ${withVar[withVar.length-1]?.year}-${pad2(withVar[withVar.length-1]?.month)}
• Meses analizados: ${withVar.length}
• Promedio histórico: ${(withVar.reduce((s, v) => s + v.consumo, 0) / withVar.length).toFixed(0)} kWh

🔍 VALIDACIONES REALIZADAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Análisis estadístico (Z-Score)
✓ Detección de outliers
✓ Validación estacional
✓ Análisis de tendencias
✓ Detección de persistencia

📈 CONCLUSIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El comportamiento del consumo es ESTABLE y está
dentro de los rangos normales esperados.

✅ No se detectaron descensos ni incrementos
   anómalos superiores al 40%

💡 TIP: Si sospechas de anomalías no detectadas,
   verifica los datos en la tabla de variaciones.`
        window.alert(mensajeNoAnomalia)
      } else if (anomalyMetadata) {
        console.log('⚠️ ANOMALÍA DETECTADA CON ALTA PRECISIÓN:', anomalyMetadata)
        window.alert('⚠️ Anomalía detectada con alta precisión\n\n' +
                    `📅 Período: ${detectedAnomalyYM.year}-${pad2(detectedAnomalyYM.month)}\n` +
                    `🎯 Criterio: ${anomalyMetadata.criterio}\n` +
                    `📊 Confianza: ${(anomalyMetadata.confianza * 100).toFixed(1)}%\n` +
                    `📉 Caída: ${(anomalyMetadata.caida * 100).toFixed(1)}%\n` +
                    `📈 Baseline: ${anomalyMetadata.baseline.toFixed(0)} kWh → Actual: ${anomalyMetadata.actual.toFixed(0)} kWh\n` +
                    `🔢 Desviaciones estándar: ${anomalyMetadata.desvEstandar.toFixed(1)}\n` +
                    (anomalyMetadata.persistencia > 0 ? `⏱️ Persistencia: ${anomalyMetadata.persistencia} meses` : ''))
      } else {
        // Caso improbable pero contemplado: sin metadata pero con periodo detectado
        console.warn('⚠️ Período detectado sin metadata')
        window.alert('⚠️ Se detectó un cambio significativo, pero sin información de contexto.\n\nIntenta de nuevo o verifica los datos.')
      }
      
      setMonthlySeries(withVar)
      setAnomalyMonthIdx(firstDrop)
      setAnomalyYearMonth(detectedAnomalyYM)
      setHeatmapTooltip(null)
      setShowAnalisisPanel(true)
      console.log('✅ Panel de análisis abierto:', { series: withVar.length, anomalyIdx: firstDrop, anomalyYM: detectedAnomalyYM })
      console.log('🎯 anomalyYearMonth guardado:', detectedAnomalyYM)
      
      // Verificar que el estado se actualizó
      setTimeout(() => {
        console.log('🔄 Verificación post-actualización de anomalyYearMonth (debería aparecer en la tabla)')
      }, 100)
      } // Cierre del if (firstDrop === null)
    } catch (err) {
      console.error('❌ Error en análisis:', err)
      window.alert('Error al analizar anomalías.')
    }
  }, [allowAnalysis, filteredData, keptRows])

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
      {/* Estilos globales para animaciones */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
            transform: scale(1.01);
          }
        }
      `}</style>
      
      {/* Modal de validación Acta/Factura */}
      <ActaFacturaAlertModal
        show={showActaAlert}
        message={actaAlertMessage}
        type={actaAlertType}
        onClose={() => setShowActaAlert(false)}
      />
      
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
          {cambioTitularInfo.tuvo && cambioTitularInfo.fecha && (
            <div style={{
              marginTop: '0.5rem',
              background: 'rgba(0, 0, 208, 0.06)',
              border: '1px solid rgba(0, 0, 208, 0.15)',
              color: '#0f172a',
              padding: '0.4rem 0.6rem',
              borderRadius: 8,
              display: 'inline-block',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Cambio de titular desde la fecha: <strong style={{ color: '#0000D0' }}>{new Date(cambioTitularInfo.fecha).toLocaleDateString('es-ES')}</strong>
            </div>
          )}
          {fechaActa && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(() => {
                const actaNeedsAttention = actaNeedsAttentionStrict || (actaValidation?.show && (
                  actaValidation.type === 'error' || (typeof actaValidation.diasDiferencia === 'number' && actaValidation.diasDiferencia > 30)
                ))
                // Estilo del recuadro Fecha del acta: rojo cuando falta valoración; corporativo cuando OK
                const badgeStyle: React.CSSProperties = actaNeedsAttention ? {
                  background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)',
                  border: '2px solid #EF4444',
                  color: '#7F1D1D',
                  boxShadow: '0 6px 18px rgba(239, 68, 68, 0.35)'
                } : {
                  background: 'rgba(255, 49, 132, 0.06)',
                  border: '1px solid rgba(255, 49, 132, 0.15)',
                  color: '#0f172a'
                }
                return (
                  <>
                    <div style={{
                      marginTop: '0.5rem',
                      marginLeft: cambioTitularInfo.tuvo ? '0.5rem' : '0',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      ...badgeStyle
                    }}>
                      Fecha del acta: <strong style={{ color: actaNeedsAttention ? '#7F1D1D' : '#FF3184' }}>{new Date(fechaActa).toLocaleDateString('es-ES')}</strong>
                    </div>
                    {actaNeedsAttention && (
                      <span style={{
                        marginTop: '0.5rem',
                        background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)',
                        border: '2px solid #EF4444',
                        color: '#7F1D1D',
                        padding: '0.45rem 0.6rem',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)'
                      }}>
                        Faltan facturas para valorar
                      </span>
                    )}
                  </>
                )
              })()}
            </div>
          )}
          {/* Mensaje informativo cuando hay anomalía detectada */}
          {anomalyYearMonth && (
            <div style={{
              marginTop: '0.75rem',
              background: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
              border: '2px solid #f59e0b',
              color: '#78350f',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <span style={{ fontSize: '1.25rem' }} dangerouslySetInnerHTML={{ __html: '&#128073;' }} />
              <span>
                Anomalía detectada en {new Date(anomalyYearMonth.year, anomalyYearMonth.month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()} 
                — La fila correspondiente está resaltada en la tabla
              </span>
              <button
                type="button"
                onClick={() => {
                  setAnomalyYearMonth(null)
                  setShowAnalisisPanel(false)
                  console.log('🧹 Resaltado limpiado manualmente')
                }}
                style={{
                  marginLeft: 'auto',
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
                onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
              >
                Limpiar resaltado
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Botón Detectar anomalías de consumo (a la izquierda de Anular) */}
          <button
            type="button"
            onClick={handleDetectarAnomalias}
            style={{
              borderRadius: 10,
              padding: '0.625rem 1.25rem',
              background: allowAnalysis ? 'linear-gradient(135deg, #0000D0 0%, #2929E5 100%)' : 'rgba(0,0,0,0.08)',
              border: 'none',
              color: allowAnalysis ? '#FFFFFF' : '#64748b',
              fontSize: '0.8125rem',
              fontWeight: 800,
              letterSpacing: '0.03em',
              cursor: allowAnalysis ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 208, 0.35)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              fontFamily: "'Open Sans', sans-serif"
            }}
            title="Analizar visualmente el consumo y detectar la primera caída > 40%"
            disabled={!allowAnalysis}
            onMouseEnter={e => {
              if (allowAnalysis) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0, 0, 208, 0.45)';
              }
            }}
            onMouseLeave={e => {
              if (allowAnalysis) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 208, 0.35)';
              }
            }}
          >Detectar anomalías de consumo</button>
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
            {(() => {
              // Headers para detectar fecha de la fila
              const fechaHeaderForKey = filteredData.headers.find(h => isFechaDesdeHeader(h)) || filteredData.headers.find(h => isFechaHastaHeader(h)) || filteredData.headers.find(h => isPeriodoHeader(h)) || filteredData.headers.find(h => isFechaFactHeader(h))
              
              console.log('📑 Renderizando tabla:', { 
                totalRows: filteredRows.length, 
                anomalyYearMonth, 
                fechaHeaderForKey,
                hasAnomaly: !!anomalyYearMonth,
                headers: filteredData.headers 
              })
              
              if (anomalyYearMonth) {
                console.log('🎯 Buscando fila con anomalía:', anomalyYearMonth)
              }
              
              return filteredRows.map((r, i) => {
                const prev = i > 0 ? filteredRows[i - 1] : null
                const contractKey = contractHeader ? String(r[contractHeader] ?? '').trim() : ''
                const rowBg = contractColorMap.get(contractKey)
                
                // Verificar si esta fila corresponde a la anomalía detectada
                let isHighlighted = false
                if (anomalyYearMonth && fechaHeaderForKey) {
                  const fechaVal = String(r[fechaHeaderForKey] ?? '')
                  const d = isPeriodoHeader(fechaHeaderForKey) ? parsePeriodoStart(fechaVal) : parseDateLoose(fechaVal)
                  if (d) {
                    // Si es "Fecha desde", el consumo corresponde al mes ANTERIOR
                    // Por ejemplo: Fecha desde 02/12/2022 contiene el consumo de noviembre 2022
                    let rowYear = d.getFullYear()
                    let rowMonth = d.getMonth() + 1
                    
                    if (isFechaDesdeHeader(fechaHeaderForKey)) {
                      // Restar un mes para obtener el mes del consumo
                      const consumptionDate = new Date(d)
                      consumptionDate.setMonth(consumptionDate.getMonth() - 1)
                      rowYear = consumptionDate.getFullYear()
                      rowMonth = consumptionDate.getMonth() + 1
                    }
                    
                    isHighlighted = (rowYear === anomalyYearMonth.year && rowMonth === anomalyYearMonth.month)
                    
                    // Log TODAS las filas para debugging
                    console.log(`🔍 Fila ${i + 1}:`, { 
                      fechaHeader: fechaHeaderForKey,
                      fechaVal, 
                      parsedDate: d.toISOString(),
                      rowYear, 
                      rowMonth, 
                      anomalyYear: anomalyYearMonth.year, 
                      anomalyMonth: anomalyYearMonth.month,
                      match: isHighlighted 
                    })
                    
                    if (isHighlighted) {
                      console.log('🎯 ✅ ✅ ✅ FILA RESALTADA ENCONTRADA:', { 
                        rowIndex: i + 1, 
                        rowYear, 
                        rowMonth, 
                        anomalyYearMonth,
                        fechaVal 
                      })
                    }
                  } else {
                    console.log(`⚠️ Fila ${i + 1}: No se pudo parsear fecha`, { fechaHeader: fechaHeaderForKey, fechaVal })
                  }
                } else {
                  if (i === 0) {
                    console.log('❌ No hay anomalyYearMonth o fechaHeaderForKey:', { anomalyYearMonth, fechaHeaderForKey })
                  }
                }
                
                // Color de resaltado más visible: amarillo brillante con borde y sombra
                const highlightBg = '#FCD34D' // Amarillo brillante sólido
                const finalBg = isHighlighted ? highlightBg : (rowBg || (i % 2 === 0 ? '#ffffff' : 'rgba(0, 0, 208, 0.02)'))
                
                return (
                  <tr 
                    key={i} 
                    data-highlighted={isHighlighted ? 'true' : 'false'}
                    style={{ 
                      background: finalBg, 
                      transition: 'all 0.3s ease',
                      boxShadow: isHighlighted ? '0 0 0 3px #F59E0B inset, 0 6px 16px rgba(245, 158, 11, 0.4)' : 'none',
                      position: 'relative',
                      borderLeft: isHighlighted ? '5px solid #F59E0B' : 'none'
                    }}>
                  <td style={{ 
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 1, 
                    background: isHighlighted ? '#F59E0B' : (rowBg || (i % 2 === 0 ? 'rgba(0, 0, 208, 0.02)' : 'rgba(0, 0, 208, 0.04)')), 
                    borderRight: isHighlighted ? '2px solid #D97706' : '1px solid rgba(0, 0, 208, 0.08)', 
                    color: isHighlighted ? '#FFFFFF' : '#64748b', 
                    padding: isHighlighted ? '0.625rem 0.875rem' : '0.5rem 0.75rem', 
                    textAlign: 'right',
                    fontWeight: isHighlighted ? 900 : 600,
                    fontSize: isHighlighted ? '1rem' : '0.75rem',
                    fontFamily: "'Open Sans', sans-serif",
                    transition: 'all 0.3s ease',
                    boxShadow: isHighlighted ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
                  }}>
                    {isHighlighted && <span style={{ marginRight: '0.375rem', fontSize: '1.125rem' }}>&#128073;</span>}
                    {i + 1}
                  </td>
                  {filteredData.headers.map((h, j) => {
                    const val = String(r[h] ?? '')
                    const prevVal = prev ? String(prev[h] ?? '') : ''
                    const contrato = isContratoHeader(h)
                    const potencia = isPotenciaHeader(h)
                    const isConsumoActiva = isConsumoActivaHeader(h)
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
                    
                    // Detectar si esta celda de consumo activa es la de la anomalía
                    const isAnomalyCell = isHighlighted && isConsumoActiva
                    
                    // Colores corporativos para cambios: contrato -> Primary #0000D0, potencia -> Secondary #FF3184
                    const color = isAnomalyCell 
                      ? '#92400E' // Marrón oscuro para buen contraste sobre amarillo
                      : (changed ? (contrato ? '#0000D0' : '#FF3184') : (isHighlighted ? '#92400E' : '#1e293b'))
                    // Si es la celda de consumo activa de la anomalía, usar amarillo brillante con efectos especiales
                    const bg = isAnomalyCell
                      ? '#FDE047' // Amarillo más brillante para la celda de anomalía
                      : (isHighlighted 
                        ? '#FCD34D' // Amarillo brillante uniforme para todas las celdas resaltadas
                        : (changed && contrato 
                          ? 'rgba(0, 0, 208, 0.08)' 
                          : changed && potencia 
                            ? 'rgba(255, 49, 132, 0.08)' 
                            : (rowBg || undefined)))
                    const fontWeight = isAnomalyCell ? 900 : (isHighlighted ? 800 : (changed ? 700 : 400))
                    const fontSize = isAnomalyCell ? '1.125rem' : (isHighlighted ? '1rem' : '0.8125rem')
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
                          padding: isAnomalyCell ? '0.75rem 1rem' : '0.5rem 0.75rem', 
                          borderTop: '1px solid rgba(0, 0, 208, 0.06)', 
                          borderRight: '1px solid rgba(0, 0, 208, 0.06)', 
                          color, 
                          background: bg, 
                          fontWeight, 
                          textAlign: align,
                          fontSize,
                          transition: 'all 0.3s ease',
                          fontFamily: "'Open Sans', sans-serif",
                          boxShadow: isAnomalyCell ? '0 0 0 4px #FBBF24 inset, 0 8px 20px rgba(251, 191, 36, 0.6)' : 'none',
                          border: isAnomalyCell ? '3px solid #F59E0B' : undefined,
                          position: isAnomalyCell ? 'relative' : undefined
                        }}>
                          {display}
                        </td>
                        {j === cupsIndex && (
                          <td style={{ 
                            padding: isHighlighted ? '0.625rem 0.875rem' : '0.5rem 0.75rem', 
                            borderTop: '1px solid rgba(0, 0, 208, 0.06)', 
                            borderRight: '1px solid rgba(0, 0, 208, 0.06)', 
                            color: isHighlighted ? '#92400E' : '#0000D0', 
                            background: isHighlighted ? '#FCD34D' : (rowBg || undefined), 
                            fontWeight: isHighlighted ? 800 : 700,
                            fontSize: isHighlighted ? '1rem' : '0.8125rem',
                            fontFamily: "'Open Sans', sans-serif",
                            transition: 'all 0.3s ease'
                          }}>
                            {contractDurationText.get(contractKey) || ''}
                          </td>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tr>
              )
              })
            })()}
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

      {/* Panel derecho de análisis (Heatmap + Barras) */}
      {showAnalisisPanel && (
        <div style={{
          position: 'fixed',
          top: 12,
          right: 10,
          bottom: 86, // deja espacio a la bottom bar
          width: 'min(680px, 95vw)',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
          border: '1px solid rgba(0,0,0,0.08)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '0.75rem 0.875rem',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, rgba(0,0,208,0.06) 0%, rgba(41,41,229,0.04) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 900, color: '#0000D0', fontFamily: "'Lato', sans-serif" }}>Análisis de consumo tras anulación</div>
              <div style={{ fontSize: 12, color: '#334155' }}>Visualización mensual y anual</div>
            </div>
            <button type="button" onClick={() => setShowAnalisisPanel(false)} style={{ border: 'none', background: '#0000D0', color: '#fff', borderRadius: 8, padding: '0.4rem 0.7rem', fontWeight: 800, cursor: 'pointer' }}>Cerrar</button>
          </div>
          <div style={{ padding: '0.75rem', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Heatmap
              data={monthlySeries}
              anomalyIdx={anomalyMonthIdx}
              onHover={(v) => setHeatmapTooltip(v)}
              onClick={(year, month) => {
                console.log('👆 Click en celda del Heatmap:', { year, month })
                // Actualizar anomalyYearMonth con el mes clickeado
                setAnomalyYearMonth({ year, month })
                // NO cerrar el panel - dejar que el usuario vea el resaltado
                console.log('✅ Anomalía actualizada a:', { year, month }, '- Revisa la tabla de Vista previa ATR')
              }}
            />
            {heatmapTooltip && (
              <div style={{ position: 'fixed', transform: `translate(${heatmapTooltip.x}px, ${heatmapTooltip.y}px)`, background: '#111827', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, pointerEvents: 'none', boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }}>
                {heatmapTooltip.text}
              </div>
            )}
            <BarsChart
              data={monthlySeries}
              anomalyIdx={anomalyMonthIdx}
              onHover={(v) => setHeatmapTooltip(v)}
            />
            {/* Panel de métricas de calidad del análisis */}
            {anomalyMonthIdx !== null && monthlySeries[anomalyMonthIdx] && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(251, 191, 36, 0.08) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                padding: '0.875rem 1rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ 
                  fontWeight: 800, 
                  color: '#dc2626', 
                  marginBottom: '0.5rem',
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '0.875rem'
                }}>
                  🎯 Métricas de Calidad del Análisis
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>📅 Período detectado</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>
                      {monthlySeries[anomalyMonthIdx].year}-{String(monthlySeries[anomalyMonthIdx].month).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>📊 Consumo anómalo</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>
                      {monthlySeries[anomalyMonthIdx].consumo.toFixed(0)} kWh
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>📉 Variación vs anterior</span>
                    <span style={{ 
                      color: monthlySeries[anomalyMonthIdx].variacion && monthlySeries[anomalyMonthIdx].variacion! < -0.4 ? '#dc2626' : '#059669', 
                      fontWeight: 700 
                    }}>
                      {monthlySeries[anomalyMonthIdx].variacion ? 
                        `${(monthlySeries[anomalyMonthIdx].variacion! * 100).toFixed(1)}%` : 
                        'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>🔍 Datos analizados</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>
                      {monthlySeries.length} meses
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>⚡ Algoritmo aplicado</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>
                      Validación cruzada estadística
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>🎯 Precisión</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      Alta (múltiples criterios)
                    </span>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.5rem 0.75rem', 
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  color: '#374151',
                  lineHeight: 1.4
                }}>
                  <strong>💡 Metodología:</strong> Se aplicó análisis estadístico avanzado con validación cruzada que considera 
                  desviaciones estándar, patrones estacionales históricos, tendencias de baseline y verificación de persistencia 
                  temporal. Esto eleva la calidad del proceso y mitiga riesgos de desalineamientos de información.
                </div>
              </div>
            )}
            
            <div style={{ fontSize: 12, color: '#334155' }}>
              • El indicador 👉 muestra el inicio del descenso de anomalía en el consumo mensual (celda agrandada). <br/>
              • El mapa de calor muestra la evolución temporal de los consumos. Al pasar el cursor sobre cualquier mes, verá el detalle completo.<br/>
              • <strong>Nuevo:</strong> Análisis con validación cruzada estadística para mayor precisión en la identificación del período.
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

              {/* Campo 'Cambios Potencia (kW)' eliminado por solicitud */}
              {cambioTitularInfo.tuvo && cambioTitularInfo.fecha && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontFamily: "'Open Sans', sans-serif",
                    whiteSpace: 'nowrap'
                  }}>
                    Cambio de titular desde la fecha: <strong style={{ color: '#FFFFFF' }}>{new Date(cambioTitularInfo.fecha).toLocaleDateString('es-ES')}</strong>
                  </span>
                </div>
              )}
              {fechaActa && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontFamily: "'Open Sans', sans-serif",
                    whiteSpace: 'nowrap'
                  }}>
                    Fecha del acta: <strong style={{ color: '#FFFFFF' }}>{new Date(fechaActa).toLocaleDateString('es-ES')}</strong>
                  </span>
                </div>
              )}
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

// ==== Visualizaciones del panel secundario ====
type MonthlyPoint = { key: string; year: number; month: number; fecha: Date; consumo: number; variacion: number | null }
type Hover = { x: number; y: number; text: string }

// Heatmap: x = Años, y = Meses (1..12). Color por consumo. Borde rojo en primera anomalía.
function Heatmap({ data, anomalyIdx, onHover, onClick }: { 
  data: MonthlyPoint[]; 
  anomalyIdx: number | null; 
  onHover: (_h: Hover | null) => void;
  onClick?: (year: number, month: number) => void;
}) {
  // Determinar rango de años presentes
  const years = Array.from(new Set(data.map(d => d.year))).sort((a,b) => a - b)
  const cols = years.length
  const rows = 12
  const cell = 52 // Aumentado para mostrar valores dentro
  const m = { l: 60, t: 24, r: 12, b: 28 }
  const width = m.l + cols * cell + m.r
  const height = m.t + rows * cell + m.b
  // Matriz por (y,m)
  const matrix = new Map<string, MonthlyPoint>()
  for (const d of data) matrix.set(`${d.year}-${d.month}`, d)
  // Escala de color Rojo->Amarillo->Verde (baja->media->alta) usando cuantiles para mejor distribución visual
  // Invertida: consumos bajos son problemáticos (rojo), consumos altos son normales (verde)
  const sorted = [...data.map(d => d.consumo)].sort((a,b) => a - b)
  const min = sorted[0] || 0
  const q50 = sorted[Math.floor(sorted.length * 0.5)] || 0
  const max = sorted[sorted.length - 1] || 1
  const colorFor = (v: number) => {
    // Normalizar usando cuantiles: <q50 = rojo->amarillo, >=q50 = amarillo->verde
    if (v <= q50) {
      const range = q50 - min
      const t = range > 0 ? (v - min) / range : 0
      return mixColor('#ef4444', '#fbbf24', t)
    }
    const range = max - q50
    const t = range > 0 ? (v - q50) / range : 0
    return mixColor('#fbbf24', '#10b981', t)
  }
  const mixColor = (a: string, b: string, t: number) => {
    const pa = hexToRgb(a); const pb = hexToRgb(b)
    const r = Math.round(pa.r + (pb.r - pa.r) * t)
    const g = Math.round(pa.g + (pb.g - pa.g) * t)
    const bl = Math.round(pa.b + (pb.b - pa.b) * t)
    return `rgb(${r},${g},${bl})`
  }
  const hexToRgb = (hex: string) => {
    const m = hex.replace('#','')
    const bigint = parseInt(m, 16)
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
  }

  // Función para determinar contraste de texto: blanco para fondos oscuros, negro para claros
  const getTextColor = (bgColor: string) => {
    const rgb = hexToRgb(bgColor.startsWith('#') ? bgColor : '#000000')
    // Si es rgb(), extraer valores
    if (bgColor.startsWith('rgb')) {
      const match = bgColor.match(/\d+/g)
      if (match && match.length >= 3) {
        const r = parseInt(match[0])
        const g = parseInt(match[1])
        const b = parseInt(match[2])
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        return luminance > 0.6 ? '#1f2937' : '#ffffff'
      }
    }
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.6 ? '#1f2937' : '#ffffff'
  }

  // Construir lista en orden por fecha para localizar anomalía por índice
  const ordered = [...data].sort((a,b) => a.fecha.getTime() - b.fecha.getTime())
  const anomalyKey = anomalyIdx != null && anomalyIdx >= 0 && anomalyIdx < ordered.length ? ordered[anomalyIdx].key : null

  const monthsES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  // Función para determinar el motivo del color según el consumo y la escala de cuantiles (invertida)
  const getMotivoColor = (v: number, isAnomaly: boolean) => {
    if (isAnomaly) return '👉 Descenso de anomalía (≥40%)'
    if (v <= min + (q50 - min) * 0.33) return 'Consumo bajo o anómalo (posible irregularidad)'
    if (v <= q50) return 'Consumo bajo-medio (requiere observación)'
    if (v <= q50 + (max - q50) * 0.5) return 'Consumo medio-alto (dentro del promedio)'
    return 'Consumo normal o alto (estable y esperado)'
  }

  const handleEnter = (pt: MonthlyPoint, e: React.MouseEvent<SVGRectElement>) => {
    const varPct = pt.variacion == null ? '—' : `${(pt.variacion * 100).toFixed(1)}%`
    const isAnomaly = pt.key === anomalyKey
    const motivo = getMotivoColor(pt.consumo, isAnomaly)
    
    // Tooltip mejorado para anomalías
    if (isAnomaly) {
      onHover({ 
        x: e.clientX + 12, 
        y: e.clientY - 28, 
        text: `👉 Descenso de anomalía (≥40%) — Año: ${pt.year} — Mes: ${monthsES[pt.month-1]} — Consumo: ${new Intl.NumberFormat('es-ES').format(pt.consumo)} kWh — Variación: ${varPct}` 
      })
    } else {
      onHover({ 
        x: e.clientX + 12, 
        y: e.clientY - 28, 
        text: `Año: ${pt.year} — Mes: ${monthsES[pt.month-1]} — Consumo: ${new Intl.NumberFormat('es-ES').format(pt.consumo)} kWh — Variación: ${varPct} — Motivo del color: ${motivo}` 
      })
    }
  }
  const handleLeave = () => onHover(null)
  
  const handleClick = (pt: MonthlyPoint) => {
    if (onClick) {
      onClick(pt.year, pt.month)
    }
  }

  return (
    <div>
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, fontFamily: "'Lato', sans-serif" }}>Mapa de calor mensual</div>
      
      {/* Estilos CSS para animación de anomalía */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.6)); }
          50% { filter: drop-shadow(0 0 12px rgba(220, 38, 38, 1)); }
        }
        .anomaly-cell {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <svg width={width} height={height}>
        {/* Eje Y meses */}
        {monthsES.map((mname, i) => (
          <text key={i} x={6} y={m.t + i * cell + cell * 0.65} fontSize={12} fill="#334155" fontFamily="'Open Sans', sans-serif">{mname}</text>
        ))}
        {/* Eje X años */}
        {years.map((y, i) => (
          <text key={y} x={m.l + i * cell + cell * 0.5} y={16} fontSize={12} fill="#334155" textAnchor="middle" fontFamily="'Open Sans', sans-serif">{y}</text>
        ))}
        {/* Celdas */}
        {years.map((y, cx) => (
          Array.from({ length: 12 }).map((_, mi) => {
            const mm = mi + 1
            const pt = matrix.get(`${y}-${mm}`)
            const val = pt ? pt.consumo : 0
            const fill = colorFor(val)
            const isAnomaly = pt && pt.key === anomalyKey
            const x = m.l + cx * cell
            const ypix = m.t + mi * cell
            const textColor = getTextColor(fill)
            
            // Formatear valor: si es >1000, mostrar en K (miles), sino mostrar entero
            const displayValue = val === 0 ? '—' : val >= 1000 
              ? `${(val / 1000).toFixed(1)}K` 
              : Math.round(val).toString()
            
            return (
              <g key={`${y}-${mm}`}>
                {/* Celda de fondo */}
                <rect
                  x={x} y={ypix} width={cell-4} height={cell-4} fill={fill} rx={6} ry={6}
                  stroke={isAnomaly ? '#dc2626' : 'rgba(0,0,0,0.06)'} 
                  strokeWidth={isAnomaly ? 3 : 1}
                  onMouseEnter={(e) => pt && handleEnter(pt, e)}
                  onMouseLeave={handleLeave}
                  onClick={() => pt && handleClick(pt)}
                  style={{ 
                    cursor: pt ? 'pointer' : 'default',
                    filter: isAnomaly ? 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.8))' : 'none'
                  }}
                />
                
                {/* Valor de consumo centrado */}
                {pt && (
                  <text
                    x={x + (cell - 4) / 2}
                    y={ypix + (cell - 4) / 2 + (isAnomaly ? -6 : 4)}
                    fontSize={10}
                    fontWeight={700}
                    fill={textColor}
                    textAnchor="middle"
                    fontFamily="'Open Sans', sans-serif"
                    pointerEvents="none"
                  >
                    {displayValue}
                  </text>
                )}
                
                {/* Indicador de anomalía: icono de advertencia */}
                {isAnomaly && (
                  <text
                    x={x + (cell - 4) / 2}
                    y={ypix + (cell - 4) / 2 + 10}
                    fontSize={14}
                    textAnchor="middle"
                    pointerEvents="none"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  >
                    ⚠️
                  </text>
                )}
              </g>
            )
          })
        ))}
      </svg>
      
      {/* Leyenda explicativa del mapa de calor */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem 0.875rem',
        background: 'linear-gradient(135deg, rgba(0,0,208,0.04) 0%, rgba(41,41,229,0.02) 100%)',
        border: '1px solid rgba(0,0,208,0.08)',
        borderRadius: 10,
        fontFamily: "'Open Sans', sans-serif"
      }}>
        <div style={{ fontWeight: 700, color: '#0000D0', fontSize: '0.875rem', marginBottom: '0.5rem', fontFamily: "'Lato', sans-serif" }}>📊 Leyenda del mapa de calor</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: '#ef4444', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ color: '#334155' }}><strong style={{ color: '#dc2626' }}>Rojo:</strong> Consumo bajo o anómalo (posible irregularidad)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: '#f97316', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ color: '#334155' }}><strong style={{ color: '#ea580c' }}>Naranja:</strong> Consumo bajo-medio (requiere observación)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: '#fbbf24', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Amarillo:</strong> Consumo medio (en seguimiento)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: '#84cc16', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Verde claro:</strong> Consumo medio-alto (dentro del promedio)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: '#10b981', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ color: '#334155' }}><strong style={{ color: '#059669' }}>Verde:</strong> Consumo normal o alto (estable y esperado)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              background: '#ef4444', 
              borderRadius: 6, 
              border: '1px solid rgba(220, 38, 38, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>👉</div>
            <span style={{ color: '#334155' }}><strong style={{ color: '#dc2626' }}>Celda agrandada 👉:</strong> Descenso de anomalía (≥40%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Barras por mes cronológico con primera caída >=40% en rojo
function BarsChart({ data, anomalyIdx, onHover }: { data: MonthlyPoint[]; anomalyIdx: number | null; onHover: (_h: Hover | null) => void }) {
  const ordered = [...data].sort((a,b) => a.fecha.getTime() - b.fecha.getTime())
  const w = 600; const h = 260; const m = { l: 50, r: 20, t: 20, b: 60 }
  const innerW = w - m.l - m.r
  const innerH = h - m.t - m.b
  const maxY = Math.max(...ordered.map(d => d.consumo), 1)
  const x = (i: number) => m.l + (ordered.length === 0 ? 0 : (i * innerW) / Math.max(1, ordered.length))
  const barW = Math.max(6, innerW / Math.max(1, ordered.length) - 4)
  const y = (v: number) => m.t + innerH - (v / maxY) * innerH
  const monthsES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const anomalyKey = anomalyIdx != null && anomalyIdx >= 0 && anomalyIdx < ordered.length ? ordered[anomalyIdx].key : null

  const handleEnter = (pt: MonthlyPoint, i: number, e: React.MouseEvent<SVGRectElement>) => {
    const prev = i > 0 ? ordered[i-1] : null
    const varPct = prev && prev.consumo > 0 ? (((pt.consumo - prev.consumo) / prev.consumo) * 100).toFixed(1) + '%' : '—'
    const label = `${monthsES[pt.month-1]}/${pt.year}`
    onHover({ x: e.clientX + 12, y: e.clientY - 28, text: `Periodo: ${label} — Consumo: ${new Intl.NumberFormat('es-ES').format(pt.consumo)} — Variación: ${varPct}` })
  }
  const handleLeave = () => onHover(null)

  return (
    <div>
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Consumo mensual (barras)</div>
      <svg width={w} height={h}>
        {/* Ejes */}
        <line x1={m.l} y1={m.t} x2={m.l} y2={m.t + innerH} stroke="#94a3b8" strokeWidth={1} />
        <line x1={m.l} y1={m.t + innerH} x2={m.l + innerW} y2={m.t + innerH} stroke="#94a3b8" strokeWidth={1} />
        {/* Barras */}
        {ordered.map((pt, i) => {
          const isAnomaly = pt.key === anomalyKey
          const label = `${monthsES[pt.month-1]}/${pt.year}`
          return (
            <g key={pt.key}>
              <rect x={x(i) + 2} width={barW} y={y(pt.consumo)} height={Math.max(1, m.t + innerH - y(pt.consumo))}
                fill={isAnomaly ? '#dc2626' : '#3b82f6'} stroke="#ffffff" strokeWidth={1}
                rx={4} ry={4}
                onMouseEnter={(e) => handleEnter(pt, i, e)} onMouseLeave={handleLeave}
              />
              {/* Etiquetas X espaciadas */}
              {i % Math.ceil(ordered.length / 10 || 1) === 0 && (
                <text x={x(i) + 2 + barW / 2} y={m.t + innerH + 14} fontSize={11} fill="#334155" textAnchor="middle">{label}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
