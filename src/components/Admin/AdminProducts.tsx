import React, { useState, useEffect, useRef } from 'react';
import {
  Shirt,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Loader2,
  Layers,
  Sparkles,
  DollarSign,
  Package,
  X,
} from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { adminFetch } from '../../lib/adminAuth';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const AdminProducts: React.FC = () => {
  const { t, language, isRtl } = useTheme();
  const { store } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [category, setCategory] = useState<'t-shirts' | 'hoodies' | 'mugs' | 'totebags' | 'caps'>('t-shirts');
  const [basePrice, setBasePrice] = useState(1800);
  const [salePrice, setSalePrice] = useState(0);
  const [stock, setStock] = useState(50);
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setNameFr('');
    setNameEn('');
    setDescription('');
    setDescriptionFr('');
    setDescriptionEn('');
    setCategory('t-shirts');
    setBasePrice(1800);
    setSalePrice(0);
    setStock(50);
    setIsCustomizable(true);
    setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
    setUploadError(null);
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name || prod.name_ar || '');
    setNameFr(prod.name_fr || '');
    setNameEn(prod.name_en || '');
    setDescription(prod.description || prod.description_ar || '');
    setDescriptionFr(prod.description_fr || '');
    setDescriptionEn(prod.description_en || '');
    setCategory((prod.category as any) || 't-shirts');
    setBasePrice(prod.base_price || 1800);
    setSalePrice(prod.sale_price || 0);
    setStock(prod.stock_quantity ?? prod.inventory ?? 0);
    setIsCustomizable(prod.is_customizable ?? prod.customizable ?? true);
    setImageUrl(prod.images?.[0] || prod.mockup_template_url || '');
    setUploadError(null);
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('store_id', store?.id || 'store-dzprint-default');

      const res = await adminFetch('/api/admin/upload-product-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload product image to Supabase Storage');
      }

      setImageUrl(data.url);
      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading product image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name,
        name_ar: name,
        name_fr: nameFr || name,
        name_en: nameEn || name,
        description,
        description_ar: description,
        description_fr: descriptionFr || description,
        description_en: descriptionEn || description,
        category,
        base_price: Number(basePrice),
        sale_price: Number(salePrice) || 0,
        stock_quantity: Number(stock),
        is_customizable: isCustomizable,
        images: imageUrl ? [imageUrl] : [],
        mockup_template_url: imageUrl,
        colors: [
          { name: 'أسود', hex: '#111827' },
          { name: 'أبيض', hex: '#ffffff' },
          { name: 'رمادي', hex: '#6b7280' },
        ],
        sizes: category === 'mugs' ? ['330ml'] : ['S', 'M', 'L', 'XL', '2XL'],
        active: true,
      };

      if (editingProduct) {
        // Update
        const res = await adminFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingProduct, ...payload }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchProducts();
        }
      } else {
        // Create
        const res = await adminFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchProducts();
        }
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce produit ?' : 'Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch {
      // ignore
    }
  };

  const getProductName = (prod: Product) => {
    if (language === 'ar') return prod.name_ar || prod.name;
    if (language === 'fr') return prod.name_fr || prod.name;
    return prod.name_en || prod.name;
  };

  const getProductDesc = (prod: Product) => {
    if (language === 'ar') return prod.description_ar || prod.description;
    if (language === 'fr') return prod.description_fr || prod.description;
    return prod.description_en || prod.description;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Shirt className="w-6 h-6 text-amber-500" />
            <span>{t.nav_products}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
              {products.length}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {language === 'ar'
              ? 'إدارة كتالوج المنتجات القابلة للتخصيص ورفع الصور عبر Supabase Storage'
              : language === 'fr'
              ? 'Gérer le catalogue des produits personnalisables et stocker les photos sur Supabase'
              : 'Manage customizable product catalog and upload product images to Supabase Storage'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            {language === 'ar' ? 'إضافة منتج جديد' : language === 'fr' ? 'Ajouter un Produit' : 'Add New Product'}
          </span>
        </button>
      </div>

      {/* Grid */}
      {isLoadingList ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(prod => {
            const displayImg = prod.images?.[0] || prod.mockup_template_url || '';
            const isCustom = prod.is_customizable ?? prod.customizable ?? true;

            return (
              <div
                key={prod.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs flex flex-col justify-between group hover:border-amber-500/40 transition"
              >
                {/* Product Image Preview */}
                <div className="relative h-48 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={getProductName(prod)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-neutral-400" />
                  )}
                  <span className="absolute top-3 start-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase">
                    {prod.category}
                  </span>
                  <span
                    className={`absolute bottom-3 end-3 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs ${
                      isCustom
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-neutral-600/90 text-neutral-200'
                    }`}
                  >
                    {isCustom
                      ? language === 'ar' ? 'جاهز للتخصيص' : language === 'fr' ? 'Personnalisable' : 'Customizable'
                      : language === 'ar' ? 'غير مخصص' : language === 'fr' ? 'Non personnalisable' : 'Standard'}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                      {getProductName(prod)}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {getProductDesc(prod)}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                        {formatPrice(prod.sale_price && prod.sale_price > 0 ? prod.sale_price : prod.base_price)}
                      </span>
                      {prod.sale_price && prod.sale_price > 0 && (
                        <span className="text-xs text-neutral-400 line-through font-mono">
                          {formatPrice(prod.base_price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-400">
                      <span>{t.store_settings}: <strong>{prod.stock_quantity ?? prod.inventory ?? 0}</strong></span>
                      <span>•</span>
                      <span>{prod.sizes?.length || 0} {language === 'ar' ? 'مقاسات' : 'tailles'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-mono">ID: {prod.id}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                        title={language === 'ar' ? 'تعديل' : 'Modifier'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-neutral-500 hover:text-red-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                        title={language === 'ar' ? 'حذف' : 'Supprimer'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-500" />
                <span>
                  {editingProduct
                    ? language === 'ar' ? 'تعديل بيانات المنتج' : language === 'fr' ? 'Modifier le Produit' : 'Edit Product'
                    : language === 'ar' ? 'إضافة منتج جديد' : language === 'fr' ? 'Nouveau Produit' : 'Create New Product'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Image Upload to Supabase Storage */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60 space-y-2.5">
                <label className="block text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>
                      {language === 'ar'
                        ? 'صورة المنتج (Supabase Storage)'
                        : language === 'fr'
                        ? 'Image du Produit (Supabase Storage)'
                        : 'Product Image (Supabase Storage)'}
                    </span>
                  </span>
                  {uploadSuccess && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.store_saved_success}</span>
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-700 rounded-xl overflow-hidden shrink-0 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {language === 'ar' ? 'رفع صورة جديدة' : language === 'fr' ? 'Téléverser image' : 'Upload Image'}
                        </span>
                      </button>

                      <span className="text-[11px] text-neutral-400">PNG, JPG, WebP max 10MB</span>
                    </div>

                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {uploadError && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Multilingual Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    الاسم (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="تيشيرت قطن بريميوم"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    Nom (Français)
                  </label>
                  <input
                    type="text"
                    value={nameFr}
                    onChange={e => setNameFr(e.target.value)}
                    placeholder="T-Shirt Coton Premium"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    placeholder="Premium Cotton T-Shirt"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Multilingual Description */}
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                  {language === 'ar' ? 'الوصف' : language === 'fr' ? 'Description' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={language === 'ar' ? 'وصف المنتج وتفاصيل الخامة...' : 'Product description...'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* Category and Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    {language === 'ar' ? 'القسم' : language === 'fr' ? 'Catégorie' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  >
                    <option value="t-shirts">تيشرت قطن (T-Shirts)</option>
                    <option value="hoodies">هودي شتوي (Hoodies)</option>
                    <option value="mugs">مج سيراميك (Mugs)</option>
                    <option value="totebags">حقيبة قماشية (Tote Bags)</option>
                    <option value="caps">قبعة كاسكيت (Caps)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    {language === 'ar' ? 'كمية المخزون' : language === 'fr' ? 'Stock disponible' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    {language === 'ar' ? 'السعر الأصلي (DA)' : language === 'fr' ? 'Prix de Base (DA)' : 'Base Price (DA)'}
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={basePrice}
                    onChange={e => setBasePrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    {language === 'ar' ? 'سعر التخفيض (DA)' : language === 'fr' ? 'Prix Réduit (DA)' : 'Sale Price (DA)'}
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={salePrice}
                    onChange={e => setSalePrice(parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Customizer check */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="customCheck"
                  checked={isCustomizable}
                  onChange={e => setIsCustomizable(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="customCheck" className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {language === 'ar'
                    ? 'تمكين التخصيص الحراري 3D لهذا المنتج'
                    : language === 'fr'
                    ? 'Activer le studio de personnalisation pour ce produit'
                    : 'Enable live 3D customizer for this product'}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-white rounded-lg font-black hover:bg-amber-600 transition shadow-xs cursor-pointer"
                >
                  {t.save_changes}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
