-- Add frequency columns to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS frequency_type TEXT DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'times_per_week')),
ADD COLUMN IF NOT EXISTS frequency_config JSONB DEFAULT '{}'::jsonb;

-- Update existing habits to have a default daily frequency
UPDATE public.habits SET frequency_type = 'daily', frequency_config = '{}'::jsonb WHERE frequency_type IS NULL;
