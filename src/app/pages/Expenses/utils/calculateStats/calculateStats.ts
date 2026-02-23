import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { ExpenseEntry } from "@/app/lib/storage";

export const getMonthExpenses = (expenses: ExpenseEntry[]) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  return (expenses || []).filter(e => {
    const eDate = new Date(e.date);
    return eDate >= monthStart && eDate <= monthEnd;
  });
};

export const calculateTotals = (expenses: ExpenseEntry[]) => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d >= thisMonthStart && d <= thisMonthEnd;
  });

  const totalExpense = thisMonth.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = thisMonth.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);

  // Last month comparison
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const lastMonthExpense = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d >= lastMonthStart && d <= lastMonthEnd && e.type === 'expense';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const percentageChange = lastMonthExpense > 0 
    ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100 
    : 0;

  return {
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
    percentageChange,
    count: thisMonth.length
  };
};
