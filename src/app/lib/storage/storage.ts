import { supabase } from "@/app/lib/supabase/supabase";

// Local storage utilities for data persistence
export interface ExpenseEntry {
  id: string; date: string; amount: number; category: string; description: string; type: 'expense' | 'income'; user_id?: string;
}

export interface MoodEntry {
  id: string; date: string; mood: number; note?: string; user_id?: string;
}

export interface HabitEntry {
  id: string; date: string; habitId: string; completed: boolean; user_id?: string;
}

export type HabitFrequency = 
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] } 
  | { type: 'times_per_week'; times: number };

export interface Habit {
  id: string; 
  name: string; 
  color: string; 
  createdAt: string; 
  user_id?: string;
  frequency: HabitFrequency;
}

export interface DailyPlanEntry {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  date: string;      // YYYY-MM-DD
  color: string;
  category?: string;
}

const STORAGE_KEYS = {
  EXPENSES: 'dailyspiral_expenses',
  MOODS: 'dailyspiral_moods',
  HABITS: 'dailyspiral_habits',
  HABIT_ENTRIES: 'dailyspiral_habit_entries',
  DAILY_PLANS: 'dailyspiral_daily_plans',
  GENDER_PREFERENCE: 'dailyspiral_gender_preference',
};

function getFromLocalStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return [];
  }
}

function saveToLocalStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
}

// Event system to notify components of data changes
export const DATA_CHANGE_EVENT = 'dailyspiral_data_changed';
export function notifyDataChange() {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

let cachedUserId: string | null = null;
let userIdPromise: Promise<string | null> | null = null;

async function getUserId() {
  if (cachedUserId) return cachedUserId;
  if (userIdPromise) return userIdPromise;

  userIdPromise = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      cachedUserId = session?.user?.id || null;
      return cachedUserId;
    } catch (e) {
      console.warn("Supabase auth check failed", e);
      return null;
    } finally {
      userIdPromise = null;
    }
  })();
  
  return userIdPromise;
}

// --- Habits ---

export async function getHabits(): Promise<Habit[]> {
  const localData = getFromLocalStorage<Habit>(STORAGE_KEYS.HABITS);
  const userId = await getUserId();
  
  if (userId) {
    const { data, error } = await supabase.from('habits').select('*').order('createdat', { ascending: true });
    if (error || !data) return localData;
    
    const processed: Habit[] = data.map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        createdAt: item.createdat,
        user_id: item.user_id,
        frequency: item.frequency_type ? {
          type: item.frequency_type,
          ...(item.frequency_config || {})
        } as HabitFrequency : { type: 'daily' }
    }));

    const merged = [...processed];
    localData.forEach(lItem => {
        const idx = merged.findIndex(mItem => mItem.id === lItem.id);
        if (idx >= 0) merged[idx] = lItem;
        else merged.push(lItem);
    });
    return merged;
  }
  
  return localData.map(h => ({
    ...h,
    frequency: h.frequency || { type: 'daily' }
  }));
}

export async function saveHabit(habit: Habit): Promise<void> {
  const habits = getFromLocalStorage<Habit>(STORAGE_KEYS.HABITS);
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  
  const habitToSave = {
    ...habit,
    frequency: habit.frequency || { type: 'daily' }
  };

  if (existingIndex >= 0) habits[existingIndex] = habitToSave;
  else habits.push(habitToSave);
  
  saveToLocalStorage(STORAGE_KEYS.HABITS, habits);
  notifyDataChange();

  const userId = await getUserId();
  if (userId) {
    const { type, ...config } = habitToSave.frequency;
    await supabase.from('habits').upsert({
      id: habit.id,
      name: habit.name,
      color: habit.color,
      createdat: habit.createdAt,
      user_id: userId,
      frequency_type: type,
      frequency_config: config
    });
  }
}

export async function deleteHabit(id: string): Promise<void> {
  saveToLocalStorage(STORAGE_KEYS.HABITS, getFromLocalStorage<Habit>(STORAGE_KEYS.HABITS).filter(h => h.id !== id));
  saveToLocalStorage(STORAGE_KEYS.HABIT_ENTRIES, getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES).filter(e => e.habitId !== id));
  notifyDataChange();

  const userId = await getUserId();
  if (userId) await supabase.from('habits').delete().eq('id', id);
}

// --- Habit Entries ---

export async function getHabitEntries(): Promise<HabitEntry[]> {
  const localData = getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES);
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase.from('habit_entries').select('*');
    if (error || !data) return localData;
    
    const processed = data.map(item => ({
        id: item.id,
        habitId: item.habitid,
        date: item.date,
        completed: item.completed,
        user_id: item.user_id
    }));

    const merged = [...processed];
    localData.forEach(lItem => {
        const idx = merged.findIndex(mItem => mItem.id === lItem.id || (mItem.habitId === lItem.habitId && mItem.date === lItem.date));
        if (idx >= 0) merged[idx] = lItem;
        else merged.push(lItem);
    });
    return merged;
  }
  return localData;
}

