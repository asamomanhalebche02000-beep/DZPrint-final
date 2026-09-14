import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Plus,
  Download,
  Edit2,
  Calendar,
  DollarSign,
  ShoppingBag,
  MapPin,
  Tag,
  Clock,
  X,
  Check,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Customer, CustomerTag } from '../../types';
import { formatPrice } from '../../lib/utils';
import { adminFetch } from '../../lib/adminAuth';

const ALL_TAGS: { key: CustomerTag; label: string; color: string }[] = [
  { key: 'VIP', label: 'زبون VIP مميز', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' },
  { key: 'B2B', label: 'شركات ومؤسسات B2B', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300' },
  { key: 'Regular', label: 'زبون دائم', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300' },
  { key: 'Wholesale', label: 'جملة وكميات', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' },
  { key: 'New', label: 'زبون جديد', color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300' },
  { key: 'At Risk', label: 'غير نشط مؤخراً', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300' },
];

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Customer>>({
    full_name: '',
    phone: '',
    email: '',
    wilaya_name: '16 - الجزائر (Alger)',
    wilaya_id: 16,
    address: '',
    notes: '',
    tags: ['New'],
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let list = [...customers];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        c =>
          c.full_name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.wilaya_name && c.wilaya_name.toLowerCase().includes(q))
      );
    }
    if (selectedTag !== 'all') {
      list = list.filter(c => c.tags?.includes(selectedTag as CustomerTag));
    }
    setFilteredCustomers(list);
  }, [customers, searchTerm, selectedTag]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) return;

    try {
      if (editingCustomer) {
        const res = await adminFetch(`/api/admin/customers/${editingCustomer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
          setEditingCustomer(null);
        }
      } else {
        const res = await adminFetch('/api/admin/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const created = await res.json();
          setCustomers(prev => [created, ...prev]);
          setIsAddModalOpen(false);
        }
      }
    } catch {
      // ignore
    }
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const clean = phone.replace(/^0/, '213').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `السلام عليكم أخي/أختي ${name}، نتواصل معك من متجر ديزاد برينت للطباعة المخصصة. كيف يمكننا مساعدتك اليوم؟`
    );
    return `https://wa.me/${clean}?text=${message}`;
  };

  // KPIs
  const totalCustomers = customers.length;
  const vipCount = customers.filter(c => c.tags?.includes('VIP')).length;
  const totalCustomerRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgSpendPerCustomer = totalCustomers > 0 ? Math.round(totalCustomerRevenue / totalCustomers) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            إدارة علاقات الزبائن (DZPrint CRM)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            سجل موحد لبيانات الزبائن، تصنيفهم (VIP/B2B)، التواصل المباشر عبر واتساب ومتابعة تاريخ الطلبيات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/customers/export/csv"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير CSV
          </a>

          <button
            onClick={() => {
              setFormData({
                full_name: '',
                phone: '',
                email: '',
                wilaya_name: '16 - الجزائر (Alger)',
                wilaya_id: 16,
                address: '',
                notes: '',
                tags: ['New'],
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة زبون جديد
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">إجمالي الزبائن</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">{totalCustomers}</p>
          <span className="text-[10px] text-neutral-400">مسجلين وقاموا بطلبيات</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">زبائن VIP & B2B</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{vipCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">أعلى قيمة مشتريات</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">إجمالي إنفاق الزبائن</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(totalCustomerRevenue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">قيمة المبيعات الإجمالية</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">متوسط قيمة الزبون</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(avgSpendPerCustomer)}
          </p>
          <span className="text-[10px] text-neutral-400">معدل الإنفاق لكل عميل</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم الهاتف، الولاية أو البريد..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedTag === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              الكل ({customers.length})
            </button>
            {ALL_TAGS.map(t => {
              const count = customers.filter(c => c.tags?.includes(t.key)).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedTag(t.key)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    selectedTag === t.key
                      ? 'bg-amber-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {t.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">جاري تحميل سجل الزبائن...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">لم يتم العثور على أي زبائن مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4 font-semibold">الزبون</th>
                  <th className="p-4 font-semibold">رقم الهاتف / الولاية</th>
                  <th className="p-4 font-semibold">التصنيف</th>
                  <th className="p-4 font-semibold text-center">الطلبات</th>
                  <th className="p-4 font-semibold">إجمالي الإنفاق</th>
                  <th className="p-4 font-semibold">آخر طلب</th>
                  <th className="p-4 font-semibold text-center">تواصل وإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-xs">
                          {cust.full_name.charAt(0)}
                        </div>
                        <div>
                          <span>{cust.full_name}</span>
                          {cust.email && <div className="text-[11px] text-neutral-400 font-normal">{cust.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono text-neutral-800 dark:text-neutral-200">{cust.phone}</div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {cust.wilaya_name}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags && cust.tags.length > 0 ? (
                          cust.tags.map(t => {
                            const config = ALL_TAGS.find(x => x.key === t);
                            return (
                              <span
                                key={t}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                                  config ? config.color : 'bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                {config ? config.label : t}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-neutral-400 text-[10px]">بدون تصنيف</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono font-bold text-neutral-900 dark:text-white">
                        {cust.total_orders}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(cust.total_spent)}
                    </td>

                    <td className="p-4 text-neutral-500 text-[11px]">
                      {cust.last_order_date
                        ? new Date(cust.last_order_date).toLocaleDateString('ar-DZ')
                        : 'حديث'}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={getWhatsAppLink(cust.phone, cust.full_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors"
                          title="مراسلة واتساب"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="اتصال هاتفي مباشر"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => {
                            setEditingCustomer(cust);
                            setFormData({
                              full_name: cust.full_name,
                              phone: cust.phone,
                              email: cust.email || '',
                              wilaya_name: cust.wilaya_name,
                              wilaya_id: cust.wilaya_id,
                              address: cust.address || '',
                              notes: cust.notes || '',
                              tags: cust.tags || [],
                            });
                          }}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 rounded-lg transition-colors"
                          title="تعديل بيانات الزبون والتصنيفات"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                {editingCustomer ? 'تعديل بيانات الزبون' : 'إضافة زبون جديد في النظام'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    placeholder="مثال: كريم بلعيد"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">رقم الهاتف (الجزائر) *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                    placeholder="0550 12 34 56"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                    placeholder="client@dzprint.dz"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">الولاية</label>
                  <input
                    type="text"
                    value={formData.wilaya_name || ''}
                    onChange={e => setFormData({ ...formData, wilaya_name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    placeholder="16 - الجزائر العاصمة"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">العنوان التفصيلي</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  placeholder="البلدية، اسم الشارع، رقم العمارة..."
                />
              </div>

              {/* Tags selection */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  تصنيفات الزبون (Tags):
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALL_TAGS.map(t => {
                    const isChecked = (formData.tags || []).includes(t.key);
                    return (
                      <button
                        type="button"
                        key={t.key}
                        onClick={() => {
                          const current = formData.tags || [];
                          const updated = isChecked
                            ? current.filter(x => x !== t.key)
                            : [...current, t.key];
                          setFormData({ ...formData, tags: updated });
                        }}
                        className={`px-3 py-1 text-xs rounded-xl font-semibold border flex items-center gap-1.5 transition-all ${
                          isChecked
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">ملاحظات داخلية خاصة بالورشة</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  placeholder="مثال: يفضل دوماً طباعة DTF على الصدر، يطلب شحن سريع..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {editingCustomer ? 'حفظ التعديلات' : 'إضافة الزبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
