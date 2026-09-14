import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { DesignsGallerySection } from './components/DesignsGallerySection';
import { PublicRatesTable } from './components/PublicRatesTable';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminView } from './components/Admin/AdminView';
import { ProductCustomizerModal } from './components/ProductCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { Product, Design, Order } from './types';

function MainApp() {
  const [currentView, setCurrentView] = useState<string>('shop');
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [selectedProductForCustomizer, setSelectedProductForCustomizer] = useState<Product | null>(null);
  const [selectedDesignForCustomizer, setSelectedDesignForCustomizer] = useState<Design | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');

  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch initial products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        if (data.length > 0 && !selectedProductForCustomizer) {
          setSelectedProductForCustomizer(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Listen to hash changes (e.g. for track order)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('track-')) {
        const orderNum = hash.replace('track-', '');
        setTrackingOrderNumber(orderNum);
        setCurrentView('track');
      } else if (hash === 'admin') {
        setCurrentView('admin');
      } else if (hash === 'rates') {
        setCurrentView('rates');
      } else if (hash === 'gallery') {
        setCurrentView('gallery');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handlers
  const handleOpenCustomizerWithProduct = (product: Product) => {
    setSelectedProductForCustomizer(product);
    setSelectedDesignForCustomizer(null);
    setCustomizerOpen(true);
  };

  const handleOpenCustomizerWithDesign = (design: Design) => {
    setSelectedDesignForCustomizer(design);
    if (!selectedProductForCustomizer && products.length > 0) {
      setSelectedProductForCustomizer(products[0]);
    }
    setCustomizerOpen(true);
  };

  const handleStartCustomizing = () => {
    if (!selectedProductForCustomizer && products.length > 0) {
      setSelectedProductForCustomizer(products[0]);
    }
    setCustomizerOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // handled inside CheckoutModal or tracking
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={view => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCustomizer={handleStartCustomizing}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'shop' && (
          <>
            <HeroBanner
              onStartCustomizing={handleStartCustomizing}
              onExploreCatalog={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <div id="catalog-section">
              <ProductCatalog onCustomizeProduct={handleOpenCustomizerWithProduct} />
            </div>

            <DesignsGallerySection onSelectDesign={handleOpenCustomizerWithDesign} />
          </>
        )}

        {currentView === 'gallery' && (
          <DesignsGallerySection onSelectDesign={handleOpenCustomizerWithDesign} />
        )}

        {currentView === 'rates' && (
          <PublicRatesTable onStartCustomizing={handleStartCustomizing} />
        )}

        {currentView === 'track' && (
          <OrderTrackingView
            initialOrderNumber={trackingOrderNumber}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'admin' && (
          <AdminView onBackToStore={() => setCurrentView('shop')} />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'admin' && (
        <Footer onNavigate={view => setCurrentView(view)} />
      )}

      {/* Interactive Product Customizer Modal */}
      <ProductCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        product={selectedProductForCustomizer || products[0] || null}
        initialDesign={selectedDesignForCustomizer}
      />

      {/* Sliding Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal with Dynamic 58 Wilayas & Agency Calculation */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
