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
  "createdAt" TEXT,
  "lastLoginAt" TEXT,
  gender TEXT,
  address TEXT,
  division TEXT,
  district TEXT,
  upazila TEXT,
  area TEXT,
  "postalCode" TEXT,
  "profileImage" TEXT,
  "occasionName" TEXT,
  "specialDate" TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  "bannerName" TEXT,
  "bannerImage" TEXT,
  "bannerImages" TEXT[] DEFAULT '{}',
  "iconImage" TEXT,
  "wideBannerImage" TEXT,
  "buttonText" TEXT,
  "buttonLink" TEXT,
  "featuredProducts" TEXT,
  description TEXT,
  "displayOrder" INT DEFAULT 1,
  status TEXT DEFAULT 'Active',
  "showOnHomepage" BOOLEAN DEFAULT true,
  "createdAt" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  keywords TEXT,
  "isDemo" BOOLEAN DEFAULT false,
  "sliderSettings" JSONB
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  "discountPrice" NUMERIC,
  stock INT DEFAULT 0,
  image TEXT,
  "imageUrl" TEXT,
  featured_image TEXT,
  banner_image TEXT,
  images TEXT[] DEFAULT '{}',
  "videoUrl" TEXT,
  "mediaUrl" TEXT,
  rating NUMERIC DEFAULT 4.5,
  reviews INT DEFAULT 0,
  "isNew" BOOLEAN DEFAULT true,
  brand TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  "createdAt" BIGINT,
  "buyingPrice" NUMERIC,
  warranty TEXT,
  "unitName" TEXT,
  "soldCount" INT DEFAULT 0,
  "seoPoints" TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  "shippingZones" JSONB DEFAULT '[]'::jsonb,
  is_flash_sale BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_best_selling BOOLEAN DEFAULT false,
  is_regular BOOLEAN DEFAULT true,
  is_offer BOOLEAN DEFAULT false,
  reward_coins INT DEFAULT 0,
  coin_enabled BOOLEAN DEFAULT false,
  "isDemo" BOOLEAN DEFAULT false,
  keywords TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phones TEXT[] DEFAULT '{}',
  emails TEXT[] DEFAULT '{}',
  address JSONB DEFAULT '{}'::jsonb,
  "whatsApp" TEXT,
  note TEXT,
  "profileImage" TEXT,
  gender TEXT,
  "socialLinks" JSONB DEFAULT '[]'::jsonb,
  password TEXT,
  "occasionName" TEXT,
  "specialDate" TEXT,
  status TEXT DEFAULT 'Active',
  "customerType" TEXT DEFAULT 'New',
  "totalOrders" INT DEFAULT 0,
  "totalSpend" NUMERIC DEFAULT 0,
  "lastLogin" BIGINT,
  "totalLogins" INT DEFAULT 0,
  "lastIP" TEXT,
  "deviceType" TEXT,
  "paymentMethods" JSONB DEFAULT '[]'::jsonb,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  "isRead" BOOLEAN DEFAULT false,
  "isDemo" BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  "orderId" TEXT UNIQUE NOT NULL,
  "billId" TEXT,
  "productLink" TEXT,
  "customerName" TEXT NOT NULL,
  "mobileNumber" TEXT NOT NULL,
  email TEXT,
  "fullAddress" TEXT NOT NULL,
  "cityArea" TEXT,
  "postalCode" TEXT,
  "deliveryMode" TEXT,
  "paymentMethod" TEXT,
  status TEXT DEFAULT 'Placed',
  "statusHistory" JSONB DEFAULT '[]'::jsonb,
  "status_updated_at" BIGINT,
  "edited_by_admin" TEXT,
  "last_edit_time" BIGINT,
  "customerImage" TEXT,
  "subtotal" NUMERIC,
  "deliveryCharge" NUMERIC,
  "discount" NUMERIC,
  "total" NUMERIC,
  "paymentStatus" TEXT DEFAULT 'Unpaid',
  "isRead" BOOLEAN DEFAULT false,
  "items" JSONB DEFAULT '[]'::jsonb,
  date TEXT,
  "utmParams" JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT,
  image TEXT,
  link TEXT,
  "displayOrder" INT DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" BIGINT
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
    
    -- Categories Policies
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Categories read to all" ON public.categories;
    CREATE POLICY "Categories read to all" ON public.categories FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Admin write to categories" ON public.categories;
    CREATE POLICY "Admin write to categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

    -- Products Policies
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Products read to all" ON public.products;
    CREATE POLICY "Products read to all" ON public.products FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Admin write to products" ON public.products;
    CREATE POLICY "Admin write to products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

    -- Orders Policies
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Orders access" ON public.orders;
    CREATE POLICY "Orders access" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

    -- Settings Policies
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Settings read" ON public.settings;
    CREATE POLICY "Settings read" ON public.settings FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Settings write" ON public.settings;
    CREATE POLICY "Settings write" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

    -- Banners Policies
    ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Banners read" ON public.banners;
    CREATE POLICY "Banners read" ON public.banners FOR SELECT TO public USING (true);
    DROP POLICY IF EXISTS "Banners write" ON public.banners;
    CREATE POLICY "Banners write" ON public.banners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;
