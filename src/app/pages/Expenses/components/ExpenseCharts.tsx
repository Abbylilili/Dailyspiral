import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import type { ExpenseEntry } from "@/app/lib/storage";
import { CATEGORIES, getChartColor } from '../constants';
import DaisyAnimation from '../animations/DaisyAnimation';
import PandaAnimation from '../animations/PandaAnimation';
import BambooAnimation from '../animations/BambooAnimation';
import ZenRainAnimation from '../animations/ZenRainAnimation';
import WaveAnimation from '../animations/WaveAnimation';

interface ExpenseChartsProps {
  expenses: ExpenseEntry[];
  thisMonthExpenses: ExpenseEntry[];
}

const ExpenseCharts: FC<ExpenseChartsProps> = ({ expenses, thisMonthExpenses }) => {
  const { theme } = useTheme();
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
         default: return "glass-card border-0 rounded-[2rem]";
     }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardHeader className="pb-0"><CardTitle className={cn(theme === 'ocean' && "text-white")}>Spending by Category</CardTitle></CardHeader>
        <CardContent>
          <div className="relative h-[250px] w-full">
            <PandaAnimation /><DaisyAnimation /><BambooAnimation /><ZenRainAnimation /><WaveAnimation />
            
            {hoveredCategory && (
                <div className={cn("absolute top-0 right-0 z-20 p-3 rounded-xl shadow-lg border backdrop-blur-sm animate-in fade-in zoom-in-95", theme === 'ocean' ? "bg-slate-800/90 border-slate-700 text-white" : "bg-white/90 border-gray-100 text-gray-800")}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredCategory.color }} />
                        <span className="text-sm font-semibold">{hoveredCategory.name}</span>
                    </div>
                    <div className="text-xl font-bold">${Number(hoveredCategory.value).toFixed(2)}</div>
                    <div className={cn("text-xs mt-0.5", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>
                        {((hoveredCategory.value / (expenses.reduce((acc, curr) => acc + curr.amount, 0) || 1)) * 100).toFixed(1)}% of total
                    </div>
                </div>
            )}

            <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} stroke={theme === 'ocean' ? "rgba(0,0,0,0)" : "#fff"} onMouseEnter={(data) => setHoveredCategory(data)} onMouseLeave={() => setHoveredCategory(null)}>
                  {categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className={cn("text-xs font-medium ml-1", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
        <CardHeader className="pb-0"><CardTitle className={cn(theme === 'ocean' && "text-white")}>Spending Details</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'ocean' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tickFormatter={(val) => val.split(' ')[0]} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#666' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#666' }} />
              <Tooltip cursor={{fill: theme === 'ocean' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: theme === 'ocean' ? '#1e293b' : '#fff', color: theme === 'ocean' ? '#fff' : '#000' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCharts;
