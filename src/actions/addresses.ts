'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Address = {
    id: string
    user_id: string
    label: string
    full_name: string
    phone: string
    address: string
    city: string
    is_default: boolean
    created_at: string
}

export async function getMyAddresses(): Promise<Address[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

    return (data ?? []) as Address[]
}

export async function addAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const label     = (formData.get('label')     as string)?.trim() || 'Home'
    const full_name = (formData.get('full_name') as string)?.trim()
    const phone     = (formData.get('phone')     as string)?.trim()
    const address   = (formData.get('address')   as string)?.trim()
    const city      = (formData.get('city')      as string)?.trim()
    const make_default = formData.get('is_default') === 'true'

    if (!full_name || !phone || !address || !city) {
        return { error: 'Please fill in all fields' }
    }

    // If making this default, clear existing defaults first
    if (make_default) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('addresses').insert({
        user_id: user.id,
        label,
        full_name,
        phone,
        address,
        city,
        is_default: make_default,
    })

    if (error) return { error: (error as { message: string }).message }

    revalidatePath('/profile')
    return { success: true }
}

export async function deleteAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    revalidatePath('/profile')
}

export async function setDefaultAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    await db.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await db.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id)

    revalidatePath('/profile')
}
