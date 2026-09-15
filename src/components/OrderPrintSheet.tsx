import React from 'react';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Printer, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface OrderPrintSheetProps {
  order: Order;
  onClose: () => void;
}

export const OrderPrintSheet: React.FC<OrderPrintSheetProps> = ({ order, onClose }) => {
  const { language, isRtl } = useTheme();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-black w-full max-w-3xl rounded-2xl shadow-2xl p-8 border border-neutral-300 print:border-none print:shadow-none print:max-w-none print:p-6 my-auto">
        {/* Actions bar (hidden during print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200 print:hidden">
          <span className="font-bold text-sm text-neutral-800">
            {language === 'ar' ? 'معاينة وصل الطلب للطباعة والتغليف' : language === 'fr' ? 'Aperçu du bordereau d’expédition' : 'Order packing slip preview'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة الوصل الآن' : language === 'fr' ? 'Imprimer le bordereau' : 'Print Slip Now'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div className="space-y-6 text-neutral-900 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                {language === 'ar' ? 'ديزاد برينت | DzPrint Studio' : 'DzPrint Studio | Custom Printing'}
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                {language === 'ar'
                  ? 'ورشة الطباعة الرقمية والتخصيص الحراري • الجزائر العاصمة'
                  : language === 'fr'
                  ? 'Atelier d’impression numérique et personnalisation textile • Alger'
                  : 'Digital Printing & Apparel Customization Workshop • Algiers'}
              </p>
              <p className="text-xs text-neutral-600">
                {language === 'ar' ? 'هاتف الورشة: 0550 12 34 56 • WhatsApp: +213550123456' : 'Phone: 0550 12 34 56 • WhatsApp: +213550123456'}
              </p>
            </div>
            <div className={isRtl ? 'text-start' : 'text-end'}>
              <span className="text-[11px] font-bold text-neutral-500 block uppercase">
                {language === 'ar' ? 'وصل تجهيز وشحن' : language === 'fr' ? 'Bordereau de livraison' : 'Packing & Delivery Slip'}
              </span>
              <span className="text-xl font-mono font-extrabold text-neutral-900">
                {order.order_number}
              </span>
              <p className="text-xs text-neutral-500 mt-0.5">
                {language === 'ar' ? 'تاريخ الطلب:' : language === 'fr' ? 'Date:' : 'Order Date:'}{' '}
                {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Matrix */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-neutral-700 block border-b pb-1">
                {language === 'ar' ? 'معلومات المستلم:' : language === 'fr' ? 'Destinataire :' : 'Recipient Info:'}
              </span>
              <p><strong className="text-neutral-900">{language === 'ar' ? 'الاسم:' : language === 'fr' ? 'Nom :' : 'Name:'}</strong> {order.full_name}</p>
              <p><strong className="text-neutral-900">{language === 'ar' ? 'الهاتف:' : language === 'fr' ? 'Téléphone :' : 'Phone:'}</strong> {order.phone}</p>
              {order.email && <p><strong className="text-neutral-900">{language === 'ar' ? 'البريد:' : 'Email:'}</strong> {order.email}</p>}
              {order.customer_notes && (
                <p className="text-amber-800 mt-1">
                  <strong>{language === 'ar' ? 'ملاحظات الزبون:' : language === 'fr' ? 'Notes du client :' : 'Customer Notes:'}</strong> {order.customer_notes}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-neutral-700 block border-b pb-1">
                {language === 'ar' ? 'بيانات الشحن والتوصيل:' : language === 'fr' ? 'Détails de livraison :' : 'Shipping & Delivery Details:'}
              </span>
              <p><strong className="text-neutral-900">{language === 'ar' ? 'الولاية:' : 'Wilaya:'}</strong> {order.wilaya_name || order.wilaya_id}</p>
              <p><strong className="text-neutral-900">{language === 'ar' ? 'شركة التوصيل:' : language === 'fr' ? 'Agence :' : 'Delivery Agency:'}</strong> {order.delivery_agency_name}</p>
              <p>
                <strong className="text-neutral-900">{language === 'ar' ? 'نوع التسليم:' : language === 'fr' ? 'Type :' : 'Delivery Type:'}</strong>{' '}
                <span className="px-2 py-0.5 bg-neutral-200 rounded font-bold">
                  {order.delivery_method === 'home'
                    ? (language === 'ar' ? 'توصيل للمنزل' : language === 'fr' ? 'À Domicile' : 'Home Delivery')
                    : (language === 'ar' ? 'استلام من المكتب (Stop Desk)' : 'Stop Desk')}
                </span>
              </p>
              <p><strong className="text-neutral-900">{language === 'ar' ? 'العنوان:' : language === 'fr' ? 'Adresse :' : 'Address:'}</strong> {order.delivery_address || (language === 'ar' ? 'استلام من مكتب الشركة' : 'Stop Desk Pickup')}</p>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <table className="w-full text-xs text-start border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                  <th className="p-2.5 text-start">{language === 'ar' ? 'المنتج والتفاصيل' : language === 'fr' ? 'Produit & Détails' : 'Product & Details'}</th>
                  <th className="p-2.5 text-center">{language === 'ar' ? 'اللون والمقاس' : language === 'fr' ? 'Couleur / Taille' : 'Color / Size'}</th>
                  <th className="p-2.5 text-center">{language === 'ar' ? 'معاينة التصميم' : language === 'fr' ? 'Visuel' : 'Design Preview'}</th>
                  <th className="p-2.5 text-center">{language === 'ar' ? 'الكمية' : language === 'fr' ? 'Qté' : 'Qty'}</th>
                  <th className="p-2.5 text-start">{language === 'ar' ? 'سعر الوحدة' : language === 'fr' ? 'Prix unitaire' : 'Unit Price'}</th>
                  <th className="p-2.5 text-start">{language === 'ar' ? 'المجموع' : language === 'fr' ? 'Total' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold">
                      {it.product_name_snapshot}
                      {it.customization_data?.custom_text && (
                        <p className="text-[10px] text-neutral-600 font-normal">
                          {language === 'ar' ? 'نص:' : 'Text:'} &quot;{it.customization_data.custom_text}&quot;
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
                        <span className="text-[10px] text-neutral-400">
                          {language === 'ar' ? 'تصميم افتراضي' : language === 'fr' ? 'Visuel standard' : 'Standard'}
                        </span>
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
                <span>{language === 'ar' ? 'المجموع الفرعي:' : language === 'fr' ? 'Sous-total :' : 'Subtotal:'}</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{language === 'ar' ? `تكلفة التوصيل (${order.delivery_agency_name}):` : language === 'fr' ? `Livraison (${order.delivery_agency_name}) :` : `Delivery (${order.delivery_agency_name}):`}</span>
                <span className="font-semibold">{formatPrice(order.delivery_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{language === 'ar' ? 'الخصم:' : language === 'fr' ? 'Remise :' : 'Discount:'}</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-300 font-black text-sm text-neutral-900">
                <span>{language === 'ar' ? 'المبلغ للدفع عند الاستلام:' : language === 'fr' ? 'Net à payer (COD) :' : 'Total to pay (COD):'}</span>
                <span className="text-base font-mono">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Barcode/Footer */}
          <div className="border-t border-neutral-300 pt-4 flex justify-between items-center text-[10px] text-neutral-500">
            <span>
              {language === 'ar'
                ? 'شكراً لاختياركم ديزاد برينت • يُرجى تثبيت هذا الوصل مع الطرد المجهز للشحن'
                : language === 'fr'
                ? 'Merci pour votre confiance • Joindre ce bordereau au colis d’expédition'
                : 'Thank you for choosing DzPrint • Please attach this slip with the shipment parcel'}
            </span>
            <span className="font-mono">{order.order_number}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
