'use client'

import { useState, useEffect } from 'react'
import type { ProductWithDetails } from '@/types/database'

const STORAGE_KEY = 'sc_recently_viewed'

export function useRecentlyViewed() {
    const [viewedItems, setViewedItems] = useState<ProductWithDetails[]>([])

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setViewedItems(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse recently viewed items', e)
            }
        }
    }, [])

    const addViewedItem = (product: ProductWithDetails) => {
        const stored = localStorage.getItem(STORAGE_KEY)
        let items: ProductWithDetails[] = []
        if (stored) {
            try { items = JSON.parse(stored) } catch (e) {
                // Ignore parse errors
            }
        }
        
        // Remove if already exists to push to top
        items = items.filter(i => i.id !== product.id)
        
        // Add to front
        items.unshift(product)
        
        // Keep only top 10
        items = items.slice(0, 10)
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        setViewedItems(items)
    }

    return { viewedItems, addViewedItem }
}
