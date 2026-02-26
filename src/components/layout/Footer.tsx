import Link from 'next/link'
import styles from './Footer.module.css'

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <div className={styles.brand}>
                    <p className={styles.logo}>Second · Chances</p>
                    <p className={styles.tagline}>Every piece tells a story. Every purchase gives it a new one.</p>
                </div>
                <nav className={styles.links}>
                    <Link href="/browse">Browse</Link>
                    <Link href="/dashboard/seller">Sell</Link>
                    <Link href="/auth">Account</Link>
                </nav>
                <p className={styles.copy}>© {new Date().getFullYear()} Second Chances</p>
            </div>
        </footer>
    )
}
