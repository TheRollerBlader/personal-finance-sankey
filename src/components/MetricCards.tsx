import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Percent, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const MetricCards: React.FC = () => {
  const { filteredTransactions } = useFinance();

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalTransfers = 0;

  filteredTransactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'transfer' || tx.category === 'Savings & Investments') {
      totalTransfers += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Approximate days span in filtered dataset
  const dates = filteredTransactions.map(t => t.date).filter(Boolean).sort();
  let daySpan = 1;
  if (dates.length > 1) {
    const start = new Date(dates[0]).getTime();
    const end = new Date(dates[dates.length - 1]).getTime();
    daySpan = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }
  const dailyBurn = totalExpenses / daySpan;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Income */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Income
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            100% Inflow Baseline
          </div>
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {totalIncome > 0 ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}% of income` : 'Direct Outflows'}
          </div>
        </div>
      </div>

      {/* 3. Net Savings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Net Savings
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            netSavings >= 0
              ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400'
              : 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400'
          }`}>
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${
            netSavings >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-500'
          }`}>
            {formatCurrency(netSavings)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {netSavings >= 0 ? 'Retained / Invested' : 'Budget Deficit'}
          </div>
        </div>
      </div>

      {/* 4. Savings Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Savings Rate
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            savingsRate >= 20
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
              : savingsRate >= 10
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
          }`}>
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${
            savingsRate >= 20
              ? 'text-emerald-600 dark:text-emerald-400'
              : savingsRate >= 10
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatPercent(savingsRate)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {savingsRate >= 20 ? 'Target Achieved (>20%)' : 'Below 20% Benchmark'}
          </div>
        </div>
      </div>

      {/* 5. Daily Burn Rate */}
      <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Daily Burn Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(dailyBurn, 0)}<span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Over {daySpan} days observed
          </div>
        </div>
      </div>
    </div>
  );
};
