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
                    {orders.map((order: Record<string, unknown>) => {
                        const items = (order.order_items as Record<string, unknown>[]) ?? []
                        return (
                            <div key={order.id as string} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div>
                                        <p className={styles.orderId}>Order #{(order.id as string).slice(0, 8).toUpperCase()}</p>
                                        <p className={styles.orderDate}>{new Date(order.created_at as string).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className={styles.orderRight}>
                                        <StatusBadge status={order.status as string} />
                                        <span className={styles.orderTotal}>₹{(order.total_amount as number).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className={styles.itemsRow}>
                                    {items.map((item: Record<string, unknown>) => {
                                        const product = item.products as Record<string, unknown>
                                        return (
                                            <div key={item.id as string} className={styles.itemThumb}>
                                                {(product?.image_urls as string[])?.[0] ? (
                                                    <Image src={(product.image_urls as string[])[0]} alt={product.title as string} fill sizes="80px" style={{ objectFit: 'cover' }} />
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className={styles.orderFooter}>
                                    <p className={styles.itemCount}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
                                    <Link href={`/orders/${order.id as string}`}>
                                        <Button variant="ghost" size="sm">View Details →</Button>
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
