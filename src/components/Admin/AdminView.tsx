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
  Store,
  Users,
  Boxes,
  Layers,
  FileText,
  Palette,
  Loader2,
  LogIn,
  PlusCircle,
  Database as DbIcon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../Auth/AuthModal';
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
import { AdminLandingBuilder } from './AdminLandingBuilder';
import { AdminAccountSettings } from './AdminAccountSettings';

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
  | 'landing'
  | 'analytics'
  | 'settings'
  | 'account';

interface AdminViewProps {
  onBackToStore: () => void;
  initialTab?: AdminTab;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStore, initialTab = 'orders' }) => {
  const { t, isRtl, language } = useTheme();
  const { user, profile, store, isAuthenticated, signOut, role, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const isAuthorizedRole = role === 'owner' || role === 'admin' || role === 'staff';
  const isLoggedIn = isAuthenticated && isAuthorizedRole;

  const handleLogout = async () => {
    await signOut();
    onBackToStore();
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {language === 'ar' ? 'جارٍ التحقق من الجلسة والصلاحيات...' : 'Verifying session...'}
          </span>
        </div>
      </div>
    );
  }

  // Access Denied Screen if user is logged in as a normal customer without store staff permissions
  if (isAuthenticated && !isAuthorizedRole) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white">
              {language === 'ar' ? 'غير مصرح بالوصول إلى لوحة الإدارة' : 'Access Restricted'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {language === 'ar'
                ? `الحساب الحالي (${user?.email}) ليس لديه صلاحيات صاحب متجر أو مشرف.`
                : `Your account (${user?.email}) does not have store owner or staff permissions.`}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
            >
              {language === 'ar' ? 'تسجيل الخروج والتبديل إلى حساب آخر' : 'Sign out & switch account'}
            </button>
            <button
              onClick={onBackToStore}
              className="w-full py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {t.back_to_store}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Protected Dashboard Prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">
              {t.dashboard}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
              {language === 'ar'
                ? 'لوحة إدارة المتجر محمية. يرجى تسجيل الدخول بحساب صاحب المتجر أو المسؤول للوصول.'
                : 'The store administration panel is protected. Please sign in with your store owner or staff account.'}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              id="admin-protected-signin-btn"
              onClick={() => handleOpenAuth('signin')}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.auth_sign_in}</span>
            </button>

            <button
              id="admin-protected-signup-btn"
              onClick={() => handleOpenAuth('signup')}
              className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span>{t.auth_create_account}</span>
            </button>

            <button
              onClick={onBackToStore}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 mx-auto pt-2 transition cursor-pointer"
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t.back_to_store}</span>
            </button>
          </div>
        </div>

        {/* Unified Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  const TABS = [
    { id: 'orders', label: t.admin_tab_orders, icon: Package },
    { id: 'production', label: t.admin_tab_production, icon: Layers },
    { id: 'inventory', label: t.admin_tab_inventory, icon: Boxes },
    { id: 'customers', label: t.admin_tab_customers, icon: Users },
    { id: 'invoices', label: t.admin_tab_invoices, icon: FileText },
    { id: 'delivery', label: t.admin_tab_delivery, icon: Truck },
    { id: 'products', label: t.admin_tab_products, icon: Shirt },
    { id: 'designs', label: t.admin_tab_designs, icon: Sparkles },
    { id: 'coupons', label: t.admin_tab_coupons, icon: Tag },
    { id: 'landing', label: t.admin_tab_landing_builder, icon: Palette },
    { id: 'analytics', label: t.admin_tab_analytics, icon: TrendingUp },
    { id: 'settings', label: t.admin_tab_settings, icon: Settings },
    { id: 'account', label: t.admin_tab_account_settings || t.auth_account_settings, icon: ShieldCheck },
  ];

  const currentStoreName = store?.name || 'DzPrint Production Hub';
  const currentUserRole =
    profile?.role === 'owner'
      ? t.auth_role_owner
      : profile?.role === 'admin'
      ? t.auth_role_admin
      : t.auth_role_staff;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Subheader Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-neutral-900 dark:text-white">
                {currentStoreName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {currentUserRole}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-neutral-400">
                {user?.email || profile?.email || ''}
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
            <span>{t.back_to_store}</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title={t.auth_sign_out}
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
                  ? 'bg-amber-500 text-white shadow-xs'
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
        {activeTab === 'landing' && <AdminLandingBuilder />}
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'account' && <AdminAccountSettings />}
      </div>
    </div>
  );
};
