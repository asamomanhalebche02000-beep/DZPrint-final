import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  Building,
  Calendar,
  X,
  Trash2,
  Edit2,
  RefreshCw,
  Send,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus } from '../../types';
import { formatPrice } from '../../lib/utils';
import { adminFetch } from '../../lib/adminAuth';

const STATUS_MAP: Record<InvoiceStatus, { label: string; color: string }> = {
  draft: { label: 'مسودة (Brouillon)', color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300' },
  sent: { label: 'تم الإرسال للعميل', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  paid: { label: 'مدفوعة بالكامل (Payée)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  cancelled: { label: 'ملغاة (Annulée)', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
};

export const AdminInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Form State
  const [formType, setFormType] = useState<InvoiceType>('quote');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientWilaya, setClientWilaya] = useState('16 - الجزائر (Alger)');
  const [clientNif, setClientNif] = useState('');
  const [clientNis, setClientNis] = useState('');
  const [clientRc, setClientRc] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'baridimob' | 'ccp' | 'bank_transfer' | 'cash'>('bank_transfer');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [stampDuty, setStampDuty] = useState<number>(0);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'it-1',
      description: 'تيشيرت قطن ممشط 240g مع طباعة DTF عالية الدقة',
      details: 'مقاسات متنوعة (M, L, XL) - أسود',
      quantity: 50,
      unit_price: 1600,
      total: 80000,
    },
  ]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/invoices');
      const data = await res.json();
      if (Array.isArray(data)) setInvoices(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `it-${Date.now()}`,
        description: '',
        details: '',
        quantity: 1,
        unit_price: 1000,
        total: 1000,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unit_price') {
      current.total = (Number(current.quantity) || 0) * (Number(current.unit_price) || 0);
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, it) => sum + it.total, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const totalAmount = Math.max(0, subtotal - discount + taxAmount + stampDuty);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || items.length === 0) return;

    try {
      const res = await adminFetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          client_name: clientName,
          client_company: clientCompany,
          client_phone: clientPhone,
          client_email: clientEmail,
          client_address: clientAddress,
          client_wilaya: clientWilaya,
          client_nif: clientNif,
          client_nis: clientNis,
          client_rc: clientRc,
          issue_date: issueDate,
          due_date: dueDate,
          items,
          discount,
          tax_rate: taxRate,
          stamp_duty: stampDuty,
          status: 'sent',
          payment_method: paymentMethod,
          notes,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setInvoices(prev => [created, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch {
      // ignore
    }
  };

  const handleConvertQuoteToInvoice = async (invoice: Invoice) => {
    try {
      const res = await adminFetch(`/api/admin/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invoice',
          invoice_number: invoice.invoice_number.replace('DEV', 'FACT'),
          status: 'paid',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoices(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        if (previewInvoice?.id === updated.id) {
          setPreviewInvoice(updated);
        }
      }
    } catch {
      // ignore
    }
  };

  // Filtered list
  const filteredInvoices = invoices.filter(inv => {
    if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q) ||
        (inv.client_company && inv.client_company.toLowerCase().includes(q)) ||
        inv.client_phone.includes(q)
      );
    }
    return true;
  });

  // KPIs
  const totalFacturesAmount = invoices.filter(i => i.type === 'invoice').reduce((s, i) => s + i.total, 0);
  const paidFacturesAmount = invoices.filter(i => i.type === 'invoice' && i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pendingQuotesAmount = invoices.filter(i => i.type === 'quote').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            الفواتير وعروض الأسعار (Factures & Devis Commerciaux)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            إنشاء وإدارة الفواتير التجارية الرسمية (NIF/NIS/RC) بالدينار الجزائري، عروض الأسعار للشركات، والتصدير والطباعة A4
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormType('quote');
              setClientName('');
              setClientCompany('');
              setClientPhone('');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            إنشاء عرض أسعار (Devis)
          </button>

          <button
            onClick={() => {
              setFormType('invoice');
              setClientName('');
              setClientCompany('');
              setClientPhone('');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            إنشاء فاتورة جديدة (Facture)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">إجمالي الفواتير الصادرة</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(totalFacturesAmount)}
          </p>
          <span className="text-[10px] text-neutral-400">فواتير تجارية ومبيعات الورشة</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">مبالغ مستلمة ومدفوعة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatPrice(paidFacturesAmount)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">تم التحصيل بنجاح</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">عروض أسعار قيد المصادقة (Devis)</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {formatPrice(pendingQuotesAmount)}
          </p>
          <span className="text-[10px] text-neutral-400">صفقات وطلبيات B2B متوقعة</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة، اسم العميل أو الشركة..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                typeFilter === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTypeFilter('quote')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                typeFilter === 'quote' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              عروض أسعار (Devis)
            </button>
            <button
              onClick={() => setTypeFilter('invoice')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                typeFilter === 'invoice' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              فواتير (Factures)
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">جاري تحميل الفواتير...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">لم يتم العثور على وثائق مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4">رقم الوثيقة</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">العميل / المؤسسة</th>
                  <th className="p-4">تاريخ الإصدار</th>
                  <th className="p-4">عدد البنود</th>
                  <th className="p-4">المبلغ الإجمالي (دج)</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {inv.invoice_number}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          inv.type === 'quote'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {inv.type === 'quote' ? 'عرض أسعار (Devis)' : 'فاتورة رسمية (Facture)'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-neutral-900 dark:text-white">{inv.client_name}</div>
                      {inv.client_company && (
                        <div className="text-[11px] text-neutral-400">{inv.client_company}</div>
                      )}
                    </td>

                    <td className="p-4 font-mono text-neutral-500 text-[11px]">{inv.issue_date}</td>

                    <td className="p-4 font-mono text-neutral-600 dark:text-neutral-300">
                      {inv.items.length} منتجات
                    </td>

                    <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {formatPrice(inv.total)}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${STATUS_MAP[inv.status]?.color}`}>
                        {STATUS_MAP[inv.status]?.label || inv.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
                          title="معاينة وطباعة الفاتورة"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {inv.type === 'quote' && (
                          <button
                            onClick={() => handleConvertQuoteToInvoice(inv)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg transition-colors"
                            title="تحويل Devis إلى Facture رسمية"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-3xl w-full p-6 space-y-4 shadow-2xl text-right my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                {formType === 'quote' ? 'إنشاء عرض أسعار تجاري (Nouveau Devis)' : 'إنشاء فاتورة رسمية (Nouvelle Facture)'}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('quote')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    formType === 'quote'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  عرض أسعار (Devis)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('invoice')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    formType === 'invoice'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  فاتورة نهائية (Facture)
                </button>
              </div>

              {/* Client Details Section */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60 space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-500" />
                  بيانات العميل أو الشركة
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">اسم العميل / المستلم *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="مثال: كريم بلعيد أو شركة النور للتسويق"
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">الاسم التجاري / الشركة (اختياري)</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={e => setClientCompany(e.target.value)}
                      placeholder="SARL El-Nour Tech"
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">رقم الهاتف</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="0550 12 34 56"
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">الولاية</label>
                    <input
                      type="text"
                      value={clientWilaya}
                      onChange={e => setClientWilaya(e.target.value)}
                      placeholder="16 - الجزائر"
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">طريقة الدفع المقترحة</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl font-semibold"
                    >
                      <option value="bank_transfer">تحويل بنكي (Virement bancaire)</option>
                      <option value="baridimob">بريدي موب (BaridiMob)</option>
                      <option value="ccp">حساب جاري بريدي (CCP)</option>
                      <option value="cod">الدفع نقداً عند الاستلام (COD)</option>
                      <option value="cash">نقداً بالورشة (Espèces)</option>
                    </select>
                  </div>
                </div>

                {/* Fiscal Identifiers (Algeria B2B) */}
                <div className="grid grid-cols-3 gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold">رقم التعريف الجبائي (N.I.F)</label>
                    <input
                      type="text"
                      value={clientNif}
                      onChange={e => setClientNif(e.target.value)}
                      placeholder="0018..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold">رقم التعريف الإحصائي (N.I.S)</label>
                    <input
                      type="text"
                      value={clientNis}
                      onChange={e => setClientNis(e.target.value)}
                      placeholder="1980..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold">السجل التجاري (R.C)</label>
                    <input
                      type="text"
                      value={clientRc}
                      onChange={e => setClientRc(e.target.value)}
                      placeholder="16/00-..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-white">بنود الفاتورة / المنتجات</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة بند
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <div className="flex-1 w-full space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="وصف المنتج (مثال: تيشيرت أسود 240g مع طباعة DTF على الصدر والظهر)"
                          value={it.description}
                          onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            placeholder="الكمية"
                            value={it.quantity}
                            onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-center"
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            min="0"
                            placeholder="السعر (دج)"
                            value={it.unit_price}
                            onChange={e => handleUpdateItem(idx, 'unit_price', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-left"
                          />
                        </div>

                        <div className="w-28 font-mono font-bold text-neutral-900 dark:text-white text-left px-2">
                          {formatPrice(it.total)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg"
                          title="حذف البند"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Calculation */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl space-y-2 border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between font-semibold text-neutral-600 dark:text-neutral-400">
                  <span>المجموع الإجمالي الخام (HT):</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">التخفيض الممنوح (دج):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-28 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-left"
                  />
                </div>

                <div className="flex justify-between font-black text-neutral-900 dark:text-white text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span>المبلغ الإجمالي المستحق (TTC):</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">ملاحظات وشروط البيع</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مدة الصلاحية، شروط التسليم، رقم الحساب البنكي..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  حفظ وإصدار الوثيقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview and Printable Invoice View */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full p-8 space-y-6 shadow-2xl text-right text-neutral-900 my-8 print:m-0 print:p-0 print:border-none">
            {/* Header controls (hidden on print) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  طباعة الوثيقة A4
                </button>
              </div>
              <button onClick={() => setPreviewInvoice(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document A4 Format */}
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                    {previewInvoice.type === 'quote' ? 'DEVIS COMMERCIAL' : 'FACTURE COMMERCIALE'}
                  </h1>
                  <p className="text-sm font-bold text-amber-600 mt-0.5">
                    {previewInvoice.type === 'quote' ? 'عرض أسعار تجاري' : 'فاتورة رسمية'}
                  </p>
                  <div className="text-xs text-neutral-500 mt-1 font-mono">
                    N° : <strong>{previewInvoice.invoice_number}</strong>
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    Date : {previewInvoice.issue_date}
                  </div>
                </div>

                <div className="text-left">
                  <h2 className="text-xl font-black text-neutral-900">DZPRINT ALGERIA</h2>
                  <p className="text-xs text-neutral-600">Atelier d'Impression & Sérigraphie</p>
                  <p className="text-xs text-neutral-500 font-mono">contact@dzprint.dz | +213 (0) 550 00 00 00</p>
                  <p className="text-xs text-neutral-500">Alger, Algérie</p>
                </div>
              </div>

              {/* Client & Enterprise info */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <span className="font-bold text-neutral-500 block uppercase text-[10px]">Client / Facturé à:</span>
                  <div className="text-sm font-bold">{previewInvoice.client_name}</div>
                  {previewInvoice.client_company && (
                    <div className="text-neutral-600 font-semibold">{previewInvoice.client_company}</div>
                  )}
                  <div className="text-neutral-500 font-mono">{previewInvoice.client_phone}</div>
                  {previewInvoice.client_address && (
                    <div className="text-neutral-500">{previewInvoice.client_address}</div>
                  )}
                  {previewInvoice.client_wilaya && (
                    <div className="text-neutral-500">{previewInvoice.client_wilaya}</div>
                  )}
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-left font-mono">
                  <span className="font-bold text-neutral-500 block uppercase text-[10px]">Identifiants Fiscaux:</span>
                  {previewInvoice.client_nif && <div>NIF: {previewInvoice.client_nif}</div>}
                  {previewInvoice.client_nis && <div>NIS: {previewInvoice.client_nis}</div>}
                  {previewInvoice.client_rc && <div>RC: {previewInvoice.client_rc}</div>}
                  <div>Mode de règlement: {previewInvoice.payment_method?.toUpperCase()}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-800 text-neutral-700 bg-neutral-100">
                    <th className="p-2.5 font-bold">Désignation / الوصف</th>
                    <th className="p-2.5 font-bold text-center">Qté</th>
                    <th className="p-2.5 font-bold text-left">P.U (DZD)</th>
                    <th className="p-2.5 font-bold text-left">Montant (DZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {previewInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">
                        <div className="font-semibold text-neutral-900">{it.description}</div>
                        {it.details && <div className="text-[11px] text-neutral-500">{it.details}</div>}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold">{it.quantity}</td>
                      <td className="p-2.5 text-left font-mono">{formatPrice(it.unit_price)}</td>
                      <td className="p-2.5 text-left font-mono font-bold">{formatPrice(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals calculation table */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-xs text-right border-t pt-2">
                  <div className="flex justify-between text-neutral-600">
                    <span>Sous-total HT:</span>
                    <span className="font-mono">{formatPrice(previewInvoice.subtotal)}</span>
                  </div>
                  {previewInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Remise / تخفيض:</span>
                      <span className="font-mono">-{formatPrice(previewInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-neutral-900 border-t-2 border-neutral-900 pt-1">
                    <span>Total Net à Payer:</span>
                    <span className="font-mono text-amber-600">{formatPrice(previewInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Bank details */}
              {previewInvoice.notes && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
                  <span className="font-bold block text-neutral-800">Conditions & Mentions légales:</span>
                  <p className="mt-0.5">{previewInvoice.notes}</p>
                </div>
              )}

              {/* Signature and stamp box */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neutral-200 text-xs">
                <div>
                  <p className="font-bold text-neutral-700">Cachet & Signature Client</p>
                  <div className="h-20 border border-dashed border-neutral-300 rounded-xl mt-1"></div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-neutral-700">Cachet DZPRINT Atelier</p>
                  <div className="h-20 border border-dashed border-neutral-300 rounded-xl mt-1 flex items-center justify-center text-[11px] text-neutral-400 font-mono">
                    DZPRINT Bon pour Accord
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
