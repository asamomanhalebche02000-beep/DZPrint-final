-- DZPrint Seed Data Migration for Supabase
-- Contains all 58 Algerian Wilayas, Delivery Agencies, Realistic Wilaya Rates, Products, Designs, Coupons, and CMS

-- 1. WILAYAS (All 58 Algerian Wilayas)
INSERT INTO public.wilayas (id, code, name_ar, name_fr, name_en, active) VALUES
(1, '01', 'أدرار', 'Adrar', 'Adrar', true),
(2, '02', 'الشلف', 'Chlef', 'Chlef', true),
(3, '03', 'الأغواط', 'Laghouat', 'Laghouat', true),
(4, '04', 'أم البواقي', 'Oum El Bouaghi', 'Oum El Bouaghi', true),
(5, '05', 'باتنة', 'Batna', 'Batna', true),
(6, '06', 'بجاية', 'Béjaïa', 'Bejaia', true),
(7, '07', 'بسكرة', 'Biskra', 'Biskra', true),
(8, '08', 'بشار', 'Béchar', 'Bechar', true),
(9, '09', 'البليدة', 'Blida', 'Blida', true),
(10, '10', 'البويرة', 'Bouira', 'Bouira', true),
(11, '11', 'تمنراست', 'Tamanrasset', 'Tamanrasset', true),
(12, '12', 'تبسة', 'Tébessa', 'Tebessa', true),
(13, '13', 'تلمسان', 'Tlemcen', 'Tlemcen', true),
(14, '14', 'تيارت', 'Tiaret', 'Tiaret', true),
(15, '15', 'تيزي وزو', 'Tizi Ouzou', 'Tizi Ouzou', true),
(16, '16', 'الجزائر', 'Alger', 'Algiers', true),
(17, '17', 'الجلفة', 'Djelfa', 'Djelfa', true),
(18, '18', 'جيجل', 'Jijel', 'Jijel', true),
(19, '19', 'سطيف', 'Sétif', 'Setif', true),
(20, '20', 'سعيدة', 'Saïda', 'Saida', true),
(21, '21', 'سكيكدة', 'Skikda', 'Skikda', true),
(22, '22', 'سيدي بلعباس', 'Sidi Bel Abbès', 'Sidi Bel Abbes', true),
(23, '23', 'عنابة', 'Annaba', 'Annaba', true),
(24, '24', 'قالمة', 'Guelma', 'Guelma', true),
(25, '25', 'قسنطينة', 'Constantine', 'Constantine', true),
(26, '26', 'المدية', 'Médéa', 'Medea', true),
(27, '27', 'مستغانم', 'Mostaganem', 'Mostaganem', true),
(28, '28', 'المسيلة', 'M''Sila', 'M''Sila', true),
(29, '29', 'معسكر', 'Mascara', 'Mascara', true),
(30, '30', 'ورقلة', 'Ouargla', 'Ouargla', true),
(31, '31', 'وهران', 'Oran', 'Oran', true),
(32, '32', 'البيض', 'El Bayadh', 'El Bayadh', true),
(33, '33', 'إليزي', 'Illizi', 'Illizi', true),
(34, '34', 'برج بوعريريج', 'Bordj Bou Arréridj', 'Bordj Bou Arreridj', true),
(35, '35', 'بومرداس', 'Boumerdès', 'Boumerdes', true),
(36, '36', 'الطارف', 'El Tarf', 'El Tarf', true),
(37, '37', 'تندوف', 'Tindouf', 'Tindouf', true),
(38, '38', 'تيسمسيلت', 'Tissemsilt', 'Tissemsilt', true),
(39, '39', 'الوادي', 'El Oued', 'El Oued', true),
(40, '40', 'خنشلة', 'Khenchela', 'Khenchela', true),
(41, '41', 'سوق أهراس', 'Souk Ahras', 'Souk Ahras', true),
(42, '42', 'تيبازة', 'Tipaza', 'Tipaza', true),
(43, '43', 'ميلة', 'Mila', 'Mila', true),
(44, '44', 'عين الدفلى', 'Aïn Defla', 'Ain Defla', true),
(45, '45', 'النعامة', 'Naâma', 'Naama', true),
(46, '46', 'عين تموشنت', 'Aïn Témouchent', 'Ain Temouchent', true),
(47, '47', 'غرداية', 'Ghardaïa', 'Ghardaia', true),
(48, '48', 'غليزان', 'Relizane', 'Relizane', true),
(49, '49', 'تيميمون', 'Timimoun', 'Timimoun', true),
(50, '50', 'برج باجي مختار', 'Bordj Badji Mokhtar', 'Bordj Badji Mokhtar', true),
(51, '51', 'أولاد جلال', 'Ouled Djellal', 'Ouled Djellal', true),
(52, '52', 'بني عباس', 'Béni Abbès', 'Beni Abbes', true),
(53, '53', 'عين صالح', 'In Salah', 'In Salah', true),
(54, '54', 'عين قزام', 'In Guezzam', 'In Guezzam', true),
(55, '55', 'تقرت', 'Touggourt', 'Touggourt', true),
(56, '56', 'جانت', 'Djanet', 'Djanet', true),
(57, '57', 'المغير', 'El M''Ghair', 'El M''Ghair', true),
(58, '58', 'المنيعة', 'El Meniaa', 'El Meniaa', true)
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;

