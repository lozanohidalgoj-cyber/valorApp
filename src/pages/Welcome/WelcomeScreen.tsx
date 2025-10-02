import React, { useState } from 'react'
import styles from './WelcomeScreen.module.css'

interface WelcomeScreenProps {
  onSelectGestion?: (tipo: 'fraude' | 'averia') => void
  onSelectSubtipoAveria?: (sub: 'wart' | 'error_averia' | 'error_montaje') => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectGestion, onSelectSubtipoAveria }) => {
  const [showAveriaSubs, setShowAveriaSubs] = useState(false)

  const handleAveria = () => {
    setShowAveriaSubs(true)
    onSelectGestion?.('averia')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenido a ValorApp</h1>
      <p className={styles.subtitle}>¿Qué tipo de gestión desea realizar hoy?</p>

      <div className={styles.buttonsRow}>
        {!showAveriaSubs && (
          <>
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
              onClick={handleAveria}
            >
              🔧 Avería
            </button>
          </>
        )}

        {showAveriaSubs && (
          <div className={styles.subButtonsWrapper}>
            <p className={styles.subLabel}>Seleccione el tipo de avería:</p>
            <div className={styles.subButtonsRow}>
              <button
                type="button"
                className={styles.subBtnPrimary}
                onClick={() => onSelectSubtipoAveria?.('wart')}
              >
                🛠️ WART
              </button>
              <button
                type="button"
                className={styles.subBtnNeutral}
                onClick={() => onSelectSubtipoAveria?.('error_averia')}
              >
                ❗ Error de Avería
              </button>
              <button
                type="button"
                className={styles.subBtnNeutral}
                onClick={() => onSelectSubtipoAveria?.('error_montaje')}
              >
                ⚙️ Error de Montaje
              </button>
            </div>
            <div className={styles.subActions}>
              <button
                type="button"
                className={styles.backLink}
                onClick={() => setShowAveriaSubs(false)}
              >
                ← Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeScreen