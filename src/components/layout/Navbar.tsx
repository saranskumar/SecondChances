'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X, Tag } from 'lucide-react'
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

    const isActive = (href: string) => pathname === href

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
                            {/* Any signed-in user can sell */}
                            <Link href="/dashboard/seller" className={`${styles.link} ${isActive('/dashboard/seller') ? styles.activeLink : ''}`}>
                                <Tag size={15} style={{ display: 'inline', marginRight: 4 }} />
                                Sell
                            </Link>
                            {/* Cart */}
                            <Link href="/cart" className={styles.iconLink} aria-label="Cart">
                                <ShoppingBag size={20} />
                            </Link>
                            {/* Account / orders */}
                            <Link href="/dashboard/buyer" className={styles.iconLink} aria-label="My Orders">
                                <User size={20} />
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
