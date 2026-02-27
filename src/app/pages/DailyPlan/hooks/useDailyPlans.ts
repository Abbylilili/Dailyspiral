import { useState, useEffect, useCallback } from 'react';
import { getDailyPlans, saveDailyPlan, deleteDailyPlan, DailyPlanEntry, DATA_CHANGE_EVENT } from '@/app/lib/storage';

export const useDailyPlans = () => {
  const [plans, setPlans] = useState<DailyPlanEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDailyPlans();
      setPlans(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    window.addEventListener(DATA_CHANGE_EVENT, fetchPlans);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, fetchPlans);
  }, [fetchPlans]);

  const addOrUpdatePlan = async (plan: DailyPlanEntry) => {
    // Optimistic update
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === plan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = plan;
        return next;
      }
      return [...prev, plan];
    });

    await saveDailyPlan(plan);
    // Silent background refresh to ensure sync with server
    const data = await getDailyPlans();
    setPlans(data);
  };

  const removePlan = async (id: string) => {
    await deleteDailyPlan(id);
    await fetchPlans();
  };

  return {
    plans,
    isLoading,
    addOrUpdatePlan,
    removePlan,
    refresh: fetchPlans
  };
};

export default useDailyPlans;
