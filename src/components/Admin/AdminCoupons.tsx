import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Coupon } from '../../types';
import { formatPrice } from '../../lib/utils';
import { adminFetch } from '../../lib/adminAuth';
import { useTheme } from '../../context/ThemeContext';

export const AdminCoupons: React.FC = () => {
  const { t, language, isRtl } = useTheme();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(1000);
  const [usageLimit, setUsageLimit] = useState(100);

  const fetchCoupons = async () => {
    try {
      const res = await adminFetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discount_type: type,
          discount_value: Number(value),
          min_order_amount: Number(minOrder),
          usage_limit: Number(usageLimit),
          active: true,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCode('');
        fetchCoupons();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الكوبون الترويجي؟')) return;
    try {
      const res = await adminFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCoupons();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            {language === 'ar'
              ? `كوبونات وقسائم التخفيض (${coupons.length})`
              : language === 'fr'
              ? `Codes Promo & Réductions (${coupons.length})`
              : `Coupons & Discounts (${coupons.length})`}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'إنشاء قسائم ترويجية لجذب الزبائن ومتابعة عدد مرات الاستخدام'
              : language === 'fr'
              ? 'Créer des codes de réduction et suivre leur utilisation'
              : 'Create promotional vouchers and track usage frequency'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إنشاء كوبون جديد' : language === 'fr' ? 'Nouveau Code Promo' : 'New Coupon'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(cp => (
          <div
            key={cp.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-lg text-neutral-900 dark:text-white tracking-widest bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg">
                  {cp.code}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {cp.discount_type === 'percentage'
                    ? `${cp.discount_value}% ${language === 'ar' ? 'خصم' : language === 'fr' ? 'de réduction' : 'OFF'}`
                    : `-${formatPrice(cp.discount_value)}`}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                <p>
                  {language === 'ar' ? 'الحد الأدنى للطلب: ' : language === 'fr' ? 'Commande min. : ' : 'Min order: '}
                  <strong>{formatPrice(cp.min_order_amount)}</strong>
                </p>
                <p>
                  {language === 'ar' ? 'مرات الاستخدام: ' : language === 'fr' ? 'Utilisations : ' : 'Used: '}
                  <strong>{cp.times_used}</strong> / {cp.usage_limit}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cp.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950' : 'bg-neutral-100 text-neutral-400'}`}>
                {cp.active
                  ? language === 'ar' ? 'نشط' : language === 'fr' ? 'Actif' : 'Active'
                  : language === 'ar' ? 'معطل' : language === 'fr' ? 'Inactif' : 'Disabled'}
              </span>
              <button
                onClick={() => handleDelete(cp.id)}
                className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                title={language === 'ar' ? 'حذف الكوبون' : language === 'fr' ? 'Supprimer' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {language === 'ar' ? 'إنشاء كود تخفيض ترويجي' : language === 'fr' ? 'Créer un Code de Réduction' : 'Create Promo Code'}
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'رمز الكوبون (كود)' : language === 'fr' ? 'Code Promo' : 'Coupon Code'}
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="RAMADAN2026"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    {language === 'ar' ? 'نوع التخفيض' : language === 'fr' ? 'Type de réduction' : 'Discount Type'}
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  >
                    <option value="percentage">{language === 'ar' ? 'نسبة مئوية (%)' : language === 'fr' ? 'Pourcentage (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{language === 'ar' ? 'مبلغ ثابت (دج)' : language === 'fr' ? 'Montant fixe (DA)' : 'Fixed amount (DZD)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    {language === 'ar' ? 'القيمة' : language === 'fr' ? 'Valeur' : 'Value'}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    {language === 'ar' ? 'الحد الأدنى للطلب (دج)' : language === 'fr' ? 'Commande min. (DA)' : 'Min order (DZD)'}
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={e => setMinOrder(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    {language === 'ar' ? 'حد الاستخدام الأقصى' : language === 'fr' ? 'Limite d utilisation' : 'Usage Limit'}
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={e => setUsageLimit(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 cursor-pointer"
                >
                  {language === 'ar' ? 'إنشاء الكوبون' : language === 'fr' ? 'Créer le code' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
