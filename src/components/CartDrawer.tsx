import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../lib/utils';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, updateItemImage, cartSubtotal, isCartOpen, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const { t, isRtl } = useTheme();
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetItemIdRef = useRef<string | null>(null);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleTriggerUpload = (itemId: string) => {
    targetItemIdRef.current = itemId;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = targetItemIdRef.current;
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
      // error handled
    } finally {
      setUploadingItemId(null);
      targetItemIdRef.current = null;
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 end-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white dark:bg-neutral-900 shadow-2xl flex flex-col border-s border-neutral-200 dark:border-neutral-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {t.cart_title}
                    </h2>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      ({cart.length} {cart.length === 1 ? 'عنصر' : 'عناصر'})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {t.cart_empty}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                        {t.cart_empty_sub}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      {t.start_shopping}
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800"
                    >
                      {/* Thumbnail with custom design preview */}
                      <div className="relative w-20 h-20 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-center overflow-hidden">
                        <div
                          className="w-12 h-12 rounded-full opacity-40"
                          style={{ backgroundColor: item.color_hex }}
                        />
                        {(item.uploaded_design_url || item.customization?.image_url) && (
                          <img
                            src={item.uploaded_design_url || item.customization?.image_url}
                            alt="Design"
                            className="absolute w-12 h-12 object-contain"
                          />
                        )}
                        {item.customization?.custom_text && !item.uploaded_design_url && (
                          <span className="absolute text-[9px] font-bold text-amber-600 dark:text-amber-400 truncate max-w-[50px]">
                            {item.customization.custom_text}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {item.product_name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-neutral-400 hover:text-red-500 transition p-1"
                              title={t.remove}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                                style={{ backgroundColor: item.color_hex }}
                              />
                              {item.color}
                            </span>
                            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 bg-neutral-200/60 dark:bg-neutral-700/60 rounded">
                              {item.size}
                            </span>
                          </div>

                          {item.customization?.custom_text && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 truncate mt-0.5">
                              نص: &quot;{item.customization.custom_text}&quot;
                            </p>
                          )}

                          {/* Image Attachment Trigger */}
                          <div className="mt-1.5">
                            {item.uploaded_design_url || item.customization?.image_url ? (
                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(item.id)}
                                disabled={uploadingItemId === item.id}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
                              >
                                {uploadingItemId === item.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ImageIcon className="w-3 h-3" />
                                )}
                                <span>صورة مخصصة مرفقة (اضغط للتغيير)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(item.id)}
                                disabled={uploadingItemId === item.id}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded transition"
                              >
                                {uploadingItemId === item.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Upload className="w-3 h-3" />
                                )}
                                <span>إرفاق صورة للطباعة</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700/60">
                          <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1.5 text-neutral-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                            {formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {t.subtotal}
                    </span>
                    <span className="font-extrabold text-lg text-neutral-900 dark:text-white">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400">
                    {t.delivery_calculated_at_checkout}
                  </p>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <span>{t.checkout_btn}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </AnimatePresence>
  );
};
