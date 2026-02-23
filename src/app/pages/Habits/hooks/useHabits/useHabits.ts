import { useState, useEffect, useCallback, useRef } from 'react';
import { getHabits, saveHabit, deleteHabit, getHabitEntries, toggleHabitEntry, DATA_CHANGE_EVENT } from '@/app/lib/storage';
import type { Habit, HabitEntry } from '@/app/lib/storage';

const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [h, e] = await Promise.all([getHabits(), getHabitEntries()]);
      setHabits(h || []);
      setEntries(e || []);
    } catch (err) {
      console.error("Hook fetch error:", err);
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const handleDataChange = () => fetchData(true);
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, [fetchData]);

  const addOrUpdateHabit = async (habit: Habit) => {
    await saveHabit(habit);
    await fetchData(true); // Silent refresh
  };

  const removeHabit = async (id: string) => {
    await deleteHabit(id);
    await fetchData(true);
  };

  const toggleEntry = async (habitId: string, date: string) => {
    // 1. Immediate local UI update (Optimistic)
    setEntries(prev => {
        const idx = prev.findIndex(e => e.habitId === habitId && e.date === date);
        if (idx >= 0) {
            const newEntries = [...prev];
            newEntries[idx] = { ...newEntries[idx], completed: !newEntries[idx].completed };
            return newEntries;
        }
        return [...prev, { id: `${habitId}-${date}`, habitId, date, completed: true }];
    });

    // 2. Perform actual storage update
    await toggleHabitEntry(habitId, date);
    
    // 3. Sync full state
    await fetchData(true);
  };

  return {
    habits,
    entries,
    isLoading: isLoading && isFirstLoad.current,
    addOrUpdateHabit,
    removeHabit,
    toggleEntry,
    refresh: () => fetchData(true)
  };
};

export default useHabits;
