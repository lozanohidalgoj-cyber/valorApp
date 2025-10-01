import React from 'react'
import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const inputClasses = [
    styles.input,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <input
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <span className={styles.errorText}>
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  )
}