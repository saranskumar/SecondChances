import type React from 'react'
import styles from './Card.module.css'

interface CardProps {
    children: React.ReactNode
    className?: string
    hoverable?: boolean
    style?: React.CSSProperties
}

export function Card({ children, className = '', hoverable = false, style }: CardProps) {
    return (
        <div
            className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`}
            style={style}
        >
            {children}
        </div>
    )
}
