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

  // General
  currency: string;
  contact_whatsapp: string;
  order_via_whatsapp: string;
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

    currency: 'دج',
    contact_whatsapp: 'تواصل عبر واتساب',
    order_via_whatsapp: 'اطلب مباشرة عبر واتساب',
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

    currency: 'DA',
    contact_whatsapp: 'Contacter sur WhatsApp',
    order_via_whatsapp: 'Commander via WhatsApp',
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

    currency: 'DA',
    contact_whatsapp: 'Contact on WhatsApp',
    order_via_whatsapp: 'Order via WhatsApp',
  },
};
