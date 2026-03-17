import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, updateProfile } from '@/actions/profile'
import { getMyAddresses, addAddress, deleteAddress, setDefaultAddress } from '@/actions/addresses'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ShoppingBag, Tag, Search, CheckCircle2, AlertCircle, MapPin, Plus, Calendar, Shield, Mail, Package } from 'lucide-react'
import styles from './page.module.css'
import { ProfileFeedback } from './Feedback'

export const metadata = {
    title: 'My Profile - Second Chances',
    description: 'Manage your Second Chances account details.',
}

async function getStats(userId: string) {
    const supabase = await createClient()
    const [listingsRes, ordersRes, availableRes, soldRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'available'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'sold'),
    ])
    return {
        listings: listingsRes.count ?? 0,
        orders: ordersRes.count ?? 0,
        available: availableRes.count ?? 0,
        sold: soldRes.count ?? 0,
    }
}

async function handleUpdate(formData: FormData) {
    'use server'
    const res = await updateProfile(formData)
    if (res?.error) redirect(`/profile?error=${encodeURIComponent(res.error)}`)
    redirect('/profile?success=true')
}

async function handleAddAddress(formData: FormData) {
    'use server'
    const res = await addAddress(formData)
    if (res?.error) redirect(`/profile?addrError=${encodeURIComponent(res.error)}#addresses`)
    redirect(`/profile?addrSuccess=true#addresses`)
}

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string; addrSuccess?: string; addrError?: string; addMode?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const [profile, stats, addresses, params] = await Promise.all([
        getProfile(),
        getStats(user.id),
        getMyAddresses(),
        searchParams,
    ])

    const displayName = profile?.display_name ?? ''
    const initial = (displayName || user.email || 'U')[0].toUpperCase()

    const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long',
    })

    const isGoogleUser = user.app_metadata?.provider === 'google'
    const showAddForm = params.addMode === '1' || params.addrError

    return (
        <div className="container section">

            {/* ── Hero header ─────────────────────────────── */}
            <div className={styles.hero}>
                <div className={styles.avatarCircle}>{initial}</div>
                <div className={styles.heroInfo}>
                    <h1 className={styles.name}>{displayName || 'Your Profile'}</h1>
                    <p className={styles.email}>
                        <Mail size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        {user.email}
                    </p>
                    <p className={styles.memberSince}>
                        <Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        Member since {memberSince}
                        {isGoogleUser && (
                            <span className={styles.googleBadge}>
                                <Shield size={11} /> Google
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* ── Stats strip ─────────────────────────────── */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statNum}>{stats.listings}</span>
                    <span className={styles.statLabel}>Total Listed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNum}>{stats.available}</span>
                    <span className={styles.statLabel}>For Sale</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNum}>{stats.sold}</span>
                    <span className={styles.statLabel}>Items Sold</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNum}>{stats.orders}</span>
                    <span className={styles.statLabel}>Orders Placed</span>
                </div>
            </div>

            <ProfileFeedback params={params} />

            {/* ── Edit Profile card ────────────────────────── */}
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
                        Email: <strong>{user.email}</strong>
                        {isGoogleUser
                            ? ' · Signed in via Google'
                            : ' (cannot be changed here)'}
                    </p>
                    <Button type="submit" style={{ width: '100%' }}>Save Changes</Button>
                </form>
            </div>

            {/* ── Saved Addresses ──────────────────────────── */}
            <div className={styles.addressesWrap} id="addresses">
                <h2 className={styles.sectionTitle}>Saved Addresses</h2>
                {addresses.length === 0 && !showAddForm && (
                    <p className={styles.emptyAddr}>No saved addresses yet. Add one to speed up checkout.</p>
                )}
                {addresses.length > 0 && (
                    <div className={styles.addressList}>
                        {addresses.map((a) => (
                            <div key={a.id} className={`${styles.addressCard} ${a.is_default ? styles.defaultCard : ''}`}>
                                <div className={styles.addressInfo}>
                                    <div className={styles.addressLabel}>
                                        <MapPin size={13} />
                                        {a.label}
                                        {a.is_default && <span className={styles.defaultBadge}>Default</span>}
                                    </div>
                                    <p className={styles.addressLine}><strong>{a.full_name}</strong> · {a.phone}</p>
                                    <p className={styles.addressLine}>{a.address}, {a.city}</p>
                                </div>
                                <div className={styles.addressActions}>
                                    {!a.is_default && (
                                        <form action={setDefaultAddress.bind(null, a.id)}>
                                            <button type="submit" className={`${styles.addrBtn} ${styles.addrBtnDefault}`}>Set Default</button>
                                        </form>
                                    )}
                                    <form action={deleteAddress.bind(null, a.id)}>
                                        <button type="submit" className={`${styles.addrBtn} ${styles.addrBtnDanger}`}>Delete</button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showAddForm ? (
                    <div className={styles.card} style={{ margin: 0 }}>
                        <h3 className={styles.sectionTitle} style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Add New Address</h3>
                        <form action={handleAddAddress} className={styles.form}>
                            <Input id="label" name="label" label="Label (e.g. Home, Office)" placeholder="Home" />
                            <Input id="full_name" name="full_name" label="Full Name" placeholder="Jane Doe" required />
                            <Input id="phone" name="phone" label="Phone" placeholder="+91 98765 43210" required />
                            <Input id="address" name="address" label="Street Address" placeholder="House no., Street, Area" required />
                            <Input id="city" name="city" label="City" placeholder="Bengaluru" required />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                <input type="checkbox" name="is_default" value="true" defaultChecked={addresses.length === 0} />
                                Set as default address
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <Link href="/profile#addresses" style={{ flex: 1 }}>
                                    <Button type="button" variant="outline" style={{ width: '100%' }}>Cancel</Button>
                                </Link>
                                <Button type="submit" style={{ flex: 1 }}>Save Address</Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <Link href="/profile?addMode=1#addresses" style={{ textDecoration: 'none' }}>
                        <button className={styles.addAddrToggle}>
                            <Plus size={15} /> Add a new address
                        </button>
                    </Link>
                )}
            </div>

            {/* ── Quick links ──────────────────────────────── */}
            <div className={styles.links}>
                <Link href="/dashboard?tab=orders" className={styles.linkCard}>
                    <span className={styles.linkIcon}><ShoppingBag size={20} /></span>
                    <div>
                        <span className={styles.linkTitle}>My Orders</span>
                        <span className={styles.linkSub}>Track your purchases</span>
                    </div>
                </Link>
                <Link href="/dashboard?tab=listings" className={styles.linkCard}>
                    <span className={styles.linkIcon}><Package size={20} /></span>
                    <div>
                        <span className={styles.linkTitle}>My Listings</span>
                        <span className={styles.linkSub}>{stats.available} active · {stats.sold} sold</span>
                    </div>
                </Link>
                <Link href="/dashboard?tab=sell" className={styles.linkCard}>
                    <span className={styles.linkIcon}><Tag size={20} /></span>
                    <div>
                        <span className={styles.linkTitle}>List an Item</span>
                        <span className={styles.linkSub}>Sell something new</span>
                    </div>
                </Link>
                <Link href="/browse" className={styles.linkCard}>
                    <span className={styles.linkIcon}><Search size={20} /></span>
                    <div>
                        <span className={styles.linkTitle}>Browse</span>
                        <span className={styles.linkSub}>Find your next piece</span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
