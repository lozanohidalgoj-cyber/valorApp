// Parser CSV sencillo con soporte básico de comillas y CRLF
export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

const stripBOM = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s)

const detectDelimiter = (sample: string): ',' | ';' | '\t' => {
  // Leer primera línea fuera de comillas para contar separadores
  let inQuotes = false
  let commas = 0
  let semicolons = 0
  let tabs = 0
  for (let i = 0; i < sample.length; i++) {
    const ch = sample[i]
    if (ch === '"') {
      const next = sample[i + 1]
      if (next === '"') { i++; continue }
      inQuotes = !inQuotes
      continue
    }
    if (ch === '\n' || ch === '\r') break
    if (!inQuotes) {
      if (ch === ',') commas++
      else if (ch === ';') semicolons++
      else if (ch === '\t') tabs++
    }
  }
  if (semicolons >= commas && semicolons >= tabs) return ';'
  if (commas >= semicolons && commas >= tabs) return ','
  return '\t'
}

export const parseCSV = (rawText: string): ParsedCSV => {
  const text = stripBOM(rawText)
  const delim = detectDelimiter(text)
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    current.push(field)
    field = ''
  }
  const pushRow = () => {
    rows.push(current)
    current = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1]
        if (next === '"') {
          field += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') { inQuotes = true; continue }

    if (ch === delim) { pushField(); continue }

    if (ch === '\n') { pushField(); pushRow(); continue }
    if (ch === '\r') { continue }

    field += ch
  }

  // Finalizar último campo/fila si hay contenido pendiente o si el texto no terminaba con \n
  if (field.length > 0 || current.length > 0) { pushField(); pushRow() }

  if (rows.length === 0) return { headers: [], rows: [] }

  const headers = rows[0].map(h => (h ?? '').trim())
  const body = rows.slice(1).map(r => {
    const obj: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i] || `col_${i + 1}`
      const value = (r[i] ?? '').trim()
      obj[key] = value
    }
    return obj
  })

  return { headers, rows: body }
}

