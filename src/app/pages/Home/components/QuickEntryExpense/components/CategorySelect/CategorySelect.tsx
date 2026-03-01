import type { FC } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import { CATEGORIES } from '@/app/pages/Expenses/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface CategorySelectProps {
  category: string;
  onCategoryChange: (val: string) => void;
  customCategory: string;
  onCustomCategoryChange: (val: string) => void;
}

const CategorySelect: FC<CategorySelectProps> = ({ 
  category, 
  onCategoryChange, 
  customCategory, 
  onCustomCategoryChange 
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const controlBaseClass = "!h-14 w-full !rounded-[1.25rem] font-bold transition-all outline-none ring-0 focus:ring-0 focus-visible:ring-0";

  const getThemedControlClass = () => {
    switch(theme) {
      case 'ocean': return "bg-white/10 text-white border-0 focus:bg-white/20 hover:bg-white/20";
      case 'ink': return "bg-white border-2 border-black !rounded-none shadow-[2px_2px_0px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none";
      case 'zen': return "bg-emerald-50/50 text-emerald-900 border border-emerald-100/50 hover:border-emerald-100 focus:ring-2 focus:ring-emerald-200";
      default: return "bg-black/5 text-slate-800 border-0 focus:ring-2 focus:ring-black/10 hover:bg-black/10";
    }
  };

  return (
    <div className="space-y-3">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className={cn(
          controlBaseClass, 
          "px-5 text-[12px] uppercase tracking-widest flex items-center justify-between !border-0", 
          getThemedControlClass(),
          theme === 'ink' && "!border-2"
        )}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={cn(
          "backdrop-blur-xl border shadow-2xl rounded-xl",
          theme === 'ocean' ? "bg-slate-800/90 border-white/10 text-white" : 
          theme === 'ink' ? "bg-white border-2 border-black rounded-none" :
          theme === 'zen' ? "bg-white/90 border-emerald-100 text-emerald-900" :
          "bg-white/90 border-white/20"
        )}>
          {CATEGORIES.map(cat => (
            <SelectItem key={cat.value} value={cat.value} className={theme === 'ocean' ? "focus:bg-white/10 focus:text-white" : ""}>
              {cat.label}
            </SelectItem>
          ))}
          <SelectItem value="custom" className={theme === 'ocean' ? "focus:bg-white/10 focus:text-white" : ""}>
            {t("category.custom")}
          </SelectItem>
        </SelectContent>
      </Select>

      {category === "custom" && (
        <input 
          type="text" 
          placeholder={t("category.custom")}
          value={customCategory}
          onChange={(e) => onCustomCategoryChange(e.target.value)}
          className={cn(
            controlBaseClass,
            "px-5 text-[12px] uppercase tracking-widest",
            getThemedControlClass()
          )}
        />
      )}
    </div>
  );
};

export default CategorySelect;
