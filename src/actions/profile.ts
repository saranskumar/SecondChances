'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ProfileRow = {
    id: string
    display_name: string | null
    avatar_url: string | null
    created_at: string
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const display_name = (formData.get('display_name') as string | null)?.trim()
    if (!display_name) return { error: 'Name cannot be empty' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('profiles')
        .update({ display_name })
        .eq('id', user.id)

    if (error) return { error: (error as { message: string }).message }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function getProfile(): Promise<ProfileRow | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (data as ProfileRow | null)
}

