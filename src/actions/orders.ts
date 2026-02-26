'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function placeOrder(formData: {
    productIds: string[]
    shipping: {
        name: string
        address: string
        city: string
        phone: string
    }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('place_order', {
        p_user_id: user.id,           // unified: user_id for both buyer and any context
        p_product_ids: formData.productIds,
        p_shipping_name: formData.shipping.name,
        p_shipping_address: formData.shipping.address,
        p_shipping_city: formData.shipping.city,
        p_shipping_phone: formData.shipping.phone,
    })

    if (error) throw new Error(error.message)
    return data as string // order_id
}

export async function getMyOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        products (id, title, image_urls, price, status)
      )
    `)
        .eq('user_id', user.id)   // unified: buyer is identified by user_id
        .order('created_at', { ascending: false })

    return data ?? []
}

export async function getOrderById(orderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        products (id, title, image_urls, price, status, profiles(display_name))
      )
    `)
        .eq('id', orderId)
        .eq('user_id', user.id)   // unified: user_id identifies the order owner
        .single()

    return data
}
