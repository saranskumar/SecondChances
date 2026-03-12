import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyListings, createProduct } from '@/actions/products'
import { getMyOrders } from '@/actions/orders'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, ConditionBadge } from '@/components/ui/Badge'
import styles from './page.module.css'

async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data ?? []
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; tab?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')

    const params = await searchParams
    const activeTab = params.tab ?? 'orders'

    const [listings, orders, categories] = await Promise.all([
        getMyListings(),
        getMyOrders(),
        getCategories(),
    ])

    return (
        <div className="container section">
            {/* Header */}
            <div className={styles.header}>
                <h1>My Dashboard</h1>
                <p>Buy and sell from a single place - your account does it all</p>
            </div>

            {params.success && (
                <div className={styles.successBanner}>✓ Your listing is now live on Browse!</div>
            )}

            {/* Tab bar */}
            <div className={styles.tabs}>
                <Link
                    href="/dashboard?tab=orders"
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                >
                    My Orders
                    {orders.length > 0 && <span className={styles.count}>{orders.length}</span>}
                </Link>
                <Link
                    href="/dashboard?tab=listings"
                    className={`${styles.tab} ${activeTab === 'listings' ? styles.activeTab : ''}`}
                >
                    My Listings
                    {listings.length > 0 && <span className={styles.count}>{listings.length}</span>}
                </Link>
                <Link
                    href="/dashboard?tab=sell"
                    className={`${styles.tab} ${activeTab === 'sell' ? styles.activeTab : ''}`}
                >
                    + List an Item
                </Link>
            </div>

            {/* ── Tab: My Orders ────────────────────────────── */}
            {activeTab === 'orders' && (
                <div className={styles.panel}>
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
                                                <p className={styles.orderId}>
                                                    Order #{(order.id as string).slice(0, 8).toUpperCase()}
                                                </p>
                                                <p className={styles.orderDate}>
                                                    {new Date(order.created_at as string).toLocaleDateString('en-IN', {
                                                        year: 'numeric', month: 'long', day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className={styles.orderRight}>
                                                <StatusBadge status={order.status as string} />
                                                <span className={styles.orderTotal}>
                                                    ₹{(order.total_amount as number).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.thumbRow}>
                                            {items.map((item: Record<string, unknown>) => {
                                                const product = item.products as Record<string, unknown>
                                                return (
                                                    <div key={item.id as string} className={styles.itemThumb}>
                                                        {(product?.image_urls as string[])?.[0] && (
                                                            <Image
                                                                src={(product.image_urls as string[])[0]}
                                                                alt={product.title as string}
                                                                fill sizes="72px"
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className={styles.orderFooter}>
                                            <p className={styles.itemCount}>
                                                {items.length} item{items.length !== 1 ? 's' : ''}
                                            </p>
                                            <Link href={`/orders/${order.id as string}`}>
                                                <Button variant="ghost" size="sm">Track Order →</Button>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: My Listings ──────────────────────────── */}
            {activeTab === 'listings' && (
                <div className={styles.panel}>
                    {listings.length === 0 ? (
                        <div className={styles.empty}>
                            <p>You haven&apos;t listed anything yet.</p>
                            <Link href="/dashboard?tab=sell"><Button variant="outline">List an Item</Button></Link>
                        </div>
                    ) : (
                        <div className={styles.listingsList}>
                            {listings.map((p: Record<string, unknown>) => (
                                <div key={p.id as string} className={styles.listingRow}>
                                    <div className={styles.listingImg}>
                                        {(p.image_urls as string[])?.length > 0 ? (
                                            <Image
                                                src={(p.image_urls as string[])[0]}
                                                alt={p.title as string}
                                                fill sizes="64px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : <span>–</span>}
                                    </div>
                                    <div className={styles.listingInfo}>
                                        <p className={styles.listingTitle}>{p.title as string}</p>
                                        <p className={styles.listingMeta}>
                                            ₹{(p.price as number).toLocaleString()} ·{' '}
                                            {(p.categories as { name: string })?.name}
                                        </p>
                                    </div>
                                    <div className={styles.listingBadges}>
                                        <StatusBadge status={p.status as string} />
                                        <ConditionBadge condition={p.condition as string} />
                                    </div>
                                    <Link href={`/products/${p.id as string}`} className={styles.viewLink}>
                                        View →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: List an Item ─────────────────────────── */}
            {activeTab === 'sell' && (
                <div className={styles.panel}>
                    <div className={styles.formWrap}>
                        <h2 className={styles.formTitle}>New Listing</h2>
                        <form action={createProduct} className={styles.form} encType="multipart/form-data">
                            <Input id="title" name="title" label="Title" placeholder="Vintage denim jacket, size M" required />
                            <Textarea
                                id="description" name="description" label="Description"
                                placeholder="Describe the item - its story, any wear marks, measurements…"
                            />
                            <div className={styles.row}>
                                <Input id="price" name="price" type="number" label="Price (₹)"
                                    placeholder="499" min="1" step="1" required />
                                <Select id="condition" name="condition" label="Condition" required>
                                    <option value="like_new">Like New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                </Select>
                            </div>
                            <Select id="category_id" name="category_id" label="Category" required>
                                <option value="">Select a category</option>
                                {categories.map((c: { id: number; name: string }) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                            <div className={styles.uploadField}>
                                <label className={styles.uploadLabel}>Photos</label>
                                <input type="file" name="images" multiple accept="image/*" className={styles.fileInput} />
                                <p className={styles.uploadHint}>First photo becomes the cover image.</p>
                            </div>
                            <Button type="submit" style={{ width: '100%' }}>Publish Listing</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
