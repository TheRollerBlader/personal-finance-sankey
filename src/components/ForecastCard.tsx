import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { calculateSpendingForecast } from '../utils/forecaster';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const ForecastCard: React.FC = () => {
  const { transactions } = useFinance();

  const forecast = useMemo(() => {
    return calculateSpendingForecast(transactions);
  }, [transactions]);

  if (forecast.categories.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Next-Month Spending Forecast
            </h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3 h-3" />
              <span>Weighted Moving Average + Linear Trend</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical regression forecasting with 80% confidence interval estimation
          </p>
        </div>

        {/* Forecast KPI badges */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Projected Spend
            </span>
            <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
              {formatCurrency(forecast.projectedTotalSpend, 0)}
            </span>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">
              Projected Savings Rate
            </span>
            <span className="font-black text-cyan-600 dark:text-cyan-400 font-mono text-sm">
              {formatPercent(forecast.projectedSavingsRate)}
            </span>
          </div>
        </div>
      </div>

      {/* Table of Forecast per Category */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Expense Category</th>
              <th className="py-2.5 px-3 text-right">Last Month</th>
              <th className="py-2.5 px-3 text-right">Projected Spend</th>
              <th className="py-2.5 px-3 text-right">Trend</th>
              <th className="py-2.5 px-3 text-right">80% Confidence Interval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {forecast.categories.map((c) => {
              const isIncrease = c.trendPercentage > 0;
              return (
                <tr key={c.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {c.category}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {formatCurrency(c.currentMonthSpend)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(c.projectedSpend)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        isIncrease
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {c.trendPercentage > 0 ? `+${c.trendPercentage}%` : `${c.trendPercentage}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                    [{formatCurrency(c.confidenceLower, 0)} – {formatCurrency(c.confidenceUpper, 0)}]
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
