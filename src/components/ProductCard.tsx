import Link from 'next/link'
import Image from 'next/image'
import { ConditionBadge, StatusBadge } from '@/components/ui/Badge'
import type { ProductWithDetails } from '@/types/database'
import styles from './ProductCard.module.css'

interface ProductCardProps {
    product: ProductWithDetails
}

export function ProductCard({ product }: ProductCardProps) {
    const primaryImage = product.image_urls[0]

    return (
        <Link href={`/products/${product.id}`} className={styles.card}>
            <div className={styles.imageWrap}>
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span>No Image</span>
                    </div>
                )}
                {product.status === 'sold' && (
                    <div className={styles.soldOverlay}>
                        <span>Sold</span>
                    </div>
                )}
            </div>

            <div className={styles.body}>
                <div className={styles.meta}>
                    <span className={styles.category}>{product.categories?.name}</span>
                    <ConditionBadge condition={product.condition} />
                </div>

                <h3 className={styles.title}>{product.title}</h3>

                <div className={styles.footer}>
                    <span className={styles.price}>₹{Number(product.price).toLocaleString()}</span>
                    {product.status === 'sold' ? (
                        <StatusBadge status="sold" />
                    ) : (
                        <span className={styles.seller}>{product.profiles?.display_name ?? 'Seller'}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}
