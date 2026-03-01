import type { FC } from 'react';
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";

interface TypeSelectorProps {
  type: 'expense' | 'income';
  onTypeChange: (type: 'expense' | 'income') => void;
}

const TypeSelector: FC<TypeSelectorProps> = ({ type, onTypeChange }) => {
  const { t } = useLanguage();

  return (
    <div className="flex bg-slate-100 rounded-full p-1 shadow-inner">
      <button 
        onClick={() => onTypeChange('expense')} 
        className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", 
          type === 'expense' ? "bg-black text-white shadow-md" : "text-slate-400"
        )}
      >
        {t("expenses.expense")}
      </button>
      <button 
        onClick={() => onTypeChange('income')} 
        className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", 
          type === 'income' ? "bg-black text-white shadow-md" : "text-slate-400"
        )}
      >
        {t("expenses.income")}
      </button>
    </div>
  );
};

export default TypeSelector;
