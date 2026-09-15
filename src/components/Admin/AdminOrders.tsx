import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Eye,
  Printer,
  Phone,
  MessageCircle,
  Download,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../lib/utils';
import { OrderPrintSheet } from '../OrderPrintSheet';
import { adminFetch } from '../../lib/adminAuth';
import { useTheme } from '../../context/ThemeContext';

export const AdminOrders: React.FC = () => {
  const { t, language, isRtl } = useTheme();

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

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return { label: t.status_received, color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'confirmed':
        return { label: t.status_confirmed, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' };
      case 'preparing':
        return { label: t.status_preparing, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      case 'printing':
        return { label: t.status_printing, color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' };
      case 'ready':
        return { label: t.status_ready, color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'shipped':
        return { label: t.status_shipped, color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' };
      case 'out_for_delivery':
        return { label: t.status_out_for_delivery, color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' };
      case 'delivered':
        return { label: t.status_delivered, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'cancelled':
        return { label: t.status_cancelled, color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' };
      default:
        return { label: status, color: 'bg-neutral-100 text-neutral-700' };
    }
  };

  const allStatuses: OrderStatus[] = [
    'received',
    'confirmed',
    'preparing',
    'printing',
    'ready',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/generate-invoice`, {
        method: 'POST',
      });
      if (res.ok) {
        const inv = await res.json();
        const msg =
          language === 'ar'
            ? `تم إصدار فاتورة رسمية بنجاح: ${inv.invoice_number}`
            : language === 'fr'
            ? `Facture officielle générée avec succès : ${inv.invoice_number}`
            : `Official invoice generated successfully: ${inv.invoice_number}`;
        setInvoiceSuccessMsg(msg);
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
      if (Array.isArray(data)) {
        setOrders(data);
      }
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
    const message =
      language === 'ar'
        ? `السلام عليكم أخي ${name}، بخصوص طلبك رقم ${orderNumber} من متجر ديزاد برينت للطباعة المخصصة. هل نؤكد شحن الطلب؟`
        : language === 'fr'
        ? `Bonjour ${name}, concernant votre commande ${orderNumber} sur DzPrint. Confirmez-vous l'expédition ?`
        : `Hello ${name}, regarding your order ${orderNumber} on DzPrint. Shall we confirm shipment?`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  const handleExportCsv = () => {
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

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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
            <span>{t.orders}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
              {orders.length}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'متابعة مراحل الإنتاج، تأكيد الاتصال، تحميل تصاميم الزبائن، وطباعة وصول الشحن'
              : language === 'fr'
              ? 'Suivi de production, confirmation téléphonique, téléchargement des designs et bons d’expédition'
              : 'Track production stages, phone confirmations, customer design downloads, and shipping slips'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t.export_csv}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث برقم الطلب، اسم العميل، الهاتف، أو الولاية...'
                : language === 'fr'
                ? 'Rechercher par N° commande, client, téléphone, wilaya...'
                : 'Search by order #, customer name, phone, wilaya...'
            }
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
            <option value="all">
              {language === 'ar'
                ? `كل الحالات (${orders.length})`
                : language === 'fr'
                ? `Tous les statuts (${orders.length})`
                : `All Statuses (${orders.length})`}
            </option>
            {allStatuses.map(st => (
              <option key={st} value={st}>
                {getStatusConfig(st).label}
              </option>
            ))}
          </select>

          {/* Agency filter */}
          <select
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200"
          >
            <option value="all">
              {language === 'ar'
                ? 'كل شركات التوصيل'
                : language === 'fr'
                ? 'Toutes les agences'
                : 'All Delivery Agencies'}
            </option>
            <option value="yalidine">Yalidine Express</option>
            <option value="procolis">Procolis</option>
            <option value="maystro">Maystro Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
              <tr>
                <th className="p-3.5 text-start">{t.order_number}</th>
                <th className="p-3.5 text-start">
                  {language === 'ar' ? 'العميل والهاتف' : language === 'fr' ? 'Client & Tél' : 'Customer & Phone'}
                </th>
                <th className="p-3.5 text-start">
                  {language === 'ar' ? 'الولاية والتوصيل' : language === 'fr' ? 'Wilaya & Livraison' : 'Wilaya & Delivery'}
                </th>
                <th className="p-3.5 text-start">
                  {language === 'ar' ? 'المنتجات والتصاميم' : language === 'fr' ? 'Articles & Visuels' : 'Items & Designs'}
                </th>
                <th className="p-3.5 text-start">{t.total}</th>
                <th className="p-3.5 text-center">
                  {language === 'ar' ? 'الحالة' : language === 'fr' ? 'Statut' : 'Status'}
                </th>
                <th className="p-3.5 text-center">
                  {language === 'ar' ? 'إجراءات' : language === 'fr' ? 'Actions' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    {language === 'ar'
                      ? 'لا توجد طلبات تطابق الفلتر'
                      : language === 'fr'
                      ? 'Aucune commande ne correspond aux filtres'
                      : 'No orders match current filters'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const statusInfo = getStatusConfig(order.status);

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
                          {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US')}
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
                          <span>
                            {order.delivery_method === 'home'
                              ? language === 'ar' ? 'منزل' : language === 'fr' ? 'Domicile' : 'Home'
                              : language === 'ar' ? 'مكتب' : language === 'fr' ? 'Bureau' : 'Office'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {order.items.length}{' '}
                            {order.items.length === 1
                              ? language === 'ar' ? 'عنصر' : language === 'fr' ? 'article' : 'item'
                              : language === 'ar' ? 'عناصر' : language === 'fr' ? 'articles' : 'items'}
                          </span>
                          {order.items.some(it => it.uploaded_design_url) && (
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold">
                              {language === 'ar' ? 'تصميم مخصص' : language === 'fr' ? 'Design DTF' : 'Custom DTF'}
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
                            className="p-1.5 text-neutral-500 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                            title={language === 'ar' ? 'تفاصيل الطلب' : language === 'fr' ? 'Détails' : 'Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToPrint(order)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                            title={t.print_order}
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

      {/* Order Details Modal */}
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
                    {t.order_number}: {selectedOrder.order_number}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {new Date(selectedOrder.created_at).toLocaleString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderToPrint(selectedOrder)}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.print_order}</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Customer Contact Action Bar */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block">{t.customer_info}:</span>
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
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    title={language === 'ar' ? 'توليد فاتورة رسمية من بيانات هذا الطلب' : 'Générer facture'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إصدار فاتورة' : language === 'fr' ? 'Facture' : 'Generate Invoice'}</span>
                  </button>
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'اتصال بالزبون' : language === 'fr' ? 'Appeler' : 'Call'}</span>
                  </a>
                  <a
                    href={getWhatsAppLink(selectedOrder.phone, selectedOrder.order_number, selectedOrder.full_name)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
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
                  {language === 'ar' ? 'تحديث حالة الطلب' : language === 'fr' ? 'Mettre à jour le statut' : 'Update Order Status'}
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {allStatuses.map(statusKey => {
                    const cfg = getStatusConfig(statusKey);
                    const isSelected = selectedOrder.status === statusKey;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => handleUpdateStatus(selectedOrder.id, statusKey)}
                        disabled={isUpdatingStatus}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-neutral-400 uppercase tracking-wider">
                  {language === 'ar' ? 'المنتجات المطلوبة والتصاميم المرفوعة' : language === 'fr' ? 'Articles & Fichiers' : 'Ordered Items & Uploaded Designs'}
                </h4>

                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {item.uploaded_design_url ? (
                          <a
                            href={item.uploaded_design_url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative group w-14 h-14 rounded-lg overflow-hidden border border-amber-500/30 shrink-0 block"
                          >
                            <img
                              src={item.uploaded_design_url}
                              alt="Custom design"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </a>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}

                        <div>
                          <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                            {item.product_name_snapshot}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {item.color_snapshot} | {item.size_snapshot} | {t.quantity}: {item.quantity}
                          </span>
                          {item.uploaded_design_url && (
                            <div className="mt-1">
                              <a
                                href={item.uploaded_design_url}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
                              >
                                <Download className="w-3 h-3" />
                                <span>{t.download_design}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="font-bold font-mono text-neutral-900 dark:text-white">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financial Totals */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>{t.subtotal}:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {formatPrice(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>{t.delivery_fee}:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {formatPrice(selectedOrder.delivery_fee)}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{t.discount}:</span>
                    <span className="font-mono">-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between text-sm font-black text-amber-600 dark:text-amber-400">
                  <span>{t.total}:</span>
                  <span className="font-mono">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable receipt */}
      {orderToPrint && (
        <OrderPrintSheet order={orderToPrint} onClose={() => setOrderToPrint(null)} />
      )}
    </div>
  );
};
