import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Plus, Pencil, Trash2, Edit2 } from "lucide-react";
import useHabits from './hooks/useHabits';
import HabitStats from './components/HabitStats';
import HabitTracker from './components/HabitTracker';
import { calculateStreak, calculateCompletionRate } from './utils/streakUtils';
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/app/components/ui/dialog";
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
  
  const getDialogClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800 border border-white/10 text-white shadow-2xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl";
          default: return "bg-white/90 backdrop-blur-2xl border-0 shadow-2xl sm:rounded-3xl";
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

  const today = new Date();
  const completionRate = calculateCompletionRate(habits.length, entries);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => calculateStreak(h.id, entries))) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600", theme === 'ink' && "text-black")}>Habits</h2>
        <div className="flex gap-3">
          <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
            <DialogTrigger asChild><Button variant="outline" className="rounded-full h-12 w-12 p-0 border-0 shadow-sm"><Pencil className="w-5 h-5" /></Button></DialogTrigger>
            <DialogContent className={getDialogClass()}><DialogHeader><DialogTitle>Manage Habits</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">{habits.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40"><div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: h.color }} /><span>{h.name}</span></div>
                        <div className="flex gap-2"><Button size="icon" variant="ghost" onClick={() => openEditDialog(h)}><Edit2 className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => removeHabit(h.id)} className="hover:text-red-500"><Trash2 className="w-4 h-4" /></Button></div></div>
                ))}</div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild><Button className={cn("rounded-full h-12 px-6 shadow-lg", getButtonClass())}><Plus className="w-5 h-5 mr-2" />Add Habit</Button></DialogTrigger>
            <DialogContent className={getDialogClass()}>
                <DialogHeader><DialogTitle>{editingHabit ? "Edit Habit" : "New Habit"}</DialogTitle><DialogDescription>Set habit name and color</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <input className="w-full h-12 px-4 rounded-xl bg-slate-100/50 border-0 font-bold" placeholder="Habit name" value={habitName} onChange={e => setHabitName(e.target.value)} required />
                    <div className="flex gap-3 flex-wrap justify-center">{COLORS.map(c => ( <button key={c} type="button" onClick={() => setSelectedColor(c)} className={cn("w-10 h-10 rounded-full border-4", selectedColor === c ? "border-black scale-110" : "border-transparent")} style={{ backgroundColor: c }} /> ))}</div>
                    <Button type="submit" className={cn("w-full h-14 rounded-2xl text-lg font-bold", getButtonClass())}>Save Habit</Button>
                </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <HabitStats completionRate={completionRate} habitCount={habits.length} bestStreak={bestStreak} />
      <HabitTracker habits={habits} entries={entries} onToggle={toggleEntry} calculateStreak={(id) => calculateStreak(id, entries)} />
    </div>
  );
};

export default Habits;
