import type { FC } from 'react';
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Link } from "react-router";
import { CheckSquare } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from '@/app/contexts/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import HabitItem from './components/HabitItem';

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
        <div className="flex items-center gap-3 h-10">
          <CheckSquare className={cn("w-6 h-6", theme === 'ocean' ? "text-blue-400" : "text-blue-500")} />
          <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{t("nav.habits")}</h3>
        </div>
      )}
      tag={<span className="font-black text-sm opacity-40 px-4 py-1.5 bg-black/5 rounded-full">{completedCount}/{habits.length} {t("common.confirm")}</span>}
      contentClassName="p-10 pt-4 flex flex-col gap-6"
      content={(
        <>
          <div className="flex flex-col gap-3">
            {habits.length > 0 ? habits.map((habit) => (
              <HabitItem 
                key={habit.id}
                habit={habit}
                onToggle={onToggle}
              />
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
