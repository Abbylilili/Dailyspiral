import { useState, useEffect, useCallback, useRef } from 'react';
import { getExpenses, getMoods, getHabitEntries, getHabits } from '@/app/lib/storage';
import { generateWeeklyInsight, WeeklyInsight } from '@/app/lib/insights';

const useInsightsData = () => {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isFirstLoad = useRef(true);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const [expenses, moods, habitEntries, habits] = await Promise.all([
        getExpenses(),
        getMoods(),
        getHabitEntries(),
        getHabits()
      ]);
      
      const weeklyInsight = generateWeeklyInsight(expenses, moods, habitEntries, habits);
      setInsight(weeklyInsight);
    } finally {
      setIsGenerating(false);
      isFirstLoad.current = false;
    }
  }, []);

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
