import { supabase } from '@/app/lib/supabase';

export interface DailyContentRequest {
  lang: string;
  userData?: {
    mood: number;
    completion: number;
  };
}

export const getDailyContent = async (params: DailyContentRequest) => {
  const { data, error } = await supabase.functions.invoke('handle-daily-process', {
    body: params
  });
  return { data, error };
};
