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
  // (Eliminado isEstadoMedidaHeader por no usarse)
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
    } else {
      setFilteredRows(keptRows)
      setViewMode('restantes')
    }
  }, [ordenado, viewMode, removedRows, keptRows])

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
      {/* (Eliminado: Panel lateral "Información de Contratos") */}

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
            <strong>Se han anulado {anuladas} factura{anuladas === 1 ? '' : 's'} del listado.</strong>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Detalle: Factura complementaria: {detalleAnuladas.comp} | Enviadas a facturar: {detalleAnuladas.enviados} | Anuladas: {detalleAnuladas.anuladas}
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
          {ordenado && (
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
            {/* Sección izquierda - Información */}
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
