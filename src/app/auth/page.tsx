'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import styles from './page.module.css'

type Mode = 'login' | 'signup'

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>('login')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ email: '', password: '', name: '' })
    const router = useRouter()
    const supabase = createClient()

    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                    options: {
                        data: { display_name: form.name },
                    },
                })
                if (error) throw error
                toast.success('Account created! Check your email to confirm.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                })
                if (error) throw error
                toast.success('Welcome back!')
                router.push('/')
                router.refresh()
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logoBlock}>
                    <h1 className={styles.logo}>Second · Chances</h1>
                    <p className={styles.tagline}>
                        {mode === 'login' ? 'Welcome back' : 'Join the community'}
                    </p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
                        onClick={() => setMode('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {mode === 'signup' && (
                        <Input
                            id="name"
                            label="Your Name"
                            placeholder="Jane Doe"
                            value={form.name}
                            onChange={e => update('name', e.target.value)}
                            required
                        />
                    )}

                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="hello@example.com"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => update('password', e.target.value)}
                        required
                        minLength={6}
                    />

                    {mode === 'signup' && (
                        <p className={styles.hint}>
                            One account — list items to sell and shop everything in one place.
                        </p>
                    )}

                    <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
