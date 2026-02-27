import type { FC } from 'react';
import { format, parseISO, differenceInMinutes, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import type { DailyPlanEntry } from '@/app/lib/storage';
import { cn } from '@/app/components/ui/utils';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface WeekViewProps {
  currentDate: Date;
  plans: DailyPlanEntry[];
  onEdit?: (plan: DailyPlanEntry) => void;
  onTimeClick?: (date: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export const WeekView: FC<WeekViewProps> = ({ currentDate, plans, onEdit, onTimeClick }) => {
  const { language } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPosition = (timeStr: string) => {
    const time = parseISO(timeStr);
    return (time.getHours() * 60 + time.getMinutes()) * MINUTE_HEIGHT;
  };

  const getHeight = (start: string, end: string) => {
    const duration = differenceInMinutes(parseISO(end), parseISO(start));
    return Math.max(duration * MINUTE_HEIGHT, 20);
  };

  return (
    <div className="flex flex-col h-full bg-transparent select-none">
      <div className="flex border-b border-slate-100 mb-2">
        <div className="w-12" />
        {weekDays.map(day => (
          <div key={day.toISOString()} className="flex-1 py-2 text-center group">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter group-hover:text-blue-400 transition-colors">
              {format(day, 'EEE', { locale })}
            </div>
            <div className={cn(
              "text-xs font-black w-7 h-7 flex items-center justify-center mx-auto rounded-full mt-1 transition-all",
              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 group-hover:text-slate-600"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto relative h-[600px] scrollbar-hide">
        <div className="flex min-h-full">
          <div className="w-12 border-r border-slate-50">
            {HOURS.map(hour => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2 right-2 text-[9px] font-black text-slate-200 uppercase">
                  {`${hour}:00`}
                </span>
              </div>
            ))}
          </div>

          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayPlans = plans.filter(p => p.date === dateStr);

            return (
              <div key={dateStr} className="flex-1 relative border-r border-slate-50 last:border-0 group hover:bg-slate-50/30 transition-colors">
                {HOURS.map(hour => (
                  <div key={hour} onClick={() => onTimeClick?.(day, hour)} className="h-[60px] border-b border-slate-50/50 cursor-pointer" />
                ))}
                
                <div className="absolute inset-0 pointer-events-none p-1">
                  {dayPlans.map(plan => {
                    const top = getPosition(plan.startTime);
                    const height = getHeight(plan.startTime, plan.endTime);
                    return (
                      <div 
                        key={plan.id}
                        onClick={(e) => { e.stopPropagation(); onEdit?.(plan); }}
                        className="absolute left-1 right-1 rounded-xl px-2 border-l-[3px] shadow-sm cursor-pointer pointer-events-auto overflow-hidden flex flex-col justify-center transition-all hover:scale-[1.02] z-10"
                        style={{ top: `${top}px`, height: `${height}px`, backgroundColor: `${plan.color}15`, borderLeftColor: plan.color, color: plan.color }}
                      >
                        <div className="text-[10px] font-black truncate leading-tight">{plan.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
