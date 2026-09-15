import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Edit3,
  CheckCircle,
  Save,
  Globe,
  Upload,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { LandingSection, LandingSectionType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { adminFetch } from '../../lib/adminAuth';

const SECTION_TYPE_LABELS: Record<LandingSectionType, { label_ar: string; label_fr: string; label_en: string }> = {
  hero: { label_ar: 'الواجهة الترحيبية (Hero)', label_fr: 'Bannière Principale (Hero)', label_en: 'Hero Welcome Banner' },
  featured_products: { label_ar: 'المنتجات المميزة', label_fr: 'Produits Vedettes', label_en: 'Featured Products' },
  categories: { label_ar: 'أقسام المنتجات', label_fr: 'Catégories de Produits', label_en: 'Product Categories' },
  promo_banner: { label_ar: 'شريط العروض والخصومات', label_fr: 'Bannière Promotionnelle', label_en: 'Promotional Banner' },
  about: { label_ar: 'قصة ورشتنا (عن المتجر)', label_fr: 'À propos de notre atelier', label_en: 'About Our Workshop' },
  services: { label_ar: 'مزايا وضمانات الطباعة', label_fr: 'Services & Garanties', label_en: 'Trust & Services' },
  testimonials: { label_ar: 'آراء وتقييمات الزبائن', label_fr: 'Avis des Clients', label_en: 'Customer Reviews' },
  faq: { label_ar: 'الأسئلة الشائعة (FAQ)', label_fr: 'Foire Aux Questions (FAQ)', label_en: 'FAQ' },
  contact: { label_ar: 'معلومات الاتصال والشحن', label_fr: 'Contact & Livraison', label_en: 'Contact & Delivery' },
  custom_text_image: { label_ar: 'نص مخصص مع صورة', label_fr: 'Texte & Image Personnalisés', label_en: 'Custom Text & Image' },
  cta: { label_ar: 'دعوة للتنفيذ (CTA)', label_fr: 'Appel à l action (CTA)', label_en: 'Call to Action' },
};

const DEFAULT_SECTIONS: LandingSection[] = [
  {
    id: 'sec-hero-1',
    store_id: 'store-dzprint-default',
    type: 'hero',
    sort_order: 1,
    is_visible: true,
    content: {
      title_ar: 'أفضل منصة لطباعة التيشيرتات والأكواب في الجزائر',
      title_fr: 'La référence de l impression textile et objets en Algérie',
      title_en: 'Algeria s Leading Custom DTF Apparel & Mugs Platform',
      subtitle_ar: 'اطبع تصاميمك بجودة فائقة مع توصيل سريع لـ 58 ولاية والدفع عند الاستلام',
      subtitle_fr: 'Impression ultra haute définition DTF avec livraison 58 wilayas et paiement à la livraison',
      subtitle_en: 'High definition DTF printing with express delivery across all 58 Wilayas and Cash on Delivery',
      badge_ar: '🇩🇿 طباعة احترافية 100% جزائرية',
      badge_fr: '🇩🇿 Impression Professionnelle 100% Algérienne',
      badge_en: '🇩🇿 100% Algerian Professional Printing',
      btn_text_ar: 'صمّم منتجك الآن',
      btn_text_fr: 'Créer un produit personnalisé',
      btn_text_en: 'Design Your Product',
      btn_link: '#customizer',
      secondary_btn_text_ar: 'استكشف الكتالوج',
      secondary_btn_text_fr: 'Voir le catalogue',
      secondary_btn_text_en: 'Browse Catalog',
      secondary_btn_link: '#shop',
    },
  },
  {
    id: 'sec-services-2',
    store_id: 'store-dzprint-default',
    type: 'services',
    sort_order: 2,
    is_visible: true,
    content: {
      title_ar: 'لماذا يختارنا أكثر من 15,000 زبون؟',
      title_fr: 'Pourquoi plus de 15 000 clients nous font confiance ?',
      title_en: 'Why Over 15,000 Customers Trust Us',
    },
  },
  {
    id: 'sec-categories-3',
    store_id: 'store-dzprint-default',
    type: 'categories',
    sort_order: 3,
    is_visible: true,
    content: {
      title_ar: 'تشكيلاتنا الخام الجاهزة للتخصيص',
      title_fr: 'Nos collections prêtes à être personnalisées',
      title_en: 'Customizable Apparel & Drinkware Collections',
    },
  },
  {
    id: 'sec-featured-4',
    store_id: 'store-dzprint-default',
    type: 'featured_products',
    sort_order: 4,
    is_visible: true,
    content: {
      title_ar: 'الأكثر مبيعاً هذا الموسم',
      title_fr: 'Meilleures Ventes de la Saison',
      title_en: 'Top Selling Products This Season',
    },
  },
  {
    id: 'sec-promo-5',
    store_id: 'store-dzprint-default',
    type: 'promo_banner',
    sort_order: 5,
    is_visible: true,
    content: {
      title_ar: 'تخفيض 10% على كل طلبيات أكثر من 3 قطع',
      title_fr: '10% de réduction pour 3 articles ou plus',
      title_en: '10% OFF on all orders of 3 items or more',
      discount_code: 'DZPRINT10',
      discount_percent: 10,
    },
  },
  {
    id: 'sec-faq-6',
    store_id: 'store-dzprint-default',
    type: 'faq',
    sort_order: 6,
    is_visible: true,
    content: {
      title_ar: 'الأسئلة الأكثر تكراراً',
      title_fr: 'Questions Fréquentes',
      title_en: 'Frequently Asked Questions',
    },
  },
];

export const AdminLandingBuilder: React.FC = () => {
  const { t, language, isRtl } = useTheme();

  const [sections, setSections] = useState<LandingSection[]>([]);
  const [publishedSections, setPublishedSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editor modal state
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<'ar' | 'fr' | 'en'>('ar');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Preview device state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchLandingData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/landing');
      if (res.ok) {
        const data = await res.json();
        if (data.draft_sections && data.draft_sections.length > 0) {
          setSections(data.draft_sections);
        } else {
          setSections(DEFAULT_SECTIONS);
        }
        if (data.published_sections) {
          setPublishedSections(data.published_sections);
        }
      } else {
        setSections(DEFAULT_SECTIONS);
      }
    } catch {
      setSections(DEFAULT_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingData();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Reorder sections
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    // update sort_order
    updated.forEach((s, idx) => {
      s.sort_order = idx + 1;
    });

    setSections(updated);
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, is_visible: !s.is_visible } : s))
    );
  };

  // Duplicate Section
  const handleDuplicate = (section: LandingSection) => {
    const copy: LandingSection = {
      ...section,
      id: `sec-${section.type}-${Date.now()}`,
      sort_order: sections.length + 1,
      content: JSON.parse(JSON.stringify(section.content)),
    };
    setSections(prev => [...prev, copy]);
    showNotice('success', 'Section duplicated');
  };

  // Delete Section
  const handleDelete = (id: string) => {
    if (sections.length <= 1) {
      showNotice('error', 'Homepage must contain at least one section');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== id));
  };

  // Add Section
  const handleAddSection = (type: LandingSectionType) => {
    const newSec: LandingSection = {
      id: `sec-${type}-${Date.now()}`,
      store_id: 'store-dzprint-default',
      type,
      sort_order: sections.length + 1,
      is_visible: true,
      content: {
        title_ar: `قسم ${SECTION_TYPE_LABELS[type].label_ar}`,
        title_fr: `Section ${SECTION_TYPE_LABELS[type].label_fr}`,
        title_en: `${SECTION_TYPE_LABELS[type].label_en} Section`,
        subtitle_ar: '',
        subtitle_fr: '',
        subtitle_en: '',
      },
    };
    setSections(prev => [...prev, newSec]);
    setEditingSection(newSec);
  };

  // Save Draft to Server
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/landing/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) {
        showNotice('success', t.landing_draft_saved);
      } else {
        showNotice('error', 'Failed to save draft');
      }
    } catch {
      showNotice('error', 'Network error while saving draft');
    } finally {
      setSaving(false);
    }
  };

  // Publish to Live Store
  const handlePublish = async () => {
    setPublishing(true);
    try {
      // First save current draft
      await adminFetch('/api/admin/landing/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });

      // Then publish
      const res = await adminFetch('/api/admin/landing/publish', {
        method: 'POST',
      });
      if (res.ok) {
        setPublishedSections([...sections]);
        showNotice('success', t.landing_published_success);
      } else {
        showNotice('error', 'Failed to publish landing page');
      }
    } catch {
      showNotice('error', 'Network error while publishing');
    } finally {
      setPublishing(false);
    }
  };

  // Upload image in editor
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editingSection) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/admin/upload-asset', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditingSection(prev =>
          prev ? { ...prev, content: { ...prev.content, image_url: data.url } } : null
        );
      } else {
        showNotice('error', data.error || 'Failed to upload image');
      }
    } catch {
      showNotice('error', 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveEditedSection = () => {
    if (!editingSection) return;
    setSections(prev => prev.map(s => (s.id === editingSection.id ? editingSection : s)));
    setEditingSection(null);
  };

  const getSectionTitle = (section: LandingSection) => {
    const typeObj = SECTION_TYPE_LABELS[section.type];
    const typeLabel =
      language === 'ar' ? typeObj.label_ar : language === 'fr' ? typeObj.label_fr : typeObj.label_en;
    const userTitle =
      language === 'ar'
        ? section.content.title_ar
        : language === 'fr'
        ? section.content.title_fr
        : section.content.title_en;
    return userTitle || typeLabel;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-neutral-900 dark:text-white">
              {t.landing_builder_title}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {publishedSections.length > 0 ? t.landing_published_badge : t.landing_draft_badge}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t.landing_builder_subtitle}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isPreviewOpen
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t.landing_preview_mode}</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{t.landing_save_draft}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {publishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>{t.landing_publish}</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Preview Mode Drawer / Frame */}
      {isPreviewOpen && (
        <div className="p-4 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.landing_preview_mode} ({previewDevice})
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs ${previewDevice === 'desktop' ? 'bg-amber-500 text-white' : 'text-neutral-500'}`}
                title={t.landing_preview_desktop}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs ${previewDevice === 'tablet' ? 'bg-amber-500 text-white' : 'text-neutral-500'}`}
                title={t.landing_preview_tablet}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs ${previewDevice === 'mobile' ? 'bg-amber-500 text-white' : 'text-neutral-500'}`}
                title={t.landing_preview_mobile}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto py-2">
            <div
              className={`bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-300 dark:border-neutral-700 transition-all duration-300 overflow-hidden ${
                previewDevice === 'mobile'
                  ? 'w-[375px] min-h-[600px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] min-h-[600px]'
                  : 'w-full min-h-[600px]'
              }`}
            >
              <div className="p-4 space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                {sections
                  .filter(s => s.is_visible)
                  .map(s => {
                    const typeObj = SECTION_TYPE_LABELS[s.type];
                    return (
                      <div key={s.id} className="pt-4 first:pt-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold uppercase">
                          {typeObj.label_en}
                        </span>
                        <h4 className="text-base font-black text-neutral-900 dark:text-white mt-1">
                          {getSectionTitle(s)}
                        </h4>
                        {s.content.subtitle_en && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {language === 'ar'
                              ? s.content.subtitle_ar
                              : language === 'fr'
                              ? s.content.subtitle_fr
                              : s.content.subtitle_en}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Section List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <span className="text-xs font-bold text-neutral-500">
            {sections.length}{' '}
            {language === 'ar'
              ? 'أقسام مفعّلة'
              : language === 'fr'
              ? 'sections configurées'
              : 'configured sections'}
          </span>

          {/* Add Section Dropdown */}
          <div className="relative group">
            <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition">
              <Plus className="w-3.5 h-3.5" />
              <span>{t.landing_add_section}</span>
            </button>
            <div className="absolute end-0 top-full mt-1 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 hidden group-hover:block z-30">
              {(Object.keys(SECTION_TYPE_LABELS) as LandingSectionType[]).map(typeKey => {
                const item = SECTION_TYPE_LABELS[typeKey];
                const label =
                  language === 'ar' ? item.label_ar : language === 'fr' ? item.label_fr : item.label_en;
                return (
                  <button
                    key={typeKey}
                    onClick={() => handleAddSection(typeKey)}
                    className="w-full text-start px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">
              {language === 'ar'
                ? 'جاري تحميل الأقسام...'
                : language === 'fr'
                ? 'Chargement des sections...'
                : 'Loading sections...'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section, idx) => {
              const typeObj = SECTION_TYPE_LABELS[section.type];
              const badgeLabel =
                language === 'ar' ? typeObj.label_ar : language === 'fr' ? typeObj.label_fr : typeObj.label_en;

              return (
                <div
                  key={section.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition ${
                    section.is_visible
                      ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/60'
                      : 'bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 transition"
                        title={t.landing_move_up}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 transition"
                        title={t.landing_move_down}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-mono font-bold text-neutral-400 w-5">
                      #{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {getSectionTitle(section)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {badgeLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {section.is_visible
                          ? language === 'ar'
                            ? 'ظاهر في المتجر'
                            : language === 'fr'
                            ? 'Visible sur la boutique'
                            : 'Visible on live store'
                          : language === 'ar'
                          ? 'مخفي حالياً'
                          : language === 'fr'
                          ? 'Masqué'
                          : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  {/* Section Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleVisibility(section.id)}
                      className={`p-2 rounded-lg text-xs transition ${
                        section.is_visible
                          ? 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          : 'text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                      title={section.is_visible ? t.landing_hide_section : t.landing_show_section}
                    >
                      {section.is_visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>

                    <button
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg text-xs transition flex items-center gap-1"
                      title={t.landing_edit_section}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-xs font-bold">{t.landing_edit_section}</span>
                    </button>

                    <button
                      onClick={() => handleDuplicate(section)}
                      className="p-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-xs transition"
                      title={t.landing_duplicate_section}
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs transition"
                      title={t.landing_delete_section}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION EDITOR DRAWER / MODAL */}
      {/* ========================================================================= */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <button
              onClick={() => setEditingSection(null)}
              className="absolute top-5 end-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>{t.landing_edit_section}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {SECTION_TYPE_LABELS[editingSection.type].label_en}
              </p>
            </div>

            {/* Language Selector Tabs */}
            <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
              {(['ar', 'fr', 'en'] as const).map(lng => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setActiveLangTab(lng)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeLangTab === lng
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {lng === 'ar' ? t.trans_tab_ar : lng === 'fr' ? t.trans_tab_fr : t.trans_tab_en}
                </button>
              ))}
            </div>

            <div className="space-y-4 text-xs">
              {/* Multilingual Title */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Title ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={
                    activeLangTab === 'ar'
                      ? editingSection.content.title_ar || ''
                      : activeLangTab === 'fr'
                      ? editingSection.content.title_fr || ''
                      : editingSection.content.title_en || ''
                  }
                  onChange={e => {
                    const val = e.target.value;
                    setEditingSection(prev =>
                      prev
                        ? {
                            ...prev,
                            content: {
                              ...prev.content,
                              [`title_${activeLangTab}`]: val,
                            },
                          }
                        : null
                    );
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Multilingual Subtitle */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subtitle / Description ({activeLangTab.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={
                    activeLangTab === 'ar'
                      ? editingSection.content.subtitle_ar || ''
                      : activeLangTab === 'fr'
                      ? editingSection.content.subtitle_fr || ''
                      : editingSection.content.subtitle_en || ''
                  }
                  onChange={e => {
                    const val = e.target.value;
                    setEditingSection(prev =>
                      prev
                        ? {
                            ...prev,
                            content: {
                              ...prev.content,
                              [`subtitle_${activeLangTab}`]: val,
                            },
                          }
                        : null
                    );
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Badge text (for Hero, etc.) */}
              {(editingSection.type === 'hero' || editingSection.type === 'cta') && (
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Badge / Tagline ({activeLangTab.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={
                      activeLangTab === 'ar'
                        ? editingSection.content.badge_ar || ''
                        : activeLangTab === 'fr'
                        ? editingSection.content.badge_fr || ''
                        : editingSection.content.badge_en || ''
                    }
                    onChange={e => {
                      const val = e.target.value;
                      setEditingSection(prev =>
                        prev
                          ? {
                              ...prev,
                              content: {
                                ...prev.content,
                                [`badge_${activeLangTab}`]: val,
                              },
                            }
                          : null
                      );
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              )}

              {/* Button text & link */}
              {(editingSection.type === 'hero' || editingSection.type === 'cta' || editingSection.type === 'promo_banner') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Button Label ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={
                        activeLangTab === 'ar'
                          ? editingSection.content.btn_text_ar || ''
                          : activeLangTab === 'fr'
                          ? editingSection.content.btn_text_fr || ''
                          : editingSection.content.btn_text_en || ''
                      }
                      onChange={e => {
                        const val = e.target.value;
                        setEditingSection(prev =>
                          prev
                            ? {
                                ...prev,
                                content: {
                                  ...prev.content,
                                  [`btn_text_${activeLangTab}`]: val,
                                },
                              }
                            : null
                        );
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={editingSection.content.btn_link || '#shop'}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingSection(prev =>
                          prev
                            ? {
                                ...prev,
                                content: {
                                  ...prev.content,
                                  btn_link: val,
                                },
                              }
                            : null
                        );
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Promo Coupon settings */}
              {editingSection.type === 'promo_banner' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={editingSection.content.discount_code || ''}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        setEditingSection(prev =>
                          prev
                            ? {
                                ...prev,
                                content: {
                                  ...prev.content,
                                  discount_code: val,
                                },
                              }
                            : null
                        );
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={editingSection.content.discount_percent || 10}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setEditingSection(prev =>
                          prev
                            ? {
                                ...prev,
                                content: {
                                  ...prev.content,
                                  discount_percent: val,
                                },
                              }
                            : null
                        );
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload for Hero / About / Custom image */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Section Banner Image (Supabase Storage)
                </label>
                <div className="flex items-center gap-3">
                  {editingSection.content.image_url ? (
                    <img
                      src={editingSection.content.image_url}
                      alt="Section visual"
                      className="w-16 h-16 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700"
                    />
                  ) : null}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-white hover:file:bg-amber-600 cursor-pointer"
                    />
                  </div>
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedSection}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {t.save_changes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
