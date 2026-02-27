import type { FC } from 'react';
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Link } from "react-router";
import { CheckSquare, Check, Sparkles } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from '@/app/contexts/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface TodayHabitsProps {
  habits: any[];
  onToggle: (id: string) => Promise<void>;
}

const TodayHabits: FC<TodayHabitsProps> = ({ habits, onToggle }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const completedCount = habits.filter(h => h.completed).length;
  
  const getCardClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
          default: return "glass-card border-0 rounded-[2.5rem] shadow-xl";
      }
  };

  return (
    <Card 
      className={cn("flex flex-col", getCardClass())}
      headerClassName="p-10 pb-2"
      header={(
        <div className="flex items-center gap-3">
          <CheckSquare className={cn("w-6 h-6", theme === 'ocean' ? "text-blue-400" : "text-blue-500")} />
          <span className="font-black text-2xl uppercase tracking-tighter">{t("nav.habits")}</span>
        </div>
      )}
      tag={<span className="font-black text-sm opacity-40 px-4 py-1.5 bg-black/5 rounded-full">{completedCount}/{habits.length} {t("common.confirm")}</span>}
      contentClassName="p-10 pt-4 flex flex-col gap-6"
      content={(
        <>
          <div className="flex flex-col gap-3">
            {habits.length > 0 ? habits.map((habit, i) => (
              <button
                key={habit.id}
                onClick={() => onToggle(habit.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all border-0 group",
                  theme === 'ocean' 
                    ? (habit.completed ? "bg-slate-700/60" : "bg-slate-800/40 hover:bg-slate-800/60")
                    : (habit.completed ? "bg-gray-100/80 shadow-inner" : "bg-gray-50/60 hover:bg-gray-100/60 shadow-sm")
                )}
              >
                <div className="flex items-center gap-4">
                    <div 
                    className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        habit.completed 
                        ? "bg-green-500 border-transparent scale-100 shadow-md" 
                        : "bg-white border-gray-200 scale-90 group-hover:scale-95"
                    )}
                    >
                    {habit.completed && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </div>
                    <span className={cn(
                    "font-black text-lg transition-all tracking-tight uppercase", 
                    habit.completed 
                        ? (theme === 'ocean' ? "text-slate-400" : "text-gray-400 line-through") 
                        : (theme === 'ocean' ? "text-white" : "text-gray-800")
                    )}>
                    {habit.name}
                    </span>
                </div>
                {habit.completed && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
              </button>
            )) : (
              <div className="py-12 text-center opacity-50 font-black uppercase tracking-widest text-sm">
                {t("habits.addFirst")}
              </div>
            )}
          </div>
          
          <Link to="/habits" className="mt-4">
            <Button className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95">
              {t("common.total")} {t("nav.habits")}
            </Button>
          </Link>
        </>
      )}
    />
  );
};

export default TodayHabits;
