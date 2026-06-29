-- =====================================================================
-- MASTER PROVISIONING SCRIPT: TABLES & RLS SECURITY
-- =====================================================================
-- Run this in the Supabase SQL Editor.
-- =====================================================================

-- 1. CREATE ALL TABLES FIRST
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  uid TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'Active',
  created_at TEXT,
  last_login_at TEXT,
  gender TEXT,
  address TEXT,
  division TEXT,
  district TEXT,
  upazila TEXT,
  area TEXT,
  postal_code TEXT,
  profile_image TEXT,
  occasion_name TEXT,
  special_date TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  banner_name TEXT,
  banner_image TEXT,
  banner_images TEXT[] DEFAULT '{}',
  icon_image TEXT,
  wide_banner_image TEXT,
  button_text TEXT,
  button_link TEXT,
  featured_products TEXT,
  description TEXT,
  display_order INT DEFAULT 1,
  status TEXT DEFAULT 'Active',
  show_on_homepage BOOLEAN DEFAULT true,
  created_at TEXT,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  is_demo BOOLEAN DEFAULT false,
  slider_settings JSONB
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  discount_price NUMERIC,
  stock INT DEFAULT 0,
  image TEXT,
  image_url TEXT,
  featured_image TEXT,
  banner_image TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  media_url TEXT,
  rating NUMERIC DEFAULT 4.5,
  reviews INT DEFAULT 0,
  is_new BOOLEAN DEFAULT true,
  brand TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at BIGINT,
  buying_price NUMERIC,
  warranty TEXT,
  unit_name TEXT,
  sold_count INT DEFAULT 0,
  seo_points TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  shipping_zones JSONB DEFAULT '[]'::jsonb,
  is_flash_sale BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_best_selling BOOLEAN DEFAULT false,
  is_regular BOOLEAN DEFAULT true,
  is_offer BOOLEAN DEFAULT false,
  reward_coins INT DEFAULT 0,
  coin_enabled BOOLEAN DEFAULT false,
  is_demo BOOLEAN DEFAULT false,
  keywords TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phones TEXT[] DEFAULT '{}',
  emails TEXT[] DEFAULT '{}',
  address JSONB DEFAULT '{}'::jsonb,
  whats_app TEXT,
  note TEXT,
  profile_image TEXT,
  gender TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  password TEXT,
  occasion_name TEXT,
  special_date TEXT,
  status TEXT DEFAULT 'Active',
  customer_type TEXT DEFAULT 'New',
  total_orders INT DEFAULT 0,
  total_spend NUMERIC DEFAULT 0,
  last_login BIGINT,
  total_logins INT DEFAULT 0,
  last_ip TEXT,
  device_type TEXT,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  is_read BOOLEAN DEFAULT false,
  is_demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  bill_id TEXT,
  product_link TEXT,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  full_address TEXT NOT NULL,
  city_area TEXT,
  postal_code TEXT,
  delivery_mode TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'Placed',
  status_history JSONB DEFAULT '[]'::jsonb,
  status_updated_at TIMESTAMP DEFAULT NOW(),
  edited_by_admin TEXT,
  last_edit_time TIMESTAMP DEFAULT NOW(),
  customer_image TEXT,
  subtotal NUMERIC,
  delivery_charge NUMERIC,
  discount NUMERIC,
  total NUMERIC,
  payment_status TEXT DEFAULT 'Unpaid',
  is_read BOOLEAN DEFAULT false,
  items JSONB DEFAULT '[]'::jsonb,
  date TIMESTAMP DEFAULT NOW(),
  utm_params JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  quantity INT DEFAULT 1,
  variant TEXT DEFAULT 'Default',
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS public.store_identity (
  id TEXT PRIMARY KEY DEFAULT 'global',
  store_name TEXT,
  store_slug TEXT,
  store_description TEXT,
  support_email TEXT,
  contact_number TEXT,
  website_url TEXT,
  timezone TEXT,
  industry TEXT,
  primary_logo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.branding_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  site_name TEXT,
  site_short_name TEXT,
  site_tagline TEXT,
  
  -- Logos
  primary_logo TEXT,
  secondary_logo TEXT,
  favicon TEXT,
  apple_touch_icon TEXT,
  mobile_logo TEXT,
  desktop_logo TEXT,
  dark_logo TEXT,
  light_logo TEXT,
  footer_logo TEXT,
  invoice_logo TEXT,
  email_logo TEXT,
  loading_logo TEXT,
  watermark_logo TEXT,
  share_logo TEXT,
  login_logo TEXT,
  signup_logo TEXT,
  
  -- Branding Images
  default_profile_image TEXT,
  default_store_banner TEXT,
  default_category_banner TEXT,
  default_product_image TEXT,
  default_blog_banner TEXT,
  og_image TEXT,
  
  -- Theme Branding
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  text_color TEXT,
  background_color TEXT,
  
  -- SEO Branding
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Social Branding
  facebook_image TEXT,
  twitter_image TEXT,
  linkedin_image TEXT,
  
  -- System
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  image TEXT,
  original_image TEXT,
  name TEXT,
  description TEXT,
  button_enabled BOOLEAN DEFAULT false,
  button_text TEXT,
  button_link TEXT,
  is_custom_button_text BOOLEAN DEFAULT false,
  connected_product_id TEXT,
  locations TEXT[] DEFAULT '{}',
  banner_size TEXT,
  cta_destination TEXT,
  destination_type TEXT,
  cta_text TEXT,
  cta_link TEXT,
  status TEXT DEFAULT 'draft',
  "order" INT DEFAULT 0,
  banner_type TEXT,
  offer_text TEXT,
  discount_text TEXT,
  background_color TEXT,
  background_gradient TEXT,
  is_gradient BOOLEAN DEFAULT false,
  text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,
  border_color TEXT,
  font_family TEXT,
  font_size TEXT,
  font_weight TEXT,
  italic BOOLEAN DEFAULT false,
  alignment TEXT,
  logo_image TEXT,
  product_image TEXT,
  sticker_type TEXT,
  sticker_text TEXT,
  countdown_enabled BOOLEAN DEFAULT false,
  countdown_date TEXT,
  connected_category_id TEXT,
  connected_offer_id TEXT,
  created_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners_draft (
  id TEXT PRIMARY KEY,
  image TEXT,
  original_image TEXT,
  name TEXT,
  description TEXT,
  button_enabled BOOLEAN DEFAULT false,
  button_text TEXT,
  button_link TEXT,
  is_custom_button_text BOOLEAN DEFAULT false,
  connected_product_id TEXT,
  locations TEXT[] DEFAULT '{}',
  banner_size TEXT,
  cta_destination TEXT,
  destination_type TEXT,
  cta_text TEXT,
  cta_link TEXT,
  status TEXT DEFAULT 'draft',
  "order" INT DEFAULT 0,
  banner_type TEXT,
  offer_text TEXT,
  discount_text TEXT,
  background_color TEXT,
  background_gradient TEXT,
  is_gradient BOOLEAN DEFAULT false,
  text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,
  border_color TEXT,
  font_family TEXT,
  font_size TEXT,
  font_weight TEXT,
  italic BOOLEAN DEFAULT false,
  alignment TEXT,
  logo_image TEXT,
  product_image TEXT,
  sticker_type TEXT,
  sticker_text TEXT,
  countdown_enabled BOOLEAN DEFAULT false,
  countdown_date TEXT,
  connected_category_id TEXT,
  connected_offer_id TEXT,
  created_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. UTILITY FUNCTION (ADMIN CHECK)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  is_sys_admin boolean;
BEGIN
  -- A. Specific Administrator Email
  IF auth.jwt() ->> 'email' = 'admin.tazumartbd@gmail.com' THEN
    RETURN true;
  END IF;

  -- B. Check Users Table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.users WHERE id = $1 AND role IN (''admin'', ''moderator''))'
    INTO is_sys_admin
    USING auth.uid()::text;
    IF is_sys_admin THEN RETURN true; END IF;
  END IF;

  -- C. Metadata Check
  IF auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'moderator') THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENABLE RLS & CREATE POLICIES (Safety wrapped in DO blocks)
