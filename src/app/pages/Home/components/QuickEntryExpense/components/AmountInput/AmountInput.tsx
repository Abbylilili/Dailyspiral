import type { FC } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const AmountInput: FC<AmountInputProps> = ({ value, onChange, placeholder = "0.00" }) => {
  const { theme } = useTheme();

  const controlBaseClass = "!h-14 w-full !rounded-[1.25rem] font-black transition-all outline-none ring-0 focus:ring-0 focus-visible:ring-0";

  const getThemedControlClass = () => {
    switch(theme) {
      case 'ocean': return "bg-white/10 text-white hover:bg-white/20";
      case 'ink': return "bg-white border-2 border-black !rounded-none focus:ring-0 shadow-[2px_2px_0px_0px_black] text-black";
      case 'zen': return "bg-emerald-50/50 text-emerald-900 border-emerald-100/50 focus:ring-2 focus:ring-emerald-200";
      default: return "bg-black/5 text-slate-800  hover:bg-black/10";
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-xl text-slate-400 pointer-events-none">$</span>
      <input 
        type="number" 
        placeholder={placeholder}
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          controlBaseClass, 
          "pl-12 pr-4 text-3xl", 
          getThemedControlClass()
        )}
      />
    </div>
  );
};

export default AmountInput;
