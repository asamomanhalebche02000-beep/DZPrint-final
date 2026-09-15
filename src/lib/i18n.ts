import { Language } from '../types';

export interface Translations {
  // Navigation
  nav_home: string;
  nav_shop: string;
  nav_tshirts: string;
  nav_hoodies: string;
  nav_mugs: string;
  nav_best_sellers: string;
  nav_custom_design: string;
  nav_designs: string;
  nav_about: string;
  nav_contact: string;
  nav_track_order: string;
  nav_cart: string;
  nav_admin: string;
  search_placeholder: string;

  // Hero
  hero_title_badge: string;
  hero_cta_custom: string;
  hero_cta_shop: string;
  hero_trust_58wilayas: string;
  hero_trust_cotton: string;
  hero_trust_print: string;

  // Categories
  cat_all: string;
  cat_tshirts: string;
  cat_hoodies: string;
  cat_mugs: string;
  cat_customizable: string;
  starting_from: string;
  customize_now: string;
  view_products: string;

  // Product Card
  badge_best_seller: string;
  badge_new: string;
  badge_customizable: string;
  in_stock: string;
  out_of_stock: string;
  add_to_cart: string;
  customize_btn: string;

  // Customizer
  customizer_title: string;
  customizer_subtitle: string;
  select_color: string;
  select_size: string;
  upload_your_design: string;
  upload_hint: string;
  upload_replace: string;
  upload_remove: string;
  or_choose_gallery: string;
  custom_text: string;
  text_placeholder: string;
  font_family: string;
  text_color: string;
  drag_resize_hint: string;
  reset_position: string;
  placement_front: string;
  placement_back: string;
  special_instructions: string;
  special_instructions_placeholder: string;
  add_custom_to_cart: string;

  // Cart
  cart_title: string;
  cart_empty: string;
  cart_empty_sub: string;
  start_shopping: string;
  subtotal: string;
  delivery_calculated_at_checkout: string;
  checkout_btn: string;
  quantity: string;
  remove: string;

  // Checkout
  checkout_title: string;
  customer_info: string;
  full_name: string;
  full_name_placeholder: string;
  phone_number: string;
  phone_placeholder: string;
  email_optional: string;
  email_placeholder: string;
  delivery_info: string;
  select_wilaya: string;
  choose_agency: string;
  delivery_method: string;
  home_delivery: string;
  office_delivery: string;
  home_delivery_desc: string;
  office_delivery_desc: string;
  address_field: string;
  address_placeholder: string;
  coupon_code: string;
  coupon_placeholder: string;
  apply_coupon: string;
  coupon_applied: string;
  coupon_invalid: string;
  order_summary: string;
  delivery_fee: string;
  discount: string;
  total: string;
  confirm_order: string;
  order_processing: string;
  agency_unavailable: string;

  // Tracking
  tracking_title: string;
  tracking_subtitle: string;
  order_number: string;
  order_number_placeholder: string;
  track_button: string;
  status_received: string;
  status_confirmed: string;
  status_preparing: string;
  status_printing: string;
  status_ready: string;
  status_shipped: string;
  status_out_for_delivery: string;
  status_delivered: string;
  status_cancelled: string;
  status_timeline: string;
  delivery_details: string;
  order_date: string;

  // Admin
  admin_portal: string;
  admin_login: string;
  admin_password: string;
  login_btn: string;
  logout_btn: string;
  dashboard: string;
  orders: string;
  products: string;
  designs: string;
  agencies_and_rates: string;
  delivery_matrix: string;
  wilayas: string;
  coupons: string;
  settings: string;
  total_revenue: string;
  total_orders: string;
  avg_order: string;
  pending_orders: string;
  export_csv: string;
  import_csv: string;
  save_changes: string;
  print_order: string;
  download_design: string;

  // Admin Navigation Tabs
  admin_tab_orders: string;
  admin_tab_production: string;
  admin_tab_inventory: string;
  admin_tab_customers: string;
  admin_tab_invoices: string;
  admin_tab_delivery: string;
  admin_tab_products: string;
  admin_tab_designs: string;
  admin_tab_coupons: string;
  admin_tab_analytics: string;
  admin_tab_landing_builder: string;
  admin_tab_settings: string;
  admin_tab_translations: string;

  // Landing Page Builder
  landing_builder_title: string;
  landing_builder_subtitle: string;
  landing_save_draft: string;
  landing_publish: string;
  landing_published_badge: string;
  landing_draft_badge: string;
  landing_add_section: string;
  landing_preview_desktop: string;
  landing_preview_tablet: string;
  landing_preview_mobile: string;
  landing_move_up: string;
  landing_move_down: string;
  landing_hide_section: string;
  landing_show_section: string;
  landing_duplicate_section: string;
  landing_delete_section: string;
  landing_edit_section: string;
  landing_preview_mode: string;
  landing_editor_mode: string;
  landing_draft_saved: string;
  landing_published_success: string;
  landing_section_type_hero: string;
  landing_section_type_featured_products: string;
  landing_section_type_categories: string;
  landing_section_type_promo_banner: string;
  landing_section_type_about: string;
  landing_section_type_services: string;
  landing_section_type_testimonials: string;
  landing_section_type_faq: string;
  landing_section_type_contact: string;
  landing_section_type_custom_text_image: string;
  landing_section_type_cta: string;

  // Product Images & Media
  product_images: string;
  product_upload_images: string;
  product_drop_images: string;
  product_primary_image: string;
  product_set_primary: string;
  product_remove_image: string;
  product_replace_image: string;
  product_uploading: string;
  product_name_ar: string;
  product_name_fr: string;
  product_name_en: string;
  product_desc_ar: string;
  product_desc_fr: string;
  product_desc_en: string;

  // Content & Translations Management
  translations_title: string;
  translations_subtitle: string;
  trans_store_name: string;
  trans_store_desc: string;
  trans_hero_headline: string;
  trans_hero_subheadline: string;
  trans_hero_cta: string;
  trans_about: string;
  trans_faq: string;
  trans_categories: string;
  trans_save_success: string;
  trans_tab_ar: string;
  trans_tab_fr: string;
  trans_tab_en: string;

