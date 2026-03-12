'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Link from 'next/link'
import styles from '../auth.module.css'

function VerifyOtpForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') ?? ''
    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null))
    const supabase = createClient()

    // Countdown for resend
    useEffect(() => {
        if (resendCooldown <= 0) return
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [resendCooldown])

    const handleDigit = (idx: number, val: string) => {
        const char = val.replace(/\D/g, '').slice(-1)
        const next = [...digits]
        next[idx] = char
        setDigits(next)
        if (char && idx < 5) refs[idx + 1].current?.focus()
    }

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            refs[idx - 1].current?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const next = [...digits]
        text.split('').forEach((c, i) => { next[i] = c })
        setDigits(next)
        refs[Math.min(text.length, 5)].current?.focus()
    }

    const otp = digits.join('')

    const handleVerify = async () => {
        if (otp.length < 6) { toast.error('Enter all 6 digits'); return }
        setLoading(true)
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        })
        setLoading(false)
        if (error) {
            toast.error(error.message)
            setDigits(['', '', '', '', '', ''])
            refs[0].current?.focus()
        } else {
            toast.success('Email verified! Welcome to Second Chances')
            router.push('/dashboard')
            router.refresh()
        }
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return
        const { error } = await supabase.auth.resend({ email, type: 'signup' })
        if (error) toast.error(error.message)
        else { toast.success('New code sent!'); setResendCooldown(60) }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <p className={styles.eyebrow}>Second · Chances</p>
                <h1 className={styles.title}>Check your inbox</h1>
                <p className={styles.subtitle}>
                    We sent a 6-digit code to<br />
                    <strong>{email || 'your email'}</strong>
                </p>

                <div className={styles.otpRow} onPaste={handlePaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={refs[i]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleDigit(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className={`${styles.otpBox} ${d ? styles.otpFilled : ''}`}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                <Button
                    onClick={handleVerify}
                    loading={loading}
                    style={{ width: '100%', marginTop: '1.5rem' }}
                >
                    Verify Code
                </Button>

                <div className={styles.resendRow}>
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className={styles.resendBtn}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                    <Link href="/auth/login" className={styles.switchLink}>Back to login</Link>
                </div>
            </div>
        </div>
    )
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className={styles.page}></div>}>
            <VerifyOtpForm />
        </Suspense>
    )
}
