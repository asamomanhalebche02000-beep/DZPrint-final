-- DZPrint Supabase PostgreSQL Production Schema
-- Compatible with PostgreSQL 15+ and Supabase

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('received', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_method AS ENUM ('home', 'office');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  store_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.1 STORES (Multi-store architecture)
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo TEXT,
  favicon TEXT,
  phone TEXT DEFAULT '0550 12 34 56',
  whatsapp TEXT DEFAULT '0550 12 34 56',
  email TEXT DEFAULT 'contact@dzprint.dz',
  address TEXT DEFAULT 'الجزائر العاصمة',
  description TEXT DEFAULT 'متجر طباعة وتخصيص رقمي متقدم في الجزائر',
  default_language TEXT DEFAULT 'ar',
  supported_languages JSONB DEFAULT '["ar", "fr", "en"]'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default primary store for DZPrint
INSERT INTO public.stores (id, slug, name, phone, email, address, description, default_language)
VALUES (
  'store-dzprint-default',
  'dzprint',
  'ديزاد برينت | DZPrint',
  '0550 12 34 56',
  'contact@dzprint.dz',
  'الجزائر العاصمة، بئر مراد رايس',
  'المنصة الأولى للطباعة الرقمية المباشرة DTF والشحن لـ 58 ولاية في الجزائر',
  'ar'
) ON CONFLICT (id) DO NOTHING;

-- 3.2 LANDING PAGE SECTIONS (Visual Builder)
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default' NOT NULL,
  type TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_visible BOOLEAN DEFAULT true NOT NULL,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default',
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default',
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  sku TEXT,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  description_en TEXT,
  mockup_template_url TEXT,
  images JSONB DEFAULT '[]'::jsonb NOT NULL,
  colors JSONB DEFAULT '[]'::jsonb NOT NULL,
  sizes TEXT[] DEFAULT '{}'::text[] NOT NULL,
  features TEXT[] DEFAULT '{}'::text[] NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRODUCT VARIANTS (Granular SKU tracking)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT NOT NULL,
  sku TEXT UNIQUE,
  additional_price NUMERIC(10, 2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 100,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. DESIGNS (Pre-made Algerian & creative artwork)
CREATE TABLE IF NOT EXISTS public.designs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'all' NOT NULL,
  image_url TEXT NOT NULL,
  author TEXT DEFAULT 'DZPrint Studio' NOT NULL,
  tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
  compatible_products TEXT[] DEFAULT '{}'::text[] NOT NULL,
  is_trending BOOLEAN DEFAULT false NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CUSTOMER UPLOADED DESIGNS (Supabase Storage reference)
CREATE TABLE IF NOT EXISTS public.uploaded_designs (
  id TEXT PRIMARY KEY,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  public_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. WILAYAS (All 58 Algerian Wilayas)
CREATE TABLE IF NOT EXISTS public.wilayas (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  zone TEXT DEFAULT 'standard',
  active BOOLEAN DEFAULT true NOT NULL
);

-- 10. DELIVERY AGENCIES (Yalidine, Procolis, Maystro, etc.)
CREATE TABLE IF NOT EXISTS public.delivery_agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  notes TEXT,
  logo_url TEXT,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. DELIVERY RATES (Per Agency per Wilaya)
CREATE TABLE IF NOT EXISTS public.delivery_rates (
  id TEXT PRIMARY KEY,
  agency_id TEXT REFERENCES public.delivery_agencies(id) ON DELETE CASCADE NOT NULL,
  wilaya_id INTEGER REFERENCES public.wilayas(id) ON DELETE CASCADE NOT NULL,
  home_price NUMERIC(10, 2) NOT NULL CHECK (home_price >= 0),
  office_price NUMERIC(10, 2) NOT NULL CHECK (office_price >= 0),
  estimated_days TEXT DEFAULT '2-4 أيام' NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(agency_id, wilaya_id)
);

-- 12. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default' NOT NULL,
  code TEXT NOT NULL,
  type coupon_type DEFAULT 'percentage' NOT NULL,
  value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  min_order NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  max_discount NUMERIC(10, 2),
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0 NOT NULL,
  expiry_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(store_id, code)
);

-- 13. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default' NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  wilaya_id INTEGER REFERENCES public.wilayas(id) NOT NULL,
  wilaya_name TEXT NOT NULL,
  delivery_agency_id TEXT REFERENCES public.delivery_agencies(id) NOT NULL,
  delivery_agency_name TEXT NOT NULL,
  delivery_method delivery_method DEFAULT 'home' NOT NULL,
  delivery_address TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL CHECK (delivery_fee >= 0),
  discount NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (discount >= 0),
  coupon_code TEXT,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status order_status DEFAULT 'received' NOT NULL,
  customer_notes TEXT,
  admin_notes TEXT,
  payment_method TEXT DEFAULT 'cod' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  category_snapshot TEXT,
  variant_id TEXT,
  color_snapshot TEXT NOT NULL,
  color_hex_snapshot TEXT NOT NULL,
  size_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  design_id TEXT,
  design_name_snapshot TEXT,
  uploaded_design_url TEXT,
  customization_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  note TEXT,
  created_by TEXT DEFAULT 'System',
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  rating INTEGER DEFAULT 5 NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  avatar_url TEXT,
  product_name TEXT,
  approved BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question_ar TEXT NOT NULL,
  question_fr TEXT,
  answer_ar TEXT NOT NULL,
  answer_fr TEXT,
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. SITE SETTINGS & CMS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default' NOT NULL,
  store_name TEXT DEFAULT 'ديزاد برينت | DZPrint' NOT NULL,
  phone TEXT DEFAULT '0550 12 34 56' NOT NULL,
  email TEXT DEFAULT 'contact@dzprint.dz' NOT NULL,
  address TEXT DEFAULT 'الجزائر العاصمة، بئر مراد رايس' NOT NULL,
  working_hours TEXT DEFAULT 'السبت - الخميس: 9:00 - 18:00',
  announcement TEXT,
  currencies JSONB DEFAULT '["DA"]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.homepage_cms (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE DEFAULT 'store-dzprint-default' NOT NULL,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_badge TEXT,
  stats JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  banners JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. EMAIL TEMPLATES
CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,
  template_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_delivery_rates_agency_wilaya ON public.delivery_rates(agency_id, wilaya_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_designs_active ON public.designs(active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

-- Helper functions for store authorization
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_store_member(target_store_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND (
        (role IN ('owner', 'admin', 'staff') AND store_id = target_store_id)
        OR role = 'admin'
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view and update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id OR auth.role() = 'service_role');

-- Stores policies
CREATE POLICY "Public can view active stores" ON public.stores
  FOR SELECT USING (is_active = true);
CREATE POLICY "Store owners and staff can manage their store" ON public.stores
  FOR ALL USING (
    auth.role() = 'service_role' OR
    owner_id = auth.uid() OR
    public.is_store_member(id)
  );

-- Storefront Public Read Policies
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (active = true);
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Public can view active product variants" ON public.product_variants FOR SELECT USING (active = true);
CREATE POLICY "Public can view active designs" ON public.designs FOR SELECT USING (active = true);
CREATE POLICY "Public can view wilayas" ON public.wilayas FOR SELECT USING (active = true);
CREATE POLICY "Public can view active delivery agencies" ON public.delivery_agencies FOR SELECT USING (active = true);
CREATE POLICY "Public can view active delivery rates" ON public.delivery_rates FOR SELECT USING (active = true);
CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT USING (approved = true);
CREATE POLICY "Public can view faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view homepage cms" ON public.homepage_cms FOR SELECT USING (true);
CREATE POLICY "Public can view published landing sections" ON public.landing_sections FOR SELECT USING (is_published = true AND is_visible = true);

-- Orders: SECURE creation & restricted view (NO public SELECT true!)
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order status history" ON public.order_status_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Store staff can view and manage their store orders" ON public.orders
  FOR ALL USING (
    auth.role() = 'service_role' OR
    public.is_store_member(store_id)
  );

CREATE POLICY "Store staff can manage order items" ON public.order_items
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND public.is_store_member(o.store_id)
    )
  );

CREATE POLICY "Store staff can manage status history" ON public.order_status_history
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id AND public.is_store_member(o.store_id)
    )
  );

-- Store-scoped Management Policies
CREATE POLICY "Store staff manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'service_role' OR public.is_store_member(store_id));

CREATE POLICY "Store staff manage products" ON public.products
  FOR ALL USING (auth.role() = 'service_role' OR public.is_store_member(store_id));

CREATE POLICY "Store staff manage product variants" ON public.product_variants
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND public.is_store_member(p.store_id)
    )
  );

CREATE POLICY "Store staff manage coupons" ON public.coupons
  FOR ALL USING (auth.role() = 'service_role' OR public.is_store_member(store_id));

CREATE POLICY "Store staff manage site settings" ON public.site_settings
  FOR ALL USING (auth.role() = 'service_role' OR public.is_store_member(store_id));

CREATE POLICY "Store staff manage homepage cms" ON public.homepage_cms
  FOR ALL USING (auth.role() = 'service_role' OR public.is_store_member(store_id));

CREATE POLICY "Store staff manage landing sections" ON public.landing_sections
  FOR ALL USING (auth.role() = 'service_role' OR public.is_store_member(store_id));

-- Admin full access for platform assets
CREATE POLICY "Admin full access designs" ON public.designs FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin full access wilayas" ON public.wilayas FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin full access delivery_agencies" ON public.delivery_agencies FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin full access delivery_rates" ON public.delivery_rates FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin full access testimonials" ON public.testimonials FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin full access faqs" ON public.faqs FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin full access email_templates" ON public.email_templates FOR ALL USING (public.is_platform_admin() OR auth.role() = 'service_role');