export async function toggleHabitEntry(habitId: string, date: string): Promise<void> {
  const entries = getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES);
  const idx = entries.findIndex(e => e.habitId === habitId && e.date === date);
  
  let item: HabitEntry;
  if (idx >= 0) {
    entries[idx].completed = !entries[idx].completed;
    item = entries[idx];
  } else {
    item = { id: `${habitId}-${date}`, date, habitId, completed: true };
    entries.push(item);
  }
  saveToLocalStorage(STORAGE_KEYS.HABIT_ENTRIES, entries);
  notifyDataChange();

  const userId = await getUserId();
  if (userId) {
    const supabaseId = `${userId}-${habitId}-${date}`;
    await supabase.from('habit_entries').upsert({
      id: supabaseId,
      habitid: habitId,
      date: date,
      completed: item.completed,
      user_id: userId
    });
  }
}

export async function isHabitCompleted(habitId: string, date: string): Promise<boolean> {
  const entries = getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES);
  const entry = entries.find(e => e.habitId === habitId && e.date === date);
  return entry ? entry.completed : false;
}

// --- Daily Plans ---

export async function getDailyPlans(): Promise<DailyPlanEntry[]> {
  const localData = getFromLocalStorage<DailyPlanEntry>(STORAGE_KEYS.DAILY_PLANS);
  const userId = await getUserId();
  
  if (userId) {
    const { data, error } = await supabase.from('daily_plans').select('*').order('start_time', { ascending: true });
    if (error || !data) return localData;
    
    const processed = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        startTime: item.start_time,
        endTime: item.end_time,
        date: item.date,
        color: item.color,
        category: item.category
    }));

    const merged = [...processed];
    localData.forEach(lItem => {
        const idx = merged.findIndex(mItem => mItem.id === lItem.id);
        if (idx >= 0) merged[idx] = lItem;
        else merged.push(lItem);
    });
    return merged;
  }
  return localData;
}

export async function saveDailyPlan(plan: DailyPlanEntry): Promise<void> {
  const plans = getFromLocalStorage<DailyPlanEntry>(STORAGE_KEYS.DAILY_PLANS);
  const existingIndex = plans.findIndex(p => p.id === plan.id);
  if (existingIndex >= 0) plans[existingIndex] = plan;
  else plans.push(plan);
  saveToLocalStorage(STORAGE_KEYS.DAILY_PLANS, plans);
  notifyDataChange();

  const userId = await getUserId();
  if (userId) {
    await supabase.from('daily_plans').upsert({
      id: plan.id,
      user_id: userId,
      title: plan.title,
      description: plan.description,
      start_time: plan.startTime,
      end_time: plan.endTime,
      date: plan.date,
      color: plan.color,
      category: plan.category
    });
  }
}

export async function deleteDailyPlan(id: string): Promise<void> {
  saveToLocalStorage(STORAGE_KEYS.DAILY_PLANS, getFromLocalStorage<DailyPlanEntry>(STORAGE_KEYS.DAILY_PLANS).filter(p => p.id !== id));
  notifyDataChange();
  const userId = await getUserId();
  if (userId) await supabase.from('daily_plans').delete().eq('id', id);
}

// --- Moods ---

export async function getMoods(): Promise<MoodEntry[]> {
  const local = getFromLocalStorage<MoodEntry>(STORAGE_KEYS.MOODS);
  const uid = await getUserId();
  if (uid) {
    const { data, error } = await supabase.from('moods').select('*').order('date', { ascending: false });
    if (error || !data) return local;
    return data;
  }
  return local;
}

export async function saveMood(mood: MoodEntry): Promise<void> {
  const moods = getFromLocalStorage<MoodEntry>(STORAGE_KEYS.MOODS);
  const idx = moods.findIndex(m => m.date === mood.date);
  if (idx >= 0) moods[idx] = mood; else moods.push(mood);
  saveToLocalStorage(STORAGE_KEYS.MOODS, moods);
  notifyDataChange();

  const uid = await getUserId();
  if (uid) {
    const supabaseId = `${uid}-${mood.date}`;
    await supabase.from('moods').upsert({ ...mood, id: supabaseId, user_id: uid });
  }
}

// --- Expenses ---

export async function getExpenses(): Promise<ExpenseEntry[]> {
  const local = getFromLocalStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES);
  const uid = await getUserId();
  if (uid) {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error || !data) return local;
    return data;
  }
  return local;
}

export async function saveExpense(expense: ExpenseEntry): Promise<void> {
  const items = getFromLocalStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES);
  const idx = items.findIndex(e => e.id === expense.id);
  if (idx >= 0) items[idx] = expense; else items.push(expense);
  saveToLocalStorage(STORAGE_KEYS.EXPENSES, items);
  notifyDataChange();

  const uid = await getUserId();
  if (uid) await supabase.from('expenses').upsert({ ...expense, user_id: uid });
}

export async function deleteExpense(id: string): Promise<void> {
  saveToLocalStorage(STORAGE_KEYS.EXPENSES, getFromLocalStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES).filter(e => e.id !== id));
  notifyDataChange();
  const uid = await getUserId();
  if (uid) await supabase.from('expenses').delete().eq('id', id);
}

export function getGenderPreference(): 'boy' | 'girl' | 'none' | null {
  return localStorage.getItem(STORAGE_KEYS.GENDER_PREFERENCE) as any;
}

export function saveGenderPreference(gender: 'boy' | 'girl' | 'none'): void {
  localStorage.setItem(STORAGE_KEYS.GENDER_PREFERENCE, gender);
}

export async function exportAllData() {
  return { expenses: await getExpenses(), moods: await getMoods(), habits: await getHabits(), habitEntries: await getHabitEntries(), exportedAt: new Date().toISOString() };
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
