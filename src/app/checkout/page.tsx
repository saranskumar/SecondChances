'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { placeOrder } from '@/actions/orders'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Link from 'next/link'
import styles from './page.module.css'

export default function CheckoutPage() {
    const { items, clearCart, count } = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' })
    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
    const total = items.reduce((sum, i) => sum + Number(i.product.price), 0)

    if (count === 0) {
        return (
            <div className={`container section ${styles.empty}`}>
                <p>Your cart is empty.</p>
                <Link href="/browse"><Button variant="outline">Browse Items</Button></Link>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const orderId = await placeOrder({
                productIds: items.map(i => i.product.id),
                shipping: form,
            })
            clearCart()
            toast.success('Order placed successfully!')
            router.push(`/orders/${orderId}`)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to place order'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container section">
            <h1 className={styles.title}>Checkout</h1>

            <div className={styles.layout}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.sectionTitle}>Shipping Details</h2>
                    <Input id="name" label="Full Name" placeholder="Jane Doe" value={form.name} onChange={e => update('name', e.target.value)} required />
                    <Input id="phone" label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                    <Input id="address" label="Delivery Address" placeholder="House no., Street, Locality" value={form.address} onChange={e => update('address', e.target.value)} required />
                    <Input id="city" label="City / Town" placeholder="Bengaluru" value={form.city} onChange={e => update('city', e.target.value)} required />

                    <div className={styles.paymentNote}>
                        <p>💳 Payment on Delivery</p>
                        <span>Pay in cash when your items arrive.</span>
                    </div>

                    <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
                        Place Order · ₹{total.toLocaleString()}
                    </Button>
                </form>

                <div className={styles.orderSummary}>
                    <h2 className={styles.sectionTitle}>Your Items</h2>
                    <div className={styles.summaryItems}>
                        {items.map(({ product }) => (
                            <div key={product.id} className={styles.summaryItem}>
                                <span className={styles.summaryName}>{product.title}</span>
                                <span className={styles.summaryPrice}>₹{Number(product.price).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
