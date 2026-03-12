'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
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
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { display_name: form.name },
            },
        })
        setLoading(false)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Check your email for the confirmation code!')
            router.push(`/auth/verify-otp?email=${encodeURIComponent(form.email)}`)
        }
    }

    const handleGoogle = async () => {
        setGoogleLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            toast.error(error.message)
            setGoogleLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <p className={styles.eyebrow}>Second · Chances</p>
                <h1 className={styles.title}>Create account</h1>
                <p className={styles.subtitle}>Buy and sell from a single account — no roles needed</p>

                {/* Google */}
                <button
                    className={styles.googleBtn}
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    type="button"
                >
                    <GoogleIcon />
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>

                <div className={styles.divider}>or</div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input id="name" label="Your Name" placeholder="Jane Doe"
                        value={form.name} onChange={e => update('name', e.target.value)} required />
                    <Input id="email" type="email" label="Email" placeholder="you@example.com"
                        value={form.email} onChange={e => update('email', e.target.value)} required />
                    <Input id="password" type="password" label="Password" placeholder="Min. 8 characters"
                        value={form.password} onChange={e => update('password', e.target.value)}
                        required minLength={8} />
                    <Input id="confirm" type="password" label="Confirm Password" placeholder="Repeat password"
                        value={form.confirm} onChange={e => update('confirm', e.target.value)} required />

                    <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        Create Account
                    </Button>
                </form>

                <p className={styles.switchText}>
                    Already have an account?{' '}
                    <Link href="/auth/login" className={styles.switchLink}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
    )
}
