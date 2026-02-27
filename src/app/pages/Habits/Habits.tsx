import type { FC } from 'react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Edit2, CheckSquare, Sparkles, Calendar } from "lucide-react";
import useHabits from '@/app/pages/Habits/hooks/useHabits/useHabits';
import HabitStats from '@/app/pages/Habits/components/HabitStats/HabitStats';
import HabitTracker from '@/app/pages/Habits/components/HabitTracker/HabitTracker';
import { calculateStreak, calculateCompletionRate } from '@/app/pages/Habits/utils/streakUtils/streakUtils';
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { useTheme } from '@/app/contexts/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { cn } from '@/app/components/ui/utils';
import type { Habit, HabitFrequency } from '@/app/lib/storage';
import { toast } from "sonner";

const COLORS = ["#FF9500", "#34C759", "#5856D6", "#007AFF", "#FF2D55", "#AF52DE", "#FF3B30", "#5AC8FA", "#FFCC00", "#8E8E93"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Habits: FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { habits, entries, isLoading, addOrUpdateHabit, removeHabit, toggleEntry } = useHabits();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [frequencyType, setFrequencyType] = useState<HabitFrequency['type']>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); 
  const [weeklyTimes, setWeeklyTimes] = useState(3);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const mainBtnClass = "bg-black hover:bg-gray-800 text-white rounded-full h-12 px-8 shadow-lg transition-all hover:scale-105 active:scale-95 font-black text-xs tracking-widest uppercase";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return toast.error(t("habits.enterName"));
    
    const frequency: HabitFrequency = 
      frequencyType === 'daily' ? { type: 'daily' } :
      frequencyType === 'weekly' ? { type: 'weekly', days: selectedDays } :
      { type: 'times_per_week', times: weeklyTimes };

    const habitData: Habit = {
      id: editingHabit?.id || `habit-${Date.now()}`,
      name: habitName.trim(),
      color: selectedColor,
      createdAt: editingHabit?.createdAt || new Date().toISOString(),
      frequency
    };

    await addOrUpdateHabit(habitData);
    setIsAddOpen(false); resetForm();
    toast.success(editingPlan ? t("plan.eventUpdated") : t("habits.added"));
  };

  const resetForm = () => { 
    setEditingHabit(null); setHabitName(""); setSelectedColor(COLORS[0]);
    setFrequencyType('daily'); setSelectedDays([1, 2, 3, 4, 5]); setWeeklyTimes(3);
  };

  const openEditDialog = (habit: Habit) => { 
    setEditingHabit(habit); setHabitName(habit.name); setSelectedColor(habit.color);
    if (habit.frequency) {
        setFrequencyType(habit.frequency.type);
        if (habit.frequency.type === 'weekly') setSelectedDays(habit.frequency.days);
        if (habit.frequency.type === 'times_per_week') setWeeklyTimes(habit.frequency.times);
    }
    setIsManageOpen(false); setIsAddOpen(true); 
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  if (isLoading) return null;

  const completionRate = calculateCompletionRate(habits, entries);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => calculateStreak(h.id, entries, h))) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
          theme === 'ink' ? "text-black" :
          theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
          "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>{t("nav.habits")}</h2>
        <div className="flex gap-3">
          {habits.length > 0 && (
            <Dialog 
              open={isManageOpen} 
              onOpenChange={setIsManageOpen}
              trigger={<Button variant="outline" className="rounded-full h-12 w-12 p-0 border-0 shadow-sm transition-transform hover:scale-110 active:scale-90 bg-white"><Pencil className="w-5 h-5 text-black" /></Button>}
              title={t("common.edit")}
            >
              <div className="space-y-3 mt-4">
                {habits.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: h.color }} />
                      <span className="font-black text-sm uppercase">{h.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(h)} className="hover:bg-black hover:text-white rounded-full transition-colors"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => removeHabit(h.id)} className="hover:bg-red-500 hover:text-white rounded-full transition-colors"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Dialog>
          )}

          <Dialog 
            open={isAddOpen} 
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
            trigger={<Button className={mainBtnClass}><Plus className="w-4 h-4 mr-2" />{t("habits.addHabit")}</Button>}
            title={editingHabit ? t("common.edit") : t("habits.addNewHabit")}
            description={t("habits.enterColorDesc")}
          >
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("habits.habitName")}</label>
                  <input className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-0 font-bold outline-none focus:ring-2 focus:ring-blue-400" placeholder={t("habits.placeholder")} value={habitName} onChange={e => setHabitName(e.target.value)} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("habits.selectColor")}</label>
                  <div className="flex gap-2.5 py-1 flex-wrap">
                    {COLORS.map(c => ( 
                      <button key={c} type="button" onClick={() => setSelectedColor(c)} className={cn("w-7 h-7 rounded-full border-2 transition-all hover:scale-110", selectedColor === c ? "border-slate-900 scale-110 shadow-md" : "border-transparent opacity-60")} style={{ backgroundColor: c }} /> 
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> {t("plan.week")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'times_per_week'] as const).map(t_freq => (
                      <button 
                        key={t_freq}
                        type="button"
                        onClick={() => setFrequencyType(t_freq)}
                        className={cn(
                          "py-2 px-1 rounded-xl text-[10px] font-black transition-all border-2 uppercase",
                          frequencyType === t_freq ? "bg-black text-white border-black shadow-md" : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
                        )}
                      >
                        {t_freq === 'daily' ? t("habits.everyDay") : t_freq === 'weekly' ? t("habits.specDays") : t("habits.weeklyGoal")}
                      </button>
                    ))}
                  </div>

                  {frequencyType === 'weekly' && (
                    <div className="flex justify-between gap-1 pt-2 animate-in fade-in slide-in-from-top-2">
                      {DAYS.map((day, i) => (
                        <button key={day} type="button" onClick={() => toggleDay(i)} className={cn("w-9 h-9 rounded-xl text-[10px] font-black transition-all uppercase", selectedDays.includes(i) ? "bg-black text-white shadow-lg" : "bg-slate-50 text-slate-300")}>
                          {day[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  {frequencyType === 'times_per_week' && (
                    <div className="flex items-center gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                      <input type="range" min="1" max="7" step="1" value={weeklyTimes} onChange={e => setWeeklyTimes(parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-black" />
                      <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-black text-white text-xs font-black">{weeklyTimes}X</span>
                    </div>
                  )}
                </div>

                <Button type="submit" className={cn("w-full h-14 rounded-2xl shadow-xl mt-4", mainBtnClass)}>{t("common.save")}</Button>
            </form>
          </Dialog>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-10">
          <div className="text-center space-y-6 max-w-2xl px-4">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">{t("habits.noHabits")}</h3>
            <p className="text-muted-foreground font-bold text-xl opacity-60">{t("habits.addFirst")}</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className={cn("h-16 px-12 rounded-3xl text-lg font-black shadow-2xl transition-all hover:scale-105 active:scale-95", mainBtnClass)}>
            {t("habits.addHabit")} ✨
          </Button>
        </div>
      ) : (
        <>
          <HabitStats completionRate={completionRate} habitCount={habits.length} bestStreak={bestStreak} />
          <HabitTracker habits={habits} entries={entries} onToggle={toggleEntry} calculateStreak={(id) => calculateStreak(id, entries)} />
        </>
      )}
    </div>
  );
};

export default Habits;
