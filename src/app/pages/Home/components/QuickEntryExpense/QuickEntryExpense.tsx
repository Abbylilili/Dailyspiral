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

  const handleSave = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return toast.error(t("expenses.enterAmount"));
    
    await saveExpense({
      id: `exp-${Date.now()}`,
      amount: val,
      type,
      category,
      date,
      note: "",
      description: ""
    });
    
    setAmount("");
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
    <Card className={cn("rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl h-[320px] flex flex-col", getCardClass())}>
      <CardContent className="p-10 flex flex-col justify-between h-full">
        <div className="w-full flex justify-between items-start">
          <h3 className="font-black text-2xl uppercase tracking-tighter">{t("home.quickActions")}</h3>
          <div className="flex bg-slate-100 rounded-full p-1 shadow-inner">
            <button onClick={() => setType('expense')} className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", type === 'expense' ? "bg-black text-white shadow-md" : "text-slate-400")}>{t("expenses.expense")}</button>
            <button onClick={() => setType('income')} className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", type === 'income' ? "bg-black text-white shadow-md" : "text-slate-400")}>{t("expenses.income")}</button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-xl text-slate-400">$</span>
            <input 
              type="number" placeholder="0.00" value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-16 pl-12 pr-4 rounded-2xl bg-black/5 border-0 font-black text-3xl outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
          
          <select 
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 px-5 rounded-xl bg-slate-100 border-0 font-black text-[11px] uppercase tracking-widest outline-none text-slate-600"
          >
            {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>

        <Button onClick={handleSave} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2">
          <Plus className="w-5 h-5" />
          {t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickEntryExpense;