  // Multi-Store
  store_selector: string;
  store_main: string;
  store_isolated_note: string;
  store_create_new: string;

  // General
  currency: string;
  contact_whatsapp: string;
  order_via_whatsapp: string;

  // Auth & Account
  auth_sign_in: string;
  auth_sign_up: string;
  auth_create_account: string;
  auth_forgot_password: string;
  auth_reset_password: string;
  auth_reset_link_sent: string;
  auth_email: string;
  auth_password: string;
  auth_new_password: string;
  auth_confirm_password: string;
  auth_full_name: string;
  auth_store_name: string;
  auth_store_slug: string;
  auth_dont_have_account: string;
  auth_already_have_account: string;
  auth_remember_password: string;
  auth_send_reset_link: string;
  auth_role_owner: string;
  auth_role_admin: string;
  auth_role_staff: string;
  auth_account_settings: string;
  admin_tab_store_settings: string;
  admin_tab_account_settings: string;
  admin_registered_admin: string;
  admin_view_store: string;
  admin_secure_logout: string;
  admin_console_title: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    nav_home: 'الرئيسية',
    nav_shop: 'المتجر',
    nav_tshirts: 'تيشيرتات',
    nav_hoodies: 'هوديز',
    nav_mugs: 'أكواب ومجات',
    nav_best_sellers: 'الأكثر مبيعاً',
    nav_custom_design: 'استوديو التصميم',
    nav_designs: 'معرض التصاميم',
    nav_about: 'من نحن',
    nav_contact: 'اتصل بنا',
    nav_track_order: 'تتبع طلبي',
    nav_cart: 'السلة',
    nav_admin: 'لوحة التحكم',
    search_placeholder: 'ابحث عن تيشيرت، هودي، مج، أو تصميم...',

    hero_title_badge: '🇩🇿 طباعة رقمية فاخرة في الجزائر',
    hero_cta_custom: 'صمّم منتجك المخصص الآن',
    hero_cta_shop: 'استكشف الأكثر مبيعاً',
    hero_trust_58wilayas: 'توصيل سريع لـ 58 ولاية',
    hero_trust_cotton: 'قطن ممتاز 100%',
    hero_trust_print: 'طباعة حرارية فائقة الدقة',

    cat_all: 'كل المنتجات',
    cat_tshirts: 'تيشيرتات فاخرة',
    cat_hoodies: 'هوديز وسويت شيرت',
    cat_mugs: 'أكواب سيراميك',
    cat_customizable: 'منتجات قابلة للتخصيص',
    starting_from: 'ابتداءً من',
    customize_now: 'تخصيص هذا المنتج',
    view_products: 'تصفح المنتجات',

    badge_best_seller: 'الأكثر طلباً',
    badge_new: 'جديد',
    badge_customizable: 'قابل للتخصيص',
    in_stock: 'متوفر',
    out_of_stock: 'نفذت الكمية',
    add_to_cart: 'إضافة إلى السلة',
    customize_btn: 'صمم صورتك الخاصة',

    customizer_title: 'استوديو التخصيص والطباعة المباشرة',
    customizer_subtitle: 'اختر اللون والمقاس وارفع تصميمك لمعاينته واقعياً على المنتج قبل الطلب',
    select_color: 'اختر اللون:',
    select_size: 'اختر المقاس:',
    upload_your_design: 'ارفع صورتك أو تصميمك الخاص',
    upload_hint: 'ندعم PNG (شفاف)، JPG، WEBP بدقة عالية حتى 10MB',
    upload_replace: 'تغيير الصورة',
    upload_remove: 'حذف',
    or_choose_gallery: 'أو اختر من تصاميمنا الجاهزة',
    custom_text: 'إضافة نص مطبوع (اختياري)',
    text_placeholder: 'اكتب اسمك، عبارتك المفضلة، أو سنة...',
    font_family: 'نوع الخط:',
    text_color: 'لون النص:',
    drag_resize_hint: 'يمكنك تحريك وتكبير وتدوير التصميم فوق القطعة',
    reset_position: 'إعادة توسيط',
    placement_front: 'الواجهة الأمامية',
    placement_back: 'الجهة الخلفية',
    special_instructions: 'ملاحظات خاصة للطباعة:',
    special_instructions_placeholder: 'مثال: اجعل التصميم بمستوى الصدر، يرجى إزالة الخلفية البيضاء...',
    add_custom_to_cart: 'تأكيد وحفظ بالسلة',

    cart_title: 'سلة المشتريات',
    cart_empty: 'سلتك فارغة حالياً',
    cart_empty_sub: 'اختر منتجاً أو صمم تيشيرتك الخاص وابدأ التسوق الآن!',
    start_shopping: 'تصفح المنتجات',
    subtotal: 'المجموع الفرعي',
    delivery_calculated_at_checkout: 'تكلفة التوصيل تحسب بدقة حسب ولايتك في الخطوة التالية',
    checkout_btn: 'المتابعة لإتمام الطلب',
    quantity: 'الكمية',
    remove: 'حذف',

