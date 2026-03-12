'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { placeOrder } from '@/actions/orders'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { Check, Package, Phone, Star, Lock, Banknote } from 'lucide-react'
import styles from './page.module.css'

type Step = 1 | 2 | 3 | 4   // 4 = success

const STEP_LABELS = ['Review Cart', 'Shipping', 'Confirm']

export default function CheckoutPage() {
    const { items, clearCart, count } = useCart()
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' })
    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
    const total = items.reduce((sum, i) => sum + Number(i.product.price), 0)

    if (count === 0 && step !== 4) {
        return (
            <div className={`container section ${styles.empty}`}>
                <p>Your cart is empty.</p>
                <Link href="/browse"><Button variant="outline">Browse Items</Button></Link>
            </div>
        )
    }

    const handlePlaceOrder = async () => {
        setLoading(true)
        try {
            const id = await placeOrder({
                productIds: items.map(i => i.product.id),
                shipping: form,
            })
            clearCart()
            setOrderId(id)
            setStep(4)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to place order'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    // ── Success screen ──────────────────────────────────────
    if (step === 4 && orderId) {
        return (
            <div className="container section">
                <div className={styles.successWrap}>
                    <div className={styles.successIcon}><Check size={32} strokeWidth={2.5} /></div>
                    <h1 className={styles.successTitle}>Order Placed!</h1>
                    <p className={styles.successSub}>
                        Order <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> · ₹{total.toLocaleString()}
                    </p>

                    <div className={styles.nextSteps}>
                        <p className={styles.nextStepsTitle}>What happens next</p>
                        <div className={styles.stepsList}>
                            <div className={styles.nextStep}>
                                <div className={styles.nextStepIcon}><Package size={18} /></div>
                                <div>
                                    <p className={styles.nextStepHead}>Order confirmed</p>
                                    <p className={styles.nextStepBody}>Your order has been recorded and the seller has been notified.</p>
                                </div>
                            </div>
                            <div className={styles.nextStep}>
                                <div className={styles.nextStepIcon}><Phone size={18} /></div>
                                <div>
                                    <p className={styles.nextStepHead}>Seller will contact you</p>
                                    <p className={styles.nextStepBody}>Expect a call or message at <strong>{form.phone}</strong> within 24 hours to arrange delivery.</p>
                                </div>
                            </div>
                            <div className={styles.nextStep}>
                                <div className={styles.nextStepIcon}><Star size={18} /></div>
                                <div>
                                    <p className={styles.nextStepHead}>Inspect before paying</p>
                                    <p className={styles.nextStepBody}>Check the item when it arrives. Pay cash on delivery only once you&apos;re happy with it.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.successActions}>
                        <Button onClick={() => router.push(`/orders/${orderId}`)}>Track My Order</Button>
                        <Link href="/browse"><Button variant="outline">Continue Shopping</Button></Link>
                    </div>
                </div>
            </div>
        )
    }

    // ── Stepper header ─────────────────────────────────────
    return (
        <div className="container section">
            <h1 className={styles.pageTitle}>Checkout</h1>

            {/* Step indicator */}
            <div className={styles.stepper}>
                {STEP_LABELS.map((label, i) => {
                    const s = (i + 1) as 1 | 2 | 3
                    const done = step > s
                    const active = step === s
                    return (
                        <div key={s} className={`${styles.stepItem} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
                            <div className={styles.stepBubble}>
                                {done ? <Check size={14} strokeWidth={3} /> : s}
                            </div>
                            <span className={styles.stepLabel}>{label}</span>
                            {i < STEP_LABELS.length - 1 && <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />}
                        </div>
                    )
                })}
            </div>

            <div className={styles.layout}>
                <div className={styles.main}>
                    {/* ── Step 1: Review Cart ──────────────────── */}
                    {step === 1 && (
                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>Review Your Items</h2>
                            <div className={styles.cartItems}>
                                {items.map(({ product }) => (
                                    <div key={product.id} className={styles.cartItem}>
                                        <div className={styles.cartImg}>
                                            {product.image_urls?.[0] && (
                                                <Image src={product.image_urls[0]} alt={product.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
                                            )}
                                        </div>
                                        <div className={styles.cartInfo}>
                                            <p className={styles.cartName}>{product.title}</p>
                                            <p className={styles.cartCond}>Condition: {product.condition.replace('_', ' ')}</p>
                                        </div>
                                        <p className={styles.cartPrice}>₹{Number(product.price).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.notice}>
                                <Lock size={16} className={styles.noticeIcon} />
                                <p>Each item is unique and one-of-a-kind. Placing an order reserves it for you.</p>
                            </div>
                            <Button size="lg" style={{ width: '100%' }} onClick={() => setStep(2)}>
                                Continue to Shipping →
                            </Button>
                        </div>
                    )}

                    {/* ── Step 2: Shipping ─────────────────────── */}
                    {step === 2 && (
                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>Delivery Details</h2>
                            <p className={styles.panelSub}>The seller will use this to arrange delivery with you.</p>
                            <div className={styles.form}>
                                <Input id="name" label="Full Name" placeholder="Jane Doe"
                                    value={form.name} onChange={e => update('name', e.target.value)} required />
                                <Input id="phone" label="Phone Number" placeholder="+91 98765 43210"
                                    value={form.phone} onChange={e => update('phone', e.target.value)} required />
                                <Input id="address" label="Delivery Address" placeholder="House no., Street, Locality"
                                    value={form.address} onChange={e => update('address', e.target.value)} required />
                                <Input id="city" label="City / Town" placeholder="Bengaluru"
                                    value={form.city} onChange={e => update('city', e.target.value)} required />
                            </div>
                            <div className={styles.btnRow}>
                                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                                <Button
                                    onClick={() => {
                                        if (!form.name || !form.phone || !form.address || !form.city) {
                                            toast.error('Please fill in all shipping details')
                                            return
                                        }
                                        setStep(3)
                                    }}
                                >
                                    Review Order →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Confirm ──────────────────────── */}
                    {step === 3 && (
                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>Confirm Your Order</h2>

                            <div className={styles.reviewSection}>
                                <p className={styles.reviewLabel}>Delivering to</p>
                                <p className={styles.reviewVal}>{form.name}</p>
                                <p className={styles.reviewVal}>{form.address}, {form.city}</p>
                                <p className={styles.reviewVal}>{form.phone}</p>
                            </div>

                            <div className={styles.reviewSection}>
                                <p className={styles.reviewLabel}>Payment</p>
                                <div className={styles.codBadge}>
                                    <Banknote size={20} className={styles.codIcon} />
                                    <div>
                                        <p className={styles.codTitle}>Cash on Delivery</p>
                                        <p className={styles.codSub}>Pay in cash only <strong>after</strong> you&apos;ve inspected the item and are satisfied. No payment now.</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.reviewSection}>
                                <p className={styles.reviewLabel}>After you place this order</p>
                                <ul className={styles.bulletList}>
                                    <li>The seller is notified immediately</li>
                                    <li>They&apos;ll call or message you at <strong>{form.phone}</strong> within 24 hours</li>
                                    <li>You arrange pickup or delivery directly with them</li>
                                </ul>
                            </div>

                            <div className={styles.btnRow}>
                                <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                                <Button size="lg" loading={loading} onClick={handlePlaceOrder}>
                                    Place Order · ₹{total.toLocaleString()}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Order summary sidebar ───────────────── */}
                <div className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Order Summary</h3>
                    <div className={styles.sideItems}>
                        {items.map(({ product }) => (
                            <div key={product.id} className={styles.sideItem}>
                                <span className={styles.sideItemName}>{product.title}</span>
                                <span className={styles.sideItemPrice}>₹{Number(product.price).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.sideTotal}>
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>
                    <p className={styles.sideCod}>Pay on delivery · No payment now</p>
                </div>
            </div>
        </div>
    )
}
