import React, { useState, useEffect } from 'react';
import {
  Layers,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Search,
  Filter,
  UserCheck,
  Calendar,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Tag,
  Sparkles,
  Scissors,
  Check,
  X,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { ProductionJob, ProductionStage, PrintTechnique } from '../../types';
import { adminFetch } from '../../lib/adminAuth';

const STAGES: { key: ProductionStage; label: string; icon: any; color: string; bg: string }[] = [
  {
    key: 'received',
    label: 'استلام وتأكيد الطلب',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  },
  {
    key: 'ready_to_print',
    label: 'تجهيز الملف والقطع (RIP)',
    icon: Scissors,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
  },
  {
    key: 'in_production',
    label: 'قيد الطباعة والكبس الحراري',
    icon: Flame,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
  },
  {
    key: 'quality_check',
    label: 'مراقبة الجودة والتغليف (QC)',
    icon: CheckCircle2,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
  },
  {
    key: 'ready_to_ship',
    label: 'جاهز للشحن والتسليم للناقل',
    icon: Sparkles,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
  },
];

const TECHNIQUES: { key: PrintTechnique; label: string; badge: string }[] = [
  { key: 'DTF', label: 'طباعة DTF حرارية', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  { key: 'Sublimation', label: 'سبليمايشن (Mugs & Gifts)', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { key: 'Vinyl', label: 'فينيل حراري فلكس', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { key: 'ScreenPrint', label: 'سيريغرافيا (كميات كبيرة)', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  { key: 'Embroidery', label: 'تطريز آلي فاخر', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
];

export const AdminProduction: React.FC = () => {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [techniqueFilter, setTechniqueFilter] = useState<string>('all');
  const [selectedJobForTicket, setSelectedJobForTicket] = useState<ProductionJob | null>(null);

  // Quick edit stage modal
  const [movingJob, setMovingJob] = useState<ProductionJob | null>(null);
  const [targetStage, setTargetStage] = useState<ProductionStage>('in_production');
  const [technicianName, setTechnicianName] = useState('');
  const [stageNotes, setStageNotes] = useState('');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/production/jobs');
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStage = async (jobId: string, stage: ProductionStage, tech?: string, notes?: string) => {
    try {
      const res = await adminFetch(`/api/admin/production/jobs/${jobId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          technician: tech || undefined,
          notes: notes !== undefined ? notes : undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
        setMovingJob(null);
      }
    } catch {
      // ignore
    }
  };

  const advanceStage = (job: ProductionJob) => {
    const currentIndex = STAGES.findIndex(s => s.key === job.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].key;
      setMovingJob(job);
      setTargetStage(nextStage);
      setTechnicianName(job.assigned_technician || '');
      setStageNotes(job.notes || '');
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(j => {
    if (techniqueFilter !== 'all' && j.technique !== techniqueFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        j.order_number.toLowerCase().includes(q) ||
        j.customer_name.toLowerCase().includes(q) ||
        j.customer_phone.includes(q) ||
        j.items_summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" />
            إدارة خط الإنتاج وبطاقات الورشة (Workshop Kanban Board)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            متابعة مراحل طباعة الطلبيات لحظة بلحظة: إعداد ملف الـ RIP، الطباعة الحرارية DTF، الكبس، الفحص وتذكرة العمل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="p-2 text-neutral-500 hover:text-amber-500 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs"
            title="تحديث بطاقات العمل"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب، اسم الزبون، أو مواصفات القطعة..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-neutral-500 font-semibold whitespace-nowrap">تقنية الطباعة:</span>
          <button
            onClick={() => setTechniqueFilter('all')}
            className={`px-3 py-1 text-xs rounded-xl font-bold whitespace-nowrap ${
              techniqueFilter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            الكل
          </button>
          {TECHNIQUES.map(t => (
            <button
              key={t.key}
              onClick={() => setTechniqueFilter(t.key)}
              className={`px-3 py-1 text-xs rounded-xl font-bold whitespace-nowrap ${
                techniqueFilter === t.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {t.key}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Kanban Workflow Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STAGES.map(stage => {
          const stageJobs = filteredJobs.filter(j => j.stage === stage.key);
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[500px] ${stage.bg}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                  <span className="text-xs font-black text-neutral-900 dark:text-white leading-tight">
                    {stage.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-neutral-800 font-mono font-bold text-xs shadow-2xs">
                  {stageJobs.length}
                </span>
              </div>

              {/* Jobs Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageJobs.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center text-neutral-400 text-xs italic">
                    لا توجد مهام حالياً
                  </div>
                ) : (
                  stageJobs.map(job => (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2.5 hover:shadow-md transition-shadow relative"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-black text-xs text-neutral-900 dark:text-white">
                          {job.order_number}
                        </span>
                        <div className="flex items-center gap-1">
                          {job.priority === 'urgent' && (
                            <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[9px] font-bold animate-pulse">
                              عاجل جداً
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600">
                            {job.technique}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">
                        {job.customer_name}
                      </div>

                      {/* Items Summary */}
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-800/80 rounded-lg text-[11px] text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-700/60 leading-relaxed">
                        {job.items_summary}
                      </div>

                      {/* Technician & Target Date */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-neutral-500" />
                          {job.assigned_technician || 'غير محدد'}
                        </span>
                        {job.target_date && (
                          <span className="font-mono text-neutral-500">{job.target_date}</span>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-1 gap-1">
                        <button
                          onClick={() => setSelectedJobForTicket(job)}
                          className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded-lg text-[10px] font-semibold transition-colors"
                          title="عرض وطباعة بطاقة العمل (Job Ticket)"
                        >
                          <FileText className="w-3 h-3 text-amber-500" />
                          تذكرة الإنتاج
                        </button>

                        {stage.key !== 'ready_to_ship' && (
                          <button
                            onClick={() => advanceStage(job)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors"
                          >
                            <span>المرحلة التالية</span>
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Move Stage Modal */}
      {movingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                نقل الطلب: {movingJob.order_number} إلى مرحلة جديدة
              </h3>
              <button onClick={() => setMovingJob(null)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">اختر المرحلة التالية</label>
                <select
                  value={targetStage}
                  onChange={e => setTargetStage(e.target.value as ProductionStage)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold"
                >
                  {STAGES.map(s => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">التقني المسؤول عن الورشة</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={e => setTechnicianName(e.target.value)}
                  placeholder="مثال: عبد القادر (مسؤول المكبس الحراري)"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">ملاحظات تقنية (درجة الحرارة، وقت الكبس، الفحص)</label>
                <textarea
                  rows={3}
                  value={stageNotes}
                  onChange={e => setStageNotes(e.target.value)}
                  placeholder="مثال: تم ضبط الحرارة على 160° لمدة 15 ثانية، نزع الفيلم بارداً..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => setMovingJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleUpdateStage(movingJob.id, targetStage, technicianName, stageNotes)}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  تأكيد النقل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workshop Job Ticket / Printable Card Modal */}
      {selectedJobForTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-xl w-full p-6 space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  بطاقة تشغيل الورشة (Workshop Job Ticket)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة التذكرة
                </button>
                <button onClick={() => setSelectedJobForTicket(null)} className="p-1 text-neutral-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Ticket Area */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-700 pb-3">
                <div>
                  <h4 className="text-base font-black text-neutral-900 dark:text-white">DZPrint Atelier Express</h4>
                  <p className="text-[11px] text-neutral-500">ورشة الطباعة الحرارية والتطريز - الجزائر</p>
                </div>
                <div className="text-left font-mono">
                  <div className="text-sm font-black text-amber-600">{selectedJobForTicket.order_number}</div>
                  <div className="text-[10px] text-neutral-400">Job ID: {selectedJobForTicket.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">الزبون:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{selectedJobForTicket.customer_name}</span>
                  <div className="font-mono text-neutral-600 dark:text-neutral-400 text-[11px] mt-0.5">
                    {selectedJobForTicket.customer_phone}
                  </div>
                </div>

                <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">تقنية الطباعة والمشغل:</span>
                  <span className="font-bold text-amber-600">{selectedJobForTicket.technique}</span>
                  <div className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-0.5">
                    {selectedJobForTicket.assigned_technician || 'لم يحدد بعد'}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block">تفاصيل المنتجات والمقاسات:</span>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                  {selectedJobForTicket.items_summary}
                </div>
              </div>

              {selectedJobForTicket.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 block">تعليمات الكبس والجودة:</span>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                    {selectedJobForTicket.notes}
                  </div>
                </div>
              )}

              {/* Technician Checklist & Signature Box */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-4">
                <div className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-neutral-400 rounded-xs inline-block"></span>
                    <span>فحص دقة الألوان وتدرج الحبر الأبيض</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-neutral-400 rounded-xs inline-block"></span>
                    <span>اختبار ثبات الطباعة والكبس النهائي</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-neutral-400 rounded-xs inline-block"></span>
                    <span>التغليف في كيس بلاستيكي وعلبة الشحن</span>
                  </div>
                </div>

                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-2 flex flex-col justify-between text-[10px] text-neutral-400">
                  <span>توقيع ومصادقة مراقب الجودة:</span>
                  <div className="h-6"></div>
                  <span className="border-t border-neutral-200 dark:border-neutral-700 pt-1 text-center font-mono">
                    Date & QC Stamp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