    checkout_title: 'إتمام الطلب والدفع عند الاستلام',
    customer_info: '1. معلومات العميل للتواصل',
    full_name: 'الاسم واللقب الكامل *',
    full_name_placeholder: 'مثال: محمد بن علي',
    phone_number: 'رقم الهاتف *',
    phone_placeholder: '05XXXXXXXX أو 06XXXXXXXX أو 07XXXXXXXX',
    email_optional: 'البريد الإلكتروني (اختياري لتأكيد الطلب)',
    email_placeholder: 'example@gmail.com',
    delivery_info: '2. تفاصيل التوصيل والولاية',
    select_wilaya: 'اختر ولايتك (58 ولاية) *',
    choose_agency: 'اختر شركة التوصيل المناسبة لك *',
    delivery_method: 'طريقة الاستلام *',
    home_delivery: 'توصيل حتى باب المنزل',
    office_delivery: 'استلام من مكتب الشركة (Stop Desk)',
    home_delivery_desc: 'يقوم موظف التوصيل بإيصال الطرد إلى عنوانك السكني',
    office_delivery_desc: 'تستلم الطرد بنفسك من أقرب مكتب مع سعر توصيل مخفض',
    address_field: 'عنوان السكن بالتفصيل (الشارع، الحي، البلدية) *',
    address_placeholder: 'مثال: شارع الاستقلال، عمارة 4 شقة 12، بلدية...',
    coupon_code: 'رمز القسيمة أو التخفيض',
    coupon_placeholder: 'أدخل رمز الكوبون (مثل DZPRINT10)',
    apply_coupon: 'تطبيق',
    coupon_applied: 'تم تطبيق الخصم بنجاح!',
    coupon_invalid: 'رمز القسيمة غير صالح أو انتهت صلاحيته',
    order_summary: 'ملخص الحساب النهائي',
    delivery_fee: 'تكلفة التوصيل',
    discount: 'الخصم',
    total: 'المبلغ الإجمالي للدفع عند الاستلام',
    confirm_order: 'تأكيد وإرسال الطلب الآن',
    order_processing: 'جاري إنشاء وتسجيل طلبك بأمان...',
    agency_unavailable: 'شركة التوصيل هذه لا توفر تسعيرة حالياً لهذه الولاية',

    tracking_title: 'تتبع حالة طلبك ومسار الشحن',
    tracking_subtitle: 'أدخل رقم الطلب ورقم هاتفك المسجل لمعرفة المرحلة التي وصل إليها طلبك فوراً',
    order_number: 'رقم الطلب',
    order_number_placeholder: 'مثال: PRINT-2026-000123',
    track_button: 'بحث وتتبع الطلب',
    status_received: 'تم استلام الطلب',
    status_confirmed: 'تم التأكيد هاتفياً',
    status_preparing: 'قيد التجهيز',
    status_printing: 'قيد الطباعة والكبس',
    status_ready: 'الطلب جاهز للتسليم',
    status_shipped: 'تم الشحن مع الناقل',
    status_out_for_delivery: 'خرج للتوصيل اليوم',
    status_delivered: 'تم التوصيل بنجاح',
    status_cancelled: 'ملغى',
    status_timeline: 'مسار ومراحل تجهيز الطلب',
    delivery_details: 'بيانات شركة التوصيل والعنوان',
    order_date: 'تاريخ الطلب:',

    admin_portal: 'بوابة الإدارة والمشرف',
    admin_login: 'تسجيل دخول المشرف',
    admin_password: 'كلمة مرور لوحة التحكم',
    login_btn: 'دخول',
    logout_btn: 'تسجيل خروج',
    dashboard: 'لوحة المؤشرات',
    orders: 'الطلبات',
    products: 'المنتجات والمخزون',
    designs: 'معرض التصاميم',
    agencies_and_rates: 'شركات وأسعار التوصيل',
    delivery_matrix: 'مصفوفة أسعار الولايات',
    wilayas: 'الولايات الـ 58',
    coupons: 'كوبونات الخصم',
    settings: 'إعدادات المتجر',
    total_revenue: 'إجمالي المبيعات',
    total_orders: 'عدد الطلبات الكلي',
    avg_order: 'متوسط قيمة الطلب',
    pending_orders: 'طلبات قيد المعالجة',
    export_csv: 'تصدير الأسعار CSV',
    import_csv: 'استيراد أسعار CSV',
    save_changes: 'حفظ التعديلات',
    print_order: 'طباعة وصل الطلب',
    download_design: 'تحميل تصميم العميل',

    // Admin Tabs
    admin_tab_orders: 'الطلبات',
    admin_tab_production: 'الإنتاج والطباعة',
    admin_tab_inventory: 'المخزون والمواد',
    admin_tab_customers: 'الزبائن (CRM)',
    admin_tab_invoices: 'الفواتير والطلبيات',
    admin_tab_delivery: 'شركات التوصيل',
    admin_tab_products: 'المنتجات',
    admin_tab_designs: 'التصاميم',
    admin_tab_coupons: 'الكوبونات',
    admin_tab_analytics: 'الإحصائيات',
    admin_tab_landing_builder: 'منشئ الصفحة الرئيسية',
    admin_tab_settings: 'الإعدادات العامة',
    admin_tab_translations: 'اللغات والترجمات',

    // Landing Builder
    landing_builder_title: 'منشئ وتخصيص الصفحة الرئيسية',
    landing_builder_subtitle: 'تحكم بأقسام صفحة متجرك وترتيبها ومحتواها بثلاث لغات، مع حفظ المسودات والنشر الفوري',
    landing_save_draft: 'حفظ كمسودة',
    landing_publish: 'نشر الصفحة على المتجر',
    landing_published_badge: 'نسخة منشورة ومفعلة',
    landing_draft_badge: 'مسودة قيد التعديل',
    landing_add_section: 'إضافة قسم جديد',
    landing_preview_desktop: 'حاسوب',
    landing_preview_tablet: 'جهاز لوحي',
    landing_preview_mobile: 'هاتف محمول',
    landing_move_up: 'تحريك لأعلى',
    landing_move_down: 'تحريك لأسفل',
    landing_hide_section: 'إخفاء القسم',
    landing_show_section: 'إظهار القسم',
    landing_duplicate_section: 'تكرار القسم',
    landing_delete_section: 'حذف القسم',
    landing_edit_section: 'تعديل المحتوى والخيارات',
    landing_preview_mode: 'معاينة حية',
    landing_editor_mode: 'تعديل الأقسام',
    landing_draft_saved: 'تم حفظ المسودة بنجاح',
    landing_published_success: 'تم نشر التعديلات بنجاح على المتجر مباشرة!',
    landing_section_type_hero: 'واجهة البداية (Hero Banner)',
    landing_section_type_featured_products: 'المنتجات المميزة',
    landing_section_type_categories: 'تصنيفات المنتجات',
    landing_section_type_promo_banner: 'شريط ترويجي وكوبونات',
    landing_section_type_about: 'من نحن وقصة الورشة',
    landing_section_type_services: 'الميزات وضمانات الجودة',
    landing_section_type_testimonials: 'آراء وتقييمات العملاء',
    landing_section_type_faq: 'الأسئلة الشائعة والأجوبة',
    landing_section_type_contact: 'معلومات الاتصال وخريطة الولايات',
    landing_section_type_custom_text_image: 'نص مخصص وصورة جانبية',
    landing_section_type_cta: 'شريط الحث على الشراء (CTA)',

