import {
  Wilaya,
  DeliveryAgency,
  DeliveryRate,
  Product,
  Design,
  Order,
  Coupon,
  SiteSettings,
  HomepageCMS,
  OrderStatus,
  Customer,
  InventoryItem,
  StockMovement,
  Supplier,
  ProductionJob,
  ProductionStage,
  Invoice,
} from '../src/types';
import { getServerSupabase, isServerSupabaseConfigured } from './supabase';

// 58 Algerian Wilayas official list
export const INITIAL_WILAYAS: Wilaya[] = [
  { id: 1, code: '01', name_ar: 'أدرار', name_fr: 'Adrar', name_en: 'Adrar', active: true },
  { id: 2, code: '02', name_ar: 'الشلف', name_fr: 'Chlef', name_en: 'Chlef', active: true },
  { id: 3, code: '03', name_ar: 'الأغواط', name_fr: 'Laghouat', name_en: 'Laghouat', active: true },
  { id: 4, code: '04', name_ar: 'أم البواقي', name_fr: 'Oum El Bouaghi', name_en: 'Oum El Bouaghi', active: true },
  { id: 5, code: '05', name_ar: 'باتنة', name_fr: 'Batna', name_en: 'Batna', active: true },
  { id: 6, code: '06', name_ar: 'بجاية', name_fr: 'Béjaïa', name_en: 'Bejaia', active: true },
  { id: 7, code: '07', name_ar: 'بسكرة', name_fr: 'Biskra', name_en: 'Biskra', active: true },
  { id: 8, code: '08', name_ar: 'بشار', name_fr: 'Béchar', name_en: 'Bechar', active: true },
  { id: 9, code: '09', name_ar: 'البليدة', name_fr: 'Blida', name_en: 'Blida', active: true },
  { id: 10, code: '10', name_ar: 'البويرة', name_fr: 'Bouira', name_en: 'Bouira', active: true },
  { id: 11, code: '11', name_ar: 'تمنراست', name_fr: 'Tamanrasset', name_en: 'Tamanrasset', active: true },
  { id: 12, code: '12', name_ar: 'تبسة', name_fr: 'Tébessa', name_en: 'Tebessa', active: true },
  { id: 13, code: '13', name_ar: 'تلمسان', name_fr: 'Tlemcen', name_en: 'Tlemcen', active: true },
  { id: 14, code: '14', name_ar: 'تيارت', name_fr: 'Tiaret', name_en: 'Tiaret', active: true },
  { id: 15, code: '15', name_ar: 'تيزي وزو', name_fr: 'Tizi Ouzou', name_en: 'Tizi Ouzou', active: true },
  { id: 16, code: '16', name_ar: 'الجزائر', name_fr: 'Alger', name_en: 'Algiers', active: true },
  { id: 17, code: '17', name_ar: 'الجلفة', name_fr: 'Djelfa', name_en: 'Djelfa', active: true },
  { id: 18, code: '18', name_ar: 'جيجل', name_fr: 'Jijel', name_en: 'Jijel', active: true },
  { id: 19, code: '19', name_ar: 'سطيف', name_fr: 'Sétif', name_en: 'Setif', active: true },
  { id: 20, code: '20', name_ar: 'سعيدة', name_fr: 'Saïda', name_en: 'Saida', active: true },
  { id: 21, code: '21', name_ar: 'سكيكدة', name_fr: 'Skikda', name_en: 'Skikda', active: true },
  { id: 22, code: '22', name_ar: 'سيدي بلعباس', name_fr: 'Sidi Bel Abbès', name_en: 'Sidi Bel Abbes', active: true },
  { id: 23, code: '23', name_ar: 'عنابة', name_fr: 'Annaba', name_en: 'Annaba', active: true },
  { id: 24, code: '24', name_ar: 'قالمة', name_fr: 'Guelma', name_en: 'Guelma', active: true },
  { id: 25, code: '25', name_ar: 'قسنطينة', name_fr: 'Constantine', name_en: 'Constantine', active: true },
  { id: 26, code: '26', name_ar: 'المدية', name_fr: 'Médéa', name_en: 'Medea', active: true },
  { id: 27, code: '27', name_ar: 'مستغانم', name_fr: 'Mostaganem', name_en: 'Mostaganem', active: true },
  { id: 28, code: '28', name_ar: 'المسيلة', name_fr: "M'Sila", name_en: "M'Sila", active: true },
  { id: 29, code: '29', name_ar: 'معسكر', name_fr: 'Mascara', name_en: 'Mascara', active: true },
  { id: 30, code: '30', name_ar: 'ورقلة', name_fr: 'Ouargla', name_en: 'Ouargla', active: true },
  { id: 31, code: '31', name_ar: 'وهران', name_fr: 'Oran', name_en: 'Oran', active: true },
  { id: 32, code: '32', name_ar: 'البيض', name_fr: 'El Bayadh', name_en: 'El Bayadh', active: true },
  { id: 33, code: '33', name_ar: 'إليزي', name_fr: 'Illizi', name_en: 'Illizi', active: true },
  { id: 34, code: '34', name_ar: 'برج بوعريريج', name_fr: 'Bordj Bou Arréridj', name_en: 'Bordj Bou Arreridj', active: true },
  { id: 35, code: '35', name_ar: 'بومرداس', name_fr: 'Boumerdès', name_en: 'Boumerdes', active: true },
  { id: 36, code: '36', name_ar: 'الطارف', name_fr: 'El Tarf', name_en: 'El Tarf', active: true },
  { id: 37, code: '37', name_ar: 'تندوف', name_fr: 'Tindouf', name_en: 'Tindouf', active: true },
  { id: 38, code: '38', name_ar: 'تيسمسيلت', name_fr: 'Tissemsilt', name_en: 'Tissemsilt', active: true },
  { id: 39, code: '39', name_ar: 'الوادي', name_fr: 'El Oued', name_en: 'El Oued', active: true },
  { id: 40, code: '40', name_ar: 'خنشلة', name_fr: 'Khenchela', name_en: 'Khenchela', active: true },
  { id: 41, code: '41', name_ar: 'سوق أهراس', name_fr: 'Souk Ahras', name_en: 'Souk Ahras', active: true },
  { id: 42, code: '42', name_ar: 'تيبازة', name_fr: 'Tipaza', name_en: 'Tipaza', active: true },
  { id: 43, code: '43', name_ar: 'ميلة', name_fr: 'Mila', name_en: 'Mila', active: true },
  { id: 44, code: '44', name_ar: 'عين الدفلى', name_fr: 'Aïn Defla', name_en: 'Ain Defla', active: true },
  { id: 45, code: '45', name_ar: 'النعامة', name_fr: 'Naâma', name_en: 'Naama', active: true },
  { id: 46, code: '46', name_ar: 'عين تموشنت', name_fr: 'Aïn Témouchent', name_en: 'Ain Temouchent', active: true },
  { id: 47, code: '47', name_ar: 'غرداية', name_fr: 'Ghardaïa', name_en: 'Ghardaia', active: true },
  { id: 48, code: '48', name_ar: 'غليزان', name_fr: 'Relizane', name_en: 'Relizane', active: true },
  { id: 49, code: '49', name_ar: 'تيميمون', name_fr: 'Timimoun', name_en: 'Timimoun', active: true },
  { id: 50, code: '50', name_ar: 'برج باجي مختار', name_fr: 'Bordj Badji Mokhtar', name_en: 'Bordj Badji Mokhtar', active: true },
  { id: 51, code: '51', name_ar: 'أولاد جلال', name_fr: 'Ouled Djellal', name_en: 'Ouled Djellal', active: true },
  { id: 52, code: '52', name_ar: 'بني عباس', name_fr: 'Béni Abbès', name_en: 'Beni Abbes', active: true },
  { id: 53, code: '53', name_ar: 'عين صالح', name_fr: 'In Salah', name_en: 'In Salah', active: true },
  { id: 54, code: '54', name_ar: 'عين قزام', name_fr: 'In Guezzam', name_en: 'In Guezzam', active: true },
  { id: 55, code: '55', name_ar: 'تقرت', name_fr: 'Touggourt', name_en: 'Touggourt', active: true },
  { id: 56, code: '56', name_ar: 'جانت', name_fr: 'Djanet', name_en: 'Djanet', active: true },
  { id: 57, code: '57', name_ar: 'المغير', name_fr: "El M'Ghair", name_en: "El M'Ghair", active: true },
  { id: 58, code: '58', name_ar: 'المنيعة', name_fr: 'El Meniaa', name_en: 'El Meniaa', active: true },
];

