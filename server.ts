import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { Database } from './server/db';
import {
  getServerSupabase,
  uploadDesignToSupabaseStorage,
  uploadStoreAssetToSupabaseStorage,
  uploadProductImageToSupabaseStorage,
} from './server/supabase';
import { sendOrderNotificationEmails } from './server/email';
import {
  syncOrderToGoogleSheet,
  syncBulkOrdersToGoogleSheet,
  testGoogleSheetWebhook,
  generateOrdersGoogleSheetsCsv,
} from './server/googleSheet';
import {
  Order,
  OrderItem,
  OrderStatus,
  QuoteCalculationRequest,
  SiteSettings,
  Store,
  Profile,
  UserRole,
  LandingSection,
} from './src/types';

export const app = express();
const PORT = 3000;

// Body parsing with safe size limit
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Multer memory storage for customer designs (ZERO disk writes for 100% Vercel Serverless compatibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('صيغة الملف غير مدعومة. يرجى رفع صورة PNG أو JPG أو WEBP فقط.'));
    }
  },
});

// Multer memory storage for branding assets (Logo, Favicon, Icons)
const assetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/ico',
      'image/x-ico',
    ];
    const lowerName = file.originalname.toLowerCase();
    if (
      allowedMime.includes(file.mimetype) ||
      lowerName.endsWith('.ico') ||
      lowerName.endsWith('.svg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.webp')
    ) {
      cb(null, true);
    } else {
      cb(new Error('صيغة الملف غير مدعومة. يرجى رفع صورة PNG أو JPG أو SVG أو WEBP أو ICO'));
    }
  },
});

// ==========================================
// CENTRAL AUTHENTICATION & MULTI-STORE HELPERS
// ==========================================
export interface AuthUserContext {
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
  profile: Profile;
  store_id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUserContext;
    }
  }
}

/**
 * Require valid authenticated user from Supabase Auth
 */
export async function requireAuthenticatedUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'غير مصرح: يجب تسجيل الدخول للوصول إلى هذا الرابط',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({ error: 'رمز الدخول غير صالح' });
    }

    const supabase = getServerSupabase();
    let authUser: any = null;

    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          authUser = user;
        }
      } catch (err: any) {
        console.warn('[Supabase getUser check]:', err.message);
      }
    }

    // Fallback: If Supabase connection is offline in local dev mode,
    // match by profile ID or email if token carries user identification
    if (!authUser) {
      const profiles = await Database.getProfiles();
      const matched = profiles.find(p => p.id === token || p.email === token);
      if (matched) {
        authUser = { id: matched.id, email: matched.email };
      } else {
        return res.status(401).json({ error: 'جلسة تسجيل الدخول غير صالحة أو منتهية' });
      }
    }

    // Retrieve user profile to determine role and store_id
    let profile: Profile | null = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (!error && data) {
          profile = data;
        }
      } catch (err: any) {
        console.warn('[Supabase getProfile check]:', err.message);
      }
    }

    if (!profile) {
      profile = await Database.getProfileById(authUser.id);
    }

    // If profile row doesn't exist yet, construct and persist from user metadata
    if (!profile) {
      const meta = authUser.user_metadata || authUser.app_metadata || {};
      const storeId = meta.store_id || 'store-dzprint-default';
      const role: UserRole = meta.role || 'owner';
      const newProfile: Profile = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: meta.full_name || authUser.email?.split('@')[0] || 'User',
        store_id: storeId,
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await Database.saveProfile(newProfile);
      profile = newProfile;
    }

    const storeId = profile.store_id || 'store-dzprint-default';
    const role = profile.role || 'owner';

    req.auth = {
      user: authUser,
      profile,
      store_id: storeId,
      role,
    };

    return next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Require access to store management (owner, admin, or staff)
 */
export function requireStoreAccess(allowedRoles: UserRole[] = ['owner', 'admin', 'staff']) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireAuthenticatedUser(req, res, () => {
      if (!req.auth) {
        return res.status(401).json({ error: 'غير مصرح' });
      }

      if (!allowedRoles.includes(req.auth.role)) {
        return res.status(403).json({
          error: 'عذراً، هذا الحساب ليس لديه صلاحيات الوصول إلى لوحة تحكم المتجر',
        });
      }

      return next();
    });
  };
}

export const requireAdminAuth = requireStoreAccess(['owner', 'admin', 'staff']);

// ==========================================
// SECURE STORE REGISTRATION & AUTH ENDPOINTS
// ==========================================

/**
 * POST /api/auth/register-store
 * Provisions new store and sets user profile to role = 'owner'
 */
