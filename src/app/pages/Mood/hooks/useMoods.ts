import { useState, useEffect, useCallback, useRef } from 'react';
import { getMoods, saveMood, MoodEntry } from '@/app/lib/storage';

const useMoods = () => {
  const [data, setData] = useState<MoodEntry[]>([]);
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
