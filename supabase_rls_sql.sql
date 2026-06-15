-- =====================================================================
-- SUPABASE COMPLETE SCHEMA & ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
-- Run this entire script in the Supabase SQL Editor to provision all
-- tables, helper functions, and RLS security configurations.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. ADMIN VALIDATION UTILITY FUNCTION
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

  -- B. Check if user exists in public.users custom target table
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    -- Use dynamic SQL to avoid compilation error if table doesn't exist yet
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.users WHERE id = $1 AND role IN (''admin'', ''moderator''))'
    INTO is_sys_admin
    USING auth.uid()::text;
    
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
-- 1. TABLE: users
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

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow profile read" ON public.users;
    DROP POLICY IF EXISTS "Allow profile insert" ON public.users;
    DROP POLICY IF EXISTS "Allow profile update" ON public.users;
    DROP POLICY IF EXISTS "Allow profile delete" ON public.users;

    CREATE POLICY "Allow profile read" ON public.users FOR SELECT TO public USING (true);
    CREATE POLICY "Allow profile insert" ON public.users FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Allow profile update" ON public.users FOR UPDATE TO public USING (auth.uid()::text = id OR public.is_admin()) WITH CHECK (auth.uid()::text = id OR public.is_admin());
    CREATE POLICY "Allow profile delete" ON public.users FOR DELETE TO public USING (auth.uid()::text = id OR public.is_admin());
END $$;


-- ---------------------------------------------------------------------
-- 2. TABLE: customers
-- ---------------------------------------------------------------------
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

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Customers select to anyone" ON public.customers;
    DROP POLICY IF EXISTS "Customers write to anyone" ON public.customers;

    CREATE POLICY "Customers select to anyone" ON public.customers FOR SELECT TO public USING (true);
    CREATE POLICY "Customers write to anyone" ON public.customers FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 3. TABLE: categories
-- ---------------------------------------------------------------------
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

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Categories read to all" ON public.categories;
        DROP POLICY IF EXISTS "Admin write to categories" ON public.categories;

        CREATE POLICY "Categories read to all" ON public.categories FOR SELECT TO public USING (true);
        CREATE POLICY "Admin write to categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;
END $$;


-- ---------------------------------------------------------------------
-- 4. TABLE: products
-- ---------------------------------------------------------------------
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

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Products read to all" ON public.products;
        DROP POLICY IF EXISTS "Admin write to products" ON public.products;

        CREATE POLICY "Products read to all" ON public.products FOR SELECT TO public USING (true);
        CREATE POLICY "Admin write to products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;
END $$;


-- ---------------------------------------------------------------------
-- 5. TABLE: orders
-- ---------------------------------------------------------------------
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
  "paymentStatus" TEXT DEFAULT 'Unpaid',
  type TEXT DEFAULT 'Online',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC,
  discount JSONB DEFAULT '{}'::jsonb,
  tax JSONB DEFAULT '{}'::jsonb,
  "deliveryCharge" NUMERIC,
  "paidAmount" NUMERIC,
  "dueAmount" NUMERIC,
  total NUMERIC,
  date BIGINT,
  notes TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "isDemo" BOOLEAN DEFAULT false,
  "promoCodeUsed" TEXT,
  courier JSONB DEFAULT '{}'::jsonb,
  "utmParams" JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Orders read to public" ON public.orders;
    DROP POLICY IF EXISTS "Orders write to public" ON public.orders;

    CREATE POLICY "Orders read to public" ON public.orders FOR SELECT TO public USING (true);
    CREATE POLICY "Orders write to public" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 6. TABLE: banners & banners_draft
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  "mobileImageUrl" TEXT,
  "linkUrl" TEXT,
  title TEXT,
  description TEXT,
  "displayOrder" INT DEFAULT 0,
  status TEXT DEFAULT 'Active',
  "createdAt" BIGINT
);

