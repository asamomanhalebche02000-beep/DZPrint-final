import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSiteSettings } from '../context/SettingsContext';

interface HeroBannerProps {
  onStartCustomizing: () => void;
  onExploreCatalog: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartCustomizing,
  onExploreCatalog,
}) => {
  const { t, isRtl } = useTheme();
  const { settings } = useSiteSettings();

  // Dynamic CMS & Customization values with safe fallbacks
  const headline = settings?.hero_headline || 'اطبع أفكارك وتصاميمك على أجود التيشرتات والهوديز';
  const highlight = settings?.hero_headline_highlight || 'أجود التيشرتات والهوديز';
  const headlineColor = settings?.hero_headline_color;
  const headlineFont = settings?.hero_headline_font || 'Cairo';
  const subheadline =
    settings?.hero_subheadline ||
    'اختر نوع القماش، ارفع صورتك أو شعارك الخاص، عاين النتيجة مباشرة عبر استوديو التخصيص ثلاثي الأبعاد، واستلم طردك عند باب المنزل أو أقرب مكتب في ولايتك والدفع عند الاستلام.';
  const subheadlineColor = settings?.hero_subheadline_color;
  const badgeText =
    settings?.hero_badge_text ||
    'أحدث تقنيات الطباعة الرقمية المباشرة (Direct-to-Film DTF) في الجزائر';
  const startBtnText = settings?.hero_start_btn_text || t.hero_start_designing;
  const catalogBtnText = settings?.hero_catalog_btn_text || t.hero_explore_catalog;

  // Split headline around highlight if highlight exists in headline
  const renderHeadline = () => {
    if (highlight && headline.includes(highlight)) {
      const parts = headline.split(highlight);
      return (
        <>
          {parts[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">
            {highlight}
          </span>
          {parts[1]}
        </>
      );
    }
    return headline;
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Top pill badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold"
              style={settings?.hero_badge_color ? { color: settings.hero_badge_color } : undefined}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{badgeText}</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.15]"
              style={{
                fontFamily: headlineFont ? `'${headlineFont}', sans-serif` : undefined,
                color: headlineColor || undefined,
              }}
            >
              {renderHeadline()}
            </h1>

            <p
              className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed"
              style={{
                color: subheadlineColor || undefined,
              }}
            >
              {subheadline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onStartCustomizing}
                className="px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{startBtnText}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={onExploreCatalog}
                className="px-6 py-3.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                {catalogBtnText}
              </button>
            </div>

            {/* Key trust bullets */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>توصيل لكافة الـ 58 ولاية</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>الدفع بعد فحص الطرد</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>قطن 100% عالي الكثافة</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Right */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl">
              {/* Product Visual Mockup Card */}
              <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-950 rounded-2xl flex items-center justify-center p-6 overflow-hidden">
                {/* Simulated T-shirt with Algeria Map Badge */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl">
                    <path
                      d="M130 50 L160 70 C180 80 220 80 240 70 L270 50 L360 110 L320 170 L280 145 L280 370 C280 375 275 380 270 380 L130 380 C125 380 120 375 120 370 L120 145 L80 170 L40 110 Z"
                      fill="#111827"
                    />
                  </svg>
                  {/* Glowing print graphic on chest */}
                  <div className="absolute top-[120px] flex flex-col items-center justify-center p-2 rounded bg-amber-500/20 border border-amber-400/50 backdrop-blur-xs">
                    <span className="text-xs font-black text-amber-400 tracking-wider">DZPRINT STUDIO</span>
                    <span className="text-[10px] text-white">الطباعة الحرة في الجزائر</span>
                  </div>
                </div>

                {/* Floating agency badges */}
                <div className="absolute bottom-3 start-3 px-3 py-1.5 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-xl text-[10px] font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-amber-500" />
                  <span>شحن ياليدين & بروكوليس</span>
                </div>
              </div>

              {/* Bottom stats mini-bar */}
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">تقييم الجودة</span>
                  <strong className="text-amber-500 font-extrabold">★ 4.9 / 5.0 (أكثر من 2400 زبون)</strong>
                </div>
                <button
                  onClick={onStartCustomizing}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg font-bold text-xs transition"
                >
                  جرب الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
