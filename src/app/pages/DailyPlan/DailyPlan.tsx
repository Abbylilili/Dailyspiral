import type { FC } from 'react';
import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, parseISO } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { useDailyPlans } from './hooks/useDailyPlans';
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Dialog } from "@/app/components/ui/dialog";
import { useTheme } from '@/app/contexts/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { cn } from '@/app/components/ui/utils';
import type { DailyPlanEntry } from '@/app/lib/storage';
import { toast } from "sonner";
import { DayView } from './components/DayView';
import { WeekView } from './components/WeekView';
import { MonthView } from './components/MonthView';
import { YearView } from './components/YearView';

type ViewMode = 'day' | 'week' | 'month' | 'year';

const PLAN_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#1e293b"];

const DailyPlan: FC = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
  const { plans, addOrUpdatePlan, removePlan } = useDailyPlans();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [selectedColor, setSelectedColor] = useState(PLAN_COLORS[0]);
  const [editingPlan, setEditingPlan] = useState<DailyPlanEntry | null>(null);

  const mainBtnClass = "bg-black hover:bg-gray-800 text-white rounded-full h-12 px-8 shadow-lg transition-all hover:scale-105 active:scale-95 font-black text-[10px] uppercase tracking-widest";

  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(d => subDays(d, 1));
    else if (viewMode === 'week') setCurrentDate(d => subWeeks(d, 1));
    else if (viewMode === 'month') setCurrentDate(d => subMonths(d, 1));
    else if (viewMode === 'year') setCurrentDate(d => subYears(d, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(d => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate(d => addWeeks(d, 1));
    else if (viewMode === 'month') setCurrentDate(d => addMonths(d, 1));
    else if (viewMode === 'year') setCurrentDate(d => addYears(d, 1));
  };

  const handleTimeClick = (hour: number, date: Date = currentDate) => {
    setCurrentDate(date);
    setStartTime(`${hour.toString().padStart(2, '0')}:00`);
    setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
    setIsAddOpen(true);
  };

  const handleDelete = async () => {
    if (editingPlan) {
      await removePlan(editingPlan.id);
      setIsAddOpen(false);
      resetForm();
      toast.success(t("plan.eventDeleted"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error(t("plan.eventTitle"));

    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const start = new Date(currentDate);
    const [sH, sM] = startTime.split(':').map(Number);
    start.setHours(sH, sM, 0, 0);

    const end = new Date(currentDate);
    const [eH, eM] = endTime.split(':').map(Number);
    end.setHours(eH, eM, 0, 0);

    const plan: DailyPlanEntry = {
      id: editingPlan?.id || `plan-${Date.now()}`,
      title: title.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      date: dateStr,
      color: selectedColor,
    };

    await addOrUpdatePlan(plan);
    setIsAddOpen(false);
    resetForm();
    toast.success(editingPlan ? t("plan.eventUpdated") : t("plan.eventCreated"));
  };

  const resetForm = () => {
    setEditingPlan(null);
    setTitle("");
    setStartTime("09:00");
    setEndTime("10:00");
    setSelectedColor(PLAN_COLORS[0]);
  };

  const handleEdit = (plan: DailyPlanEntry) => {
    const sDate = parseISO(plan.startTime);
    const eDate = parseISO(plan.endTime);
    setCurrentDate(new Date(plan.date));
    setEditingPlan(plan);
    setTitle(plan.title);
    setStartTime(format(sDate, 'HH:mm'));
    setEndTime(format(eDate, 'HH:mm'));
    setSelectedColor(plan.color || PLAN_COLORS[0]);
    setIsAddOpen(true);
  };

  const getHeaderLabel = () => {
    if (viewMode === 'day') return format(currentDate, language === 'zh' ? 'yyyy年M月d日' : 'MMMM d, yyyy', { locale });
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'MMM d', { locale })} - ${format(end, language === 'zh' ? 'yyyy年M月d日' : 'MMM d, yyyy', { locale })}`;
    }
    if (viewMode === 'month') return format(currentDate, language === 'zh' ? 'yyyy年M月' : 'MMMM yyyy', { locale });
    return format(currentDate, 'yyyy');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className={cn("text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent",
            theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
            theme === 'ink' ? "text-black" :
            theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
            "bg-gradient-to-r from-purple-600 to-pink-600"
          )}>{t("plan.title")}</h2>
          <div className="flex items-center bg-slate-100/80 p-1 rounded-full shadow-inner">
            {(['day', 'week', 'month', 'year'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={cn(
                "px-5 py-2 text-[9px] font-black rounded-full transition-all uppercase tracking-widest",
                viewMode === mode ? "bg-black text-white shadow-xl scale-105" : "text-slate-400 hover:text-slate-600"
              )}>
                {t(`plan.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-full px-2 py-1">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-full h-8 w-8 hover:bg-white hover:shadow-sm transition-all"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" className="font-black text-[10px] min-w-[120px] hover:bg-transparent uppercase tracking-wider" onClick={() => setCurrentDate(new Date())}>{getHeaderLabel()}</Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full h-8 w-8 hover:bg-white hover:shadow-sm transition-all"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          
          <Dialog 
            open={isAddOpen} 
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
            title={editingPlan ? t("plan.editEvent") : t("plan.newEvent")}
            trigger={<Button className={mainBtnClass}><Plus className="w-4 h-4 mr-2" /> {t("plan.add")}</Button>}
          >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("plan.eventTitle")}</label>
                <input className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-0 font-bold outline-none focus:ring-2 focus:ring-blue-400" placeholder={t("plan.placeholder")} value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("plan.color")}</label>
                <div className="flex gap-2.5 py-1 flex-wrap">
                  {PLAN_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setSelectedColor(c)} className={cn("w-7 h-7 rounded-full transition-all border-2", selectedColor === c ? "border-slate-900 scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("plan.starts")}</label>
                  <input type="time" className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-0 font-bold" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("plan.ends")}</label>
                  <input type="time" className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-0 font-bold" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-2 border-t border-slate-50">
                {editingPlan && ( <Button type="button" onClick={handleDelete} variant="outline" className="flex-1 h-12 border-red-100 text-red-500 hover:bg-red-50 rounded-2xl font-black text-xs tracking-widest">DELETE</Button> )}
                <Button type="submit" className={cn("h-12 flex-[2]", mainBtnClass)}>
                  {editingPlan ? t("plan.update") : t("plan.create")}
                </Button>
              </div>
            </form>
          </Dialog>
        </div>
      </div>

      <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-6 md:p-8 min-h-[650px] relative">
          {viewMode === 'day' && ( <DayView currentDate={currentDate} plans={plans} onEdit={handleEdit} onTimeClick={(h) => handleTimeClick(h)} onUpdatePlan={addOrUpdatePlan} /> )}
          {viewMode === 'week' && ( <WeekView currentDate={currentDate} plans={plans} onEdit={handleEdit} onTimeClick={(d, h) => handleTimeClick(h, d)} /> )}
          {viewMode === 'month' && ( <MonthView currentDate={currentDate} plans={plans} onEdit={handleEdit} onDateClick={(d) => { setCurrentDate(d); setViewMode('day'); }} /> )}
          {viewMode === 'year' && ( <YearView currentDate={currentDate} onMonthClick={(m) => { setCurrentDate(m); setViewMode('month'); }} /> )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyPlan;