export const INITIAL_AGENCIES: DeliveryAgency[] = [
  {
    id: 'yalidine',
    name: 'Yalidine Express',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80',
    phone: '0982 40 40 40',
    website: 'https://yalidine.app',
    notes: 'شبكة توصيل سريعة تغطي 58 ولاية مع مكاتب استلام بكل الدوائر',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'procolis',
    name: 'Procolis Delivery',
    logo_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=120&auto=format&fit=crop&q=80',
    phone: '0560 99 88 77',
    website: 'https://procolis.dz',
    notes: 'توصيل منزلي سريع ومضمون مع تسليم مباشر',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'maystro',
    name: 'Maystro Delivery',
    logo_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=120&auto=format&fit=crop&q=80',
    phone: '0770 12 34 56',
    website: 'https://maystro-delivery.com',
    notes: 'أسعار اقتصادية وتتبع شحنات فوري للمكتب والمنزل',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export function generateInitialRates(): DeliveryRate[] {
  const rates: DeliveryRate[] = [];

  for (const agency of INITIAL_AGENCIES) {
    for (const wilaya of INITIAL_WILAYAS) {
      let homePrice = 750;
      let officePrice = 500;
      let eta = '2-4 أيام';

      if (wilaya.id === 16) {
        if (agency.id === 'yalidine') {
          homePrice = 600;
          officePrice = 400;
          eta = '24-48 ساعة';
        } else if (agency.id === 'procolis') {
          homePrice = 650;
          officePrice = 400;
          eta = '24-48 ساعة';
        } else {
          homePrice = 550;
          officePrice = 350;
          eta = '24-48 ساعة';
        }
      } else if (wilaya.id === 2) {
        // Chlef (as explicitly given in prompt: Yalidine Home: 700 / Office: 500)
        if (agency.id === 'yalidine') {
          homePrice = 700;
          officePrice = 500;
          eta = '2-3 أيام';
        } else if (agency.id === 'procolis') {
          homePrice = 800;
          officePrice = 550;
          eta = '2-3 أيام';
        } else {
          homePrice = 750;
          officePrice = 500;
          eta = '3-4 أيام';
        }
      } else if ([9, 35, 42].includes(wilaya.id)) {
        homePrice = agency.id === 'yalidine' ? 650 : agency.id === 'procolis' ? 700 : 600;
        officePrice = 450;
        eta = '1-2 أيام';
      } else if ([31, 25, 19, 23].includes(wilaya.id)) {
        homePrice = agency.id === 'yalidine' ? 700 : agency.id === 'procolis' ? 750 : 650;
        officePrice = 450;
        eta = '2-3 أيام';
      } else if ([11, 33, 37, 50, 53, 54, 56].includes(wilaya.id)) {
        homePrice = agency.id === 'yalidine' ? 1200 : agency.id === 'procolis' ? 1350 : 1100;
        officePrice = 900;
        eta = '4-7 أيام';
      } else if (wilaya.id >= 47) {
        homePrice = agency.id === 'yalidine' ? 950 : agency.id === 'procolis' ? 1000 : 900;
        officePrice = 700;
        eta = '3-5 أيام';
      }

      rates.push({
        id: `rate_${agency.id}_${wilaya.id}`,
        agency_id: agency.id,
        wilaya_id: wilaya.id,
        home_price: homePrice,
        office_price: officePrice,
        estimated_days: eta,
        active: true,
        notes: `توصيل رسمي عبر ${agency.name}`,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      });
    }
  }
  return rates;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-tshirt-custom',
    name: 'تيشيرت قطن بريميوم مخصص',
    name_ar: 'تيشيرت قطن بريميوم مخصص',
    name_fr: 'T-Shirt Coton Premium Personnalisé',
    slug: 'custom-cotton-tshirt',
    description: 'تيشيرت قطني 100% عالي الجودة وزن 240 غرام. قماش فخم ناعم الملمس متين ومقاوم للغسيل مع طباعة DTF حرارية فائقة الدقة.',
    description_ar: 'تيشيرت قطني 100% عالي الجودة وزن 240 غرام. قماش فخم ناعم الملمس متين ومقاوم للغسيل مع طباعة DTF حرارية فائقة الدقة.',
    description_fr: 'T-shirt 100% coton peigné 240g. Confort exceptionnel, coupe moderne et impression haute définition résistante aux lavages.',
    category: 't-shirts',
    sku: 'TSH-CUST-01',
    base_price: 1800,
    sale_price: 1600,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    ],
    mockup_template_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    colors: [
      { name: 'أسود الملكي', hex: '#111827' },
      { name: 'أبيض ناصع', hex: '#f9fafb' },
      { name: 'كحلي داكن', hex: '#1e3a8a' },
      { name: 'أخضر زيتي', hex: '#14532d' },
      { name: 'عنابي فاخر', hex: '#881337' },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    features: [
      'قطن مصري ممشط 100% وزن 240 غرام',
      'طباعة DTF رقمية بألوان حية ومقاومة للغسيل',
      'قصة عصرية مريحة تناسب الجنسين',
    ],
    is_featured: true,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-hoodie-heavyweight',
    name: 'هودي شتوي مبطن فاخر',
    name_ar: 'هودي شتوي مبطن فاخر',
    name_fr: 'Hoodie Hiver Premium Molletonné',
    slug: 'heavyweight-custom-hoodie',
    description: 'هودي شتوي دافئ وسميك وزن 380 غرام مع بطانة صوفية فائقة النعومة، جيب أمامي متسع وغطاء رأس مزدوج.',
    description_ar: 'هودي شتوي دافئ وسميك وزن 380 غرام مع بطانة صوفية فائقة النعومة، جيب أمامي متسع وغطاء رأس مزدوج.',
    description_fr: 'Hoodie chaud molletonné 380g avec capuche doublée et poche kangourou spacieuse.',
    category: 'hoodies',
    sku: 'HOD-HEAV-01',
    base_price: 3600,
    sale_price: 3200,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    ],
    mockup_template_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    colors: [
      { name: 'أسود كربوني', hex: '#0f172a' },
      { name: 'رمادي ميلانج', hex: '#64748b' },
      { name: 'أزرق بترولي', hex: '#0c4a6e' },
      { name: 'بيج رملي', hex: '#d6c7a1' },
    ],
    sizes: ['M', 'L', 'XL', '2XL', '3XL'],
    features: [
      'خامة صوفية داخلية سميكة 380 GSM دافئة جداً',
      'رباط رأس معدني متين',
      'طباعة تطريز أو حرارية تدوم لسنوات',
    ],
    is_featured: true,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-ceramic-mug',
    name: 'كوب خزفي سحري مخصص',
    name_ar: 'كوب خزفي سحري مخصص',
    name_fr: 'Mug Céramique Magique Personnalisé',
    slug: 'custom-ceramic-mug',
    description: 'كوب خزفي سحري يتغير لونه ليكشف عن تصميمك الرائع وصورتك المفضلة فور صب المشروبات الساخنة فيه.',
    description_ar: 'كوب خزفي سحري يتغير لونه ليكشف عن تصميمك الرائع وصورتك المفضلة فور صب المشروبات الساخنة فيه.',
    description_fr: 'Mug magique en céramique haute brillance. Révèle votre photo ou design personnalisé au contact de la chaleur.',
    category: 'mugs',
    sku: 'MUG-MAG-01',
    base_price: 1100,
    sale_price: 950,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    ],
    mockup_template_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    colors: [
      { name: 'أسود كاشف للحرارة', hex: '#18181b' },
      { name: 'أبيض ناصع', hex: '#ffffff' },
    ],
    sizes: ['330ml (11 oz)'],
    features: [
      'طباعة تسامي حراري Sublimation 360 درجة',
      'آمن للاستخدام في الميكروويف وغسالة الصحون',
      'علبة هدايا كرتونية فاخرة متضمنة مجاناً',
    ],
    is_featured: false,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-canvas-totebag',
    name: 'حقيبة قماشية توت باق إيكو',
    name_ar: 'حقيبة قماشية توت باق إيكو',
    name_fr: 'Tote Bag Toile Coton Bio',
    slug: 'eco-canvas-totebag',
    description: 'حقيبة تسوق قماشية صديقة للبيئة مصنوعة من كانفاس قطني سميك وقوي، ممتازة للجامعة والعمل والنشاطات اليومية.',
    description_ar: 'حقيبة تسوق قماشية صديقة للبيئة مصنوعة من كانفاس قطني سميك وقوي، ممتازة للجامعة والعمل والنشاطات اليومية.',
    description_fr: 'Tote bag écoresponsable en toile de coton épais renforcé. Pratique et durable pour le quotidien.',
    category: 'totebags',
    sku: 'TOT-ECO-01',
    base_price: 900,
    sale_price: 750,
    images: [
      'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&auto=format&fit=crop&q=80',
    ],
    mockup_template_url: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&auto=format&fit=crop&q=80',
    colors: [
      { name: 'أوف وايت طبيعي', hex: '#fef3c7' },
      { name: 'أسود فحمي', hex: '#18181b' },
    ],
    sizes: ['38x42 cm'],
    features: [
      'كانفاس قطني متين 100%',
      'مقابض مقواة مزدوجة تتحمل حتى 15 كغ',
      'طباعة عالية الجودة غير قابلة للتقشر',
    ],
    is_featured: false,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-embroidered-cap',
    name: 'كاب بيسبول قطني مطرز',
    name_ar: 'كاب بيسبول قطني مطرز',
    name_fr: 'Casquette Baseball Coton Brodé',
    slug: 'custom-baseball-cap',
    description: 'كاب رياضي أنيق بـ 6 ألواح من القطن الممشط الفاخر مع شريط إغلاق خلفي قابل للتعديل وتطريز ثلاثي الأبعاد أو طباعة.',
    description_ar: 'كاب رياضي أنيق بـ 6 ألواح من القطن الممشط الفاخر مع شريط إغلاق خلفي قابل للتعديل وتطريز ثلاثي الأبعاد أو طباعة.',
    description_fr: 'Casquette de baseball en coton brossé avec boucle métallique réglable et broderie/impression soignée.',
    category: 'caps',
    sku: 'CAP-BASE-01',
    base_price: 1400,
    sale_price: 1250,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    ],
    mockup_template_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    colors: [
      { name: 'أسود كلاسيكي', hex: '#111827' },
      { name: 'أبيض', hex: '#ffffff' },
      { name: 'أحمر رياضي', hex: '#dc2626' },
      { name: 'أزرق ملكي', hex: '#2563eb' },
    ],
    sizes: ['مقاس موحد قابل للتعديل'],
    features: [
      'قطن 100% ثقيل مع فتحات تهوية مطرزة',
      'شريط معدني عالي الجودة لضبط القياس',
      'حافة منحنية متينة تحافظ على شكلها',
    ],
    is_featured: false,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_DESIGNS: Design[] = [
  {
    id: 'des-algeria-calligraphy',
    name: 'الجزائر بخط الثلث الحر',
    name_ar: 'الجزائر بخط الثلث الحر',
    slug: 'algeria-thuluth-calligraphy',
    category: 'calligraphy',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    author: 'خطاط الجزائري',
    tags: ['خط عربي', 'الجزائر', 'ثلث', 'تراث'],
    compatible_products: ['t-shirts', 'hoodies', 'totebags', 'mugs'],
    is_trending: true,
    downloads_count: 342,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'des-fennec-warrior',
    name: 'ثعلب الصحراء الفنك الفولكلوري',
    name_ar: 'ثعلب الصحراء الفنك الفولكلوري',
    slug: 'fennec-sahara-warrior',
    category: 'folklore',
    image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    author: 'ستوديو ديزاد',
    tags: ['فنك', 'صحراء', 'المنتخب الوطني', '123 فيفا لالجيري'],
    compatible_products: ['t-shirts', 'hoodies', 'caps'],
    is_trending: true,
    downloads_count: 518,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'des-casbah-retro',
    name: 'أزقة القصبة العتيقة ريترو',
    name_ar: 'أزقة القصبة العتيقة ريترو',
    slug: 'casbah-algiers-retro',
    category: 'heritage',
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    author: 'فنان القصبة',
    tags: ['القصبة', 'الجزائر العاصمة', 'تراث أصيل', 'فينتاج'],
    compatible_products: ['t-shirts', 'totebags', 'mugs'],
    is_trending: false,
    downloads_count: 210,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'des-tifinagh-amazigh',
    name: 'الحرية - ياز بالأمازيغية والخط الإفريقي',
    name_ar: 'الحرية - ياز بالأمازيغية والخط الإفريقي',
    slug: 'tifinagh-yaz-freedom',
    category: 'heritage',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    author: 'هوية جزائرية',
    tags: ['أمازيغ', 'تيفيناغ', 'حرية', 'هوية'],
    compatible_products: ['t-shirts', 'hoodies', 'caps'],
    is_trending: true,
    downloads_count: 460,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'des-tassili-cave-art',
    name: 'رسوم طاسيلي ناجر الصخرية الغامضة',
    name_ar: 'رسوم طاسيلي ناجر الصخرية الغامضة',
    slug: 'tassili-cave-rock-art',
    category: 'history',
    image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80',
    author: 'طاسيلي ديزاين',
    tags: ['طاسيلي', 'تاريخ قديم', 'الجنوب الكبير', 'سياحة'],
    compatible_products: ['t-shirts', 'hoodies', 'mugs', 'totebags'],
    is_trending: false,
    downloads_count: 185,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup_dzprint10',
    code: 'DZPRINT10',
    type: 'percentage',
    value: 10,
    min_order: 2000,
    max_discount: 1000,
    usage_limit: 500,
    times_used: 34,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'coup_algeria2026',
    code: 'ALGERIA2026',
    type: 'fixed',
    value: 500,
    min_order: 4000,
    max_discount: 500,
    usage_limit: 200,
    times_used: 12,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'coup_freedelivery',
    code: 'FREEWILAYA',
    type: 'percentage',
    value: 15,
    min_order: 5000,
    max_discount: 1500,
    usage_limit: 100,
    times_used: 7,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_SETTINGS: SiteSettings = {
  business_name: 'DZPrint Custom Printing',
  business_name_ar: 'ديزاد برينت للطباعة المخصصة',
  store_name: 'ديزاد برينت | DZPrint',
  store_description: 'Custom printing platform for apparel and merchandise in Algeria with 58-Wilaya delivery',
  store_description_ar: 'المنصة الجزائرية الأولى في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل لـ 58 ولاية',
  logo_url: '',
  favicon_url: '',
  phone: '0550 12 34 56',
  whatsapp: '+213550123456',
  whatsapp_phone: '0550123456',
  order_number_prefix: 'DZP',
  email: 'contact@dzprint.dz',
  address: 'الجزائر العاصمة، بئر مراد رايس / ورشة الطباعة بالبليدة',
  working_hours: 'السبت - الخميس: 09:00 - 18:00',
  facebook: 'https://facebook.com/dzprint',
  facebook_url: 'https://facebook.com/dzprint',
  instagram: 'https://instagram.com/dzprint',
  instagram_url: 'https://instagram.com/dzprint',
  tiktok: 'https://tiktok.com/@dzprint',
  tiktok_url: 'https://tiktok.com/@dzprint',
  youtube_url: '',
  telegram_url: 'https://t.me/dzprint',
  currency: 'د.ج',
  order_prefix: 'DZP',
  free_delivery_threshold: 12000,
  email_notifications_enabled: true,

  // Meta Pixel
  meta_pixel_id: '',
  meta_pixel_enabled: false,

  // Google Sheet Integration
  google_sheet_url: '',
  google_sheet_webhook_url: '',
  google_sheet_sync_enabled: true,

  // Main Page Text, Font & Color Customization
  hero_headline: 'اطبع أفكارك وتصاميمك على أجود التيشرتات والهوديز',
  hero_headline_highlight: 'أجود التيشرتات والهوديز',
  hero_headline_color: '#111827',
  hero_headline_font: 'Cairo',
  hero_subheadline: 'اختر نوع القماش، ارفع صورتك أو شعارك الخاص، عاين النتيجة مباشرة عبر استوديو التخصيص ثلاثي الأبعاد، واستلم طردك عند باب المنزل أو أقرب مكتب في ولايتك والدفع عند الاستلام.',
  hero_subheadline_color: '#4b5563',
  hero_badge_text: 'أحدث تقنيات الطباعة الرقمية المباشرة (Direct-to-Film DTF) في الجزائر',
  hero_badge_color: '#f59e0b',
  hero_start_btn_text: 'ابدأ التصميم والطباعة الآن',
  hero_catalog_btn_text: 'تصفح المنتجات الجاهزة',
};

export const INITIAL_CMS: HomepageCMS = {
  hero_headline_ar: 'اصنع أسلوبك الخاص بأعلى معايير الطباعة في الجزائر',
  hero_headline_fr: 'Créez votre style avec la meilleure impression en Algérie',
  hero_headline_en: 'Create your unique style with premium custom printing in Algeria',
  hero_subheadline_ar: 'صمم تيشيرتك، هودي، أو كوبك الخاص واطلب شحنك الفوري لـ 58 ولاية مع خيارات توصيل منزلية والدفع عند الاستلام.',
  hero_subheadline_fr: 'Personnalisez vos t-shirts, hoodies ou mugs avec livraison 58 wilayas et paiement à la livraison.',
  hero_subheadline_en: 'Custom t-shirts, hoodies, and mugs delivered to all 58 Algerian wilayas with Cash on Delivery.',
  trust_badges: [
    { title_ar: 'توصيل 58 ولاية', title_fr: 'Livraison 58 Wilayas', title_en: '58 Wilayas Delivery', icon: 'truck' },
    { title_ar: 'دفع عند الاستلام', title_fr: 'Paiement à la livraison', title_en: 'Cash on Delivery', icon: 'shield' },
    { title_ar: 'قطن بريميوم 100%', title_fr: '100% Coton Premium', title_en: '100% Premium Cotton', icon: 'sparkles' },
    { title_ar: 'طباعة حرارية DTF', title_fr: 'Impression DTF Haute Définition', title_en: 'HD DTF Printing', icon: 'printer' },
  ],
  faqs: [
    {
      question_ar: 'كيف تتم عملية الطلب والتأكيد؟',
      question_fr: 'Comment passer et confirmer une commande ?',
      question_en: 'How to order and confirm?',
      answer_ar: 'بعد اختيار المنتج والتصميم، قم بإدخال معلومات التوصيل، وسيقوم فريقنا بالاتصال بك هاتفياً لتأكيد المقاسات وتفاصيل الشحن قبل الطباعة.',
      answer_fr: 'Après votre commande, notre équipe vous contacte par téléphone pour valider la taille et les détails de livraison.',
      answer_en: 'After ordering, our team calls you to confirm sizes and shipping details before printing.',
    },
    {
      question_ar: 'ما هي مدة التوصيل؟',
      question_fr: 'Quel est le délai de livraison ?',
      question_en: 'What is the delivery time?',
      answer_ar: 'تستغرق الطباعة والتجهيز 24-48 ساعة، والتوصيل من 1 إلى 4 أيام عمل حسب ولايتك.',
      answer_fr: 'La confection prend 24-48h et la livraison 1 à 4 jours selon votre wilaya.',
      answer_en: 'Production takes 24-48h and delivery 1-4 business days depending on your wilaya.',
    },
  ],
  testimonials: [
    {
      author: 'كريم بلعربي',
      city: 'وهران',
      rating: 5,
      text_ar: 'جودة التيشيرت ممتازة جداً وثبات الألوان رائع حتى بعد عدة غسلات. التوصيل كان سريعاً في يومين.',
      text_fr: 'Très bonne qualité de t-shirt et impression résistante. Livraison rapide.',
      text_en: 'Excellent t-shirt quality and crisp printing. Arrived within 2 days.',
    },
  ],
};

// ============================================================
// INITIAL SEED DATA FOR CRM, INVENTORY, PRODUCTION & INVOICES
// ============================================================

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    full_name: 'ياسين بلعربي',
    phone: '0550123456',
    email: 'yacine.belarbi@gmail.com',
    wilaya_id: 16,
    wilaya_name: '16 - الجزائر (Alger)',
    address: 'حي ديار المحصول، المدنية، الجزائر العاصمة',
    notes: 'زبون دائم، يفضل جودة الطباعة DTF على التيشرتات السوداء',
    tags: ['VIP', 'Regular'],
    total_orders: 5,
    total_spent: 14800,
    last_order_date: '2026-03-02T14:30:00.000Z',
    created_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'cust-2',
    full_name: 'أمينة خليفي',
    phone: '0661987654',
    email: 'amina.khelifi@yahoo.fr',
    wilaya_id: 31,
    wilaya_name: '31 - وهران (Oran)',
    address: 'نهج جيش التحرير الوطني، حي الصباح، وهران',
    notes: 'طلبت هوديز مخصصة لمجموعة تخرج جامعي',
    tags: ['B2B', 'Regular'],
    total_orders: 3,
    total_spent: 28500,
    last_order_date: '2026-03-08T11:15:00.000Z',
    created_at: '2026-01-22T12:00:00.000Z',
  },
  {
    id: 'cust-3',
    full_name: 'محمد طارق بن عيسى',
    phone: '0770334455',
    email: 'tarek.tech@gmail.com',
    wilaya_id: 25,
    wilaya_name: '25 - قسنطينة (Constantine)',
    address: 'المدينة الجديدة علي منجلي، قسنطينة',
    notes: 'مهتم بتصاميم الخط العربي والأكواب السحرية',
    tags: ['New'],
    total_orders: 1,
    total_spent: 3200,
    last_order_date: '2026-03-11T16:45:00.000Z',
    created_at: '2026-03-11T16:45:00.000Z',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-texprint',
    name: 'SARL TexPrint Algérie',
    contact_person: 'السيد عبد الرزاق قادري',
    phone: '024 81 22 33',
    email: 'commercial@texprint-dz.com',
    wilaya: 'Boumerdès',
    address: 'المنطقة الصناعية خميس الخشنة، بومرداس',
    supplied_materials: ['تيشيرتات قطنية خام 240g', 'هوديز صوفية 380g', 'كابات بيسبول'],
    notes: 'مورد معتمد للقطن المصري الممشط، توصيل أسبوعي للورشة',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sup-dtfmaghreb',
    name: 'DTF Solutions Maghreb',
    contact_person: 'المهندس كريم زيتوني',
    phone: '0555 40 50 60',
    email: 'contact@dtfmaghreb.dz',
    wilaya: 'Alger',
    address: 'باب الزوار، الجزائر العاصمة',
    supplied_materials: ['أحبار DTF كورية (CMYK + White)', 'بودرة بوليميد حرارية', 'أفلام رول DTF'],
    notes: 'أحبار معتمدة ومطابقة للمعايير، دعم فني متواصل للآلات',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sup-subliplus',
    name: 'SubliPlus Oran',
    contact_person: 'السيد هواري بوعمامة',
    phone: '041 33 55 77',
    email: 'info@subliplus-oran.com',
    wilaya: 'Oran',
    address: 'حي الأمير عبد القادر، السانية، وهران',
    supplied_materials: ['أكواب خزفية سحرية 11oz', 'حقائب كانفاس إيكو', 'أوراق سبليمايشن'],
    notes: 'مورد الأكواب والتجهيزات الترويجية',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-tsh-blk-l',
    name: 'تيشيرت قطن 240غ أسود - مقاس L',
    name_ar: 'تيشيرت قطن 240غ أسود - مقاس L',
    category: 'blank',
    type: 'T-Shirt Coton Peigné 240g',
    color: 'أسود الملكي',
    size: 'L',
    current_stock: 68,
    min_threshold: 20,
    unit: 'قطعة',
    cost_per_unit: 850,
    supplier_id: 'sup-texprint',
    supplier_name: 'SARL TexPrint Algérie',
    location_in_workshop: 'الرف A1 - قسم الملابس الجاهزة',
    sku: 'BLK-TSH-BLK-L',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-tsh-blk-m',
    name: 'تيشيرت قطن 240غ أسود - مقاس M',
    name_ar: 'تيشيرت قطن 240غ أسود - مقاس M',
    category: 'blank',
    type: 'T-Shirt Coton Peigné 240g',
    color: 'أسود الملكي',
    size: 'M',
    current_stock: 45,
    min_threshold: 20,
    unit: 'قطعة',
    cost_per_unit: 850,
    supplier_id: 'sup-texprint',
    supplier_name: 'SARL TexPrint Algérie',
    location_in_workshop: 'الرف A1 - قسم الملابس الجاهزة',
    sku: 'BLK-TSH-BLK-M',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-tsh-wht-l',
    name: 'تيشيرت قطن 240غ أبيض - مقاس L',
    name_ar: 'تيشيرت قطن 240غ أبيض - مقاس L',
    category: 'blank',
    type: 'T-Shirt Coton Peigné 240g',
    color: 'أبيض ناصع',
    size: 'L',
    current_stock: 12, // Low stock alert!
    min_threshold: 20,
    unit: 'قطعة',
    cost_per_unit: 820,
    supplier_id: 'sup-texprint',
    supplier_name: 'SARL TexPrint Algérie',
    location_in_workshop: 'الرف A2',
    sku: 'BLK-TSH-WHT-L',
    notes: 'تحذير: المخزون منخفض، يجب طلب شحنة جديدة',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-hod-blk-xl',
    name: 'هودي شتوي مبطن 380غ أسود - مقاس XL',
    name_ar: 'هودي شتوي مبطن 380غ أسود - مقاس XL',
    category: 'blank',
    type: 'Hoodie Molleton 380g',
    color: 'أسود كربوني',
    size: 'XL',
    current_stock: 32,
    min_threshold: 15,
    unit: 'قطعة',
    cost_per_unit: 1850,
    supplier_id: 'sup-texprint',
    supplier_name: 'SARL TexPrint Algérie',
    location_in_workshop: 'الرف B1 - الهوديز والشتوي',
    sku: 'BLK-HOD-BLK-XL',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-mug-magic',
    name: 'أكواب خزفية سحرية سوداء 11oz',
    name_ar: 'أكواب خزفية سحرية سوداء 11oz',
    category: 'blank',
    type: 'Mug Céramique Magique',
    color: 'أسود كاشف للحرارة',
    size: '330ml',
    current_stock: 54,
    min_threshold: 25,
    unit: 'قطعة',
    cost_per_unit: 420,
    supplier_id: 'sup-subliplus',
    supplier_name: 'SubliPlus Oran',
    location_in_workshop: 'الرف C3 - الخزف والزجاج',
    sku: 'BLK-MUG-MAG-11',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-totebag-eco',
    name: 'حقائب توت باق قماشية كانفاس',
    name_ar: 'حقائب توت باق قماشية كانفاس',
    category: 'blank',
    type: 'Tote Bag Toile Coton',
    color: 'أوف وايت طبيعي',
    size: '38x42 cm',
    current_stock: 80,
    min_threshold: 30,
    unit: 'قطعة',
    cost_per_unit: 340,
    supplier_id: 'sup-subliplus',
    supplier_name: 'SubliPlus Oran',
    location_in_workshop: 'الرف D1',
    sku: 'BLK-TOT-NAT',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-ink-wht',
    name: 'حبر DTF أبيض فائق التغطية 1000ml',
    name_ar: 'حبر DTF أبيض فائق التغطية 1000ml',
    category: 'ink',
    type: 'Encre DTF Textile White',
    color: 'أبيض ناصع',
    current_stock: 4, // 4 bottles
    min_threshold: 3,
    unit: 'قارورة (1L)',
    cost_per_unit: 7200,
    supplier_id: 'sup-dtfmaghreb',
    supplier_name: 'DTF Solutions Maghreb',
    location_in_workshop: 'خزانة الكيماويات والأحبار',
    sku: 'INK-DTF-WHT-1L',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-powder-wht',
    name: 'بودرة بولي أميد حرارية DTF بيضاء (كيس 1 كغ)',
    name_ar: 'بودرة بولي أميد حرارية DTF بيضاء (كيس 1 كغ)',
    category: 'film_powder',
    type: 'Poudre Thermofusible TPU',
    color: 'أبيض ناعم',
    current_stock: 7,
    min_threshold: 3,
    unit: 'كغ',
    cost_per_unit: 4500,
    supplier_id: 'sup-dtfmaghreb',
    supplier_name: 'DTF Solutions Maghreb',
    location_in_workshop: 'خزانة الكيماويات',
    sku: 'POW-DTF-TPU-1KG',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-film-roll',
    name: 'رول فيلم DTF شفاف 60 سم × 100 متر',
    name_ar: 'رول فيلم DTF شفاف 60 سم × 100 متر',
    category: 'film_powder',
    type: 'Film Transfert PET Double Face',
    current_stock: 3,
    min_threshold: 2,
    unit: 'رول (100m)',
    cost_per_unit: 16500,
    supplier_id: 'sup-dtfmaghreb',
    supplier_name: 'DTF Solutions Maghreb',
    location_in_workshop: 'منطقة الطابعات الكبيرة',
    sku: 'FLM-DTF-60X100',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'inv-pack-boxes',
    name: 'علب شحن كرتونية كرافت فاخرة مع شعار DZPrint',
    name_ar: 'علب شحن كرتونية كرافت فاخرة مع شعار DZPrint',
    category: 'packaging',
    type: 'Boîte Carton Expédition',
    size: '30x25x8 cm',
    current_stock: 140,
    min_threshold: 50,
    unit: 'علبة',
    cost_per_unit: 95,
    supplier_id: 'sup-texprint',
    supplier_name: 'SARL TexPrint Algérie',
    location_in_workshop: 'مستودع التغليف والتجهيز',
    sku: 'PCK-BOX-KRFT-01',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    item_id: 'inv-tsh-blk-l',
    item_name: 'تيشيرت قطن 240غ أسود - مقاس L',
    change_qty: 50,
    previous_stock: 18,
    new_stock: 68,
    type: 'restock',
    reason: 'شحنة توريد جديدة من TexPrint',
    operator: 'أمين المخزن',
    timestamp: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'mov-2',
    item_id: 'inv-tsh-wht-l',
    item_name: 'تيشيرت قطن 240غ أبيض - مقاس L',
    change_qty: -3,
    previous_stock: 15,
    new_stock: 12,
    type: 'production_use',
    reason: 'تنفيذ طلبية سريعة ORD-1024',
    operator: 'تقني الطباعة',
    timestamp: '2026-03-10T14:20:00.000Z',
  },
  {
    id: 'mov-3',
    item_id: 'inv-powder-wht',
    item_name: 'بودرة بولي أميد حرارية DTF بيضاء (كيس 1 كغ)',
    change_qty: 5,
    previous_stock: 2,
    new_stock: 7,
    type: 'restock',
    reason: 'إعادة تموين دورية من DTF Solutions',
    operator: 'أمين المخزن',
    timestamp: '2026-03-05T09:30:00.000Z',
  },
];

