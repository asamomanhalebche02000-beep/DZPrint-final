import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  Home,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../lib/utils';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onBackToShop: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label_ar: string; label_fr: string; label_en: string }[] = [
  { key: 'received', label_ar: 'استلام الطلب', label_fr: 'Reçue', label_en: 'Received' },
  { key: 'confirmed', label_ar: 'تأكيد هاتفي', label_fr: 'Confirmée', label_en: 'Confirmed' },
  { key: 'preparing', label_ar: 'تجهيز القطعة', label_fr: 'En préparation', label_en: 'Preparing' },
  { key: 'printing', label_ar: 'الطباعة الحرارية', label_fr: 'En impression', label_en: 'Printing' },
  { key: 'ready', label_ar: 'جاهز للشحن', label_fr: 'Prêt', label_en: 'Ready' },
  { key: 'shipped', label_ar: 'تم الشحن', label_fr: 'Expédiée', label_en: 'Shipped' },
  { key: 'out_for_delivery', label_ar: 'خرج للتوصيل', label_fr: 'En livraison', label_en: 'Out for delivery' },
  { key: 'delivered', label_ar: 'تم التوصيل', label_fr: 'Livrée', label_en: 'Delivered' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onBackToShop,
}) => {
  const { t, language, isRtl } = useTheme();

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If initial order number passed, search automatically if test order
  useEffect(() => {
    if (initialOrderNumber === 'PRINT-2026-000123') {
      setPhone('0550123456');
    }
  }, [initialOrderNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('يرجى إدخال كل من رقم الطلب ورقم الهاتف المسجل للتحقق');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?order_number=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'لم يتم العثور على الطلب');
      }
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء البحث');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          {t.tracking_title}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
          {t.tracking_subtitle}
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t.order_number} *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="PRINT-2026-000123"
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t.phone_number} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="05XXXXXXXX"
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t.track_button}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Verified Order Results Display */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8"
        >
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                طلب موثوق وقيد المتابعة
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono mt-0.5">
                {order.order_number}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                </span>
                <span>•</span>
                <span>العميل: <strong>{order.full_name}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {t[`status_${order.status}` as keyof typeof t] || order.status}
              </span>
            </div>
          </div>

          {/* STATUS TIMELINE PROGRESS */}
          <div className="space-y-4 py-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t.status_timeline}
            </h3>

            {/* Step progress bar */}
            <div className="relative">
              <div className="overflow-x-auto pb-4">
                <div className="flex items-center justify-between min-w-[620px] relative px-2">
                  {/* Connecting background line */}
                  <div className="absolute top-4 start-6 end-6 h-1 bg-neutral-200 dark:bg-neutral-800 z-0" />
                  {/* Progress active line */}
                  <div
                    className="absolute top-4 start-6 h-1 bg-amber-500 transition-all duration-500 z-0"
                    style={{
                      width: `${Math.max(0, Math.min(100, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%`,
                    }}
                  />

                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10 text-center w-20">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-500/20'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] mt-2 font-medium leading-tight ${
                            isCurrent
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : isDone
                              ? 'text-neutral-800 dark:text-neutral-200 font-semibold'
                              : 'text-neutral-400'
                          }`}
                        >
                          {language === 'ar' ? step.label_ar : language === 'fr' ? step.label_fr : step.label_en}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status History log */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">سجل التحديثات:</p>
                <div className="space-y-1.5">
                  {order.status_history.slice().reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[11px]">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        • {h.note || t[`status_${h.status}` as keyof typeof t] || h.status}
                      </span>
                      <span className="font-mono">{new Date(h.timestamp).toLocaleString('ar-DZ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Agency Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
              <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-500" />
                شركة التوصيل والولاية
              </h4>
              <p className="text-neutral-600 dark:text-neutral-300">
                الشركة: <strong className="text-neutral-900 dark:text-white">{order.delivery_agency_name}</strong>
              </p>
              <p className="text-neutral-600 dark:text-neutral-300">
                الولاية: <strong className="text-neutral-900 dark:text-white">{order.wilaya_name}</strong>
              </p>
              <p className="text-neutral-600 dark:text-neutral-300">
                نوع الاستلام:{' '}
                <strong className="text-neutral-900 dark:text-white">
                  {order.delivery_method === 'home' ? 'توصيل حتى باب المنزل' : 'استلام من مكتب الشركة (Stop Desk)'}
                </strong>
              </p>
              {order.delivery_address && (
                <p className="text-neutral-600 dark:text-neutral-300">
                  العنوان: <span className="font-medium">{order.delivery_address}</span>
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
              <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-500" />
                الحساب المالي (الدفع عند الاستلام)
              </h4>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>سعر المنتجات:</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>سعر التوصيل ({order.delivery_agency_name}):</span>
                <span className="font-medium">{formatPrice(order.delivery_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>الخصم:</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 font-extrabold text-sm text-neutral-900 dark:text-white">
                <span>الإجمالي المطلوب:</span>
                <span className="text-amber-600 dark:text-amber-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Ordered Products List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              المنتجات المرفقة بالطلب ({order.items?.length || 0})
            </h4>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4 bg-white dark:bg-neutral-900 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: it.color_hex_snapshot || '#111827' }}
                    >
                      {it.uploaded_design_url && (
                        <img src={it.uploaded_design_url} alt="Design" className="w-8 h-8 object-contain" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white">
                        {it.product_name_snapshot}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {it.color_snapshot} • مقاس {it.size_snapshot} • كمية {it.quantity}
                      </p>
                      {it.customization_data?.custom_text && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          نص مخصص: &quot;{it.customization_data.custom_text}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatPrice(it.unit_price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Back button */}
          <div className="pt-4 flex justify-between items-center">
            <button
              onClick={onBackToShop}
              className="px-5 py-2.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl transition flex items-center gap-2"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>العودة للمتجر</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تفاصيل الطلب</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
