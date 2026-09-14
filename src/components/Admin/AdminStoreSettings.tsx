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
        throw new Error(data.error || 'فشل رفع الملف إلى التخزين السحابي');
      }

      if (assetType === 'logo') {
        setSettings(prev => (prev ? { ...prev, logo_url: data.url } : null));
        setUploadSuccess('تم رفع شعار المتجر بنجاح إلى Supabase Storage وحفظ الرابط!');
      } else {
        setSettings(prev => (prev ? { ...prev, favicon_url: data.url } : null));
        setUploadSuccess('تم رفع أيقونة المتصفح (Favicon) بنجاح إلى Supabase Storage!');
      }
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء رفع الملف');
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
    settings.business_name_ar || settings.store_name || settings.business_name || 'ديزاد برينت';

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
                الهوية البصرية للمتجر (Logo & Favicon)
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                يتم رفع الملفات مباشرة وتخزينها في Supabase Storage وربطها بقاعدة البيانات
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
                شعار المتجر (Store Logo)
              </label>
              {settings.logo_url && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> معرف حالياً
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
                    معاينة الشعار المعتمد
                  </span>
                </div>
              ) : (
                <div className="text-center text-neutral-400 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
                  <p className="text-[11px]">لم يتم رفع شعار خاص بعد (يُستخدم الشعار الافتراضي)</p>
                </div>
              )}

              {/* Uploading Overlay */}
              {isUploadingLogo && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                    جاري رفع الشعار إلى Supabase Storage...
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
                  <span>{settings.logo_url ? 'استبدال الشعار' : 'رفع شعار جديد'}</span>
                </button>

                {settings.logo_url && (
                  <button
                    type="button"
                    onClick={() => setSettings(prev => (prev ? { ...prev, logo_url: '' } : null))}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>إزالة</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5">
                اسحب الصورة وأفلتها هنا، أو اضغط للاختيار (PNG, JPG, SVG, WEBP - الحد الأقصى 5MB)
              </p>
            </div>

            {/* Direct URL input fallback */}
            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                رابط الشعار المباشر (Logo URL):
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
                أيقونة المتصفح (Favicon / Site Icon)
              </label>
              {settings.favicon_url && (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> مخصصة
                </span>
              )}
            </div>

            {/* Realistic Browser Tab Mockup Preview */}
            <div className="relative border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 bg-neutral-100 dark:bg-neutral-950 flex flex-col justify-center min-h-[120px] overflow-hidden">
              <span className="text-[10px] text-neutral-400 mb-1.5 block">
                محاكاة مظهر التبويب في المتصفح (Live Browser Tab Preview):
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
                      {currentStoreName} | الطباعة المخصصة
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
                    جاري رفع Favicon إلى Supabase Storage...
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
                  <span>{settings.favicon_url ? 'استبدال الأيقونة' : 'رفع Favicon جديد'}</span>
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
                    <span>إزالة</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5">
                صيغة مربعة 32x32 أو 64x64 بكسل (ICO أو PNG أو SVG - الحد الأقصى 2MB)
              </p>
            </div>

            {/* Direct URL input fallback */}
            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                رابط Favicon المباشر:
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
              معلومات وهوية المتجر (Store Information)
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              تظهر هذه البيانات في رأس الصفحة، التذييل، الفواتير، ورسائل البريد التلقائية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              اسم المتجر (باللغة العربية):
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
              اسم المتجر التجاري (English / Latin):
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
            وصف المتجر والنشاط (Store Description & SEO):
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
            placeholder="المنصة الجزائرية الرائدة في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل السريع لـ 58 ولاية."
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              بادئة أرقام الطلبيات (Order Prefix):
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
              مثال: DZP-10023
            </span>
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              رمز العملة المعروضة (Currency):
            </label>
            <input
              type="text"
              value={settings.currency || 'د.ج'}
              onChange={e => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-bold"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              الافتراضي: د.ج أو DZD
            </span>
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1">
              حد التوصيل المجاني (د.ج):
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
              توصيل مجاني للطلبات الأكبر من هذه القيمة
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
              بيانات الاتصال ومقر الورشة (Contact & Address)
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              تساعد الزبائن في التواصل المباشر مع خدمة العملاء وزيارة مقر الورشة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              رقم هاتف خدمة الزبائن:
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
              رقم الواتساب (WhatsApp Business):
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
              البريد الإلكتروني الرسمي:
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
              عنوان مقر الورشة / الاستلام:
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              placeholder="الجزائر العاصمة، بئر مراد رايس، الجزائر"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              أوقات العمل واستقبال الطلبات:
            </label>
            <input
              type="text"
              value={settings.working_hours || ''}
              onChange={e => setSettings({ ...settings, working_hours: e.target.value })}
              placeholder="السبت - الخميس: 9:00 صباحاً - 6:00 مساءً"
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
              روابط شبكات التواصل الاجتماعي (Social Media Links)
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              تظهر روابط حسابات متجرك في تذييل الموقع وأزرار التواصل السريع
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              رابط صفحة فيسبوك (Facebook Page):
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
              رابط حساب إنستغرام (Instagram Profile):
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
              رابط حساب تيك توك (TikTok Profile):
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
              رابط قناة أو بوت تيليجرام (Telegram):
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
