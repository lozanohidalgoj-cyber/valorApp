import React from 'react'
import { ExpedienteAnalisis } from './types'

interface Props {
  items: ExpedienteAnalisis[]
}

export const AnalisisTable: React.FC<Props> = ({ items }) => {
  if (!items.length) return null

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5fb' }}>
            <th style={th}>Cliente</th>
            <th style={th}>Fecha</th>
            <th style={th}>Min Pinzas 73</th>
            <th style={th}>Carga Acometida</th>
            <th style={th}>Carga Contador</th>
            <th style={th}>Dif Carga</th>
            <th style={th}>Pinzas OK</th>
            <th style={th}>Dif {'>'} 0.5</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td style={td}>{i.clienteId}</td>
              <td style={td}>{i.fechaLecturaISO ? new Date(i.fechaLecturaISO).toLocaleString() : '-'}</td>
              <td style={td}>{i.pinzas73DiffMin.toFixed(2)}</td>
              <td style={td}>{i.cargaRealAcometida.toFixed(3)}</td>
              <td style={td}>{i.cargaRealContador.toFixed(3)}</td>
              <td style={td}>{i.diferenciaCarga.toFixed(3)}</td>
              <td style={td}><Badge ok={i.flags.pinzasOk} /></td>
              <td style={td}><Badge ok={i.flags.diferenciaOk} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.65rem 0.75rem', textAlign: 'left', color: '#203a5c', fontWeight: 700, fontSize: '.95rem' }
const td: React.CSSProperties = { padding: '0.55rem 0.75rem', borderTop: '1px solid #e6edf7', color: '#223a5c' }

const Badge: React.FC<{ ok: boolean }> = ({ ok }) => (
  <span style={{
    display: 'inline-block',
    padding: '.2rem .5rem',
    borderRadius: 999,
    fontSize: '.85rem',
    fontWeight: 700,
    color: ok ? '#0f5132' : '#842029',
    background: ok ? '#d1e7dd' : '#f8d7da',
    border: `1px solid ${ok ? '#badbcc' : '#f5c2c7'}`
  }}>{ok ? 'Sí' : 'No'}</span>
)
