'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// /auth → redirect to /auth/login
export default function AuthRootPage() {
    const router = useRouter()
    useEffect(() => { router.replace('/auth/login') }, [router])
    return null
}
