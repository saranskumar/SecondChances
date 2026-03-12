import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getMyListings, createProduct } from '@/actions/products'
import { getIncomingOrders } from '@/actions/orders'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, ConditionBadge } from '@/components/ui/Badge'
import { Phone, CheckCircle2 } from 'lucide-react'
import styles from './page.module.css'

async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data ?? []
}

export default async function SellerDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')

    const params = await searchParams
    const [listings, categories, incomingOrders] = await Promise.all([
        getMyListings(), getCategories(), getIncomingOrders()
    ])

    return (
        <div className="container section">
            <div className={styles.header}>
                <div>
                    <h1>Sell an Item</h1>
                    <p>List something you want to pass on - it sells exactly once, to the right person</p>
                </div>
                <Link href="/dashboard/buyer">
                    <Button variant="ghost" size="sm">My Orders →</Button>
                </Link>
            </div>

            {params.success && (
                <div className={styles.successBanner}>
                    <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Your listing is now live on the Browse page!
                </div>
            )}

            <div className={styles.grid}>
                {/* New listing form */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>New Listing</h2>
                    <form action={createProduct} className={styles.form} encType="multipart/form-data">
                        <Input id="title" name="title" label="Title" placeholder="Vintage denim jacket, size M" required />
                        <Textarea id="description" name="description" label="Description" placeholder="Describe the item, its history, any quirks…" />

                        <div className={styles.row}>
                            <Input id="price" name="price" type="number" label="Price (₹)" placeholder="499" min="1" step="1" required />
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
                            <input
                                type="file"
                                name="images"
                                multiple
                                accept="image/*"
                                className={styles.fileInput}
                            />
                            <p className={styles.uploadHint}>Up to 5 photos. First photo is the cover.</p>
                        </div>

                        <Button type="submit" style={{ width: '100%' }}>Publish Listing</Button>
                    </form>
                </section>

                {/* My listings */}
                <section className={styles.listingsSection}>
                    <h2 className={styles.sectionTitle}>Your Listings ({listings.length})</h2>

                    {listings.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No listings yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className={styles.listingsList}>
                            {listings.map((p: Record<string, unknown>) => (
                                <div key={p.id as string} className={styles.listingRow}>
                                    <div className={styles.listingImg}>
                                        {(p.image_urls as string[])?.length > 0 ? (
                                            <Image src={(p.image_urls as string[])[0]} alt={p.title as string} fill sizes="60px" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <span>–</span>
                                        )}
                                    </div>
                                    <div className={styles.listingInfo}>
                                        <p className={styles.listingTitle}>{p.title as string}</p>
                                        <p className={styles.listingMeta}>₹{(p.price as number).toLocaleString()} · {(p.categories as { name: string })?.name}</p>
                                    </div>
                                    <div className={styles.listingBadges}>
                                        <StatusBadge status={p.status as string} />
                                        <ConditionBadge condition={p.condition as string} />
                                    </div>
                                    <Link href={`/products/${p.id as string}`} className={styles.viewLink}>View →</Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Incoming orders section */}
            <section className={styles.incomingSection}>
                <h2 className={styles.sectionTitle}>Incoming Orders ({incomingOrders.length})</h2>

                {incomingOrders.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No orders received yet. Orders placed for your listings will appear here.</p>
                    </div>
                ) : (
                    <div className={styles.ordersList}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {incomingOrders.map((row: any) => (
                            <div key={row.order_id} className={styles.orderRow}>
                                <div className={styles.orderInfo}>
                                    <p className={styles.orderItem}>{row.products?.title}</p>
                                    <p className={styles.orderMeta}>
                                        Buyer: <strong>{row.orders?.profiles?.display_name ?? 'Unknown'}</strong>
                                        {' · '}{row.orders?.shipping_city}
                                    </p>
                                    <p className={styles.orderPhone} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Phone size={12} /> {row.orders?.shipping_phone}
                                    </p>
                                </div>
                                <div className={styles.orderActions}>
                                    <p className={styles.orderDate}>
                                        {new Date(row.orders?.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </p>
                                    <Link href={`/orders/${row.order_id}`} className={styles.trackLink}>
                                        Track Order →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
