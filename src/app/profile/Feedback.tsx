'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Params = {
    success?: string
    error?: string
    addrSuccess?: string
    addrError?: string
}

export function ProfileFeedback({ params }: { params: Params }) {
    const router = useRouter()

    useEffect(() => {
        let shouldClear = false

        if (params.success === 'true') {
            toast.success('Profile updated successfully!')
            shouldClear = true
        }
        if (params.error) {
            toast.error(decodeURIComponent(params.error))
            shouldClear = true
        }
        if (params.addrSuccess === 'true') {
            toast.success('Address saved successfully!')
            shouldClear = true
        }
        if (params.addrError) {
            toast.error(decodeURIComponent(params.addrError))
            shouldClear = true
        }

        if (shouldClear) {
            router.replace('/profile', { scroll: false })
        }
    }, [params, router])

    return null
}
