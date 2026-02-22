// AI-powered insights generation (mocked for MVP)
import { ExpenseEntry, MoodEntry, HabitEntry, Habit } from './storage';
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from 'date-fns';

export interface WeeklyInsight {
  weekStart: string;
  weekEnd: string;
  summary: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  avgMood: number;
  totalExpenses: number;
  totalIncome: number;
  habitCompletion: number;
  topCategories: { category: string; amount: number }[];
  dailyData: { date: string; day: string; mood: number; expenses: number; completedHabits: number }[];
  recommendations: string[];
  correlations: string[];
}

export function generateWeeklyInsight(
  expenses: ExpenseEntry[],
  moods: MoodEntry[],
  habitEntries: HabitEntry[],
  habits: Habit[],
  weekDate: Date = new Date()
): WeeklyInsight {
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  
  // Filter data for this week
  const weekExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= weekStart && date <= weekEnd;
  });
  
  const weekMoods = moods.filter(m => {
    const date = new Date(m.date);
    return date >= weekStart && date <= weekEnd;
  });
  
  const weekHabits = habitEntries.filter(h => {
    const date = new Date(h.date);
    return date >= weekStart && date <= weekEnd && h.completed;
  });
  
  // Calculate metrics
  const totalExpenses = weekExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalIncome = weekExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const avgMood = weekMoods.length > 0
    ? weekMoods.reduce((sum, m) => sum + m.mood, 0) / weekMoods.length
    : 5;
  
  // Mood trend
  let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (weekMoods.length >= 3) {
    const firstHalf = weekMoods.slice(0, Math.floor(weekMoods.length / 2));
    const secondHalf = weekMoods.slice(Math.floor(weekMoods.length / 2));
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.mood, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.5) moodTrend = 'improving';
    else if (secondAvg < firstAvg - 0.5) moodTrend = 'declining';
  }
  
  // Habit completion rate
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const totalPossibleCompletions = habits.length * daysInWeek.length;
  const habitCompletion = totalPossibleCompletions > 0
    ? (weekHabits.length / totalPossibleCompletions) * 100
    : 0;
  
  // Top spending categories
  const categoryMap = new Map<string, number>();
  weekExpenses
    .filter(e => e.type === 'expense')
    .forEach(e => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });
  
  const topCategories = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Generate daily data for charts
  const dailyData = daysInWeek.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLabel = format(day, 'EEE'); // Mon, Tue, etc.
    
    // Find mood for this day (use latest if multiple)
    const dayMoodEntry = moods.find(m => m.date === dayStr);
    const mood = dayMoodEntry ? dayMoodEntry.mood : 0;
    
    // Sum expenses for this day
    const dayExpenses = expenses
      .filter(e => e.date === dayStr && e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    // Count completed habits for this day
    const dayCompletedHabits = habitEntries
      .filter(h => h.date === dayStr && h.completed)
      .length;
      
    return {
      date: dayStr,
      day: dayLabel,
      mood,
      expenses: dayExpenses,
      completedHabits: dayCompletedHabits
    };
  });
  
  // Generate insights
  const summary = generateSummaryText(avgMood, moodTrend, totalExpenses, totalIncome, habitCompletion);
  const recommendations = generateRecommendations(avgMood, moodTrend, totalExpenses, totalIncome, habitCompletion);
  const correlations = findCorrelations(weekMoods, weekExpenses);
  
  return {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
    summary,
    moodTrend,
    avgMood,
    totalExpenses,
    totalIncome,
    habitCompletion,
    topCategories,
    dailyData,
    recommendations,
    correlations,
  };
}

function generateSummaryText(
  avgMood: number,
  moodTrend: 'improving' | 'stable' | 'declining',
  totalExpenses: number,
  totalIncome: number,
  habitCompletion: number
): string {
  const moodDesc = avgMood >= 7 ? 'positive' : avgMood >= 5 ? 'stable' : 'low';
  const trendDesc = moodTrend === 'improving' ? 'improving' : moodTrend === 'declining' ? 'declining' : 'stable';
  const balance = totalIncome - totalExpenses;
  const financeDesc = balance > 0 ? `surplus of $${balance.toFixed(2)}` : balance < 0 ? `deficit of $${Math.abs(balance).toFixed(2)}` : 'balanced budget';
  
  return `Overall mood this week is ${moodDesc} and ${trendDesc}. Financially, you have a ${financeDesc}, with a habit completion rate of ${habitCompletion.toFixed(0)}%.`;
}

