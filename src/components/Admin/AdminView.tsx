import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Shirt,
  Sparkles,
  Tag,
  TrendingUp,
  Settings,
  ArrowRight,
  ArrowLeft,
  Lock,
  LogOut,
  ShieldCheck,
  Mail,
  KeyRound,
  AlertTriangle,
  Database as DbIcon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { setAdminToken, getAdminToken } from '../../lib/adminAuth';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminInventory } from './AdminInventory';
import { AdminProduction } from './AdminProduction';
import { AdminInvoices } from './AdminInvoices';
import { AdminDeliveryRates } from './AdminDeliveryRates';
import { AdminProducts } from './AdminProducts';
import { AdminDesigns } from './AdminDesigns';
import { AdminCoupons } from './AdminCoupons';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettings } from './AdminSettings';
import { Users, Boxes, Layers, FileText } from 'lucide-react';

type AdminTab =
  | 'orders'
  | 'production'
  | 'inventory'
  | 'customers'
  | 'invoices'
  | 'delivery'
  | 'products'
  | 'designs'
  | 'coupons'
  | 'analytics'
  | 'settings';

interface AdminViewProps {
  onBackToStore: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStore }) => {
  const { isRtl } = useTheme();

  // Supabase Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getAdminToken());
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Check existing Supabase session on load
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          setAdminToken(session.access_token);
          setIsAuthenticated(true);
          setAdminUserEmail(session.user.email || null);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) {
          setAdminToken(session.access_token);
          setIsAuthenticated(true);
          setAdminUserEmail(session.user.email || null);
        } else {
          setAdminToken(null);
          setIsAuthenticated(false);
          setAdminUserEmail(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent, directUsername?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const userToTry = (directUsername !== undefined ? directUsername : email).trim();
    const passToTry = (directPassword !== undefined ? directPassword : password).trim();

    try {
      // 1. Try server admin login endpoint (supports admin / admin & Supabase)
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userToTry,
          username: userToTry,
          password: passToTry,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setAdminToken(data.token);
          setIsAuthenticated(true);
          setAdminUserEmail(data.user?.email || 'admin@dzprint.dz');
          return;
        }
      }

      // 2. Direct fallback for admin / admin
      if (
        (userToTry.toLowerCase() === 'admin' || userToTry.toLowerCase() === 'admin@dzprint.dz') &&
        (passToTry === 'admin' || passToTry === 'admin123')
      ) {
        const masterToken = `dzprint-admin-master-${Date.now()}`;
        setAdminToken(masterToken);
        setIsAuthenticated(true);
        setAdminUserEmail('admin@dzprint.dz');
        return;
      }

      // 3. Fallback to Supabase Auth if configured and email provided
      if (isSupabaseConfigured && userToTry.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userToTry,
          password: passToTry,
        });

        if (error) {
          throw new Error(error.message || 'بيانات الدخول غير صحيحة');
        }

        if (data.session) {
          setAdminToken(data.session.access_token);
          setIsAuthenticated(true);
          setAdminUserEmail(data.user.email || null);
          return;
        }
      }

      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'بيانات تسجيل الدخول غير صحيحة. يمكنك استخدام admin وكلمة المرور admin');
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ أثناء محاولة تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = () => {
    setEmail('admin');
    setPassword('admin');
    handleLogin(undefined, 'admin', 'admin');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setAdminToken(null);
    setIsAuthenticated(false);
    setAdminUserEmail(null);
  };

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">
              بوابة تسجيل دخول مسؤولي النظام
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              لوحة الإدارة المركزية والتحكم في الطلبيات والأسعار
            </p>
          </div>

          {/* Quick Access Credentials Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl text-start text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                بيانات الدخول السريع كمسؤول:
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono">
                Admin Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-white/70 dark:bg-neutral-800/70 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-neutral-800 dark:text-neutral-200">
              <div>
                <span className="text-neutral-400 block text-[9px] font-sans">اسم المستخدم / الإيميل:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">admin</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] font-sans">كلمة المرور:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">admin</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={isLoading}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>دخول تلقائي سريع بـ (admin / admin)</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-start text-xs">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>اسم المستخدم أو البريد الإلكتروني:</span>
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin أو admin@dzprint.dz"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                <span>كلمة المرور:</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور (admin)"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 disabled:opacity-50 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>دخول لوحة الإدارة</span>
                </>
              )}
            </button>
          </form>

          <button
            onClick={onBackToStore}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 mx-auto transition"
          >
            {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>الرجوع إلى المتجر العام</span>
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'orders', label: 'الطلبيات', icon: Package },
    { id: 'production', label: 'خط الإنتاج والورشة', icon: Layers },
    { id: 'inventory', label: 'المخزون والموردين', icon: Boxes },
    { id: 'customers', label: 'الزبائن (CRM)', icon: Users },
    { id: 'invoices', label: 'الفواتير وعروض الأسعار', icon: FileText },
    { id: 'delivery', label: 'أسعار التوصيل (58 ولاية)', icon: Truck },
    { id: 'products', label: 'كتالوج المنتجات', icon: Shirt },
    { id: 'designs', label: 'معرض التصاميم', icon: Sparkles },
    { id: 'coupons', label: 'كوبونات التخفيض', icon: Tag },
    { id: 'analytics', label: 'الإحصائيات والتحليلات', icon: TrendingUp },
    { id: 'settings', label: 'إعدادات المتجر والتتبع', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Subheader Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-neutral-900 dark:text-white">
              لوحة الإدارة الشاملة (DzPrint Admin Console)
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-neutral-400">
                المسؤول المسجل: {adminUserEmail || 'مدير عام النظام'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <DbIcon className="w-2.5 h-2.5" />
                <span>Supabase RLS</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToStore}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>عرض المتجر</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="تسجيل الخروج الآمن"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'production' && <AdminProduction />}
        {activeTab === 'inventory' && <AdminInventory />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'invoices' && <AdminInvoices />}
        {activeTab === 'delivery' && <AdminDeliveryRates />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'designs' && <AdminDesigns />}
        {activeTab === 'coupons' && <AdminCoupons />}
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
};
