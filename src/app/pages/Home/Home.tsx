import type { FC } from 'react';
import useHomeData from './hooks/useHomeData';
import DailyQuote from './components/DailyQuote';
import QuickEntryMood from './components/QuickEntryMood';
import QuickEntryExpense from './components/QuickEntryExpense';
import TodayHabits from './components/TodayHabits';
import { Card, CardContent } from '@/app/components/ui/card';
import { Link } from 'react-router';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/app/components/ui/utils';

const Home: FC = () => {
  const { moods, habits, expenses, isLoading, refresh, toggleHabit, today } = useHomeData();
  const { theme } = useTheme();

  // Theme helper defined inside to avoid hook rules issues if it were a component
  const getBottomCardStyle = (type: 'expense' | 'habit' | 'insight') => {
      if (theme === 'ink') {
          return type === 'expense' 
            ? "bg-black border-black text-white rounded-xl shadow-[4px_4px_0px_0px_gray]"
            : "bg-white border-black text-black rounded-xl shadow-[4px_4px_0px_0px_black]";
      }
      if (theme === 'zen') {
          switch(type) {
              case 'expense': return "bg-[#FFF7ED] text-[#9A3412] rounded-2xl";
              case 'habit': return "bg-[#EFF6FF] text-[#1E40AF] rounded-2xl";
              case 'insight': return "bg-[#FAF5FF] text-[#6B21A8] rounded-2xl";
          }
      }
      switch(type) {
          case 'expense': return "bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl text-white shadow-lg";
          case 'habit': return "bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl text-white shadow-lg";
          case 'insight': return "bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl text-white shadow-lg";
      }
      return "";
  };

  const todayMood = moods.find(m => m.date === today);
  const thisMonthExpenses = (expenses || []).filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.type === 'expense';
  });
  const monthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const completedCount = habits.filter(h => h.completed).length;
  const habitProgress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      <DailyQuote moodScore={todayMood?.mood || 0} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickEntryMood initialMood={todayMood?.mood || 5} date={today} onRefresh={refresh} />
        <QuickEntryExpense date={today} onRefresh={refresh} />
      </div>

      <TodayHabits habits={habits} onToggle={toggleHabit} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/expenses">
          <Card className={cn("border-0 h-32 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] active:scale-95", getBottomCardStyle('expense'))}>
            <p className="text-xs font-bold uppercase opacity-70 mb-1">Monthly Spending</p>
            <p className="text-2xl font-black">${monthTotal.toFixed(0)}</p>
          </Card>
        </Link>
        
        <Link to="/habits">
          <Card className={cn("border-0 h-32 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] active:scale-95", getBottomCardStyle('habit'))}>
            <p className="text-xs font-bold uppercase opacity-70 mb-1">Today's Progress</p>
            <p className="text-2xl font-black">{habitProgress.toFixed(0)}%</p>
          </Card>
        </Link>
        
        <Link to="/insights" className="col-span-2 md:col-span-1">
          <Card className={cn("border-0 h-32 flex items-center justify-center text-center transition-transform hover:scale-[1.02] active:scale-95", getBottomCardStyle('insight'))}>
            <p className="text-2xl font-black">Explore Insights ✨</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Home;
