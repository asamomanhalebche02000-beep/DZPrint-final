import React from 'react';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Printer, X } from 'lucide-react';

interface OrderPrintSheetProps {
  order: Order;
  onClose: () => void;
}

export const OrderPrintSheet: React.FC<OrderPrintSheetProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-black w-full max-w-3xl rounded-2xl shadow-2xl p-8 border border-neutral-300 print:border-none print:shadow-none print:max-w-none print:p-6 my-auto">
        {/* Actions bar (hidden during print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200 print:hidden">
          <span className="font-bold text-sm text-neutral-800">
            معاينة وصل الطلب للطباعة والتغليف
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل الآن</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div className="space-y-6 text-neutral-900 font-sans" dir="rtl">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                ديزاد برينت | DzPrint Studio
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                ورشة الطباعة الرقمية والتخصيص الحراري • الجزائر العاصمة
              </p>
              <p className="text-xs text-neutral-600">
                هاتف الورشة: 0550 12 34 56 • WhatsApp: +213550123456
              </p>
            </div>
            <div className="text-start">
              <span className="text-[11px] font-bold text-neutral-500 block uppercase">وصل تجهيز وشحن</span>
              <span className="text-xl font-mono font-extrabold text-neutral-900">
                {order.order_number}
              </span>
              <p className="text-xs text-neutral-500 mt-0.5">
                تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-DZ')}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Matrix */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-neutral-700 block border-b pb-1">معلومات المستلم:</span>
              <p><strong className="text-neutral-900">الاسم:</strong> {order.full_name}</p>
              <p><strong className="text-neutral-900">الهاتف:</strong> {order.phone}</p>
              {order.email && <p><strong className="text-neutral-900">البريد:</strong> {order.email}</p>}
              {order.customer_notes && (
                <p className="text-amber-800 mt-1">
                  <strong>ملاحظات الزبون:</strong> {order.customer_notes}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-neutral-700 block border-b pb-1">بيانات الشحن والتوصيل:</span>
              <p><strong className="text-neutral-900">الولاية:</strong> {order.wilaya_name || order.wilaya_id}</p>
              <p><strong className="text-neutral-900">شركة التوصيل:</strong> {order.delivery_agency_name}</p>
              <p>
                <strong className="text-neutral-900">نوع التسليم:</strong>{' '}
                <span className="px-2 py-0.5 bg-neutral-200 rounded font-bold">
                  {order.delivery_method === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب (Stop Desk)'}
                </span>
              </p>
              <p><strong className="text-neutral-900">العنوان:</strong> {order.delivery_address || 'استلام من مكتب الشركة'}</p>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <table className="w-full text-xs text-start border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                  <th className="p-2.5 text-start">المنتج والتفاصيل</th>
                  <th className="p-2.5 text-center">اللون والمقاس</th>
                  <th className="p-2.5 text-center">معاينة التصميم</th>
                  <th className="p-2.5 text-center">الكمية</th>
                  <th className="p-2.5 text-start">سعر الوحدة</th>
                  <th className="p-2.5 text-start">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold">
                      {it.product_name_snapshot}
                      {it.customization_data?.custom_text && (
                        <p className="text-[10px] text-neutral-600 font-normal">
                          نص: &quot;{it.customization_data.custom_text}&quot;
                        </p>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="font-semibold">{it.color_snapshot}</span> / {it.size_snapshot}
                    </td>
                    <td className="p-2.5 text-center">
                      {it.uploaded_design_url ? (
                        <img
                          src={it.uploaded_design_url}
                          alt="Design"
                          className="w-12 h-12 object-contain mx-auto border border-neutral-200 rounded p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-neutral-400">تصميم افتراضي</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                    <td className="p-2.5">{formatPrice(it.unit_price)}</td>
                    <td className="p-2.5 font-bold">{formatPrice(it.unit_price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs bg-neutral-50 p-4 border border-neutral-200 rounded-xl">
              <div className="flex justify-between text-neutral-600">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>تكلفة التوصيل ({order.delivery_agency_name}):</span>
                <span className="font-semibold">{formatPrice(order.delivery_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم:</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-300 font-black text-sm text-neutral-900">
                <span>المبلغ للدفع عند الاستلام:</span>
                <span className="text-base font-mono">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Barcode/Footer */}
          <div className="border-t border-neutral-300 pt-4 flex justify-between items-center text-[10px] text-neutral-500">
            <span>شكراً لاختياركم ديزاد برينت • يُرجى تثبيت هذا الوصل مع الطرد المجهز للشحن</span>
            <span className="font-mono">{order.order_number}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
