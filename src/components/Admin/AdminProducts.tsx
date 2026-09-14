import React, { useState, useEffect } from 'react';
import { Shirt, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { adminFetch } from '../../lib/adminAuth';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'t-shirts' | 'hoodies' | 'mugs' | 'tote-bags' | 'caps'>('t-shirts');
  const [basePrice, setBasePrice] = useState(1800);
  const [salePrice, setSalePrice] = useState(0);
  const [stock, setStock] = useState(50);
  const [isCustomizable, setIsCustomizable] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('t-shirts');
    setBasePrice(1800);
    setSalePrice(0);
    setStock(50);
    setIsCustomizable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category as any);
    setBasePrice(prod.base_price);
    setSalePrice(prod.sale_price || 0);
    setStock(prod.stock_quantity ?? prod.inventory ?? 0);
    setIsCustomizable(prod.is_customizable ?? prod.customizable ?? true);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingProduct) {
        // Update
        const res = await adminFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            category,
            base_price: Number(basePrice),
            sale_price: Number(salePrice) || undefined,
            stock_quantity: Number(stock),
            is_customizable: isCustomizable,
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchProducts();
        }
      } else {
        // Create
        const res = await adminFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            category,
            base_price: Number(basePrice),
            sale_price: Number(salePrice) || undefined,
            stock_quantity: Number(stock),
            is_customizable: isCustomizable,
            colors: [
              { name: 'أسود', hex: '#111827' },
              { name: 'أبيض', hex: '#ffffff' },
              { name: 'رمادي', hex: '#6b7280' },
            ],
            sizes: category === 'mugs' ? ['330ml'] : ['S', 'M', 'L', 'XL', '2XL'],
            mockup_templates: { front: '', back: '' },
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      const res = await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Shirt className="w-6 h-6 text-amber-500" />
            كتالوج المنتجات الخام القابلة للطباعة ({products.length})
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            إدارة تيشرتات 100% قطن، هوديز شتوية، ومجات سيراميك حرارية
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(prod => (
          <div
            key={prod.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  {prod.name}
                </h3>
                <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold rounded-md uppercase">
                  {prod.category}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {prod.description}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  {formatPrice(prod.sale_price && prod.sale_price > 0 ? prod.sale_price : prod.base_price)}
                </span>
                {prod.sale_price && prod.sale_price > 0 && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(prod.base_price)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-400">
                <span>المخزون: <strong>{prod.stock_quantity ?? prod.inventory ?? 0}</strong> قطعة</span>
                <span>•</span>
                <span>الألوان: {prod.colors.length}</span>
                <span>•</span>
                <span>المقاسات: {prod.sizes.join(', ')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${(prod.is_customizable ?? prod.customizable) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-600'}`}>
                {(prod.is_customizable ?? prod.customizable) ? 'جاهز للتخصيص' : 'غير قابل للتخصيص'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(prod)}
                  className="p-1.5 text-neutral-500 hover:text-amber-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">القسم</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  >
                    <option value="t-shirts">تيشرت قطن (T-Shirts)</option>
                    <option value="hoodies">هودي شتوي (Hoodies)</option>
                    <option value="mugs">مج سيراميك (Mugs)</option>
                    <option value="tote-bags">حقيبة قماشية (Tote Bags)</option>
                    <option value="caps">قبعة كاسكيت (Caps)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">كمية المخزون</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">السعر الأصلي (DA)</label>
                  <input
                    type="number"
                    step="50"
                    value={basePrice}
                    onChange={e => setBasePrice(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">سعر التخفيض (DA)</label>
                  <input
                    type="number"
                    step="50"
                    value={salePrice}
                    onChange={e => setSalePrice(parseInt(e.target.value, 10))}
                    placeholder="0 إذا لا يوجد"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="customCheck"
                  checked={isCustomizable}
                  onChange={e => setIsCustomizable(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="customCheck" className="text-neutral-700 dark:text-neutral-300">
                  فتح استوديو التخصيص الحراري لهذا المنتج
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
