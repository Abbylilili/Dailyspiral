# Supabase Backend & Pastel Login Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the current local-storage-only Dailyspiral app into a secure, Supabase-backed, cloud-synchronized platform with a beautiful Pastel-style login page and AI-ready architecture.

**Architecture:**
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions)
- **Frontend:** React + Supabase-js + Framer Motion
- **Security:** Row Level Security (RLS) ensures users only see their own data.
- **AI Integration:** Edge Functions as a secure proxy for OpenAI API calls.

**Tech Stack:**
- Supabase (Postgres, Auth, Edge Functions)
- React (Framer Motion for animations)
- Tailwind CSS (v4) for Pastel styling
- Lucide React for iconography

---

### Task 1: Supabase Client Infrastructure

**Files:**
- Create: `src/app/lib/supabase.ts`
- Modify: `.env`

**Step 1: Install Dependencies**
Run: `npm install @supabase/supabase-js`

**Step 2: Create Supabase Client**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 3: Setup .env Example**
Create `.env.example` with:
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Commit**
```bash
git add .env.example src/app/lib/supabase.ts
git commit -m "feat: init supabase client"
```

---

### Task 2: Pastel Login Page Component

**Files:**
- Create: `src/app/pages/Login.tsx`
- Modify: `src/app/routes.tsx`

**Step 1: Create Login UI**
- Layout: Split-screen (Desktop) or Vertical (Mobile).
- Background: Pastel gradient from #E0C3FC to #F7D1CD.
- Glassmorphism card for Login form.
- Buttons: Rounded-3xl, soft shadows.

**Step 2: Add Framer Motion Animations**
- Fade in login card from bottom.
- Hover effects on buttons (scale 1.05).

**Step 3: Integrate Supabase Auth**
- Add `signInWithPassword` and `signUp` handlers.
- Add "Sign in with Apple" placeholder button.

**Step 4: Update Routes**
- Add `/login` route.
- Add "Protected Route" wrapper logic.

**Step 5: Commit**
```bash
git add src/app/pages/Login.tsx src/app/routes.tsx
git commit -m "feat: add pastel login page"
```

---

### Task 3: Data Migration Layer (Refactor Storage)

**Files:**
- Modify: `src/app/lib/storage.ts`

**Step 1: Refactor to Async Functions**
- Change `getHabits`, `saveHabit`, etc., to `async` functions.
- Add logic: If logged in -> read from Supabase; fallback -> localStorage.

**Step 2: Implement Sync Logic**
- Create `syncLocalStorageToCloud()` helper.

**Step 3: Commit**
```bash
git add src/app/lib/storage.ts
git commit -m "refactor: sync storage with supabase"
```

---

### Task 4: AI Insights Infrastructure (Edge Functions)

**Files:**
- Create: `supabase/functions/analyze-user-data/index.ts`

**Step 1: Define Edge Function Logic**
- Authenticate user via Supabase Auth.
- Fetch recent moods/habits/expenses.
- Construct OpenAI Prompt.
- Return structured Markdown response.

**Step 2: Commit**
```bash
git add supabase/functions/analyze-user-data/index.ts
git commit -m "feat: add ai insight edge function"
```

---

### Task 5: Database Schema Setup (SQL)

**Files:**
- Create: `supabase/migrations/20260223_init_schema.sql`

**Step 1: Define SQL Schema**
- Tables: `profiles`, `habits`, `habit_entries`, `moods`, `expenses`, `ai_insights`.
- Set up RLS Policies (User ID matching).
- Handle `gender_preference` enum ('boy', 'girl', 'none').

**Step 2: Commit**
```bash
git add supabase/migrations/20260223_init_schema.sql
git commit -m "feat: init database schema"
```
