import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/actions/orders'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Check, Truck, Home } from 'lucide-react'
import type { OrderWithItems } from '@/types/database'
import styles from './page.module.css'

const STATUS_STEPS = ['paid', 'shipped', 'delivered'] as const

const STEP_CONFIG = {
    paid: { Icon: Check, label: 'Order Confirmed' },
    shipped: { Icon: Truck, label: 'Shipped' },
    delivered: { Icon: Home, label: 'Delivered' },
}

export default async function OrderTrackingPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')

    const { id } = await params
    const rawOrder = await getOrderById(id)
    if (!rawOrder) notFound()

    const order = rawOrder as unknown as OrderWithItems & {
        shipping_name: string | null
        shipping_address: string | null
        shipping_city: string | null
        shipping_phone: string | null
    }

    const currentStep = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number])

    return (
        <div className="container section">
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <h1 className={styles.title}>
                        {order.status === 'delivered' ? 'Your order arrived!' : 'Order Tracking'}
                    </h1>
                    <p className={styles.date}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            {/* Progress tracker */}
            <div className={styles.tracker}>
                {STATUS_STEPS.map((step, idx) => {
                    const { Icon, label } = STEP_CONFIG[step]
                    const done = idx <= currentStep
                    const active = idx === currentStep
                    return (
                        <div key={step} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                            <div className={styles.stepIcon}>
                                <Icon size={18} />
                            </div>
                            <p className={styles.stepLabel}>{label}</p>
                        </div>
                    )
                })}
            </div>

            <div className={styles.layout}>
                {/* Items */}
                <div className={styles.items}>
                    <h2 className={styles.sectionTitle}>Items in this Order</h2>
                    {order.order_items?.map(item => {
                        const product = item.products
                        return (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemImg}>
                                    {product?.image_urls?.[0] && (
                                        <Image
                                            src={product.image_urls[0]}
                                            alt={product.title}
                                            fill
                                            sizes="80px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
                                </div>
                                <div className={styles.itemInfo}>
                                    <Link href={`/products/${product.id}`} className={styles.itemName}>
                                        {product.title}
                                    </Link>
                                    <p className={styles.itemPrice}>₹{Number(item.price_at_purchase).toLocaleString()}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Shipping + Summary */}
                <div className={styles.sidePanel}>
                    <div className={styles.panel}>
                        <h3>Shipping To</h3>
                        <p>{order.shipping_name}</p>
                        <p>{order.shipping_address}</p>
                        <p>{order.shipping_city}</p>
                        <p>{order.shipping_phone}</p>
                    </div>

                    <div className={styles.panel}>
                        <h3>Order Total</h3>
                        <div className={styles.totalRow}>
                            <span>Total Paid</span>
                            <span className={styles.totalAmount}>₹{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                    </div>

                    <Link href="/browse">
                        <Button variant="outline" style={{ width: '100%' }}>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
