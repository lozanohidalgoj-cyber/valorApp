import React from 'react'
import styles from './Card.module.css'

export interface CardProps {
  children: React.ReactNode
  className?: string
}

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const classes = [styles.card, className].filter(Boolean).join(' ')
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  const classes = [styles.header, className].filter(Boolean).join(' ')
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}