import * as XLSX from 'xlsx'
import { ExpedienteAnalisis, RawSheet } from './types'

const toISO = (val: any): string => {
  if (!val) return ''
  // SheetJS puede entregar fechas como números (Excel date serial) o strings
  if (typeof val === 'number') {
    const jsDate = XLSX.SSF ? XLSX.SSF.parse_date_code?.(val) : null
    if (jsDate) {
      const d = new Date(Date.UTC(jsDate.y, (jsDate.m || 1) - 1, jsDate.d || 1, jsDate.H || 0, jsDate.M || 0, jsDate.S || 0))
      return d.toISOString()
    }
  }
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

const parseNumber = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return isNaN(n) ? 0 : n
}

const diffMinutes = (start: any, end: any): number => {
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0
  return Math.abs((e.getTime() - s.getTime()) / 60000)
}

export function readWorkbookFromArrayBuffer(buf: ArrayBuffer): XLSX.WorkBook {
  return XLSX.read(buf, { type: 'array' })
}

export function parseAnalisisFromWorkbook(wb: XLSX.WorkBook): ExpedienteAnalisis[] {
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  return rows.map((r, idx) => {
    const clienteId = String(r['Cliente'] || r['cliente'] || r['CLIENTE'] || '').trim()
    const fecha = toISO(r['Fecha'] || r['fecha'] || r['FECHA'])
    const horaIniISO = toISO(r['Hora Inicio'] || r['HoraInicio'] || r['HORA INICIO'])
    const horaFinISO = toISO(r['Hora Fin'] || r['HoraFin'] || r['HORA FIN'])
    const acom = parseNumber(r['Carga Acometida'] || r['Acometida'] || r['ACOMETIDA'])
    const cont = parseNumber(r['Carga Contador'] || r['Contador'] || r['CONTADOR'])
    const diffCarga = acom - cont
    const diffMin = diffMinutes(horaIniISO || fecha, horaFinISO || fecha)

    return {
      id: crypto.randomUUID(),
      clienteId,
      fechaLecturaISO: fecha,
      pinzas73DiffMin: diffMin,
      cargaRealAcometida: acom,
      cargaRealContador: cont,
      diferenciaCarga: diffCarga,
      flags: {
        pinzasOk: diffMin <= 1,
        diferenciaOk: diffCarga > 0.5,
      },
      fuenteFila: idx + 2,
    } as ExpedienteAnalisis
  })
}

export async function parseAnalisisExcel(file: File): Promise<ExpedienteAnalisis[]> {
  const buf = await file.arrayBuffer()
  const wb = readWorkbookFromArrayBuffer(buf)
  return parseAnalisisFromWorkbook(wb)
}

export function extractRawSheet(wb: XLSX.WorkBook, sheetIndex = 0): RawSheet {
  const sheetName = wb.SheetNames[sheetIndex]
  const sheet = wb.Sheets[sheetName]
  // Usamos header:1 para obtener arreglo de filas con celdas, donde la primera fila son headers tal cual
  const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as any[][]
  const headers = (aoa[0] || []).map(h => String(h ?? ''))
  const body = aoa.slice(1)
  const rows = body.map(row => {
    const obj: Record<string, any> = {}
    headers.forEach((h, idx) => { obj[h] = row[idx] })
    return obj
  })
  return { sheetName, headers, rows }
}
