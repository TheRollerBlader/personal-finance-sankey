import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthLabel, formatPercent } from '../utils/formatters';

export const IncomeExpenseBarChart: React.FC = () => {
  const { filteredTransactions, theme } = useFinance();

  const data = useMemo(() => {
    const monthlyMap: Record<
      string,
      { month: string; income: number; expenses: number }
    > = {};

    filteredTransactions.forEach((tx) => {
      if (!tx.date || tx.date.length < 7) return;
      const m = tx.date.substring(0, 7);
      if (!monthlyMap[m]) {
        monthlyMap[m] = { month: m, income: 0, expenses: 0 };
      }

      if (tx.type === 'income') {
        monthlyMap[m].income += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyMap[m].expenses += tx.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyMap).sort();
    return sortedMonths.map((m) => {
      const inc = monthlyMap[m].income;
      const exp = monthlyMap[m].expenses;
      const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
      return {
        month: m,
        monthLabel: formatMonthLabel(m),
        income: Number(inc.toFixed(2)),
        expenses: Number(exp.toFixed(2)),
        savingsRate: Number(savingsRate.toFixed(1)),
      };
    });
  }, [filteredTransactions]);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Income vs. Expenses Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side monthly totals & computed monthly retention rates
          </p>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="monthLabel" stroke={textColor} fontSize={11} tickLine={false} />
            <YAxis
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <div className="font-semibold text-slate-300 mb-1.5">{label}</div>
                      <div className="flex items-center justify-between gap-4 font-mono py-0.5">
                        <span className="text-emerald-400 font-sans">Income:</span>
                        <span className="font-bold">{formatCurrency(item.income)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 font-mono py-0.5">
                        <span className="text-rose-400 font-sans">Expenses:</span>
                        <span className="font-bold">{formatCurrency(item.expenses)}</span>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-700 flex items-center justify-between gap-4 font-mono">
                        <span className="text-cyan-400 font-sans">Savings Rate:</span>
                        <span className="font-bold">{formatPercent(item.savingsRate)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />

            <Bar dataKey="income" name="Total Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expenses" name="Total Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
