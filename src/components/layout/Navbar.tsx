'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Search, User, Menu, X, Heart } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import styles from './Navbar.module.css'

const NAV_CATEGORIES = [
    {
        heading: 'Women',
        links: ['Tops & T-shirts', 'Dresses', 'Bottoms', 'Outerwear', 'Bags', 'Accessories'],
    },
    {
        heading: 'Men',
        links: ['Shirts & T-shirts', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Vintage'],
    },
]

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [query, setQuery] = useState('')
    const searchRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => { setMenuOpen(false) }, [pathname])

    useEffect(() => {
        if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
    }, [searchOpen])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/browse?q=${encodeURIComponent(query.trim())}`)
            setSearchOpen(false)
            setQuery('')
        }
    }

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.inner}>
                    {/* Left — burger */}
                    <button
                        className={styles.burger}
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Center — logo */}
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoSecond}>Second</span>
                        <span className={styles.logoDot}> · </span>
                        <span className={styles.logoChances}>Chances</span>
                    </Link>

                    {/* Right — icons */}
                    <div className={styles.icons}>
                        <button
                            className={styles.iconBtn}
                            onClick={() => setSearchOpen(s => !s)}
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                        <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                            <ShoppingBag size={20} />
                        </Link>
                        <Link
                            href={user ? '/profile' : '/auth'}
                            className={styles.iconBtn}
                            aria-label="Account"
                        >
                            <User size={20} />
                        </Link>
                    </div>
                </div>

                {/* Search bar (drops below navbar) */}
                {searchOpen && (
                    <div className={styles.searchBar}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search for vintage, denim, tops…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            <button type="submit" className={styles.searchSubmit}>Go</button>
                        </form>
                    </div>
                )}
            </nav>

            {/* Slide-out side menu */}
            {menuOpen && (
                <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
            )}
            <aside className={`${styles.sideMenu} ${menuOpen ? styles.sideOpen : ''}`}>
                <div className={styles.sideHeader}>
                    <Link href="/" className={styles.sideLogo}>Second · Chances</Link>
                    <button className={styles.sideClose} onClick={() => setMenuOpen(false)}>
                        <X size={22} />
                    </button>
                </div>

                <nav className={styles.sideNav}>
                    {NAV_CATEGORIES.map(cat => (
                        <div key={cat.heading} className={styles.sideSection}>
                            <p className={styles.sideSectionHead}>{cat.heading}</p>
                            {cat.links.map(link => (
                                <Link
                                    key={link}
                                    href={`/browse?category=${link.toLowerCase().replace(/[^a-z]/g, '-')}`}
                                    className={styles.sideLink}
                                >
                                    {link}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className={styles.sideMeta}>
                    {user ? (
                        <>
                            <Link href="/profile" className={styles.sideAction}>My Profile</Link>
                            <Link href="/dashboard/seller" className={styles.sideAction}>Sell an Item</Link>
                            <Link href="/dashboard/buyer" className={styles.sideAction}>My Orders</Link>
                        </>
                    ) : (
                        <Link href="/auth" className={styles.sideAction}>Sign In / Sign Up</Link>
                    )}
                    <Link href="/browse" className={styles.sideAction}>Browse All</Link>
                </div>
            </aside>
        </>
    )
}
