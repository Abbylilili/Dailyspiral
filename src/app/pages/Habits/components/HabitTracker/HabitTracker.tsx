import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight, CheckSquare, Calendar as CalendarIcon } from "lucide-react";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, isSameDay, isAfter, startOfDay, parseISO } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { HabitCircularView } from "@/app/components/HabitCircularView";
import { HabitYearView } from "@/app/components/HabitYearView";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import type { Habit, HabitEntry } from "@/app/lib/storage";
import { isHabitDueToday } from "../../utils/streakUtils/streakUtils";

interface HabitTrackerProps {
  habits: Habit[];
  entries: HabitEntry[];
  onToggle: (id: string, date: string) => Promise<void>;
  calculateStreak: (id: string) => number;
}

type ViewMode = "week" | "month" | "year";

const HabitTracker: FC<HabitTrackerProps> = ({ habits, entries, onToggle, calculateStreak }) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
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
    if (viewMode === 'week') return `${format(currentWeekStart, 'MMM d', { locale })} - ${format(currentWeekEnd, 'MMM d, yyyy', { locale })}`;
    if (viewMode === 'month') return format(selectedDate, 'MMMM yyyy', { locale });
    if (viewMode === 'year') return format(selectedDate, 'yyyy', { locale });
    return "";
  };

  return (
    <Card className={cn("shadow-xl", getCardClass())}>
      <CardHeader className="pb-0 pt-6 px-8 relative z-20">
        <CardTitle className={cn("text-2xl font-black uppercase tracking-tighter mb-4", theme === 'ocean' && "text-white")}>{t("habits.tracker")}</CardTitle>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative min-h-[40px]">
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-full"><ChevronLeft /></Button>
            <Button variant="ghost" className="text-sm font-black uppercase tracking-widest min-w-[140px] rounded-xl"><CalendarIcon className="w-4 h-4 mr-2 opacity-50" /> {getHeaderLabel()}</Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full"><ChevronRight /></Button>
          </div>
          <div className="flex items-center bg-slate-100 rounded-full p-1 shadow-inner">
            {["week", "month", "year"].map((mode) => (
              <button 
                key={mode} 
                onClick={() => setViewMode(mode as ViewMode)} 
                className={cn(
                  "px-6 py-2 transition-all duration-300 text-[9px] font-black uppercase tracking-widest rounded-full", 
                  viewMode === mode ? "bg-black text-white shadow-lg scale-105" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {t(`plan.${mode}`)}
              </button>
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
                  <th className={cn("text-left p-2 font-black text-[10px] uppercase tracking-widest", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.habit")}</th>
                  {currentWeekDays.map(day => {
                    const isToday = isSameDay(day, new Date());
                    const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));
                    return (
                      <th key={day.toISOString()} className="text-center p-1">
                        <div className={cn("text-[10px] font-black mb-1 uppercase tracking-tighter", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground", isToday && "text-blue-600")}>{format(day, 'EEE', { locale })}</div>
                        <div className={cn(
                          `text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-all`, 
                          isToday ? (theme === 'ocean' ? 'bg-cyan-500 text-black shadow-lg scale-110' : 'bg-blue-600 text-white shadow-md scale-110') : 
                          isFuture ? 'text-muted-foreground opacity-40' :
                          (theme === 'ocean' ? 'text-white' : 'text-foreground')
                        )}>
                          {format(day, 'd')}
                        </div>
                      </th>
                    );
                  })}
                  <th className={cn("text-center p-2 font-black text-[10px] uppercase tracking-widest", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.streak")}</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit.id} className="group">
                    <td className={cn("p-3 rounded-l-2xl backdrop-blur-sm", theme === 'ocean' ? "bg-white/5" : "bg-white/40")}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: habit.color }} />
                        <div className="flex flex-col">
                          <span className={cn("font-black text-sm uppercase tracking-tight", theme === 'ocean' ? "text-slate-200" : "text-slate-800")}>{habit.name}</span>
                          <span className="text-[9px] opacity-50 font-black uppercase tracking-widest">
                            {habit.frequency?.type === 'daily' ? t("habits.everyDay") : habit.frequency?.type === 'weekly' ? t("habits.specDays") : `${habit.frequency?.times}x/wk`}
                          </span>
                        </div>
                      </div>
                    </td>
                    {currentWeekDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const completed = entries.find(e => e.habitId === habit.id && e.date === dateStr)?.completed ?? false;
                      const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));
                      const isDue = isHabitDueToday(habit, day);
                      
                      return (
                        <td key={dateStr} className={cn("text-center p-1 backdrop-blur-sm relative", theme === 'ocean' ? "bg-white/5" : "bg-white/40")}>
                          <button 
                            disabled={isFuture}
                            onClick={() => onToggle(habit.id, dateStr)} 
                            className={cn(
                              `w-8 h-8 rounded-xl transition-all duration-300 flex items-center justify-center mx-auto border-2`, 
                              completed ? 'text-white shadow-sm border-transparent' : 
                              isFuture ? 'bg-transparent border-dashed border-slate-200 cursor-not-allowed opacity-20' :
                              !isDue ? 'bg-slate-50/50 border-transparent opacity-30 cursor-pointer hover:opacity-100' :
                              (theme === 'ocean' ? 'bg-white/10 border-transparent hover:bg-white/20' : 'bg-black/5 border-transparent hover:bg-black/10')
                            )} 
                            style={{ backgroundColor: completed ? habit.color : undefined }}
                          >
                            {completed ? <CheckSquare className="w-4 h-4" /> : (!isDue && !isFuture && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />)}
                          </button>
                        </td>
                      );
                    })}
                    <td className={cn("text-center p-3 rounded-r-2xl backdrop-blur-sm", theme === 'ocean' ? "bg-white/5" : "bg-white/40")}>
                      <span className={cn("font-black text-lg", theme === 'ocean' ? "text-white" : "text-foreground")}>{calculateStreak(habit.id)}<span className="text-[10px] ml-0.5">🔥</span></span>
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
