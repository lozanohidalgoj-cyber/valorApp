import React, { useCallback, useRef, useState } from 'react'

interface Props {
  onUpload: (file: File) => void
}

export const AnalisisUploader: React.FC<Props> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file?: File) => {
    if (file) onUpload(file)
  }, [onUpload])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; handleFile(f) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#0057ff' : '#b9c7df'}`,
          background: dragOver ? '#eef5ff' : '#fafcff',
          padding: '1.5rem',
          borderRadius: 16,
          textAlign: 'center',
          cursor: 'pointer',
          color: '#1f3b63'
        }}
      >
        <div style={{ fontWeight: 700 }}>Sube tu Excel de análisis (.xlsm / .xlsx)</div>
        <div style={{ fontSize: '.9rem', opacity: 0.8 }}>Arrastra y suelta o haz clic para seleccionar</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx,.xlsm"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
