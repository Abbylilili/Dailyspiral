import type { FC } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

interface HabitStatsProps {
  completionRate: number;
  habitCount: number;
  bestStreak: number;
}

const HabitStats: FC<HabitStatsProps> = ({ completionRate, habitCount, bestStreak }) => {
  const { theme } = useTheme();
  
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         default: return "glass-card border-0 rounded-3xl";
     }
  };

  const getLabelClass = () => theme === 'ocean' ? "text-slate-400" : "text-muted-foreground";
  const getValueClass = () => theme === 'ocean' ? "text-white" : "text-foreground";

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
          <p className={cn("text-sm mb-2 font-semibold uppercase tracking-wider", getLabelClass())}>Weekly Completion</p>
          <div className="flex items-end gap-1">
            <p className={cn("text-5xl font-bold tracking-tighter", getValueClass())}>{completionRate.toFixed(0)}</p>
            <p className={cn("text-2xl font-medium mb-1", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>%</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
          <p className={cn("text-sm mb-2 font-semibold uppercase tracking-wider", getLabelClass())}>Habit Count</p>
          <p className={cn("text-5xl font-bold tracking-tighter", getValueClass())}>{habitCount}</p>
        </CardContent>
      </Card>
      
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
          <p className={cn("text-sm mb-2 font-semibold uppercase tracking-wider", getLabelClass())}>Longest Streak</p>
          <div className="flex items-end gap-1">
            <p className={cn("text-5xl font-bold tracking-tighter", getValueClass())}>{bestStreak}</p>
            <p className={cn("text-xl font-medium mb-1", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>Days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitStats;
