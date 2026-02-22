import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
  { value: "food", label: "🍜 Food" },
  { value: "transport", label: "🚗 Transport" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "health", label: "💊 Health" },
  { value: "other", label: "📦 Other" },
];

const QuickEntryExpense: FC<QuickEntryExpenseProps> = ({ date, onRefresh }) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [customCategory, setCustomCategory] = useState("");

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter valid amount");
    const finalCategory = category === "custom" ? (customCategory.trim() || "Custom") : category;
    
    await saveExpense({
      id: `${Date.now()}`,
      date,
      amount: parseFloat(amount),
      category: finalCategory,
      description: "",
      type,
    });
    
    setAmount(""); setCustomCategory(""); setCategory("food");
    toast.success("Saved!");
    onRefresh();
  };

  const getInputClass = () => theme === 'ocean' ? "bg-slate-900/60 border-0 text-white rounded-xl" : "bg-white/40 border-0 rounded-xl";

  return (
    <Card className="flex flex-col h-full glass-card border-0 rounded-2xl shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className={cn("w-5 h-5", theme === 'ocean' ? "text-green-400" : "text-green-500")} />
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col flex-1">
        <div className={cn("flex p-1 rounded-xl", theme === 'ocean' ? "bg-slate-900" : "bg-gray-100")}>
            <button onClick={() => setType('expense')} className={cn("flex-1 py-1.5 rounded-lg text-sm font-medium transition-all", type === 'expense' ? "bg-white shadow-sm text-red-600" : "opacity-50")}>Expense</button>
            <button onClick={() => setType('income')} className={cn("flex-1 py-1.5 rounded-lg text-sm font-medium transition-all", type === 'income' ? "bg-white shadow-sm text-green-600" : "opacity-50")}>Income</button>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold opacity-60">Amount</Label>
          <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={cn("text-lg h-12", getInputClass())} />
        </div>
        
        <div className="space-y-1 flex-1">
          <Label className="text-[10px] uppercase font-bold opacity-60">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={cn("h-12", getInputClass())}><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(cat => ( <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem> ))}<SelectItem value="custom">✏️ Custom...</SelectItem></SelectContent>
          </Select>
          {category === "custom" && <Input placeholder="Category name" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className={cn("h-10 mt-2", getInputClass())} />}
        </div>
        
        <Button onClick={handleSave} className="w-full h-10 rounded-xl shadow-lg mt-auto active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Add {type === 'expense' ? 'Expense' : 'Income'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickEntryExpense;
