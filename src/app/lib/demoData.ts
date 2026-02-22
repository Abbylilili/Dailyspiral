// Demo data for first-time users
import { saveExpense, saveMood, saveHabit, toggleHabitEntry } from './storage';
import { subDays, format } from 'date-fns';

export function initializeDemoData() {
  // Check if data already exists
  const hasData = localStorage.getItem('dailyspiral_moods') || 
                  localStorage.getItem('dailyspiral_expenses') ||
                  localStorage.getItem('dailyspiral_habits');
  
  if (hasData) return; // Don't overwrite existing data
  
  const today = new Date();
  
  // Create demo habits
  const habits = [
    { id: 'habit-1', name: '每天运动30分钟', color: '#10b981' },
    { id: 'habit-2', name: '阅读20分钟', color: '#8b5cf6' },
    { id: 'habit-3', name: '早睡早起', color: '#3b82f6' },
  ];
  
  habits.forEach(h => {
    saveHabit({
      ...h,
      createdAt: new Date().toISOString(),
    });
  });
  
  // Create demo data for last 14 days
  for (let i = 14; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    
    // Mood data (simulated pattern)
    const baseMood = 5 + Math.sin(i * 0.3) * 2 + Math.random() * 2;
    const mood = Math.max(1, Math.min(10, Math.round(baseMood)));
    
    saveMood({
      id: date,
      date,
      mood,
      note: i === 0 ? '今天心情不错！' : undefined,
    });
    
    // Expense data
    if (Math.random() > 0.3) {
      const categories = ['food', 'transport', 'shopping', 'entertainment', 'health', 'other'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = Math.random() * 100 + 10;
      
      saveExpense({
        id: `expense-${date}-1`,
        date,
        amount: parseFloat(amount.toFixed(2)),
        category,
        description: '',
        type: 'expense',
      });
    }
    
    // Habit completions (higher chance for recent days)
    habits.forEach(habit => {
      const completionChance = 0.4 + (14 - i) / 28; // Increases over time
      if (Math.random() < completionChance) {
        toggleHabitEntry(habit.id, date);
      }
    });
  }
}
