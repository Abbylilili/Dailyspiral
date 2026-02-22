import { useMemo } from "react";
import { Habit, isHabitCompleted } from "../lib/storage";
import { format, eachDayOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";

interface HabitYearViewProps {
  habit: Habit;
  year: number;
}

export function HabitYearView({ habit, year }: HabitYearViewProps) {
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const start = startOfMonth(new Date(year, i, 1));
      const end = endOfMonth(start);
      return {
        monthIndex: i,
        name: format(start, 'MMM'),
        days: eachDayOfInterval({ start, end })
      };
    });
  }, [year]);
  
  // Calculate statistics
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Only count days up to today for completion rate
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
  const pastOrPresentDays = allDays.filter(day => format(day, 'yyyy-MM-dd') <= todayStr);
  
  const totalDays = pastOrPresentDays.length;
  const completedDays = pastOrPresentDays.filter(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return isHabitCompleted(habit.id, dateStr);
  }).length;
  
  const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
  
  return (
    <div className="space-y-3 p-6 glass-card rounded-2xl border-0 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{ backgroundColor: habit.color, boxShadow: `0 4px 10px ${habit.color}66` }}
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg tracking-tight">{habit.name}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {completedDays} / {totalDays} days • {completionRate.toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-black/10" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
            <span>Done</span>
          </div>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="grid grid-cols-12 gap-0 w-full min-w-[900px]">
        {months.map((month) => (
           <div key={month.monthIndex} className="flex flex-col gap-3 items-center">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest text-center mb-1 truncate">
                    {month.name}
                </span>
                <div className="grid grid-rows-7 grid-flow-col gap-1 auto-cols-max justify-center">
                    {month.days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isFuture = dateStr > todayStr;
                        // Visually uncheck future dates even if they are in storage
                        const isCompleted = !isFuture && isHabitCompleted(habit.id, dateStr);
                        const isToday = todayStr === dateStr;
                        
                        return (
                            <div
                                key={dateStr}
                                className={`w-3 h-3 rounded-[2px] transition-all duration-300 ${
                                    isToday ? 'ring-2 ring-offset-1 ring-black/20 dark:ring-white/20' : ''
                                } ${
                                    isCompleted 
                                    ? 'scale-100 shadow-none' 
                                    : (isFuture ? 'bg-black/5 dark:bg-white/5 opacity-30 cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 scale-90 hover:bg-black/10')
                                }`}
                                style={{
                                    backgroundColor: isCompleted ? habit.color : undefined,
                                }}
                                title={`${format(day, 'MMM dd, yyyy')}${isFuture ? ' (Future)' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>
        ))}
        </div>
      </div>
    </div>
  );
}
