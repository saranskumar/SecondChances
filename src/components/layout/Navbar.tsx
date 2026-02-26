'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import styles from './Navbar.module.css'

export function Navbar() {
    const pathname = usePathname()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <nav className={styles.nav}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoWord}>Second</span>
                    <span className={styles.logoDot}>·</span>
                    <span className={styles.logoWord}>Chances</span>
                </Link>

                <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
                    <Link href="/browse" className={`${styles.link} ${isActive('/browse') ? styles.activeLink : ''}`}>
                        Browse
                    </Link>

                    {user ? (
                        <>
                            {/* Cart */}
                            <Link href="/cart" className={styles.iconLink} aria-label="Cart">
                                <ShoppingBag size={20} />
                            </Link>
                            {/* Unified dashboard — buy, sell, orders, listings */}
                            <Link
                                href="/dashboard"
                                className={`${styles.iconLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}
                                aria-label="Dashboard"
                            >
                                <LayoutDashboard size={20} />
                            </Link>
                        </>
                    ) : (
                        <Link href="/auth" className={styles.authBtn}>Sign In</Link>
                    )}
                </div>

                <button
                    className={styles.menuBtn}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>
        </nav>
    )
}
