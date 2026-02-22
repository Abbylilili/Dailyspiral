-- Initialize Dailyspiral Schema

-- 1. Habit Table
CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    createdAt TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

-- 2. Habit Entries
CREATE TABLE IF NOT EXISTS public.habit_entries (
    id TEXT PRIMARY KEY,
    habitId TEXT REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
);
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own habit entries" ON public.habit_entries
    FOR ALL USING (auth.uid() = user_id);

-- 3. Moods
CREATE TABLE IF NOT EXISTS public.moods (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date TEXT NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    note TEXT
);
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own moods" ON public.moods
    FOR ALL USING (auth.uid() = user_id);

-- 4. Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('expense', 'income'))
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own expenses" ON public.expenses
    FOR ALL USING (auth.uid() = user_id);

-- 5. AI Insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, -- 'weekly', 'instant', 'financial'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own insights" ON public.ai_insights
    FOR ALL USING (auth.uid() = user_id);
