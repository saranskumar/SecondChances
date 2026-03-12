'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import styles from '../auth.module.css'

export default function ResetPasswordPage() {
    const [form, setForm] = useState({ password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        if (form.password !== form.confirm) {
            toast.error('Passwords do not match')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password: form.password })
        setLoading(false)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Password updated! Signing you in…')
            router.push('/dashboard')
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <p className={styles.eyebrow}>Second · Chances</p>
                <h1 className={styles.title}>Set new password</h1>
                <p className={styles.subtitle}>Choose a strong password - at least 8 characters.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input id="password" type="password" label="New Password" placeholder="Min. 8 characters"
                        value={form.password} onChange={e => update('password', e.target.value)}
                        required minLength={8} />
                    <Input id="confirm" type="password" label="Confirm Password" placeholder="Repeat password"
                        value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
                    <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        Update Password
                    </Button>
                </form>
            </div>
        </div>
    )
}
