import { useState, useEffect, useCallback, useRef } from 'react';
import { getExpenses, getMoods, getHabitEntries, getHabits, getDailyPlans } from '@/app/lib/storage';
import { generateWeeklyInsight, WeeklyInsight } from '@/app/lib/insights';
import { useLanguage } from '@/app/contexts/LanguageContext';

const useInsightsData = () => {
  const { language } = useLanguage();
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isFirstLoad = useRef(true);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const [expenses, moods, habitEntries, habits, plans] = await Promise.all([
        getExpenses(),
        getMoods(),
        getHabitEntries(),
        getHabits(),
        getDailyPlans()
      ]);
      
      const weeklyInsight = generateWeeklyInsight(expenses, moods, habitEntries, habits, plans, language);
      setInsight(weeklyInsight);
    } finally {
      setIsGenerating(false);
      isFirstLoad.current = false;
    }
  }, [language]);

  useEffect(() => {
    generate();
  }, [generate]);

  return {
    insight,
    isGenerating: isGenerating && isFirstLoad.current,
    refresh: generate
  };
};

export default useInsightsData;
