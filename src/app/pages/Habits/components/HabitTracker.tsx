import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight, CheckSquare, Calendar as CalendarIcon } from "lucide-react";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, isSameDay } from "date-fns";
import { HabitCircularView } from "@/app/components/HabitCircularView";
import { HabitYearView } from "@/app/components/HabitYearView";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import type { Habit, HabitEntry } from "@/app/lib/storage";

interface HabitTrackerProps {
  habits: Habit[];
  entries: HabitEntry[];
  onToggle: (id: string, date: string) => Promise<void>;
  calculateStreak: (id: string) => number;
}

type ViewMode = "week" | "month" | "year";

const HabitTracker: FC<HabitTrackerProps> = ({ habits, entries, onToggle, calculateStreak }) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrev = () => {
    if (viewMode === 'week') setSelectedDate(d => subWeeks(d, 1));
    if (viewMode === 'month') setSelectedDate(d => subMonths(d, 1));
    if (viewMode === 'year') setSelectedDate(d => subYears(d, 1));
  };

  const handleNext = () => {
    if (viewMode === 'week') setSelectedDate(d => addWeeks(d, 1));
    if (viewMode === 'month') setSelectedDate(d => addMonths(d, 1));
    if (viewMode === 'year') setSelectedDate(d => addYears(d, 1));
  };

  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         case 'zen': return "bg-white border-0 shadow-xl shadow-emerald-50/50 rounded-3xl";
         default: return "glass-card border-0 rounded-3xl";
     }
  };

  const getHeaderLabel = () => {
    if (viewMode === 'week') return `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d, yyyy')}`;
    if (viewMode === 'month') return format(selectedDate, 'MMMM yyyy');
    if (viewMode === 'year') return format(selectedDate, 'yyyy');
    return "";
  };

  return (
    <Card className={cn("shadow-xl", getCardClass())}>
      <CardHeader className="pb-0 pt-6 px-8 relative z-20">
        <CardTitle className={cn("text-2xl font-bold tracking-tight mb-4", theme === 'ocean' && "text-white")}>Habit Tracker</CardTitle>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative min-h-[40px]">
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-full"><ChevronLeft /></Button>
            <Button variant="ghost" className="text-lg font-bold min-w-[140px] rounded-xl"><CalendarIcon className="w-4 h-4 mr-2 opacity-50" /> {getHeaderLabel()}</Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full"><ChevronRight /></Button>
          </div>
          <div className={cn("flex gap-1 p-1 rounded-full", theme === 'ink' ? "bg-gray-100 border border-black" : "bg-muted/50")}>
            {["week", "month", "year"].map((mode) => (
              <Button key={mode} variant="ghost" size="sm" onClick={() => setViewMode(mode as ViewMode)} className={cn("px-4 sm:px-6 transition-all duration-300", theme === 'ink' ? "rounded-md" : "rounded-full", viewMode === mode ? (theme === 'ink' ? "bg-black text-white" : "bg-white shadow-sm text-black font-semibold") : "text-muted-foreground opacity-60")}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        {viewMode === "month" && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="md:scale-110 transform md:origin-top md:-mt-32 mb-4 relative z-0 flex justify-center">
              <HabitCircularView 
              habits={habits} 
              entries={entries}
              year={selectedDate.getFullYear()} 
              month={selectedDate.getMonth() + 1} 
              onToggleHabit={onToggle} 
            />
            </div>
          </div>
        )}
        
        {viewMode === "year" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-6 mt-2">
              {habits.map(habit => ( <HabitYearView key={habit.id} habit={habit} year={selectedDate.getFullYear()} /> ))}
            </div>
          </div>
        )}
        
        {viewMode === "week" && (
          <div className="w-full pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 min-w-[600px]">
              <thead>
                <tr>
                  <th className={cn("text-left p-2 font-semibold text-xs uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Habit</th>
                  {currentWeekDays.map(day => (
                    <th key={day.toISOString()} className="text-center p-1">
                      <div className={cn("text-[10px] font-semibold mb-1 uppercase tracking-wide", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{format(day, 'EEE')}</div>
                      <div className={cn(`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto`, isSameDay(day, new Date()) ? (theme === 'ocean' ? 'bg-cyan-500 text-black shadow-md' : 'bg-primary text-primary-foreground') : (theme === 'ocean' ? 'text-white' : 'text-foreground'))}>{format(day, 'd')}</div>
                    </th>
                  ))}
                  <th className={cn("text-center p-2 font-semibold text-xs uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit.id} className="group">
                    <td className={cn("p-2 rounded-l-xl backdrop-blur-sm", theme === 'ocean' ? "bg-white/5" : "bg-white/40")}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: habit.color }} />
                        <span className={cn("font-semibold text-sm", theme === 'ocean' && "text-slate-200")}>{habit.name}</span>
                      </div>
                    </td>
                    {currentWeekDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const completed = entries.find(e => e.habitId === habit.id && e.date === dateStr)?.completed ?? false;
                      return (
                        <td key={dateStr} className={cn("text-center p-1 backdrop-blur-sm", theme === 'ocean' ? "bg-white/5" : "bg-white/40")}>
                          <button onClick={() => onToggle(habit.id, dateStr)} className={cn(`w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center mx-auto`, completed ? 'text-white shadow-sm scale-100' : (theme === 'ocean' ? 'bg-white/5' : 'bg-black/5 text-transparent opacity-30'))} style={{ backgroundColor: completed ? habit.color : undefined }}>
                            {completed && <CheckSquare className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className={cn("text-center p-2 rounded-r-xl backdrop-blur-sm", theme === 'ocean' ? "bg-white/5" : "bg-white/40")}>
                      <span className={cn("font-bold text-lg", theme === 'ocean' ? "text-white" : "text-foreground")}>{calculateStreak(habit.id)}<span className="text-[10px] ml-0.5">🔥</span></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitTracker;
