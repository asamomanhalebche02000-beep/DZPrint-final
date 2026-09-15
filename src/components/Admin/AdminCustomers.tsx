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
import { useTheme } from '../../context/ThemeContext';

export const AdminCustomers: React.FC = () => {
  const { t, language, isRtl } = useTheme();

  const getTagConfig = (key: CustomerTag) => {
    switch (key) {
      case 'VIP':
        return {
          label: language === 'ar' ? 'زبون VIP مميز' : language === 'fr' ? 'Client VIP' : 'VIP Customer',
          color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        };
      case 'B2B':
        return {
          label: language === 'ar' ? 'شركات ومؤسسات B2B' : language === 'fr' ? 'Entreprise B2B' : 'B2B Corporate',
          color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
        };
      case 'Regular':
        return {
          label: language === 'ar' ? 'زبون دائم' : language === 'fr' ? 'Client Régulier' : 'Regular Customer',
          color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
        };
      case 'Wholesale':
        return {
          label: language === 'ar' ? 'جملة وكميات' : language === 'fr' ? 'Grossiste' : 'Wholesale',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        };
      case 'New':
        return {
          label: language === 'ar' ? 'زبون جديد' : language === 'fr' ? 'Nouveau Client' : 'New Customer',
          color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
        };
      case 'At Risk':
        return {
          label: language === 'ar' ? 'غير نشط مؤخراً' : language === 'fr' ? 'Inactif' : 'Inactive / At Risk',
          color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
        };
    }
  };

  const ALL_TAG_KEYS: CustomerTag[] = ['VIP', 'B2B', 'Regular', 'Wholesale', 'New', 'At Risk'];

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
      language === 'ar'
        ? `السلام عليكم أخي/أختي ${name}، نتواصل معك من متجر ديزاد برينت للطباعة المخصصة. كيف يمكننا مساعدتك اليوم؟`
        : language === 'fr'
        ? `Bonjour ${name}, nous vous contactons depuis DzPrint Personnalisation. Comment pouvons-nous vous aider ?`
        : `Hello ${name}, contacting you from DzPrint Custom Printing. How can we help you today?`
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
            {language === 'ar'
              ? 'إدارة علاقات الزبائن (DZPrint CRM)'
              : language === 'fr'
              ? 'Gestion des Clients & CRM'
              : 'Customer Relations Management (CRM)'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'سجل موحد لبيانات الزبائن، تصنيفهم (VIP/B2B)، التواصل المباشر عبر واتساب ومتابعة تاريخ الطلبيات'
              : language === 'fr'
              ? 'Répertoire des clients, segmentation (VIP/B2B), contact direct WhatsApp et historique d’achats'
              : 'Unified customer database, segmentation (VIP/B2B), direct WhatsApp contact, and order history'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/customers/export/csv"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {t.export_csv}
          </a>

          <button
            onClick={() => {
              setFormData({
                full_name: '',
                phone: '',
                email: '',
                wilaya_name: '16 - Alger',
                wilaya_id: 16,
                address: '',
                notes: '',
                tags: ['New'],
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة زبون جديد' : language === 'fr' ? 'Ajouter un client' : 'Add New Customer'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'إجمالي الزبائن' : language === 'fr' ? 'Total Clients' : 'Total Customers'}
            </span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">{totalCustomers}</p>
          <span className="text-[10px] text-neutral-400">
            {language === 'ar' ? 'مسجلين وقاموا بطلبيات' : language === 'fr' ? 'Enregistrés avec commandes' : 'Registered with orders'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'زبائن VIP & B2B' : language === 'fr' ? 'Clients VIP & B2B' : 'VIP & B2B Customers'}
            </span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{vipCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {language === 'ar' ? 'أعلى قيمة مشتريات' : language === 'fr' ? 'Meilleur panier moyen' : 'Highest lifetime value'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'إجمالي إنفاق الزبائن' : language === 'fr' ? 'Dépenses Totales' : 'Total Customer Spend'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(totalCustomerRevenue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {language === 'ar' ? 'قيمة المبيعات الإجمالية' : language === 'fr' ? 'Revenu total généré' : 'Total revenue generated'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'متوسط قيمة الزبون' : language === 'fr' ? 'Panier Moyen / Client' : 'Avg Spend / Customer'}
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(avgSpendPerCustomer)}
          </p>
          <span className="text-[10px] text-neutral-400">
            {language === 'ar' ? 'معدل الإنفاق لكل عميل' : language === 'fr' ? 'Dépense moyenne' : 'Average spend per user'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-neutral-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={
                language === 'ar'
                  ? 'ابحث بالاسم، رقم الهاتف، الولاية أو البريد...'
                  : language === 'fr'
                  ? 'Rechercher par nom, téléphone, wilaya ou e-mail...'
                  : 'Search by name, phone, wilaya, or email...'
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-neutral-900 dark:text-white ${
                isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {language === 'ar' ? `الكل (${customers.length})` : language === 'fr' ? `Tous (${customers.length})` : `All (${customers.length})`}
            </button>
            {ALL_TAG_KEYS.map(tagKey => {
              const cfg = getTagConfig(tagKey);
              const count = customers.filter(c => c.tags?.includes(tagKey)).length;
              return (
                <button
                  key={tagKey}
                  onClick={() => setSelectedTag(tagKey)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTag === tagKey
                      ? 'bg-amber-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {cfg.label} ({count})
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
            <span className="text-xs">
              {language === 'ar' ? 'جاري تحميل سجل الزبائن...' : language === 'fr' ? 'Chargement des clients...' : 'Loading customers...'}
            </span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">
              {language === 'ar'
                ? 'لم يتم العثور على أي زبائن مطابقة للبحث'
                : language === 'fr'
                ? 'Aucun client trouvé pour cette recherche'
                : 'No customers found matching search'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4 font-semibold text-start">
                    {language === 'ar' ? 'الزبون' : language === 'fr' ? 'Client' : 'Customer'}
                  </th>
                  <th className="p-4 font-semibold text-start">
                    {language === 'ar' ? 'رقم الهاتف / الولاية' : language === 'fr' ? 'Téléphone / Wilaya' : 'Phone / Wilaya'}
                  </th>
                  <th className="p-4 font-semibold text-start">
                    {language === 'ar' ? 'التصنيف' : language === 'fr' ? 'Catégorie' : 'Tag'}
                  </th>
                  <th className="p-4 font-semibold text-center">
                    {language === 'ar' ? 'الطلبات' : language === 'fr' ? 'Commandes' : 'Orders'}
                  </th>
                  <th className="p-4 font-semibold text-start">
                    {language === 'ar' ? 'إجمالي الإنفاق' : language === 'fr' ? 'Total Dépensé' : 'Total Spent'}
                  </th>
                  <th className="p-4 font-semibold text-start">
                    {language === 'ar' ? 'آخر طلب' : language === 'fr' ? 'Dernière Commande' : 'Last Order'}
                  </th>
                  <th className="p-4 font-semibold text-center">
                    {language === 'ar' ? 'تواصل وإجراءات' : language === 'fr' ? 'Actions' : 'Actions'}
                  </th>
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
                          cust.tags.map(tKey => {
                            const config = getTagConfig(tKey);
                            return (
                              <span
                                key={tKey}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                                  config ? config.color : 'bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                {config ? config.label : tKey}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-neutral-400 text-[10px]">
                            {language === 'ar' ? 'بدون تصنيف' : language === 'fr' ? 'Sans étiquette' : 'Untagged'}
                          </span>
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
                        ? new Date(cust.last_order_date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US')
                        : (language === 'ar' ? 'حديث' : language === 'fr' ? 'Récent' : 'Recent')}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={getWhatsAppLink(cust.phone, cust.full_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                          title={language === 'ar' ? 'اتصال هاتفي مباشر' : 'Appel téléphonique'}
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
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                          title={language === 'ar' ? 'تعديل بيانات الزبون' : 'Modifier client'}
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
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                {editingCustomer
                  ? (language === 'ar' ? 'تعديل بيانات الزبون' : language === 'fr' ? 'Modifier le client' : 'Edit Customer')
                  : (language === 'ar' ? 'إضافة زبون جديد في النظام' : language === 'fr' ? 'Ajouter un nouveau client' : 'Add New Customer')}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'الاسم الكامل *' : language === 'fr' ? 'Nom complet *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    placeholder={language === 'ar' ? 'مثال: كريم بلعيد' : 'Ex: Karim Belaid'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'رقم الهاتف (الجزائر) *' : language === 'fr' ? 'Numéro de téléphone *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
                    placeholder="0550 12 34 56"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
                    placeholder="client@dzprint.dz"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'الولاية' : language === 'fr' ? 'Wilaya' : 'Wilaya'}
                  </label>
                  <input
                    type="text"
                    value={formData.wilaya_name || ''}
                    onChange={e => setFormData({ ...formData, wilaya_name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    placeholder={language === 'ar' ? '16 - الجزائر العاصمة' : '16 - Alger'}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'العنوان التفصيلي' : language === 'fr' ? 'Adresse détaillée' : 'Detailed Address'}
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                  placeholder={language === 'ar' ? 'البلدية، اسم الشارع، رقم العمارة...' : 'Commune, rue, n°...'}
                />
              </div>

              {/* Tags selection */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'ar' ? 'تصنيفات الزبون (Tags):' : language === 'fr' ? 'Étiquettes du client (Tags) :' : 'Customer Tags:'}
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALL_TAG_KEYS.map(tagKey => {
                    const cfg = getTagConfig(tagKey);
                    const isChecked = (formData.tags || []).includes(tagKey);
                    return (
                      <button
                        type="button"
                        key={tagKey}
                        onClick={() => {
                          const current = formData.tags || [];
                          const updated = isChecked
                            ? current.filter(x => x !== tagKey)
                            : [...current, tagKey];
                          setFormData({ ...formData, tags: updated });
                        }}
                        className={`px-3 py-1 text-xs rounded-xl font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'ملاحظات داخلية خاصة بالورشة' : language === 'fr' ? 'Notes internes' : 'Internal Notes'}
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                  placeholder={language === 'ar' ? 'مثال: يفضل دوماً طباعة DTF على الصدر...' : 'Notes...'}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCustomer
                    ? (language === 'ar' ? 'حفظ التعديلات' : language === 'fr' ? 'Enregistrer' : 'Save Changes')
                    : (language === 'ar' ? 'إضافة الزبون' : language === 'fr' ? 'Ajouter' : 'Add Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