app.post('/api/auth/register-store', async (req: Request, res: Response) => {
  try {
    const { fullName, email, storeName, storeSlug, userId } = req.body || {};

    if (!email || !storeName) {
      return res.status(400).json({ error: 'البريد الإلكتروني واسم المتجر مطلوبان' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanStoreName = String(storeName).trim();
    const rawSlug = String(storeSlug || cleanStoreName)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanSlug = rawSlug || `store-${Date.now().toString(36)}`;

    const supabase = getServerSupabase();
    let authUser: any = null;

    // Check token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (supabase) {
        try {
          const { data } = await supabase.auth.getUser(token);
          if (data?.user) authUser = data.user;
        } catch {
          // ignore
        }
      }
    }

    const targetUserId = authUser?.id || userId || `user-${Date.now()}`;

    // 1. Create or ensure new Store
    const newStoreId = `store-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const storeRecord: Store = {
      id: newStoreId,
      owner_id: targetUserId,
      name: cleanStoreName,
      slug: cleanSlug,
      phone: '',
      whatsapp: '',
      email: cleanEmail,
      address: 'الجزائر',
      description: cleanStoreName,
      default_language: 'ar',
      supported_languages: ['ar', 'fr', 'en'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await Database.saveStore(storeRecord);

    // 2. Initialize default landing sections and store settings for the new store
    await Database.publishLandingSections(undefined, newStoreId);
    await Database.updateSettings(
      {
        store_name: cleanStoreName,
        business_name: cleanStoreName,
        business_name_ar: cleanStoreName,
        email: cleanEmail,
      },
      newStoreId
    );

    // 3. Create or update profile with role = 'owner' and store_id = newStoreId
    const profileRecord: Profile = {
      id: targetUserId,
      email: cleanEmail,
      full_name: fullName ? String(fullName).trim() : cleanStoreName,
      store_id: newStoreId,
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await Database.saveProfile(profileRecord);

    return res.json({
      success: true,
      store: storeRecord,
      profile: profileRecord,
      user: {
        id: targetUserId,
        email: cleanEmail,
        user_metadata: {
          full_name: profileRecord.full_name,
          store_id: newStoreId,
          role: 'owner',
        },
      },
    });
  } catch (err: any) {
    console.error('[register-store error]:', err);
    res.status(500).json({ error: err.message || 'فشل تسجيل المتجر والحساب' });
  }
});

/**
 * GET /api/auth/profile
 */
app.get('/api/auth/profile', requireAuthenticatedUser, async (req: Request, res: Response) => {
  try {
    const store = await Database.getStoreById(req.auth!.store_id);
    res.json({
      success: true,
      profile: req.auth!.profile,
      store,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 */
app.put('/api/auth/profile', requireAuthenticatedUser, async (req: Request, res: Response) => {
  try {
    const { full_name, phone, avatar_url } = req.body || {};
    const current = req.auth!.profile;
    const updated: Profile = {
      ...current,
      full_name: full_name !== undefined ? String(full_name).trim() : current.full_name,
      phone: phone !== undefined ? String(phone).trim() : current.phone,
      avatar_url: avatar_url !== undefined ? String(avatar_url).trim() : current.avatar_url,
      updated_at: new Date().toISOString(),
    };
    await Database.saveProfile(updated);
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/update-password
 */
app.post('/api/auth/update-password', requireAuthenticatedUser, async (req: Request, res: Response) => {
  try {
    const { password } = req.body || {};
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' });
    }
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.admin.updateUserById(req.auth!.user.id, { password });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  res.json({ success: true });
});

// ==========================================
// PUBLIC STOREFRONT ENDPOINTS
// ==========================================

// 1. Wilayas (58 Algerian Wilayas)
app.get('/api/wilayas', async (req, res) => {
  try {
    const wilayas = await Database.getWilayas();
    res.json(wilayas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Delivery Agencies
app.get('/api/agencies', async (req, res) => {
  try {
    const agencies = await Database.getAgencies();
    res.json(agencies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delivery Rates
app.get(['/api/delivery-rates', '/api/rates'], async (req, res) => {
  try {
    const { agency_id, wilaya_id } = req.query;
    const rates = await Database.getRates(
      agency_id ? String(agency_id) : undefined,
      wilaya_id ? parseInt(String(wilaya_id), 10) : undefined
    );
    res.json(rates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Products Catalog
app.get('/api/products', async (req, res) => {
  try {
    const { category, activeOnly } = req.query;
    let products = await Database.getProducts(activeOnly === 'true');
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Database.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Designs Gallery
app.get('/api/designs', async (req, res) => {
  try {
    const { category, activeOnly } = req.query;
    let designs = await Database.getDesigns(activeOnly === 'true');
    if (category && category !== 'all') {
      designs = designs.filter(d => d.category === category);
    }
    res.json(designs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/designs/:id', async (req, res) => {
  try {
    const design = await Database.getDesignById(req.params.id);
    if (!design) return res.status(404).json({ error: 'التصميم غير موجود' });
    res.json(design);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Coupons Validation
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, cart_subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'يرجى إدخال رمز الكوبون' });
    }
    const coupon = await Database.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ error: 'رمز الكوبون غير صحيح أو منتهي الصلاحية' });
    }

    const subtotal = Number(cart_subtotal) || 0;
    if (coupon.min_order && subtotal < coupon.min_order) {
      return res.status(400).json({
        error: `الحد الأدنى للطلب للاستفادة من هذا الكوبون هو ${coupon.min_order} د.ج`,
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount_amount: discount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Customer Design Upload (Supabase Storage with memory buffer)
app.post('/api/upload', upload.single('designFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم استلام أي ملف' });
    }

    const file = req.file;

    // Upload to Supabase Storage private bucket
    const result = await uploadDesignToSupabaseStorage(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (result.success && result.url) {
      return res.json({
        success: true,
        url: result.url,
        storagePath: result.storagePath,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

    // Fallback if Supabase credentials are not yet configured:
    // Encode to data URL so the client preview works completely without filesystem reliance
    const base64Data = file.buffer.toString('base64');
    const fallbackUrl = `data:${file.mimetype};base64,${base64Data}`;

    res.json({
      success: true,
      url: fallbackUrl,
      size: file.size,
      mimetype: file.mimetype,
      note: 'Storage in-memory fallback active',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Dynamic Checkout Quote Calculation (Strict Server-Side Calculations)
app.post('/api/orders/validate-quote', async (req, res) => {
  try {
    const body: QuoteCalculationRequest = req.body;
    const { items, wilaya_id, delivery_agency_id, delivery_method, coupon_code } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'السلة فارغة' });
    }

    const products = await Database.getProducts();
    const wilayas = await Database.getWilayas();
    const agencies = await Database.getAgencies();

    // 1. Calculate Authoritative Subtotal from database prices
    let subtotal = 0;
    for (const it of items) {
      const prod = products.find(p => p.id === it.product_id);
      if (!prod || !prod.active) {
        return res.status(400).json({ error: `المنتج المطلوب (${it.product_id}) غير متاح حالياً` });
      }
      const unitPrice = prod.sale_price && prod.sale_price > 0 ? prod.sale_price : prod.base_price;
      subtotal += unitPrice * it.quantity;
    }

    // 2. Validate Wilaya
    const wilaya = wilayas.find(w => w.id === wilaya_id && w.active);
    if (!wilaya) {
      return res.status(400).json({ error: 'الولاية المختارة غير صالحة أو غير مفعلة' });
    }

    // 3. Validate Delivery Agency & Rate
    const agency = agencies.find(a => a.id === delivery_agency_id && a.active);
    if (!agency) {
      return res.status(400).json({ error: 'شركة التوصيل المختارة غير متاحة' });
    }

    const rate = await Database.getRate(delivery_agency_id, wilaya_id);
    if (!rate || !rate.active) {
      return res.status(400).json({
        delivery_available: false,
        delivery_message: `خدمة التوصيل غير متوفرة حالياً لولاية ${wilaya.name_ar} عبر ${agency.name}. يرجى اختيار شركة توصيل أخرى.`,
      });
    }

    const delivery_fee = delivery_method === 'home' ? rate.home_price : rate.office_price;

    // 4. Validate Coupon
    let discount = 0;
    if (coupon_code) {
      const coupon = await Database.getCouponByCode(coupon_code);
      if (coupon && subtotal >= coupon.min_order) {
        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * coupon.value) / 100);
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else {
          discount = coupon.value;
        }
      }
    }

    const total = Math.max(0, subtotal + delivery_fee - discount);

    res.json({
      subtotal,
      delivery_fee,
      discount,
      total,
      delivery_available: true,
      agency_name: agency.name,
      wilaya_name: `${wilaya.code} - ${wilaya.name_ar} (${wilaya.name_fr})`,
      estimated_days: rate.estimated_days,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Order Placement (Authoritative Backend Validation & Resend Email Dispatch)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      wilaya_id,
      delivery_agency_id,
      delivery_method,
      delivery_address,
      customer_notes,
      coupon_code,
      attachment_urls,
      items,
    } = req.body;

    // Validations
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ error: 'يرجى إدخال الاسم واللقب الكامل' });
    }
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      return res.status(400).json({ error: 'يرجى إدخال رقم هاتف جزائري صالح (مثال: 0550123456)' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'السلة فارغة. يرجى إضافة منتج للطلب.' });
    }
    if (delivery_method === 'home' && (!delivery_address || delivery_address.trim().length < 5)) {
      return res.status(400).json({ error: 'يرجى كتابة عنوان التوصيل المنزلي بدقة (الشارع، الحي، البلدية)' });
    }

    const wilayas = await Database.getWilayas();
    const agencies = await Database.getAgencies();
    const products = await Database.getProducts();

    const wilaya = wilayas.find(w => w.id === parseInt(String(wilaya_id), 10));
    if (!wilaya || !wilaya.active) {
      return res.status(400).json({ error: 'الولاية المختارة غير متوفرة' });
    }

    const agency = agencies.find(a => a.id === delivery_agency_id);
    if (!agency || !agency.active) {
      return res.status(400).json({ error: 'شركة التوصيل المختارة غير متوفرة' });
    }

    // Retrieve database rate (NEVER trust rate from browser)
    const rate = await Database.getRate(delivery_agency_id, wilaya.id);
    if (!rate || !rate.active) {
      return res.status(400).json({ error: 'تسعيرة التوصيل غير متوفرة لهذه الولاية والشركة' });
    }

    const delivery_fee = delivery_method === 'home' ? rate.home_price : rate.office_price;

    // Build authoritative snapshot items
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const it of items) {
      const prod = products.find(p => p.id === it.product_id);
      if (!prod) {
        return res.status(400).json({ error: `المنتج (${it.product_id}) غير موجود` });
      }
      const unitPrice = prod.sale_price && prod.sale_price > 0 ? prod.sale_price : prod.base_price;
      const quantity = Math.max(1, parseInt(String(it.quantity || 1), 10));
      subtotal += unitPrice * quantity;

      orderItems.push({
        product_id: prod.id,
        product_name_snapshot: prod.name,
        category_snapshot: prod.category,
        variant_id: it.variant_id,
        color_snapshot: it.color || 'اللون الافتراضي',
        color_hex_snapshot: it.color_hex || '#111827',
        size_snapshot: it.size || 'قياسي',
        quantity,
        unit_price: unitPrice,
        design_id: it.design_id,
        design_name_snapshot: it.design_name,
        uploaded_design_url: it.uploaded_design_url,
        customization_data: it.customization,
      });
    }

    // Calculate coupon
    let discount = 0;
    let validCouponCode: string | undefined = undefined;
    if (coupon_code) {
      const coupon = await Database.getCouponByCode(coupon_code);
      if (coupon && subtotal >= coupon.min_order) {
        validCouponCode = coupon.code;
        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * coupon.value) / 100);
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else {
          discount = coupon.value;
        }
      }
    }

    const total = Math.max(0, subtotal + delivery_fee - discount);
    const orderNumber = await Database.generateNextOrderNumber();
    const now = new Date().toISOString();

    const order: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      full_name: full_name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : undefined,
      wilaya_id: wilaya.id,
      wilaya_name: `${wilaya.code} - ${wilaya.name_ar} (${wilaya.name_fr})`,
      delivery_agency_id: agency.id,
      delivery_agency_name: agency.name,
      delivery_method,
      delivery_address: delivery_method === 'home' ? delivery_address.trim() : `استلام من مكتب ${agency.name}`,
      delivery_fee,
      subtotal,
      discount,
      coupon_code: validCouponCode,
      total,
      status: 'received',
      customer_notes: customer_notes ? customer_notes.trim() : undefined,
      attachment_urls: Array.isArray(attachment_urls) ? attachment_urls.filter(Boolean) : [],
      items: orderItems,
      created_at: now,
      updated_at: now,
      status_history: [
        {
          status: 'received',
          timestamp: now,
          note: 'تم تسجيل طلبك بنجاح في النظام وسيتصل بك فريقنا للتأكيد',
        },
      ],
    };

    const created = await Database.createOrder(order);

    // Send transactional notifications with Resend (Real email dispatch)
    sendOrderNotificationEmails(created).catch(err => {
      console.error('[Email dispatch error]:', err);
    });

    // Auto-sync order directly to Google Sheet Webhook if configured
    syncOrderToGoogleSheet(created).catch(err => {
      console.error('[Google Sheet sync error]:', err);
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Customer Order Tracking (By Order Number + Phone)
app.get('/api/orders/track', async (req, res) => {
  try {
    const { order_number, phone } = req.query;
    if (!order_number || !phone) {
      return res.status(400).json({ error: 'رقم الطلب ورقم الهاتف مطلوبان لمعاينة حالة الطلب' });
    }

    const order = await Database.getOrderByNumberAndPhone(String(order_number), String(phone));
    if (!order) {
      return res.status(404).json({
        error: 'لم يتم العثور على طلب يطابق هذا الرقم ورقم الهاتف المدخل. يرجى التحقق من البيانات.',
      });
    }

    const sanitizedOrder = { ...order };
    delete sanitizedOrder.admin_notes;
    res.json(sanitizedOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Site Settings & CMS
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Database.getSettings();
    // Return public store settings; keep sensitive administrative secrets protected
    const publicSettings = {
      business_name: settings.business_name,
      business_name_ar: settings.business_name_ar,
      store_name: settings.store_name || settings.business_name_ar || settings.business_name,
      store_description: settings.store_description,
      store_description_ar: settings.store_description_ar,
      logo_url: settings.logo_url || '',
      favicon_url: settings.favicon_url || '',
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      whatsapp_phone: settings.whatsapp_phone,
      order_number_prefix: settings.order_number_prefix,
      email: settings.email,
      address: settings.address,
      working_hours: settings.working_hours,
      facebook: settings.facebook,
      facebook_url: settings.facebook_url,
      instagram: settings.instagram,
      instagram_url: settings.instagram_url,
      tiktok: settings.tiktok,
      tiktok_url: settings.tiktok_url,
      youtube_url: settings.youtube_url,
      telegram_url: settings.telegram_url,
      currency: settings.currency,
      order_prefix: settings.order_prefix,
      free_delivery_threshold: settings.free_delivery_threshold,
      meta_pixel_id: settings.meta_pixel_id,
      meta_pixel_enabled: settings.meta_pixel_enabled,
      hero_headline: settings.hero_headline,
      hero_headline_highlight: settings.hero_headline_highlight,
      hero_headline_color: settings.hero_headline_color,
      hero_headline_font: settings.hero_headline_font,
      hero_subheadline: settings.hero_subheadline,
      hero_subheadline_color: settings.hero_subheadline_color,
      hero_badge_text: settings.hero_badge_text,
      hero_badge_color: settings.hero_badge_color,
      hero_start_btn_text: settings.hero_start_btn_text,
      hero_catalog_btn_text: settings.hero_catalog_btn_text,
    };
    res.json(publicSettings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms', async (req, res) => {
  try {
    const cms = await Database.getHomepageCMS();
    res.json(cms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PROTECTED ADMIN ENDPOINTS (requireAdminAuth)
// ==========================================

// Verify current admin session and return profile + store info
app.get('/api/admin/auth/me', requireAdminAuth, async (req, res) => {
  const store = await Database.getStoreById(req.auth!.store_id);
  res.json({
    success: true,
    message: 'مرحباً بك في لوحة تحكم المتجر',
    user: req.auth!.user,
    profile: req.auth!.profile,
    store,
    store_id: req.auth!.store_id,
    role: req.auth!.role,
  });
});

// Admin Store Management Endpoints
app.get('/api/admin/store', requireAdminAuth, async (req, res) => {
  try {
    const store = await Database.getStoreById(req.auth!.store_id);
    res.json({ success: true, store });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/store', requireAdminAuth, async (req, res) => {
  try {
    const { name, slug, domain } = req.body || {};
    const existing = await Database.getStoreById(req.auth!.store_id);
    if (!existing) return res.status(404).json({ error: 'المتجر غير موجود' });
    const updatedStore: Store = {
      ...existing,
      name: name !== undefined ? String(name).trim() : existing.name,
      slug: slug !== undefined ? String(slug).trim() : existing.slug,
      domain: domain !== undefined ? (domain ? String(domain).trim() : null) : existing.domain,
      updated_at: new Date().toISOString(),
    };
    await Database.saveStore(updatedStore);
    res.json({ success: true, store: updatedStore });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', requireAdminAuth, async (req, res) => {
  try {
    const { status, wilaya_id, agency_id, search } = req.query;
    let orders = await Database.getOrders(req.auth!.store_id);

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (wilaya_id) {
      orders = orders.filter(o => o.wilaya_id === parseInt(String(wilaya_id), 10));
    }
    if (agency_id) {
      orders = orders.filter(o => o.delivery_agency_id === agency_id);
    }
    if (search) {
      const q = String(search).toLowerCase();
      orders = orders.filter(
        o =>
          o.order_number.toLowerCase().includes(q) ||
          o.full_name.toLowerCase().includes(q) ||
          o.phone.includes(q)
      );
    }

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status, note, created_by } = req.body;
    const updated = await Database.updateOrderStatus(
      req.params.id,
      status as OrderStatus,
      note,
      created_by
    );
    if (!updated) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/delivery-rates', requireAdminAuth, async (req, res) => {
  try {
    const { agency_id, wilaya_id } = req.query;
    const rates = await Database.getRates(
      agency_id ? String(agency_id) : undefined,
      wilaya_id ? parseInt(String(wilaya_id), 10) : undefined
    );
    res.json(rates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/delivery-rates', requireAdminAuth, async (req, res) => {
  try {
    const rate = req.body;
    rate.id = rate.id || `rate_${rate.agency_id}_${rate.wilaya_id}`;
    rate.updated_at = new Date().toISOString();
    const saved = await Database.saveRate(rate);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/admin/rates/bulk', '/api/admin/delivery-rates/bulk'], requireAdminAuth, async (req, res) => {
  try {
    const { rates } = req.body;
    if (!Array.isArray(rates)) {
      return res.status(400).json({ error: 'قائمة الأسعار غير صالحة' });
    }
    for (const r of rates) {
      await Database.saveRate(r);
    }
    res.json({ success: true, count: rates.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get(['/api/admin/rates/export-csv', '/api/admin/delivery-rates/export-csv'], async (req, res) => {
  try {
    const rates = await Database.getRates();
    const wilayas = await Database.getWilayas();
    const agencies = await Database.getAgencies();

    let csv = 'agency_id,agency_name,wilaya_id,wilaya_name,home_price,office_price,estimated_days,active\n';
    for (const r of rates) {
      const w = wilayas.find(x => x.id === r.wilaya_id);
      const a = agencies.find(x => x.id === r.agency_id);
      csv += `"${r.agency_id}","${a?.name || ''}",${r.wilaya_id},"${w?.name_ar || ''}",${r.home_price},${r.office_price},"${r.estimated_days || ''}",${r.active}\n`;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dzprint-rates.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

app.post(['/api/admin/rates/import-csv', '/api/admin/delivery-rates/import-csv'], requireAdminAuth, async (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) return res.status(400).json({ error: 'لم يتم استلام أي بيانات CSV' });
    const lines = csvData.trim().split('\n');
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
      if (parts.length >= 6) {
        const agency_id = parts[0];
        const wilaya_id = parseInt(parts[2], 10);
        const home_price = parseFloat(parts[4]) || 0;
        const office_price = parseFloat(parts[5]) || 0;
        const estimated_days = parts[6] || '2-4 أيام';
        if (agency_id && !isNaN(wilaya_id)) {
          await Database.saveRate({
            id: `rate_${agency_id}_${wilaya_id}`,
            agency_id,
            wilaya_id,
            home_price,
            office_price,
            estimated_days,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          imported++;
        }
      }
    }
    res.json({ success: true, message: `تم تحديث ${imported} تسعيرة بنجاح` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/agencies', requireAdminAuth, async (req, res) => {
  try {
    const agencies = await Database.getAgencies();
    res.json(agencies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/agencies', requireAdminAuth, async (req, res) => {
  try {
    const agency = req.body;
    agency.updated_at = new Date().toISOString();
    const saved = await Database.saveAgency(agency);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/agencies/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Database.deleteAgency(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'شركة التوصيل غير موجودة' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const products = await Database.getProducts(false, req.auth!.store_id);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const prod = req.body;
    prod.id = prod.id || `prod-${Date.now()}`;
    prod.updated_at = new Date().toISOString();
    const saved = await Database.saveProduct(prod, req.auth!.store_id);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const prod = req.body;
    prod.id = req.params.id;
    prod.updated_at = new Date().toISOString();
    const saved = await Database.saveProduct(prod, req.auth!.store_id);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/admin/upload-product-image',
  requireAdminAuth,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم استلام أي ملف للرفع' });
      }
      const storeId = req.auth!.store_id;
      const result = await uploadProductImageToSupabaseStorage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        storeId
      );

      if (!result.success || !result.url) {
        return res.status(500).json({
          error: result.error || 'فشل رفع صورة المنتج إلى Supabase Storage',
        });
      }

      res.json({
        success: true,
        url: result.url,
        storagePath: result.storagePath,
      });
    } catch (err: any) {
      console.error('[Upload Product Image Error]:', err);
      res.status(500).json({ error: err.message || 'حدث خطأ أثناء رفع صورة المنتج' });
    }
  }
);

app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Database.deleteProduct(req.params.id, req.auth!.store_id);
    if (!deleted) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/designs', requireAdminAuth, async (req, res) => {
  try {
    const designs = await Database.getDesigns(false);
    res.json(designs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/designs', requireAdminAuth, async (req, res) => {
  try {
    const design = req.body;
    design.id = design.id || `des-${Date.now()}`;
    design.updated_at = new Date().toISOString();
    const saved = await Database.saveDesign(design);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/designs/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Database.deleteDesign(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'التصميم غير موجود' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/coupons', requireAdminAuth, async (req, res) => {
  try {
    const coupons = await Database.getCoupons();
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/coupons', requireAdminAuth, async (req, res) => {
  try {
    const coupon = req.body;
    coupon.id = coupon.id || `coup-${Date.now()}`;
    const saved = await Database.saveCoupon(coupon);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Database.deleteCoupon(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'الكوبون غير موجود' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/settings', requireAdminAuth, async (req, res) => {
  try {
    const settings = await Database.getSettings(req.auth!.store_id);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/admin/settings', '/api/admin/settings/update'], requireAdminAuth, async (req, res) => {
  try {
    const updated = await Database.updateSettings(req.body, req.auth!.store_id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', requireAdminAuth, async (req, res) => {
  try {
    const updated = await Database.updateSettings(req.body, req.auth!.store_id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Asset Upload (Store Logo, Favicon) with Supabase Storage integration
app.post(
  '/api/admin/upload-asset',
  requireAdminAuth,
  assetUpload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم استلام أي ملف للرفع' });
      }

      const assetType = req.body.asset_type === 'favicon' ? 'favicon' : 'logo';
      const file = req.file;
      const storeId = req.auth!.store_id;

      const result = await uploadStoreAssetToSupabaseStorage(
        file.buffer,
        file.originalname,
        file.mimetype,
        assetType,
        storeId
      );

      if (!result.success || !result.url) {
        return res.status(500).json({
          error: result.error || 'فشل رفع الملف إلى Supabase Storage. يرجى المحاولة مرة أخرى.',
        });
      }

      // Auto update the setting in the database immediately if auto_save is true
      if (req.body.auto_save === 'true' || req.body.auto_save === true) {
        const updatePayload: Partial<SiteSettings> = {};
        if (assetType === 'logo') {
          updatePayload.logo_url = result.url;
        } else {
          updatePayload.favicon_url = result.url;
        }
        await Database.updateSettings(updatePayload, storeId);
      }

      res.json({
        success: true,
        url: result.url,
        storagePath: result.storagePath,
        assetType,
        filename: file.originalname,
      });
    } catch (err: any) {
      console.error('[Upload Asset Endpoint Error]:', err);
      res.status(500).json({ error: err.message || 'حدث خطأ أثناء معالجة رفع الملف' });
    }
  }
);

app.get('/api/admin/cms', requireAdminAuth, async (req, res) => {
  try {
    const cms = await Database.getHomepageCMS();
    res.json(cms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/cms', requireAdminAuth, async (req, res) => {
  try {
    const updated = await Database.updateHomepageCMS(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DYNAMIC LANDING PAGE BUILDER & SECTIONS
// ==========================================
app.get('/api/landing', async (req, res) => {
  try {
    const storeId = (req.query.store_id as string) || 'store-dzprint-default';
    const sections = await Database.getLandingSections(storeId, false);
    res.json({ sections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/landing', requireAdminAuth, async (req, res) => {
  try {
    const storeId = req.auth!.store_id;
    const draft_sections = await Database.getLandingSections(storeId, true);
    const published_sections = await Database.getLandingSections(storeId, false);
    res.json({ draft_sections, published_sections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/landing/draft', requireAdminAuth, async (req, res) => {
  try {
    const storeId = req.auth!.store_id;
    const sections = req.body.sections || [];
    const saved = await Database.saveLandingDraft(sections, storeId);
    res.json({ success: true, sections: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/landing', requireAdminAuth, async (req, res) => {
  try {
    const storeId = req.auth!.store_id;
    const sections = req.body.sections || [];
    const saved = await Database.saveLandingDraft(sections, storeId);
    res.json({ success: true, sections: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/landing/publish', requireAdminAuth, async (req, res) => {
  try {
    const storeId = req.auth!.store_id;
    const sections = req.body.sections;
    const published = await Database.publishLandingSections(sections, storeId);
    res.json({ success: true, sections: published });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/landing/reset', requireAdminAuth, async (req, res) => {
  try {
    const storeId = req.auth!.store_id;
    const reset = await Database.resetLandingToInitial(storeId);
    res.json({ success: true, sections: reset });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics
app.get('/api/admin/analytics', requireAdminAuth, async (req, res) => {
  try {
    const orders = await Database.getOrders(req.auth!.store_id);
    const products = await Database.getProducts(false, req.auth!.store_id);

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => ['received', 'confirmed', 'printing'].includes(o.status)).length;

    // Wilaya distribution
    const wilayaCounts: Record<string, number> = {};
    orders.forEach(o => {
      const name = o.wilaya_name ? o.wilaya_name.split('-')[1]?.trim() || o.wilaya_name : 'غير محدد';
      wilayaCounts[name] = (wilayaCounts[name] || 0) + 1;
    });

    const topWilayas = Object.entries(wilayaCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalProducts: products.length,
      topWilayas,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GOOGLE SHEETS SYNC & EXPORT ENDPOINTS
// ==========================================
app.post('/api/admin/google-sheet/sync-all', requireAdminAuth, async (req, res) => {
  try {
    const orders = await Database.getOrders();
    const result = await syncBulkOrdersToGoogleSheet(orders);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/google-sheet/test', requireAdminAuth, async (req, res) => {
  try {
    const { webhook_url } = req.body || {};
    if (!webhook_url) {
      return res.status(400).json({ error: 'رابط Webhook الخاص بـ Google Sheet مطلوب للاختبار' });
    }
    await testGoogleSheetWebhook(webhook_url);
    res.json({ success: true, message: 'تم إرسال سطر تجريبي بنجاح إلى جدول Google!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export designed specifically with Arabic UTF-8 for Google Sheets
app.get('/api/admin/orders/export-google-sheets-csv', async (req, res) => {
  try {
    const orders = await Database.getOrders();
    const csv = generateOrdersGoogleSheetsCsv(orders);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dzprint-google-sheets-orders.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. CRM / CUSTOMER MANAGEMENT ENDPOINTS
// ==========================================
app.get('/api/admin/customers', requireAdminAuth, async (req, res) => {
  try {
    const customers = await Database.getCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/customers/:id', requireAdminAuth, async (req, res) => {
  try {
    const customer = await Database.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'الزبون غير موجود' });
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/customers', requireAdminAuth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.full_name || !body.phone) {
      return res.status(400).json({ error: 'اسم الزبون ورقم الهاتف إلزاميان' });
    }
    const customer = {
      id: body.id || `cust-${Date.now()}`,
      full_name: body.full_name,
      phone: body.phone,
      email: body.email || '',
      wilaya_id: Number(body.wilaya_id) || 16,
      wilaya_name: body.wilaya_name || 'الجزائر العاصمة',
      address: body.address || '',
      notes: body.notes || '',
      tags: body.tags || ['New'],
      total_orders: Number(body.total_orders) || 0,
      total_spent: Number(body.total_spent) || 0,
      last_order_date: body.last_order_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    const saved = await Database.saveCustomer(customer);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/customers/:id', requireAdminAuth, async (req, res) => {
  try {
    const updated = await Database.updateCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'الزبون غير موجود' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/customers/export/csv', requireAdminAuth, async (req, res) => {
  try {
    const customers = await Database.getCustomers();
    const headers = ['المعرف', 'الاسم الكامل', 'رقم الهاتف', 'البريد', 'الولاية', 'العنوان', 'عدد الطلبات', 'إجمالي الإنفاق (دج)', 'التصنيفات', 'ملاحظات'];
    const rows = customers.map(c => [
      c.id,
      `"${c.full_name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.wilaya_name}"`,
      `"${c.address || ''}"`,
      c.total_orders,
      c.total_spent,
      `"${(c.tags || []).join(', ')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dzprint-customers.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. INVENTORY & SUPPLIES ENDPOINTS
// ==========================================
app.get('/api/admin/inventory', requireAdminAuth, async (req, res) => {
  try {
    const items = await Database.getInventoryItems();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/inventory', requireAdminAuth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.category) {
      return res.status(400).json({ error: 'اسم المادة وقسم المخزون مطلوبان' });
    }
    const item = {
      id: body.id || `inv-${Date.now()}`,
      name: body.name,
      name_ar: body.name_ar || body.name,
      category: body.category,
      type: body.type || '',
      color: body.color || '',
      size: body.size || '',
      current_stock: Number(body.current_stock) || 0,
      min_threshold: Number(body.min_threshold) || 10,
      unit: body.unit || 'قطعة',
      cost_per_unit: Number(body.cost_per_unit) || 0,
      supplier_id: body.supplier_id || '',
      supplier_name: body.supplier_name || '',
      location_in_workshop: body.location_in_workshop || 'الورشة العامة',
      sku: body.sku || `SKU-${Date.now().toString().slice(-6)}`,
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = await Database.saveInventoryItem(item);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/inventory/:id', requireAdminAuth, async (req, res) => {
  try {
    const existing = await Database.getInventoryItemById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'المادة غير موجودة' });
    const updated = { ...existing, ...req.body, updated_at: new Date().toISOString() };
    const saved = await Database.saveInventoryItem(updated);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/inventory/:id', requireAdminAuth, async (req, res) => {
  try {
    const ok = await Database.deleteInventoryItem(req.params.id);
    if (!ok) return res.status(404).json({ error: 'فشل حذف المادة' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/inventory/movement', requireAdminAuth, async (req, res) => {
  try {
    const { item_id, change_qty, type, reason, operator } = req.body;
    if (!item_id || change_qty === undefined || !type) {
      return res.status(400).json({ error: 'معرف المادة، الكمية ونوع الحركة حقول إلزامية' });
    }
    const result = await Database.adjustStock(item_id, Number(change_qty), type, reason, operator);
    if (!result) return res.status(404).json({ error: 'المادة غير موجودة في المخزون' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/inventory/movements', requireAdminAuth, async (req, res) => {
  try {
    const movements = await Database.getStockMovements();
    res.json(movements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suppliers
app.get('/api/admin/suppliers', requireAdminAuth, async (req, res) => {
  try {
    const suppliers = await Database.getSuppliers();
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/suppliers', requireAdminAuth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.phone) {
      return res.status(400).json({ error: 'اسم المورد ورقم الهاتف مطلوبان' });
    }
    const supplier = {
      id: body.id || `sup-${Date.now()}`,
      name: body.name,
      contact_person: body.contact_person || '',
      phone: body.phone,
      email: body.email || '',
      wilaya: body.wilaya || '',
      address: body.address || '',
      supplied_materials: body.supplied_materials || [],
      notes: body.notes || '',
      active: body.active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = await Database.saveSupplier(supplier);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/suppliers/:id', requireAdminAuth, async (req, res) => {
  try {
    const ok = await Database.deleteSupplier(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PRODUCTION WORKSHOP & KANBAN ENDPOINTS
// ==========================================
app.get('/api/admin/production/jobs', requireAdminAuth, async (req, res) => {
  try {
    const jobs = await Database.getProductionJobs();
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/production/jobs', requireAdminAuth, async (req, res) => {
  try {
    const body = req.body;
    const job = {
      id: body.id || `job-${Date.now()}`,
      order_id: body.order_id || '',
      order_number: body.order_number || `DZ-MANUAL-${Date.now().toString().slice(-4)}`,
      customer_name: body.customer_name || 'زبون الورشة',
      customer_phone: body.customer_phone || '',
      stage: body.stage || 'received',
      priority: body.priority || 'normal',
      technique: body.technique || 'DTF',
      assigned_technician: body.assigned_technician || '',
      items_summary: body.items_summary || '',
      target_date: body.target_date || '',
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = await Database.createProductionJob(job);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/production/jobs/:id/stage', requireAdminAuth, async (req, res) => {
  try {
    const { stage, technician, notes } = req.body;
    if (!stage) return res.status(400).json({ error: 'مرحلة الإنتاج مطلوبة' });
    const updated = await Database.updateProductionJobStage(req.params.id, stage, technician, notes);
    if (!updated) return res.status(404).json({ error: 'مهمة الطباعة غير موجودة' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. INVOICES & QUOTATIONS (Factures & Devis)
// ==========================================
app.get('/api/admin/invoices', requireAdminAuth, async (req, res) => {
  try {
    const invoices = await Database.getInvoices();
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/invoices/:id', requireAdminAuth, async (req, res) => {
  try {
    const invoice = await Database.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'الوثيقة غير موجودة' });
    res.json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/invoices', requireAdminAuth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.client_name || !body.items || body.items.length === 0) {
      return res.status(400).json({ error: 'اسم العميل وبنود الفاتورة مطلوبة' });
    }

    const items = body.items.map((it: any, i: number) => ({
      id: it.id || `it-${i + 1}`,
      description: it.description,
      details: it.details || '',
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price) || 0,
      total: (Number(it.quantity) || 1) * (Number(it.unit_price) || 0),
    }));

    const subtotal = items.reduce((sum: number, it: any) => sum + it.total, 0);
    const discount = Number(body.discount) || 0;
    const taxRate = Number(body.tax_rate) || 0;
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const stampDuty = Number(body.stamp_duty) || 0;
    const total = Math.max(0, subtotal - discount + taxAmount + stampDuty);

    const year = new Date().getFullYear();
    const prefix = body.type === 'quote' ? 'DEV' : 'FACT';
    const seq = Math.floor(100 + Math.random() * 900);

    const invoice = {
      id: body.id || `inv-${Date.now()}`,
      invoice_number: body.invoice_number || `${prefix}-${year}-${seq}`,
      type: body.type || 'quote',
      order_id: body.order_id || undefined,
      client_name: body.client_name,
      client_company: body.client_company || '',
      client_phone: body.client_phone || '',
      client_email: body.client_email || '',
      client_address: body.client_address || '',
      client_wilaya: body.client_wilaya || '',
      client_nif: body.client_nif || '',
      client_nis: body.client_nis || '',
      client_rc: body.client_rc || '',
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      stamp_duty: stampDuty,
      discount,
      total,
      status: body.status || 'draft',
      payment_method: body.payment_method || 'cod',
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await Database.saveInvoice(invoice);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/invoices/:id', requireAdminAuth, async (req, res) => {
  try {
    const existing = await Database.getInvoiceById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'الوثيقة غير موجودة' });
    const updated = { ...existing, ...req.body, updated_at: new Date().toISOString() };
    const saved = await Database.saveInvoice(updated);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/invoices/:id', requireAdminAuth, async (req, res) => {
  try {
    const ok = await Database.deleteInvoice(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/invoices/from-order/:orderId', requireAdminAuth, async (req, res) => {
  try {
    const invoice = await Database.generateInvoiceFromOrder(req.params.orderId);
    if (!invoice) return res.status(404).json({ error: 'الطلب غير موجود لإنشاء فاتورة' });
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VERCEL & SERVER STARTUP
// ==========================================
export default app;

async function startServer() {
  await Database.init();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DzPrint Server running on http://0.0.0.0:${PORT}`);
  });
}

// Start standalone server unless running in a serverless environment like Vercel
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}
