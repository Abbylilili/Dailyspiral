import type { FC } from 'react';
import { useState } from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/app/components/ui/dialog";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import ExpenseForm from './ExpenseForm';
import type { ExpenseEntry } from "@/app/lib/storage";

interface ExpenseHeaderProps {
  onAdd: (expense: ExpenseEntry) => Promise<void>;
}

const ExpenseHeader: FC<ExpenseHeaderProps> = ({ onAdd }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getButtonClass = () => {
      switch(theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400";
          case 'ink': return "bg-black text-white hover:bg-gray-800 border-2 border-transparent active:border-black rounded-lg";
          default: return "bg-black text-white hover:bg-gray-800 shadow-lg";
      }
  };

  const getDialogClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800 border border-white/10 text-white shadow-2xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl";
          default: return "glass-card bg-white/80 backdrop-blur-2xl border-white/20 shadow-2xl sm:rounded-3xl";
      }
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
          theme === 'ink' ? "text-black font-['Rubik_Dirt'] tracking-wider" :
          theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
          "bg-gradient-to-r from-purple-600 to-pink-600"
      )}>Expenses</h2>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className={cn("relative flex items-center justify-center rounded-full h-12 px-6 transition-transform active:scale-95 w-48", getButtonClass())}>
            <Plus className="absolute left-5 w-5 h-5" />
            <span>Add Record</span>
          </Button>
        </DialogTrigger>
        <DialogContent className={cn("max-w-md", getDialogClass())}>
          <DialogHeader>
            <DialogTitle className={cn(theme === 'ocean' && "text-white")}>Add Transaction</DialogTitle>
            <DialogDescription className={cn(theme === 'ocean' && "text-slate-400")}>Record your income or expense</DialogDescription>
          </DialogHeader>
          <ExpenseForm onSave={onAdd} onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseHeader;
