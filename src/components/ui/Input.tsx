import type React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
    return (
        <div className={styles.field}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <input
                id={id}
                className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
                {...props}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    )
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
    return (
        <div className={styles.field}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <textarea
                id={id}
                className={`${styles.textarea} ${error ? styles.hasError : ''} ${className}`}
                {...props}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    children: React.ReactNode
}

export function Select({ label, error, id, className = '', children, ...props }: SelectProps) {
    return (
        <div className={styles.field}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <select
                id={id}
                className={`${styles.select} ${error ? styles.hasError : ''} ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    )
}
