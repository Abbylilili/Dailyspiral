import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, getDay } from "date-fns";
import type { HabitEntry, Habit } from "@/app/lib/storage";

export const calculateStreak = (habitId: string, entries: HabitEntry[], habit?: Habit) => {
  const habitEntries = entries
    .filter(e => e.habitId === habitId && e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (habitEntries.length === 0) return 0;

  // For non-daily habits, streak logic is more complex. 
  // Simple implementation: count days since start where goal was met.
  // Current logic remains daily-focused for simplicity in MVP, 
  // but we should eventually implement "Cycle Streak" (e.g. Weeks in a row met target).
  
  const lastEntryDate = new Date(habitEntries[0].date);
  const todayDate = new Date();
  const yesterdayDate = subDays(todayDate, 1);
  
  const lastEntryStr = format(lastEntryDate, 'yyyy-MM-dd');
  const todayStr = format(todayDate, 'yyyy-MM-dd');
  const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd');

  // If the habit is "Specific Days", the streak shouldn't break if today is not a target day
  if (habit?.frequency?.type === 'weekly') {
    // Advanced streak logic would go here. For now, daily streak is used.
  }

  if (lastEntryStr !== todayStr && lastEntryStr !== yesterdayStr) return 0;

  let streak = 1;
  let currentDate = lastEntryDate;
  
  for (let i = 1; i < habitEntries.length; i++) {
    const prevDate = new Date(habitEntries[i].date);
    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // For daily habits, diff must be 1. 
    // For specific days, we'd need to skip non-target days.
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  return streak;
};

export const calculateCompletionRate = (habits: Habit[], entries: HabitEntry[]) => {
  if (habits.length === 0) return 0;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  let totalTargetCompletions = 0;
  let totalActualCompletions = 0;

  habits.forEach(habit => {
    // 1. Calculate Target for this habit this week
    if (!habit.frequency || habit.frequency.type === 'daily') {
      totalTargetCompletions += weekDays.length;
    } else if (habit.frequency.type === 'weekly') {
      totalTargetCompletions += habit.frequency.days.length;
    } else if (habit.frequency.type === 'times_per_week') {
      totalTargetCompletions += habit.frequency.times;
    }

    // 2. Calculate Actual completions for this habit this week
    const completedThisWeek = entries.filter(e => {
      const date = new Date(e.date);
      return e.habitId === habit.id && date >= weekStart && date <= weekEnd && e.completed;
    }).length;

    totalActualCompletions += Math.min(completedThisWeek, 7); // Cap it to week length
  });
  
  return totalTargetCompletions > 0 ? (totalActualCompletions / totalTargetCompletions) * 100 : 0;
};

/**
 * Checks if a habit should be done today based on its frequency
 */
export const isHabitDueToday = (habit: Habit, date: Date = new Date()): boolean => {
  if (!habit.frequency || habit.frequency.type === 'daily') return true;
  
  if (habit.frequency.type === 'weekly') {
    const dayOfWeek = getDay(date); // 0-6
    return habit.frequency.days.includes(dayOfWeek);
  }
  
  if (habit.frequency.type === 'times_per_week') {
    // For "Times per week", it's always "due" until the quota is met
    return true; 
  }
  
  return true;
};
