import type { FC } from 'react';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { SpiralVisualizer } from "@/app/components/SpiralVisualizer";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import useInsightsData from '@/app/pages/Insights/hooks/useInsightsData/useInsightsData';

const Insights: FC = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { insight, isGenerating, refresh } = useInsightsData();
  const locale = language === 'zh' ? zhCN : enUS;
  
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);

  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         case 'zen': return "bg-white border border-emerald-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl";
         default: return "glass-card border-0 rounded-3xl";
     }
  };

  const mainBtnClass = "bg-black hover:bg-gray-800 text-white rounded-full h-12 px-8 shadow-lg transition-all hover:scale-105 active:scale-95 font-black text-xs tracking-widest uppercase";

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto pt-20 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
            <div className={cn("animate-spin w-16 h-16 border-4 border-t-transparent rounded-full mb-6", theme === 'ocean' ? "border-cyan-500" : theme === 'ink' ? "border-black" : "border-purple-500")} />
            <p className={cn("text-xl font-medium", theme === 'ocean' ? "text-slate-300" : "text-gray-600")}>{t("insights.analyzing")}</p>
        </div>
      </div>
    );
  }
  
  if (!insight) return null;

  // Crucial: Prepare category data with proper lowercased keys for translation
  const categoryData = insight.topCategories.map(cat => {
    const key = cat.category.toLowerCase();
    const translatedName = t(`category.${key}`) !== `category.${key}` ? t(`category.${key}`) : cat.category;
    return {
      name: cat.category,
      translatedName: translatedName,
      value: cat.amount,
      color: theme === 'ocean' ? '#06b6d4' : (theme === 'zen' ? '#10b981' : '#8b5cf6')
    };
  });
  
  const moodTrendIcon = insight.moodTrend === 'improving' ? <TrendingUp className="w-5 h-5 text-green-500" /> : insight.moodTrend === 'declining' ? <TrendingDown className="w-5 h-5 text-red-500" /> : <Minus className={cn("w-5 h-5", theme === 'ocean' ? "text-slate-500" : "text-gray-500")} />;
  const trendText = insight.moodTrend === 'improving' ? t("common.next") : (insight.moodTrend === 'declining' ? t("common.previous") : t("mood.stable"));
  const moodColor = insight.avgMood >= 7 ? 'text-green-600' : insight.avgMood >= 5 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
          theme === 'ink' ? "text-black" :
          theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
          "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>{t("insights.title")}</h2>
        <Button onClick={refresh} className={mainBtnClass}>
          <Sparkles className="w-4 h-4 mr-2" /> {t("insights.generateReport")}
        </Button>
      </div>
      
      <Card className={cn("border-0 shadow-xl overflow-hidden relative", theme === 'ocean' ? "bg-slate-800 text-white" : theme === 'ink' ? "bg-black text-white rounded-xl shadow-[8px_8px_0px_0px_gray]" : theme === 'zen' ? "bg-gradient-to-r from-[#E3FFE9] to-[#FBFFE4] border-0 text-emerald-900 rounded-3xl" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl")}>
        <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none", theme === 'ocean' ? "bg-cyan-500/10" : theme === 'zen' ? "bg-emerald-200/20" : "bg-white/10")}></div>
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl font-bold"><Sparkles className="w-6 h-6" />{t("insights.weeklyReport")}</CardTitle></CardHeader>
        <CardContent><p className="text-lg leading-relaxed font-bold opacity-95">{insight.summary}</p></CardContent>
      </Card>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: t("mood.avgMood"), value: `${insight.avgMood.toFixed(1)}/10`, color: moodColor, extra: moodTrendIcon },
          { label: t("expenses.totalExpense"), value: `$${insight.totalExpenses.toFixed(0)}`, color: "text-red-600" },
          { label: t("expenses.totalIncome"), value: `$${insight.totalIncome.toFixed(0)}`, color: "text-green-600" },
          { label: t("habits.weeklyCompletion"), value: `${insight.habitCompletion.toFixed(0)}%`, color: "text-blue-600" }
        ].map((stat, idx) => (
          <Card key={idx} className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
            <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">{stat.label}</p>
              <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
              {stat.extra && <div className="mt-2">{stat.extra}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className={cn("overflow-hidden", getCardClass())}>
        <CardHeader><CardTitle className="font-black uppercase tracking-tighter text-xl">{t("insights.lifeSpiral")}</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center pb-12">
          <SpiralVisualizer moods={insight.allMoods} habitEntries={insight.allHabitEntries} days={30} /> 
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={cn("flex flex-col", getCardClass())}>
          <CardHeader><CardTitle className="font-black uppercase tracking-tighter text-xl">{t("insights.expenseInsights")}</CardTitle></CardHeader>
          <CardContent className="pt-4">
              <div className="relative h-[280px] w-full mb-4">
                {hoveredCategory && (
                    <div className={cn("absolute top-0 right-0 z-20 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in fade-in zoom-in-95", theme === 'ocean' ? "bg-slate-800/90 border-slate-700 text-white" : "bg-white/90 border-gray-100 text-gray-800")}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredCategory.color }} />
                            <span className="text-xs font-black uppercase tracking-wider">{hoveredCategory.translatedName}</span>
                        </div>
                        <div className="text-2xl font-black">${Number(hoveredCategory.value).toFixed(2)}</div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      dataKey="value" 
                      nameKey="translatedName" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={75} 
                      outerRadius={95} 
                      paddingAngle={4} 
                      stroke="none" 
                      onMouseEnter={(data) => setHoveredCategory(data)} 
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      {categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      formatter={(value) => (
                        <span className={cn("text-[10px] font-black uppercase tracking-widest ml-1", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>
                          {value}
                        </span>
                      )} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-5">
              {categoryData.length > 0 ? categoryData.slice(0, 3).map((cat, index) => {
                  const percentage = insight.totalExpenses > 0 ? (cat.value / insight.totalExpenses) * 100 : 0;
                  return (
                  <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm uppercase flex items-center gap-2">
                          <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px]", 
                            theme === 'ocean' ? "bg-cyan-900 text-cyan-300" : 
                            theme === 'zen' ? "bg-emerald-100 text-emerald-700" : 
                            theme === 'ink' ? "bg-black text-white" :
                            "bg-purple-100 text-purple-600")}>
                            {index + 1}
                          </span>
                          {cat.translatedName}
                        </span>
                        <span className="font-black text-sm">${cat.value.toFixed(2)}</span>
                      </div>
                      <div className={cn("w-full rounded-full h-2", 
                        theme === 'ocean' ? "bg-slate-700" : "bg-slate-100")}>
                        <div className={cn("h-full transition-all duration-1000 rounded-full", 
                          theme === 'ocean' ? "bg-cyan-500" : 
                          theme === 'zen' ? "bg-emerald-500" : 
                          theme === 'ink' ? "bg-black" :
                          "bg-gradient-to-r from-purple-500 to-pink-500")} 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                  </div>
                  );
              }) : <p className="opacity-50 font-bold">{t("insights.noData")}</p>}
              </div>
          </CardContent>
        </Card>
      
        <Card className={cn("h-full flex flex-col", getCardClass())}>
          <CardHeader><CardTitle className="font-black uppercase tracking-tighter text-xl">{t("insights.habitProgress")}</CardTitle></CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insight.dailyData} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                          <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(41, 128, 185)" stopOpacity={1}/><stop offset="100%" stopColor="rgb(44, 62, 80)" stopOpacity={1}/></linearGradient>
                          <linearGradient id="zenGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a7f3d0" stopOpacity={1}/><stop offset="50%" stopColor="#34d399" stopOpacity={1}/><stop offset="100%" stopColor="#059669" stopOpacity={1}/></linearGradient>
                          <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(167, 112, 239)" stopOpacity={1}/><stop offset="50%" stopColor="rgb(207, 139, 243)" stopOpacity={1}/><stop offset="100%" stopColor="rgb(253, 185, 155)" stopOpacity={1}/></linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(str) => format(parseISO(str), 'EEE', { locale })}
                        tick={{ fontSize: 10, fontWeight: '900', fill: theme === 'ocean' ? '#94a3b8' : '#64748b' }} 
                        dy={10} 
                      />
                      <YAxis hide domain={[0, 'dataMax + 2']} />
                      <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                          labelFormatter={(str) => format(parseISO(str), 'PPPP', { locale })}
                          formatter={(v: any, n: any, p: any) => [`${v}/${p.payload.totalHabits}`, t("habits.habit")]}
                      />
                      <Bar dataKey="completedHabits" radius={[4, 4, 4, 4]} barSize={32}>
                          <LabelList 
                              dataKey="completedHabits" 
                              position="top" 
                              content={(props: any) => {
                                  const { x, y, width, value, index } = props;
                                  const total = insight.dailyData[index].totalHabits;
                                  return <text x={x + width / 2} y={y - 10} fill={theme === 'ocean' ? '#94a3b8' : '#64748b'} fontSize={10} textAnchor="middle" fontWeight="900">{value}/{total}</text>;
                              }}
                          />
                          {insight.dailyData.map((entry, index) => ( 
                            <Cell key={`cell-${index}`} fill={theme === 'ocean' ? 'url(#oceanGradient)' : theme === 'ink' ? '#000' : theme === 'zen' ? 'url(#zenGradient)' : 'url(#defaultGradient)'} /> 
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className={cn("border-0", getCardClass(), theme === 'ocean' ? "bg-slate-800/80" : theme === 'zen' ? "bg-emerald-50/50" : "bg-slate-50")}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter text-xl"><Sparkles className="w-5 h-5 text-purple-500" />{t("insights.recommendations")}</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-4">
              {insight.recommendations.map((rec, index) => ( 
                <li key={index} className={cn("flex items-start gap-4 p-5 rounded-2xl shadow-sm border transition-all hover:scale-[1.01]", 
                  theme === 'ocean' ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-100")}>
                  <span className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                    theme === 'ocean' ? "bg-cyan-900 text-cyan-300" : 
                    theme === 'zen' ? "bg-emerald-100 text-emerald-700" :
                    theme === 'ink' ? "bg-black text-white" :
                    "bg-purple-600 text-white shadow-lg shadow-purple-200")}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm font-bold leading-relaxed">{rec}</span>
                </li> 
              ))}
            </ul>
          </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
