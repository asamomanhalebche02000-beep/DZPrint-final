import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  BarChart3,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Send,
  Download,
  Sparkles,
  Type,
  Palette,
  Eye,
  AlertCircle,
  Copy,
  CheckCircle,
  Sliders,
  Code2,
  HelpCircle,
  Store,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { adminFetch, getAdminToken } from '../../lib/adminAuth';
import { useSiteSettings } from '../../context/SettingsContext';
import { AdminStoreSettings } from './AdminStoreSettings';

const ARABIC_FONTS = [
  { id: 'Cairo', name: 'خط القاهرة (Cairo)', desc: 'خط قياسي متوازن وعصري' },
  { id: 'Alexandria', name: 'خط الإسكندرية (Alexandria)', desc: 'خط هندسي حديث ومميز' },
  { id: 'Almarai', name: 'خط المراعي (Almarai)', desc: 'بسيط وخفيف عالي الوضوح' },
  { id: 'Amiri', name: 'خط الأميري (Amiri)', desc: 'طابع كلاسيكي فخم وأصيل' },
  { id: 'Changa', name: 'خط تشانغا (Changa)', desc: 'عريض وجريء لافت للأنظار' },
  { id: 'Tajawal', name: 'خط تجوال (Tajawal)', desc: 'ناعم ومتناسق جداً' },
];

const PRESET_COLORS = [
  { name: 'أسود داكن', value: '#111827' },
  { name: 'عنبري ملكي', value: '#d97706' },
  { name: 'أزرق احترافي', value: '#2563eb' },
  { name: 'أخضر زمردي', value: '#059669' },
  { name: 'بنفسجي داكن', value: '#7c3aed' },
  { name: 'أحمر قرمزي', value: '#dc2626' },
];

