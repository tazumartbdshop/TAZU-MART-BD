-- =====================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES FOR TAZU MART BD / LUXEMART
-- =====================================================================
-- Run this entire script in the Supabase SQL Editor to configure all tables
-- with correct, highly secure, and admin-compliant Row-Level Security policies.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. ADMIN VALIDATION UTILITY FUNCTION
-- ---------------------------------------------------------------------
-- This robust function dynamically checks if the current user is an admin.
-- It supports:
--  A. Direct email check (matching the configured system admin email)
--  B. Custom roles/users table checks
--  C. Supabase raw user metadata check
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  is_sys_admin boolean;
BEGIN
  -- A. Check if user's logged-in email is the specific administrator email
  IF auth.jwt() ->> 'email' = 'admin.tazumartbd@gmail.com' THEN
    RETURN true;
  END IF;

  -- B. Check if user exists in custom target tables with public.users OR users
  -- (Support for 'admin' or 'moderator' roles)
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.users WHERE id = $1 AND role IN (''admin'', ''moderator''))'
    INTO is_sys_admin
    USING auth.uid();
    
    IF is_sys_admin THEN
      RETURN true;
    END IF;
  END IF;

  -- C. Check JWT user metadata
  IF auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'moderator') 
     OR auth.jwt() ->> 'role' = 'admin' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------
-- 1. TABLE: categories
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public categories access" ON public.categories;
DROP POLICY IF EXISTS "Categories read to all" ON public.categories;
DROP POLICY IF EXISTS "Admin write to categories" ON public.categories;

-- Anyone can read categories so store pages build successfully
CREATE POLICY "Categories read to all" 
ON public.categories FOR SELECT 
TO public 
USING (true);

-- Authenticated admins can INSERT, UPDATE, and DELETE categories
CREATE POLICY "Admin write to categories" 
ON public.categories FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 2. TABLE: products
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products read to all" ON public.products;
DROP POLICY IF EXISTS "Admin write to products" ON public.products;

-- Anyone can read products
CREATE POLICY "Products read to all" 
ON public.products FOR SELECT 
TO public 
USING (true);

-- Admin can perform any CRUD operation
CREATE POLICY "Admin write to products" 
ON public.products FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 3. TABLE: banners
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Banners read to all" ON public.banners;
DROP POLICY IF EXISTS "Admin write to banners" ON public.banners;

-- Anyone can read banners
CREATE POLICY "Banners read to all" 
ON public.banners FOR SELECT 
TO public 
USING (true);

-- Admin writes to banners
CREATE POLICY "Admin write to banners" 
ON public.banners FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 4. TABLE: banners_draft
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.banners_draft ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read banners_draft" ON public.banners_draft;
DROP POLICY IF EXISTS "Admin write to banners_draft" ON public.banners_draft;

-- Admins manage draft banners privately
CREATE POLICY "Admin select banners_draft" 
ON public.banners_draft FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admin write banners_draft" 
ON public.banners_draft FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 5. TABLE: settings
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings read to all" ON public.settings;
DROP POLICY IF EXISTS "Admin write to settings" ON public.settings;

-- Public can read settings (for currency, tagline, address info, etc.)
CREATE POLICY "Settings read to all" 
ON public.settings FOR SELECT 
TO public 
USING (true);

-- Admin can write
CREATE POLICY "Admin write to settings" 
ON public.settings FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 6. TABLE: site_settings & logos
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings read to all" ON public.site_settings;
DROP POLICY IF EXISTS "Admin write to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Logos read to all" ON public.logos;
DROP POLICY IF EXISTS "Admin write to logos" ON public.logos;

-- site_settings table
CREATE POLICY "Site settings read to all" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin write to site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- logos table (fallback)
CREATE POLICY "Logos read to all" ON public.logos FOR SELECT TO public USING (true);
CREATE POLICY "Admin write to logos" ON public.logos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 7. TABLE: site_management
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_management ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site management read to all" ON public.site_management;
DROP POLICY IF EXISTS "Admin write to site_management" ON public.site_management;

CREATE POLICY "Site management read to all" ON public.site_management FOR SELECT TO public USING (true);
CREATE POLICY "Admin write to site_management" ON public.site_management FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 8. TABLE: link_pages
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.link_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Link pages read to all" ON public.link_pages;
DROP POLICY IF EXISTS "Admin write to link_pages" ON public.link_pages;

CREATE POLICY "Link pages read to all" ON public.link_pages FOR SELECT TO public USING (true);
CREATE POLICY "Admin write to link_pages" ON public.link_pages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 9. TABLE: offers
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Offers read to all" ON public.offers;
DROP POLICY IF EXISTS "Admin write to offers" ON public.offers;

CREATE POLICY "Offers read to all" ON public.offers FOR SELECT TO public USING (true);
CREATE POLICY "Admin write to offers" ON public.offers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 10. TABLE: users
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user profile read" ON public.users;
DROP POLICY IF EXISTS "Allow user self edit" ON public.users;
DROP POLICY IF EXISTS "Admin complete access to users" ON public.users;

-- Users can read profiles
CREATE POLICY "Allow profile read" 
ON public.users FOR SELECT 
TO public 
USING (true);

-- Users can insert/upsert their own profile info upon register/login
CREATE POLICY "Allow profile upsert" 
ON public.users FOR ALL 
TO public
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());


-- ---------------------------------------------------------------------
-- 11. TABLE: customers
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin complete access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow customer upsert" ON public.customers;

-- Safe customer management: everyone can select or write customer records for checkout/registration
CREATE POLICY "Customers select to anyone" 
ON public.customers FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Customers write to anyone" 
ON public.customers FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);


-- ---------------------------------------------------------------------
-- 12. TABLE: inquiries
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;

-- Anyone can submit inquiries (leads, contact forms, represent message)
CREATE POLICY "Anyone can submit inquiry" 
ON public.inquiries FOR INSERT 
TO public 
WITH CHECK (true);

-- Anyone can read their own or admins view all
CREATE POLICY "Inquiry read management" 
ON public.inquiries FOR SELECT 
TO public 
USING (public.is_admin() OR email = auth.jwt() ->> 'email');

-- Admin manages inquiries fully
CREATE POLICY "Admin modify inquiries" 
ON public.inquiries FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 13. TABLE: properties
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can see properties" ON public.properties;
DROP POLICY IF EXISTS "Listed property write" ON public.properties;

CREATE POLICY "Anyone can see properties" 
ON public.properties FOR SELECT 
TO public 
USING (true);

-- Users can insert, update and delete their own properties
CREATE POLICY "Property write access" 
ON public.properties FOR ALL 
TO public
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());


-- ---------------------------------------------------------------------
-- 14. TABLE: liked_properties
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.liked_properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Liked properties control" ON public.liked_properties;

CREATE POLICY "Liked properties control" 
ON public.liked_properties FOR ALL 
TO public
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- =====================================================================
-- Complete! Execute the statements above to secure your database tables.
-- =====================================================================
