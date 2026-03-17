import Link from 'next/link'
import styles from './Footer.module.css'

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.top}>
                    <h2 className={styles.getInTouch}>Get In Touch</h2>
                    <p className={styles.tagline}>
                        Questions, collabs, or just want to say hello?<br />
                        We&apos;d love to hear from you.
                    </p>
                    <a href="mailto:hello@secondchances.in" className={styles.email}>
                        hello@secondchances.in
                    </a>
                </div>

                <div className={styles.columns}>
                    <div className={styles.col}>
                        <p className={styles.brand}>Second · Chances</p>
                        <p className={styles.about}>
                            A curated marketplace for pre-loved fashion. Every item is unique,
                            every sale is final - and every piece deserves a second life.
                        </p>
                    </div>

                    <div className={styles.col}>
                        <h4>Sell With Us</h4>
                        <Link href="/dashboard?tab=sell">List an Item</Link>
                        <Link href="/dashboard?tab=listings">My Listings</Link>
                        <Link href="/dashboard?tab=orders">My Orders</Link>
                    </div>

                    <div className={styles.col}>
                        <h4>Customer Care</h4>
                        <Link href="/browse">Browse All</Link>
                        <a href="mailto:hello@secondchances.in">Contact Us</a>
                    </div>

                    <div className={styles.col}>
                        <h4>Legal</h4>
                        <Link href="/legal/privacy">Privacy Policy</Link>
                        <Link href="/legal/terms">Terms of Service</Link>
                        <Link href="/legal/shipping">Shipping Policy</Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© {new Date().getFullYear()} Second Chances. Pre-loved, always.</p>
                </div>
            </div>
        </footer>
    )
}
