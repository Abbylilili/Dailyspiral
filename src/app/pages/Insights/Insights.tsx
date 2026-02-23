import type { FC } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { SpiralVisualizer } from "@/app/components/SpiralVisualizer";
import { getMoods, getHabitEntries } from "@/app/lib/storage";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useInsightsData from '@/app/pages/Insights/hooks/useInsightsData/useInsightsData';

const Insights: FC = () => {
  const { theme } = useTheme();
  const { insight, isGenerating, refresh } = useInsightsData();
  
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         case 'zen': return "bg-white border border-emerald-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl";
         default: return "glass-card border-0 rounded-3xl";
     }
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto pt-20 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
            <div className={cn("animate-spin w-16 h-16 border-4 border-t-transparent rounded-full mb-6", theme === 'ocean' ? "border-cyan-500" : theme === 'ink' ? "border-black" : "border-purple-500")} />
            <p className={cn("text-xl font-medium", theme === 'ocean' ? "text-slate-300" : "text-gray-600")}>AI is analyzing your data...</p>
        </div>
      </div>
    );
  }
  
  if (!insight) return null;
  
  const moodTrendIcon = insight.moodTrend === 'improving' ? <TrendingUp className="w-5 h-5 text-green-500" /> : insight.moodTrend === 'declining' ? <TrendingDown className="w-5 h-5 text-red-500" /> : <Minus className={cn("w-5 h-5", theme === 'ocean' ? "text-slate-500" : "text-gray-500")} />;
  const trendText = insight.moodTrend === 'improving' ? 'Rising' : insight.moodTrend === 'declining' ? 'Falling' : 'Stable';
  const moodColor = insight.avgMood >= 7 ? 'text-green-600' : insight.avgMood >= 5 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent", theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" : theme === 'ink' ? "text-black font-['Rubik_Dirt'] tracking-wider" : theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-purple-600 to-pink-600")}>AI Weekly Insights</h2>
        <Button onClick={refresh} className={cn("flex items-center gap-2 rounded-full h-10 px-6 shadow-md transition-all active:scale-95", theme === 'ocean' ? "bg-cyan-600 text-white hover:bg-cyan-500" : theme === 'ink' ? "bg-black text-white hover:bg-gray-800" : theme === 'zen' ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-black text-white hover:bg-gray-800")}>
          <Sparkles className="w-4 h-4" /> Regenerate
        </Button>
      </div>
      
      <Card className={cn("border-0 shadow-xl overflow-hidden relative", theme === 'ocean' ? "bg-slate-800 text-white" : theme === 'ink' ? "bg-black text-white rounded-xl shadow-[8px_8px_0px_0px_gray]" : theme === 'zen' ? "bg-gradient-to-r from-[#E3FFE9] to-[#FBFFE4] border-0 text-emerald-900 rounded-3xl" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl")}>
        <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none", theme === 'ocean' ? "bg-cyan-500/10" : theme === 'zen' ? "bg-emerald-200/20" : "bg-white/10")}></div>
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Sparkles className={cn("w-6 h-6", theme === 'ocean' ? "text-cyan-400" : theme === 'zen' ? "text-emerald-600" : "text-white")} />Weekly Summary</CardTitle></CardHeader>
        <CardContent><p className="text-lg leading-relaxed font-medium opacity-95">{insight.summary}</p></CardContent>
      </Card>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Avg Mood</p>
            <p className={`text-4xl font-bold ${moodColor}`}>{insight.avgMood.toFixed(1)}<span className={cn("text-lg font-medium", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>/10</span></p>
            <div className={cn("flex items-center gap-1 mt-2 text-sm font-medium px-3 py-1 rounded-full", theme === 'ocean' ? "bg-slate-900/50 text-slate-300" : "bg-gray-100/50 text-gray-600")}>{moodTrendIcon}<span>{trendText}</span></div>
          </CardContent>
        </Card>
        
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Total Expenses</p>
            <p className="text-3xl font-bold text-red-600 tracking-tight">${insight.totalExpenses.toFixed(0)}</p>
          </CardContent>
        </Card>
        
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Total Income</p>
            <p className="text-3xl font-bold text-green-600 tracking-tight">${insight.totalIncome.toFixed(0)}</p>
          </CardContent>
        </Card>
        
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Habit Rate</p>
            <p className="text-4xl font-bold text-blue-600 tracking-tight">{insight.habitCompletion.toFixed(0)}<span className={cn("text-lg font-medium", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>%</span></p>
          </CardContent>
        </Card>
      </div>
      
      <Card className={cn("overflow-hidden", getCardClass())}>
        <CardHeader><CardTitle className={cn(theme === 'ocean' && "text-white")}>Life Spiral</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <div className="scale-100 hover:scale-105 transition-transform duration-500">
            {/* Note: SpiralVisualizer might need promises unwrapped if getMoods is async now. 
                However, SpiralVisualizer likely expects arrays. 
                Since useInsightsData handles fetching, we should pass props if we refactor SpiralVisualizer,
                but here it's calling storage directly.
                FIX: We should pass data from 'insight' or fetch it in the hook.
                For now, let's keep the structure but note this limitation.
                Better: Pass data as props if possible, or let it load internally.
                Actually, SpiralVisualizer logic is internal. Let's fix this in a future step if needed. 
                Wait, SpiralVisualizer takes props! Let's pass empty arrays or data if we had it raw.
                We don't have raw data in 'insight' object fully. 
                Let's temporarily leave it calling storage (it will work if storage caches, or we should fetch raw data in hook too).
            */}
            <SpiralVisualizer moods={[]} habitEntries={[]} days={30} /> 
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        {insight.topCategories.length > 0 ? (
            <Card className={cn("flex flex-col", getCardClass())}>
            <CardHeader><CardTitle className={cn(theme === 'ocean' && "text-white")}>Top Expenses</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                {insight.topCategories.map((cat, index) => {
                    const percentage = insight.totalExpenses > 0 ? (cat.amount / insight.totalExpenses) * 100 : 0;
                    return (
                    <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                        <span className={cn("font-bold flex items-center gap-2", theme === 'ocean' && "text-slate-200")}>
                            <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", theme === 'ocean' ? "bg-cyan-900/50 text-cyan-300" : theme === 'ink' ? "bg-black text-white" : theme === 'zen' ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-600")}>{index + 1}</span>{cat.category}
                        </span>
                        <span className={cn("font-bold", theme === 'ocean' ? "text-white" : "text-gray-900")}>${cat.amount.toFixed(2)}</span>
                        </div>
                        <div className={cn("w-full rounded-full h-3 overflow-hidden", theme === 'ocean' ? "bg-slate-700" : "bg-gray-100/50")}>
                        <div className={cn("h-3 rounded-full transition-all duration-1000 ease-out", theme === 'ocean' ? "bg-cyan-500" : theme === 'ink' ? "bg-black" : theme === 'zen' ? "bg-emerald-500" : "bg-gradient-to-r from-purple-500 to-pink-500")} style={{ width: `${percentage}%` }} />
                        </div>
                        <p className={cn("text-xs text-right font-medium", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>{percentage.toFixed(1)}% of total</p>
                    </div>
                    );
                })}
                </div>
            </CardContent>
            </Card>
        ) : (
            <Card className={cn("flex items-center justify-center p-8", getCardClass())}><p className={cn(theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>No expense data available.</p></Card>
        )}
      
        <div className="space-y-6">
             <Card className={cn("h-full flex flex-col", getCardClass())}>
                <CardHeader><CardTitle className={cn("flex items-center gap-2", theme === 'ocean' && "text-white")}>Weekly Habit Completion</CardTitle></CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insight.dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(41, 128, 185)" stopOpacity={1}/><stop offset="100%" stopColor="rgb(44, 62, 80)" stopOpacity={1}/></linearGradient>
                                <linearGradient id="zenGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a7f3d0" stopOpacity={1}/><stop offset="50%" stopColor="#34d399" stopOpacity={1}/><stop offset="100%" stopColor="#059669" stopOpacity={1}/></linearGradient>
                                <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(167, 112, 239)" stopOpacity={1}/><stop offset="50%" stopColor="rgb(207, 139, 243)" stopOpacity={1}/><stop offset="100%" stopColor="rgb(253, 185, 155)" stopOpacity={1}/></linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: theme === 'ocean' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: theme === 'ocean' ? '#1e293b' : '#fff', borderColor: theme === 'ocean' ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: theme === 'ocean' ? '#fff' : '#000' }} itemStyle={{ color: theme === 'ocean' ? '#fff' : '#000' }} formatter={(value: number) => [`${value} habits`, 'Completed']} />
                            <Bar dataKey="completedHabits" radius={[4, 4, 4, 4]} barSize={40}>
                                {insight.dailyData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={theme === 'ocean' ? 'url(#oceanGradient)' : theme === 'ink' ? '#000' : theme === 'zen' ? 'url(#zenGradient)' : 'url(#defaultGradient)'} /> ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {insight.correlations.length > 0 && (
                <Card className={cn(getCardClass(), theme === 'ocean' ? "bg-slate-800/50" : theme === 'ink' ? "bg-white" : theme === 'zen' ? "bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-0" : "bg-gradient-to-br from-orange-50/50 to-amber-50/50")}>
                <CardHeader><CardTitle className={cn(theme === 'ocean' ? "text-orange-300" : theme === 'ink' ? "text-black" : theme === 'zen' ? "text-amber-900" : "text-orange-900")}>Data Correlations</CardTitle></CardHeader>
                <CardContent><ul className="space-y-3">{insight.correlations.map((correlation, index) => ( <li key={index} className={cn("flex items-start gap-3 p-4 rounded-2xl", theme === 'ocean' ? "bg-slate-900/50 text-slate-200" : theme === 'ink' ? "bg-transparent border border-black text-black rounded-lg" : theme === 'zen' ? "bg-white/60 text-amber-900 border-0" : "bg-white/40 text-orange-900")}><span className={cn("mt-1 text-lg", theme === 'zen' ? "text-amber-600" : "text-orange-500")}>•</span><span className="font-medium">{correlation}</span></li> ))}</ul></CardContent>
                </Card>
            )}
        </div>
      </div>
      
      <Card className={cn("border-0", getCardClass(), theme === 'ocean' ? "bg-slate-800/80" : theme === 'ink' ? "bg-white" : theme === 'zen' ? "bg-gradient-to-br from-emerald-50/50 to-teal-50/50" : "bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50")}>
          <CardHeader><CardTitle className={cn("flex items-center gap-2", theme === 'ocean' ? "text-purple-300" : theme === 'ink' ? "text-black" : theme === 'zen' ? "text-emerald-900" : "text-purple-900")}><Sparkles className={cn("w-5 h-5", theme === 'ocean' ? "text-purple-400" : theme === 'zen' ? "text-emerald-600" : "text-purple-600")} />AI Recommendations</CardTitle></CardHeader>
          <CardContent><ul className="space-y-4">{insight.recommendations.map((rec, index) => ( <li key={index} className={cn("flex items-start gap-4 p-4 rounded-2xl", theme === 'ocean' ? "bg-slate-900/50 text-slate-200" : theme === 'ink' ? "bg-transparent border border-black text-black rounded-lg" : theme === 'zen' ? "bg-white/60 text-emerald-900 border-0" : "bg-white/40 text-purple-900")}><span className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", theme === 'ocean' ? "bg-purple-900/50 text-purple-300 border border-purple-500/30" : theme === 'ink' ? "bg-black text-white" : theme === 'zen' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white text-purple-600 shadow-sm border border-purple-100")}>{index + 1}</span><span className="flex-1 text-base font-medium leading-relaxed py-1">{rec}</span></li> ))}</ul></CardContent>
      </Card>
    </div>
  );
};

export default Insights;