export const INITIAL_PRODUCTION_JOBS: ProductionJob[] = [
  {
    id: 'job-1',
    order_id: 'ord-101',
    order_number: 'DZ-26-4891',
    customer_name: 'ياسين بلعربي',
    customer_phone: '0550123456',
    stage: 'in_production',
    priority: 'rush',
    technique: 'DTF',
    assigned_technician: 'عبد القادر (مسؤول المكبس)',
    items_summary: 'تيشيرت قطن بريميوم (أسود - L) مع تصميم خط الثلث الجزائري بالصدر',
    target_date: '2026-03-15',
    notes: 'الزبون مستعجل، يرجى ضبط درجة حرارة المكبس على 160° لمدة 15 ثانية وتبريد تام قبل النزع',
    started_at: '2026-03-14T09:00:00.000Z',
    created_at: '2026-03-13T14:20:00.000Z',
    updated_at: '2026-03-14T09:00:00.000Z',
  },
  {
    id: 'job-2',
    order_id: 'ord-102',
    order_number: 'DZ-26-5120',
    customer_name: 'أمينة خليفي',
    customer_phone: '0661987654',
    stage: 'ready_to_print',
    priority: 'normal',
    technique: 'DTF',
    assigned_technician: 'سفيان (مشغل الطابعة)',
    items_summary: '2x هودي شتوي مبطن فاخر (أسود كربوني - XL)',
    target_date: '2026-03-16',
    notes: 'تمت مراجعة دقة ملف الصورة بدقة 300 DPI وإعداد طبقة الحبر الأبيض',
    created_at: '2026-03-14T10:15:00.000Z',
    updated_at: '2026-03-14T10:15:00.000Z',
  },
  {
    id: 'job-3',
    order_id: 'ord-103',
    order_number: 'DZ-26-6204',
    customer_name: 'محمد طارق بن عيسى',
    customer_phone: '0770334455',
    stage: 'quality_check',
    priority: 'normal',
    technique: 'Sublimation',
    assigned_technician: 'منال (مراقبة الجودة والتغليف)',
    items_summary: 'كوب خزفي سحري مخصص (أسود كاشف للحرارة)',
    target_date: '2026-03-15',
    notes: 'تم فحص الكوب بالماء الساخن والتأكد من وضوح الصورة وغياب أي خدوش',
    created_at: '2026-03-12T16:00:00.000Z',
    updated_at: '2026-03-14T11:30:00.000Z',
  },
  {
    id: 'job-4',
    order_id: 'ord-104',
    order_number: 'DZ-26-7819',
    customer_name: 'وليد رحماني',
    customer_phone: '0540112233',
    stage: 'received',
    priority: 'urgent',
    technique: 'DTF',
    assigned_technician: 'غير محدد بعد',
    items_summary: '3x تيشيرت قطن بريميوم مخصص (أبيض - M)',
    target_date: '2026-03-15',
    notes: 'طلب جديد بانتظار التأكيد الهاتفي للبدء بالطباعة الفورية',
    created_at: '2026-03-14T12:00:00.000Z',
    updated_at: '2026-03-14T12:00:00.000Z',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-devis-001',
    invoice_number: 'DEV-2026-001',
    type: 'quote',
    client_name: 'شركة ديجيتال ميديا الجزائر (Digital Media SARL)',
    client_company: 'SARL Digital Media DZ',
    client_phone: '0560 11 22 33',
    client_email: 'contact@digitalmedia.dz',
    client_address: 'حي الأعمال، باب الزوار، الجزائر العاصمة',
    client_wilaya: 'الجزائر (Alger)',
    client_nif: '001816012345678',
    client_nis: '19801600123',
    client_rc: '16/00-1234567B18',
    issue_date: '2026-03-10',
    due_date: '2026-04-10',
    items: [
      {
        id: 'it-1',
        description: 'تيشيرت قطن 100% ممتاز (وزن 240g) مع طباعة شعار الشركة DTF أمامي وخلفي',
        details: 'مقاسات متنوعة (M, L, XL) - قماش أسود ملكي فخم',
        quantity: 50,
        unit_price: 1500,
        total: 75000,
      },
      {
        id: 'it-2',
        description: 'كوب خزفي سحري مع هوية الشركة الترويجية',
        details: 'طباعة حرارية سبليمايشن 360 درجة مع علبة كرتونية',
        quantity: 20,
        unit_price: 900,
        total: 18000,
      },
    ],
    subtotal: 93000,
    tax_rate: 0,
    tax_amount: 0,
    stamp_duty: 0,
    discount: 3000,
    total: 90000,
    status: 'sent',
    payment_method: 'bank_transfer',
    notes: 'عرض أسعار صالح لمدة 30 يوماً. مدة الإنجاز 5 أيام بعد المصادقة واستلام الدفعة الأولى (30%).',
    created_at: '2026-03-10T09:00:00.000Z',
    updated_at: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'inv-fact-001',
    invoice_number: 'FACT-2026-001',
    type: 'invoice',
    client_name: 'النادي العلمي للتكنولوجيا والبرمجيات',
    client_company: 'Club Scientifique CST',
    client_phone: '0555 77 88 99',
    client_email: 'club.tech@edu.dz',
    client_address: 'جامعة العلوم والتكنولوجيا هواري بومدين (USTHB)، باب الزوار',
    client_wilaya: 'الجزائر (Alger)',
    issue_date: '2026-03-05',
    due_date: '2026-03-15',
    items: [
      {
        id: 'it-3',
        description: 'هودي شتوي مبطن 380غ مع تطريز شعار الهاكاثون الوطني',
        details: 'لون أسود كربوني - مقاسات متنوعة',
        quantity: 25,
        unit_price: 3200,
        total: 80000,
      },
    ],
    subtotal: 80000,
    tax_rate: 0,
    tax_amount: 0,
    stamp_duty: 0,
    discount: 5000,
    total: 75000,
    status: 'paid',
    payment_method: 'baridimob',
    notes: 'تم استلام المبلغ كاملاً عبر BaridiMob وتم تسليم الطلبية بمقر الجامعة.',
    created_at: '2026-03-05T10:00:00.000Z',
    updated_at: '2026-03-06T15:00:00.000Z',
  },
];

