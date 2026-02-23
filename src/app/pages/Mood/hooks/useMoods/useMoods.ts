import { useState, useEffect, useCallback, useRef } from 'react';
import { getMoods, saveMood, MoodEntry, DATA_CHANGE_EVENT } from '@/app/lib/storage';

const useMoods = () => {
  const [data, setData] = useState<MoodEntry[]>(() => {
    const local = localStorage.getItem('dailyspiral_moods');
    return local ? JSON.parse(local) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const fetchMoods = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const moods = await getMoods();
      setData(moods || []);
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMoods();
    
    const handleDataChange = () => fetchMoods(true);
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, [fetchMoods]);

  const addMood = async (entry: MoodEntry) => {
    await saveMood(entry);
    await fetchMoods(true); // 静默刷新
  };

  return {
    data,
    isLoading: isLoading && isFirstLoad.current,
    addMood,
    refresh: () => fetchMoods(true)
  };
};

export default useMoods;
