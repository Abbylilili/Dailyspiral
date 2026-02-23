import type { FC } from 'react';
import { useState } from 'react';
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Wallet, Plus } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import { saveExpense } from "@/app/lib/storage";
import { toast } from "sonner";

interface QuickEntryExpenseProps {
  date: string;
  onRefresh: () => void;
}

const CATEGORIES = [
  {value:"rent", label:"🏠 Rent"},
  { value: "food", label: "🍜 Food" },
  { value: "transport", label: "🚗 Transport" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "medication", label: "💊 Medication" },
  { value: "sports", label: "⚽ Sports" },
  { value: "other", label: "📦 Other" },
  {value:"beauty", label:"💄 Beauty"},
  {value:"education", label:"📚 Education"},
  {value:"gift", label:"🎁 Gift"},
  {value:"travel", label:"✈️ Travel"},
  {value:"subscription", label:"📺 Subscription"},
  {value:"beverage", label:"🧋Beverage"},
  {value: "custom", label: "📝 Custom" },
  {value:"tel&internet", label:"📱 Tel & Internet"},
];

const QuickEntryExpense: FC<QuickEntryExpenseProps> = ({ date, onRefresh }) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [customCategory, setCustomCategory] = useState("");

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter valid amount");
    if (!category) return toast.error("Please select a category");
    const finalCategory = category === "custom" ? (customCategory.trim() || "Custom") : category;
    
    await saveExpense({
      id: `${Date.now()}`,
      date,
      amount: parseFloat(amount),
      category: finalCategory,
      description: "",
      type,
    });
    
    setAmount(""); setCustomCategory(""); setCategory("");
    toast.success("Saved!");
    onRefresh();
  };

  const getInputClass = () => {
    switch(theme) {
      case 'ocean': return "bg-slate-900/80 border border-white/10 text-white focus:border-cyan-500/50 rounded-xl transition-all";
      case 'ink': return "bg-white border-2 border-black text-black focus:shadow-[4px_4px_0px_0px_black] rounded-lg transition-all";
      case 'zen': return "bg-emerald-50/50 border border-emerald-100 text-emerald-900 focus:bg-white focus:border-emerald-300 rounded-xl transition-all";
      default: return "bg-white/60 border border-gray-200/50 shadow-inner focus:bg-white focus:border-purple-300 rounded-xl transition-all";
    }
  };

  return (
    <Card 
      className="flex flex-col h-full glass-card border-0 rounded-2xl shadow-xl"
      headerClassName="pb-2"
      header={(
        <div className="flex items-center gap-2">
          <Wallet className={cn("w-5 h-5", theme === 'ocean' ? "text-green-400" : "text-green-500")} />
          Quick Add
        </div>
      )}
      contentClassName="space-y-4 flex flex-col flex-1"
      content={(
        <>
          <div className={cn("flex p-1 rounded-xl", theme === 'ocean' ? "bg-slate-900" : "bg-gray-100")}>
              <button onClick={() => setType('expense')} className={cn("flex-1 py-1.5 rounded-lg text-sm font-medium transition-all", type === 'expense' ? "bg-white shadow-sm text-red-600" : "opacity-50")}>Expense</button>
              <button onClick={() => setType('income')} className={cn("flex-1 py-1.5 rounded-lg text-sm font-medium transition-all", type === 'income' ? "bg-white shadow-sm text-green-600" : "opacity-50")}>Income</button>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold opacity-60">Amount</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={cn("text-base h-12 w-full", getInputClass())} />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold opacity-60">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={cn("h-12 text-base w-full", getInputClass())}>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>{CATEGORIES.map(cat => ( <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem> ))}<SelectItem value="custom">✏️ Custom...</SelectItem></SelectContent>
            </Select>
            {category === "custom" && <Input placeholder="Category name" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className={cn("h-10 mt-2 text-base", getInputClass())} />}
          </div>
          
          <Button onClick={handleSave} className="w-full h-10 rounded-xl shadow-lg mt-auto active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> Add {type === 'expense' ? 'Expense' : 'Income'}
          </Button>
        </>
      )}
    />
  );
};

export default QuickEntryExpense;
