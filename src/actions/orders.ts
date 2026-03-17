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

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        products (id, title, image_urls, price, status, user_id, profiles(display_name))
      )
    `)
        .eq('id', orderId)
        .single()
    
    console.log("getOrderById raw data:", data, "error:", error)

    if (!data) return null

    // Allow access if viewer is the buyer OR the seller of any item in the order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isBuyer = (data as any).user_id === user.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isSeller = (data as any).order_items?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.products?.user_id === user.id
    )

    if (!isBuyer && !isSeller) return null
    return data
}

// Orders placed for products listed by the current user (seller view)
export async function getIncomingOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get orders that include at least one product listed by this user
    const { data } = await supabase
        .from('order_items')
        .select(`
            order_id,
            products (id, title, image_urls, price, user_id),
            orders (id, created_at, shipping_name, shipping_city, shipping_phone, user_id,
                profiles:user_id (display_name))
        `)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('products.user_id' as any, user.id)
        .order('order_id', { ascending: false })

    // Deduplicate by order_id and only keep rows where product belongs to seller
    const seen = new Set<string>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (data ?? []).filter((row: any) => {
        if (!row.products || row.products.user_id !== user.id) return false
        if (seen.has(row.order_id)) return false
        seen.add(row.order_id)
        return true
    })
    return result
}

