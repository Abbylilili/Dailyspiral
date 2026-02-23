import type { FC } from 'react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Edit2, CheckSquare, Sparkles } from "lucide-react";
import useHabits from '@/app/pages/Habits/hooks/useHabits/useHabits';
import HabitStats from '@/app/pages/Habits/components/HabitStats/HabitStats';
import HabitTracker from '@/app/pages/Habits/components/HabitTracker/HabitTracker';
import { calculateStreak, calculateCompletionRate } from '@/app/pages/Habits/utils/streakUtils/streakUtils';
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/app/components/ui/utils';
import type { Habit } from '@/app/lib/storage';
import { toast } from "sonner";

const COLORS = ["#FF9500", "#34C759", "#5856D6", "#007AFF", "#FF2D55", "#AF52DE", "#FF3B30", "#5AC8FA", "#FFCC00", "#8E8E93"];

const Habits: FC = () => {
  const { theme } = useTheme();
  const { habits, entries, isLoading, addOrUpdateHabit, removeHabit, toggleEntry } = useHabits();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const getButtonClass = () => {
      switch(theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400";
          case 'ink': return "bg-black text-white hover:bg-gray-800 rounded-lg";
          default: return "bg-black text-white hover:bg-gray-800 shadow-lg";
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return toast.error("Enter habit name");
    if (editingHabit) await addOrUpdateHabit({ ...editingHabit, name: habitName.trim(), color: selectedColor });
    else await addOrUpdateHabit({ id: `habit-${Date.now()}`, name: habitName.trim(), color: selectedColor, createdAt: new Date().toISOString() });
    setIsAddOpen(false); resetForm();
  };

  const resetForm = () => { setEditingHabit(null); setHabitName(""); setSelectedColor(COLORS[0]); };
  const openEditDialog = (habit: Habit) => { setEditingHabit(habit); setHabitName(habit.name); setSelectedColor(habit.color); setIsManageOpen(false); setIsAddOpen(true); };

  if (isLoading) return null;

  const completionRate = calculateCompletionRate(habits.length, entries);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => calculateStreak(h.id, entries))) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600", theme === 'ink' && "text-black")}>Habits</h2>
        <div className="flex gap-3">
          {habits.length > 0 && (
            <Dialog 
              open={isManageOpen} 
              onOpenChange={setIsManageOpen}
              trigger={<Button variant="outline" className="rounded-full h-12 w-12 p-0 border-0 shadow-sm"><Pencil className="w-5 h-5" /></Button>}
              title="Manage Habits"
            >
              <div className="space-y-3 mt-4">
                {habits.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="font-bold">{h.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(h)}><Edit2 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => removeHabit(h.id)} className="hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Dialog>
          )}

          <Dialog 
            open={isAddOpen} 
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
            trigger={<Button className={cn("rounded-full h-12 px-6 shadow-lg transition-transform hover:scale-105 active:scale-95", getButtonClass())}><Plus className="w-5 h-5 mr-2" />Add Habit</Button>}
            title={editingHabit ? "Edit Habit" : "New Habit"}
            description="Set habit name and color"
          >
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <input className="w-full h-12 px-4 rounded-xl bg-slate-100/50 border-0 font-bold outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Habit name" value={habitName} onChange={e => setHabitName(e.target.value)} required />
                <div className="flex gap-3 flex-wrap justify-center">
                  {COLORS.map(c => ( 
                    <button key={c} type="button" onClick={() => setSelectedColor(c)} className={cn("w-10 h-10 rounded-full border-4 transition-all hover:scale-110", selectedColor === c ? "border-black scale-110 shadow-lg" : "border-transparent opacity-60")} style={{ backgroundColor: c }} /> 
                  ))}
                </div>
                <Button type="submit" className={cn("w-full h-14 rounded-2xl text-lg font-bold shadow-xl", getButtonClass())}>Save Habit</Button>
            </form>
          </Dialog>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-[100px] rounded-full scale-150 animate-pulse" />
            <div className="relative w-40 h-40 rounded-full border-2 border-dashed border-blue-300/50 flex items-center justify-center animate-[spin_15s_linear_infinite]">
              <div className="w-32 h-32 rounded-full border-2 border-dotted border-purple-300/30 animate-[spin_10s_linear_infinite_reverse]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0 duration-500">
                  <CheckSquare className="w-10 h-10 text-white" strokeWidth={2.5} />
               </div>
            </div>
            <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          
          <div className="text-center space-y-6 max-w-2xl px-4">
            <h3 className={cn(
              "text-4xl md:text-5xl font-black tracking-tight leading-tight",
              theme === 'ink' ? "text-black font-['Rubik_Dirt']" : "text-gray-900"
            )}>
              Let's build your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500">first habit</span> together
            </h3>
            <p className="text-muted-foreground font-semibold text-xl opacity-80">
              Small steps every day lead to a big spiral of success.
            </p>
          </div>

          <Button 
            onClick={() => setIsAddOpen(true)}
            className={cn(
              "h-16 px-12 rounded-2xl text-xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]",
              getButtonClass()
            )}
          >
            Start My Journey ✨
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
