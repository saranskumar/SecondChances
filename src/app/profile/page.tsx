import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, updateProfile } from '@/actions/profile'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ShoppingBag, Tag, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import styles from './page.module.css'

export const metadata = {
    title: 'My Profile - Second Chances',
    description: 'Manage your Second Chances account details.',
}

async function getStats(userId: string) {
    const supabase = await createClient()
    const [listingsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ])
    return {
        listings: listingsRes.count ?? 0,
        orders: ordersRes.count ?? 0,
    }
}

async function handleUpdate(formData: FormData) {
    'use server'
    const res = await updateProfile(formData)
    if (res?.error) {
        redirect(`/profile?error=${encodeURIComponent(res.error)}`)
    }
    redirect('/profile?success=true')
}

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const [profile, stats, params] = await Promise.all([
        getProfile(),
        getStats(user.id),
        searchParams,
    ])

    const displayName = profile?.display_name ?? ''
    const initial = (displayName || user.email || 'U')[0].toUpperCase()

    return (
        <div className="container section">
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.avatarCircle}>{initial}</div>
                <div>
                    <h1 className={styles.name}>{displayName || 'Your Profile'}</h1>
                    <p className={styles.email}>{user.email}</p>
                </div>
            </div>

            {/* Stats strip */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statNum}>{stats.listings}</span>
                    <span className={styles.statLabel}>Items Listed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNum}>{stats.orders}</span>
                    <span className={styles.statLabel}>Orders Placed</span>
                </div>
            </div>

            {/* Feedback banners */}
            {params.success === 'true' && (
                <div className={styles.successBanner}>
                    <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Profile updated successfully!
                </div>
            )}
            {params.error && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    {decodeURIComponent(params.error)}
                </div>
            )}

            {/* Edit form */}
            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Edit Profile</h2>
                <form action={handleUpdate} className={styles.form}>
                    <Input
                        id="display_name"
                        name="display_name"
                        label="Display Name"
                        defaultValue={displayName}
                        placeholder="Your name"
                        required
                    />
                    <p className={styles.emailNote}>
                        Email: <strong>{user.email}</strong> (cannot be changed here)
                    </p>
                    <Button type="submit" style={{ width: '100%' }}>Save Changes</Button>
                </form>
            </div>

            {/* Quick links */}
            <div className={styles.links}>
                <Link href="/dashboard/buyer" className={styles.linkCard}>
                    <span className={styles.linkIcon}><ShoppingBag size={20} /></span>
                    <span className={styles.linkTitle}>My Orders</span>
                    <span className={styles.linkSub}>Track your purchases and view history</span>
                </Link>
                <Link href="/dashboard/seller" className={styles.linkCard}>
                    <span className={styles.linkIcon}><Tag size={20} /></span>
                    <span className={styles.linkTitle}>Seller Dashboard</span>
                    <span className={styles.linkSub}>Manage your listings and incoming orders</span>
                </Link>
                <Link href="/browse" className={styles.linkCard}>
                    <span className={styles.linkIcon}><Search size={20} /></span>
                    <span className={styles.linkTitle}>Discover Items</span>
                    <span className={styles.linkSub}>Browse to find your next favorite piece</span>
                </Link>
            </div>
        </div>
    )
}
