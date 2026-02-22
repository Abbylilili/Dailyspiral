# Codebase Refactoring & Component Modularization Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the codebase to enforce a <200 lines per file limit and reorganize the folder structure into a domain-driven pattern (App -> Components/Pages -> Page-Specific Components).

**Target Structure:**
- `src/app/components/`: Global shared components (UI, Layout, etc.)
- `src/app/pages/[PageName]/`:
    - `index.ts`: Export the page.
    - `[PageName].tsx`: Main page layout and orchestration.
    - `components/`: Components used only by this page.
    - `hooks/`: Hooks used only by this page.
    - `constants.ts` or `utils.ts`: Page-specific logic/data.

---

### Task 1: Refactor Expenses Page

**Goal:** Break down `Expenses.tsx` (>500 lines) into modular pieces.

**Files:**
- Create: `src/app/pages/Expenses/index.ts`
- Create: `src/app/pages/Expenses/Expenses.tsx`
- Create: `src/app/pages/Expenses/components/SummaryCards.tsx`
- Create: `src/app/pages/Expenses/components/ExpenseCharts.tsx`
- Create: `src/app/pages/Expenses/components/TransactionList.tsx`
- Create: `src/app/pages/Expenses/components/ExpenseForm.tsx`
- Create: `src/app/pages/Expenses/constants.ts`
- Create: `src/app/pages/Expenses/animations/` (Extract the SVG animations)

**Step 1: Extract Constants**
Move `PASTEL_COLORS`, `OCEAN_COLORS`, etc., and `CATEGORIES` to `constants.ts`.

**Step 2: Extract Animations**
Create individual files for `PandaAnimation`, `DaisyAnimation`, etc., in `src/app/pages/Expenses/animations/`.

**Step 3: Extract Sub-components**
Move the logic for Summary Cards, Charts, and Transaction list into separate component files.

**Step 4: Update Main Page**
Reconstruct `Expenses.tsx` using these components.

**Step 5: Commit**
```bash
git add src/app/pages/Expenses/
git rm src/app/pages/Expenses.tsx
git commit -m "refactor: modularize Expenses page into domain-driven structure"
```

---

### Task 2: Refactor Mood Page

**Goal:** Break down `Mood.tsx` (>400 lines).

**Files:**
- Create: `src/app/pages/Mood/index.ts`
- Create: `src/app/pages/Mood/Mood.tsx`
- Create: `src/app/pages/Mood/components/MoodHistory.tsx`
- Create: `src/app/pages/Mood/components/MoodLogger.tsx`
- Create: `src/app/pages/Mood/components/MoodJourney.tsx`
- Create: `src/app/pages/Mood/components/Recommendations.tsx`

**Step 1: Extract Recommendation Logic**
Move `getRecommendations` to a hook or util file.

**Step 2: Extract Liquid Heart SVG**
Move the complex SVG logic to a dedicated component.

**Step 3: Orchestrate in Mood.tsx**
Ensure the main file is strictly for layout and shared state.

---

### Task 3: Refactor Habits & Home Pages

**Goal:** Apply the same folder-per-page pattern to Habits and Home.

**Files:**
- `src/app/pages/Habits/`
- `src/app/pages/Home/`

---

### Task 4: Update Routes and Imports

**Files:**
- Modify: `src/app/routes.tsx`

**Step 1: Update Imports**
Point routes to the new folder indices (e.g., `import { Expenses } from "./pages/Expenses"`).
