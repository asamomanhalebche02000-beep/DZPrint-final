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
import { useTheme } from '../../context/ThemeContext';

export const AdminInventory: React.FC = () => {
  const { t, language, isRtl } = useTheme();

  const getCategoryTabs = () => [
    { key: 'all', label: language === 'ar' ? 'كافة المواد' : language === 'fr' ? 'Tous les articles' : 'All Inventory', icon: Boxes },
    { key: 'blank', label: language === 'ar' ? 'القطع الخام' : language === 'fr' ? 'Textiles & Objets bruts' : 'Raw Blanks', icon: Package },
    { key: 'ink', label: language === 'ar' ? 'الأحبار والكيماويات' : language === 'fr' ? 'Encres & Chimie' : 'Inks & Chemicals', icon: Droplet },
    { key: 'film_powder', label: language === 'ar' ? 'أفلام وبودرة DTF' : language === 'fr' ? 'Films & Poudre DTF' : 'DTF Film & Powder', icon: Layers },
    { key: 'packaging', label: language === 'ar' ? 'التغليف والعلب' : language === 'fr' ? 'Emballage & Cartons' : 'Packaging & Boxes', icon: Boxes },
    { key: 'suppliers', label: language === 'ar' ? 'سجل الموردين' : language === 'fr' ? 'Fournisseurs' : 'Suppliers Directory', icon: Truck },
    { key: 'movements', label: language === 'ar' ? 'سجل الحركات' : language === 'fr' ? 'Mouvements de stock' : 'Stock Movements Log', icon: History },
  ];

  const CATEGORY_TABS = getCategoryTabs();

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
            {language === 'ar'
              ? 'إدارة المخزون وسلسلة الإمداد (Inventory & Supplies)'
              : language === 'fr'
              ? 'Gestion des Stocks & Fournitures'
              : 'Inventory & Workshop Supplies Management'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'تتبع القطع الخام (تيشيرتات، هوديز، أكواب)، أحبار DTF، وتنبيهات النقص'
              : language === 'fr'
              ? 'Suivi des textiles bruts, encres DTF, alertes de réapprovisionnement et fournisseurs'
              : 'Track blank apparel, DTF inks, low stock threshold alerts, and supplier logs'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'suppliers' ? (
            <button
              onClick={() => setIsAddSupplierModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة مورد جديد' : language === 'fr' ? 'Nouveau Fournisseur' : 'Add Supplier'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة مادة للمخزون' : language === 'fr' ? 'Nouvel Article' : 'Add Item'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'إجمالي أصناف المخزون' : language === 'fr' ? 'Total Articles' : 'Total Items'}
            </span>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">{items.length}</p>
          <span className="text-[10px] text-neutral-400">
            {language === 'ar' ? 'ملابس، أحبار، مستلزمات' : language === 'fr' ? 'Vêtements, encres, consommables' : 'Apparel, inks, consumables'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'تنبيهات نقص المخزون' : language === 'fr' ? 'Alertes Stock Faible' : 'Low Stock Alerts'}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {lowStockItems.length}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">
            {language === 'ar' ? 'مواد شارفت على النفاد' : language === 'fr' ? 'Articles sous le seuil critique' : 'Items below threshold'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'القيمة التقديرية للمخزون' : language === 'fr' ? 'Valeur Estimée' : 'Stock Valuation'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {formatPrice(totalValuation)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {language === 'ar' ? 'سعر التكلفة الإجمالي' : language === 'fr' ? 'Coût d’achat total' : 'Total inventory cost'}
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">
              {language === 'ar' ? 'الموردين المسجلين' : language === 'fr' ? 'Fournisseurs Enregistrés' : 'Registered Suppliers'}
            </span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">{suppliers.length}</p>
          <span className="text-[10px] text-neutral-400">
            {language === 'ar' ? 'موردين محليين ودوليين' : language === 'fr' ? 'Locaux et partenaires' : 'Local and overseas partners'}
          </span>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-pulse" />
            <span>
              <strong>{language === 'ar' ? 'تنبيه مخزون: ' : language === 'fr' ? 'Alerte stock : ' : 'Stock Alert: '}</strong>
              {language === 'ar'
                ? `هناك ${lowStockItems.length} مواد وصلت للحد الأدنى من المخزون (${lowStockItems.map(x => x.name).join('، ')})`
                : language === 'fr'
                ? `${lowStockItems.length} articles ont atteint le seuil minimum (${lowStockItems.map(x => x.name).join(', ')})`
                : `${lowStockItems.length} items reached minimum threshold (${lowStockItems.map(x => x.name).join(', ')})`}
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
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
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
              {language === 'ar'
                ? 'دليل موردي الورشة ومصادر المواد الخام'
                : language === 'fr'
                ? 'Répertoire des Fournisseurs & Matières Premières'
                : 'Suppliers Directory & Raw Materials Sourcing'}
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
                    {language === 'ar' ? 'مورد نشط' : language === 'fr' ? 'Fournisseur actif' : 'Active supplier'}
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
                  <span className="text-neutral-500 font-semibold block">
                    {language === 'ar' ? 'المواد الموردة:' : language === 'fr' ? 'Articles fournis :' : 'Supplied materials:'}
                  </span>
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
              {language === 'ar'
                ? 'سجل حركات وتدفقات المخزون (صرف، توريد، تالف)'
                : language === 'fr'
                ? 'Historique des Mouvements (Entrées, Sorties, Pertes)'
                : 'Stock Movements Audit Log (Restock, Use, Waste)'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3 text-start">{language === 'ar' ? 'التاريخ والوقت' : language === 'fr' ? 'Date & Heure' : 'Date & Time'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'المادة' : language === 'fr' ? 'Article' : 'Item'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'النوع' : language === 'fr' ? 'Type' : 'Type'}</th>
                  <th className="p-3 text-center">{language === 'ar' ? 'الكمية' : language === 'fr' ? 'Quantité' : 'Quantity'}</th>
                  <th className="p-3 text-center">{language === 'ar' ? 'المخزون السابق / الجديد' : language === 'fr' ? 'Ancien / Nouveau' : 'Prev / New Stock'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'السبب / البيان' : language === 'fr' ? 'Motif' : 'Reason / Note'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'المشغل' : language === 'fr' ? 'Opérateur' : 'Operator'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {movements.map(mov => (
                  <tr key={mov.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-3 font-mono text-neutral-500 text-[11px]">
                      {new Date(mov.timestamp).toLocaleString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US')}
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
                          ? (language === 'ar' ? 'شحنة توريد (+)' : language === 'fr' ? 'Entrée stock (+)' : 'Restock (+)')
                          : mov.type === 'production_use'
                          ? (language === 'ar' ? 'صرف للإنتاج (-)' : language === 'fr' ? 'Production (-)' : 'Production use (-)')
                          : mov.type === 'waste_defect'
                          ? (language === 'ar' ? 'تالف / تجارب (-)' : language === 'fr' ? 'Rebuts / Défauts (-)' : 'Waste / Defect (-)')
                          : (language === 'ar' ? 'تعديل جرد' : language === 'fr' ? 'Ajustement' : 'Inventory Adj.')}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      <span className={mov.change_qty > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {mov.change_qty > 0 ? `+${mov.change_qty}` : mov.change_qty}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-neutral-500">
                      {mov.previous_stock} → <span className="font-bold text-neutral-900 dark:text-white">{mov.new_stock}</span>
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
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-neutral-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={
                  language === 'ar'
                    ? 'ابحث باسم المادة، المقاس، الـ SKU أو المورد...'
                    : language === 'fr'
                    ? 'Rechercher par article, taille, SKU ou fournisseur...'
                    : 'Search by item, size, SKU, or supplier...'
                }
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white ${
                  isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
            <span className="text-xs text-neutral-500">
              {language === 'ar'
                ? `عرض ${filteredItems.length} من ${items.length} صنف`
                : language === 'fr'
                ? `Affichage de ${filteredItems.length} sur ${items.length} articles`
                : `Showing ${filteredItems.length} of ${items.length} items`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3 text-start">{language === 'ar' ? 'الصنف والمواصفات' : language === 'fr' ? 'Article & Specs' : 'Item & Specs'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'القسم' : language === 'fr' ? 'Catégorie' : 'Category'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'مكان التخزين' : language === 'fr' ? 'Emplacement' : 'Location'}</th>
                  <th className="p-3 text-center">{language === 'ar' ? 'الكمية المتوفرة' : language === 'fr' ? 'En Stock' : 'In Stock'}</th>
                  <th className="p-3 text-center">{language === 'ar' ? 'الحد الأدنى' : language === 'fr' ? 'Seuil Min' : 'Min Alert'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'سعر التكلفة' : language === 'fr' ? 'Coût Unitaire' : 'Unit Cost'}</th>
                  <th className="p-3 text-start">{language === 'ar' ? 'القيمة الإجمالية' : language === 'fr' ? 'Valeur Totale' : 'Total Value'}</th>
                  <th className="p-3 text-center">{language === 'ar' ? 'تعديل المخزون' : language === 'fr' ? 'Actions' : 'Actions'}</th>
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
                              {language === 'ar' ? 'ناقص' : language === 'fr' ? 'Bas' : 'Low'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {item.sku} {item.color ? `• ${item.color}` : ''} {item.size ? `• ${language === 'ar' ? 'مقاس:' : 'Size:'} ${item.size}` : ''}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-[10px]">
                          {item.category === 'blank'
                            ? (language === 'ar' ? 'قطع خام' : language === 'fr' ? 'Bruts' : 'Blanks')
                            : item.category === 'ink'
                            ? (language === 'ar' ? 'أحبار' : language === 'fr' ? 'Encres' : 'Inks')
                            : item.category === 'film_powder'
                            ? (language === 'ar' ? 'أفلام وبودرة' : language === 'fr' ? 'Films & Poudres' : 'Film & Powder')
                            : (language === 'ar' ? 'تغليف' : language === 'fr' ? 'Emballages' : 'Packaging')}
                        </span>
                      </td>

                      <td className="p-3 text-neutral-500 text-[11px]">
                        {item.location_in_workshop || (language === 'ar' ? 'الورشة' : 'Atelier')}
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
                            className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg cursor-pointer"
                            title={language === 'ar' ? 'إضافة شحنة توريد (+)' : 'Entrée stock (+)'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustType('production_use');
                              setAdjustQty(5);
                            }}
                            className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                            title={language === 'ar' ? 'صرف للإنتاج أو تالف (-)' : 'Sortie production (-)'}
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
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                {language === 'ar'
                  ? `تعديل مخزون: ${adjustingItem.name}`
                  : language === 'fr'
                  ? `Ajustement Stock : ${adjustingItem.name}`
                  : `Adjust Stock: ${adjustingItem.name}`}
              </h3>
              <button onClick={() => setAdjustingItem(null)} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    {language === 'ar' ? 'المخزون الحالي:' : language === 'fr' ? 'Stock actuel :' : 'Current Stock:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {adjustingItem.current_stock} {adjustingItem.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    {language === 'ar' ? 'الموقع في الورشة:' : language === 'fr' ? 'Emplacement :' : 'Workshop Location:'}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {adjustingItem.location_in_workshop || (language === 'ar' ? 'غير محدد' : 'Non spécifié')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'نوع الحركة' : language === 'fr' ? 'Type de mouvement' : 'Movement Type'}
                </label>
                <select
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white"
                >
                  <option value="restock">
                    {language === 'ar' ? 'إضافة شحنة توريد واستلام جديد (+)' : language === 'fr' ? 'Réception livraison (+)' : 'Restock delivery (+)'}
                  </option>
                  <option value="production_use">
                    {language === 'ar' ? 'صرف للإنتاج والطباعة (-)' : language === 'fr' ? 'Consommation production (-)' : 'Production usage (-)'}
                  </option>
                  <option value="waste_defect">
                    {language === 'ar' ? 'تالف أو عيوب كبس حراري (-)' : language === 'fr' ? 'Perte / Rebut de presse (-)' : 'Defect / Waste (-)'}
                  </option>
                  <option value="adjustment">
                    {language === 'ar' ? 'جرد وتصحيح يدوي' : language === 'fr' ? 'Correction d’inventaire' : 'Manual Audit Adjustment'}
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? `الكمية (${adjustingItem.unit})` : `Quantity (${adjustingItem.unit})`}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'السبب أو رقم الفاتورة/الطلبية' : language === 'fr' ? 'Motif ou n° facture' : 'Reason or invoice #'}
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: استلام دفعة جديدة من المورد TexPrint' : 'Ex: Nouvelle livraison TexPrint'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد تسجيل الحركة' : language === 'fr' ? 'Confirmer' : 'Confirm Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                {language === 'ar' ? 'إضافة مادة أو قطعة جديدة للمخزون' : language === 'fr' ? 'Nouvel article dans le stock' : 'Add New Inventory Item'}
              </h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'اسم المادة أو القطعة الخام *' : language === 'fr' ? 'Nom de l’article *' : 'Item or Raw Blank Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.name || ''}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: تيشيرت قطن ممشط أسود - مقاس XL' : 'Ex: T-shirt coton peigné noir XL'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'قسم المخزون' : language === 'fr' ? 'Catégorie' : 'Category'}
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                  >
                    <option value="blank">{language === 'ar' ? 'قطع خام (ملابس/أكواب)' : language === 'fr' ? 'Textiles & Bruts' : 'Raw Blanks'}</option>
                    <option value="ink">{language === 'ar' ? 'أحبار وكيماويات' : language === 'fr' ? 'Encres & Chimie' : 'Inks & Chemicals'}</option>
                    <option value="film_powder">{language === 'ar' ? 'أفلام وبودرة DTF' : language === 'fr' ? 'Films & Poudre DTF' : 'DTF Film & Powder'}</option>
                    <option value="packaging">{language === 'ar' ? 'كرتون وتغليف' : language === 'fr' ? 'Cartons & Emballage' : 'Packaging'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'وحدة القياس' : language === 'fr' ? 'Unité de mesure' : 'Unit of Measurement'}
                  </label>
                  <input
                    type="text"
                    value={itemForm.unit || (language === 'ar' ? 'قطعة' : 'Pcs')}
                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder={language === 'ar' ? 'قطعة، لتر، كغ، رول...' : 'Pcs, L, Kg, Rouleau...'}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'الكمية الحالية' : language === 'fr' ? 'Quantité initiale' : 'Current Stock'}
                  </label>
                  <input
                    type="number"
                    value={itemForm.current_stock || 0}
                    onChange={e => setItemForm({ ...itemForm, current_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'حد التنبيه الأدنى' : language === 'fr' ? 'Seuil d’alerte' : 'Min Alert Threshold'}
                  </label>
                  <input
                    type="number"
                    value={itemForm.min_threshold || 10}
                    onChange={e => setItemForm({ ...itemForm, min_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'سعر التكلفة (دج)' : language === 'fr' ? 'Prix d’achat (DZD)' : 'Unit Cost (DZD)'}
                  </label>
                  <input
                    type="number"
                    value={itemForm.cost_per_unit || 0}
                    onChange={e => setItemForm({ ...itemForm, cost_per_unit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'مكان التخزين في الورشة' : language === 'fr' ? 'Emplacement atelier' : 'Workshop Storage Location'}
                </label>
                <input
                  type="text"
                  value={itemForm.location_in_workshop || ''}
                  onChange={e => setItemForm({ ...itemForm, location_in_workshop: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: الرف A3 - قسم الملابس الجاهزة' : 'Ex: Rayon A3 - Textiles'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ الصنف في المخزون' : language === 'fr' ? 'Enregistrer' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                {language === 'ar' ? 'إضافة مورد جديد للورشة' : language === 'fr' ? 'Ajouter un nouveau fournisseur' : 'Add New Supplier'}
              </h3>
              <button onClick={() => setIsAddSupplierModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'اسم المورد أو الشركة *' : language === 'fr' ? 'Nom du fournisseur *' : 'Supplier Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name || ''}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Ex: SARL TexPrint Algérie"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'رقم الهاتف *' : language === 'fr' ? 'Téléphone *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="0555 12 34 56"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === 'ar' ? 'الولاية' : language === 'fr' ? 'Wilaya' : 'Wilaya'}
                  </label>
                  <input
                    type="text"
                    value={supplierForm.wilaya || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, wilaya: e.target.value })}
                    placeholder={language === 'ar' ? 'الجزائر، وهران، بومرداس...' : 'Alger, Oran, Blida...'}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'المواد التي يوفرها' : language === 'fr' ? 'Matériaux fournis' : 'Supplied Materials'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'تيشيرتات قطنية، أحبار، أكواب...' : 'T-shirts, encres, tasses...'}
                  onChange={e =>
                    setSupplierForm({
                      ...supplierForm,
                      supplied_materials: e.target.value.split(/[,،]/).map(s => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ المورد' : language === 'fr' ? 'Enregistrer' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
