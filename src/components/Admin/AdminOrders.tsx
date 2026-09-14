import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Printer,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Home,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../lib/utils';
import { OrderPrintSheet } from '../OrderPrintSheet';
import { adminFetch } from '../../lib/adminAuth';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  received: { label: 'استلام الطلب', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  confirmed: { label: 'مؤكد هاتفياً', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  preparing: { label: 'تجهيز القطعة', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  printing: { label: 'قيد الطباعة الحرارية', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  ready: { label: 'جاهز للتغليف', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  shipped: { label: 'تم الشحن مع الناقل', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
  out_for_delivery: { label: 'خرج للتوصيل للزبون', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  delivered: { label: 'تم التوصيل واستلام المبلغ', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  cancelled: { label: 'ملغي / راجع', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
};

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');

  // Updating order status state
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState<string | null>(null);

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/generate-invoice`, {
        method: 'POST',
      });
      if (res.ok) {
        const inv = await res.json();
        setInvoiceSuccessMsg(`تم إصدار فاتورة رسمية بنجاح: ${inv.invoice_number}`);
        setTimeout(() => setInvoiceSuccessMsg(null), 5000);
      }
    } catch {
      // ignore
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await adminFetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        o =>
          o.order_number.toLowerCase().includes(q) ||
          o.full_name.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          (o.wilaya_name && o.wilaya_name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (agencyFilter !== 'all') {
      result = result.filter(o => o.delivery_agency_id === agencyFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, agencyFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote.trim() || undefined,
        }),
      });
      const updated = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
        setStatusNote('');
      }
    } catch {
      // ignore
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getWhatsAppLink = (phone: string, orderNumber: string, name: string) => {
    const clean = phone.replace(/^0/, '213').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `السلام عليكم أخي ${name}، بخصوص طلبك رقم ${orderNumber} من متجر ديزاد برينت للطباعة المخصصة. هل نؤكد شحن الطلب؟`
    );
    return `https://wa.me/${clean}?text=${message}`;
  };

  const handleExportCsv = () => {
    // Generate CSV of current orders
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Wilaya',
      'Agency',
      'Method',
      'Items Count',
      'Subtotal',
      'Delivery Fee',
      'Total',
      'Status',
    ];
    const rows = filteredOrders.map(o => [
      o.order_number,
      o.created_at,
      `"${o.full_name}"`,
      o.phone,
      `"${o.wilaya_name || o.wilaya_id}"`,
      o.delivery_agency_name,
      o.delivery_method,
      o.items.length,
      o.subtotal,
      o.delivery_fee,
      o.total,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dzprint_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            إدارة الطلبيات والمبيعات ({orders.length})
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            متابعة مراحل الإنتاج، تأكيد الاتصال، تحميل تصاميم الزبائن، وطباعة وصول الشحن
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>تصدير الطلبيات CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، أو الولاية..."
            className="w-full ps-9 pe-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200"
          >
            <option value="all">كل الحالات ({orders.length})</option>
            {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
              <option key={st} value={st}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Agency filter */}
          <select
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200"
          >
            <option value="all">كل شركات التوصيل</option>
            <option value="yalidine">Yalidine Express</option>
            <option value="procolis">Procolis</option>
            <option value="maystro">Maystro Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
              <tr>
                <th className="p-3.5 text-start">رقم الطلب</th>
                <th className="p-3.5 text-start">العميل والهاتف</th>
                <th className="p-3.5 text-start">الولاية والتوصيل</th>
                <th className="p-3.5 text-start">المنتجات والتصاميم</th>
                <th className="p-3.5 text-start">المبلغ الإجمالي</th>
                <th className="p-3.5 text-center">الحالة</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    لا توجد طلبات تطابق الفلتر
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const statusInfo = STATUS_CONFIG[order.status] || {
                    label: order.status,
                    color: 'bg-neutral-100 text-neutral-700',
                  };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-neutral-900 dark:text-white block">
                          {order.order_number}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          {order.full_name}
                        </span>
                        <span className="font-mono text-neutral-500 text-[11px]">
                          {order.phone}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                          {order.wilaya_name || order.wilaya_id}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                          <span>{order.delivery_agency_name}</span>
                          <span>•</span>
                          <span>{order.delivery_method === 'home' ? 'منزل' : 'مكتب'}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {order.items.length} {order.items.length === 1 ? 'عنصر' : 'عناصر'}
                          </span>
                          {order.items.some(it => it.uploaded_design_url) && (
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold">
                              تصميم مخصص
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {formatPrice(order.total)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-neutral-500 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                            title="تفاصيل الطلب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToPrint(order)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                            title="طباعة وصل الشحن"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white font-mono">
                    تفاصيل الطلب: {selectedOrder.order_number}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    بتاريخ {new Date(selectedOrder.created_at).toLocaleString('ar-DZ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderToPrint(selectedOrder)}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الوصل</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Customer Contact Action Bar */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block">بيانات العميل المستلم:</span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">
                    {selectedOrder.full_name}
                  </span>
                  <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300 ms-2">
                    ({selectedOrder.phone})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateInvoice(selectedOrder.id)}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="توليد فاتورة رسمية من بيانات هذا الطلب"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>إصدار فاتورة (Facture)</span>
                  </button>
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال بالزبون</span>
                  </a>
                  <a
                    href={getWhatsAppLink(selectedOrder.phone, selectedOrder.order_number, selectedOrder.full_name)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب WhatsApp</span>
                  </a>
                </div>
              </div>

              {invoiceSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{invoiceSuccessMsg}</span>
                </div>
              )}

              {/* Status Update Controls */}
              <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-3">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  تحديث حالة الطلب وإرسال التنبيه
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([st, cfg]) => {
                    const isCurrent = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(selectedOrder.id, st as OrderStatus)}
                        className={`p-2 rounded-lg text-xs font-bold border text-center transition ${
                          isCurrent
                            ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-400'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="أضف ملاحظة للمرحلة (مثال: تم إرسال الطرد مع السائق فلان)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Delivery info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <span className="font-bold text-neutral-900 dark:text-white block border-b pb-1">
                    وجهة وتفاصيل الشحن:
                  </span>
                  <p>الولاية: <strong>{selectedOrder.wilaya_name || selectedOrder.wilaya_id}</strong></p>
                  <p>شركة التوصيل: <strong>{selectedOrder.delivery_agency_name}</strong></p>
                  <p>
                    نوع التوصيل:{' '}
                    <strong>{selectedOrder.delivery_method === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب (Stop Desk)'}</strong>
                  </p>
                  {selectedOrder.delivery_address && (
                    <p>العنوان: <span>{selectedOrder.delivery_address}</span></p>
                  )}
                  {selectedOrder.customer_notes && (
                    <p className="text-amber-600">ملاحظات الزبون: {selectedOrder.customer_notes}</p>
                  )}
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <span className="font-bold text-neutral-900 dark:text-white block border-b pb-1">
                    الحساب المالي:
                  </span>
                  <div className="flex justify-between">
                    <span>قيمة المنتجات:</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>قيمة التوصيل ({selectedOrder.delivery_agency_name}):</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.delivery_fee)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>الخصم:</span>
                      <span className="font-bold">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t text-sm font-extrabold text-neutral-900 dark:text-white">
                    <span>المبلغ الكلي للتحصيل:</span>
                    <span className="text-amber-600 dark:text-amber-400">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Products & Designs List with Downloads */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                  القطع وتفاصيل التصاميم المرفوعة ({selectedOrder.items.length}):
                </span>

                <div className="space-y-3">
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ backgroundColor: it.color_hex_snapshot || '#111827' }}
                        >
                          {it.uploaded_design_url && (
                            <img src={it.uploaded_design_url} alt="Design" className="w-10 h-10 object-contain" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-sm text-neutral-900 dark:text-white">
                            {it.product_name_snapshot}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-neutral-500">
                            <span>اللون: <strong>{it.color_snapshot}</strong></span>
                            <span>•</span>
                            <span>المقاس: <strong>{it.size_snapshot}</strong></span>
                            <span>•</span>
                            <span>الكمية: <strong>{it.quantity}</strong></span>
                          </div>
                          {it.customization_data?.custom_text && (
                            <p className="text-amber-600 dark:text-amber-400 font-semibold mt-1">
                              نص مطلوب للطباعة: &quot;{it.customization_data.custom_text}&quot;
                            </p>
                          )}
                          {it.customization_data?.user_instructions && (
                            <p className="text-neutral-400 text-[11px] mt-0.5">
                              تعليمات الزبون: {it.customization_data.user_instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
                          {formatPrice(it.unit_price * it.quantity)}
                        </span>

                        {it.uploaded_design_url && (
                          <a
                            href={it.uploaded_design_url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>تحميل صورة التصميم</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Packing Slip Modal */}
      {orderToPrint && (
        <OrderPrintSheet
          order={orderToPrint}
          onClose={() => setOrderToPrint(null)}
        />
      )}
    </div>
  );
};
