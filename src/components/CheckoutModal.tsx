import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Truck,
  Building,
  Home,
  ShieldCheck,
  CheckCircle2,
  Tag,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Mail,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  Paperclip,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Wilaya, DeliveryAgency, DeliveryRate, Order } from '../types';
import { formatPrice } from '../lib/utils';
import { trackMetaPixelPurchase, trackMetaPixelInitiateCheckout } from '../lib/metaPixel';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, cartSubtotal, clearCart, updateItemImage } = useCart();
  const { t, isRtl } = useTheme();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(2); // Default Chlef (02) as in prompt
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('yalidine');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'office'>('home');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [orderAttachments, setOrderAttachments] = useState<string[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const orderFileInputRef = React.useRef<HTMLInputElement>(null);
  const itemFileInputRef = React.useRef<HTMLInputElement>(null);
  const activeItemIdForUpload = React.useRef<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Backend data
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [agencies, setAgencies] = useState<DeliveryAgency[]>([]);
  const [agencyRates, setAgencyRates] = useState<Record<string, DeliveryRate>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Quote & submission
  const [quote, setQuote] = useState<{
    subtotal: number;
    delivery_fee: number;
    discount: number;
    total: number;
    delivery_available: boolean;
    delivery_message?: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success screen state
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Fetch Wilayas and Agencies
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingData(true);
    Promise.all([
      fetch('/api/wilayas').then(res => res.json()),
      fetch('/api/agencies').then(res => res.json()),
    ])
      .then(([wData, aData]) => {
        setWilayas(wData);
        setAgencies(aData);
      })
      .catch(() => {})
      .finally(() => setIsLoadingData(false));
  }, [isOpen]);

  // Fetch rates for the currently selected Wilaya across all agencies
  useEffect(() => {
    if (!selectedWilayaId) return;
    fetch(`/api/rates?wilaya_id=${selectedWilayaId}`)
      .then(res => res.json())
      .then((rates: DeliveryRate[]) => {
        const map: Record<string, DeliveryRate> = {};
        rates.forEach(r => {
          map[r.agency_id] = r;
        });
        setAgencyRates(map);
      })
      .catch(() => {});
  }, [selectedWilayaId]);

  // Calculate authoritative quote from server
  useEffect(() => {
    if (!isOpen || cart.length === 0 || !selectedWilayaId || !selectedAgencyId) return;

    setIsCalculating(true);
    fetch('/api/orders/validate-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(it => ({
          product_id: it.product_id,
          variant_id: it.variant_id,
          quantity: it.quantity,
        })),
        wilaya_id: selectedWilayaId,
        delivery_agency_id: selectedAgencyId,
        delivery_method: deliveryMethod,
        coupon_code: appliedCoupon || undefined,
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          setQuote(data);
          setCouponDiscount(data.discount || 0);
        } else {
          setQuote({
            subtotal: cartSubtotal,
            delivery_fee: 0,
            discount: 0,
            total: cartSubtotal,
            delivery_available: false,
            delivery_message: data.delivery_message || data.error,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsCalculating(false));
  }, [isOpen, cart, selectedWilayaId, selectedAgencyId, deliveryMethod, appliedCoupon, cartSubtotal]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/orders/validate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(it => ({
            product_id: it.product_id,
            variant_id: it.variant_id,
            quantity: it.quantity,
          })),
          wilaya_id: selectedWilayaId,
          delivery_agency_id: selectedAgencyId,
          delivery_method: deliveryMethod,
          coupon_code: couponCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.discount === 0) {
        setCouponError(t.coupon_invalid);
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(couponCode.trim());
        setQuote(data);
        setCouponDiscount(data.discount);
      }
    } catch {
      setCouponError(t.coupon_invalid);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle Order Attachment Upload
  const handleTriggerOrderAttachment = () => {
    if (orderFileInputRef.current) {
      orderFileInputRef.current.value = '';
      orderFileInputRef.current.click();
    }
  };

  const handleOrderAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAttachment(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('designFile', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setOrderAttachments(prev => [...prev, data.url]);
        }
      }
    } catch {
      // handled
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setOrderAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Item-level Image Upload
  const handleTriggerItemUpload = (itemId: string) => {
    activeItemIdForUpload.current = itemId;
    if (itemFileInputRef.current) {
      itemFileInputRef.current.value = '';
      itemFileInputRef.current.click();
    }
  };

  const handleItemFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = activeItemIdForUpload.current;
    if (!file || !itemId) return;

    setUploadingItemId(itemId);
    try {
      const formData = new FormData();
      formData.append('designFile', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        updateItemImage(itemId, data.url);
      }
    } catch {
      // handled
    } finally {
      setUploadingItemId(null);
      activeItemIdForUpload.current = null;
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim()) {
      setSubmitError('يرجى إدخال الاسم واللقب الكامل');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setSubmitError('يرجى إدخال رقم هاتف جزائري صحيح للتواصل والتوصيل');
      return;
    }
    if (deliveryMethod === 'home' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setSubmitError('يرجى إدخال عنوان التوصيل المنزلي بالتفصيل');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: cleanPhone,
          email: email.trim() || undefined,
          wilaya_id: selectedWilayaId,
          delivery_agency_id: selectedAgencyId,
          delivery_method: deliveryMethod,
          delivery_address: deliveryAddress,
          customer_notes: customerNotes,
          coupon_code: appliedCoupon || undefined,
          attachment_urls: orderAttachments,
          items: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الطلب');
      }

      // Success
      setCreatedOrder(data);
      clearCart();
      trackMetaPixelPurchase(data);
      onOrderSuccess(data);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // confetti fallback
      }
    } catch (err: any) {
      setSubmitError(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWilaya = wilayas.find(w => w.id === selectedWilayaId);
  const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
  const activeRate = agencyRates[selectedAgencyId];

  // Current fee preview
  const currentDeliveryFee = quote?.delivery_fee ?? (activeRate ? (deliveryMethod === 'home' ? activeRate.home_price : activeRate.office_price) : 0);
  const currentTotal = quote?.total ?? Math.max(0, cartSubtotal + currentDeliveryFee - couponDiscount);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {createdOrder ? 'تم تأكيد طلبك بنجاح!' : t.checkout_title}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    الدفع عند الاستلام بعد المعاينة والتأكد من الجودة
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Order Successfully Created */}
            {createdOrder ? (
              <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    شكراً لك {createdOrder.full_name}! تم استلام طلبك بنجاح
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                    رقم الطلب الخاص بك هو:
                  </p>
                  <div className="inline-block px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <span className="text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
                      {createdOrder.order_number}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    سيتصل بك فريقنا هاتفياً على الرقم{' '}
                    <strong className="text-neutral-900 dark:text-white">{createdOrder.phone}</strong> لتأكيد الشحن والطباعة.
                  </p>
                </div>

                {/* Snapshot Card */}
                <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 text-start max-w-md mx-auto space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">شركة التوصيل:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {createdOrder.delivery_agency_name}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">الولاية وطريقة الاستلام:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {createdOrder.wilaya_name} ({createdOrder.delivery_method === 'home' ? 'منزلي' : 'مكتب'})
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">سعر التوصيل:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatPrice(createdOrder.delivery_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-extrabold">
                    <span className="text-neutral-900 dark:text-white">المبلغ الإجمالي:</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {formatPrice(createdOrder.total)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      // Navigate to track order
                      window.location.hash = `track-${createdOrder.order_number}`;
                    }}
                    className="flex-1 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>{t.nav_track_order}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-6 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl transition"
                  >
                    العودة للمتجر
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Customer and Delivery form */}
                  <div className="md:col-span-7 space-y-6">
                    {/* Section 1: Customer Info */}
                    <div className="space-y-4 bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-500" />
                        {t.customer_info}
                      </h3>

                      <div>
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          {t.full_name}
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder={t.full_name_placeholder}
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            {t.phone_number}
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              placeholder={t.phone_placeholder}
                              className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            {t.email_optional}
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t.email_placeholder}
                            className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Delivery Agency & Wilaya */}
                    <div className="space-y-4 bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-500" />
                        {t.delivery_info}
                      </h3>

                      {/* 1. Wilaya Selection (58 Wilayas) */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          {t.select_wilaya}
                        </label>
                        <select
                          value={selectedWilayaId}
                          onChange={e => setSelectedWilayaId(parseInt(e.target.value, 10))}
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white font-medium"
                        >
                          {(wilayas || []).map(w => (
                            <option key={w.id} value={w.id}>
                              {w.code} - {w.name_ar} ({w.name_fr})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Delivery Agency Selector with Live Rates for selected Wilaya */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                          {t.choose_agency}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {(agencies || []).map(agency => {
                            const rate = agencyRates[agency.id];
                            const isSelected = selectedAgencyId === agency.id;

                            return (
                              <button
                                type="button"
                                key={agency.id}
                                onClick={() => setSelectedAgencyId(agency.id)}
                                className={`p-3 rounded-xl border text-start flex flex-col justify-between transition relative ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
                                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                                      {agency.name}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                                  </div>
                                  <span className="text-[10px] text-neutral-400 block">
                                    {rate?.estimated_days || '2-4 أيام'}
                                  </span>
                                </div>

                                <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700/60 text-[11px] space-y-0.5">
                                  {rate ? (
                                    <>
                                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>المنزل:</span>
                                        <strong className="text-neutral-900 dark:text-white">
                                          {formatPrice(rate.home_price)}
                                        </strong>
                                      </div>
                                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>المكتب:</span>
                                        <strong className="text-amber-600 dark:text-amber-400">
                                          {formatPrice(rate.office_price)}
                                        </strong>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-red-500 font-medium">
                                      غير متاح لهذه الولاية
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Delivery Method Toggle (Home Delivery vs Office Delivery) */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                          {t.delivery_method}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod('home')}
                            className={`p-3.5 rounded-xl border text-start flex items-start gap-3 transition ${
                              deliveryMethod === 'home'
                                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                            }`}
                          >
                            <Home className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                  {t.home_delivery}
                                </span>
                                {activeRate && (
                                  <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                                    {formatPrice(activeRate.home_price)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                {t.home_delivery_desc}
                              </p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeliveryMethod('office')}
                            className={`p-3.5 rounded-xl border text-start flex items-start gap-3 transition ${
                              deliveryMethod === 'office'
                                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                            }`}
                          >
                            <Building className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                  {t.office_delivery}
                                </span>
                                {activeRate && (
                                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {formatPrice(activeRate.office_price)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                {t.office_delivery_desc}
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* 4. Address Details if Home */}
                      {deliveryMethod === 'home' ? (
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            {t.address_field}
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={deliveryAddress}
                            onChange={e => setDeliveryAddress(e.target.value)}
                            placeholder={t.address_placeholder}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white resize-none"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-neutral-700 dark:text-neutral-300">
                          <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Building className="w-4 h-4" />
                            استلام من مكتب {selectedAgency?.name} في ولاية {selectedWilaya?.name_ar}
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                            سيرسل لك الناقل رسالة نصية SMS فور وصول الطرد إلى أقرب فرع في ولايتك، ومعك بطاقة الهوية للاستلام والدفع.
                          </p>
                        </div>
                      )}

                      {/* Optional customer notes */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          ملاحظات إضافية للتوصيل (اختياري)
                        </label>
                        <input
                          type="text"
                          value={customerNotes}
                          onChange={e => setCustomerNotes(e.target.value)}
                          placeholder="مثال: التوصيل مساءً بعد الساعة الخامسة..."
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                      </div>

                      {/* 5. Attach Images / Designs (Mug, T-shirt, Hoodie, Custom artwork) */}
                      <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                            <Paperclip className="w-4 h-4 text-amber-500" />
                            إرفاق صور وتصاميم للطلب (كوب، تيشيرت، هودي)
                          </label>
                          <button
                            type="button"
                            onClick={handleTriggerOrderAttachment}
                            disabled={isUploadingAttachment}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            {isUploadingAttachment ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>رفع صورة للطلب</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          يمكنك إرفاق صورك الخاصة، شعار شركتك، أو تصاميم الطباعة المراد وضعها على التيشيرت، الهودي أو الكوب.
                        </p>

                        {/* Attachment thumbnails preview */}
                        {orderAttachments.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                            {orderAttachments.map((url, idx) => (
                              <div
                                key={idx}
                                className="relative group rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 aspect-square"
                              >
                                <img
                                  src={url}
                                  alt={`مرفق ${idx + 1}`}
                                  className="w-full h-full object-contain p-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachment(idx)}
                                  className="absolute top-1 end-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                                  title="حذف الصورة"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Order Summary & Authoritative Calculation */}
                  <div className="md:col-span-5 space-y-5">
                    {/* Items snapshot list */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        المنتجات المطلوبة ({cart?.length || 0})
                      </h3>
                      <div className="max-h-48 overflow-y-auto space-y-2.5 divide-y divide-neutral-200 dark:divide-neutral-700/60">
                        {(cart || []).map(it => (
                          <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
                                <div
                                  className="w-6 h-6 rounded-full opacity-30"
                                  style={{ backgroundColor: it.color_hex }}
                                />
                                {(it.uploaded_design_url || it.customization?.image_url) && (
                                  <img
                                    src={it.uploaded_design_url || it.customization?.image_url}
                                    alt="Design"
                                    className="absolute inset-0 w-full h-full object-contain p-0.5"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-neutral-900 dark:text-white truncate">
                                  {it.product_name}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                                  <span>{it.color} / {it.size} x{it.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleTriggerItemUpload(it.id)}
                                    disabled={uploadingItemId === it.id}
                                    className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                                  >
                                    {uploadingItemId === it.id ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    ) : (
                                      <ImageIcon className="w-2.5 h-2.5" />
                                    )}
                                    {it.uploaded_design_url || it.customization?.image_url
                                      ? 'تغيير الصورة'
                                      : 'إرفاق صورة'}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
                              {formatPrice(it.unit_price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coupon Input */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        {t.coupon_code}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="DZPRINT10"
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          disabled={isApplyingCoupon}
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
                        >
                          {isApplyingCoupon ? '...' : t.apply_coupon}
                        </button>
                      </div>
                      {appliedCoupon && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ {t.coupon_applied} ({appliedCoupon})
                        </p>
                      )}
                      {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
                    </div>

                    {/* Pricing Calculation Breakdown */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        {t.order_summary}
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>{t.subtotal}:</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {formatPrice(cartSubtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center gap-1">
                            <span>{t.delivery_fee}</span>
                            <span className="text-[10px] text-neutral-400">
                              ({selectedAgency?.name} - {deliveryMethod === 'home' ? 'منزل' : 'مكتب'})
                            </span>
                          </span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {formatPrice(currentDeliveryFee)}
                          </span>
                        </div>

                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>{t.discount}:</span>
                            <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-sm sm:text-base">
                          <span className="font-extrabold text-neutral-900 dark:text-white">
                            {t.total}:
                          </span>
                          <span className="font-extrabold text-lg sm:text-xl text-amber-600 dark:text-amber-400">
                            {isCalculating ? (
                              <Loader2 className="w-5 h-5 animate-spin inline-block" />
                            ) : (
                              formatPrice(currentTotal)
                            )}
                          </span>
                        </div>
                      </div>

                      {quote?.delivery_available === false && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{quote.delivery_message || t.agency_unavailable}</span>
                        </div>
                      )}

                      {submitError && (
                        <p className="text-xs text-red-500 font-semibold p-2 bg-red-50 dark:bg-red-950/40 rounded-lg">
                          {submitError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || quote?.delivery_available === false}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t.order_processing}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5" />
                            <span>{t.confirm_order}</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        دفع آمن 100% نقداً عند الاستلام بعد فحص الطرد
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <input
              type="file"
              ref={orderFileInputRef}
              onChange={handleOrderAttachmentChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={itemFileInputRef}
              onChange={handleItemFileChange}
              accept="image/*"
              className="hidden"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
