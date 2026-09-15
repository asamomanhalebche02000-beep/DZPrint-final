import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, Tag, Upload } from 'lucide-react';
import { Design } from '../../types';
import { adminFetch } from '../../lib/adminAuth';
import { useTheme } from '../../context/ThemeContext';

export const AdminDesigns: React.FC = () => {
  const { t, language, isRtl } = useTheme();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('algerian');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');

  const fetchDesigns = async () => {
    try {
      const res = await fetch('/api/designs');
      const data = await res.json();
      setDesigns(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleAddDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) return;

    try {
      const res = await adminFetch('/api/admin/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          image_url: imageUrl,
          tags: tags.split(',').map(s => s.trim()).filter(Boolean),
          is_active: true,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setImageUrl('');
        setTags('');
        fetchDesigns();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg =
      language === 'ar'
        ? 'حذف هذا التصميم من المعرض؟'
        : language === 'fr'
        ? 'Supprimer ce design de la galerie ?'
        : 'Delete this design from the gallery?';
    if (!confirm(confirmMsg)) return;
    try {
      const res = await adminFetch(`/api/admin/designs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDesigns();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            {language === 'ar'
              ? `معرض التصاميم الجاهزة (${designs.length})`
              : language === 'fr'
              ? `Galerie de Designs (${designs.length})`
              : `Ready Designs Gallery (${designs.length})`}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'تصاميم الثقافة الجزائرية، الخط العربي، وأحدث رسومات الشباب'
              : language === 'fr'
              ? 'Designs de culture algérienne, calligraphie arabe et tendances graphiques'
              : 'Algerian heritage, Arabic calligraphy, and modern custom illustrations'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة تصميم للمعرض' : language === 'fr' ? 'Nouveau Design' : 'Add Design'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {designs.map(d => (
          <div
            key={d.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="aspect-square bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 flex items-center justify-center border border-neutral-100 dark:border-neutral-700/60">
              <img src={d.image_url} alt={d.name} className="max-h-full max-w-full object-contain" />
            </div>

            <div>
              <h3 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                {d.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(d.tags || d.compatible_products || []).map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[9px] text-neutral-500 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                {d.category}
              </span>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                title={language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {language === 'ar' ? 'إضافة تصميم جديد للمعرض' : language === 'fr' ? 'Ajouter un Nouveau Design' : 'Add Design to Gallery'}
            </h3>

            <form onSubmit={handleAddDesign} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'اسم التصميم' : language === 'fr' ? 'Nom du design' : 'Design Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: علم الجزائر، خط ديواني...' : 'Ex: Casbah pattern, Diwani...'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'القسم' : language === 'fr' ? 'Catégorie' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                >
                  <option value="algerian">
                    {language === 'ar' ? 'تراث وثقافة جزائرية (Algerian)' : language === 'fr' ? 'Patrimoine Algérien' : 'Algerian Heritage'}
                  </option>
                  <option value="calligraphy">
                    {language === 'ar' ? 'خط عربي إسلامي (Calligraphy)' : language === 'fr' ? 'Calligraphie Arabe' : 'Arabic Calligraphy'}
                  </option>
                  <option value="gaming">
                    {language === 'ar' ? 'ألعاب وأنيمي (Gaming & Anime)' : language === 'fr' ? 'Gaming & Animé' : 'Gaming & Anime'}
                  </option>
                  <option value="minimalist">
                    {language === 'ar' ? 'مينيماليست وعصري (Minimalist)' : language === 'fr' ? 'Minimaliste & Moderne' : 'Minimalist & Modern'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'رابط الصورة (URL أو SVG)' : language === 'fr' ? 'URL de l image ou SVG' : 'Image URL or SVG'}
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  {language === 'ar' ? 'الوسوم (مفصولة بفاصلة)' : language === 'fr' ? 'Mots-clés (séparés par virgule)' : 'Tags (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder={language === 'ar' ? 'الجزائر, دزاير, فخر' : 'algeria, dz, print'}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 cursor-pointer"
                >
                  {language === 'ar' ? 'إضافة التصميم' : language === 'fr' ? 'Ajouter' : 'Add Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
