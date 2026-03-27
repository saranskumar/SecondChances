'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { ProductWithDetails } from '@/types/database'
import styles from './ProductCard.module.css'

interface Props {
    product: ProductWithDetails
}

export function ProductCard({ product }: Props) {
    const isSold = product.status === 'sold'
    const conditionLabel = {
        like_new: 'Like New',
        good: 'Good',
        fair: 'Fair',
    }[product.condition] ?? product.condition

    return (
        <Link
            href={`/products/${product.id}`}
            className={`${styles.card} ${isSold ? styles.soldCard : ''}`}
        >
            {/* Image */}
            <div className={styles.imageWrap}>
                {product.image_urls?.[0] ? (
                    <Image
                        src={product.image_urls[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span>No photo</span>
                    </div>
                )}

                {/* Wishlist heart */}
                <button
                    className={styles.heartBtn}
                    aria-label="Save to wishlist"
                    onClick={e => e.preventDefault()}
                >
                    <Heart size={16} />
                </button>

                {/* Sold overlay */}
                {isSold && (
                    <div className={styles.soldOverlay}>
                        <span>Sold</span>
                    </div>
                )}

                {/* Condition chip */}
                <div className={styles.conditionChip}>{conditionLabel}</div>
            </div>

            {/* Info */}
            <div className={styles.info}>
                {product.categories && (
                    <p className={styles.category}>{product.categories.name}</p>
                )}
                <h3 className={styles.title}>{product.title}</h3>
                <div className={styles.bottom}>
                    <span className={styles.price}>₹{Number(product.price).toLocaleString()}</span>
                    {product.profiles?.display_name && (
                        <span className={styles.seller}>{product.profiles.display_name}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}
