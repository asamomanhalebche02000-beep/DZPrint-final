import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Sun,
  Moon,
  Sparkles,
  Truck,
  ShieldCheck,
  Search,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  Settings as SettingsIcon,
  ChevronDown,
  Store,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './Auth/AuthModal';
import { Language } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, tab?: any) => void;
  onOpenCustomizer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCustomizer,
}) => {
  const { theme, toggleTheme, language, setLanguage, t, isRtl } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useSiteSettings();
  const { isAuthenticated, user, profile, store, role, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLogoLoadError(false);
  }, [settings?.logo_url]);

  const navItems = [
    { id: 'shop', label: t.nav_shop },
    { id: 'customizer', label: t.nav_customizer, highlight: true },
    { id: 'gallery', label: t.nav_gallery },
    { id: 'rates', label: t.nav_rates },
    { id: 'track', label: t.nav_track_order },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'customizer') {
      onOpenCustomizer();
    } else {
      onNavigate(id);
    }
  };

  const handleOpenSignIn = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    if (currentView === 'admin') {
      onNavigate('shop');
    }
  };

  const storeName = settings?.business_name_ar || settings?.store_name || settings?.business_name || 'DzPrint';
  const storeTagline = settings?.store_description_ar || settings?.store_description || 'ورشة الطباعة المخصصة';

  const userDisplayName = profile?.full_name || store?.name || user?.email?.split('@')[0] || t.dashboard;
  const storeDisplayName = store?.name || profile?.store_id || storeName;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Dynamic Brand Logo */}
        <div
          id="nav-brand-logo"
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {settings?.logo_url && !logoLoadError ? (
            <img
              src={settings.logo_url}
              alt={storeName}
              onError={() => setLogoLoadError(true)}
              className="h-10 max-h-10 w-auto max-w-[130px] object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-neutral-900 dark:text-white line-clamp-1">
                {storeName}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded shrink-0">
                الجزائر
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium leading-none -mt-0.5 line-clamp-1">
              {storeTagline}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  item.highlight
                    ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                    : isActive
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools (Lang, Dark Mode, Auth/Account, Cart) */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-0.5 text-[11px] font-bold">
            {(['ar', 'fr', 'en'] as Language[]).map(lang => (
              <button
                key={lang}
                id={`lang-btn-${lang}`}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  language === lang
                    ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="تبديل الوضع الليلي / النهاري"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Authentication / Account Control (Desktop) */}
          <div className="hidden sm:flex items-center">
            {!isAuthenticated ? (
              <button
                id="nav-signin-btn"
                onClick={() => handleOpenSignIn('signin')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-100 hover:bg-amber-500 hover:text-white dark:bg-neutral-800 dark:hover:bg-amber-500 dark:hover:text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.auth_sign_in}</span>
              </button>
            ) : (
              <div className="relative" ref={accountMenuRef}>
                <button
                  id="nav-account-btn"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-start max-w-[110px]">
                    <span className="truncate text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-none truncate">
                      {storeDisplayName}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      accountMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {accountMenuOpen && (
                  <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {user?.email}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                        <Store className="w-3 h-3" />
                        <span className="truncate">{storeDisplayName}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="nav-dashboard-link"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onNavigate('admin', 'orders');
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-500" />
                        <span>{t.dashboard}</span>
                      </button>

                      <button
                        id="nav-account-settings-link"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onNavigate('admin', 'account');
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                      >
                        <SettingsIcon className="w-4 h-4 text-neutral-400" />
                        <span>{t.auth_account_settings}</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        id="nav-signout-btn"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout_btn}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Drawer Trigger Button */}
          <button
            id="nav-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t.cart_title}</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center -me-1 shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 space-y-2">
          {/* Mobile Auth Section */}
          <div className="pb-2 mb-1 border-b border-neutral-100 dark:border-neutral-800">
            {!isAuthenticated ? (
              <button
                id="mobile-nav-signin-btn"
                onClick={() => handleOpenSignIn('signin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.auth_sign_in}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {userDisplayName}
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">
                      {storeDisplayName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="mobile-nav-dashboard-link"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.dashboard}</span>
                  </button>

                  <button
                    id="mobile-nav-signout-btn"
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout_btn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Nav Links */}
          {navItems.map(item => (
            <button
              key={item.id}
              id={`mobile-nav-link-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className="w-full text-start px-3 py-2.5 rounded-lg text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </header>
  );
};
