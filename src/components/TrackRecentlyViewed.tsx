'use client'

import { useEffect } from 'react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { ProductWithDetails } from '@/types/database'

export function TrackRecentlyViewed({ product }: { product: ProductWithDetails }) {
    const { addViewedItem } = useRecentlyViewed()
    
    useEffect(() => {
        addViewedItem(product)
    }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps
    
    return null
}