export const AdminSettings: React.FC = () => {
  const { updateLocalSettings, refreshSettings } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'store' | 'marketing' | 'homepage'>('store');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Sheet Action States
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllResult, setSyncAllResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then(async res => {
        if (!res.ok) {
          const fallbackRes = await fetch('/api/settings');
          return fallbackRes.json();
        }
        return res.json();
      })
      .then(data => {
        setSettings({
          business_name: 'DZPrint Custom Printing',
          business_name_ar: 'ديزاد برينت للطباعة المخصصة',
          store_name: 'ديزاد برينت للطباعة المخصصة',
          store_description: 'المنصة الجزائرية الرائدة في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل السريع لـ 58 ولاية.',
          store_description_ar: 'المنصة الجزائرية الرائدة في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل السريع لـ 58 ولاية.',
          logo_url: '',
          favicon_url: '',
          phone: '0550 12 34 56',
          whatsapp: '+213550123456',
          whatsapp_phone: '0550123456',
          order_number_prefix: 'DZP',
          email: 'contact@dzprint.dz',
          address: 'الجزائر العاصمة',
          working_hours: 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
          facebook: '',
          facebook_url: '',
          instagram: '',
          instagram_url: '',
          tiktok: '',
          tiktok_url: '',
          telegram_url: '',
          youtube_url: '',
          currency: 'د.ج',
          order_prefix: 'DZP',
          free_delivery_threshold: 12000,
          email_notifications_enabled: true,
          meta_pixel_id: '',
          meta_pixel_enabled: false,
          google_sheet_url: '',
          google_sheet_webhook_url: '',
          google_sheet_sync_enabled: true,
          hero_headline: 'اطبع أفكارك وتصاميمك على أجود التيشرتات والهوديز',
          hero_headline_highlight: 'أجود التيشرتات والهوديز',
          hero_headline_color: '#111827',
          hero_headline_font: 'Cairo',
          hero_subheadline:
            'اختر نوع القماش، ارفع صورتك أو شعارك الخاص، عاين النتيجة مباشرة عبر استوديو التخصيص ثلاثي الأبعاد، واستلم طردك عند باب المنزل أو أقرب مكتب في ولايتك والدفع عند الاستلام.',
          hero_subheadline_color: '#4b5563',
          hero_badge_text: 'أحدث تقنيات الطباعة الرقمية المباشرة (Direct-to-Film DTF) في الجزائر',
          hero_badge_color: '#d97706',
          hero_start_btn_text: 'ابدأ التصميم والطباعة الآن',
          hero_catalog_btn_text: 'تصفح المنتجات الجاهزة',
          ...data,
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        updateLocalSettings(settings);
        refreshSettings().catch(() => {});
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل حفظ الإعدادات');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Google Sheet Webhook
  const handleTestGoogleSheet = async () => {
    if (!settings?.google_sheet_webhook_url) {
      setTestResult({ success: false, message: 'يرجى إدخال رابط Webhook أولاً قبل إجراء الاختبار' });
      return;
    }

    setIsTestingSheet(true);
    setTestResult(null);

    try {
      const res = await adminFetch('/api/admin/google-sheet/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: settings.google_sheet_webhook_url }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: 'تم إرسال سطر تجريبي بنجاح إلى جدول Google Sheet الخاص بك!' });
      } else {
        throw new Error(data.error || 'فشل الاتصال برابط Webhook');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'تعذر الوصول إلى جدول Google' });
    } finally {
      setIsTestingSheet(false);
    }
  };

  // Sync All Orders to Google Sheet
  const handleSyncAllOrders = async () => {
    if (!settings?.google_sheet_webhook_url) {
      setSyncAllResult({ success: false, message: 'يرجى إدخال رابط Webhook وحفظه أولاً' });
      return;
    }

    setIsSyncingAll(true);
    setSyncAllResult(null);

    try {
      const res = await adminFetch('/api/admin/google-sheet/sync-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setSyncAllResult({
          success: true,
          message: data.message || `تمت مزامنة جميع الطلبيات بنجاح (${data.count} طلبية)`,
        });
      } else {
        throw new Error(data.error || 'فشلت عملية المزامنة الشاملة');
      }
    } catch (err: any) {
      setSyncAllResult({ success: false, message: err.message || 'خطأ أثناء المزامنة' });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const copyAppsScript = () => {
    const code = `// كود Google Apps Script لمزامنة طلبيات ديزاد برينت تلقائياً
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // إذا كان الجدول جديد وفارغ، ننشئ شريط العناوين
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "رقم الطلب", "التاريخ والوقت", "اسم الزبون", "الهاتف", "البريد", 
        "الولاية", "شركة التوصيل", "نوع التوصيل", "العنوان", "تفاصيل المنتجات", 
        "القطع", "المجموع الفرعي", "سعر التوصيل", "المجموع الإجمالي", "الحالة", "ملاحظات"
      ]);
      sheet.getRange(1, 1, 1, 16).setBackground("#f59e0b").setFontColor("#ffffff").setFontWeight("bold");
    }
    
    // فحص إذا كان إرسال فردي أو جماعي
    if (data.action === "bulk_sync" && Array.isArray(data.orders)) {
      data.orders.forEach(function(o) {
        appendOrderRow(sheet, o);
      });
    } else {
      appendOrderRow(sheet, data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendOrderRow(sheet, o) {
  sheet.appendRow([
    o.order_number,
    o.timestamp || o.created_at,
    o.full_name,
    "'" + o.phone,
    o.email,
    o.wilaya_name,
    o.delivery_agency_name,
    o.delivery_method,
    o.delivery_address,
    o.items_summary,
    o.items_count,
    o.subtotal,
    o.delivery_fee,
    o.total,
    o.status,
    o.customer_notes
  ]);
}`;

    navigator.clipboard.writeText(code);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 3000);
  };

  if (!settings) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            <span>إعدادات المتجر والتتبع والهوية</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            تحكم في تتبع Meta Pixel، مزامنة Google Sheets، وتخصيص نصوص وألوان الواجهة الرئيسية
          </p>
        </div>

        {/* Global Save Button at top */}
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="self-start sm:self-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('store')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'store'
              ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>إعدادات وهوية المتجر (Store Branding)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('marketing')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'marketing'
              ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>تتبع Meta Pixel & Google Sheets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('homepage')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'homepage'
              ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>نصوص وألوان وخطوط الواجهة</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ الإعدادات وتحديثها في المتجر بنجاح!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MARKETING & TRACKING (META PIXEL + GOOGLE SHEETS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'marketing' && (
        <div className="space-y-6">
          {/* Meta Pixel Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>تتبع إعلانات فيسبوك / ميتا (Meta Pixel)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded-full">
                      Facebook Pixel
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    تتبع تلقائي للزيارات، إضافة المنتجات للسلة، وإتمام الطلبيات (Purchase) بدينار جزائري لحساب الـ ROAS
                  </p>
                </div>
              </div>

              {/* Pixel Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.meta_pixel_enabled)}
                  onChange={e => setSettings({ ...settings, meta_pixel_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1.5">
                  معرّف البيكسل (Meta Pixel ID):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.meta_pixel_id || ''}
                    onChange={e => setSettings({ ...settings, meta_pixel_id: e.target.value.trim() })}
                    placeholder="مثال: 123456789012345"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  يمكنك الحصول على المعرّف من لوحة <strong>Meta Events Manager</strong>.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5 text-[11px]">
                <span className="font-bold text-neutral-700 dark:text-neutral-300 block">
                  الأحداث التي يتم إرسالها تلقائياً:
                </span>
                <ul className="space-y-1 text-neutral-500 dark:text-neutral-400">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500" /> PageView (تصفح الصفحات)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500" /> ViewContent (معاينة المنتجات)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500" /> AddToCart (إضافة للسلة)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500" /> Purchase (إتمام الشراء مع القيمة)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Google Sheets Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>مزامنة وتنظيم الطلبيات في Google Sheets</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                      Google Sheets Live Sync
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    إرسال كل طلبية جديدة لحظياً إلى جدول إكسل Google الخاص بك مع أرقام الهواتف، العناوين، والتفاصيل
                  </p>
                </div>
              </div>

              {/* Sheets Auto-Sync Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.google_sheet_sync_enabled)}
                  onChange={e => setSettings({ ...settings, google_sheet_sync_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              {/* Google Sheet URL (View Link) */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>رابط جدول Google Sheet للمعاينة والإدارة المباشرة:</span>
                  {settings.google_sheet_url && (
                    <a
                      href={settings.google_sheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      فتح الجدول في نافذة جديدة
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  value={settings.google_sheet_url || ''}
                  onChange={e => setSettings({ ...settings, google_sheet_url: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Webhook URL for automated sync */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1.5">
                    <span>رابط Webhook لتسجيل الطلبيات التلقائي (Google Apps Script / Webhook URL):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowScriptModal(true)}
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>عرض كود Apps Script الجاهز للنسخ</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={settings.google_sheet_webhook_url || ''}
                  onChange={e => setSettings({ ...settings, google_sheet_webhook_url: e.target.value })}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons: Test, Sync All, CSV Export */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestGoogleSheet}
                  disabled={isTestingSheet}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestingSheet ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>إرسال سطر تجريبي لاختبار الربط</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllOrders}
                  disabled={isSyncingAll}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSyncingAll ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>مزامنة جميع الطلبيات المسجلة الآن</span>
                </button>

                <a
                  href="/api/admin/orders/export-google-sheets-csv"
                  download
                  className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  <span>تنزيل ملف CSV جاهز لـ Google Sheets</span>
                </a>
              </div>

              {/* Test or Sync status results */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300'
                  }`}
                >
                  {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {syncAllResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    syncAllResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300'
                  }`}
                >
                  {syncAllResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{syncAllResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOMEPAGE TEXT, FONT & COLOR CUSTOMIZATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'homepage' && (
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800/80 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                معاينة حية ومباشرة للعنوان والنصوص والألوان:
              </span>
              <span className="font-mono bg-white dark:bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                الخط: {settings.hero_headline_font || 'Cairo'}
              </span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
              {/* Badge Preview */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border"
                style={{
                  color: settings.hero_badge_color || '#d97706',
                  borderColor: `${settings.hero_badge_color || '#d97706'}40`,
                  backgroundColor: `${settings.hero_badge_color || '#d97706'}15`,
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>{settings.hero_badge_text}</span>
              </div>

              {/* Headline Preview */}
              <h1
                className="text-2xl sm:text-3xl font-black leading-tight"
                style={{
                  fontFamily: settings.hero_headline_font
                    ? `'${settings.hero_headline_font}', sans-serif`
                    : 'Cairo, sans-serif',
                  color: settings.hero_headline_color || '#111827',
                }}
              >
                {settings.hero_headline}
              </h1>

              {/* Subheadline Preview */}
              <p
                className="text-xs sm:text-sm leading-relaxed max-w-2xl"
                style={{
                  color: settings.hero_subheadline_color || '#4b5563',
                }}
              >
                {settings.hero_subheadline}
              </p>

              {/* Buttons Preview */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg shadow-sm">
                  {settings.hero_start_btn_text}
                </span>
                <span className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold rounded-lg">
                  {settings.hero_catalog_btn_text}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Form */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5 text-xs">
            {/* Font Family Selection */}
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-bold mb-2 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-500" />
                نوع الخط العربي للعنوان الرئيسي (Arabic Font Family):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ARABIC_FONTS.map(font => {
                  const isSelected = (settings.hero_headline_font || 'Cairo') === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, hero_headline_font: font.id })}
                      className={`p-3 rounded-xl border text-start transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div
                        className="text-sm font-bold truncate"
                        style={{ fontFamily: `'${font.id}', sans-serif` }}
                      >
                        {font.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {font.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Headline Text & Color */}
            <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-neutral-700 dark:text-neutral-300 font-bold">
                النص الرئيسي الكبير (Main Big Headline Text):
              </label>
              <textarea
                rows={2}
                value={settings.hero_headline || ''}
                onChange={e => setSettings({ ...settings, hero_headline: e.target.value })}
                placeholder="أدخل نص العنوان الرئيسي الذي يظهر في أعلى المتجر"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              {/* Highlighted text within headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    الكلمات المميزة بتدرج لوني داخل العنوان:
                  </label>
                  <input
                    type="text"
                    value={settings.hero_headline_highlight || ''}
                    onChange={e => setSettings({ ...settings, hero_headline_highlight: e.target.value })}
                    placeholder="مثال: أجود التيشرتات والهوديز"
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Headline Color Picker + Presets */}
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    لون العنوان الرئيسي (Headline Color):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.hero_headline_color || '#111827'}
                      onChange={e => setSettings({ ...settings, hero_headline_color: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.hero_headline_color || '#111827'}
                      onChange={e => setSettings({ ...settings, hero_headline_color: e.target.value })}
                      className="w-24 px-2 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-xs"
                    />
                    {/* Preset Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setSettings({ ...settings, hero_headline_color: c.value })}
                          className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 transition hover:scale-110"
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subheadline (Secondary Small Text) & Color */}
            <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-neutral-700 dark:text-neutral-300 font-bold">
                النص الثانوي التوضيحي (Secondary Subheadline Text):
              </label>
              <textarea
                rows={3}
                value={settings.hero_subheadline || ''}
                onChange={e => setSettings({ ...settings, hero_subheadline: e.target.value })}
                placeholder="أدخل النص الثانوي التوضيحي للخدمة والشحن"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              {/* Subheadline Color */}
              <div className="flex items-center gap-3">
                <label className="text-neutral-600 dark:text-neutral-400 font-bold">
                  لون النص الثانوي:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.hero_subheadline_color || '#4b5563'}
                    onChange={e => setSettings({ ...settings, hero_subheadline_color: e.target.value })}
                    className="w-8 h-8 p-0.5 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.hero_subheadline_color || '#4b5563'}
                    onChange={e => setSettings({ ...settings, hero_subheadline_color: e.target.value })}
                    className="w-24 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Top Badge and Buttons Text */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  نص شارة الميزة العلوية (Badge):
                </label>
                <input
                  type="text"
                  value={settings.hero_badge_text || ''}
                  onChange={e => setSettings({ ...settings, hero_badge_text: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  نص زر بدء التصميم:
                </label>
                <input
                  type="text"
                  value={settings.hero_start_btn_text || ''}
                  onChange={e => setSettings({ ...settings, hero_start_btn_text: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  نص زر تصفح الكتالوج:
                </label>
                <input
                  type="text"
                  value={settings.hero_catalog_btn_text || ''}
                  onChange={e => setSettings({ ...settings, hero_catalog_btn_text: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: STORE SETTINGS & BRANDING (LOGO, FAVICON, CONTACT, SOCIAL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'store' && (
        <AdminStoreSettings
          settings={settings}
          setSettings={setSettings}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        {saveSuccess ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Check className="w-4 h-4" /> تم حفظ كافة الإعدادات بنجاح
          </span>
        ) : (
          <span className="text-[11px] text-neutral-400">
            اضغط على زر الحفظ لتطبيق التغييرات مباشرة على المتجر
          </span>
        )}

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="ms-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
        </button>
      </div>

      {/* Google Apps Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-500" />
                <span>طريقة ربط Google Sheets في دقيقتين</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
              <p className="font-bold text-neutral-900 dark:text-white">الخطوات البسيطة:</p>
              <ol className="list-decimal list-inside space-y-1 pr-2">
                <li>افتح جدول Google جديد (Google Sheets).</li>
                <li>من القائمة العلوية اضغط على <strong>Extensions (الإضافات)</strong> ← <strong>Apps Script</strong>.</li>
                <li>امسح أي كود موجود والصق الكود الموجود أدناه.</li>
                <li>اضغط <strong>Deploy (نشر)</strong> ← <strong>New Deployment</strong> ← اختر <strong>Web app</strong>.</li>
                <li>اجعل <strong>Who has access (من لديه إذن الوصول)</strong>: <strong>Anyone (أي شخص)</strong> ثم اضغط Deploy.</li>
                <li>انسخ الرابط الناتج (Web App URL) وضعه في خانة Webhook URL أعلاه.</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[10px] overflow-x-auto max-h-48 border border-neutral-800">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["رقم الطلب", "التاريخ", "الاسم", "الهاتف", "البريد", "الولاية", "شركة التوصيل", "نوع التوصيل", "العنوان", "المنتجات", "القطع", "المجموع الفرعي", "التوصيل", "الإجمالي", "الحالة", "ملاحظات"]);
  }
  if (data.action === "bulk_sync" && Array.isArray(data.orders)) {
    data.orders.forEach(function(o) { appendOrder(sheet, o); });
  } else {
    appendOrder(sheet, data);
  }
  return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
}
function appendOrder(sheet, o) {
  sheet.appendRow([o.order_number, o.timestamp || o.created_at, o.full_name, "'" + o.phone, o.email, o.wilaya_name, o.delivery_agency_name, o.delivery_method, o.delivery_address, o.items_summary, o.items_count, o.subtotal, o.delivery_fee, o.total, o.status, o.customer_notes]);
}`}
              </pre>

              <button
                type="button"
                onClick={copyAppsScript}
                className="absolute top-2 end-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
              >
                {scriptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{scriptCopied ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
