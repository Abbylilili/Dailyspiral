import type { FC } from 'react';
import { format, startOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { cn } from '@/app/components/ui/utils';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface YearViewProps {
  currentDate: Date;
  onMonthClick?: (month: Date) => void;
}

const MiniMonth: FC<{ month: Date; onMonthClick?: (month: Date) => void; locale: any }> = ({ month, onMonthClick, locale }) => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const weekDayLabels = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  }).map(d => format(d, 'EEEEE', { locale }));

  return (
    <div onClick={() => onMonthClick?.(month)} className="p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors group">
      <h4 className="text-sm font-black text-blue-600 mb-3 uppercase tracking-tighter group-hover:scale-110 transition-transform origin-left">
        {format(month, 'MMMM', { locale })}
      </h4>
      <div className="grid grid-cols-7 gap-1">
        {weekDayLabels.map((d, i) => (
          <div key={i} className="text-[7px] font-bold text-slate-300 text-center">{d}</div>
        ))}
        {days.map(day => (
          <div 
            key={day.toISOString()} 
            className={cn(
              "text-[8px] font-bold text-center w-4 h-4 flex items-center justify-center rounded-full",
              !isSameMonth(day, month) ? "text-slate-100" : 
              isSameDay(day, new Date()) ? "bg-red-500 text-white" : "text-slate-600"
            )}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};

export const YearView: FC<YearViewProps> = ({ currentDate, onMonthClick }) => {
  const { language } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
  
  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfMonth(addMonths(startOfYear(currentDate), 11))
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 bg-transparent">
      {months.map(month => (
        <MiniMonth key={month.toISOString()} month={month} onMonthClick={onMonthClick} locale={locale} />
      ))}
    </div>
  );
};
