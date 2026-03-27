import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConditionBadge, StatusBadge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/AddToCartButton'
import { SimilarProducts } from '@/components/SimilarProducts'
import { TrackRecentlyViewed } from '@/components/TrackRecentlyViewed'
import type { ProductWithDetails } from '@/types/database'
import styles from './page.module.css'

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data } = await supabase
        .from('products')
        .select('*, profiles(display_name, avatar_url), categories(name, slug)')
        .eq('id', id)
        .single()

    if (!data) notFound()

    const product = data as unknown as ProductWithDetails
    const images = product.image_urls ?? []

    return (
        <div className="container section">
            <div className={styles.breadcrumb}>
                <Link href="/browse">Browse</Link>
                <span>/</span>
                <Link href={`/browse?category=${product.categories?.slug}`}>{product.categories?.name}</Link>
                <span>/</span>
                <span>{product.title}</span>
            </div>

            <div className={styles.layout}>
                {/* Images */}
                <div className={styles.gallery}>
                    <div className={styles.primaryImage}>
                        {images[0] ? (
                            <Image src={images[0]} alt={product.title} fill sizes="50vw" className={styles.img} />
                        ) : (
                            <div className={styles.noImg}>No Image</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className={styles.thumbRow}>
                            {images.slice(1).map((url, i) => (
                                <div key={i} className={styles.thumb}>
                                    <Image src={url} alt={`${product.title} ${i + 2}`} fill sizes="80px" className={styles.img} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className={styles.info}>
                    <div className={styles.badges}>
                        <StatusBadge status={product.status} />
                        <ConditionBadge condition={product.condition} />
                        <span className={styles.category}>{product.categories?.name}</span>
                    </div>

                    <h1 className={styles.title}>{product.title}</h1>
                    <p className={styles.price}>₹{Number(product.price).toLocaleString()}</p>

                    {product.description && (
                        <div className={styles.description}>
                            <h3>About this piece</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    <div className={styles.seller}>
                        <div className={styles.sellerAvatar}>
                            {product.profiles?.display_name?.[0]?.toUpperCase() ?? 'S'}
                        </div>
                        <div>
                            <p className={styles.sellerLabel}>Listed by</p>
                            <Link href={`/seller/${product.user_id}`} className={styles.sellerName} style={{textDecoration: 'underline'}}>
                                {product.profiles?.display_name ?? 'Seller'}
                            </Link>
                        </div>
                    </div>

                    {product.status === 'available' ? (
                        <AddToCartButton product={product} />
                    ) : (
                        <div className={styles.soldBanner}>
                            <p>This item has already found a new home.</p>
                            <Link href="/browse">← Browse more items</Link>
                        </div>
                    )}
                </div>
            </div>

            <TrackRecentlyViewed product={product} />

            <div style={{ marginTop: '5rem' }}>
                <SimilarProducts currentProductId={product.id} categoryId={product.category_id} price={product.price} />
            </div>
        </div>
    )
}
