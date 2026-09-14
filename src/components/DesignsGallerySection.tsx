import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Design, Product } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DesignsGallerySectionProps {
  onSelectDesign: (design: Design) => void;
}

export const DesignsGallerySection: React.FC<DesignsGallerySectionProps> = ({ onSelectDesign }) => {
  const { t, isRtl } = useTheme();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/designs?activeOnly=true')
      .then(res => res.json())
      .then(data => setDesigns(data))
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'algerian', label: 'هوية وثقافة جزائرية' },
    { id: 'calligraphy', label: 'خط عربي' },
    { id: 'gaming', label: 'ألعاب وأنيمي' },
    { id: 'minimalist', label: 'مينيماليست' },
  ];

  const filteredDesigns = designs.filter(d => {
    if (category === 'all') return true;
    return d.category === category;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            معرض التصاميم والرسومات الجاهزة
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            اختر تصميماً مميزاً وطبقه بنقرة واحدة على التيشرت أو الهودي أو المج المفضل لديك
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                category === c.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {(filteredDesigns || []).map(d => (
          <div
            key={d.id}
            onClick={() => onSelectDesign(d)}
            className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="aspect-square bg-neutral-50 dark:bg-neutral-950 rounded-xl p-4 flex items-center justify-center border border-neutral-100 dark:border-neutral-800 group-hover:scale-102 transition-transform">
              <img src={d.image_url} alt={d.name} className="max-h-full max-w-full object-contain drop-shadow-sm" />
            </div>

            <div>
              <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                {d.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(d.tags || d.compatible_products || []).map(tag => (
                  <span key={tag} className="text-[10px] text-neutral-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
              <span>تطبيق على منتج</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
