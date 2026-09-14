// Meta Pixel (Facebook Pixel) Helper for DZPrint Storefront

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

let pixelInitialized = false;
let currentPixelId = '';

/**
 * Initialize or update the Meta Pixel on the page
 */
export function initMetaPixel(pixelId?: string, enabled: boolean = true) {
  if (typeof window === 'undefined') return;

  if (!enabled || !pixelId || !pixelId.trim()) {
    return;
  }

  const cleanId = pixelId.trim();

  // If already initialized with the same ID, just track PageView
  if (pixelInitialized && currentPixelId === cleanId) {
    trackMetaPixelPageView();
    return;
  }

  try {
    // Inject Meta Pixel Base Code if not already present
    if (!window.fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    if (window.fbq) {
      window.fbq('init', cleanId);
      window.fbq('track', 'PageView');
      pixelInitialized = true;
      currentPixelId = cleanId;
      console.log(`[Meta Pixel]: Initialized successfully with ID: ${cleanId}`);
    }
  } catch (err) {
    console.warn('[Meta Pixel Init Warning]:', err);
  }
}

/**
 * Track generic PageView
 */
export function trackMetaPixelPageView() {
  if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
    try {
      window.fbq('track', 'PageView');
    } catch (e) {
      // safe fallback
    }
  }
}

/**
 * Track ViewContent (e.g. looking at product customizer)
 */
export function trackMetaPixelViewContent(item: { name: string; price: number; id?: string; category?: string }) {
  if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: item.name,
        content_category: item.category || 'Printing',
        content_ids: [item.id || 'custom-item'],
        content_type: 'product',
        value: item.price,
        currency: 'DZD',
      });
    } catch (e) {
      // safe fallback
    }
  }
}

/**
 * Track AddToCart
 */
export function trackMetaPixelAddToCart(item: { name: string; price: number; quantity: number; id?: string }) {
  if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
    try {
      window.fbq('track', 'AddToCart', {
        content_name: item.name,
        content_ids: [item.id || 'custom-item'],
        content_type: 'product',
        value: item.price * (item.quantity || 1),
        currency: 'DZD',
      });
    } catch (e) {
      // safe fallback
    }
  }
}

/**
 * Track InitiateCheckout
 */
export function trackMetaPixelInitiateCheckout(itemsCount: number, totalValue: number) {
  if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        num_items: itemsCount,
        value: totalValue,
        currency: 'DZD',
      });
    } catch (e) {
      // safe fallback
    }
  }
}

/**
 * Track Purchase (Critical for ROAS and Facebook Ads Conversion Tracking)
 */
export function trackMetaPixelPurchase(order: { order_number: string; total: number; items?: any[] }) {
  if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
    try {
      window.fbq('track', 'Purchase', {
        content_type: 'product',
        content_ids: (order.items || []).map((it: any) => it.product_id || it.id || 'item'),
        num_items: (order.items || []).length,
        value: order.total,
        currency: 'DZD',
        order_id: order.order_number,
      });
      console.log(`[Meta Pixel]: Purchase tracked for order ${order.order_number} (${order.total} DZD)`);
    } catch (e) {
      // safe fallback
    }
  }
}
