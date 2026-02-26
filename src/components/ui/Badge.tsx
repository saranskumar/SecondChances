import styles from './Badge.module.css'

type BadgeVariant = 'available' | 'sold' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'like_new' | 'good' | 'fair' | 'default'

interface BadgeProps {
    variant?: BadgeVariant
    children: React.ReactNode
    className?: string
}

const variantLabels: Record<string, string> = {
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className}`}>
            {variantLabels[variant as string] ?? children}
        </span>
    )
}

export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, BadgeVariant> = {
        available: 'available',
        sold: 'sold',
        pending: 'pending',
        paid: 'paid',
        shipped: 'shipped',
        delivered: 'delivered',
        cancelled: 'cancelled',
    }
    return <Badge variant={map[status] ?? 'default'}>{status}</Badge>
}

export function ConditionBadge({ condition }: { condition: string }) {
    const map: Record<string, BadgeVariant> = {
        like_new: 'like_new',
        good: 'good',
        fair: 'fair',
    }
    return <Badge variant={map[condition] ?? 'default'}>{condition}</Badge>
}