-- 2. DELIVERY AGENCIES
INSERT INTO public.delivery_agencies (id, name, phone, website, notes, active, logo_url) VALUES
('yalidine', 'Yalidine Express', '0982 40 40 40', 'https://yalidine.app', 'شبكة توصيل سريعة تغطي 58 ولاية مع مكاتب استلام بكل الدوائر', true, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80'),
('procolis', 'Procolis Delivery', '0560 99 88 77', 'https://procolis.dz', 'توصيل منزلي سريع ومضمون مع تسليم مباشر وتأمين على البضائع', true, 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=120&auto=format&fit=crop&q=80'),
('maystro', 'Maystro Delivery', '0770 12 34 56', 'https://maystro-delivery.com', 'أسعار اقتصادية وتتبع شحنات فوري للمكتب والمنزل', true, 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=120&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone;

-- 3. SEED DELIVERY RATES FOR ALL 58 WILAYAS AND ALL AGENCIES
DO $$
DECLARE
  w RECORD;
  agency_id_val TEXT;
  h_price NUMERIC;
  o_price NUMERIC;
  eta_val TEXT;
  rate_id_val TEXT;
BEGIN
  FOR agency_id_val IN SELECT unnest(ARRAY['yalidine', 'procolis', 'maystro']) LOOP
    FOR w IN SELECT id FROM public.wilayas LOOP
      rate_id_val := 'rate_' || agency_id_val || '_' || w.id;
      
      -- Default rates
      h_price := 750;
      o_price := 500;
      eta_val := '2-4 أيام';

      -- Specific rules
      IF w.id = 16 THEN -- Algiers
        IF agency_id_val = 'yalidine' THEN h_price := 600; o_price := 400; eta_val := '24-48 ساعة';
        ELSIF agency_id_val = 'procolis' THEN h_price := 650; o_price := 400; eta_val := '24-48 ساعة';
        ELSE h_price := 550; o_price := 350; eta_val := '24-48 ساعة'; END IF;
      ELSIF w.id = 2 THEN -- Chlef (as explicitly documented: Yalidine Home: 700 / Office: 500)
        IF agency_id_val = 'yalidine' THEN h_price := 700; o_price := 500; eta_val := '2-3 أيام';
        ELSIF agency_id_val = 'procolis' THEN h_price := 800; o_price := 550; eta_val := '2-3 أيام';
        ELSE h_price := 750; o_price := 500; eta_val := '3-4 أيام'; END IF;
      ELSIF w.id IN (9, 35, 42) THEN -- Blida, Boumerdes, Tipaza
        IF agency_id_val = 'yalidine' THEN h_price := 650; o_price := 450; eta_val := '1-2 أيام';
        ELSIF agency_id_val = 'procolis' THEN h_price := 700; o_price := 450; eta_val := '1-2 أيام';
        ELSE h_price := 600; o_price := 400; eta_val := '1-2 أيام'; END IF;
      ELSIF w.id IN (31, 25, 19, 23) THEN -- Oran, Constantine, Setif, Annaba
        IF agency_id_val = 'yalidine' THEN h_price := 700; o_price := 450; eta_val := '2-3 أيام';
        ELSIF agency_id_val = 'procolis' THEN h_price := 750; o_price := 450; eta_val := '2-3 أيام';
        ELSE h_price := 650; o_price := 400; eta_val := '2-3 أيام'; END IF;
      ELSIF w.id IN (11, 33, 37, 50, 53, 54, 56) THEN -- Far South
        IF agency_id_val = 'yalidine' THEN h_price := 1200; o_price := 900; eta_val := '4-7 أيام';
        ELSIF agency_id_val = 'procolis' THEN h_price := 1350; o_price := 950; eta_val := '4-7 أيام';
        ELSE h_price := 1100; o_price := 850; eta_val := '5-8 أيام'; END IF;
      ELSIF w.id >= 47 THEN -- South / Oasis
        IF agency_id_val = 'yalidine' THEN h_price := 950; o_price := 700; eta_val := '3-5 أيام';
        ELSIF agency_id_val = 'procolis' THEN h_price := 1000; o_price := 750; eta_val := '3-5 أيام';
        ELSE h_price := 900; o_price := 650; eta_val := '3-6 أيام'; END IF;
      END IF;

      INSERT INTO public.delivery_rates (
        id, agency_id, wilaya_id, home_price, office_price, estimated_days, active, notes
      ) VALUES (
        rate_id_val, agency_id_val, w.id, h_price, o_price, eta_val, true, 'توصيل رسمي معتمد'
      )
      ON CONFLICT (agency_id, wilaya_id) DO UPDATE SET
        home_price = EXCLUDED.home_price,
        office_price = EXCLUDED.office_price,
        estimated_days = EXCLUDED.estimated_days;
    END LOOP;
  END LOOP;
END $$;

-- 4. CATEGORIES
INSERT INTO public.categories (id, name_ar, name_fr, slug, display_order) VALUES
('t-shirts', 'تيشيرتات مخصصة', 'T-Shirts Personnalisés', 't-shirts', 1),
('hoodies', 'هوديز وسويت شيرت', 'Hoodies & Sweatshirts', 'hoodies', 2),
('caps', 'قبعات وكاب', 'Casquettes', 'caps', 3),
('mugs', 'أكواب سحرية وخزف', 'Mugs & Tasses', 'mugs', 4),
('totebags', 'حقائب قماشية توت باق', 'Tote Bags Éco', 'totebags', 5)
ON CONFLICT (id) DO NOTHING;

-- 5. INITIAL PRODUCTS
INSERT INTO public.products (
  id, name, name_ar, name_fr, slug, category, sku, base_price, sale_price,
  description, description_ar, description_fr, mockup_template_url,
  images, colors, sizes, features, is_featured, active
) VALUES
(
  'prod-tshirt-custom',
  'تيشيرت قطن بريميوم مخصص',
  'تيشيرت قطن بريميوم مخصص',
  'T-Shirt Coton Premium Personnalisé',
  'custom-cotton-tshirt',
  't-shirts',
  'TSH-CUST-01',
  1800,
  1600,
  'تيشيرت قطني 100% عالي الجودة وزن 240 غرام. قماش فخم ناعم الملمس متين ومقاوم للغسيل مع طباعة DTF حرارية فائقة الدقة.',
  'تيشيرت قطني 100% عالي الجودة وزن 240 غرام. قماش فخم ناعم الملمس متين ومقاوم للغسيل مع طباعة DTF حرارية فائقة الدقة.',
  'T-shirt 100% coton peigné 240g. Confort exceptionnel, coupe moderne et impression haute définition résistante aux lavages.',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  '[{"name":"أسود الملكي","hex":"#111827"},{"name":"أبيض ناصع","hex":"#f9fafb"},{"name":"كحلي داكن","hex":"#1e3a8a"},{"name":"أخضر زيتي","hex":"#14532d"},{"name":"عنابي فاخر","hex":"#881337"}]'::jsonb,
  ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL'],
  ARRAY['قطن مصري ممشط 100% وزن 240 غرام', 'طباعة DTF رقمية بألوان حية ومقاومة للغسيل', 'قصة عصرية مريحة تناسب الجنسين'],
  true,
  true
),
(
  'prod-hoodie-heavyweight',
  'هودي شتوي مبطن فاخر',
  'هودي شتوي مبطن فاخر',
  'Hoodie Hiver Premium Molletonné',
  'heavyweight-custom-hoodie',
  'hoodies',
  'HOD-HEAV-01',
  3600,
  3200,
  'هودي شتوي دافئ وسميك وزن 380 غرام مع بطانة صوفية فائقة النعومة، جيب أمامي متسع وغطاء رأس مزدوج.',
  'هودي شتوي دافئ وسميك وزن 380 غرام مع بطانة صوفية فائقة النعومة، جيب أمامي متسع وغطاء رأس مزدوج.',
  'Hoodie chaud molletonné 380g avec capuche doublée et poche kangourou spacieuse.',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  '[{"name":"أسود كربوني","hex":"#0f172a"},{"name":"رمادي ميلانج","hex":"#64748b"},{"name":"أزرق بترولي","hex":"#0c4a6e"},{"name":"بيج رملي","hex":"#d6c7a1"}]'::jsonb,
  ARRAY['M', 'L', 'XL', '2XL', '3XL'],
  ARRAY['خامة صوفية داخلية سميكة 380 GSM دافئة جداً', 'رباط رأس معدني متين', 'طباعة تطريز أو حرارية تدوم لسنوات'],
  true,
  true
),
(
  'prod-ceramic-mug',
  'كوب خزفي سحري مخصص',
  'كوب خزفي سحري مخصص',
  'Mug Céramique Magique Personnalisé',
  'custom-ceramic-mug',
  'mugs',
  'MUG-MAG-01',
  1100,
  950,
  'كوب خزفي سحري يتغير لونه ليكشف عن تصميمك الرائع وصورتك المفضلة فور صب المشروبات الساخنة فيه.',
  'كوب خزفي سحري يتغير لونه ليكشف عن تصميمك الرائع وصورتك المفضلة فور صب المشروبات الساخنة فيه.',
  'Mug magique en céramique haute brillance. Révèle votre photo ou design personnalisé au contact de la chaleur.',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  '[{"name":"أسود كاشف للحرارة","hex":"#18181b"},{"name":"أبيض ناصع","hex":"#ffffff"}]'::jsonb,
  ARRAY['330ml (11 oz)'],
  ARRAY['طباعة تسامي حراري Sublimation 360 درجة', 'آمن للاستخدام في الميكروويف وغسالة الصحون', 'علبة هدايا كرتونية فاخرة متضمنة مجاناً'],
  false,
  true
),
(
  'prod-canvas-totebag',
  'حقيبة قماشية توت باق إيكو',
  'حقيبة قماشية توت باق إيكو',
  'Tote Bag Toile Coton Bio',
  'eco-canvas-totebag',
  'totebags',
  'TOT-ECO-01',
  900,
  750,
  'حقيبة تسوق قماشية صديقة للبيئة مصنوعة من كانفاس قطني سميك وقوي، ممتازة للجامعة والعمل والنشاطات اليومية.',
  'حقيبة تسوق قماشية صديقة للبيئة مصنوعة من كانفاس قطني سميك وقوي، ممتازة للجامعة والعمل والنشاطات اليومية.',
  'Tote bag écoresponsable en toile de coton épais renforcé. Pratique et durable pour le quotidien.',
  'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  '[{"name":"أوف وايت طبيعي","hex":"#fef3c7"},{"name":"أسود فحمي","hex":"#18181b"}]'::jsonb,
  ARRAY['38x42 cm'],
  ARRAY['كانفاس قطني متين 100%', 'مقابض مقواة مزدوجة تتحمل حتى 15 كغ', 'طباعة عالية الجودة غير قابلة للتقشر'],
  false,
  true
),
(
  'prod-embroidered-cap',
  'كاب بيسبول قطني مطرز',
  'كاب بيسبول قطني مطرز',
  'Casquette Baseball Coton Brodé',
  'custom-baseball-cap',
  'caps',
  'CAP-BASE-01',
  1400,
  1250,
  'كاب رياضي أنيق بـ 6 ألواح من القطن الممشط الفاخر مع شريط إغلاق خلفي قابل للتعديل وتطريز ثلاثي الأبعاد أو طباعة.',
  'كاب رياضي أنيق بـ 6 ألواح من القطن الممشط الفاخر مع شريط إغلاق خلفي قابل للتعديل وتطريز ثلاثي الأبعاد أو طباعة.',
  'Casquette de baseball en coton brossé avec boucle métallique réglable et broderie/impression soignée.',
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  '[{"name":"أسود كلاسيكي","hex":"#111827"},{"name":"أبيض","hex":"#ffffff"},{"name":"أحمر رياضي","hex":"#dc2626"},{"name":"أزرق ملكي","hex":"#2563eb"}]'::jsonb,
  ARRAY['مقاس موحد قابل للتعديل'],
  ARRAY['قطن 100% ثقيل مع فتحات تهوية مطرزة', 'شريط معدني عالي الجودة لضبط القياس', 'حافة منحنية متينة تحافظ على شكلها'],
  false,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 6. INITIAL ARTWORK DESIGNS
INSERT INTO public.designs (
  id, name, name_ar, slug, category, image_url, author, tags, compatible_products, is_trending, downloads_count, active
) VALUES
(
  'des-algeria-calligraphy',
  'الجزائر بخط الثلث الحر',
  'الجزائر بخط الثلث الحر',
  'algeria-thuluth-calligraphy',
  'calligraphy',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
  'خطاط الجزائري',
  ARRAY['خط عربي', 'الجزائر', 'ثلث', 'تراث'],
  ARRAY['prod-tshirt-custom', 'prod-hoodie-heavyweight', 'prod-canvas-totebag', 'prod-ceramic-mug'],
  true,
  342,
  true
),
(
  'des-fennec-warrior',
  'ثعلب الصحراء الفنك الفولكلوري',
  'ثعلب الصحراء الفنك الفولكلوري',
  'fennec-sahara-warrior',
  'folklore',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
  'ستوديو ديزاد',
  ARRAY['فنك', 'صحراء', 'المنتخب الوطني', '123 فيفا لالجيري'],
  ARRAY['prod-tshirt-custom', 'prod-hoodie-heavyweight', 'prod-embroidered-cap'],
  true,
  518,
  true
),
(
  'des-casbah-retro',
  'أزقة القصبة العتيقة ريترو',
  'أزقة القصبة العتيقة ريترو',
  'casbah-algiers-retro',
  'heritage',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
  'فنان القصبة',
  ARRAY['القصبة', 'الجزائر العاصمة', 'تراث أصيل', 'فينتاج'],
  ARRAY['prod-tshirt-custom', 'prod-canvas-totebag', 'prod-ceramic-mug'],
  false,
  210,
  true
),
(
  'des-tifinagh-amazigh',
  'الحرية - ياز بالأمازيغية والخط الإفريقي',
  'الحرية - ياز بالأمازيغية والخط الإفريقي',
  'tifinagh-yaz-freedom',
  'heritage',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
  'هوية جزائرية',
  ARRAY['أمازيغ', 'تيفيناغ', 'حرية', 'هوية'],
  ARRAY['prod-tshirt-custom', 'prod-hoodie-heavyweight', 'prod-embroidered-cap'],
  true,
  460,
  true
),
(
  'des-tassili-cave-art',
  'رسوم طاسيلي ناجر الصخرية الغامضة',
  'رسوم طاسيلي ناجر الصخرية الغامضة',
  'tassili-cave-rock-art',
  'history',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80',
  'طاسيلي ديزاين',
  ARRAY['طاسيلي', 'تاريخ قديم', 'الجنوب الكبير', 'سياحة'],
  ARRAY['prod-tshirt-custom', 'prod-hoodie-heavyweight', 'prod-ceramic-mug', 'prod-canvas-totebag'],
  false,
  185,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 7. INITIAL COUPONS
INSERT INTO public.coupons (
  id, code, type, value, min_order, max_discount, usage_limit, times_used, active
) VALUES
('coup_dzprint10', 'DZPRINT10', 'percentage', 10, 2000, 1000, 500, 34, true),
('coup_algeria2026', 'ALGERIA2026', 'fixed', 500, 4000, 500, 200, 12, true),
('coup_freedelivery', 'FREEWILAYA', 'percentage', 15, 5000, 1500, 100, 7, true)
ON CONFLICT (id) DO NOTHING;

-- 8. INITIAL SITE SETTINGS
INSERT INTO public.site_settings (
  id, store_name, phone, email, address, working_hours, announcement
) VALUES (
  'main_settings',
  'ديزاد برينت | DZPrint Custom Printing',
  '0550 12 34 56',
  'contact@dzprint.dz',
  'الجزائر العاصمة، بئر مراد رايس / ورشة الطباعة بالبليدة',
  'السبت - الخميس: 09:00 إلى 18:00',
  '🎉 عرض خاص: توصيل سريع متوفر لـ 58 ولاية جزائرية مع ضمان الجودة 100% وإمكانية الدفع عند الاستلام!'
)
ON CONFLICT (id) DO NOTHING;

-- 9. DEFAULT EMAIL TEMPLATES
INSERT INTO public.email_templates (id, template_key, name, subject, body_html) VALUES
(
  'tmpl_order_confirmation',
  'customer_order_confirmation',
  'تأكيد طلب العميل',
  'تأكيد استلام طلبك من متجر ديزاد برينت #{order_number}',
  '<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <h2 style="color: #f59e0b;">شكراً لطلبك من ديزاد برينت! 🎉</h2>
    <p>مرحباً <strong>{full_name}</strong>،</p>
    <p>تم تسجيل طلبك رقم <strong>{order_number}</strong> بنجاح. سيتصل بك فريقنا هاتفياً خلال ساعات لتأكيد المقاسات وتفاصيل التوصيل.</p>
    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p><strong>شركة التوصيل:</strong> {delivery_agency_name}</p>
      <p><strong>الولاية:</strong> {wilaya_name}</p>
      <p><strong>طريقة التوصيل:</strong> {delivery_method}</p>
      <p><strong>المبلغ الإجمالي عند الاستلام:</strong> {total} د.ج</p>
    </div>
    <p>يمكنك دائماً تتبع شحنتك عبر منصتنا برقم هاتفك ورقم طلبك.</p>
  </div>'
),
(
  'tmpl_admin_notification',
  'admin_new_order',
  'إشعار المشرف بطلب جديد',
  '🚨 طلب جديد وارد: #{order_number} — {full_name} ({total} DA)',
  '<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <h2 style="color: #2563eb;">وصل طلب جديد للمتجر!</h2>
    <p><strong>رقم الطلب:</strong> {order_number}</p>
    <p><strong>العميل:</strong> {full_name} | {phone} | {email}</p>
    <p><strong>الولاية:</strong> {wilaya_name}</p>
    <p><strong>شركة التوصيل:</strong> {delivery_agency_name} ({delivery_method})</p>
    <p><strong>العنوان:</strong> {delivery_address}</p>
    <p><strong>الإجمالي:</strong> {total} DA</p>
    <p><a href="{admin_url}" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">فتح لوحة التحكم لمعاينة المطبوعات والتفاصيل</a></p>
  </div>'
)
ON CONFLICT (id) DO NOTHING;
