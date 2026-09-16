import React from 'react';
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
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SettingsContext';
import { Language } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [logoLoadError, setLogoLoadError] = React.useState(false);

  React.useEffect(() => {
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

  const storeName = settings?.business_name_ar || settings?.store_name || settings?.business_name || 'DzPrint';
  const storeTagline = settings?.store_description_ar || settings?.store_description || 'ورشة الطباعة المخصصة';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Dynamic Brand Logo */}
        <div
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
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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

        {/* Right Tools (Lang, Dark Mode, Admin, Cart) */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-0.5 text-[11px] font-bold">
            {(['ar', 'fr', 'en'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg transition ${
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
            onClick={toggleTheme}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="تبديل الوضع الليلي / النهاري"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm"
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full text-start px-3 py-2.5 rounded-lg text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
