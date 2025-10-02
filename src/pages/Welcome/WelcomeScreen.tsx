import React from 'react'
import styles from './WelcomeScreen.module.css'

interface WelcomeScreenProps {
  onSelectGestion?: (tipo: 'fraude' | 'averia') => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectGestion }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenido a ValorApp</h1>
      <p className={styles.subtitle}>¿Qué tipo de gestión desea realizar hoy?</p>
      <div className={styles.buttonsRow}>
        <button
          type="button"
          className={styles.btnFraude}
          onClick={() => onSelectGestion?.('fraude')}
        >
          ⚠️ Fraude
        </button>
        <button
          type="button"
          className={styles.btnAveria}
          onClick={() => onSelectGestion?.('averia')}
        >
          🔧 Avería
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen