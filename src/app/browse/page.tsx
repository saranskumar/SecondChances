import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import type { ProductWithDetails } from '@/types/database'
import styles from './page.module.css'

interface SearchParams { category?: string; q?: string; minPrice?: string; maxPrice?: string }

async function getCategoryId(slug: string): Promise<number | null> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single()
    const row = data as { id: number } | null
    return row?.id ?? null
}

async function getProducts(filters: SearchParams): Promise<ProductWithDetails[]> {
    const supabase = await createClient()

    let query = supabase
        .from('products')
        .select('*, profiles(display_name), categories(name, slug)')
        .eq('status', 'available')
        .order('created_at', { ascending: false })

    if (filters.category) {
        const catId = await getCategoryId(filters.category)
        if (catId !== null) {
            query = query.eq('category_id', catId)
        } else {
            // Unknown slug → return nothing
            return []
        }
    }
    if (filters.q) {
        query = query.ilike('title', `%${filters.q}%`)
    }
    if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice))
    }

    const { data } = await query
    return (data as unknown as ProductWithDetails[]) ?? []
}

async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data ?? []
}

export default async function BrowsePage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const [products, categories] = await Promise.all([
        getProducts(params),
        getCategories(),
    ])

    return (
        <div className="container section">
            <div className={styles.header}>
                <h1>Browse the Collection</h1>
                <p>{products.length} items available</p>
            </div>

            <div className={styles.layout}>
                {/* Sidebar filters */}
                <aside className={styles.sidebar}>
                    <h3 className={styles.filterTitle}>Categories</h3>
                    <ul className={styles.catList}>
                        <li>
                            <a href="/browse" className={!params.category ? styles.activeFilter : styles.filterLink}>
                                All
                            </a>
                        </li>
                        {categories.map((cat: { id: number; name: string; slug: string }) => (
                            <li key={cat.id}>
                                <a
                                    href={`/browse?category=${cat.slug}${params.q ? `&q=${params.q}` : ''}`}
                                    className={params.category === cat.slug ? styles.activeFilter : styles.filterLink}
                                >
                                    {cat.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Products */}
                <div className={styles.main}>
                    {/* Search */}
                    <form className={styles.searchBar} action="/browse" method="get">
                        {params.category && (
                            <input type="hidden" name="category" value={params.category} />
                        )}
                        <input
                            name="q"
                            type="search"
                            placeholder="Search items…"
                            defaultValue={params.q ?? ''}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchBtn}>Search</button>
                    </form>

                    {products.length > 0 ? (
                        <div className={styles.grid}>
                            {products.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>No items found.</p>
                            <a href="/browse" className={styles.clearLink}>Clear filters</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
