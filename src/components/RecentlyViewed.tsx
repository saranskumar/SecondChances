'use client'

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { ProductCard } from './ProductCard'

export function RecentlyViewed() {
    const { viewedItems } = useRecentlyViewed()

    if (viewedItems.length === 0) return null

    return (
        <section className="section">
            <h2>Recently Viewed</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {viewedItems.map(item => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
        </section>
    )
}
