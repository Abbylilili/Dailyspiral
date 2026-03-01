import type { FC } from 'react';
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from '@/app/contexts/ThemeContext';

interface HabitItemProps {
  habit: {
    id: string;
    name: string;
    completed: boolean;
  };
  onToggle: (id: string) => Promise<void>;
}

const HabitItem: FC<HabitItemProps> = ({ habit, onToggle }) => {
  const { theme } = useTheme();

  return (
    <button
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
            "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300",
            habit.completed 
              ? "bg-green-500 border-transparent scale-100 shadow-md" 
              : "bg-white border-gray-200 scale-90 group-hover:scale-95"
          )}
        >
          {habit.completed && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
        </div>
        <span className={cn(
          "font-black text-sm transition-all tracking-tight uppercase", 
          habit.completed 
            ? (theme === 'ocean' ? "text-slate-400" : "text-gray-400") 
            : (theme === 'ocean' ? "text-white" : "text-gray-800")
        )}>
          {habit.name}
        </span>
      </div>
      {habit.completed && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
    </button>
  );
};

export default HabitItem;
