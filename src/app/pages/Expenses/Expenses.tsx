import type { FC } from 'react';
import useExpenses from '@/app/services/supabase/hooks/useExpenses';
import ExpenseHeader from './components/ExpenseHeader';
import SummaryCards from './components/SummaryCards';
import ExpenseCharts from './components/ExpenseCharts';
import TransactionList from './components/TransactionList';
import { getMonthExpenses, calculateTotals } from './utils/calculateStats';

const Expenses: FC = () => {
  const { data: expenses, isLoading, addExpense, removeExpense } = useExpenses();

  // No full-screen loading guard to prevent flashing

  const thisMonthExpenses = getMonthExpenses(expenses);
  const totals = calculateTotals(expenses);

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      <ExpenseHeader onAdd={addExpense} />
      
      <SummaryCards totals={totals} />

      <ExpenseCharts 
        expenses={expenses} 
        thisMonthExpenses={thisMonthExpenses} 
      />

      <TransactionList 
        expenses={expenses} 
        onDelete={removeExpense}
        onUpdate={addExpense}
      />
    </div>
  );
};

export default Expenses;
