import { useState, useEffect, useCallback, useRef } from 'react';
import { getExpenses, saveExpense, deleteExpense, DATA_CHANGE_EVENT } from '@/app/lib/storage';
import type { ExpenseEntry } from '@/app/lib/storage';

const useExpenses = () => {
  const [data, setData] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const fetchExpenses = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const expenses = await getExpenses();
      setData([...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    
    const handleDataChange = () => fetchExpenses(true);
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, [fetchExpenses]);

  const addExpense = async (entry: ExpenseEntry) => {
    await saveExpense(entry);
    await fetchExpenses(true); // 静默刷新
  };

  const removeExpense = async (id: string) => {
    await deleteExpense(id);
    await fetchExpenses(true); // 静默刷新
  };

  return {
    data,
    isLoading: isLoading && isFirstLoad.current, // 只有第一次加载才算 Loading
    addExpense,
    removeExpense,
    refresh: () => fetchExpenses(true)
  };
};

export default useExpenses;
