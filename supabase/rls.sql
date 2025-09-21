-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin or editor
CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (is_admin_or_editor());

-- Hero slides policies (public read for active, admin write)
CREATE POLICY "Anyone can view active hero slides" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hero slides" ON hero_slides FOR ALL USING (is_admin_or_editor());

-- Banners policies (public read for active, admin write)
CREATE POLICY "Anyone can view active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (is_admin_or_editor());

-- Products policies (public read for active, admin write)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin_or_editor());

-- Product images policies
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_images.product_id AND is_active = true)
);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin_or_editor());

-- Product tags policies
CREATE POLICY "Anyone can view product tags" ON product_tags FOR SELECT TO public;
CREATE POLICY "Admins can manage product tags" ON product_tags FOR ALL USING (is_admin_or_editor());

-- Product tag links policies
CREATE POLICY "Anyone can view product tag links" ON product_tag_links FOR SELECT TO public;
CREATE POLICY "Admins can manage product tag links" ON product_tag_links FOR ALL USING (is_admin_or_editor());

-- Banner products policies
CREATE POLICY "Anyone can view banner products" ON banner_products FOR SELECT USING (
    EXISTS (SELECT 1 FROM banners WHERE id = banner_products.banner_id AND is_active = true)
);
CREATE POLICY "Admins can manage banner products" ON banner_products FOR ALL USING (is_admin_or_editor());

-- Workshops policies (public read for active, admin write)
CREATE POLICY "Anyone can view active workshops" ON workshops FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage workshops" ON workshops FOR ALL USING (is_admin_or_editor());

-- Workshop sessions policies (public read, admin write)
CREATE POLICY "Anyone can view workshop sessions" ON workshop_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM workshops WHERE id = workshop_sessions.workshop_id AND is_active = true)
);
CREATE POLICY "Admins can manage workshop sessions" ON workshop_sessions FOR ALL USING (is_admin_or_editor());

-- Tags policies
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT TO public;
CREATE POLICY "Admins can manage tags" ON tags FOR ALL USING (is_admin_or_editor());

-- Workshop tags policies
CREATE POLICY "Anyone can view workshop tags" ON workshop_tags FOR SELECT TO public;
CREATE POLICY "Admins can manage workshop tags" ON workshop_tags FOR ALL USING (is_admin_or_editor());

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON user_interactions FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND device_id IS NOT NULL)
);
CREATE POLICY "Users can insert own interactions" ON user_interactions FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND device_id IS NOT NULL)
);
CREATE POLICY "Admins can view all interactions" ON user_interactions FOR SELECT USING (is_admin_or_editor());

-- Services policies (public read for active, admin write)
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (is_admin_or_editor());

-- Service variants policies
CREATE POLICY "Anyone can view service variants" ON service_variants FOR SELECT USING (
    EXISTS (SELECT 1 FROM services WHERE id = service_variants.service_id AND is_active = true)
    AND is_active = true
);
CREATE POLICY "Admins can manage service variants" ON service_variants FOR ALL USING (is_admin_or_editor());

-- Carts policies (users can only access their own carts)
CREATE POLICY "Users can access own carts" ON carts FOR ALL USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND device_id IS NOT NULL)
);

-- Cart items policies
CREATE POLICY "Users can access own cart items" ON cart_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM carts 
        WHERE id = cart_items.cart_id 
        AND (auth.uid() = user_id OR (auth.uid() IS NULL AND device_id IS NOT NULL))
    )
);

-- Orders policies (users can only access their own orders)
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin_or_editor());
CREATE POLICY "System can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update orders" ON orders FOR UPDATE USING (true);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND auth.uid() = user_id)
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (is_admin_or_editor());
CREATE POLICY "System can manage order items" ON order_items FOR ALL USING (true);

-- Registrations policies
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all registrations" ON registrations FOR SELECT USING (is_admin_or_editor());
CREATE POLICY "System can manage registrations" ON registrations FOR ALL USING (true);

-- Coupons policies (public read for validation, admin write)
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (is_admin_or_editor());

-- Gallery items policies (public read for active, admin write)
CREATE POLICY "Anyone can view active gallery items" ON gallery_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage gallery items" ON gallery_items FOR ALL USING (is_admin_or_editor());

-- Consents policies
CREATE POLICY "Users can view own consents" ON consents FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND email IS NOT NULL)
);
CREATE POLICY "Users can insert consents" ON consents FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all consents" ON consents FOR SELECT USING (is_admin_or_editor());

-- Data requests policies
CREATE POLICY "Anyone can submit data requests" ON data_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own data requests" ON data_requests FOR SELECT USING (
    requester_email = (SELECT email FROM users WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage data requests" ON data_requests FOR ALL USING (is_admin_or_editor());

-- Audit log policies (admin only)
CREATE POLICY "Admins can view audit log" ON audit_log FOR SELECT USING (is_admin_or_editor());
CREATE POLICY "System can insert audit log" ON audit_log FOR INSERT WITH CHECK (true);

-- Site settings policies (public read, admin write)
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT TO public;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (is_admin_or_editor());
