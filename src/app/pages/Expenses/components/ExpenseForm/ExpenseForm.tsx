import type { FC } from 'react';
import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Calendar } from "@/app/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from "@/app/contexts/ThemeContext";
import type { ExpenseEntry } from "@/app/lib/storage";
import { CATEGORIES } from '@/app/pages/Expenses/constants';

interface ExpenseFormProps {
  initialData?: ExpenseEntry;
  onSave: (expense: ExpenseEntry) => Promise<void>;
  onClose: () => void;
}

const ExpenseForm: FC<ExpenseFormProps> = ({ initialData, onSave, onClose }) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState(initialData?.amount.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "food");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<'expense' | 'income'>(initialData?.type || 'expense');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "custom" ? (customCategory.trim() || "Custom") : category;
    await onSave({
      id: initialData?.id || `${Date.now()}`,
      date,
      amount: parseFloat(amount),
      category: finalCategory,
      description,
      type,
    });
    onClose();
  };

  const getInputClass = () => theme === 'ocean' ? "bg-slate-900/60 border-0 text-white rounded-xl" : "bg-white/50 border-0 rounded-xl";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-2">
      <div className="space-y-2">
        <Label>Type</Label>
        <div className={cn("flex p-1 rounded-xl", theme === 'ocean' ? "bg-slate-900" : "bg-gray-100")}>
          <button type="button" onClick={() => setType('expense')} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", type === 'expense' ? "bg-white shadow-sm text-red-600" : "opacity-50")}>Expense</button>
          <button type="button" onClick={() => setType('income')} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", type === 'income' ? "bg-white shadow-sm text-green-600" : "opacity-50")}>Income</button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amount ($)</Label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className={cn("text-2xl h-14 text-center font-bold", getInputClass())} />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className={cn("h-12", getInputClass())}><SelectValue /></SelectTrigger>
          <SelectContent className={theme === 'ocean' ? "bg-slate-800 text-white" : ""}>
            {CATEGORIES.map(cat => ( <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem> ))}
            <SelectItem value="custom">✏️ Custom...</SelectItem>
          </SelectContent>
        </Select>
        {category === "custom" && <Input placeholder="Enter category name" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className={cn("h-12 mt-2", getInputClass())} autoFocus />}
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full h-12 justify-start font-normal", getInputClass())}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(parseISO(date), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0"><Calendar mode="single" selected={parseISO(date)} onSelect={(d) => d && setDate(format(d, 'yyyy-MM-dd'))} initialFocus /></PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg">Save Transaction</Button>
    </form>
  );
};

export default ExpenseForm;
