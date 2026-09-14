import React from 'react';
import { Sparkles, Truck, ShieldCheck, Heart, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTheme();

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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-black text-base text-neutral-900 dark:text-white">DzPrint</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
            المنصة الجزائرية الرائدة في تصميم وطباعة التيشرتات والهوديز والمجات المخصصة بأعلى معايير الجودة والتوصيل السريع.
          </p>
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
              <span className="font-mono">0550 12 34 56</span>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-mono">+213 550 12 34 56</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>الجزائر العاصمة، الجزائر</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-400">
        <p>
          جميع الحقوق محفوظة © {new Date().getFullYear()} ديزاد برينت (DzPrint). صُنِع بشغف في الجزائر.
        </p>
      </div>
    </footer>
  );
};
