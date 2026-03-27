'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { startCheckout, confirmOrder, cancelCheckout } from '@/actions/orders'
import { getMyAddresses, type Address } from '@/actions/addresses'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { Check, Package, Phone, Star, Lock, Banknote, MapPin, Plus } from 'lucide-react'
import styles from './page.module.css'

type Step = 1 | 2 | 3 | 4   // 4 = success

const STEP_LABELS = ['Review Cart', 'Shipping', 'Confirm']

export default function CheckoutPage() {
    const { items, clearCart, count } = useCart()
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [useSaved, setUseSaved] = useState(true)
    const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' })
    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
    const total = items.reduce((sum, i) => sum + Number(i.product.price), 0)

    useEffect(() => {
        const fetchAddresses = async () => {
            const data = await getMyAddresses()
            setAddresses(data)
            const defaultAddr = data.find(a => a.is_default) || data[0]
            if (defaultAddr) {
                setForm({
                    name: defaultAddr.full_name,
                    phone: defaultAddr.phone,
                    address: defaultAddr.address,
                    city: defaultAddr.city
                })
            } else {
                setUseSaved(false)
            }
        }
        fetchAddresses()
    }, [])

    if (count === 0 && step !== 4) {
        return (
            <div className={`container section ${styles.empty}`}>
                <p>Your cart is empty.</p>
                <Link href="/browse"><Button variant="outline">Browse Items</Button></Link>
            </div>
        )
    }

    const handleStartCheckout = async () => {
        setLoading(true)
        try {
            const id = await startCheckout(items.map(i => i.product.id))
            setOrderId(id)
            setStep(2)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Items no longer available'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmOrder = async () => {
        if (!orderId) return
        setLoading(true)
        try {
            await confirmOrder(orderId, form)
            clearCart()
            setStep(4)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to confirm order'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleBack = async (targetStep: Step) => {
        if (orderId && targetStep === 1) {
            setLoading(true)
            await cancelCheckout(orderId).catch(() => {})
            setOrderId(null)
            setLoading(false)
        }
        setStep(targetStep)
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
                            <Button size="lg" style={{ width: '100%' }} loading={loading} onClick={handleStartCheckout}>
                                Continue to Shipping →
                            </Button>
                        </div>
                    )}

                    {/* ── Step 2: Shipping ─────────────────────── */}
                    {step === 2 && (
                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>Delivery Details</h2>
                            <p className={styles.panelSub}>Where should we deliver your items?</p>

                            {addresses.length > 0 && useSaved ? (
                                <div className={styles.addressPicker}>
                                    {addresses.map((a) => (
                                        <label key={a.id} className={`${styles.addressOption} ${form.address === a.address ? styles.addressSelected : ''}`}>
                                            <input
                                                type="radio"
                                                name="addressId"
                                                className={styles.radio}
                                                checked={form.address === a.address && form.name === a.full_name}
                                                onChange={() => {
                                                    setForm({
                                                        name: a.full_name,
                                                        phone: a.phone,
                                                        address: a.address,
                                                        city: a.city
                                                    })
                                                }}
                                            />
                                            <div className={styles.addrDetails}>
                                                <div className={styles.addrLabel}>
                                                    <MapPin size={12} />
                                                    {a.label}
                                                </div>
                                                <p className={styles.addrMain}>{a.full_name} · {a.phone}</p>
                                                <p className={styles.addrSub}>{a.address}, {a.city}</p>
                                            </div>
                                        </label>
                                    ))}
                                    <button className={styles.newAddressBtn} onClick={() => {
                                        setUseSaved(false);
                                        setForm({ name: '', phone: '', address: '', city: '' });
                                    }}>
                                        <Plus size={16} /> Use a different address
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.form}>
                                    <Input id="name" label="Full Name" placeholder="Jane Doe"
                                        value={form.name} onChange={e => update('name', e.target.value)} required />
                                    <Input id="phone" label="Phone Number" placeholder="+91 98765 43210"
                                        value={form.phone} onChange={e => update('phone', e.target.value)} required />
                                    <Input id="address" label="Delivery Address" placeholder="House no., Street, Locality"
                                        value={form.address} onChange={e => update('address', e.target.value)} required />
                                    <Input id="city" label="City / Town" placeholder="Bengaluru"
                                        value={form.city} onChange={e => update('city', e.target.value)} required />
                                    {addresses.length > 0 && (
                                        <Button variant="ghost" onClick={() => setUseSaved(true)} style={{ alignSelf: 'flex-start', padding: 0 }}>
                                            ← Use a saved address
                                        </Button>
                                    )}
                                </div>
                            )}
                            <div className={styles.btnRow}>
                                <Button variant="ghost" disabled={loading} onClick={() => handleBack(1)}>← Back</Button>
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
                                <Button variant="ghost" disabled={loading} onClick={() => handleBack(2)}>← Back</Button>
                                <Button size="lg" loading={loading} onClick={handleConfirmOrder}>
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
