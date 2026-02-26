'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import styles from './page.module.css'

export default function CartPage() {
    const { items, removeItem, count } = useCart()
    const total = items.reduce((sum, i) => sum + Number(i.product.price), 0)

    if (count === 0) {
        return (
            <div className={`container section ${styles.empty}`}>
                <p>Your cart is empty.</p>
                <Link href="/browse"><Button variant="outline">Browse Items</Button></Link>
            </div>
        )
    }

    return (
        <div className="container section">
            <h1 className={styles.title}>Your Cart</h1>

            <div className={styles.layout}>
                <div className={styles.items}>
                    {items.map(({ product }) => (
                        <div key={product.id} className={styles.item}>
                            <div className={styles.itemImg}>
                                {product.image_urls?.[0] ? (
                                    <Image src={product.image_urls[0]} alt={product.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
                                ) : null}
                            </div>
                            <div className={styles.itemInfo}>
                                <Link href={`/products/${product.id}`} className={styles.itemName}>{product.title}</Link>
                                <p className={styles.itemPrice}>₹{Number(product.price).toLocaleString()}</p>
                            </div>
                            <button className={styles.removeBtn} onClick={() => removeItem(product.id)} aria-label="Remove">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.summary}>
                    <h2>Order Summary</h2>
                    <div className={styles.summaryRows}>
                        <div className={styles.summaryRow}>
                            <span>{count} item{count !== 1 ? 's' : ''}</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span className={styles.freeShip}>Free</span>
                        </div>
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>
                    <Link href="/checkout" style={{ display: 'block' }}>
                        <Button size="lg" style={{ width: '100%' }}>Proceed to Checkout</Button>
                    </Link>
                    <Link href="/browse" className={styles.continueLink}>Continue Shopping →</Link>
                </div>
            </div>
        </div>
    )
}
