import React from 'react'
import styles from './Textarea.module.css'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const textareaClasses = [
    styles.textarea,
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
      
      <textarea
        className={textareaClasses}
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