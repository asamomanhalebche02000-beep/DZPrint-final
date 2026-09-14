import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  Layers,
  Truck,
  TrendingDown,
  History,
  DollarSign,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  Droplet,
  MapPin,
  Phone,
  Building,
} from 'lucide-react';
import { InventoryItem, InventoryCategory, StockMovement, Supplier } from '../../types';
import { formatPrice } from '../../lib/utils';
import { adminFetch } from '../../lib/adminAuth';

const CATEGORY_TABS: { key: string; label: string; icon: any }[] = [
  { key: 'all', label: 'كافة المواد', icon: Boxes },
  { key: 'blank', label: 'القطع الخام (الملابس والأكواب)', icon: Package },
  { key: 'ink', label: 'الأحبار والكيماويات', icon: Droplet },
  { key: 'film_powder', label: 'أفلام وبودرة DTF', icon: Layers },
  { key: 'packaging', label: 'التغليف والعلب', icon: Boxes },
  { key: 'suppliers', label: 'سجل الموردين', icon: Truck },
  { key: 'movements', label: 'سجل حركات المخزون', icon: History },
];

export const AdminInventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'restock' | 'production_use' | 'waste_defect' | 'adjustment'>('restock');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Form states
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    category: 'blank',
    current_stock: 0,
    min_threshold: 10,
    unit: 'قطعة',
    cost_per_unit: 0,
  });

  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    wilaya: '',
    supplied_materials: [],
    active: true,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, supRes, movRes] = await Promise.all([
        adminFetch('/api/admin/inventory'),
        adminFetch('/api/admin/suppliers'),
        adminFetch('/api/admin/inventory/movements'),
      ]);
      const [invData, supData, movData] = await Promise.all([
        invRes.json(),
        supRes.json(),
        movRes.json(),
      ]);
      if (Array.isArray(invData)) setItems(invData);
      if (Array.isArray(supData)) setSuppliers(supData);
      if (Array.isArray(movData)) setMovements(movData);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items
  const filteredItems = items.filter(item => {
    if (activeTab !== 'all' && activeTab !== 'suppliers' && activeTab !== 'movements') {
      if (item.category !== activeTab) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Low stock items
  const lowStockItems = items.filter(i => i.current_stock <= i.min_threshold);
  const totalValuation = items.reduce((sum, i) => sum + i.current_stock * (i.cost_per_unit || 0), 0);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustQty === 0) return;

    const change = adjustType === 'restock' || adjustType === 'adjustment' && adjustQty > 0
      ? Math.abs(adjustQty)
      : -Math.abs(adjustQty);

    try {
      const res = await adminFetch('/api/admin/inventory/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: adjustingItem.id,
          change_qty: change,
          type: adjustType,
          reason: adjustReason || undefined,
          operator: 'مسؤول الورشة',
        }),
      });

      if (res.ok) {
        const { item, movement } = await res.json();
        setItems(prev => prev.map(i => (i.id === item.id ? item : i)));
        setMovements(prev => [movement, ...prev]);
        setAdjustingItem(null);
        setAdjustReason('');
      }
    } catch {
      // ignore
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.category) return;

    try {
      const res = await adminFetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm),
      });
      if (res.ok) {
        const saved = await res.json();
        setItems(prev => [...prev, saved]);
        setIsAddItemModalOpen(false);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.phone) return;

    try {
      const res = await adminFetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });
      if (res.ok) {
        const saved = await res.json();
        setSuppliers(prev => [...prev, saved]);
        setIsAddSupplierModalOpen(false);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            إدارة المخزون وسلسلة الإمداد (Inventory & Workshop Supplies)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            تتبع القطع الخام (تيشيرتات، هوديز، أكواب)، أحبار DTF والسبليمايشن، تنبيهات النقص وسجل الموردين
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'suppliers' ? (
            <button
              onClick={() => setIsAddSupplierModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة مورد جديد
            </button>
          ) : (
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة مادة للمخزون
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">إجمالي أصناف المخزون</span>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">{items.length}</p>
          <span className="text-[10px] text-neutral-400">ملابس، أحبار، مستلزمات</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">تنبيهات نقص المخزون</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {lowStockItems.length}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">مواد شارفت على النفاد</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">القيمة التقديرية للمخزون</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(totalValuation)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">سعر التكلفة الإجمالي</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">الموردين المسجلين</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">{suppliers.length}</p>
          <span className="text-[10px] text-neutral-400">موردين محليين ودوليين</span>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-pulse" />
            <span>
              <strong>تنبيه مخزون:</strong> هناك {lowStockItems.length} مواد وصلت للحد الأدنى من المخزون (
              {lowStockItems.map(x => x.name).join('، ')})
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-2">
        {CATEGORY_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'suppliers' && (
                <span className="px-1.5 py-0.2 bg-black/10 rounded-md text-[10px]">{suppliers.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENT: Suppliers Directory */}
      {activeTab === 'suppliers' ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              دليل موردي الورشة ومصادر المواد الخام
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {suppliers.map(sup => (
              <div
                key={sup.id}
                className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700/60 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{sup.name}</h4>
                    {sup.contact_person && (
                      <p className="text-xs text-neutral-500 mt-0.5">{sup.contact_person}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-md">
                    مورد نشط
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono">{sup.phone}</span>
                  </div>
                  {sup.wilaya && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{sup.wilaya} {sup.address ? `- ${sup.address}` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 border-t border-neutral-200 dark:border-neutral-700 pt-2 text-[11px]">
                  <span className="text-neutral-500 font-semibold block">المواد الموردة:</span>
                  <div className="flex flex-wrap gap-1">
                    {sup.supplied_materials.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-200 text-[10px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {sup.notes && (
                  <p className="text-[11px] text-neutral-500 italic bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    "{sup.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'movements' ? (
        /* CONTENT: Movements Audit Log */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              سجل حركات وتدفقات المخزون (صرف، توريد، تالف)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">المادة</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3 text-center">الكمية</th>
                  <th className="p-3 text-center">المخزون السابق / الجديد</th>
                  <th className="p-3">السبب / البيان</th>
                  <th className="p-3">المشغل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {movements.map(mov => (
                  <tr key={mov.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-3 font-mono text-neutral-500 text-[11px]">
                      {new Date(mov.timestamp).toLocaleString('ar-DZ')}
                    </td>
                    <td className="p-3 font-bold text-neutral-900 dark:text-white">{mov.item_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          mov.type === 'restock'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : mov.type === 'waste_defect'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {mov.type === 'restock'
                          ? 'شحنة توريد (+)'
                          : mov.type === 'production_use'
                          ? 'صرف للإنتاج (-)'
                          : mov.type === 'waste_defect'
                          ? 'تالف / تجارب (-)'
                          : 'تعديل جرد'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      <span className={mov.change_qty > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {mov.change_qty > 0 ? `+${mov.change_qty}` : mov.change_qty}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-neutral-500">
                      {mov.previous_stock} ← <span className="font-bold text-neutral-900 dark:text-white">{mov.new_stock}</span>
                    </td>
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">{mov.reason || '-'}</td>
                    <td className="p-3 text-neutral-500">{mov.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CONTENT: Inventory Items Table */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden space-y-3">
          {/* Search bar */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="ابحث باسم المادة، المقاس، الـ SKU أو المورد..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <span className="text-xs text-neutral-500">
              عرض {filteredItems.length} من {items.length} صنف
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">الصنف والمواصفات</th>
                  <th className="p-3">القسم</th>
                  <th className="p-3">مكان التخزين</th>
                  <th className="p-3 text-center">الكمية المتوفرة</th>
                  <th className="p-3 text-center">الحد الأدنى</th>
                  <th className="p-3">سعر التكلفة</th>
                  <th className="p-3">القيمة الإجمالية</th>
                  <th className="p-3 text-center">تعديل المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredItems.map(item => {
                  const isLow = item.current_stock <= item.min_threshold;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors ${
                        isLow ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          {item.name}
                          {isLow && (
                            <span className="px-1.5 py-0.2 bg-rose-500 text-white font-bold rounded-md text-[9px]">
                              ناقص
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {item.sku} {item.color ? `• ${item.color}` : ''} {item.size ? `• مقاس: ${item.size}` : ''}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-[10px]">
                          {item.category === 'blank'
                            ? 'قطع خام'
                            : item.category === 'ink'
                            ? 'أحبار'
                            : item.category === 'film_powder'
                            ? 'أفلام وبودرة'
                            : 'تغليف'}
                        </span>
                      </td>

                      <td className="p-3 text-neutral-500 text-[11px]">
                        {item.location_in_workshop || 'الورشة'}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {item.current_stock} {item.unit}
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono text-neutral-400 text-xs">
                        {item.min_threshold} {item.unit}
                      </td>

                      <td className="p-3 font-mono text-neutral-800 dark:text-neutral-200">
                        {formatPrice(item.cost_per_unit)}
                      </td>

                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(item.current_stock * item.cost_per_unit)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustType('restock');
                              setAdjustQty(20);
                            }}
                            className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg"
                            title="إضافة شحنة توريد (+)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustType('production_use');
                              setAdjustQty(5);
                            }}
                            className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg"
                            title="صرف للإنتاج أو تالف (-)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                تعديل مخزون: {adjustingItem.name}
              </h3>
              <button onClick={() => setAdjustingItem(null)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">المخزون الحالي:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {adjustingItem.current_stock} {adjustingItem.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">الموقع في الورشة:</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {adjustingItem.location_in_workshop || 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">نوع الحركة</label>
                <select
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold"
                >
                  <option value="restock">إضافة شحنة توريد واستلام جديد (+)</option>
                  <option value="production_use">صرف للإنتاج والطباعة (-)</option>
                  <option value="waste_defect">تالف أو عيوب كبس حراري (-)</option>
                  <option value="adjustment">جرد وتصحيح يدوي</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">الكمية ({adjustingItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">السبب أو رقم الفاتورة/الطلبية</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="مثال: استلام دفعة جديدة من المورد TexPrint"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  تأكيد تسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                إضافة مادة أو قطعة جديدة للمخزون
              </h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">اسم المادة أو القطعة الخام *</label>
                <input
                  type="text"
                  required
                  value={itemForm.name || ''}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="مثال: تيشيرت قطن ممشط أسود - مقاس XL"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">قسم المخزون</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  >
                    <option value="blank">قطع خام (ملابس/أكواب)</option>
                    <option value="ink">أحبار وكيماويات</option>
                    <option value="film_powder">أفلام وبودرة DTF</option>
                    <option value="packaging">كرتون وتغليف</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">وحدة القياس</label>
                  <input
                    type="text"
                    value={itemForm.unit || 'قطعة'}
                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="قطعة، لتر، كغ، رول..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">الكمية الحالية</label>
                  <input
                    type="number"
                    value={itemForm.current_stock || 0}
                    onChange={e => setItemForm({ ...itemForm, current_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">حد التنبيه الأدنى</label>
                  <input
                    type="number"
                    value={itemForm.min_threshold || 10}
                    onChange={e => setItemForm({ ...itemForm, min_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">سعر التكلفة (دج)</label>
                  <input
                    type="number"
                    value={itemForm.cost_per_unit || 0}
                    onChange={e => setItemForm({ ...itemForm, cost_per_unit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">مكان التخزين في الورشة</label>
                <input
                  type="text"
                  value={itemForm.location_in_workshop || ''}
                  onChange={e => setItemForm({ ...itemForm, location_in_workshop: e.target.value })}
                  placeholder="مثال: الرف A3 - قسم الملابس الجاهزة"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  حفظ الصنف في المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                إضافة مورد جديد للورشة
              </h3>
              <button onClick={() => setIsAddSupplierModalOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">اسم المورد أو الشركة *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name || ''}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="مثال: SARL TexPrint Algérie"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="0555 12 34 56"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">الولاية</label>
                  <input
                    type="text"
                    value={supplierForm.wilaya || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, wilaya: e.target.value })}
                    placeholder="الجزائر، وهران، بومرداس..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">المواد التي يوفرها</label>
                <input
                  type="text"
                  placeholder="تيشيرتات قطنية، أحبار، أكواب..."
                  onChange={e =>
                    setSupplierForm({
                      ...supplierForm,
                      supplied_materials: e.target.value.split('،').map(s => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
