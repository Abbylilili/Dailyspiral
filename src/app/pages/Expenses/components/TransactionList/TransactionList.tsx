import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import type { ExpenseEntry } from "@/app/lib/storage";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { CATEGORIES, getChartColor } from '@/app/pages/Expenses/constants';
import { EmptyStateDaisy } from '@/app/pages/Expenses/components/EmptyState';

interface TransactionListProps {
  expenses: ExpenseEntry[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (expense: ExpenseEntry) => Promise<void>;
}

const TransactionList: FC<TransactionListProps> = ({ expenses, onDelete }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         default: return "glass-card border-0 rounded-[2.5rem]";
     }
  };

  return (
    <Card className={cn("shadow-lg mb-4", getCardClass())}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("font-black uppercase tracking-tighter text-lg", theme === 'ocean' && "text-white")}>
          {t("expenses.recentTransactions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {expenses.length === 0 ? (
            <div className="text-center py-6">
                <EmptyStateDaisy />
                <p className={cn("mb-1 text-xs font-bold opacity-50", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>
                  {t("expenses.noTransactions")}
                </p>
            </div>
        ) : (
            <div className="space-y-1">
              {expenses.slice(0, 5).map((expense, index) => {
                const cat = CATEGORIES.find(c => c.value === expense.category);
                const isCustom = !cat;
                const displayName = isCustom ? expense.category : t(`category.${expense.category}`);
                const firstLetter = displayName.charAt(0).toUpperCase();
                const color = getChartColor(isCustom ? index : CATEGORIES.findIndex(c => c.value === expense.category), theme);
                const isZenTheme = theme === 'zen'; 
                
                return (
                  <div key={expense.id} className={cn("relative flex items-center justify-between py-3.5 px-4 transition-all duration-200 group overflow-hidden mb-2 border", theme === 'ocean' ? "bg-white/5 hover:bg-white/10 border-white/5 rounded-2xl" : theme === 'ink' ? "bg-transparent border-b border-gray-200 hover:bg-gray-50 rounded-none px-2 mb-0" : isZenTheme ? "hover:brightness-95 border-0 shadow-sm rounded-2xl" : "hover:bg-white/60 bg-white/40 border-transparent rounded-2xl shadow-sm")}>
                    <div className={cn("flex items-center gap-3", isZenTheme && "ml-3")}>
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-105", theme === 'ink' && "border border-black rounded-lg w-8 h-8 text-sm font-bold")} style={{ background: theme === 'ink' ? '#fff' : (isZenTheme ? '#f5f5f4' : `${color}20`), color: theme === 'ink' ? '#000' : color }}>
                         {cat ? cat.icon : firstLetter}
                      </div>
                      <div>
                        <p className={cn("font-black text-sm uppercase tracking-tight", theme === 'ocean' ? "text-slate-200" : (isZenTheme ? "text-slate-700" : "text-gray-800"))}>{displayName}</p>
                        <p className={cn("text-[10px] font-black mt-0.5 uppercase opacity-40", theme === 'ocean' ? "text-slate-500" : (isZenTheme ? "text-slate-500" : "text-muted-foreground"))}>{format(new Date(expense.date), 'MMM dd')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn("font-black text-sm mr-2", expense.type === 'expense' ? 'text-red-500' : 'text-green-600')}>
                        {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {expenses.length > 5 && (
                <div className="pt-2 flex justify-center">
                  <Dialog 
                    open={isHistoryOpen} 
                    onOpenChange={setIsHistoryOpen}
                    trigger={<Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest rounded-full h-8 px-6 hover:bg-black/5">{t("common.total")}</Button>}
                    title={t("expenses.transactions")}
                    className="max-w-2xl max-h-[80vh] overflow-y-auto"
                  >
                    <div className="space-y-2 mt-4">
                      {expenses.map(expense => (
                        <div key={expense.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-black text-sm uppercase">{t(`category.${expense.category}`) || expense.category}</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase">{format(new Date(expense.date), 'PPP')}</p>
                          </div>
                          <span className={cn("font-black text-sm", expense.type === 'expense' ? "text-red-500" : "text-green-600")}>
                            {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Dialog>
                </div>
              )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
