import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { getMoods, getHabits, isHabitCompleted, getExpenses, toggleHabitEntry } from '@/app/lib/storage';
import type { MoodEntry, Habit, ExpenseEntry } from '@/app/lib/storage';

const useHomeData = () => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const loadAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [m, h, e] = await Promise.all([
        getMoods(),
        getHabits(),
        getExpenses()
      ]);
      
      const processedHabits = await Promise.all((h || []).map(async habit => {
        const completed = await isHabitCompleted(habit.id, today);
        return { ...habit, completed };
      }));

      setMoods(m || []);
      setHabits(processedHabits || []);
      setExpenses(e || []);
    } catch (err) {
      console.error("Home data load error:", err);
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, [today]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleHabit = async (id: string) => {
    await toggleHabitEntry(id, today);
    await loadAll(true);
  };

  return {
    moods,
    habits,
    expenses,
    isLoading: isLoading && isFirstLoad.current,
    refresh: () => loadAll(true),
    toggleHabit,
    today
  };
};

export default useHomeData;
