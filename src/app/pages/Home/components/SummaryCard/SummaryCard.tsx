import type { FC } from 'react';
import { Link } from 'react-router';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/app/components/ui/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  linkTo: string;
  type: 'expense' | 'habit' | 'insight';
  className?: string;
}

const SummaryCard: FC<SummaryCardProps> = ({ title, value, linkTo, type, className }) => {
  const { theme } = useTheme();

  const getCardStyle = () => {
    if (theme === 'ink') {
      return type === 'expense'
        ? "bg-black border-black text-white shadow-[4px_4px_0px_0px_gray]"
        : "bg-white border-2 border-black text-black shadow-[4px_4px_0px_0px_black]";
    }
    if (theme === 'zen') {
      switch (type) {
        case 'expense': return "bg-[#FFF7ED] text-[#9A3412]";
        case 'habit': return "bg-[#EFF6FF] text-[#1E40AF]";
        case 'insight': return "bg-[#FAF5FF] text-[#6B21A8]";
      }
    }
    switch (type) {
      case 'expense': return "bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg";
      case 'habit': return "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg";
      case 'insight': return "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg";
    }
    return "";
  };

  return (
    <Link 
      to={linkTo} 
      className={cn(
        "group relative flex flex-col items-center justify-center h-24 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden",
        type === 'insight' && "col-span-2 md:col-span-1",
        getCardStyle(),
        className
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-0.5 z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 leading-none">
          {title}
        </p>
        <p className={cn(
          "font-black tracking-tight leading-none text-center",
          typeof value === 'string' && value.length > 12 ? "text-lg" : "text-xl"
        )}>
          {value}
        </p>
      </div>
      
      {/* Decorative background element for interactive feel */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
    </Link>
  );
};

export default SummaryCard;
