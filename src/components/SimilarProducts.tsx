import { createClient } from '@/lib/supabase/server'
import { ProductCard } from './ProductCard'
import type { ProductWithDetails } from '@/types/database'

export async function SimilarProducts({ currentProductId, categoryId, price }: {
    currentProductId: string
    categoryId: number
    price: number
}) {
    const supabase = await createClient()

    // Find products in same category, price +/- 20%
    const minPrice = price * 0.8
    const maxPrice = price * 1.2

    const { data } = await supabase
        .from('products')
        .select('*, profiles(display_name, avatar_url), categories(name, slug)')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .in('status', ['available'])
        // is_deleted filter handled by RLS, but we can add it explicitly if needed
        .limit(4)

    if (!data || data.length === 0) return null

    const similar = data as unknown as ProductWithDetails[]

    return (
        <section className="section" style={{ paddingTop: 0 }}>
            <h2>Similar Pieces You Might Love</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {similar.map(item => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
        </section>
    )
}
