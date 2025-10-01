import React from 'react'
import { UI_TEXT } from '../../constants'
import styles from './LoginHeader.module.css'

export const LoginHeader: React.FC = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{UI_TEXT.APP_TITLE}</h1>
      <p className={styles.subtitle}>{UI_TEXT.APP_SUBTITLE}</p>
      
      <div className={styles.demoCredentials}>
        <p className={styles.demoTitle}>🔑 Credenciales de prueba:</p>
        <div className={styles.credentialsList}>
          <div className={styles.credential}>
            <strong>Admin:</strong> admin / admin123
          </div>
          <div className={styles.credential}>
            <strong>Valorador:</strong> valorador / valorador123
          </div>
        </div>
      </div>
    </div>
  )
}