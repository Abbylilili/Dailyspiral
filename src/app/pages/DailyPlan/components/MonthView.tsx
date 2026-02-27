import type { FC } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import type { DailyPlanEntry } from '@/app/lib/storage';
import { cn } from '@/app/components/ui/utils';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface MonthViewProps {
  currentDate: Date;
  plans: DailyPlanEntry[];
  onDateClick?: (date: Date) => void;
  onEdit?: (plan: DailyPlanEntry) => void;
}

export const MonthView: FC<MonthViewProps> = ({ currentDate, plans, onDateClick, onEdit }) => {
  const { language, t } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDayLabels = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  }).map(d => format(d, 'EEE', { locale }));

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="grid grid-cols-7 border-b border-slate-100 mb-2">
        {weekDayLabels.map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 gap-px bg-slate-50 border border-slate-50 rounded-2xl overflow-hidden shadow-inner">
        {calendarDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayPlans = plans.filter(p => p.date === dateStr);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={day.toISOString()} 
              onClick={() => onDateClick?.(day)}
              className={cn(
                "bg-white p-2 min-h-[110px] flex flex-col gap-1.5 transition-all hover:bg-blue-50/30 cursor-pointer group",
                !isCurrentMonth && "bg-slate-50/50 opacity-30"
              )}
            >
              <div className={cn(
                "text-xs font-black w-7 h-7 flex items-center justify-center rounded-full ml-auto transition-transform group-hover:scale-110",
                isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400"
              )}>
                {format(day, 'd')}
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayPlans.slice(0, 3).map(plan => (
                  <div 
                    key={plan.id} 
                    onClick={(e) => { e.stopPropagation(); onEdit?.(plan); }}
                    className="px-2 py-1 rounded-lg text-[9px] font-black truncate border-l-2 transition-all hover:translate-x-1"
                    style={{ backgroundColor: `${plan.color}15`, color: plan.color, borderLeftColor: plan.color }}
                  >
                    {plan.title}
                  </div>
                ))}
                {dayPlans.length > 3 && (
                  <div className="text-[8px] font-black text-slate-300 ml-1 mt-0.5">+{dayPlans.length - 3} {t("plan.more").toUpperCase()}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