-- ---------------------------------------------------------------------

DO $$ 
BEGIN
    -- Users Policies
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow profile read" ON public.users;
    CREATE POLICY "Allow profile read" ON public.users FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Allow profile insert" ON public.users;
    CREATE POLICY "Allow profile insert" ON public.users FOR INSERT TO public WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow profile update" ON public.users;
    CREATE POLICY "Allow profile update" ON public.users FOR UPDATE TO public USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow profile delete" ON public.users;
    CREATE POLICY "Allow profile delete" ON public.users FOR DELETE TO public USING (true);

    -- Customers Policies
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Customers read access" ON public.customers;
    CREATE POLICY "Customers read access" ON public.customers FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Customers insert access" ON public.customers;
    CREATE POLICY "Customers insert access" ON public.customers FOR INSERT TO public WITH CHECK (true);
    DROP POLICY IF EXISTS "Customers update access" ON public.customers;
    CREATE POLICY "Customers update access" ON public.customers FOR UPDATE TO public USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Customers delete access" ON public.customers;
    CREATE POLICY "Customers delete access" ON public.customers FOR DELETE TO public USING (true);
    
    -- Categories Policies
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Categories read to all" ON public.categories;
    CREATE POLICY "Categories read to all" ON public.categories FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Admin write to categories" ON public.categories;
    CREATE POLICY "Admin write to categories" ON public.categories FOR ALL TO public USING (true) WITH CHECK (true);

    -- Products Policies
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Products read to all" ON public.products;
    CREATE POLICY "Products read to all" ON public.products FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Admin write to products" ON public.products;
    CREATE POLICY "Admin write to products" ON public.products FOR ALL TO public USING (true) WITH CHECK (true);

    -- Orders Policies
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Orders access" ON public.orders;
    CREATE POLICY "Orders access" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

    -- Order Items Policies
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Order items access" ON public.order_items;
    CREATE POLICY "Order items access" ON public.order_items FOR ALL TO public USING (true) WITH CHECK (true);

    -- Settings Policies
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Settings access" ON public.settings;
    CREATE POLICY "Settings access" ON public.settings FOR ALL TO public USING (true) WITH CHECK (true);

    -- Store Identity Policies
    ALTER TABLE public.store_identity ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Store Identity access" ON public.store_identity;
    CREATE POLICY "Store Identity access" ON public.store_identity FOR ALL TO public USING (true) WITH CHECK (true);

    -- Banners Policies
    ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Banners read" ON public.banners;
    CREATE POLICY "Banners read" ON public.banners FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Banners write" ON public.banners;
    CREATE POLICY "Banners write" ON public.banners FOR ALL TO public USING (true) WITH CHECK (true);

    -- Banners Draft Policies
    ALTER TABLE public.banners_draft ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Banners draft read" ON public.banners_draft;
    CREATE POLICY "Banners draft read" ON public.banners_draft FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Banners draft write" ON public.banners_draft;
    CREATE POLICY "Banners draft write" ON public.banners_draft FOR ALL TO public USING (true) WITH CHECK (true);

    -- Reviews Table
    CREATE TABLE IF NOT EXISTS public.reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      customer_name TEXT,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
      media_urls TEXT[] DEFAULT '{}',
      verified BOOLEAN DEFAULT false,
      is_pinned BOOLEAN DEFAULT false,
      admin_reply TEXT,
      rejection_reason TEXT,
      device_ip TEXT,
      anonymous BOOLEAN DEFAULT false,
      phone TEXT,
      email TEXT,
      order_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Reviews read access" ON public.reviews;
    CREATE POLICY "Reviews read access" ON public.reviews FOR SELECT TO public USING (
      status = 'approved' OR is_admin()
    );
    DROP POLICY IF EXISTS "Reviews insert access" ON public.reviews;
    CREATE POLICY "Reviews insert access" ON public.reviews FOR INSERT TO public WITH CHECK (true);
    DROP POLICY IF EXISTS "Reviews admin access" ON public.reviews;
    CREATE POLICY "Reviews admin access" ON public.reviews FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());
END $$;

-- 4. ENABLE REAL-TIME PUBLICATIONS
-- ---------------------------------------------------------------------
DO $$
BEGIN
  -- Check and add categories, products, banners, and banners_draft to realtime publication
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'categories'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'banners'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'banners_draft'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.banners_draft;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'store_identity'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.store_identity;
    END IF;
  END IF;
END $$;

