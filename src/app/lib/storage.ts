// Local storage utilities for data persistence

export interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-10
  note?: string;
}

export interface HabitEntry {
  id: string;
  date: string;
  habitId: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  EXPENSES: 'dailyspiral_expenses',
  MOODS: 'dailyspiral_moods',
  HABITS: 'dailyspiral_habits',
  HABIT_ENTRIES: 'dailyspiral_habit_entries',
  GENDER_PREFERENCE: 'dailyspiral_gender_preference',
};

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
}

// Expense functions
export function getExpenses(): ExpenseEntry[] {
  return getFromStorage<ExpenseEntry>(STORAGE_KEYS.EXPENSES);
}

export function saveExpense(expense: ExpenseEntry): void {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push(expense);
  }
  
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter(e => e.id !== id);
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

// Mood functions
export function getMoods(): MoodEntry[] {
  return getFromStorage<MoodEntry>(STORAGE_KEYS.MOODS);
}

export function saveMood(mood: MoodEntry): void {
  const moods = getMoods();
  const existingIndex = moods.findIndex(m => m.date === mood.date);
  
  if (existingIndex >= 0) {
    moods[existingIndex] = mood;
  } else {
    moods.push(mood);
  }
  
  saveToStorage(STORAGE_KEYS.MOODS, moods);
}

// Habit functions
export function getHabits(): Habit[] {
  return getFromStorage<Habit>(STORAGE_KEYS.HABITS);
}

export function saveHabit(habit: Habit): void {
  const habits = getHabits();
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  
  if (existingIndex >= 0) {
    habits[existingIndex] = habit;
  } else {
    habits.push(habit);
  }
  
  saveToStorage(STORAGE_KEYS.HABITS, habits);
}

export function deleteHabit(id: string): void {
  const habits = getHabits().filter(h => h.id !== id);
  saveToStorage(STORAGE_KEYS.HABITS, habits);
  
  // Also delete all entries for this habit
  const entries = getHabitEntries().filter(e => e.habitId !== id);
  saveToStorage(STORAGE_KEYS.HABIT_ENTRIES, entries);
}

export function getHabitEntries(): HabitEntry[] {
  return getFromStorage<HabitEntry>(STORAGE_KEYS.HABIT_ENTRIES);
}

export function toggleHabitEntry(habitId: string, date: string): void {
  const entries = getHabitEntries();
  const existingIndex = entries.findIndex(
    e => e.habitId === habitId && e.date === date
  );
  
  if (existingIndex >= 0) {
    entries[existingIndex].completed = !entries[existingIndex].completed;
  } else {
    entries.push({
      id: `${habitId}-${date}`,
      date,
      habitId,
      completed: true,
    });
  }
  
  saveToStorage(STORAGE_KEYS.HABIT_ENTRIES, entries);
}

export function isHabitCompleted(habitId: string, date: string): boolean {
  const entries = getHabitEntries();
  const entry = entries.find(e => e.habitId === habitId && e.date === date);
  return entry?.completed ?? false;
}

// Gender preference
export function getGenderPreference(): 'boy' | 'girl' | null {
  return localStorage.getItem(STORAGE_KEYS.GENDER_PREFERENCE) as 'boy' | 'girl' | null;
}

export function saveGenderPreference(gender: 'boy' | 'girl'): void {
  localStorage.setItem(STORAGE_KEYS.GENDER_PREFERENCE, gender);
}

// Export all data
export function exportAllData() {
  return {
    expenses: getExpenses(),
    moods: getMoods(),
    habits: getHabits(),
    habitEntries: getHabitEntries(),
    exportedAt: new Date().toISOString(),
  };
}

// Clear all data
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
