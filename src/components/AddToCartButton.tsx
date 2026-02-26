'use client'

import { ShoppingBag, Check } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import type { ProductWithDetails } from '@/types/database'
import styles from './AddToCartButton.module.css'

export function AddToCartButton({ product }: { product: ProductWithDetails }) {
    const { addItem, items } = useCart()
    const inCart = items.some(i => i.product.id === product.id)
    const [just, setJust] = useState(false)

    const handle = () => {
        if (inCart) return
        addItem(product)
        setJust(true)
        toast.success(`${product.title} added to cart!`)
        setTimeout(() => setJust(false), 2000)
    }

    return (
        <div className={styles.wrap}>
            <Button
                size="lg"
                onClick={handle}
                variant={inCart ? 'outline' : 'primary'}
                style={{ width: '100%' }}
            >
                {just ? <Check size={18} /> : <ShoppingBag size={18} />}
                {inCart ? 'In Cart' : 'Add to Cart'}
            </Button>
            {inCart && (
                <a href="/cart" className={styles.viewCart}>View Cart →</a>
            )}
        </div>
    )
}
