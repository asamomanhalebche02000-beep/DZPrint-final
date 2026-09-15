import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Save,
  Download,
  Upload,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Building,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { DeliveryAgency, DeliveryRate, Wilaya } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { adminFetch } from '../../lib/adminAuth';

export const AdminDeliveryRates: React.FC = () => {
  const { t, language, isRtl } = useTheme();

  const [agencies, setAgencies] = useState<DeliveryAgency[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('yalidine');

  // Search & filter
  const [searchWilaya, setSearchWilaya] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Agency Modal
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyPhone, setNewAgencyPhone] = useState('');
  const [newAgencyWebsite, setNewAgencyWebsite] = useState('');
  const [newAgencyNotes, setNewAgencyNotes] = useState('');

  // CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  // Editable local rates state for the current agency
  const [editedRates, setEditedRates] = useState<Record<number, { home: number; office: number; eta: string; active: boolean }>>({});

  const loadData = async () => {
    try {
      const [agRes, wilRes, rtRes] = await Promise.all([
        fetch('/api/agencies').then(r => r.json()),
        fetch('/api/wilayas').then(r => r.json()),
        fetch('/api/rates').then(r => r.json()),
      ]);

      setAgencies(agRes);
      setWilayas(wilRes);
      setRates(rtRes);

      if (agRes.length > 0 && !selectedAgencyId) {
        setSelectedAgencyId(agRes[0].id);
      }
    } catch {
      setErrorMessage('فشل تحميل بيانات شركات وأسعار التوصيل');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update local editable rate map whenever selected agency changes or rates load
  useEffect(() => {
    if (!selectedAgencyId || rates.length === 0 || wilayas.length === 0) return;

    const map: Record<number, { home: number; office: number; eta: string; active: boolean }> = {};
    for (const w of wilayas) {
      const r = rates.find(x => x.agency_id === selectedAgencyId && x.wilaya_id === w.id);
      map[w.id] = {
        home: r ? r.home_price : 700,
        office: r ? r.office_price : 500,
        eta: r ? r.estimated_days : '2-4 أيام',
        active: r ? r.active : true,
      };
    }
    setEditedRates(map);
  }, [selectedAgencyId, rates, wilayas]);

  // Handle single cell input change
  const handleRateChange = (wilayaId: number, field: 'home' | 'office' | 'eta' | 'active', value: any) => {
    setEditedRates(prev => ({
      ...prev,
      [wilayaId]: {
        ...prev[wilayaId],
        [field]: value,
      },
    }));
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!selectedAgencyId) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const ratesToSave: DeliveryRate[] = Object.entries(editedRates).map(([wId, val]: [string, { home: number; office: number; eta: string; active: boolean }]) => ({
        id: `rate_${selectedAgencyId}_${wId}`,
        agency_id: selectedAgencyId,
        wilaya_id: parseInt(wId, 10),
        home_price: Number(val.home),
        office_price: Number(val.office),
        estimated_days: val.eta,
        active: val.active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const res = await adminFetch('/api/admin/rates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: ratesToSave }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ الأسعار');

      setSaveSuccess(true);
      await loadData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new Agency
  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;

    try {
      const res = await adminFetch('/api/admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgencyName.trim(),
          phone: newAgencyPhone.trim() || '0550 00 00 00',
          website: newAgencyWebsite.trim(),
          notes: newAgencyNotes.trim(),
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created.error || 'فشل إنشاء الشركة');

      setIsAgencyModalOpen(false);
      setNewAgencyName('');
      setNewAgencyPhone('');
      setNewAgencyWebsite('');
      setNewAgencyNotes('');
      await loadData();
      setSelectedAgencyId(created.id);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/admin/rates/export-csv', '_blank');
  };

  // Import CSV
  const handleImportCsv = async () => {
    if (!csvContent.trim()) return;
    setCsvMessage('جاري معالجة وتحديث الأسعار...');

    try {
      const res = await adminFetch('/api/admin/rates/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCsvMessage(data.message || 'تم الاستيراد بنجاح!');
      await loadData();
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvContent('');
        setCsvMessage(null);
      }, 1500);
    } catch (err: any) {
      setCsvMessage(`خطأ: ${err.message}`);
    }
  };

  const filteredWilayas = wilayas.filter(w => {
    const q = searchWilaya.trim().toLowerCase();
    if (!q) return true;
    return (
      w.code.includes(q) ||
      w.name_ar.toLowerCase().includes(q) ||
      w.name_fr.toLowerCase().includes(q)
    );
  });

  const selectedAgency = agencies.find(a => a.id === selectedAgencyId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-500" />
            {language === 'ar'
              ? 'إدارة شركات وأسعار التوصيل (Delivery Matrix)'
              : language === 'fr'
              ? 'Gestion des Transporteurs & Tarifs de Livraison'
              : 'Delivery Carriers & Shipping Rates Matrix'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'تحكم كامل في تسعيرة التوصيل المنزلي والمكتبي لكل ولاية ولكل شركة على حدة (الأسعار تطبق فوراً في المتجر)'
              : language === 'fr'
              ? 'Contrôle complet des tarifs à domicile et point relais pour chaque wilaya et chaque transporteur'
              : 'Full control over home and stop-desk delivery rates across all 58 wilayas'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAgencyModalOpen(true)}
            className="px-3.5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs rounded-xl hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {language === 'ar' ? 'إضافة شركة توصيل' : language === 'fr' ? 'Ajouter Transporteur' : 'Add Carrier'}
            </span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-1.5 cursor-pointer"
            title={language === 'ar' ? 'تصدير ملف إكسل CSV' : language === 'fr' ? 'Exporter en CSV' : 'Export CSV'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تصدير CSV' : language === 'fr' ? 'Exporter CSV' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-1.5 cursor-pointer"
            title={language === 'ar' ? 'استيراد وتحديث من CSV' : language === 'fr' ? 'Importer depuis CSV' : 'Import CSV'}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'استيراد CSV' : language === 'fr' ? 'Importer CSV' : 'Import CSV'}</span>
          </button>
        </div>
      </div>

      {/* Agency Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800">
        {agencies.map(a => {
          const isSelected = selectedAgencyId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAgencyId(a.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{a.name}</span>
            </button>
          );
        })}
      </div>

      {/* Agency Info Banner & Quick Save */}
      {selectedAgency && (
        <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-amber-600 text-sm shrink-0">
              {selectedAgency.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                {language === 'ar'
                  ? `تعديل أسعار ${selectedAgency.name} عبر الـ 58 ولاية`
                  : language === 'fr'
                  ? `Tarifs de ${selectedAgency.name} pour les 58 wilayas`
                  : `${selectedAgency.name} Rates across 58 Wilayas`}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {language === 'ar' ? 'الهاتف: ' : language === 'fr' ? 'Tél : ' : 'Phone: '}
                {selectedAgency.phone} {selectedAgency.notes && `• ${selectedAgency.notes}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {saveSuccess
                  ? language === 'ar' ? 'تم الحفظ بنجاح!' : language === 'fr' ? 'Enregistré avec succès !' : 'Saved successfully!'
                  : language === 'ar' ? 'حفظ التعديلات' : language === 'fr' ? 'Enregistrer les tarifs' : 'Save Changes'}
              </span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Matrix Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {/* Table Search & Tools */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-neutral-400" />
            <input
              type="text"
              value={searchWilaya}
              onChange={e => setSearchWilaya(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث عن ولاية بالرقم أو الاسم...'
                  : language === 'fr'
                  ? 'Rechercher par code ou nom de wilaya...'
                  : 'Search by code or wilaya name...'
              }
              className="w-full ps-9 pe-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === 'ar'
              ? `عدد الولايات المعروضة: ${filteredWilayas.length} من 58`
              : language === 'fr'
              ? `Wilayas affichées : ${filteredWilayas.length} sur 58`
              : `Displayed wilayas: ${filteredWilayas.length} / 58`}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
              <tr>
                <th className="p-3.5 text-start">
                  {language === 'ar' ? 'رقم الولاية' : language === 'fr' ? 'Code' : 'Code'}
                </th>
                <th className="p-3.5 text-start">
                  {language === 'ar' ? 'الولاية (بالعربية / الفرنسية)' : language === 'fr' ? 'Wilaya' : 'Wilaya'}
                </th>
                <th className="p-3.5 text-start">
                  <span className="flex items-center gap-1 text-neutral-900 dark:text-white font-black">
                    <Home className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'ar' ? 'توصيل للمنزل (دج)' : language === 'fr' ? 'À Domicile (DA)' : 'Home Delivery (DZD)'}
                  </span>
                </th>
                <th className="p-3.5 text-start">
                  <span className="flex items-center gap-1 text-neutral-900 dark:text-white font-black">
                    <Building className="w-3.5 h-3.5 text-emerald-500" />
                    {language === 'ar' ? 'استلام من المكتب (دج)' : language === 'fr' ? 'Stop Desk (DA)' : 'Office Pickup (DZD)'}
                  </span>
                </th>
                <th className="p-3.5 text-start">
                  {language === 'ar' ? 'مدة التوصيل التقديرية' : language === 'fr' ? 'Délai estimé' : 'Estimated ETA'}
                </th>
                <th className="p-3.5 text-center">
                  {language === 'ar' ? 'الحالة' : language === 'fr' ? 'Statut' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredWilayas.map(w => {
                const cur = editedRates[w.id] || { home: 700, office: 500, eta: '2-4 jours', active: true };

                return (
                  <tr
                    key={w.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition"
                  >
                    <td className="p-3.5 font-mono font-bold text-neutral-500">
                      {w.code}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
                      <span>{language === 'ar' ? w.name_ar : w.name_fr}</span>
                      <span className="text-neutral-400 font-normal ms-1 text-[11px]">
                        ({language === 'ar' ? w.name_fr : w.name_ar})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="50"
                          value={cur.home}
                          onChange={e => handleRateChange(w.id, 'home', parseInt(e.target.value, 10) || 0)}
                          className="w-24 px-2.5 py-1.5 font-mono font-bold text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">
                          {language === 'ar' ? 'دج' : 'DA'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="50"
                          value={cur.office}
                          onChange={e => handleRateChange(w.id, 'office', parseInt(e.target.value, 10) || 0)}
                          className="w-24 px-2.5 py-1.5 font-mono font-bold text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">
                          {language === 'ar' ? 'دج' : 'DA'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <input
                        type="text"
                        value={cur.eta}
                        onChange={e => handleRateChange(w.id, 'eta', e.target.value)}
                        className="w-28 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 dark:text-neutral-200"
                      />
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRateChange(w.id, 'active', !cur.active)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          cur.active
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {cur.active
                          ? language === 'ar' ? 'مفعل' : language === 'fr' ? 'Actif' : 'Active'
                          : language === 'ar' ? 'معطل' : language === 'fr' ? 'Inactif' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Agency */}
      {isAgencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {language === 'ar' ? 'إضافة شركة توصيل جديدة' : language === 'fr' ? 'Ajouter un Transporteur' : 'Add New Carrier'}
            </h3>
            <form onSubmit={handleCreateAgency} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'اسم شركة التوصيل *' : language === 'fr' ? 'Nom du transporteur *' : 'Carrier Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newAgencyName}
                  onChange={e => setNewAgencyName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: Yalidine, ZR Express...' : 'Ex: Yalidine, ZR Express...'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'رقم هاتف خدمة الزبائن' : language === 'fr' ? 'Téléphone service client' : 'Customer service phone'}
                </label>
                <input
                  type="text"
                  value={newAgencyPhone}
                  onChange={e => setNewAgencyPhone(e.target.value)}
                  placeholder="0550 XX XX XX"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'الموقع الإلكتروني أو رابط التتبع' : language === 'fr' ? 'Site web ou lien de suivi' : 'Website / Tracking link'}
                </label>
                <input
                  type="text"
                  value={newAgencyWebsite}
                  onChange={e => setNewAgencyWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'ملاحظات أو وصف الخدمة' : language === 'fr' ? 'Notes ou description' : 'Notes / Service description'}
                </label>
                <textarea
                  rows={2}
                  value={newAgencyNotes}
                  onChange={e => setNewAgencyNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'تغطية المكاتب والولايات...' : 'Coverage and details...'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAgencyModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 cursor-pointer"
                >
                  {language === 'ar' ? 'إضافة الشركة' : language === 'fr' ? 'Ajouter' : 'Add Carrier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import CSV */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-lg border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {language === 'ar' ? 'استيراد مصفوفة أسعار التوصيل (CSV)' : language === 'fr' ? 'Importer les tarifs (CSV)' : 'Import Shipping Rates (CSV)'}
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'ar' ? 'ألصق محتوى ملف الـ CSV هنا بالصيغة:' : language === 'fr' ? 'Collez le contenu CSV au format suivant :' : 'Paste CSV content using format:'}
              <br />
              <code className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded font-mono text-[11px] block mt-1">
                Agency_ID,Agency_Name,Wilaya_ID,Wilaya_Name,Home_Price,Office_Price,ETA,Active
              </code>
            </p>

            <textarea
              rows={8}
              value={csvContent}
              onChange={e => setCsvContent(e.target.value)}
              placeholder="yalidine,Yalidine Express,2,Chlef,700,500,2-4 jours,YES"
              className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
            />

            {csvMessage && (
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {csvMessage}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 text-xs font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                className="px-5 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 cursor-pointer"
              >
                {language === 'ar' ? 'بدء الاستيراد' : language === 'fr' ? 'Démarrer l import' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
