import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  Store,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Globe,
  Share2,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  ShieldCheck,
  Monitor,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { adminFetch } from '../../lib/adminAuth';
import { useTheme } from '../../context/ThemeContext';

interface AdminStoreSettingsProps {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  onSave: () => void;
  isSaving: boolean;
}

export const AdminStoreSettings: React.FC<AdminStoreSettingsProps> = ({
  settings,
  setSettings,
  onSave,
  isSaving,
}) => {
  const { t, language, isRtl } = useTheme();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActiveLogo, setDragActiveLogo] = useState(false);
  const [dragActiveFavicon, setDragActiveFavicon] = useState(false);

  // Upload asset to Supabase Storage via backend
  const handleUploadFile = async (file: File, assetType: 'logo' | 'favicon') => {
    if (assetType === 'logo') {
      setIsUploadingLogo(true);
    } else {
      setIsUploadingFavicon(true);
    }
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('asset_type', assetType);

      const res = await adminFetch('/api/admin/upload-asset', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (language === 'ar' ? 'فشل رفع الملف إلى التخزين السحابي' : language === 'fr' ? 'Échec du téléversement du fichier' : 'Failed to upload file to cloud storage'));
      }

      if (assetType === 'logo') {
        setSettings(prev => (prev ? { ...prev, logo_url: data.url } : null));
        setUploadSuccess(
          language === 'ar'
            ? 'تم رفع شعار المتجر بنجاح إلى Supabase Storage وحفظ الرابط!'
            : language === 'fr'
            ? 'Logo de la boutique téléversé avec succès sur Supabase Storage !'
            : 'Store logo uploaded successfully to Supabase Storage!'
        );
      } else {
        setSettings(prev => (prev ? { ...prev, favicon_url: data.url } : null));
        setUploadSuccess(
          language === 'ar'
            ? 'تم رفع أيقونة المتصفح (Favicon) بنجاح إلى Supabase Storage!'
            : language === 'fr'
            ? 'Favicon téléversé avec succès sur Supabase Storage !'
            : 'Browser icon (Favicon) uploaded successfully to Supabase Storage!'
        );
      }
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err.message || (language === 'ar' ? 'حدث خطأ أثناء رفع الملف' : language === 'fr' ? 'Une erreur est survenue' : 'An error occurred while uploading'));
    } finally {
      if (assetType === 'logo') {
        setIsUploadingLogo(false);
      } else {
        setIsUploadingFavicon(false);
      }
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0], 'logo');
    }
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0], 'favicon');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, assetType: 'logo' | 'favicon') => {
    e.preventDefault();
    e.stopPropagation();
    if (assetType === 'logo') {
      setDragActiveLogo(false);
    } else {
      setDragActiveFavicon(false);
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0], assetType);
    }
  };

  const currentStoreName =
    settings.business_name_ar || settings.store_name || settings.business_name || (language === 'ar' ? 'ديزاد برينت' : 'DzPrint');

  return (
    <div className="space-y-8 text-xs">
      {/* Upload Messages Banner */}
      {uploadSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VISUAL BRANDING: LOGO & FAVICON */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                {language === 'ar'
                  ? 'الهوية البصرية للمتجر (Logo & Favicon)'
                  : language === 'fr'
                  ? 'Identité Visuelle de la Boutique (Logo & Favicon)'
                  : 'Store Visual Branding (Logo & Favicon)'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {language === 'ar'
                  ? 'يتم رفع الملفات مباشرة وتخزينها في Supabase Storage وربطها بقاعدة البيانات'
                  : language === 'fr'
                  ? 'Fichiers téléversés directement sur Supabase Storage et associés à la base de données'
                  : 'Files are uploaded directly to Supabase Storage and linked to the store database'}
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
            Supabase Storage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* A. STORE LOGO */}
          <div className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                {language === 'ar' ? 'شعار المتجر (Store Logo)' : language === 'fr' ? 'Logo du Magasin' : 'Store Logo'}
              </label>
              {settings.logo_url && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {language === 'ar' ? 'معرف حالياً' : language === 'fr' ? 'Actif' : 'Active'}
                </span>
              )}
            </div>

            {/* Current Logo Preview */}
            <div className="relative border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] bg-white dark:bg-neutral-900 overflow-hidden group">
              {settings.logo_url ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={settings.logo_url}
                    alt="Logo Preview"
                    className="max-h-16 max-w-[200px] object-contain transition-transform group-hover:scale-105"
                  />
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {language === 'ar' ? 'معاينة الشعار المعتمد' : language === 'fr' ? 'Aperçu du logo actuel' : 'Current active logo preview'}
                  </span>
                </div>
              ) : (
                <div className="text-center text-neutral-400 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
                  <p className="text-[11px]">{language === 'ar' ? 'لم يتم رفع شعار خاص بعد' : language === 'fr' ? 'Aucun logo personnalisé' : 'No custom logo uploaded yet'}</p>
                </div>
              )}

              {/* Uploading Overlay */}
              {isUploadingLogo && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                    {language === 'ar' ? 'جاري رفع الشعار إلى Supabase Storage...' : language === 'fr' ? 'Téléversement sur Supabase Storage...' : 'Uploading logo to Supabase Storage...'}
                  </span>
                </div>
              )}
            </div>

            {/* Drag & Drop Zone / Actions */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setDragActiveLogo(true);
              }}
              onDragLeave={() => setDragActiveLogo(false)}
              onDrop={e => handleDrop(e, 'logo')}
              className={`border-2 border-dashed rounded-xl p-3 text-center transition ${
                dragActiveLogo
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-amber-400'
              }`}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {settings.logo_url
                      ? (language === 'ar' ? 'استبدال الشعار' : language === 'fr' ? 'Remplacer le logo' : 'Replace Logo')
                      : (language === 'ar' ? 'رفع شعار جديد' : language === 'fr' ? 'Téléverser un logo' : 'Upload New Logo')}
                  </span>
                </button>

                {settings.logo_url && (
                  <button
                    type="button"
                    onClick={() => setSettings(prev => (prev ? { ...prev, logo_url: '' } : null))}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'ar' ? 'إزالة' : language === 'fr' ? 'Supprimer' : 'Remove'}</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5">
                {language === 'ar'
                  ? 'اسحب الصورة وأفلتها هنا، أو اضغط للاختيار (PNG, JPG, SVG, WEBP - الحد الأقصى 5MB)'
                  : language === 'fr'
                  ? 'Glissez-déposez l’image ici ou cliquez (PNG, JPG, SVG, WEBP - max 5 Mo)'
                  : 'Drag and drop image here or click to browse (PNG, JPG, SVG, WEBP - max 5MB)'}
              </p>
            </div>

            {/* Direct URL input fallback */}
            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                {language === 'ar' ? 'رابط الشعار المباشر (Logo URL):' : language === 'fr' ? 'URL direct du logo :' : 'Direct Logo URL:'}
              </label>
              <input
                type="text"
                value={settings.logo_url || ''}
                onChange={e => setSettings({ ...settings, logo_url: e.target.value })}
                placeholder="https://.../logo.png"
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
              />
            </div>
          </div>

          {/* B. BROWSER FAVICON / SITE ICON */}
          <div className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-blue-500" />
                {language === 'ar' ? 'أيقونة المتصفح (Favicon / Site Icon)' : language === 'fr' ? 'Favicon / Icône du site' : 'Favicon / Site Icon'}
              </label>
              {settings.favicon_url && (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {language === 'ar' ? 'مخصصة' : language === 'fr' ? 'Personnalisé' : 'Custom'}
                </span>
              )}
            </div>

            {/* Realistic Browser Tab Mockup Preview */}
            <div className="relative border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 bg-neutral-100 dark:bg-neutral-950 flex flex-col justify-center min-h-[120px] overflow-hidden">
              <span className="text-[10px] text-neutral-400 mb-1.5 block">
                {language === 'ar' ? 'محاكاة مظهر التبويب في المتصفح:' : language === 'fr' ? 'Aperçu de l’onglet dans le navigateur :' : 'Live Browser Tab Preview:'}
              </span>

              {/* Browser Window Mockup */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1.5 shadow-xs border border-neutral-300 dark:border-neutral-700">
                {/* Window Dots & Tab */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  </div>

                  {/* Active Tab */}
                  <div className="flex-1 bg-white dark:bg-neutral-900 rounded-md py-1 px-2.5 flex items-center gap-2 shadow-xs border border-neutral-200/60 dark:border-neutral-700/60 max-w-[260px]">
                    {settings.favicon_url ? (
                      <img
                        src={settings.favicon_url}
                        alt="Favicon"
                        className="w-4 h-4 object-contain rounded-xs shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-xs bg-amber-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                        Dz
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      {currentStoreName} {language === 'ar' ? '| الطباعة المخصصة' : '| Custom Print'}
                    </span>
                    <span className="text-neutral-400 text-[10px] hover:text-neutral-600 ms-auto">
                      ×
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploading Overlay */}
              {isUploadingFavicon && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                    {language === 'ar' ? 'جاري رفع Favicon إلى Supabase Storage...' : language === 'fr' ? 'Téléversement du Favicon...' : 'Uploading Favicon to Supabase Storage...'}
                  </span>
                </div>
              )}
            </div>

            {/* Drag & Drop Zone / Actions */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setDragActiveFavicon(true);
              }}
              onDragLeave={() => setDragActiveFavicon(false)}
              onDrop={e => handleDrop(e, 'favicon')}
              className={`border-2 border-dashed rounded-xl p-3 text-center transition ${
                dragActiveFavicon
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400'
              }`}
            >
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp,image/jpeg"
                onChange={handleFaviconFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={isUploadingFavicon}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {settings.favicon_url
                      ? (language === 'ar' ? 'استبدال الأيقونة' : language === 'fr' ? 'Remplacer le Favicon' : 'Replace Favicon')
                      : (language === 'ar' ? 'رفع Favicon جديد' : language === 'fr' ? 'Téléverser un Favicon' : 'Upload New Favicon')}
                  </span>
                </button>

                {settings.favicon_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings(prev => (prev ? { ...prev, favicon_url: '' } : null))
                    }
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'ar' ? 'إزالة' : language === 'fr' ? 'Supprimer' : 'Remove'}</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5">
                {language === 'ar'
                  ? 'صيغة مربعة 32x32 أو 64x64 بكسل (ICO أو PNG أو SVG - الحد الأقصى 2MB)'
                  : language === 'fr'
                  ? 'Format carré 32x32 ou 64x64 px (ICO, PNG ou SVG - max 2 Mo)'
                  : 'Square format 32x32 or 64x64 px (ICO, PNG or SVG - max 2MB)'}
              </p>
            </div>

            {/* Direct URL input fallback */}
            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                {language === 'ar' ? 'رابط Favicon المباشر:' : language === 'fr' ? 'URL direct du Favicon :' : 'Direct Favicon URL:'}
              </label>
              <input
                type="text"
                value={settings.favicon_url || ''}
                onChange={e => setSettings({ ...settings, favicon_url: e.target.value })}
                placeholder="https://.../favicon.ico"
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STORE NAMES & DESCRIPTION */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
              {language === 'ar' ? 'معلومات وهوية المتجر (Store Information)' : language === 'fr' ? 'Informations de la Boutique' : 'Store Information'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {language === 'ar'
                ? 'تظهر هذه البيانات في رأس الصفحة، التذييل، الفواتير، ورسائل البريد التلقائية'
                : language === 'fr'
                ? 'Ces informations apparaissent dans l’en-tête, le pied de page, les factures et les e-mails'
                : 'This data appears in the header, footer, invoices, and automated notifications'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              {language === 'ar' ? 'اسم المتجر (باللغة العربية):' : language === 'fr' ? 'Nom du magasin (Arabe) :' : 'Store Name (Arabic):'}
            </label>
            <input
              type="text"
              value={settings.business_name_ar || settings.store_name || ''}
              onChange={e =>
                setSettings({
                  ...settings,
                  business_name_ar: e.target.value,
                  store_name: e.target.value,
                })
              }
              placeholder="ديزاد برينت للطباعة المخصصة"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              {language === 'ar' ? 'اسم المتجر التجاري (English / Latin):' : language === 'fr' ? 'Nom commercial (Latin) :' : 'Commercial Name (Latin):'}
            </label>
            <input
              type="text"
              value={settings.business_name || ''}
              onChange={e => setSettings({ ...settings, business_name: e.target.value })}
              placeholder="DZPrint Custom Printing"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
            {language === 'ar' ? 'وصف المتجر والنشاط (Store Description & SEO):' : language === 'fr' ? 'Description & Référencement (SEO) :' : 'Store Description & SEO:'}
          </label>
          <textarea
            rows={2}
            value={settings.store_description_ar || settings.store_description || ''}
            onChange={e =>
              setSettings({
                ...settings,
                store_description_ar: e.target.value,
                store_description: e.target.value,
              })
            }
            placeholder={
              language === 'ar'
                ? 'المنصة الجزائرية الرائدة في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل السريع لـ 58 ولاية.'
                : language === 'fr'
                ? 'La référence algérienne pour la personnalisation textile et objets publicitaires, avec livraison sur 58 wilayas.'
                : 'The premier Algerian platform for customized apparel and merchandise, with fast delivery to 58 wilayas.'
            }
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              {language === 'ar' ? 'بادئة أرقام الطلبيات (Order Prefix):' : language === 'fr' ? 'Préfixe des commandes :' : 'Order Number Prefix:'}
            </label>
            <input
              type="text"
              value={settings.order_number_prefix || settings.order_prefix || 'DZP'}
              onChange={e =>
                setSettings({
                  ...settings,
                  order_number_prefix: e.target.value,
                  order_prefix: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              {language === 'ar' ? 'مثال: DZP-10023' : 'Ex: DZP-10023'}
            </span>
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              {language === 'ar' ? 'رمز العملة المعروضة (Currency):' : language === 'fr' ? 'Devise :' : 'Currency Symbol:'}
            </label>
            <input
              type="text"
              value={settings.currency || (language === 'ar' ? 'د.ج' : 'DA')}
              onChange={e => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-bold"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              {language === 'ar' ? 'الافتراضي: د.ج أو DZD' : 'Default: DZD / DA'}
            </span>
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              {language === 'ar' ? 'حد التوصيل المجاني (د.ج):' : language === 'fr' ? 'Seuil livraison gratuite (DA) :' : 'Free Delivery Threshold (DA):'}
            </label>
            <input
              type="number"
              value={settings.free_delivery_threshold || 12000}
              onChange={e =>
                setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              {language === 'ar' ? 'توصيل مجاني للطلبات الأكبر من هذه القيمة' : language === 'fr' ? 'Livraison offerte au-dessus de ce montant' : 'Free delivery for orders above this threshold'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTACT INFORMATION & ADDRESS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
              {language === 'ar' ? 'بيانات الاتصال ومقر الورشة (Contact & Address)' : language === 'fr' ? 'Coordonnées & Atelier' : 'Contact & Workshop Location'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {language === 'ar'
                ? 'تساعد الزبائن في التواصل المباشر مع خدمة العملاء وزيارة مقر الورشة'
                : language === 'fr'
                ? 'Permet aux clients de contacter le support et de visiter l’atelier'
                : 'Enables customers to contact customer service and visit the workshop'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              {language === 'ar' ? 'رقم هاتف خدمة الزبائن:' : language === 'fr' ? 'Téléphone service client :' : 'Customer Service Phone:'}
            </label>
            <input
              type="text"
              value={settings.phone || ''}
              onChange={e => setSettings({ ...settings, phone: e.target.value })}
              placeholder="0550 12 34 56"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              {language === 'ar' ? 'رقم الواتساب (WhatsApp Business):' : 'WhatsApp Business:'}
            </label>
            <input
              type="text"
              value={settings.whatsapp_phone || settings.whatsapp || ''}
              onChange={e =>
                setSettings({
                  ...settings,
                  whatsapp_phone: e.target.value,
                  whatsapp: e.target.value,
                })
              }
              placeholder="+213 550 12 34 56"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              {language === 'ar' ? 'البريد الإلكتروني الرسمي:' : language === 'fr' ? 'Email officiel :' : 'Official Email:'}
            </label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={e => setSettings({ ...settings, email: e.target.value })}
              placeholder="contact@dzprint.dz"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {language === 'ar' ? 'عنوان مقر الورشة / الاستلام:' : language === 'fr' ? 'Adresse de l’atelier :' : 'Workshop / Pickup Address:'}
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              placeholder={language === 'ar' ? 'الجزائر العاصمة، بئر مراد رايس، الجزائر' : 'Algiers, Bir Mourad Raïs, Algeria'}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              {language === 'ar' ? 'أوقات العمل واستقبال الطلبات:' : language === 'fr' ? 'Horaires d’ouverture :' : 'Working Hours:'}
            </label>
            <input
              type="text"
              value={settings.working_hours || ''}
              onChange={e => setSettings({ ...settings, working_hours: e.target.value })}
              placeholder={language === 'ar' ? 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً' : language === 'fr' ? 'Sam - Jeu : 9h00 - 18h00' : 'Sat - Thu: 9:00 AM - 6:00 PM'}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SOCIAL MEDIA LINKS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
              {language === 'ar' ? 'روابط شبكات التواصل الاجتماعي (Social Media Links)' : language === 'fr' ? 'Réseaux Sociaux' : 'Social Media Links'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {language === 'ar'
                ? 'تظهر روابط حسابات متجرك في تذييل الموقع وأزرار التواصل السريع'
                : language === 'fr'
                ? 'Ces liens apparaissent dans le pied de page et les boutons de contact'
                : 'These links appear in the website footer and quick contact buttons'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              {language === 'ar' ? 'رابط صفحة فيسبوك (Facebook Page):' : 'Facebook Page URL:'}
            </label>
            <input
              type="url"
              value={settings.facebook_url || settings.facebook || ''}
              onChange={e =>
                setSettings({
                  ...settings,
                  facebook_url: e.target.value,
                  facebook: e.target.value,
                })
              }
              placeholder="https://facebook.com/dzprint"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              {language === 'ar' ? 'رابط حساب إنستغرام (Instagram Profile):' : 'Instagram Profile URL:'}
            </label>
            <input
              type="url"
              value={settings.instagram_url || settings.instagram || ''}
              onChange={e =>
                setSettings({
                  ...settings,
                  instagram_url: e.target.value,
                  instagram: e.target.value,
                })
              }
              placeholder="https://instagram.com/dzprint.dz"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
              {language === 'ar' ? 'رابط حساب تيك توك (TikTok Profile):' : 'TikTok Profile URL:'}
            </label>
            <input
              type="url"
              value={settings.tiktok_url || settings.tiktok || ''}
              onChange={e =>
                setSettings({
                  ...settings,
                  tiktok_url: e.target.value,
                  tiktok: e.target.value,
                })
              }
              placeholder="https://tiktok.com/@dzprint"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              {language === 'ar' ? 'رابط قناة أو بوت تيليجرام (Telegram):' : 'Telegram URL:'}
            </label>
            <input
              type="url"
              value={settings.telegram_url || ''}
              onChange={e => setSettings({ ...settings, telegram_url: e.target.value })}
              placeholder="https://t.me/dzprint_official"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
