'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        setLoading(false)
        if (error) toast.error(error.message)
        else setSent(true)
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <p className={styles.eyebrow}>Second · Chances</p>
                <h1 className={styles.title}>Forgot password?</h1>
                <p className={styles.subtitle}>
                    {sent
                        ? 'Check your inbox for a reset link. You can close this tab.'
                        : "Enter your email and we'll send a reset link."}
                </p>

                {!sent && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input id="email" type="email" label="Email" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                            Send Reset Link
                        </Button>
                    </form>
                )}

                <p className={styles.switchText}>
                    <Link href="/auth/login" className={styles.switchLink}>← Back to login</Link>
                </p>
            </div>
        </div>
    )
}
