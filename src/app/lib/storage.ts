import { supabase } from "./supabase";

// Local storage utilities for data persistence
export interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
  user_id?: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-10
  note?: string;
  user_id?: string;
}

export interface HabitEntry {
  id: string;
  date: string;
  habitId: string;
  completed: boolean;
  user_id?: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  user_id?: string;
}

const STORAGE_KEYS = {
  EXPENSES: 'dailyspiral_expenses',
  MOODS: 'dailyspiral_moods',
  HABITS: 'dailyspiral_habits',
  HABIT_ENTRIES: 'dailyspiral_habit_entries',
  GENDER_PREFERENCE: 'dailyspiral_gender_preference',
};

// Generic storage functions
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

// Helper to get current user ID
async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
}

// Expense functions
export async function getExpenses(): Promise<ExpenseEntry[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (!error && data) return data;
  }
  return getFromLocalStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES);
}

export async function saveExpense(expense: ExpenseEntry): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const { error } = await supabase
      .from('expenses')
      .upsert({ ...expense, user_id: userId });
    
    if (error) console.error('Error saving to Supabase:', error);
  }
  
  // Also save to local storage as cache
  const expenses = getFromLocalStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES);
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  if (existingIndex >= 0) expenses[existingIndex] = expense;
  else expenses.push(expense);
  saveToLocalStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export async function deleteExpense(id: string): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    await supabase.from('expenses').delete().eq('id', id);
  }
  const expenses = getFromLocalStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES).filter(e => e.id !== id);
  saveToLocalStorage(STORAGE_KEYS.EXPENSES, expenses);
}

// Mood functions
export async function getMoods(): Promise<MoodEntry[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase.from('moods').select('*').order('date', { ascending: false });
    if (!error && data) return data;
  }
  return getFromLocalStorage<MoodEntry>(STORAGE_KEYS.MOODS);
}

export async function saveMood(mood: MoodEntry): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    await supabase.from('moods').upsert({ ...mood, user_id: userId });
  }
  const moods = getFromLocalStorage<MoodEntry>(STORAGE_KEYS.MOODS);
  const existingIndex = moods.findIndex(m => m.date === mood.date);
  if (existingIndex >= 0) moods[existingIndex] = mood;
  else moods.push(mood);
  saveToLocalStorage(STORAGE_KEYS.MOODS, moods);
}

// Habit functions
export async function getHabits(): Promise<Habit[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase.from('habits').select('*');
    if (!error && data) return data;
  }
  return getFromLocalStorage<Habit>(STORAGE_KEYS.HABITS);
}

export async function saveHabit(habit: Habit): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    await supabase.from('habits').upsert({ ...habit, user_id: userId });
  }
  const habits = getFromLocalStorage<Habit>(STORAGE_KEYS.HABITS);
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  if (existingIndex >= 0) habits[existingIndex] = habit;
  else habits.push(habit);
  saveToLocalStorage(STORAGE_KEYS.HABITS, habits);
}

export async function deleteHabit(id: string): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    await supabase.from('habits').delete().eq('id', id);
    await supabase.from('habit_entries').delete().eq('habitId', id);
  }
  const habits = getFromLocalStorage<Habit>(STORAGE_KEYS.HABITS).filter(h => h.id !== id);
  saveToLocalStorage(STORAGE_KEYS.HABITS, habits);
  const entries = getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES).filter(e => e.habitId !== id);
  saveToLocalStorage(STORAGE_KEYS.HABIT_ENTRIES, entries);
}

export async function getHabitEntries(): Promise<HabitEntry[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase.from('habit_entries').select('*');
    if (!error && data) return data;
  }
  return getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES);
}

export async function toggleHabitEntry(habitId: string, date: string): Promise<void> {
  const entries = await getHabitEntries();
  const existingIndex = entries.findIndex(e => e.habitId === habitId && e.date === date);
  const userId = await getUserId();
  
  let newCompleted = true;
  let entryId = `${habitId}-${date}`;

  if (existingIndex >= 0) {
    newCompleted = !entries[existingIndex].completed;
    entryId = entries[existingIndex].id;
  }

  if (userId) {
    await supabase.from('habit_entries').upsert({
      id: entryId,
      date,
      habitId,
      completed: newCompleted,
      user_id: userId
    });
  }

  const localEntries = getFromLocalStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES);
  const localIndex = localEntries.findIndex(e => e.habitId === habitId && e.date === date);
  if (localIndex >= 0) {
    localEntries[localIndex].completed = newCompleted;
  } else {
    localEntries.push({ id: entryId, date, habitId, completed: newCompleted });
  }
  saveToLocalStorage(STORAGE_KEYS.HABIT_ENTRIES, localEntries);
}

export async function isHabitCompleted(habitId: string, date: string): Promise<boolean> {
  const entries = await getHabitEntries();
  const entry = entries.find(e => e.habitId === habitId && e.date === date);
  return entry?.completed ?? false;
}

// Gender preference (Keep in localStorage for now as it's a UI preference)
export function getGenderPreference(): 'boy' | 'girl' | 'none' | null {
  return localStorage.getItem(STORAGE_KEYS.GENDER_PREFERENCE) as any;
}

export function saveGenderPreference(gender: 'boy' | 'girl' | 'none'): void {
  localStorage.setItem(STORAGE_KEYS.GENDER_PREFERENCE, gender);
}

// Export/Clear
export async function exportAllData() {
  return {
    expenses: await getExpenses(),
    moods: await getMoods(),
    habits: await getHabits(),
    habitEntries: await getHabitEntries(),
    exportedAt: new Date().toISOString(),
  };
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
