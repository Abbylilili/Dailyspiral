-- Create daily_plans table
CREATE TABLE IF NOT EXISTS public.daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    date DATE NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily plans" 
ON public.daily_plans FOR ALL 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_daily_plans_user_date ON public.daily_plans (user_id, date);
