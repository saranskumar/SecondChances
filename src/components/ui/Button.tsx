import type React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    asChild?: boolean
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <span className={styles.spinner} /> : null}
            {children}
        </button>
    )
}
