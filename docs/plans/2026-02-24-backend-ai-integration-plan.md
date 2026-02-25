# Backend AI Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现一个支持多语言、具备动态 AI 人格的后端系统，为用户提供每日一言和深度生活洞察。

**Architecture:** 采用分级响应机制。前端请求 `handle-daily-process` 接口，后端优先返回 `daily_status` 表中的缓存数据，若缺失则异步触发 OpenAI 生成任务并更新数据库。

**Tech Stack:** Supabase (PostgreSQL, Edge Functions), OpenAI API (gpt-4o-mini), TypeScript, Deno.

---

### Task 1: Database Schema Migration

**Files:**
- Create: `supabase/migrations/20260224_ai_integration.sql`

**Step 1: Write the migration SQL**

```sql
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
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260224_ai_integration.sql
git commit -m "db: add daily_status and quotes_library tables"
```

---

### Task 2: Seed Initial Quotes

**Files:**
- Create: `supabase/seed_quotes.sql`

**Step 1: Write seed data (ZH & EN)**

```sql
INSERT INTO public.quotes_library (content, author, language, category) VALUES
('生活不是为了活得更好，而是为了活得更清醒。', '佚名', 'zh-CN', 'philosophy'),
('Keep your face always toward the sunshine - and shadows will fall behind you.', 'Walt Whitman', 'en', 'encouragement');
```

**Step 2: Commit**

```bash
git add supabase/seed_quotes.sql
git commit -m "db: seed initial quotes"
```

---

### Task 3: Edge Function Scaffold

**Files:**
- Create: `supabase/functions/handle-daily-process/index.ts`

**Step 1: Create the basic function handler with Auth check**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  return new Response(JSON.stringify({ message: 'Scaffold OK' }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Step 2: Commit**

```bash
git add supabase/functions/handle-daily-process/index.ts
git commit -m "feat: scaffold daily process edge function"
```

---

### Task 4: AI Logic Implementation (OpenAI & Dynamic Prompt)

**Files:**
- Modify: `supabase/functions/handle-daily-process/index.ts`

**Step 1: Implement AI dynamic prompt and OpenAI call**

```typescript
// Add to handle-daily-process/index.ts
async function generateAIContent(userData: any, lang: string) {
  const personality = userData.mood < 4 ? 'Gentle' : (userData.completion < 0.3 ? 'Wake-up' : 'Booster');
  const prompt = `You are a life coach. Style: ${personality}. Lang: ${lang}. 
                  Yesterday Data: ${JSON.stringify(userData)}. 
                  Tasks: 1. Short Insight (<100 words). 2. Short Quote (<15 words). 
                  Return JSON: { insight: string, quote: string }`;
  
  // Call OpenAI API...
}
```

**Step 2: Run local test if possible or verify types**

**Step 3: Commit**

```bash
git commit -am "feat: implement AI prompt and dynamic personality logic"
```

---

### Task 5: Frontend Integration (Service Layer)

**Files:**
- Create: `src/app/services/ai/index.ts`
- Create: `src/app/services/ai/aiService.ts`

**Step 1: Implement service to call Edge Function**

```typescript
import { supabase } from '@/app/lib/supabase';

export const getDailyContent = async (lang: string) => {
  const { data, error } = await supabase.functions.invoke('handle-daily-process', {
    body: { lang }
  });
  return { data, error };
}
```

**Step 2: Commit**

```bash
git add src/app/services/ai/
git commit -m "feat: add frontend service for daily AI content"
```
