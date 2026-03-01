import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import { CATEGORIES } from '@/app/pages/Expenses/constants';
import { saveExpense } from "@/app/lib/storage";
import { toast } from "sonner";
import AmountInput from './components/AmountInput';
import CategorySelect from './components/CategorySelect';
import TypeSelector from './components/TypeSelector';

interface QuickEntryExpenseProps {
  date: string;
  onRefresh?: () => void;
}

const QuickEntryExpense: FC<QuickEntryExpenseProps> = ({ date, onRefresh }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [customCategory, setCustomCategory] = useState("");

  const handleSave = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return toast.error(t("expenses.enterAmount"));
    
    const finalCategory = category === "custom" ? customCategory.trim() : category;
    if (!finalCategory) return toast.error(t("expenses.selectCategory"));

    await saveExpense({
      id: `exp-${Date.now()}`,
      amount: val,
      type,
      category: finalCategory,
      date,
      description: ""
    });
    
    setAmount("");
    setCustomCategory("");
    if (category === "custom") setCategory(CATEGORIES[0].value);
    toast.success(t("expenses.saved"));
    onRefresh?.();
  };

  const getCardClass = () => {
    switch(theme) {
        case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
        case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black]";
        case 'zen': return "bg-white border-0 shadow-lg shadow-emerald-50/50";
        default: return "glass-card border-0 bg-white/70 shadow-xl";
    }
  };

  return (
    <Card className={cn("rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl h-full min-h-[380px] flex flex-col", getCardClass())}>
      <CardContent className="p-8 pt-10 pb-10 flex-1 flex flex-col">
        <div className="w-full flex justify-between items-start h-16">
          <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{t("home.quickActions")}</h3>
          <TypeSelector 
            type={type} 
            onTypeChange={setType} 
          />
        </div>

        <div className="flex flex-col gap-4 mt-4 mb-8">
          <AmountInput 
            value={amount} 
            onChange={setAmount} 
          />
          
          <CategorySelect 
            category={category}
            onCategoryChange={setCategory}
            customCategory={customCategory}
            onCustomCategoryChange={setCustomCategory}
          />
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-auto"
        >
          <Plus className="w-5 h-5" />
          {t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickEntryExpense;