    // Product Images
    product_images: 'صور المنتج',
    product_upload_images: 'رفع صور من الجهاز',
    product_drop_images: 'اسحب الصور هنا أو انقر للاختيار من جهازك',
    product_primary_image: 'الصورة الرئيسية (الغلاف)',
    product_set_primary: 'تعيين كغلاف رئيسي',
    product_remove_image: 'حذف الصورة',
    product_replace_image: 'استبدال الصورة',
    product_uploading: 'جاري رفع وحفظ الصورة...',
    product_name_ar: 'اسم المنتج (عربي)',
    product_name_fr: 'اسم المنتج (فرنسي)',
    product_name_en: 'اسم المنتج (إنجليزي)',
    product_desc_ar: 'وصف المنتج (عربي)',
    product_desc_fr: 'وصف المنتج (فرنسي)',
    product_desc_en: 'وصف المنتج (إنجليزي)',

    // Content Translations
    translations_title: 'إدارة المحتوى والترجمات اللغوية',
    translations_subtitle: 'أدخل النصوص باللغات الثلاث (عربي، فرنسي، إنجليزي) لتعمل تلقائياً عند تغيير لغة المتجر',
    trans_store_name: 'اسم المتجر والعلامة',
    trans_store_desc: 'وصف المتجر المختصر',
    trans_hero_headline: 'العنوان الرئيسي للبوابة',
    trans_hero_subheadline: 'العنوان الفرعي التوضيحي',
    trans_hero_cta: 'نص زر الطلب والتخصيص',
    trans_about: 'نبذة عن المتجر وخدمات الطباعة',
    trans_faq: 'الأسئلة الشائعة وتوضيحات التوصيل',
    trans_categories: 'ترجمة أسماء التصنيفات',
    trans_save_success: 'تم حفظ الترجمات بنجاح في قاعدة البيانات',
    trans_tab_ar: 'العربية (AR)',
    trans_tab_fr: 'الفرنسية (FR)',
    trans_tab_en: 'الإنجليزية (EN)',

    // Multi-Store
    store_selector: 'المتجر النشط',
    store_main: 'ديزاد برينت (المتجر الرئيسي)',
    store_isolated_note: 'البيانات معزولة لكل متجر بشكل مستقل عبر قاعدة البيانات',
    store_create_new: 'إنشاء متجر جديد',

    currency: 'دج',
    contact_whatsapp: 'تواصل عبر واتساب',
    order_via_whatsapp: 'اطلب مباشرة عبر واتساب',

