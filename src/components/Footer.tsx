import React from 'react';
import { Sparkles, Truck, ShieldCheck, Heart, Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSiteSettings } from '../context/SettingsContext';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTheme();
  const { settings } = useSiteSettings();
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    setLogoError(false);
  }, [settings?.logo_url]);

  const storeName = settings?.business_name_ar || settings?.store_name || settings?.business_name || 'DzPrint';
  const storeDesc =
    settings?.store_description_ar ||
    settings?.store_description ||
    'المنصة الجزائرية الرائدة في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل السريع.';
  const storePhone = settings?.phone || '0550 12 34 56';
  const storeWhatsApp = settings?.whatsapp || '+213 550 12 34 56';
  const storeEmail = settings?.email || 'contact@dzprint.dz';
  const storeAddress = settings?.address || 'الجزائر العاصمة، الجزائر';

  return (
    <footer className="mt-20 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60">
      {/* Top highlights bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                توصيل سريع عبر 58 ولاية
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                شراكة مع ياليدين، بروكوليس ومايسترو للتوصيل حتى باب المنزل أو المكتب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                الدفع نقداً عند الاستلام (COD)
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                لا تدفع حتى تستلم الطرد وتتأكد من جودة القماش والطباعة الحرارية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                طباعة عالية الدقة بتقنية DTF
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                ألوان زاهية وثابتة تدوم لسنوات ولا تتأثر بالغسيل المتكرر
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        {/* Brand column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            {settings?.logo_url && !logoError ? (
              <img
                src={settings.logo_url}
                alt={storeName}
                onError={() => setLogoError(true)}
                className="h-8 max-h-8 w-auto max-w-[120px] object-contain rounded-lg shadow-xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <span className="font-black text-base text-neutral-900 dark:text-white">{storeName}</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
            {storeDesc}
          </p>
          {/* Social media links if configured */}
          <div className="flex items-center gap-2 pt-2">
            {settings?.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold transition"
              >
                Facebook
              </a>
            )}
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-lg text-[10px] font-bold transition"
              >
                Instagram
              </a>
            )}
            {settings?.tiktok_url && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-neutral-900/10 dark:bg-neutral-100/10 hover:bg-neutral-900/20 text-neutral-800 dark:text-neutral-200 rounded-lg text-[10px] font-bold transition"
              >
                TikTok
              </a>
            )}
            {settings?.telegram_url && (
              <a
                href={settings.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg text-[10px] font-bold transition"
              >
                Telegram
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
            روابط المتجر
          </h5>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>
              <button onClick={() => onNavigate('shop')} className="hover:text-amber-500">
                كتالوج المنتجات
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('gallery')} className="hover:text-amber-500">
                معرض التصاميم والرسومات
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('rates')} className="hover:text-amber-500">
                دليل أسعار التوصيل لـ 58 ولاية
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('track')} className="hover:text-amber-500">
                تتبع حالة طلبيتي
              </button>
            </li>
            <li className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <button onClick={() => onNavigate('admin')} className="hover:text-amber-500 text-neutral-400 hover:underline">
                بوابة إدارة المتجر (Store Portal)
              </button>
            </li>
          </ul>
        </div>

        {/* Deliveries Agencies */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
            شركات التوصيل المعتمدة
          </h5>
          <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400 text-[11px]">
            <li>• ياليدين إكسبريس (Yalidine Express)</li>
            <li>• بروكوليس (Procolis Express)</li>
            <li>• مايسترو ديليفري (Maystro Delivery)</li>
            <li className="text-amber-600 dark:text-amber-400 font-medium pt-1">
              ✓ متوفر توصيل للمنزل والمكتب (Stop Desk)
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
            تواصل مع الورشة
          </h5>
          <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono">{storePhone}</span>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-mono">{storeWhatsApp}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-mono">{storeEmail}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{storeAddress}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-400">
        <p>
          جميع الحقوق محفوظة © {new Date().getFullYear()} {storeName}. صُنِع بشغف في الجزائر.
        </p>
      </div>
    </footer>
  );
};