CREATE TABLE IF NOT EXISTS public.banners_draft (
  id TEXT PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  "mobileImageUrl" TEXT,
  "linkUrl" TEXT,
  title TEXT,
  description TEXT,
  "displayOrder" INT DEFAULT 0,
  status TEXT DEFAULT 'Active',
  "createdAt" BIGINT
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners_draft ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Banners read to all" ON public.banners;
    DROP POLICY IF EXISTS "Admin write to banners" ON public.banners;
    DROP POLICY IF EXISTS "Admin select banners_draft" ON public.banners_draft;
    DROP POLICY IF EXISTS "Admin write banners_draft" ON public.banners_draft;

    CREATE POLICY "Banners read to all" ON public.banners FOR SELECT TO public USING (true);
    CREATE POLICY "Admin write to banners" ON public.banners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "Admin select banners_draft" ON public.banners_draft FOR SELECT TO authenticated USING (public.is_admin());
    CREATE POLICY "Admin write banners_draft" ON public.banners_draft FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;


-- ---------------------------------------------------------------------
-- 7. TABLE: settings
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  data JSONB,
  phones TEXT[] DEFAULT '{}',
  "imageUrl" TEXT,
  config JSONB,
  providers JSONB,
  value TEXT
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Settings read to all" ON public.settings;
    DROP POLICY IF EXISTS "Settings write to all" ON public.settings;

    CREATE POLICY "Settings read to all" ON public.settings FOR SELECT TO public USING (true);
    CREATE POLICY "Settings write to all" ON public.settings FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 8. TABLE: site_settings & logos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  "siteName" TEXT,
  "siteTitle" TEXT,
  tagline TEXT,
  logo TEXT,
  icon TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  footer TEXT,
  "updatedAt" TEXT
);

CREATE TABLE IF NOT EXISTS public.logos (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  "updatedAt" TEXT
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Site settings read to all" ON public.site_settings;
    DROP POLICY IF EXISTS "Admin write to site_settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Logos read to all" ON public.logos;
    DROP POLICY IF EXISTS "Admin write to logos" ON public.logos;

    CREATE POLICY "Site settings read to all" ON public.site_settings FOR SELECT TO public USING (true);
    CREATE POLICY "Admin write to site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "Logos read to all" ON public.logos FOR SELECT TO public USING (true);
    CREATE POLICY "Admin write to logos" ON public.logos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;


-- ---------------------------------------------------------------------
-- 9. TABLE: site_management & link_pages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_management (
  id TEXT PRIMARY KEY,
  "storeName" TEXT,
  "contactPhone" TEXT,
  "contactEmail" TEXT,
  "officeAddress" TEXT,
  "tradeLicense" TEXT,
  "tinNumber" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "currencySymbol" TEXT DEFAULT '৳',
  "lowStockThreshold" INT DEFAULT 5,
  "termsConditions" TEXT,
  "privacyPolicy" TEXT,
  "returnRefundPolicy" TEXT,
  "deliveryInformation" TEXT,
  "aboutUs" TEXT,
  "lastUpdated" TEXT
);

CREATE TABLE IF NOT EXISTS public.link_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'Active',
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "seoKeywords" TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

ALTER TABLE public.site_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_pages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Site management read to all" ON public.site_management;
    DROP POLICY IF EXISTS "Admin write to site_management" ON public.site_management;
    DROP POLICY IF EXISTS "Link pages read to all" ON public.link_pages;
    DROP POLICY IF EXISTS "Admin write to link_pages" ON public.link_pages;

    CREATE POLICY "Site management read to all" ON public.site_management FOR SELECT TO public USING (true);
    CREATE POLICY "Admin write to site_management" ON public.site_management FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "Link pages read to all" ON public.link_pages FOR SELECT TO public USING (true);
    CREATE POLICY "Admin write to link_pages" ON public.link_pages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;


-- ---------------------------------------------------------------------
-- 10. TABLE: offers & inquiries
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  code TEXT,
  type TEXT,
  value NUMERIC,
  "minPurchase" NUMERIC,
  "startDate" TEXT,
  "endDate" TEXT,
  status TEXT DEFAULT 'Active',
  "createdAt" TEXT
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  "createdAt" TEXT
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Offers read to all" ON public.offers;
    DROP POLICY IF EXISTS "Admin write to offers" ON public.offers;
    DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
    DROP POLICY IF EXISTS "Inquiry read management" ON public.inquiries;
    DROP POLICY IF EXISTS "Admin modify inquiries" ON public.inquiries;

    CREATE POLICY "Offers read to all" ON public.offers FOR SELECT TO public USING (true);
    CREATE POLICY "Admin write to offers" ON public.offers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Inquiry read management" ON public.inquiries FOR SELECT TO public USING (public.is_admin() OR email = auth.jwt() ->> 'email');
    CREATE POLICY "Admin modify inquiries" ON public.inquiries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;


-- ---------------------------------------------------------------------
-- 11. TABLE: properties & liked_properties
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  price NUMERIC,
  image TEXT,
  "user_id" TEXT,
  "createdAt" TEXT
);

