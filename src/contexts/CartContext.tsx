'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import type { Product } from '@/types/database'

interface CartItem {
    product: Product
}

interface CartContextType {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    clearCart: () => void
    count: number
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    clearCart: () => { },
    count: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        try {
            const stored = localStorage.getItem('sc_cart')
            if (stored) setItems(JSON.parse(stored))
        } catch { }
    }, [])

    useEffect(() => {
        localStorage.setItem('sc_cart', JSON.stringify(items))
    }, [items])

    const addItem = useCallback((product: Product) => {
        setItems(prev => {
            if (prev.some(i => i.product.id === product.id)) return prev
            return [...prev, { product }]
        })
    }, [])

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.product.id !== productId))
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, count: items.length }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
