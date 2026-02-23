import type { FC } from 'react';
import useHomeData from '@/app/pages/Home/hooks/useHomeData/useHomeData';
import DailyQuote from '@/app/pages/Home/components/DailyQuote/DailyQuote';
import QuickEntryMood from '@/app/pages/Home/components/QuickEntryMood/QuickEntryMood';
import QuickEntryExpense from '@/app/pages/Home/components/QuickEntryExpense/QuickEntryExpense';
import TodayHabits from '@/app/pages/Home/components/TodayHabits/TodayHabits';
import SummaryCard from '@/app/pages/Home/components/SummaryCard/SummaryCard';
import { cn } from '@/app/components/ui/utils';

const Home: FC = () => {
  const { moods, habits, expenses, refresh, toggleHabit, today } = useHomeData();

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
    <div className="space-y-10 max-w-6xl mx-auto p-8">
      <DailyQuote moodScore={todayMood?.mood || 0} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickEntryMood 
          key={`mood-${todayMood?.mood || 'none'}-${today}`}
          initialMood={todayMood?.mood || 5} 
          date={today} 
          onRefresh={refresh} 
        />
        <QuickEntryExpense date={today} onRefresh={refresh} />
      </div>

      <div className="w-full">
        <TodayHabits habits={habits} onToggle={toggleHabit} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
        <SummaryCard 
          title="Monthly Spending" 
          value={`$${monthTotal.toFixed(0)}`} 
          linkTo="/expenses" 
          type="expense" 
        />
        <SummaryCard 
          title="Today's Progress" 
          value={`${habitProgress.toFixed(0)}%`} 
          linkTo="/habits" 
          type="habit" 
        />
        <SummaryCard 
          title="Click to View" 
          value="Explore Insights ✨" 
          linkTo="/insights" 
          type="insight" 
        />
      </div>
    </div>
  );
};

export default Home;
