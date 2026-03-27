import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import type { ProductWithDetails } from '@/types/database'

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!profile) notFound()
    const p = profile as unknown as { display_name: string }

    const { data: products } = await supabase
        .from('products')
        .select('*, profiles(display_name, avatar_url), categories(name, slug)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })

    const listings = (products || []) as unknown as ProductWithDetails[]

    const available = listings.filter(l => l.status === 'available')
    const sold = listings.filter(l => l.status === 'sold' || l.status === 'reserved')

    return (
        <div className="container section">
            <h1 style={{ marginBottom: '1rem', fontSize: '3rem' }}>{p.display_name}'s Wardrobe</h1>
            <p style={{ color: 'var(--ink-60)', marginBottom: '3rem', fontSize: '1.2rem' }}>
                Discover pre-loved pieces listed by {p.display_name}.
            </p>

            {available.length > 0 && (
                <>
                    <h2>Available Now</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem', marginTop: '2rem', marginBottom: '4rem' }}>
                        {available.map(item => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </>
            )}

            {sold.length > 0 && (
                <>
                    <h2>Past Archives</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem', marginTop: '2rem', opacity: 0.8 }}>
                        {sold.map(item => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </>
            )}
            
            {listings.length === 0 && (
                <p>This seller hasn't listed any items yet.</p>
            )}
        </div>
    )
}
