import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, Check, Layers, Tag, Eye } from 'lucide-react';
import { Product } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';

interface ProductCatalogProps {
  onCustomizeProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onCustomizeProduct }) => {
  const { t } = useTheme();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredColor, setHoveredColor] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'all', label: t.category_all },
    { id: 't-shirts', label: t.category_tshirts },
    { id: 'hoodies', label: t.category_hoodies },
    { id: 'mugs', label: t.category_mugs },
  ];

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const color = product.colors?.[0] || { name: 'أسود', hex: '#111827' };
    const size = product.sizes?.[0] || 'L';
    const unitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.base_price;

    addToCart({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      color: color.name,
      color_hex: color.hex,
      size,
      quantity: 1,
      unit_price: unitPrice,
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            {t.products_title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.products_subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredProducts || []).map(product => {
          const colors = product.colors || [];
          const activeHex = hoveredColor[product.id] || colors[0]?.hex || '#111827';
          const unitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.base_price;

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Product Visual Container */}
              <div
                onClick={() => onCustomizeProduct(product)}
                className="relative aspect-square bg-neutral-100 dark:bg-neutral-950 p-6 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                {/* Sale Tag */}
                {product.sale_price && product.sale_price > 0 && (
                  <div className="absolute top-4 start-4 z-10 px-2.5 py-1 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                    تخفيض
                  </div>
                )}

                {/* SVG Silhouette with live color changing */}
                <div className="w-52 h-52 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  {product.category === 't-shirts' && (
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
                      <path
                        d="M130 50 L160 70 C180 80 220 80 240 70 L270 50 L360 110 L320 170 L280 145 L280 370 C280 375 275 380 270 380 L130 380 C125 380 120 375 120 370 L120 145 L80 170 L40 110 Z"
                        fill={activeHex}
                        stroke="#000000"
                        strokeOpacity="0.1"
                        strokeWidth="2"
                      />
                    </svg>
                  )}

                  {product.category === 'hoodies' && (
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
                      <path
                        d="M120 70 L150 90 L250 90 L280 70 L370 130 L330 190 L290 165 L290 380 L110 380 L110 165 L70 190 L30 130 Z"
                        fill={activeHex}
                        stroke="#000000"
                        strokeOpacity="0.1"
                        strokeWidth="2"
                      />
                    </svg>
                  )}

                  {product.category === 'mugs' && (
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
                      <path
                        d="M280 140 C350 140 350 260 280 260"
                        fill="none"
                        stroke={activeHex === '#ffffff' ? '#d1d5db' : activeHex}
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                      <rect
                        x="100"
                        y="100"
                        width="190"
                        height="220"
                        rx="12"
                        fill={activeHex}
                        stroke="#000000"
                        strokeOpacity="0.1"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>افتح استوديو التخصيص</span>
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Color preview dots */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 font-medium">الألوان:</span>
                  <div className="flex gap-1.5">
                    {colors.map(col => (
                      <button
                        key={col.hex}
                        onMouseEnter={() => setHoveredColor({ ...hoveredColor, [product.id]: col.hex })}
                        style={{ backgroundColor: col.hex }}
                        className={`w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 transition ${
                          activeHex === col.hex ? 'ring-2 ring-amber-500' : ''
                        }`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes and Price */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">السعر:</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-neutral-900 dark:text-white">
                        {formatPrice(unitPrice)}
                      </span>
                      {product.sale_price && product.sale_price > 0 && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(product.base_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCustomizeProduct(product)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تخصيص</span>
                    </button>
                    <button
                      onClick={e => handleQuickAdd(product, e)}
                      className="p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl transition"
                      title="إضافة سريعة للسلة"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
