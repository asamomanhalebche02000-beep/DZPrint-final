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
  Store,
  User,
  Database as DbIcon,
  Users,
  Boxes,
  Layers,
  FileText,
  Palette,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getAdminToken, setAdminToken } from '../../lib/adminAuth';
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
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStore }) => {
  const { t, isRtl, language } = useTheme();
  const { user, profile, store, isAuthenticated: authContextLoggedIn, signIn, signUp, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const isLoggedIn = authContextLoggedIn || Boolean(getAdminToken());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (authMode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        if (!fullName.trim() || !storeName.trim() || !storeSlug.trim()) {
          setAuthError('Please fill in all store registration fields.');
          setIsLoading(false);
          return;
        }
        const res = await signUp({
          fullName,
          email,
          password,
          storeName,
          storeSlug,
        });
        if (!res.success) {
          setAuthError(res.error || 'Failed to create new store and account.');
        } else {
          setAuthSuccess(t.auth_registered_success);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await signIn('admin@dzprint.dz', 'admin123');
      if (!res.success) {
        // Fallback to legacy master token
        setAdminToken(`dzprint-admin-master-${Date.now()}`);
        window.location.reload();
      }
    } catch {
      setAdminToken(`dzprint-admin-master-${Date.now()}`);
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setAdminToken(null);
  };

  // Login Screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">
              {authMode === 'signin' ? t.auth_admin_login_title : t.auth_create_account}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              {authMode === 'signin' ? t.auth_admin_login_subtitle : t.store_isolated_note}
            </p>
          </div>

          {/* Switch tabs between Login and Register Store */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.auth_sign_in}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.auth_create_account}
            </button>
          </div>

          {/* Quick Access Credentials Banner */}
          {authMode === 'signin' && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl text-start text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>{t.auth_quick_credentials_banner}</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono">
                  Supabase Auth
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-white/70 dark:bg-neutral-800/70 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-neutral-800 dark:text-neutral-200">
                <div>
                  <span className="text-neutral-400 block text-[9px] font-sans">
                    {t.auth_email}:
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400">admin@dzprint.dz</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[9px] font-sans">
                    {t.auth_password}:
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400">admin123</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={isLoading}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.auth_quick_login_button}</span>
              </button>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-start text-xs">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{t.auth_full_name} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ahmed Benali"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{t.auth_store_name} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={e => {
                      setStoreName(e.target.value);
                      const slug = e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-');
                      setStoreSlug(slug || 'my-store');
                    }}
                    placeholder="DzPrint Alger Centre"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                    <span className="font-mono text-neutral-400 text-xs">#</span>
                    <span>{t.auth_store_slug} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={storeSlug}
                    onChange={e => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="dzprint-alger"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-600 dark:text-neutral-300 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t.auth_email} *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@dzprint.dz"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-neutral-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t.auth_password} *</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-neutral-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 disabled:opacity-50 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>{authMode === 'signin' ? t.auth_sign_in : t.auth_create_account}</span>
                </>
              )}
            </button>
          </form>

          <button
            onClick={onBackToStore}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 mx-auto transition"
          >
            {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t.back_to_store}</span>
          </button>
        </div>
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
                {user?.email || profile?.email || 'admin@dzprint.dz'}
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