CREATE TABLE IF NOT EXISTS public.liked_properties (
  id TEXT PRIMARY KEY,
  "user_id" TEXT,
  "property_id" TEXT,
  "createdAt" TEXT
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_properties ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can see properties" ON public.properties;
    DROP POLICY IF EXISTS "Property write access" ON public.properties;
    DROP POLICY IF EXISTS "Liked properties control" ON public.liked_properties;

    CREATE POLICY "Anyone can see properties" ON public.properties FOR SELECT TO public USING (true);
    CREATE POLICY "Property write access" ON public.properties FOR ALL TO public USING (user_id = auth.uid()::text OR public.is_admin()) WITH CHECK (user_id = auth.uid()::text OR public.is_admin());
    CREATE POLICY "Liked properties control" ON public.liked_properties FOR ALL TO public USING (user_id = auth.uid()::text OR public.is_admin()) WITH CHECK (user_id = auth.uid()::text OR public.is_admin());
END $$;


-- ---------------------------------------------------------------------
-- 12. TABLE: tracking_statuses
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracking_statuses (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "order" INT NOT NULL
);

ALTER TABLE public.tracking_statuses ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "tracking_statuses select to public" ON public.tracking_statuses;
    DROP POLICY IF EXISTS "tracking_statuses write to public" ON public.tracking_statuses;

    CREATE POLICY "tracking_statuses select to public" ON public.tracking_statuses FOR SELECT TO public USING (true);
    CREATE POLICY "tracking_statuses write to public" ON public.tracking_statuses FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 13. TABLE: popup_campaigns
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.popup_campaigns (
  id TEXT PRIMARY KEY,
  title TEXT,
  "imageUrl" TEXT,
  "actionLink" TEXT,
  "buttonText" TEXT,
  "displayOrder" INT DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" BIGINT
);

ALTER TABLE public.popup_campaigns ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "popup_campaigns select to public" ON public.popup_campaigns;
    DROP POLICY IF EXISTS "popup_campaigns write to public" ON public.popup_campaigns;

    CREATE POLICY "popup_campaigns select to public" ON public.popup_campaigns FOR SELECT TO public USING (true);
    CREATE POLICY "popup_campaigns write to public" ON public.popup_campaigns FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 14. TABLE: conversations & messages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  "customerName" TEXT,
  phone TEXT,
  "lastMessageText" TEXT,
  "lastMessageTimestamp" BIGINT,
  "unreadCount" INT DEFAULT 0,
  status TEXT DEFAULT 'open',
  "assignedModerator" TEXT,
  "internalNotes" TEXT,
  "isBlocked" BOOLEAN DEFAULT false,
  "deviceType" TEXT,
  "createdAt" BIGINT
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id TEXT PRIMARY KEY,
  "conversation_id" TEXT,
  sender TEXT,
  text TEXT,
  timestamp BIGINT,
  seen BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "conversations access" ON public.conversations;
    DROP POLICY IF EXISTS "messages access" ON public.conversation_messages;

    CREATE POLICY "conversations access" ON public.conversations FOR ALL TO public USING (true) WITH CHECK (true);
    CREATE POLICY "messages access" ON public.conversation_messages FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 15. TABLE: broadcasts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id TEXT PRIMARY KEY,
  title TEXT,
  message TEXT,
  pinned BOOLEAN DEFAULT false,
  "createdAt" BIGINT
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "broadcasts select" ON public.broadcasts;
    DROP POLICY IF EXISTS "broadcasts write" ON public.broadcasts;

    CREATE POLICY "broadcasts select" ON public.broadcasts FOR SELECT TO public USING (true);
    CREATE POLICY "broadcasts write" ON public.broadcasts FOR ALL TO public USING (true) WITH CHECK (true);
END $$;


-- ---------------------------------------------------------------------
-- 16. TABLE: promo_codes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  "minOrder" NUMERIC DEFAULT 0,
  "expiryDate" TEXT,
  "usageLimit" INT DEFAULT 0,
  "usedCount" INT DEFAULT 0,
  status TEXT DEFAULT 'Active',
  "createdAt" BIGINT
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "promo_codes select" ON public.promo_codes;
    DROP POLICY IF EXISTS "promo_codes write" ON public.promo_codes;

    CREATE POLICY "promo_codes select" ON public.promo_codes FOR SELECT TO public USING (true);
    CREATE POLICY "promo_codes write" ON public.promo_codes FOR ALL TO public USING (true) WITH CHECK (true);
END $$;

-- =====================================================================
-- Complete Master Setup script compiled successfully!
-- =====================================================================
