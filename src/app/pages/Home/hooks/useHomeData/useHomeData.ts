import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { getMoods, getHabits, getHabitEntries, getExpenses, toggleHabitEntry, DATA_CHANGE_EVENT } from '@/app/lib/storage';
import type { MoodEntry, Habit, ExpenseEntry, HabitEntry } from '@/app/lib/storage';

const useHomeData = () => {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Synchronous initialization from localStorage to prevent flashing
  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    const data = localStorage.getItem('dailyspiral_moods');
    return data ? JSON.parse(data) : [];
  });
  
  const [habits, setHabits] = useState<any[]>(() => {
    const rawHabits = localStorage.getItem('dailyspiral_habits');
    const rawEntries = localStorage.getItem('dailyspiral_habit_entries');
    const h = rawHabits ? JSON.parse(rawHabits) : [];
    const e = rawEntries ? JSON.parse(rawEntries) : [];
    
    return h.map((habit: any) => ({
      ...habit,
      completed: e.some((entry: any) => entry.habitId === habit.id && entry.date === today && entry.completed)
    }));
  });
  
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => {
    const data = localStorage.getItem('dailyspiral_expenses');
    return data ? JSON.parse(data) : [];
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const loadAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      // Fetch everything in parallel
      const [m, h, entries, e] = await Promise.all([
        getMoods(),
        getHabits(),
        getHabitEntries(),
        getExpenses()
      ]);
      
      const processedHabits = (h || []).map(habit => {
        const completed = entries.some(entry => entry.habitId === habit.id && entry.date === today && entry.completed);
        return { ...habit, completed };
      });

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
    
    // Listen for global data changes
    const handleDataChange = () => loadAll(true);
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, [loadAll]);

  const toggleHabit = async (id: string) => {
    // Optimistic update
    setHabits(current => current.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    
    await toggleHabitEntry(id, today);
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
