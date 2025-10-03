import React from 'react'

const AnalisisExpediente: React.FC = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      background: '#f5f9ff'
    }}>
      <h1 style={{ fontSize: '2.6rem', margin: '0 0 1.25rem', fontWeight: 800, letterSpacing: '.5px', color: '#0d3d75' }}>
        Análisis de Expediente
      </h1>
      <p style={{ fontSize: '1.15rem', maxWidth: 760, textAlign: 'center', lineHeight: 1.5, color: '#1a3550', fontWeight: 500 }}>
        Bienvenido al módulo de análisis de expediente. Aquí podrá profundizar en los datos, validar inconsistencias y generar conclusiones para la valoración final.
      </p>
      <a href="#/" style={{
        marginTop: '2.5rem',
        background: 'linear-gradient(135deg,#FF1493 0%,#ff3fab 40%,#ff66c0 100%)',
        color: '#FFFFFF',
        border: '2px solid #ff8ccd',
        padding: '0.85rem 1.8rem',
        fontSize: '1rem',
        fontWeight: 700,
        borderRadius: '16px',
        textDecoration: 'none',
        boxShadow: '0 10px 26px -10px rgba(255,20,147,0.55)',
        letterSpacing: '.5px'
      }}>Volver</a>
    </div>
  )
}

export default AnalisisExpediente
