import type { FC } from 'react';
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Link } from "react-router";
import { CheckSquare, Check, Sparkles } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from '@/app/contexts/ThemeContext';

interface TodayHabitsProps {
  habits: any[];
  onToggle: (id: string) => Promise<void>;
}

const TodayHabits: FC<TodayHabitsProps> = ({ habits, onToggle }) => {
  const { theme } = useTheme();
  const completedCount = habits.filter(h => h.completed).length;
  
  const getCardClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
          default: return "glass-card border-0 rounded-2xl shadow-xl";
      }
  };

  return (
    <Card 
      className={cn("flex flex-col h-full", getCardClass())}
      headerClassName="pb-2"
      header={(
        <div className="flex items-center gap-2">
          <CheckSquare className={cn("w-5 h-5", theme === 'ocean' ? "text-blue-400" : "text-blue-500")} />
          Habit Check
        </div>
      )}
      tag={`${completedCount}/${habits.length} Done`}
      contentClassName="space-y-3 flex flex-col flex-1"
      content={(
        <>
          <div className="space-y-2 flex-1 overflow-y-auto min-h-[120px] max-h-[350px] pr-1 custom-scrollbar">
            {habits.length > 0 ? habits.map((habit, i) => (
              <button
                key={habit.id}
                onClick={() => onToggle(habit.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all border-0 group animate-in fade-in slide-in-from-bottom-1 duration-300",
                  theme === 'ocean' 
                    ? (habit.completed ? "bg-slate-700/60" : "bg-slate-800/40 hover:bg-slate-800/60")
                    : (habit.completed ? "bg-gray-100/80 shadow-inner" : "bg-gray-50/60 hover:bg-gray-100/60 shadow-sm")
                )}
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    habit.completed 
                      ? "bg-green-500 border-transparent scale-100 shadow-md shadow-green-500/10" 
                      : "bg-white border-gray-200 scale-90 group-hover:scale-95"
                  )}
                >
                  {habit.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className={cn(
                  "font-bold text-sm transition-all tracking-tight", 
                  habit.completed 
                    ? (theme === 'ocean' ? "text-slate-400" : "text-gray-400") 
                    : (theme === 'ocean' ? "text-white" : "text-gray-700")
                )}>
                  {habit.name}
                </span>
              </button>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className={cn(
                    "text-lg font-black tracking-tight",
                    theme === 'ocean' ? "text-white" : "text-gray-800"
                  )}>
                    Let's create your <span className="text-blue-500">first habit</span>
                  </p>
                  <p className="text-xs text-muted-foreground opacity-70">Small steps every day lead to a big spiral.</p>
                </div>
                <Link to="/habits">
                  <Button size="sm" className="rounded-full px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold h-9">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <Link to="/habits" className="mt-auto">
            <Button variant="outline" className="w-full h-10 rounded-xl border-0 bg-black/5 hover:bg-black/10">
              View All Habits
            </Button>
          </Link>
        </>
      )}
    />
  );
};

export default TodayHabits;
