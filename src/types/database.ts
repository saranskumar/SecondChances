export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'buyer' | 'seller' | 'admin'
                    display_name: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>
            }
            categories: {
                Row: { id: number; name: string; slug: string }
                Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>
                Update: Partial<Database['public']['Tables']['categories']['Insert']>
            }
            products: {
                Row: {
                    id: string
                    seller_id: string
                    category_id: number
                    title: string
                    description: string | null
                    price: number
                    condition: 'like_new' | 'good' | 'fair'
                    status: 'available' | 'sold'
                    image_urls: string[]
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['products']['Insert']>
            }
            orders: {
                Row: {
                    id: string
                    buyer_id: string
                    total_amount: number
                    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
                    shipping_name: string | null
                    shipping_address: string | null
                    shipping_city: string | null
                    shipping_phone: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['orders']['Insert']>
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    price_at_purchase: number
                }
                Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
                Update: Partial<Database['public']['Tables']['order_items']['Insert']>
            }
            payments: {
                Row: {
                    id: string
                    order_id: string
                    amount: number
                    provider: string
                    provider_ref: string | null
                    status: 'pending' | 'paid' | 'failed' | 'refunded'
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['payments']['Insert']>
            }
        }
        Functions: {
            place_order: {
                Args: {
                    p_buyer_id: string
                    p_product_ids: string[]
                    p_shipping_name?: string
                    p_shipping_address?: string
                    p_shipping_city?: string
                    p_shipping_phone?: string
                }
                Returns: string
            }
        }
    }
}

// Convenience aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

export type ProductWithDetails = Product & {
    profiles: Pick<Profile, 'display_name'>
    categories: Pick<Category, 'name' | 'slug'>
}

export type OrderWithItems = Order & {
    order_items: (OrderItem & {
        products: Pick<Product, 'id' | 'title' | 'price' | 'image_urls' | 'status'>
    })[]
}
