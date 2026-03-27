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
    const isReserved = product.status === 'reserved'
    const conditionLabel = {
        like_new: 'Like New',
        good: 'Good',
        fair: 'Fair',
    }[product.condition] ?? product.condition

    return (
        <Link
            href={`/products/${product.id}`}
            className={`${styles.card} soft-shadow-card hover-scale ${isSold || isReserved ? styles.soldCard : ''}`}
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

                {/* Sold/Reserved overlay */}
                {(isSold || isReserved) && (
                    <>
                        <div className={styles.soldOverlay}></div>
                        <div className="vintage-stamp" style={{ 
                            color: isReserved ? '#f59e0b' : '#ce4242', 
                            borderColor: isReserved ? '#f59e0b' : '#ce4242' 
                        }}>
                            {isReserved ? 'Reserved' : 'Sold'}
                        </div>
                    </>
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
