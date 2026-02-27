import type { FC } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";

interface SummaryCardsProps {
  totals: {
    totalExpense: number;
    totalIncome: number;
    balance: number;
    percentageChange: number;
    count: number;
  };
}

const SummaryCards: FC<SummaryCardsProps> = ({ totals }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         default: return "glass-card border-0 rounded-[2rem]";
     }
  };

  const labelClass = "text-[10px] font-black uppercase tracking-widest opacity-50 mb-2";
  const valueClass = "text-2xl font-black tracking-tighter";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-red-900/30" : "bg-red-50")}>
              <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className={labelClass}>{t("expenses.expense")}</p>
          <p className={cn(valueClass, "text-red-600")}>${totals.totalExpense.toFixed(0)}</p>
        </CardContent>
      </Card>

      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-green-900/30" : "bg-green-50")}>
              <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className={labelClass}>{t("expenses.income")}</p>
          <p className={cn(valueClass, "text-green-600")}>${totals.totalIncome.toFixed(0)}</p>
        </CardContent>
      </Card>

      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-blue-900/30" : "bg-blue-50")}>
              <div className="w-5 h-5 text-blue-500 font-black">$</div>
          </div>
          <p className={labelClass}>{t("expenses.balance")}</p>
          <p className={cn(valueClass, totals.balance >= 0 ? "text-green-600" : "text-red-600")}>
            ${totals.balance.toFixed(0)}
          </p>
        </CardContent>
      </Card>

      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-purple-900/30" : "bg-purple-50")}>
              <div className="w-5 h-5 text-purple-500 font-black">#</div>
          </div>
          <p className={labelClass}>{t("common.total")}</p>
          <p className={valueClass}>{totals.count}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