    auth_sign_in: 'تسجيل الدخول',
    auth_sign_up: 'إنشاء حساب جديد',
    auth_create_account: 'إنشاء متجر وحساب مسؤول',
    auth_forgot_password: 'نسيت كلمة المرور؟',
    auth_reset_password: 'إعادة تعيين كلمة المرور',
    auth_reset_link_sent: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني',
    auth_email: 'البريد الإلكتروني',
    auth_password: 'كلمة المرور',
    auth_new_password: 'كلمة المرور الجديدة',
    auth_confirm_password: 'تأكيد كلمة المرور',
    auth_full_name: 'الاسم الكامل',
    auth_store_name: 'اسم المتجر أو المطبعة',
    auth_store_slug: 'رابط المتجر (Slug)',
    auth_dont_have_account: 'ليس لديك حساب؟ سجّل متجرك الآن',
    auth_already_have_account: 'لديك حساب بالفعل؟ سجّل دخولك',
    auth_remember_password: 'تذكرت كلمة المرور؟ العودة للدخول',
    auth_send_reset_link: 'إرسال رابط الاستعادة',
    auth_role_owner: 'مالك المتجر (Owner)',
    auth_role_admin: 'مدير (Admin)',
    auth_role_staff: 'عضو فريق (Staff)',
    auth_account_settings: 'إعدادات الحساب وكلمة المرور',
    admin_tab_store_settings: 'إعدادات المتجر والشعار',
    admin_tab_account_settings: 'إعدادات الحساب والأمان',
    admin_registered_admin: 'المسؤول المسجل:',
    admin_view_store: 'عرض المتجر',
    admin_secure_logout: 'تسجيل الخروج الآمن',
    admin_console_title: 'لوحة الإدارة الشاملة (DzPrint Admin Console)',
  },

  fr: {
    nav_home: 'Accueil',
    nav_shop: 'Boutique',
    nav_tshirts: 'T-Shirts',
    nav_hoodies: 'Hoodies',
    nav_mugs: 'Mugs',
    nav_best_sellers: 'Meilleures Ventes',
    nav_custom_design: 'Studio Personnalisation',
    nav_designs: 'Galerie Designs',
    nav_about: 'À propos',
    nav_contact: 'Contact',
    nav_track_order: 'Suivre ma commande',
    nav_cart: 'Panier',
    nav_admin: 'Administration',
    search_placeholder: 'Rechercher un produit, hoodie, mug ou design...',

    hero_title_badge: '🇩🇿 Impression Textile & Objets Premium en Algérie',
    hero_cta_custom: 'Créer un produit personnalisé',
    hero_cta_shop: 'Voir les meilleures ventes',
    hero_trust_58wilayas: 'Livraison 58 Wilayas',
    hero_trust_cotton: '100% Coton Supérieur',
    hero_trust_print: 'Impression DTF Haute Définition',

    cat_all: 'Tous les produits',
    cat_tshirts: 'T-Shirts Premium',
    cat_hoodies: 'Sweats à Capuche',
    cat_mugs: 'Mugs Céramique',
    cat_customizable: 'Articles Personnalisables',
    starting_from: 'À partir de',
    customize_now: 'Personnaliser ce produit',
    view_products: 'Voir les articles',

    badge_best_seller: 'Best Seller',
    badge_new: 'Nouveau',
    badge_customizable: 'Personnalisable',
    in_stock: 'En stock',
    out_of_stock: 'Épuisé',
    add_to_cart: 'Ajouter au panier',
    customize_btn: 'Personnaliser votre visuel',

    customizer_title: 'Studio de Personnalisation en Direct',
    customizer_subtitle: 'Choisissez la couleur, la taille et téléchargez votre image pour prévisualiser le rendu réel',
    select_color: 'Sélectionner la couleur :',
    select_size: 'Sélectionner la taille :',
    upload_your_design: 'Téléverser votre visuel ou image',
    upload_hint: 'Formats acceptés : PNG transparent, JPG, WEBP jusqu à 10 Mo',
    upload_replace: 'Remplacer l image',
    upload_remove: 'Supprimer',
    or_choose_gallery: 'Ou choisir un design de notre collection',
    custom_text: 'Ajouter un texte personnalisé (optionnel)',
    text_placeholder: 'Votre prénom, citation ou texte...',
    font_family: 'Police de caractères :',
    text_color: 'Couleur du texte :',
    drag_resize_hint: 'Vous pouvez glisser, redimensionner et tourner le visuel sur le mockup',
    reset_position: 'Centrer le visuel',
    placement_front: 'Face avant',
    placement_back: 'Dos / Face arrière',
    special_instructions: 'Instructions d impression particulières :',
    special_instructions_placeholder: 'Ex : placer au niveau du cœur, enlever le fond blanc...',
    add_custom_to_cart: 'Valider et ajouter au panier',

    cart_title: 'Votre Panier',
    cart_empty: 'Votre panier est vide',
    cart_empty_sub: 'Personnalisez un t-shirt, sweat ou mug pour commencer !',
    start_shopping: 'Découvrir la boutique',
    subtotal: 'Sous-total',
    delivery_calculated_at_checkout: 'Frais de livraison calculés à l étape suivante selon votre wilaya',
    checkout_btn: 'Passer la commande',
    quantity: 'Quantité',
    remove: 'Supprimer',

    checkout_title: 'Finalisation de commande & Paiement à la livraison',
    customer_info: '1. Coordonnées de contact',
    full_name: 'Nom & Prénom complets *',
    full_name_placeholder: 'Ex : Mohamed Benali',
    phone_number: 'Numéro de téléphone *',
    phone_placeholder: '05XXXXXXXX / 06XXXXXXXX / 07XXXXXXXX',
    email_optional: 'Email (optionnel pour le reçu)',
    email_placeholder: 'exemple@gmail.com',
    delivery_info: '2. Choix de la Wilaya et Livraison',
    select_wilaya: 'Sélectionnez votre Wilaya (58 wilayas) *',
    choose_agency: 'Choisissez votre société de livraison *',
    delivery_method: 'Mode de livraison *',
    home_delivery: 'Livraison à domicile',
    office_delivery: 'Récupération au bureau (Stop Desk)',
    home_delivery_desc: 'Le livreur vous apporte votre colis à l adresse indiquée',
    office_delivery_desc: 'Récupérez votre colis au bureau relais à tarif préférentiel',
    address_field: 'Adresse complète (Rue, Bâtiment, Commune) *',
    address_placeholder: 'Ex : Cité 500 logts, Bâtiment B, Apt 12...',
    coupon_code: 'Code promo / Bon de réduction',
    coupon_placeholder: 'Ex : DZPRINT10',
    apply_coupon: 'Appliquer',
    coupon_applied: 'Code promo validé avec succès !',
    coupon_invalid: 'Code promo invalide ou expiré',
    order_summary: 'Récapitulatif de la commande',
    delivery_fee: 'Frais de livraison',
    discount: 'Remise',
    total: 'Total à payer à la livraison',
    confirm_order: 'Confirmer ma commande',
    order_processing: 'Validation et enregistrement en cours...',
    agency_unavailable: 'Cette agence ne dessert pas cette wilaya actuellement',

    tracking_title: 'Suivi de commande en temps réel',
    tracking_subtitle: 'Indiquez votre numéro de commande et votre numéro de téléphone pour voir l avancement',
    order_number: 'Numéro de commande',
    order_number_placeholder: 'Ex : PRINT-2026-000123',
    track_button: 'Rechercher la commande',
    status_received: 'Commande reçue',
    status_confirmed: 'Confirmée par téléphone',
    status_preparing: 'En cours de préparation',
    status_printing: 'En cours d impression',
    status_ready: 'Prête pour expédition',
    status_shipped: 'Expédiée / Prise en charge',
    status_out_for_delivery: 'En cours de livraison',
    status_delivered: 'Livrée avec succès',
    status_cancelled: 'Annulée',
    status_timeline: 'Historique et statut du colis',
    delivery_details: 'Détails du transporteur & Destination',
    order_date: 'Date de commande :',

    admin_portal: 'Portail d Administration',
    admin_login: 'Connexion Administrateur',
    admin_password: 'Mot de passe administrateur',
    login_btn: 'Se connecter',
    logout_btn: 'Déconnexion',
    dashboard: 'Tableau de bord',
    orders: 'Commandes',
    products: 'Produits & Stocks',
    designs: 'Galerie de Designs',
    agencies_and_rates: 'Agences & Tarifs de Livraison',
    delivery_matrix: 'Matrice des Tarifs par Wilaya',
    wilayas: 'Gestion des 58 Wilayas',
    coupons: 'Codes Promo',
    settings: 'Paramètres du site',
    total_revenue: 'Chiffre d affaires',
    total_orders: 'Commandes totales',
    avg_order: 'Panier moyen',
    pending_orders: 'Commandes en attente',
    export_csv: 'Exporter Tarifs CSV',
    import_csv: 'Importer Tarifs CSV',
    save_changes: 'Enregistrer les modifications',
    print_order: 'Imprimer le bon de commande',
    download_design: 'Télécharger le fichier client',

    // Admin Tabs
    admin_tab_orders: 'Commandes',
    admin_tab_production: 'Atelier & Impression',
    admin_tab_inventory: 'Stock & Fournitures',
    admin_tab_customers: 'Clients (CRM)',
    admin_tab_invoices: 'Factures & Devis',
    admin_tab_delivery: 'Tarifs & Livraisons',
    admin_tab_products: 'Produits',
    admin_tab_designs: 'Designs',
    admin_tab_coupons: 'Codes Promo',
    admin_tab_analytics: 'Statistiques',
    admin_tab_landing_builder: 'Créateur Page d Accueil',
    admin_tab_settings: 'Paramètres',
    admin_tab_translations: 'Langues & Contenus',

    // Landing Builder
    landing_builder_title: 'Créateur Visuel de la Page d Accueil',
    landing_builder_subtitle: 'Gérez vos sections, réorganisez-les, éditez les textes en 3 langues et publiez en 1 clic',
    landing_save_draft: 'Enregistrer brouillon',
    landing_publish: 'Publier sur la boutique',
    landing_published_badge: 'Version en ligne',
    landing_draft_badge: 'Mode brouillon',
    landing_add_section: 'Ajouter une section',
    landing_preview_desktop: 'Ordinateur',
    landing_preview_tablet: 'Tablette',
    landing_preview_mobile: 'Mobile',
    landing_move_up: 'Monter',
    landing_move_down: 'Descendre',
    landing_hide_section: 'Masquer',
    landing_show_section: 'Afficher',
    landing_duplicate_section: 'Dupliquer',
    landing_delete_section: 'Supprimer',
    landing_edit_section: 'Modifier le contenu',
    landing_preview_mode: 'Aperçu en direct',
    landing_editor_mode: 'Éditeur de sections',
    landing_draft_saved: 'Brouillon sauvegardé avec succès',
    landing_published_success: 'Page publiée avec succès sur votre boutique en direct !',
    landing_section_type_hero: 'Bannière d Accueil (Hero)',
    landing_section_type_featured_products: 'Produits Vedettes',
    landing_section_type_categories: 'Catégories de Produits',
    landing_section_type_promo_banner: 'Bannière Promotionnelle & Codes',
    landing_section_type_about: 'À Propos & Notre Atelier',
    landing_section_type_services: 'Engagements & Avantages',
    landing_section_type_testimonials: 'Avis Clients Vérifiés',
    landing_section_type_faq: 'Questions Fréquentes (FAQ)',
    landing_section_type_contact: 'Coordonnées & Carte Wilayas',
    landing_section_type_custom_text_image: 'Texte Libre & Image',
    landing_section_type_cta: 'Appel à l Action (CTA)',

    // Product Images
    product_images: 'Galerie Photos du Produit',
    product_upload_images: 'Importer des images depuis l ordinateur',
    product_drop_images: 'Glissez-déposez vos photos ou cliquez pour parcourir',
    product_primary_image: 'Image Principale (Couverture)',
    product_set_primary: 'Définir comme principale',
    product_remove_image: 'Supprimer',
    product_replace_image: 'Remplacer l image',
    product_uploading: 'Envoi et hébergement en cours...',
    product_name_ar: 'Nom du produit (Arabe)',
    product_name_fr: 'Nom du produit (Français)',
    product_name_en: 'Nom du produit (Anglais)',
    product_desc_ar: 'Description (Arabe)',
    product_desc_fr: 'Description (Français)',
    product_desc_en: 'Description (Anglais)',

    // Content Translations
    translations_title: 'Gestion des Textes & Traductions',
    translations_subtitle: 'Renseignez les versions arabe, française et anglaise pour chaque section clé',
    trans_store_name: 'Nom de la boutique',
    trans_store_desc: 'Description courte',
    trans_hero_headline: 'Titre principal Hero',
    trans_hero_subheadline: 'Sous-titre explicatif',
    trans_hero_cta: 'Texte du bouton d action',
    trans_about: 'Texte de présentation de l atelier',
    trans_faq: 'Questions & Réponses fréquentes',
    trans_categories: 'Traductions des catégories',
    trans_save_success: 'Traductions enregistrées avec succès',
    trans_tab_ar: 'Arabe (AR)',
    trans_tab_fr: 'Français (FR)',
    trans_tab_en: 'Anglais (EN)',

    // Multi-Store
    store_selector: 'Boutique active',
    store_main: 'DZPrint (Boutique principale)',
    store_isolated_note: 'Données isolées et sécurisées par boutique',
    store_create_new: 'Créer une nouvelle boutique',

    currency: 'DA',
    contact_whatsapp: 'Contacter sur WhatsApp',
    order_via_whatsapp: 'Commander via WhatsApp',

    auth_sign_in: 'Connexion',
    auth_sign_up: 'Créer un compte',
    auth_create_account: 'Créer une boutique et un compte administrateur',
    auth_forgot_password: 'Mot de passe oublié ?',
    auth_reset_password: 'Réinitialiser le mot de passe',
    auth_reset_link_sent: 'Lien de réinitialisation envoyé à votre adresse e-mail',
    auth_email: 'Adresse e-mail',
    auth_password: 'Mot de passe',
    auth_new_password: 'Nouveau mot de passe',
    auth_confirm_password: 'Confirmer le mot de passe',
    auth_full_name: 'Nom complet',
    auth_store_name: 'Nom de la boutique',
    auth_store_slug: 'Identifiant URL (Slug)',
    auth_dont_have_account: "Pas encore de compte ? Créez votre boutique",
    auth_already_have_account: 'Vous avez déjà un compte ? Connectez-vous',
    auth_remember_password: 'Mot de passe retrouvé ? Se connecter',
    auth_send_reset_link: 'Envoyer le lien de réinitialisation',
    auth_role_owner: 'Propriétaire (Owner)',
    auth_role_admin: 'Administrateur (Admin)',
    auth_role_staff: 'Collaborateur (Staff)',
    auth_account_settings: 'Paramètres du compte & Sécurité',
    admin_tab_store_settings: 'Paramètres boutique & Logo',
    admin_tab_account_settings: 'Mon Compte & Mot de passe',
    admin_registered_admin: 'Administrateur connecté :',
    admin_view_store: 'Voir la boutique',
    admin_secure_logout: 'Déconnexion sécurisée',
    admin_console_title: "Console d'administration DzPrint",
  },

  en: {
    nav_home: 'Home',
    nav_shop: 'Shop',
    nav_tshirts: 'T-Shirts',
    nav_hoodies: 'Hoodies',
    nav_mugs: 'Mugs',
    nav_best_sellers: 'Best Sellers',
    nav_custom_design: 'Custom Studio',
    nav_designs: 'Design Gallery',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_track_order: 'Track Order',
    nav_cart: 'Cart',
    nav_admin: 'Admin Portal',
    search_placeholder: 'Search t-shirts, hoodies, mugs, or designs...',

    hero_title_badge: '🇩🇿 Premium Custom Apparel & Mugs in Algeria',
    hero_cta_custom: 'Create Your Custom Product',
    hero_cta_shop: 'Explore Best Sellers',
    hero_trust_58wilayas: 'Express Delivery in 58 Wilayas',
    hero_trust_cotton: '100% Heavyweight Cotton',
    hero_trust_print: 'Ultra HD DTF Printing',

    cat_all: 'All Products',
    cat_tshirts: 'Premium T-Shirts',
    cat_hoodies: 'Heavyweight Hoodies',
    cat_mugs: 'Ceramic Mugs',
    cat_customizable: 'Customizable Items',
    starting_from: 'Starting from',
    customize_now: 'Customize this item',
    view_products: 'Browse items',

    badge_best_seller: 'Best Seller',
    badge_new: 'New Arrival',
    badge_customizable: 'Customizable',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    add_to_cart: 'Add to Cart',
    customize_btn: 'Customize Your Design',

    customizer_title: 'Live Product Customization Studio',
    customizer_subtitle: 'Choose your color, size, and upload your artwork to see a live mockup before ordering',
    select_color: 'Select Color:',
    select_size: 'Select Size:',
    upload_your_design: 'Upload your image or logo',
    upload_hint: 'Supports PNG (transparent), JPG, WEBP up to 10MB',
    upload_replace: 'Replace Image',
    upload_remove: 'Remove',
    or_choose_gallery: 'Or pick from our pre-made designs',
    custom_text: 'Add Custom Printed Text (optional)',
    text_placeholder: 'Your name, club, or favorite quote...',
    font_family: 'Font Family:',
    text_color: 'Text Color:',
    drag_resize_hint: 'Drag, scale, and rotate your design directly on the product mockup',
    reset_position: 'Center Design',
    placement_front: 'Front Placement',
    placement_back: 'Back Placement',
    special_instructions: 'Special Printing Instructions:',
    special_instructions_placeholder: 'E.g. Center chest height, please remove white background...',
    add_custom_to_cart: 'Confirm and Add to Cart',

    cart_title: 'Shopping Cart',
    cart_empty: 'Your cart is empty',
    cart_empty_sub: 'Choose an item or customize your own hoodie/t-shirt now!',
    start_shopping: 'Explore Shop',
    subtotal: 'Subtotal',
    delivery_calculated_at_checkout: 'Delivery fee calculated based on your wilaya in checkout',
    checkout_btn: 'Proceed to Checkout',
    quantity: 'Quantity',
    remove: 'Remove',

    checkout_title: 'Checkout & Cash on Delivery',
    customer_info: '1. Customer Contact Details',
    full_name: 'Full Name *',
    full_name_placeholder: 'E.g. John Doe',
    phone_number: 'Phone Number *',
    phone_placeholder: '05XXXXXXXX / 06XXXXXXXX / 07XXXXXXXX',
    email_optional: 'Email Address (optional for order receipt)',
    email_placeholder: 'example@gmail.com',
    delivery_info: '2. Delivery & Wilaya Details',
    select_wilaya: 'Select Your Wilaya (58 Wilayas) *',
    choose_agency: 'Select Delivery Agency *',
    delivery_method: 'Delivery Method *',
    home_delivery: 'Home Delivery',
    office_delivery: 'Office Pickup (Stop Desk)',
    home_delivery_desc: 'Courier delivers straight to your residential doorstep',
    office_delivery_desc: 'Collect package from nearest agency depot with lower shipping fee',
    address_field: 'Detailed Address (Street, Building, Municipality) *',
    address_placeholder: 'E.g. 500 Housing Block B, Apt 12, Municipality...',
    coupon_code: 'Coupon / Promo Code',
    coupon_placeholder: 'Enter coupon (e.g. DZPRINT10)',
    apply_coupon: 'Apply',
    coupon_applied: 'Discount applied successfully!',
    coupon_invalid: 'Invalid or expired coupon code',
    order_summary: 'Order Payment Summary',
    delivery_fee: 'Delivery Fee',
    discount: 'Discount',
    total: 'Total Due on Delivery',
    confirm_order: 'Place Order Now',
    order_processing: 'Processing and securing your order...',
    agency_unavailable: 'No delivery rate configured for this agency and wilaya',

    tracking_title: 'Track Your Order',
    tracking_subtitle: 'Enter your order number and phone number to verify and check real-time progress',
    order_number: 'Order Number',
    order_number_placeholder: 'E.g. PRINT-2026-000123',
    track_button: 'Search & Track',
    status_received: 'Order Received',
    status_confirmed: 'Confirmed by phone',
    status_preparing: 'Preparing garment',
    status_printing: 'Printing & Pressing',
    status_ready: 'Ready for pickup',
    status_shipped: 'Handed to Courier',
    status_out_for_delivery: 'Out for Delivery Today',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
    status_timeline: 'Order Progress Timeline',
    delivery_details: 'Delivery & Shipping Information',
    order_date: 'Order Date:',

    admin_portal: 'Admin Portal',
    admin_login: 'Admin Sign In',
    admin_password: 'Admin Security Key',
    login_btn: 'Sign In',
    logout_btn: 'Sign Out',
    dashboard: 'Dashboard',
    orders: 'Orders',
    products: 'Products & Stock',
    designs: 'Design Gallery',
    agencies_and_rates: 'Agencies & Shipping Rates',
    delivery_matrix: 'Wilaya Delivery Matrix',
    wilayas: '58 Wilayas',
    coupons: 'Coupons',
    settings: 'Store Settings',
    total_revenue: 'Total Revenue',
    total_orders: 'Total Orders',
    avg_order: 'Avg Order Value',
    pending_orders: 'Pending Orders',
    export_csv: 'Export Rates CSV',
    import_csv: 'Import Rates CSV',
    save_changes: 'Save Changes',
    print_order: 'Print Order Sheet',
    download_design: 'Download Customer Design',

    // Admin Tabs
    admin_tab_orders: 'Orders',
    admin_tab_production: 'Production & Workshop',
    admin_tab_inventory: 'Inventory & Supplies',
    admin_tab_customers: 'Customers (CRM)',
    admin_tab_invoices: 'Invoices & Quotes',
    admin_tab_delivery: 'Delivery Rates',
    admin_tab_products: 'Products',
    admin_tab_designs: 'Designs Gallery',
    admin_tab_coupons: 'Promo Coupons',
    admin_tab_analytics: 'Analytics',
    admin_tab_landing_builder: 'Landing Page Builder',
    admin_tab_settings: 'Store Settings',
    admin_tab_translations: 'Languages & Content',

    // Landing Builder
    landing_builder_title: 'Visual Homepage Builder',
    landing_builder_subtitle: 'Customize, reorder sections, edit copy in 3 languages, and publish live',
    landing_save_draft: 'Save Draft',
    landing_publish: 'Publish to Live Store',
    landing_published_badge: 'Live Published Version',
    landing_draft_badge: 'Draft Mode',
    landing_add_section: 'Add New Section',
    landing_preview_desktop: 'Desktop View',
    landing_preview_tablet: 'Tablet View',
    landing_preview_mobile: 'Mobile View',
    landing_move_up: 'Move Up',
    landing_move_down: 'Move Down',
    landing_hide_section: 'Hide Section',
    landing_show_section: 'Show Section',
    landing_duplicate_section: 'Duplicate Section',
    landing_delete_section: 'Delete Section',
    landing_edit_section: 'Edit Content & Layout',
    landing_preview_mode: 'Live Preview',
    landing_editor_mode: 'Section Editor',
    landing_draft_saved: 'Draft saved successfully',
    landing_published_success: 'Homepage published successfully to your live storefront!',
    landing_section_type_hero: 'Hero Welcome Banner',
    landing_section_type_featured_products: 'Featured Products',
    landing_section_type_categories: 'Product Categories',
    landing_section_type_promo_banner: 'Promotional Banner & Coupons',
    landing_section_type_about: 'About Us & Workshop Story',
    landing_section_type_services: 'Trust Badges & Guarantees',
    landing_section_type_testimonials: 'Customer Reviews',
    landing_section_type_faq: 'Frequently Asked Questions (FAQ)',
    landing_section_type_contact: 'Contact Info & Wilaya Map',
    landing_section_type_custom_text_image: 'Custom Text & Image',
    landing_section_type_cta: 'Call to Action Banner',

    // Product Images
    product_images: 'Product Photos Gallery',
    product_upload_images: 'Upload Photos from Computer',
    product_drop_images: 'Drag & drop photos here, or click to browse files',
    product_primary_image: 'Primary Image (Thumbnail)',
    product_set_primary: 'Set as Primary',
    product_remove_image: 'Delete Photo',
    product_replace_image: 'Replace Photo',
    product_uploading: 'Uploading photo to cloud storage...',
    product_name_ar: 'Product Name (Arabic)',
    product_name_fr: 'Product Name (French)',
    product_name_en: 'Product Name (English)',
    product_desc_ar: 'Description (Arabic)',
    product_desc_fr: 'Description (French)',
    product_desc_en: 'Description (English)',

    // Content Translations
    translations_title: 'Content & Multilingual Translations',
    translations_subtitle: 'Enter Arabic, French, and English versions to adapt seamlessly when users switch languages',
    trans_store_name: 'Store Name',
    trans_store_desc: 'Short Store Description',
    trans_hero_headline: 'Hero Headline',
    trans_hero_subheadline: 'Hero Subheadline',
    trans_hero_cta: 'Hero Call to Action Button',
    trans_about: 'About Our Workshop',
    trans_faq: 'FAQ Questions & Answers',
    trans_categories: 'Categories Translations',
    trans_save_success: 'Translations saved successfully in database',
    trans_tab_ar: 'Arabic (AR)',
    trans_tab_fr: 'French (FR)',
    trans_tab_en: 'English (EN)',

    // Multi-Store
    store_selector: 'Active Store',
    store_main: 'DZPrint (Primary Store)',
    store_isolated_note: 'Data is strictly isolated per store via database',
    store_create_new: 'Create New Store',

    currency: 'DA',
    contact_whatsapp: 'Contact on WhatsApp',
    order_via_whatsapp: 'Order via WhatsApp',

    auth_sign_in: 'Sign In',
    auth_sign_up: 'Sign Up',
    auth_create_account: 'Create Store & Owner Account',
    auth_forgot_password: 'Forgot Password?',
    auth_reset_password: 'Reset Password',
    auth_reset_link_sent: 'Password reset link sent to your email',
    auth_email: 'Email Address',
    auth_password: 'Password',
    auth_new_password: 'New Password',
    auth_confirm_password: 'Confirm Password',
    auth_full_name: 'Full Name',
    auth_store_name: 'Store Name',
    auth_store_slug: 'Store URL Slug',
    auth_dont_have_account: "Don't have an account? Create your store",
    auth_already_have_account: 'Already have an account? Sign In',
    auth_remember_password: 'Remembered password? Back to login',
    auth_send_reset_link: 'Send Reset Link',
    auth_role_owner: 'Store Owner',
    auth_role_admin: 'Administrator',
    auth_role_staff: 'Staff Member',
    auth_account_settings: 'Account Settings & Security',
    admin_tab_store_settings: 'Store Settings & Branding',
    admin_tab_account_settings: 'Account & Password',
    admin_registered_admin: 'Logged in as:',
    admin_view_store: 'View Storefront',
    admin_secure_logout: 'Secure Sign Out',
    admin_console_title: 'DzPrint Admin Console',
  },
};
