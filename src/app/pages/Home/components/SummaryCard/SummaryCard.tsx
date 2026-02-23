import type { FC } from 'react';
import { Card } from '@/app/components/ui/card';
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
        ? "bg-black border-black text-white rounded-xl shadow-[4px_4px_0px_0px_gray]"
        : "bg-white border-black text-black rounded-xl shadow-[4px_4px_0px_0px_black]";
    }
    if (theme === 'zen') {
      switch (type) {
        case 'expense': return "bg-[#FFF7ED] text-[#9A3412] rounded-2xl";
        case 'habit': return "bg-[#EFF6FF] text-[#1E40AF] rounded-2xl";
        case 'insight': return "bg-[#FAF5FF] text-[#6B21A8] rounded-2xl";
      }
    }
    switch (type) {
      case 'expense': return "bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl text-white shadow-lg";
      case 'habit': return "bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl text-white shadow-lg";
      case 'insight': return "bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl text-white shadow-lg";
    }
    return "";
  };

  return (
    <Link to={linkTo} className={cn(type === 'insight' && "col-span-2 md:col-span-1", className)}>
      <Card className={cn(
        "border-0 h-28 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] active:scale-95",
        getCardStyle()
      )}>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 leading-tight">
          {title}
        </p>
        <p className={cn(
          "font-black mt-0.5",
          typeof value === 'string' && value.length > 10 ? "text-lg" : "text-2xl"
        )}>
          {value}
        </p>
      </Card>
    </Link>
  );
};

export default SummaryCard;