function generateRecommendations(
  avgMood: number,
  moodTrend: 'improving' | 'stable' | 'declining',
  totalExpenses: number,
  totalIncome: number,
  habitCompletion: number
): string[] {
  const recommendations: string[] = [];
  
  // Specific recommendations
  if (avgMood < 5) {
    recommendations.push('Mood has been low this week. Consider scheduling some relaxation time or meditation.');
  }
  
  if (moodTrend === 'declining') {
    recommendations.push('Mood is trending downwards. Try reaching out to friends or engaging in a hobby you love.');
  }
  
  if (totalExpenses > totalIncome && totalIncome > 0) {
    recommendations.push('Expenses exceeded income. Review non-essential spending and plan a stricter budget for next week.');
  } else if (totalExpenses > totalIncome * 0.8 && totalIncome > 0) {
    recommendations.push('Expenses are approaching income limits. Keep an eye on discretionary spending.');
  }
  
  if (habitCompletion < 40) {
    recommendations.push('Habit completion is low. Try focusing on just one key habit to rebuild momentum.');
  } else if (habitCompletion >= 80) {
    recommendations.push('Great job on habits! Consider increasing the difficulty or adding a new goal.');
  }
  
  if (avgMood >= 7 && habitCompletion >= 70) {
    recommendations.push('You are doing great! Maintain this positive rhythm.');
  }

  // Fill up with general wellness advice if less than 3
  const generalAdvice = [
    'Regular sleep schedules significantly improve mood stability.',
    'Hydration is key to maintaining daily energy levels.',
    'Taking a short 10-minute walk can clear your mind and reset focus.',
    'Reflecting on 3 small wins each day boosts overall positivity.',
    'Tracking small daily expenses often reveals the biggest savings opportunities.',
    'Connection matters—call a friend or family member this week.',
    'Decluttering your physical space can help declutter your mind.'
  ];

  // Shuffle general advice to get random ones
  const shuffledAdvice = generalAdvice.sort(() => 0.5 - Math.random());
  
  let adviceIndex = 0;
  while (recommendations.length < 3 && adviceIndex < shuffledAdvice.length) {
    // Avoid duplicates if by chance generated matches generic (unlikely but safe)
    if (!recommendations.includes(shuffledAdvice[adviceIndex])) {
      recommendations.push(shuffledAdvice[adviceIndex]);
    }
    adviceIndex++;
  }
  
  return recommendations;
}

function findCorrelations(moods: MoodEntry[], expenses: ExpenseEntry[]): string[] {
  const correlations: string[] = [];
  
  // Check if low mood days have higher expenses
  const lowMoodDays = moods.filter(m => m.mood <= 4).map(m => m.date);
  const lowMoodExpenses = expenses.filter(e => lowMoodDays.includes(e.date) && e.type === 'expense');
  
  const highMoodDays = moods.filter(m => m.mood >= 7).map(m => m.date);
  const highMoodExpenses = expenses.filter(e => highMoodDays.includes(e.date) && e.type === 'expense');
  
  if (lowMoodDays.length > 0 && lowMoodExpenses.length > 0) {
    const avgLowMoodExpense = lowMoodExpenses.reduce((sum, e) => sum + e.amount, 0) / lowMoodDays.length;
    const avgHighMoodExpense = highMoodExpenses.length > 0
      ? highMoodExpenses.reduce((sum, e) => sum + e.amount, 0) / highMoodDays.length
      : 0;
    
    if (avgLowMoodExpense > avgHighMoodExpense * 1.5) {
      correlations.push('Spending tends to increase on days with lower mood. Emotional spending might be a factor.');
    }
  }
  
  return correlations;
}
