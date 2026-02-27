import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import type { ExpenseEntry } from "@/app/lib/storage";
import { CATEGORIES, getChartColor } from '@/app/pages/Expenses/constants';
import DaisyAnimation from '@/app/pages/Expenses/animations/DaisyAnimation';
import PandaAnimation from '@/app/pages/Expenses/animations/PandaAnimation';
import BambooAnimation from '@/app/pages/Expenses/animations/BambooAnimation';
import ZenRainAnimation from '@/app/pages/Expenses/animations/ZenRainAnimation';
import WaveAnimation from '@/app/pages/Expenses/animations/WaveAnimation';

interface ExpenseChartsProps {
  expenses: ExpenseEntry[];
  thisMonthExpenses: ExpenseEntry[];
}

const ExpenseCharts: FC<ExpenseChartsProps> = ({ expenses, thisMonthExpenses }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);

  const categoryMap = new Map<string, { value: number, color: string, label: string }>();
  thisMonthExpenses.filter(e => e.type === 'expense').forEach((e) => {
      const predefined = CATEGORIES.find(c => c.value === e.category);
      const key = e.category;
      const color = getChartColor(Array.from(categoryMap.keys()).length, theme);
      const current = categoryMap.get(key) || { value: 0, color: color, label: predefined ? predefined.label : e.category };
      current.value += e.amount;
      categoryMap.set(key, current);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([key, data]) => ({
      name: data.label,
      value: data.value,
      color: data.color
  })).sort((a, b) => b.value - a.value);

  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         default: return "glass-card border-0 rounded-[2.5rem]";
     }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardHeader className="pb-2">
          <CardTitle className={cn("font-black uppercase tracking-tighter text-lg", theme === 'ocean' && "text-white")}>
            {t("expenses.categoryBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative h-[280px] w-full">
            <PandaAnimation /><DaisyAnimation /><BambooAnimation /><ZenRainAnimation /><WaveAnimation />
            
            {hoveredCategory && (
                <div className={cn("absolute top-0 right-0 z-20 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in fade-in zoom-in-95", theme === 'ocean' ? "bg-slate-800/90 border-slate-700 text-white" : "bg-white/90 border-gray-100 text-gray-800")}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredCategory.color }} />
                        <span className="text-xs font-black uppercase tracking-wider">{hoveredCategory.name}</span>
                    </div>
                    <div className="text-2xl font-black">${Number(hoveredCategory.value).toFixed(2)}</div>
                    <div className={cn("text-[10px] font-bold mt-1 opacity-60 uppercase", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>
                        {((hoveredCategory.value / (thisMonthExpenses.filter(ex => ex.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0) || 1)) * 100).toFixed(1)}% of total
                    </div>
                </div>
            )}

            <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={4} stroke="none" onMouseEnter={(data) => setHoveredCategory(data)} onMouseLeave={() => setHoveredCategory(null)}>
                  {categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className={cn("text-[10px] font-black uppercase tracking-widest ml-1", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardHeader className="pb-2">
          <CardTitle className={cn("font-black uppercase tracking-tighter text-lg", theme === 'ocean' && "text-white")}>
            {t("expenses.transactions").toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-10">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'ocean' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tickFormatter={(val) => val.split(' ')[0]} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: '900' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: '900' }} width={50} />
              <Tooltip cursor={{fill: theme === 'ocean' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: theme === 'ocean' ? '#1e293b' : '#fff', color: theme === 'ocean' ? '#fff' : '#000' }} itemStyle={{ fontWeight: '900', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>{categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCharts;
