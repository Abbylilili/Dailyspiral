-- 1. Quotes Library
CREATE TABLE IF NOT EXISTS public.quotes_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author TEXT,
    language TEXT NOT NULL DEFAULT 'zh-CN',
    category TEXT
);

-- 2. Daily Status (Cache)
CREATE TABLE IF NOT EXISTS public.daily_status (
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    lang TEXT NOT NULL DEFAULT 'zh-CN',
    quote_content TEXT,
    quote_source TEXT CHECK (quote_source IN ('library', 'ai')),
    is_insight_ready BOOLEAN DEFAULT false,
    ai_personality TEXT,
    PRIMARY KEY (user_id, date)
);

-- Enable RLS
ALTER TABLE public.quotes_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read quotes library" ON public.quotes_library FOR SELECT USING (true);
CREATE POLICY "Users can manage their own daily status" ON public.daily_status FOR ALL USING (auth.uid() = user_id);
