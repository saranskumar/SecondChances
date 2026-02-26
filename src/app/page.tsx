import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'
import type { ProductWithDetails } from '@/types/database'
import styles from './page.module.css'

async function getFeaturedProducts(): Promise<ProductWithDetails[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, profiles(display_name), categories(name, slug)')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  return (data as unknown as ProductWithDetails[]) ?? []
}

const CATEGORIES = [
  { name: 'Tops', slug: 'tops', emoji: '👕' },
  { name: 'Dresses', slug: 'dresses', emoji: '👗' },
  { name: 'Outerwear', slug: 'outerwear', emoji: '🧥' },
  { name: 'Accessories', slug: 'accessories', emoji: '💍' },
  { name: 'Shoes', slug: 'shoes', emoji: '👠' },
  { name: 'Bags', slug: 'bags', emoji: '👜' },
  { name: 'Vintage', slug: 'vintage', emoji: '🎞' },
  { name: 'Bottoms', slug: 'bottoms', emoji: '👖' },
]

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.eyebrow}>One-of-a-kind. Pre-loved. Yours.</p>
          <h1 className={styles.heroTitle}>
            Give your wardrobe<br />
            <em>a second chance</em>
          </h1>
          <p className={styles.heroPara}>
            Shop unique, handpicked vintage and pre-loved fashion. Every item sold just once — because great things deserve a good home.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/browse">
              <Button size="lg">Browse the Collection</Button>
            </Link>
            <Link href="/dashboard/seller">
              <Button size="lg" variant="outline">Start Selling</Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroBg} />
      </section>

      {/* ── Categories ── */}
      <section className={`section ${styles.catSection}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/browse?category=${cat.slug}`} className={styles.catCard}>
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section className={`section ${styles.featuredSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <Link href="/browse" className={styles.seeAll}>View All →</Link>
          </div>

          {featured.length > 0 ? (
            <div className={styles.productGrid}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No products yet. Be the first to list something!</p>
              <Link href="/dashboard/seller"><Button variant="outline">List a Product</Button></Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Values strip ── */}
      <section className={styles.valuesStrip}>
        <div className={`container ${styles.valuesGrid}`}>
          {[
            { title: 'Every Piece Unique', body: 'No duplicates. Each item is one-of-a-kind and sells only once.' },
            { title: 'Curated Quality', body: 'Sellers describe condition honestly — like new, good, or fair.' },
            { title: 'Sustainable Fashion', body: 'Give pre-loved clothing a second life and reduce waste.' },
          ].map(v => (
            <div key={v.title} className={styles.valueCard}>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Have something worth passing on?</h2>
          <p>List in minutes. Reach buyers who appreciate the beauty of pre-loved fashion.</p>
          <Link href="/dashboard/seller">
            <Button size="lg">Create a Listing</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
