import React, { useState, useEffect } from 'react';
import { Truck, Search, Building, Home, Clock, Sparkles } from 'lucide-react';
import { DeliveryAgency, DeliveryRate, Wilaya } from '../types';
import { formatPrice } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface PublicRatesTableProps {
  onStartCustomizing: () => void;
}

export const PublicRatesTable: React.FC<PublicRatesTableProps> = ({ onStartCustomizing }) => {
  const { t } = useTheme();

  const [agencies, setAgencies] = useState<DeliveryAgency[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('yalidine');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/agencies').then(r => r.json()),
      fetch('/api/wilayas').then(r => r.json()),
      fetch('/api/rates').then(r => r.json()),
    ])
      .then(([ag, wil, rt]) => {
        setAgencies(ag);
        setWilayas(wil);
        setRates(rt);
        if (ag.length > 0) setSelectedAgencyId(ag[0].id);
      })
      .catch(() => {});
  }, []);

  const selectedAgency = agencies.find(a => a.id === selectedAgencyId);

  const filteredWilayas = wilayas.filter(w => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      w.code.includes(q) ||
      w.name_ar.toLowerCase().includes(q) ||
      w.name_fr.toLowerCase().includes(q)
    );
  });

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          دليل أسعار التوصيل لـ 58 ولاية جزائرية
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
          أسعار واضحة وثابتة بدون أي رسوم خفية مع كبرى شركات الشحن والتوصيل المعتمدة في الجزائر
        </p>
      </div>

      {/* Agency Selector Tabs */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        {(agencies || []).map(a => {
          const isSelected = selectedAgencyId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAgencyId(a.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{a.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input & Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-md overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن ولايتك بالرقم أو الاسم (مثال: الشلف، وهران، 16، سطيف)..."
            className="w-full text-xs bg-transparent focus:outline-none text-neutral-900 dark:text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
              <tr>
                <th className="p-3.5 text-start">رقم الولاية</th>
                <th className="p-3.5 text-start">اسم الولاية</th>
                <th className="p-3.5 text-start">
                  <span className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-black">
                    <Home className="w-3.5 h-3.5 text-amber-500" />
                    توصيل للمنزل
                  </span>
                </th>
                <th className="p-3.5 text-start">
                  <span className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-black">
                    <Building className="w-3.5 h-3.5 text-emerald-500" />
                    استلام من المكتب Stop Desk
                  </span>
                </th>
                <th className="p-3.5 text-start">مدة التوصيل التقديرية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredWilayas.map(w => {
                const r = rates.find(x => x.agency_id === selectedAgencyId && x.wilaya_id === w.id);

                return (
                  <tr key={w.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="p-3.5 font-mono font-bold text-neutral-400">
                      {w.code}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
                      <span>{w.name_ar}</span>
                      <span className="text-neutral-400 font-normal ms-1 text-[11px]">({w.name_fr})</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {r ? formatPrice(r.home_price) : 'غير متاح'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {r ? formatPrice(r.office_price) : 'غير متاح'}
                    </td>
                    <td className="p-3.5 text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{r?.estimated_days || '2-4 أيام'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl text-white text-center space-y-3 shadow-lg">
        <h3 className="text-lg sm:text-xl font-black">
          جاهز لطباعة تيشرت أو هودي بتصميمك الخاص؟
        </h3>
        <p className="text-xs text-amber-100 max-w-md mx-auto">
          اختر مقاسك ولونك المفضل، ارفع صورتك، وسنقوم بتوصيلها حتى باب منزلك مع الدفع بعد الفحص
        </p>
        <button
          onClick={onStartCustomizing}
          className="px-6 py-3 bg-white text-amber-600 hover:bg-neutral-100 rounded-xl font-black text-xs shadow-md transition cursor-pointer"
        >
          ابدأ التخصيص الآن
        </button>
      </div>
    </section>
  );
};
