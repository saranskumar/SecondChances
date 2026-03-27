-- ============================================================
-- Second Chances – Upgrade to Production DBMS
-- Implements soft delete, state machine for reservations, 
-- audit trails, triggers, and analytics.
-- ============================================================

-- 1. Soft Delete and Status Check
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- We need to drop the old constraint and add a new one for status
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_status_check 
  CHECK (status IN ('available', 'reserved', 'sold'));

-- 2. Indexes (Ensure keys exist and add specific analytical indexes)
CREATE INDEX IF NOT EXISTS idx_products_category_2 ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status_2 ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_2 ON public.orders(user_id);

-- 3. Advanced Features: Price History
CREATE TABLE IF NOT EXISTS public.product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note: Functional Dependency Product_ID -> Title, Price is maintained 
-- horizontally in `products`, while history tracks updates functionally.

CREATE OR REPLACE FUNCTION public.log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price <> OLD.price THEN
        INSERT INTO public.product_price_history (product_id, old_price, new_price)
        VALUES (NEW.id, OLD.price, NEW.price);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_product_price_change ON public.products;
CREATE TRIGGER on_product_price_change
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    WHEN (OLD.price IS DISTINCT FROM NEW.price)
    EXECUTE FUNCTION public.log_price_change();

-- 4. Advanced Features: Audit Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    target_id UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Trigger-based State Management (ACID Compliance & Isolation)

-- Trigger A: On inserting order_items, update product status based on order state
CREATE OR REPLACE FUNCTION public.auto_update_product_status()
RETURNS TRIGGER AS $$
DECLARE
    v_order_status TEXT;
    v_buyer_id UUID;
BEGIN
    SELECT status, user_id INTO v_order_status, v_buyer_id FROM public.orders WHERE id = NEW.order_id;
    
    IF v_order_status = 'paid' THEN
        UPDATE public.products SET status = 'sold' WHERE id = NEW.product_id;
    ELSIF v_order_status = 'pending' THEN
        UPDATE public.products SET status = 'reserved' WHERE id = NEW.product_id;
    END IF;
    
    -- Audit Logging
    INSERT INTO public.activity_logs (user_id, action, target_table, target_id)
    VALUES (
        v_buyer_id, 
        'item_added_to_order', 
        'products', 
        NEW.product_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_mark_product_status_on_insert ON public.order_items;
CREATE TRIGGER trigger_mark_product_status_on_insert
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_update_product_status();


-- Trigger B: When an order status changes (e.g. pending -> paid or timeout), sync products
CREATE OR REPLACE FUNCTION public.sync_product_status_with_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
        UPDATE public.products SET status = 'sold' 
        WHERE id IN (SELECT product_id FROM public.order_items WHERE order_id = NEW.id);
    ELSIF NEW.status IN ('cancelled', 'failed') AND OLD.status NOT IN ('cancelled', 'failed') THEN
        UPDATE public.products SET status = 'available' 
        WHERE id IN (SELECT product_id FROM public.order_items WHERE order_id = NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_products_on_order_update ON public.orders;
CREATE TRIGGER trigger_sync_products_on_order_update
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.sync_product_status_with_order();


-- 6. New RPCs: Checkout State Machine (Handles concurrency with FOR UPDATE)
CREATE OR REPLACE FUNCTION public.checkout_start(
    p_user_id UUID,
    p_product_ids UUID[],
    p_shipping_name TEXT DEFAULT '',
    p_shipping_address TEXT DEFAULT '',
    p_shipping_city TEXT DEFAULT '',
    p_shipping_phone TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC(10,2) := 0;
    v_product_id UUID;
    v_price NUMERIC(10,2);
BEGIN
    -- 1. Lock rows to prevent race conditions
    FOREACH v_product_id IN ARRAY p_product_ids LOOP
        SELECT price INTO v_price
        FROM public.products
        WHERE id = v_product_id AND status = 'available' AND is_deleted = false
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is not available or does not exist', v_product_id;
        END IF;

        v_total := v_total + v_price;
    END LOOP;

    -- 2. Create Order (status is 'pending')
    INSERT INTO public.orders
        (user_id, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_phone)
    VALUES
        (p_user_id, v_total, 'pending', p_shipping_name, p_shipping_address, p_shipping_city, p_shipping_phone)
    RETURNING id INTO v_order_id;

    -- 3. Insert items - this fires the `auto_update_product_status` trigger,
    -- which correctly determines the order is pending -> marks items 'reserved'.
    FOREACH v_product_id IN ARRAY p_product_ids LOOP
        SELECT price INTO v_price FROM public.products WHERE id = v_product_id;
        INSERT INTO public.order_items (order_id, product_id, price_at_purchase)
        VALUES (v_order_id, v_product_id, v_price);
    END LOOP;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.checkout_success(
    p_order_id UUID,
    p_provider TEXT DEFAULT 'cod',
    p_provider_ref TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_total NUMERIC(10,2);
BEGIN
    -- Verify the order
    SELECT total_amount INTO v_total FROM public.orders WHERE id = p_order_id AND status = 'pending' FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not in pending state';
    END IF;

    -- Mark order as paid. This triggers sync_product_status_with_order (marks items as 'sold')
    UPDATE public.orders SET status = 'paid' WHERE id = p_order_id;

    -- Record Payment
    INSERT INTO public.payments (order_id, amount, provider, provider_ref, status)
    VALUES (p_order_id, v_total, p_provider, p_provider_ref, 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.checkout_timeout(
    p_order_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Lock order for safe status flip
    PERFORM id FROM public.orders WHERE id = p_order_id AND status = 'pending' FOR UPDATE;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Cancel order -> triggers sync_product_status_with_order -> items become 'available' again
    UPDATE public.orders SET status = 'cancelled' WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. Analytics: Popular Products Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.popular_products AS
SELECT p.id as product_id, p.title, p.category_id, COUNT(oi.id) as times_sold
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'paid'
GROUP BY p.id, p.title, p.category_id
ORDER BY times_sold DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_products_id ON public.popular_products(product_id);


-- 8. Enhanced Security (RLS)
-- Update the existing Product read policy to respect soft deletes
DROP POLICY IF EXISTS "Products: anyone can read" ON public.products;
CREATE POLICY "Products: anyone can read" ON public.products
  FOR SELECT USING (is_deleted = false OR auth.uid() = user_id);

-- Note: The rule single_instance_inventory is enforced by:
-- `constraint unique_product_sale unique (product_id)` existing in public.order_items.
