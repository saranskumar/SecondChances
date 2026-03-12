import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyOrders } from '@/actions/orders'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'

export default async function BuyerDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')

    const orders = await getMyOrders()

    return (
        <div className="container section">
            <div className={styles.header}>
                <div>
                    <h1>My Orders</h1>
                    <p>Track everything you&apos;ve bought on Second Chances</p>
                </div>
                <Link href="/dashboard/seller">
                    <Button variant="ghost" size="sm">Sell an Item →</Button>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className={styles.empty}>
                    <p>You haven&apos;t placed any orders yet.</p>
                    <Link href="/browse"><Button variant="outline">Start Shopping</Button></Link>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {orders.map((order: any) => {
                        const items = order.order_items ?? []
                        return (
                            <div key={order.id} className={styles.orderCard}>
                                {/* ── Card header ───────────────── */}
                                <div className={styles.orderHeader}>
                                    <div>
                                        <p className={styles.orderId}>
                                            Order #{order.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className={styles.orderDate}>
                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className={styles.orderRight}>
                                        <StatusBadge status={order.status} />
                                        <span className={styles.orderTotal}>
                                            ₹{Number(order.total_amount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Items list ─────────────────── */}
                                <div className={styles.itemsList}>
                                    {items.map((item: any) => {
                                        const product = item.products
                                        return (
                                            <div key={item.id} className={styles.orderItem}>
                                                <div className={styles.itemImg}>
                                                    {product?.image_urls?.[0] && (
                                                        <Image
                                                            src={product.image_urls[0]}
                                                            alt={product.title}
                                                            fill sizes="64px"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    )}
                                                </div>
                                                <div className={styles.itemInfo}>
                                                    <Link href={`/products/${product?.id}`} className={styles.itemName}>
                                                        {product?.title}
                                                    </Link>
                                                    <p className={styles.itemPrice}>
                                                        ₹{Number(product?.price).toLocaleString()}
                                                    </p>
                                                </div>
                                                <StatusBadge status={product?.status ?? 'available'} />
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* ── Shipping info ──────────────── */}
                                <div className={styles.shippingRow}>
                                    <div className={styles.shippingBlock}>
                                        <p className={styles.shippingLabel}>Delivering to</p>
                                        <p className={styles.shippingVal}>
                                            {order.shipping_name} · {order.shipping_address}, {order.shipping_city}
                                        </p>
                                        <p className={styles.shippingVal}>{order.shipping_phone}</p>
                                    </div>
                                    <div className={styles.shippingBlock}>
                                        <p className={styles.shippingLabel}>Payment</p>
                                        <p className={styles.shippingVal}>Cash on Delivery</p>
                                        <p className={styles.codNote}>Pay only when you&apos;re satisfied</p>
                                    </div>
                                </div>

                                {/* ── Footer ────────────────────── */}
                                <div className={styles.orderFooter}>
                                    <p className={styles.itemCount}>
                                        {items.length} item{items.length !== 1 ? 's' : ''}
                                    </p>
                                    <Link href={`/orders/${order.id}`}>
                                        <Button variant="ghost" size="sm">Track Order →</Button>
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
