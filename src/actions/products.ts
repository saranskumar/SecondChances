'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const condition = formData.get('condition') as string
    const category_id = parseInt(formData.get('category_id') as string)
    const files = formData.getAll('images') as File[]

    // Upload images to Supabase Storage
    const image_urls: string[] = []
    for (const file of files) {
        if (!file.size) continue
        const ext = file.name.split('.').pop()
        const path = `products/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (!error) {
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
            image_urls.push(publicUrl)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('products').insert({
        user_id: user.id,   // unified: user is the lister
        title,
        description,
        price,
        condition,
        category_id,
        image_urls,
        status: 'available',
    })

    if (error) throw new Error(error.message)
    revalidatePath('/browse')
    revalidatePath('/dashboard/seller')
    redirect('/dashboard/seller?success=1')
}

export async function getMyListings() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('user_id', user.id)   // unified: same field for lister
        .order('created_at', { ascending: false })

    return data ?? []
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id)
        .eq('status', 'available')

    revalidatePath('/dashboard')
}
