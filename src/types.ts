export type Language = 'ar' | 'fr' | 'en';
export type Theme = 'light' | 'dark';

export interface Wilaya {
  id: number;
  code: string; // e.g. "01", "02", ..., "58"
  name_ar: string;
  name_fr: string;
  name_en: string;
  active: boolean;
}

export interface DeliveryAgency {
  id: string;
  name: string;
  logo_url: string;
  phone: string;
  website?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRate {
  id: string;
  agency_id: string;
  wilaya_id: number;
  home_price: number;
  office_price: number;
  estimated_days: string;
  active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ProductCategory = 't-shirts' | 'hoodies' | 'mugs' | 'totebags' | 'caps';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'owner' | 'admin' | 'staff' | 'customer';
  store_id?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  name_ar?: string;
  name_fr?: string;
  name_en?: string;
  business_name?: string;
  logo?: string;
  favicon?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  description: string;
  description_ar?: string;
  description_fr?: string;
  description_en?: string;
  default_language: Language;
  supported_languages: Language[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export type LandingSectionType =
  | 'hero'
  | 'featured_products'
  | 'categories'
  | 'promo_banner'
  | 'about'
  | 'services'
  | 'testimonials'
  | 'faq'
  | 'contact'
  | 'custom_text_image'
  | 'cta';

export interface LandingSection {
  id: string;
  store_id: string;
  type: LandingSectionType;
  sort_order: number;
  is_visible: boolean;
  content: {
    title_ar?: string;
    title_fr?: string;
    title_en?: string;
    subtitle_ar?: string;
    subtitle_fr?: string;
    subtitle_en?: string;
    badge_ar?: string;
    badge_fr?: string;
    badge_en?: string;
    btn_text_ar?: string;
    btn_text_fr?: string;
    btn_text_en?: string;
    btn_link?: string;
    secondary_btn_text_ar?: string;
    secondary_btn_text_fr?: string;
    secondary_btn_text_en?: string;
    secondary_btn_link?: string;
    image_url?: string;
    bg_color?: string;
    text_color?: string;
    discount_code?: string;
    discount_percent?: number;
    items?: any[];
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface LandingPageData {
  store_id: string;
  draft_sections: LandingSection[];
  published_sections: LandingSection[];
  published_at?: string | null;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  color_hex: string;
  size: string; // S, M, L, XL, XXL, 3XL or 'Standard' for mugs
  price_adjustment: number;
  stock: number;
  active: boolean;
}

export interface Product {
  id: string;
  store_id?: string;
  name: string;
  name_ar?: string;
  name_fr?: string;
  name_en?: string;
  slug: string;
  description: string;
  description_ar?: string;
  description_fr?: string;
  description_en?: string;
  category: ProductCategory;
  sku: string;
  base_price: number;
  sale_price?: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  inventory?: number;
  stock_quantity?: number;
  featured?: boolean;
  best_seller?: boolean;
  is_new?: boolean;
  customizable?: boolean;
  is_customizable?: boolean;
  active: boolean;
  variants?: ProductVariant[];
  mockup_template_url?: string;
  features?: string[];
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Design {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  category: ProductCategory | 'all' | string;
  image_url: string;
  best_seller?: boolean;
  featured?: boolean;
  compatible_products: ProductCategory[];
  tags?: string[];
  active: boolean;
  is_active?: boolean;
  author?: string;
  is_trending?: boolean;
  downloads_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomizationData {
  custom_text?: string;
  text_font?: string;
  text_color?: string;
  text_size?: number;
  image_url?: string;
  scale: number; // 0.5 to 2.0
  x: number; // offset X percentage
  y: number; // offset Y percentage
  rotation: number; // degrees
  placement: 'front' | 'back';
  user_instructions?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  category: ProductCategory;
  variant_id?: string;
  color: string;
  color_hex: string;
  size: string;
  design_id?: string;
  design_name?: string;
  uploaded_design_url?: string;
  customization?: CustomizationData;
  quantity: number;
  unit_price: number;
}

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'printing'
  | 'ready'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  created_by?: string;
}

export interface OrderItem {
  order_id?: string;
  product_id: string;
  product_name_snapshot: string;
  category_snapshot: ProductCategory;
  variant_id?: string;
  color_snapshot: string;
  color_hex_snapshot?: string;
  size_snapshot: string;
  quantity: number;
  unit_price: number;
  design_id?: string;
  design_name_snapshot?: string;
  uploaded_design_id?: string;
  uploaded_design_url?: string;
  customization_data?: CustomizationData;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "PRINT-2026-000001"
  customer_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  wilaya_id: number;
  wilaya_name?: string;
  delivery_agency_id: string;
  delivery_agency_name?: string;
  delivery_method: 'home' | 'office';
  delivery_address?: string;
  delivery_fee: number;
  subtotal: number;
  discount: number;
  coupon_code?: string;
  total: number;
  status: OrderStatus;
  customer_notes?: string;
  admin_notes?: string;
  attachment_urls?: string[];
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 500 for 500 DA
  min_order: number;
  max_discount?: number;
  usage_limit: number;
  times_used: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at?: string;
}

export interface SiteSettings {
  store_id?: string;
  business_name: string;
  business_name_ar: string;
  business_name_fr?: string;
  business_name_en?: string;
  store_name?: string;
  store_name_ar?: string;
  store_name_fr?: string;
  store_name_en?: string;
  store_description?: string;
  store_description_ar?: string;
  store_description_fr?: string;
  store_description_en?: string;
  about_text_ar?: string;
  about_text_fr?: string;
  about_text_en?: string;
  logo_url: string;
  favicon_url?: string;
  phone: string;
  whatsapp: string;
  whatsapp_phone?: string;
  order_number_prefix?: string;
  email: string;
  address: string;
  working_hours?: string;
  facebook: string;
  facebook_url?: string;
  instagram: string;
  instagram_url?: string;
  tiktok: string;
  tiktok_url?: string;
  youtube_url?: string;
  telegram_url?: string;
  currency: string;
  order_prefix: string;
  free_delivery_threshold: number;
  email_notifications_enabled: boolean;

  // Meta Pixel Tracking
  meta_pixel_id?: string;
  meta_pixel_enabled?: boolean;

  // Google Sheet Integration
  google_sheet_url?: string;
  google_sheet_webhook_url?: string;
  google_sheet_sync_enabled?: boolean;

  // Main Page Text, Font & Color Customization
  hero_headline?: string;
  hero_headline_highlight?: string;
  hero_headline_color?: string;
  hero_headline_font?: string;
  hero_subheadline?: string;
  hero_subheadline_color?: string;
  hero_badge_text?: string;
  hero_badge_color?: string;
  hero_start_btn_text?: string;
  hero_catalog_btn_text?: string;
}

export interface HomepageCMS {
  hero_headline_ar: string;
  hero_headline_fr: string;
  hero_headline_en: string;
  hero_subheadline_ar: string;
  hero_subheadline_fr: string;
  hero_subheadline_en: string;
  trust_badges: { title_ar: string; title_fr: string; title_en: string; icon: string }[];
  faqs: { question_ar: string; question_fr: string; question_en: string; answer_ar: string; answer_fr: string; answer_en: string }[];
  testimonials: { author: string; city: string; rating: number; text_ar: string; text_fr: string; text_en: string }[];
}

export interface QuoteCalculationRequest {
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }[];
  wilaya_id: number;
  delivery_agency_id: string;
  delivery_method: 'home' | 'office';
  coupon_code?: string;
}

export interface QuoteCalculationResponse {
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  delivery_available: boolean;
  delivery_message?: string;
  agency_name: string;
  wilaya_name: string;
}

// ==========================================
// 1. CRM / CUSTOMER TYPES
// ==========================================
export type CustomerTag = 'VIP' | 'Regular' | 'New' | 'B2B' | 'Wholesale' | 'At Risk';

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  wilaya_id: number;
  wilaya_name: string;
  address?: string;
  notes?: string;
  tags: CustomerTag[];
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  created_at: string;
  updated_at?: string;
}

// ==========================================
// 2. INVENTORY & SUPPLY CHAIN TYPES
// ==========================================
export type InventoryCategory = 'blank' | 'ink' | 'film_powder' | 'packaging' | 'accessory';

export interface InventoryItem {
  id: string;
  name: string;
  name_ar?: string;
  category: InventoryCategory;
  type: string; // e.g., 'T-Shirt Coton 240g', 'Encre DTF Dupont', 'Mug Blanc 11oz'
  color?: string;
  size?: string;
  current_stock: number;
  min_threshold: number;
  unit: string; // pcs, ml, kg, roll, box
  cost_per_unit: number; // in DZD
  supplier_id?: string;
  supplier_name?: string;
  location_in_workshop?: string; // e.g. "Zone A - Étagère 3"
  sku?: string;
  notes?: string;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export type MovementType = 'restock' | 'production_use' | 'waste_defect' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  item_id: string;
  item_name: string;
  change_qty: number; // positive for add, negative for consume
  previous_stock: number;
  new_stock: number;
  type: MovementType;
  reason?: string;
  operator: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  wilaya?: string;
  address?: string;
  supplied_materials: string[];
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

// ==========================================
// 3. PRODUCTION & WORKSHOP TYPES
// ==========================================
export type PrintTechnique = 'DTF' | 'Sublimation' | 'Vinyl' | 'ScreenPrint' | 'Embroidery';

export type ProductionStage =
  | 'received'       // New / Awaiting confirmation
  | 'ready_to_print' // Files checked, blank retrieved, ready for RIP
  | 'in_production'  // Currently printing or heat pressing
  | 'quality_check'  // Cured, checked for defects, folded & packed
  | 'ready_to_ship'  // Packaged with shipping label, ready for courier pickup
  | 'completed';     // Dispatched / Finished

export interface ProductionJob {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  stage: ProductionStage;
  priority: 'normal' | 'rush' | 'urgent';
  technique: PrintTechnique;
  assigned_technician?: string;
  items_summary: string;
  target_date?: string;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 4. INVOICES & QUOTATIONS (Factures & Devis)
// ==========================================
export type InvoiceType = 'quote' | 'invoice'; // Devis ou Facture
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string; // e.g. DEV-2026-001 or FACT-2026-001
  type: InvoiceType;
  order_id?: string;
  client_name: string;
  client_company?: string;
  client_phone: string;
  client_email?: string;
  client_address?: string;
  client_wilaya?: string;
  client_nif?: string;
  client_nis?: string;
  client_rc?: string;
  issue_date: string;
  due_date?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number; // 0% or 19% TVA if formal company
  tax_amount: number;
  stamp_duty: number; // Droit de timbre
  discount: number;
  total: number;
  status: InvoiceStatus;
  payment_method?: 'cod' | 'baridimob' | 'ccp' | 'bank_transfer' | 'cash';
  notes?: string;
  created_at: string;
  updated_at: string;
}