// ============================================================
// IN-MEMORY CACHE & FALLBACK STORE (Zero disk dependence for Vercel)
// ============================================================
class MemoryStore {
  wilayas: Wilaya[] = [...INITIAL_WILAYAS];
  agencies: DeliveryAgency[] = [...INITIAL_AGENCIES];
  rates: DeliveryRate[] = generateInitialRates();
  products: Product[] = [...INITIAL_PRODUCTS];
  designs: Design[] = [...INITIAL_DESIGNS];
  coupons: Coupon[] = [...INITIAL_COUPONS];
  orders: Order[] = [];
  settings: SiteSettings = { ...INITIAL_SETTINGS };
  cms: HomepageCMS = { ...INITIAL_CMS };
  customers: Customer[] = [...INITIAL_CUSTOMERS];
  suppliers: Supplier[] = [...INITIAL_SUPPLIERS];
  inventory: InventoryItem[] = [...INITIAL_INVENTORY];
  movements: StockMovement[] = [...INITIAL_MOVEMENTS];
  productionJobs: ProductionJob[] = [...INITIAL_PRODUCTION_JOBS];
  invoices: Invoice[] = [...INITIAL_INVOICES];
  orderCounter = 1000;
}

const memoryStore = new MemoryStore();

// ============================================================
// DATABASE CLASS
// Supabase as primary engine, in-memory as zero-disk fallback
// ============================================================
export class Database {
  static async init(): Promise<void> {
    // Database initialization (Supabase cloud connection & in-memory cache)
  }

