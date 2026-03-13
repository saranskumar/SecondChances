import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, updateProfile } from '@/actions/profile'
import { getMyAddresses, addAddress, deleteAddress, setDefaultAddress } from '@/actions/addresses'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ShoppingBag, Tag, Search, CheckCircle2, AlertCircle, MapPin, Plus, Trash2, Home } from 'lucide-react'
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

// Ensure the form correctly re-renders the page by passing error state to query params.
async function handleAddAddress(formData: FormData) {
    'use server'
    const res = await addAddress(formData)
    if (res?.error) {
        redirect(`/profile?addrError=${encodeURIComponent(res.error)}#addresses`)
    }
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

    // Are we showing the add address form?
    const showAddForm = params.addMode === '1' || params.addrError

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

            {/* General Feedback banners */}
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

            {/* Address Banners */}
            {params.addrSuccess === 'true' && (
                <div className={styles.successBanner} id="addresses">
                    <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Address saved successfully!
                </div>
            )}
            {params.addrError && (
                <div className={styles.errorBanner} id="addresses">
                    <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    {decodeURIComponent(params.addrError)}
                </div>
            )}

            {/* Addresses Section */}
            <div className={styles.addressesWrap} id="addresses">
                <h2 className={styles.sectionTitle}>Saved Addresses</h2>

                {addresses.length > 0 && (
                    <div className={styles.addressList}>
                        {addresses.map((a) => (
                            <div key={a.id} className={`${styles.addressCard} ${a.is_default ? styles.defaultCard : ''}`}>
                                <div className={styles.addressInfo}>
                                    <div className={styles.addressLabel}>
                                        <MapPin size={14} />
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
                            <Input id="label" name="label" label="Address Label (e.g. Home, Office)" placeholder="Home" />
                            <Input id="full_name" name="full_name" label="Full Name" placeholder="Jane Doe" required />
                            <Input id="phone" name="phone" label="Phone Number" placeholder="+91 98765 43210" required />
                            <Input id="address" name="address" label="Street Address" placeholder="House no., Street, Area" required />
                            <Input id="city" name="city" label="City" placeholder="Bengaluru" required />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
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
                            <Plus size={16} /> Add a new address
                        </button>
                    </Link>
                )}
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
