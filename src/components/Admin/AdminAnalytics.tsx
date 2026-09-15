import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatPrice } from '../../lib/utils';
import { Order } from '../../types';
import { adminFetch } from '../../lib/adminAuth';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

export const AdminAnalytics: React.FC = () => {
  const { t, language, isRtl } = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-xs">جاري تحميل إحصائيات المبيعات...</span>
      </div>
    );
  }

  // Prep delivery method chart
  const methodData = [
    {
      name: language === 'ar' ? 'توصيل للمنزل' : language === 'fr' ? 'À Domicile' : 'Home Delivery',
      value: analytics.delivery_methods?.home || 0,
    },
    {
      name: language === 'ar' ? 'استلام من المكتب (Stop Desk)' : language === 'fr' ? 'Point Relais (Stop Desk)' : 'Office Pickup (Stop Desk)',
      value: analytics.delivery_methods?.office || 0,
    },
  ];

  // Prep agency distribution
  const agencyData = Object.entries(analytics.agency_distribution || {}).map(([k, v]) => ({
    name: k === 'yalidine' ? 'Yalidine Express' : k === 'procolis' ? 'Procolis' : k === 'maystro' ? 'Maystro' : k,
    value: v as number,
  }));

  // Top Wilayas data
  const wilayaData = Object.entries(analytics.wilaya_distribution || {})
    .map(([k, v]) => ({
      name: k,
      orders: v as number,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            {language === 'ar'
              ? 'لوحة الإحصائيات وتحليلات الأداء'
              : language === 'fr'
              ? 'Tableau de Bord & Statistiques'
              : 'Analytics & Performance Dashboard'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'رؤية شاملة للمداخيل، نشاط شركات التوصيل، وتوزيع الطلبيات جغرافياً عبر الولايات'
              : language === 'fr'
              ? 'Vue globale des revenus, livraison et distribution des commandes par wilaya'
              : 'Comprehensive overview of revenue, delivery carriers, and regional wilaya distribution'}
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 text-neutral-500 hover:text-amber-500 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
          title={language === 'ar' ? 'تحديث البيانات' : language === 'fr' ? 'Actualiser les données' : 'Refresh data'}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'إجمالي المداخيل' : language === 'fr' ? 'Revenu Total' : 'Total Revenue'}
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(analytics.total_revenue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {language === 'ar' ? 'مبيعات مؤكدة ومستلمة' : language === 'fr' ? 'Ventes confirmées' : 'Confirmed sales'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'عدد الطلبيات' : language === 'fr' ? 'Total Commandes' : 'Total Orders'}
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {analytics.total_orders}
          </p>
          <span className="text-[10px] text-neutral-400">
            {language === 'ar' ? 'متوسط قيمة الطلب: ' : language === 'fr' ? 'Panier moyen : ' : 'Avg order: '}
            <strong>{formatPrice(analytics.average_order_value)}</strong>
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'طلبات قيد المعالجة' : language === 'fr' ? 'En Traitement' : 'In Processing'}
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {analytics.pending_orders}
          </p>
          <span className="text-[10px] text-amber-500 font-medium">
            {language === 'ar' ? 'تنتظر التأكيد أو الطباعة' : language === 'fr' ? 'En attente d impression' : 'Awaiting print/dispatch'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'طلبات تم تسليمها' : language === 'fr' ? 'Livrées avec Succès' : 'Delivered Orders'}
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {analytics.delivered_orders}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {language === 'ar' ? 'نسبة نجاح التوصيل عالية' : language === 'fr' ? 'Livraisons réussies' : 'Successful delivery rate'}
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Wilayas Chart */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            {language === 'ar'
              ? 'أكثر الولايات طلباً'
              : language === 'fr'
              ? 'Top Wilayas de Commande'
              : 'Top Ordering Wilayas'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wilayaData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [
                    `${val} ${language === 'ar' ? 'طلبية' : language === 'fr' ? 'commandes' : 'orders'}`,
                    language === 'ar' ? 'الطلبات' : language === 'fr' ? 'Commandes' : 'Orders',
                  ]}
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Method Breakdown (Home vs Stop-Desk) */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-500" />
            {language === 'ar'
              ? 'نسبة التوصيل للمنزل مقابل الاستلام من المكتب'
              : language === 'fr'
              ? 'Livraison à Domicile vs Stop-Desk'
              : 'Home Delivery vs Office Pickup'}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {methodData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [
                    `${val} ${language === 'ar' ? 'طلبية' : language === 'fr' ? 'commandes' : 'orders'}`,
                    language === 'ar' ? 'العدد' : language === 'fr' ? 'Quantité' : 'Count',
                  ]}
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agency Distribution */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            {language === 'ar'
              ? 'توزيع الطلبيات حسب شركات الشحن'
              : language === 'fr'
              ? 'Répartition par Société de Livraison'
              : 'Distribution by Carrier Agency'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {agencyData.map((ag, i) => (
              <div
                key={ag.name}
                className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                    {ag.name}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {language === 'ar' ? 'ناقل معتمد' : language === 'fr' ? 'Transporteur agréé' : 'Authorized carrier'}
                  </span>
                </div>
                <div className="text-end">
                  <span className="font-black text-lg text-amber-600 dark:text-amber-400 font-mono">
                    {ag.value}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    {language === 'ar' ? 'طرد مشحون' : language === 'fr' ? 'colis expédiés' : 'packages sent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
