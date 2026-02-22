import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import type { HabitEntry } from "@/app/lib/storage";

export const calculateStreak = (habitId: string, entries: HabitEntry[]) => {
  const habitEntries = entries
    .filter(e => e.habitId === habitId && e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (habitEntries.length === 0) return 0;
  
  const lastEntryDate = new Date(habitEntries[0].date);
  const todayDate = new Date();
  const yesterdayDate = subDays(todayDate, 1);
  
  const lastEntryStr = format(lastEntryDate, 'yyyy-MM-dd');
  const todayStr = format(todayDate, 'yyyy-MM-dd');
  const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd');

  if (lastEntryStr !== todayStr && lastEntryStr !== yesterdayStr) return 0;

  let streak = 1;
  let currentDate = lastEntryDate;
  
  for (let i = 1; i < habitEntries.length; i++) {
    const prevDate = new Date(habitEntries[i].date);
    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  return streak;
};

export const calculateCompletionRate = (habitsCount: number, entries: HabitEntry[]) => {
  if (habitsCount === 0) return 0;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const totalPossible = habitsCount * weekDays.length;
  const totalCompleted = entries.filter(e => {
    const date = new Date(e.date);
    return date >= weekStart && date <= weekEnd && e.completed;
  }).length;
  
  return (totalCompleted / totalPossible) * 100;
};
