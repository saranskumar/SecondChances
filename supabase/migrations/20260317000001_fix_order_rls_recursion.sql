-- Migration to fix infinite recursion in RLS policies for `orders` and `order_items`

-- Create a security definer function to check if the user is a lister for the order
create or replace function public.is_lister_for_order(p_order_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.order_items oi
    join public.products p on oi.product_id = p.id
    where oi.order_id = p_order_id
      and p.user_id = p_user_id
  );
$$;

-- Drop the old policy that caused the infinite recursion
drop policy "Orders: lister can see orders with their products" on public.orders;

-- Create the new policy using the security definer function
create policy "Orders: lister can see orders with their products" on public.orders
  for select using (
    public.is_lister_for_order(id, auth.uid())
  );