  // 1. Wilayas
  static async getWilayas(): Promise<Wilaya[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('wilayas')
          .select('*')
          .order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getWilayas fallback]:', err.message);
      }
    }
    return memoryStore.wilayas;
  }

  static async updateWilaya(id: number, data: Partial<Wilaya>): Promise<Wilaya | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data: updated, error } = await client
          .from('wilayas')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) return updated;
      } catch (err: any) {
        console.warn('[Supabase updateWilaya fallback]:', err.message);
      }
    }
    const idx = memoryStore.wilayas.findIndex(w => w.id === id);
    if (idx === -1) return null;
    memoryStore.wilayas[idx] = { ...memoryStore.wilayas[idx], ...data };
    return memoryStore.wilayas[idx];
  }

  // 2. Delivery Agencies
  static async getAgencies(): Promise<DeliveryAgency[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('delivery_agencies')
          .select('*')
          .order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getAgencies fallback]:', err.message);
      }
    }
    return memoryStore.agencies;
  }

  static async saveAgency(agency: DeliveryAgency): Promise<DeliveryAgency> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('delivery_agencies')
          .upsert(agency)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveAgency fallback]:', err.message);
      }
    }
    const idx = memoryStore.agencies.findIndex(a => a.id === agency.id);
    if (idx >= 0) {
      memoryStore.agencies[idx] = agency;
    } else {
      memoryStore.agencies.push(agency);
    }
    return agency;
  }

  static async deleteAgency(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('delivery_agencies').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteAgency fallback]:', err.message);
      }
    }
    const idx = memoryStore.agencies.findIndex(a => a.id === id);
    if (idx >= 0) {
      memoryStore.agencies.splice(idx, 1);
      return true;
    }
    return false;
  }

  // 3. Delivery Rates
  static async getRates(agencyId?: string, wilayaId?: number): Promise<DeliveryRate[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('delivery_rates').select('*');
        if (agencyId) query = query.eq('agency_id', agencyId);
        if (wilayaId) query = query.eq('wilaya_id', wilayaId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getRates fallback]:', err.message);
      }
    }
    let filtered = memoryStore.rates;
    if (agencyId) filtered = filtered.filter(r => r.agency_id === agencyId);
    if (wilayaId) filtered = filtered.filter(r => r.wilaya_id === wilayaId);
    return filtered;
  }

  static async getRate(agencyId: string, wilayaId: number): Promise<DeliveryRate | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('delivery_rates')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('wilaya_id', wilayaId)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getRate fallback]:', err.message);
      }
    }
    const found = memoryStore.rates.find(r => r.agency_id === agencyId && r.wilaya_id === wilayaId);
    return found || null;
  }

  static async saveRate(rate: DeliveryRate): Promise<DeliveryRate> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('delivery_rates')
          .upsert(rate)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveRate fallback]:', err.message);
      }
    }
    const idx = memoryStore.rates.findIndex(
      r => r.agency_id === rate.agency_id && r.wilaya_id === rate.wilaya_id
    );
    if (idx >= 0) {
      memoryStore.rates[idx] = rate;
    } else {
      memoryStore.rates.push(rate);
    }
    return rate;
  }

  // 4. Products
  static async getProducts(activeOnly = false): Promise<Product[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('products').select('*');
        if (activeOnly) query = query.eq('active', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getProducts fallback]:', err.message);
      }
    }
    return activeOnly ? memoryStore.products.filter(p => p.active) : memoryStore.products;
  }

  static async getProductById(id: string): Promise<Product | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getProductById fallback]:', err.message);
      }
    }
    return memoryStore.products.find(p => p.id === id) || null;
  }

  static async saveProduct(product: Product): Promise<Product> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('products')
          .upsert(product)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveProduct fallback]:', err.message);
      }
    }
    const idx = memoryStore.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      memoryStore.products[idx] = product;
    } else {
      memoryStore.products.push(product);
    }
    return product;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('products').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteProduct fallback]:', err.message);
      }
    }
    const idx = memoryStore.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      memoryStore.products.splice(idx, 1);
      return true;
    }
    return false;
  }

  // 5. Designs
  static async getDesigns(activeOnly = false): Promise<Design[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        let query = client.from('designs').select('*');
        if (activeOnly) query = query.eq('active', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getDesigns fallback]:', err.message);
      }
    }
    return activeOnly ? memoryStore.designs.filter(d => d.active) : memoryStore.designs;
  }

  static async getDesignById(id: string): Promise<Design | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('designs')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getDesignById fallback]:', err.message);
      }
    }
    return memoryStore.designs.find(d => d.id === id) || null;
  }

  static async saveDesign(design: Design): Promise<Design> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('designs')
          .upsert(design)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveDesign fallback]:', err.message);
      }
    }
    const idx = memoryStore.designs.findIndex(d => d.id === design.id);
    if (idx >= 0) {
      memoryStore.designs[idx] = design;
    } else {
      memoryStore.designs.push(design);
    }
    return design;
  }

  static async deleteDesign(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('designs').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteDesign fallback]:', err.message);
      }
    }
    const idx = memoryStore.designs.findIndex(d => d.id === id);
    if (idx >= 0) {
      memoryStore.designs.splice(idx, 1);
      return true;
    }
    return false;
  }

  // 6. Coupons
  static async getCoupons(): Promise<Coupon[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('coupons').select('*');
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getCoupons fallback]:', err.message);
      }
    }
    return memoryStore.coupons;
  }

  static async getCouponByCode(code: string): Promise<Coupon | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('coupons')
          .select('*')
          .eq('code', code.toUpperCase().trim())
          .eq('active', true)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getCouponByCode fallback]:', err.message);
      }
    }
    const found = memoryStore.coupons.find(
      c => c.code.toUpperCase() === code.toUpperCase().trim() && c.active
    );
    return found || null;
  }

  static async saveCoupon(coupon: Coupon): Promise<Coupon> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('coupons')
          .upsert(coupon)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveCoupon fallback]:', err.message);
      }
    }
    const idx = memoryStore.coupons.findIndex(c => c.id === coupon.id);
    if (idx >= 0) {
      memoryStore.coupons[idx] = coupon;
    } else {
      memoryStore.coupons.push(coupon);
    }
    return coupon;
  }

  static async deleteCoupon(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('coupons').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteCoupon fallback]:', err.message);
      }
    }
    const idx = memoryStore.coupons.findIndex(c => c.id === id);
    if (idx >= 0) {
      memoryStore.coupons.splice(idx, 1);
      return true;
    }
    return false;
  }

  // 7. Orders
  static async generateNextOrderNumber(): Promise<string> {
    memoryStore.orderCounter += 1;
    const year = new Date().getFullYear().toString().slice(-2);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DZ-${year}-${randomSuffix}`;
  }

  static async getOrders(): Promise<Order[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select(`
            *,
            items:order_items(*),
            status_history:order_status_history(*)
          `)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getOrders fallback]:', err.message);
      }
    }
    return memoryStore.orders.slice().reverse();
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select(`
            *,
            items:order_items(*),
            status_history:order_status_history(*)
          `)
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getOrderById fallback]:', err.message);
      }
    }
    return memoryStore.orders.find(o => o.id === id) || null;
  }

  static async getOrderByNumberAndPhone(orderNumber: string, phone: string): Promise<Order | null> {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select(`
            *,
            items:order_items(*),
            status_history:order_status_history(*)
          `)
          .eq('order_number', orderNumber.trim())
          .ilike('phone', `%${cleanPhone.slice(-8)}%`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getOrderByNumberAndPhone fallback]:', err.message);
      }
    }
    const cleanTail = cleanPhone.slice(-8);
    const found = memoryStore.orders.find(
      o =>
        o.order_number.toLowerCase() === orderNumber.trim().toLowerCase() &&
        o.phone.replace(/[^0-9]/g, '').endsWith(cleanTail)
    );
    return found || null;
  }

  static async createOrder(order: Order): Promise<Order> {
    const client = getServerSupabase();
    if (client) {
      try {
        // Insert parent order
        const { items, status_history, ...orderFields } = order;
        const { data: insertedOrder, error: orderErr } = await client
          .from('orders')
          .insert([orderFields])
          .select()
          .single();

        if (orderErr) {
          console.error('[Supabase order insert error]:', orderErr);
        } else if (insertedOrder) {
          // Insert order items
          if (items && items.length > 0) {
            const itemsToInsert = items.map((it, idx) => ({
              id: `${order.id}-item-${idx}`,
              order_id: order.id,
              product_id: it.product_id,
              product_name_snapshot: it.product_name_snapshot,
              category_snapshot: it.category_snapshot,
              variant_id: it.variant_id,
              color_snapshot: it.color_snapshot,
              color_hex_snapshot: it.color_hex_snapshot,
              size_snapshot: it.size_snapshot,
              quantity: it.quantity,
              unit_price: it.unit_price,
              design_id: it.design_id,
              design_name_snapshot: it.design_name_snapshot,
              uploaded_design_url: it.uploaded_design_url,
              customization_data: it.customization_data || {},
            }));
            await client.from('order_items').insert(itemsToInsert);
          }

          // Insert status history
          if (status_history && status_history.length > 0) {
            const historyToInsert = status_history.map((sh, idx) => ({
              id: `${order.id}-status-${idx}`,
              order_id: order.id,
              status: sh.status,
              note: sh.note,
              created_by: sh.created_by || 'System',
              timestamp: sh.timestamp,
            }));
            await client.from('order_status_history').insert(historyToInsert);
          }
        }
      } catch (err: any) {
        console.warn('[Supabase createOrder fallback]:', err.message);
      }
    }

    // Always maintain memory cache
    memoryStore.orders.push(order);
    return order;
  }

  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    createdBy = 'Admin'
  ): Promise<Order | null> {
    const timestamp = new Date().toISOString();
    const newEntry = {
      status,
      timestamp,
      note: note || `تم تحديث الحالة إلى ${status}`,
      created_by: createdBy,
    };

    const client = getServerSupabase();
    if (client) {
      try {
        await client
          .from('orders')
          .update({ status, updated_at: timestamp })
          .eq('id', orderId);

        await client.from('order_status_history').insert({
          id: `${orderId}-status-${Date.now()}`,
          order_id: orderId,
          status,
          note: newEntry.note,
          created_by: createdBy,
          timestamp,
        });
      } catch (err: any) {
        console.warn('[Supabase updateOrderStatus fallback]:', err.message);
      }
    }

    const order = memoryStore.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updated_at = timestamp;
    order.status_history = order.status_history || [];
    order.status_history.push(newEntry);
    return order;
  }

  // 8. Site Settings & CMS
  static async getSettings(): Promise<SiteSettings> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('site_settings')
          .select('*')
          .eq('id', 'main_settings')
          .maybeSingle();
        if (!error && data) {
          const merged: SiteSettings = {
            ...memoryStore.settings,
            ...data,
            store_name: data.store_name || data.business_name_ar || data.business_name || memoryStore.settings.store_name,
            business_name: data.business_name || data.store_name || memoryStore.settings.business_name,
            business_name_ar: data.business_name_ar || data.store_name || memoryStore.settings.business_name_ar,
            store_description: data.store_description || memoryStore.settings.store_description,
            store_description_ar: data.store_description_ar || memoryStore.settings.store_description_ar,
          };
          memoryStore.settings = merged;
          return merged;
        }
      } catch (err: any) {
        console.warn('[Supabase getSettings fallback]:', err.message);
      }
    }
    return memoryStore.settings;
  }

  static async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const client = getServerSupabase();
    if (client) {
      try {
        const payload: Record<string, any> = {
          id: 'main_settings',
          ...data,
          updated_at: new Date().toISOString(),
        };
        if (data.business_name_ar || data.business_name) {
          payload.store_name = data.business_name_ar || data.business_name;
        }

        const { data: updated, error } = await client
          .from('site_settings')
          .upsert(payload)
          .select()
          .single();
        if (!error && updated) {
          memoryStore.settings = { ...memoryStore.settings, ...updated };
          return memoryStore.settings;
        } else if (error) {
          console.warn('[Supabase updateSettings warning, updating memoryStore]:', error.message);
        }
      } catch (err: any) {
        console.warn('[Supabase updateSettings fallback]:', err.message);
      }
    }
    memoryStore.settings = { ...memoryStore.settings, ...data };
    return memoryStore.settings;
  }

  static async getHomepageCMS(): Promise<HomepageCMS> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('homepage_cms')
          .select('*')
          .eq('id', 'main_cms')
          .maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getHomepageCMS fallback]:', err.message);
      }
    }
    return memoryStore.cms;
  }

  static async updateHomepageCMS(data: Partial<HomepageCMS>): Promise<HomepageCMS> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data: updated, error } = await client
          .from('homepage_cms')
          .upsert({ id: 'main_cms', ...data })
          .select()
          .single();
        if (!error && updated) return updated;
      } catch (err: any) {
        console.warn('[Supabase updateHomepageCMS fallback]:', err.message);
      }
    }
    memoryStore.cms = { ...memoryStore.cms, ...data };
    return memoryStore.cms;
  }

  // ============================================================
  // 9. CRM / CUSTOMERS
  // ============================================================
  static async getCustomers(): Promise<Customer[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('customers').select('*').order('total_spent', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getCustomers fallback]:', err.message);
      }
    }

    // Dynamic aggregation: Merge any placed orders that might not be in customers list yet
    const existingPhones = new Set(memoryStore.customers.map(c => c.phone.replace(/[^0-9]/g, '')));
    for (const order of memoryStore.orders) {
      const cleanPhone = order.phone.replace(/[^0-9]/g, '');
      if (!existingPhones.has(cleanPhone)) {
        const newCust: Customer = {
          id: `cust-${cleanPhone.slice(-6)}`,
          full_name: order.full_name,
          phone: order.phone,
          email: order.email,
          wilaya_id: order.wilaya_id,
          wilaya_name: order.wilaya_name || 'غير محدد',
          address: order.delivery_address,
          tags: ['New'],
          total_orders: 1,
          total_spent: order.total || 0,
          last_order_date: order.created_at,
          created_at: order.created_at,
        };
        memoryStore.customers.push(newCust);
        existingPhones.add(cleanPhone);
      }
    }

    return memoryStore.customers;
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('customers').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getCustomerById fallback]:', err.message);
      }
    }
    return memoryStore.customers.find(c => c.id === id) || null;
  }

  static async saveCustomer(customer: Customer): Promise<Customer> {
    customer.updated_at = new Date().toISOString();
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('customers').upsert(customer).select().single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveCustomer fallback]:', err.message);
      }
    }
    const idx = memoryStore.customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      memoryStore.customers[idx] = customer;
    } else {
      memoryStore.customers.push(customer);
    }
    return customer;
  }

  static async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const cust = await this.getCustomerById(id);
    if (!cust) return null;
    const updated = { ...cust, ...data, updated_at: new Date().toISOString() };
    return this.saveCustomer(updated);
  }

  // ============================================================
  // 10. INVENTORY & SUPPLY CHAIN
  // ============================================================
  static async getInventoryItems(): Promise<InventoryItem[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('inventory_items').select('*').order('category', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getInventoryItems fallback]:', err.message);
      }
    }
    return memoryStore.inventory;
  }

  static async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('inventory_items').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getInventoryItemById fallback]:', err.message);
      }
    }
    return memoryStore.inventory.find(i => i.id === id) || null;
  }

  static async saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    item.updated_at = new Date().toISOString();
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('inventory_items').upsert(item).select().single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveInventoryItem fallback]:', err.message);
      }
    }
    const idx = memoryStore.inventory.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      memoryStore.inventory[idx] = item;
    } else {
      memoryStore.inventory.push(item);
    }
    return item;
  }

  static async deleteInventoryItem(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('inventory_items').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteInventoryItem fallback]:', err.message);
      }
    }
    const idx = memoryStore.inventory.findIndex(i => i.id === id);
    if (idx >= 0) {
      memoryStore.inventory.splice(idx, 1);
      return true;
    }
    return false;
  }

  static async adjustStock(
    itemId: string,
    changeQty: number,
    type: 'restock' | 'production_use' | 'waste_defect' | 'adjustment' | 'return',
    reason?: string,
    operator = 'المسؤول'
  ): Promise<{ item: InventoryItem; movement: StockMovement } | null> {
    const item = await this.getInventoryItemById(itemId);
    if (!item) return null;

    const previousStock = item.current_stock;
    const newStock = Math.max(0, previousStock + changeQty);
    item.current_stock = newStock;
    item.updated_at = new Date().toISOString();
    if (type === 'restock') {
      item.last_restocked_at = new Date().toISOString();
    }

    await this.saveInventoryItem(item);

    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item_id: item.id,
      item_name: item.name,
      change_qty: changeQty,
      previous_stock: previousStock,
      new_stock: newStock,
      type,
      reason: reason || (changeQty > 0 ? 'إضافة للمخزون' : 'صرف للإنتاج'),
      operator,
      timestamp: new Date().toISOString(),
    };

    memoryStore.movements.unshift(movement);

    const client = getServerSupabase();
    if (client) {
      try {
        await client.from('stock_movements').insert(movement);
      } catch (err: any) {
        console.warn('[Supabase stock_movements fallback]:', err.message);
      }
    }

    return { item, movement };
  }

  static async getStockMovements(): Promise<StockMovement[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('stock_movements').select('*').order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getStockMovements fallback]:', err.message);
      }
    }
    return memoryStore.movements;
  }

  // 11. Suppliers
  static async getSuppliers(): Promise<Supplier[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('suppliers').select('*').order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getSuppliers fallback]:', err.message);
      }
    }
    return memoryStore.suppliers;
  }

  static async saveSupplier(supplier: Supplier): Promise<Supplier> {
    supplier.updated_at = new Date().toISOString();
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('suppliers').upsert(supplier).select().single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveSupplier fallback]:', err.message);
      }
    }
    const idx = memoryStore.suppliers.findIndex(s => s.id === supplier.id);
    if (idx >= 0) {
      memoryStore.suppliers[idx] = supplier;
    } else {
      memoryStore.suppliers.push(supplier);
    }
    return supplier;
  }

  static async deleteSupplier(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('suppliers').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteSupplier fallback]:', err.message);
      }
    }
    const idx = memoryStore.suppliers.findIndex(s => s.id === id);
    if (idx >= 0) {
      memoryStore.suppliers.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ============================================================
  // 12. PRODUCTION MANAGEMENT & WORKSHOP KANBAN
  // ============================================================
  static async getProductionJobs(): Promise<ProductionJob[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('production_jobs').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getProductionJobs fallback]:', err.message);
      }
    }

    // Auto-sync jobs from any orders that don't have a job yet
    const existingOrderIds = new Set(memoryStore.productionJobs.map(j => j.order_id));
    for (const order of memoryStore.orders) {
      if (!existingOrderIds.has(order.id)) {
        let stage: ProductionStage = 'received';
        if (order.status === 'printing') stage = 'in_production';
        else if (order.status === 'ready') stage = 'quality_check';
        else if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) stage = 'ready_to_ship';
        else if (order.status === 'confirmed') stage = 'ready_to_print';

        const summary = order.items
          .map(it => `${it.product_name_snapshot} (${it.color_snapshot} - ${it.size_snapshot} × ${it.quantity})`)
          .join(', ');

        const newJob: ProductionJob = {
          id: `job-${order.id}`,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.full_name,
          customer_phone: order.phone,
          stage,
          priority: 'normal',
          technique: order.items.some(it => it.product_name_snapshot.includes('كوب')) ? 'Sublimation' : 'DTF',
          items_summary: summary || 'منتجات طباعة مخصصة',
          notes: order.customer_notes || 'فحص جودة الطباعة والألوان قبل التغليف',
          created_at: order.created_at,
          updated_at: order.updated_at,
        };
        memoryStore.productionJobs.push(newJob);
        existingOrderIds.add(order.id);
      }
    }

    return memoryStore.productionJobs;
  }

  static async updateProductionJobStage(
    jobId: string,
    stage: ProductionStage,
    technician?: string,
    notes?: string
  ): Promise<ProductionJob | null> {
    const job = memoryStore.productionJobs.find(j => j.id === jobId);
    if (!job) return null;

    job.stage = stage;
    if (technician) job.assigned_technician = technician;
    if (notes !== undefined) job.notes = notes;
    job.updated_at = new Date().toISOString();

    if (stage === 'in_production' && !job.started_at) {
      job.started_at = new Date().toISOString();
    }
    if (stage === 'completed' && !job.completed_at) {
      job.completed_at = new Date().toISOString();
    }

    const client = getServerSupabase();
    if (client) {
      try {
        await client.from('production_jobs').upsert(job);
      } catch (err: any) {
        console.warn('[Supabase updateProductionJobStage fallback]:', err.message);
      }
    }

    return job;
  }

  static async createProductionJob(job: ProductionJob): Promise<ProductionJob> {
    const client = getServerSupabase();
    if (client) {
      try {
        await client.from('production_jobs').upsert(job);
      } catch (err: any) {
        console.warn('[Supabase createProductionJob fallback]:', err.message);
      }
    }
    memoryStore.productionJobs.unshift(job);
    return job;
  }

  // ============================================================
  // 13. INVOICES & QUOTATIONS (Factures & Devis)
  // ============================================================
  static async getInvoices(): Promise<Invoice[]> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('invoices').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('[Supabase getInvoices fallback]:', err.message);
      }
    }
    return memoryStore.invoices;
  }

  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('invoices').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase getInvoiceById fallback]:', err.message);
      }
    }
    return memoryStore.invoices.find(i => i.id === id) || null;
  }

  static async saveInvoice(invoice: Invoice): Promise<Invoice> {
    invoice.updated_at = new Date().toISOString();
    const client = getServerSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('invoices').upsert(invoice).select().single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase saveInvoice fallback]:', err.message);
      }
    }
    const idx = memoryStore.invoices.findIndex(i => i.id === invoice.id);
    if (idx >= 0) {
      memoryStore.invoices[idx] = invoice;
    } else {
      memoryStore.invoices.unshift(invoice);
    }
    return invoice;
  }

  static async deleteInvoice(id: string): Promise<boolean> {
    const client = getServerSupabase();
    if (client) {
      try {
        const { error } = await client.from('invoices').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.warn('[Supabase deleteInvoice fallback]:', err.message);
      }
    }
    const idx = memoryStore.invoices.findIndex(i => i.id === id);
    if (idx >= 0) {
      memoryStore.invoices.splice(idx, 1);
      return true;
    }
    return false;
  }

  static async generateInvoiceFromOrder(orderId: string): Promise<Invoice | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `FACT-${year}-${randomSeq}`;

    const items = order.items.map((it, idx) => ({
      id: `it-${idx + 1}`,
      description: `${it.product_name_snapshot} (${it.color_snapshot} - ${it.size_snapshot})`,
      details: it.design_name_snapshot ? `تصميم: ${it.design_name_snapshot}` : 'طباعة مخصصة',
      quantity: it.quantity,
      unit_price: it.unit_price,
      total: it.unit_price * it.quantity,
    }));

    // Add delivery fee as an item if any
    if (order.delivery_fee > 0) {
      items.push({
        id: `it-del`,
        description: `خدمة الشحن والتوصيل (${order.delivery_agency_name || 'توصيل سليم'} - ${order.delivery_method === 'home' ? 'منزلي' : 'مكتب'})`,
        details: order.wilaya_name,
        quantity: 1,
        unit_price: order.delivery_fee,
        total: order.delivery_fee,
      });
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      type: 'invoice',
      order_id: order.id,
      client_name: order.full_name,
      client_phone: order.phone,
      client_email: order.email,
      client_address: order.delivery_address,
      client_wilaya: order.wilaya_name,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal: order.subtotal + order.delivery_fee,
      tax_rate: 0,
      tax_amount: 0,
      stamp_duty: 0,
      discount: order.discount || 0,
      total: order.total,
      status: order.status === 'delivered' ? 'paid' : 'sent',
      payment_method: 'cod',
      notes: `فاتورة رسمية صادرة عن الطلب رقم ${order.order_number}. الدفع عند الاستلام.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveInvoice(newInvoice);
    return newInvoice;
  }
}
