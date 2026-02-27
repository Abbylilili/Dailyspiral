import type { FC } from 'react';
import { useState } from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import ExpenseForm from '@/app/pages/Expenses/components/ExpenseForm';
import type { ExpenseEntry } from "@/app/lib/storage";

interface ExpenseHeaderProps {
  onAdd: (expense: ExpenseEntry) => Promise<void>;
}

const ExpenseHeader: FC<ExpenseHeaderProps> = ({ onAdd }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const getButtonClass = () => {
      // Standardized black button for consistency
      return "bg-black hover:bg-gray-800 text-white rounded-full h-12 px-8 shadow-lg transition-all hover:scale-105 active:scale-95 font-black text-xs tracking-widest uppercase";
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className={cn("text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
          theme === 'ink' ? "text-black" :
          theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
          "bg-gradient-to-r from-purple-600 to-pink-600"
      )}>{t("nav.expenses")}</h2>
      
      <Dialog 
        open={isOpen} 
        onOpenChange={setIsOpen}
        trigger={
          <Button className={cn("relative flex items-center justify-center transition-all w-48", getButtonClass())}>
            <Plus className="absolute left-5 w-5 h-5" />
            <span>{t("expenses.addRecord").toUpperCase()}</span>
          </Button>
        }
        title={t("expenses.addRecord")}
        description={t("expenses.subtitle")}
        className="max-w-md"
      >
        <ExpenseForm onSave={onAdd} onClose={() => setIsOpen(false)} />
      </Dialog>
    </div>
  );
};

export default ExpenseHeader;
