import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  CheckCircle,
  Tag,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Shirt,
  Layers,
  MapPin,
  Phone,
  Clock,
} from 'lucide-react';
import { LandingSection, Product } from '../types';
import { useTheme } from '../context/ThemeContext';
import { HeroBanner } from './HeroBanner';
import { ProductCatalog } from './ProductCatalog';
import { DesignsGallerySection } from './DesignsGallerySection';

interface DynamicLandingRendererProps {
  onStartCustomizing: () => void;
  onExploreCatalog: () => void;
  onSelectProduct: (product: Product) => void;
}

export const DynamicLandingRenderer: React.FC<DynamicLandingRendererProps> = ({
  onStartCustomizing,
  onExploreCatalog,
  onSelectProduct,
}) => {
  const { t, language, isRtl } = useTheme();
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/landing')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!mounted) return;
        if (data?.sections && Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections.filter((s: LandingSection) => s.is_visible));
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getLocalized = (obj: any, key: string) => {
    if (!obj) return '';
    if (language === 'ar') return obj[`${key}_ar`] || obj[key] || '';
    if (language === 'fr') return obj[`${key}_fr`] || obj[`${key}_en`] || obj[`${key}_ar`] || obj[key] || '';
    return obj[`${key}_en`] || obj[`${key}_fr`] || obj[`${key}_ar`] || obj[key] || '';
  };

  // If no sections in DB yet, render the standard homepage components
  if (sections.length === 0) {
    return (
      <div className="space-y-12">
        <HeroBanner
          onStartCustomizing={onStartCustomizing}
          onExploreCatalog={onExploreCatalog}
        />
        <ProductCatalog onSelectProduct={onSelectProduct} onCustomizeProduct={onStartCustomizing} />
        <DesignsGallerySection onSelectDesign={onStartCustomizing} />
      </div>
    );
  }

  // Render configured sections in exact sort order
  return (
    <div className="space-y-12">
      {sections.map(section => {
        switch (section.type) {
          case 'hero':
            return (
              <HeroBanner
                key={section.id}
                onStartCustomizing={onStartCustomizing}
                onExploreCatalog={onExploreCatalog}
              />
            );

          case 'services':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-amber-50/50 dark:bg-neutral-900 border border-amber-200/50 dark:border-neutral-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                        {language === 'ar'
                          ? 'شحن سريع لـ 58 ولاية'
                          : language === 'fr'
                          ? 'Livraison Express 58 Wilayas'
                          : 'Express Delivery Across 58 Wilayas'}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        {language === 'ar'
                          ? 'توصيل لباب المنزل أو Stop Desk مع ياليدين وبروكوليس بأسعار تفضيلية.'
                          : language === 'fr'
                          ? 'À domicile ou Stop Desk avec Yalidine & Procolis aux meilleurs tarifs.'
                          : 'Home delivery or agency pickup with top Algerian courier networks.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                        {language === 'ar'
                          ? 'طباعة DTF فائقة الدقة'
                          : language === 'fr'
                          ? 'Impression DTF Haute Définition'
                          : 'Ultra HD DTF Printing'}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        {language === 'ar'
                          ? 'أحبار فرنسية مقاومة للغسيل وأقمشة قطنية 100% لا تتأثر بمرور الوقت.'
                          : language === 'fr'
                          ? 'Encres résistantes au lavage et tissus 100% coton peigné.'
                          : 'Wash-proof inks and 100% combed cotton that stays soft wash after wash.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                        {language === 'ar'
                          ? 'الدفع عند الاستلام (COD)'
                          : language === 'fr'
                          ? 'Paiement à la Livraison'
                          : 'Cash on Delivery Guarantee'}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        {language === 'ar'
                          ? 'تحقق من جودة مطبوعاتك ومقاسك قبل الدفع للموزع.'
                          : language === 'fr'
                          ? 'Vérifiez la conformité de votre commande avant de payer le livreur.'
                          : 'Inspect your customized package before paying the courier.'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'promo_banner':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/20">
                  <div className="space-y-1 text-center sm:text-start">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {language === 'ar' ? 'عرض خاص' : language === 'fr' ? 'Offre Spéciale' : 'Special Promo'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black">
                      {getLocalized(section.content, 'title') || 'تخفيض 10% على كل طلبيات أكثر من 3 قطع'}
                    </h3>
                    <p className="text-xs text-white/90">
                      {getLocalized(section.content, 'subtitle') ||
                        'استخدم الكود عند الدفع أو اطلب مباشرة مع خدمة العملاء'}
                    </p>
                  </div>
                  {section.content.discount_code && (
                    <div className="bg-white text-amber-600 font-mono font-black text-sm px-5 py-2.5 rounded-2xl shadow-sm tracking-widest uppercase">
                      {section.content.discount_code}
                    </div>
                  )}
                </div>
              </section>
            );

          case 'categories':
          case 'featured_products':
            return (
              <ProductCatalog
                key={section.id}
                onSelectProduct={onSelectProduct}
                onCustomizeProduct={onStartCustomizing}
              />
            );

          case 'about':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                      {getLocalized(section.content, 'title') || 'عن ورشة ديزاد برينت'}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {getLocalized(section.content, 'subtitle') ||
                        'نحن رواد صناعة وتخصيص الملابس الجاهزة والأكواب في الجزائر. نمتلك أحدث طابعات DTF الصناعية ومكابس هوائية دقيقة تضمن ثبات الألوان لسنوات.'}
                    </p>
                  </div>
                  {section.content.image_url ? (
                    <img
                      src={section.content.image_url}
                      alt="About workshop"
                      className="rounded-2xl object-cover w-full h-64 shadow-md"
                    />
                  ) : (
                    <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 h-64 flex items-center justify-center text-neutral-400">
                      <Shirt className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </section>
            );

          case 'testimonials':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    {getLocalized(section.content, 'title') || 'ماذا يقول زبائننا عبر الوطن؟'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'أمين ب.',
                      city: 'الجزائر العاصمة',
                      comment:
                        'جودة التيشيرت قطن ثقيل ممتاز والطباعة دقيقة جداً حتى مع غسله عدة مرات. شكراً لكم.',
                      rating: 5,
                    },
                    {
                      name: 'ياسمين م.',
                      city: 'وهران',
                      comment:
                        'خدمة التوصيل سريعة مع ياليدين خلال يومين، والهودي دافئ والألوان مطابقة للتصميم في الموقع.',
                      rating: 5,
                    },
                    {
                      name: 'كريم ع.',
                      city: 'قسنطينة',
                      comment:
                        'طلبت مجات مطبوعة لشركة مصغرة، التغليف كان ممتاز والدفع عند الاستلام مريح جداً.',
                      rating: 5,
                    },
                  ].map((rev, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                    >
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, rIdx) => (
                          <Star key={rIdx} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        "{rev.comment}"
                      </p>
                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[11px] text-neutral-400">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {rev.name}
                        </span>
                        <span>{rev.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'faq':
            return (
              <section key={section.id} className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    {getLocalized(section.content, 'title') || t.landing_section_type_faq}
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      q_ar: 'كم يستغرق تجهيز وتوصيل الطلبية؟',
                      q_fr: 'Quels sont les délais de fabrication et de livraison ?',
                      q_en: 'How long does printing and delivery take?',
                      a_ar: 'تتم الطباعة والتجهيز في نفس يوم تأكيد الطلب، ويصلك الطرد خلال 24 إلى 48 ساعة للشمال، و3 إلى 5 أيام لولايات الجنوب.',
                      a_fr: 'Votre commande est imprimée sous 24h et livrée sous 1 à 2 jours au Nord et 3 à 5 jours au Sud.',
                      a_en: 'Printed and pressed within 24h, delivered in 1-2 days to North Wilayas and 3-5 days to South.',
                    },
                    {
                      q_ar: 'هل يمكنني معاينة الطرد قبل الدفع؟',
                      q_fr: 'Puis-je vérifier le colis avant de payer ?',
                      q_en: 'Can I inspect my package before paying?',
                      a_ar: 'نعم بالتأكيد! يمكنك فتح الطرد وفحص جودة الطباعة ومقاس التيشيرت قبل دفع المبلغ للموزع.',
                      a_fr: 'Oui tout à fait ! Vous avez le droit d ouvrir et vérifier vos articles avant le paiement au livreur.',
                      a_en: 'Yes! You can inspect your garments and printing quality before paying the courier.',
                    },
                    {
                      q_ar: 'ما هي صيغ الصور المقبولة للتصميم؟',
                      q_fr: 'Quels formats d images sont acceptés ?',
                      q_en: 'What image formats do you accept?',
                      a_ar: 'نقبل PNG بخلفية شفافة، أو JPG، WEBP بدقة عالية لضمان أفضل نتيجة طباعة.',
                      a_fr: 'Nous acceptons PNG transparent, JPG et WEBP haute résolution.',
                      a_en: 'We accept high resolution PNG (transparent), JPG, and WEBP files.',
                    },
                  ].map((faqItem, fIdx) => (
                    <div
                      key={fIdx}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === fIdx ? null : fIdx)}
                        className="w-full p-4 text-start font-bold text-xs sm:text-sm text-neutral-900 dark:text-white flex justify-between items-center"
                      >
                        <span>
                          {language === 'ar'
                            ? faqItem.q_ar
                            : language === 'fr'
                            ? faqItem.q_fr
                            : faqItem.q_en}
                        </span>
                        {expandedFaq === fIdx ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                      {expandedFaq === fIdx && (
                        <div className="px-4 pb-4 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-3">
                          {language === 'ar'
                            ? faqItem.a_ar
                            : language === 'fr'
                            ? faqItem.a_fr
                            : faqItem.a_en}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'cta':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 dark:bg-neutral-800 text-white text-center space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-black">
                    {getLocalized(section.content, 'title') || 'جاهز لتحويل فكرتك إلى حقيقة؟'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
                    {getLocalized(section.content, 'subtitle') ||
                      'استخدم استوديو التخصيص المباشر واختر تصميمك المفضل الآن'}
                  </p>
                  <button
                    onClick={onStartCustomizing}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 transition inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.customize_now}</span>
                  </button>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
