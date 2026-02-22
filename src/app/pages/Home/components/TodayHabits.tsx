import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Link } from "react-router";
import { CheckSquare, Check } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from '@/app/contexts/ThemeContext';

interface TodayHabitsProps {
  habits: any[];
  onToggle: (id: string) => Promise<void>;
}

const TodayHabits: FC<TodayHabitsProps> = ({ habits, onToggle }) => {
  const { theme } = useTheme();
  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
  
  const getCardClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-900/40 border border-white/5 text-white backdrop-blur-2xl shadow-2xl rounded-[2rem]";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl";
          case 'zen': return "bg-white/60 border border-emerald-100/50 text-emerald-900 backdrop-blur-xl shadow-xl rounded-[2.5rem]";
          default: return "bg-white/70 border border-white/40 text-gray-900 backdrop-blur-2xl shadow-xl rounded-[2rem]";
      }
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-500", getCardClass())}>
      <CardHeader className="pb-0 pt-8 px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
              <div className={cn("p-2 rounded-xl", theme === 'ocean' ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600")}>
                <CheckSquare className="w-6 h-6" />
              </div>
              Habit Check
            </CardTitle>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 ml-11">Daily Discipline</p>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="opacity-10"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke={theme === 'ocean' ? "#3b82f6" : "#2563eb"}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - progress / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black leading-none">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {habits.length > 0 ? habits.map(habit => (
            <button
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              className={cn(
                "group relative flex items-center gap-4 p-5 rounded-[1.5rem] transition-all duration-300 border-2 text-left overflow-hidden",
                habit.completed 
                  ? (theme === 'ocean' ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200")
                  : (theme === 'ocean' ? "bg-white/5 border-transparent hover:border-white/10" : "bg-white/50 border-transparent hover:border-gray-100 shadow-sm")
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
                habit.completed 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 rotate-0" 
                  : "bg-gray-100 text-gray-400 rotate-6 group-hover:rotate-0 group-hover:bg-gray-200"
              )}>
                {habit.completed ? <Check className="w-7 h-7" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
              </div>
              
              <div className="flex flex-col z-10">
                <span className={cn(
                  "font-black text-sm transition-all tracking-tight",
                  habit.completed ? "opacity-40 line-through" : "opacity-100"
                )}>
                  {habit.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-30">
                  {habit.completed ? 'Success' : 'Pending'}
                </span>
              </div>

              {/* Decorative background shape for completed items */}
              {habit.completed && (
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl" />
              )}
            </button>
          )) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-black/5 rounded-[2rem] border-2 border-dashed border-black/10">
               <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <CheckSquare className="w-8 h-8 opacity-20" />
               </div>
               <p className="font-bold text-gray-500 mb-1">No habits set for today</p>
               <Link to="/habits" className="text-sm font-black text-blue-500 hover:scale-105 transition-transform">Create your first goal →</Link>
            </div>
          )}
        </div>
        
        <Link to="/habits">
          <Button className={cn(
            "w-full h-14 rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:translate-y-[-2px] active:translate-y-[0px]",
            theme === 'ocean' ? "bg-blue-600 hover:bg-blue-500" : "bg-black hover:bg-gray-900"
          )}>
            View Habit Dashboard
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default TodayHabits;
