import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthLabel } from '../utils/formatters';

export const MonthlyTrendChart: React.FC = () => {
  const { filteredTransactions, theme } = useFinance();

  // Aggregate monthly metrics
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<
      string,
      { month: string; income: number; expenses: number; savings: number }
    > = {};

    filteredTransactions.forEach((tx) => {
      if (!tx.date || tx.date.length < 7) return;
      const m = tx.date.substring(0, 7); // 'YYYY-MM'
      if (!monthlyMap[m]) {
        monthlyMap[m] = { month: m, income: 0, expenses: 0, savings: 0 };
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
      return {
        month: m,
        monthLabel: formatMonthLabel(m),
        income: Number(inc.toFixed(2)),
        expenses: Number(exp.toFixed(2)),
        savings: Number((inc - exp).toFixed(2)),
      };
    });
  }, [filteredTransactions]);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  if (monthlyData.length <= 1) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[300px] text-slate-400 text-xs">
        Need at least 2 calendar months to plot multi-month trends.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Monthly Cash Flow & Spending Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historical Inflow (Income), Outflow (Expenses), and Net Cash Surplus
          </p>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

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
                  return (
                    <div className="p-3 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <div className="font-semibold text-slate-300 mb-1.5">{label}</div>
                      {payload.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-4 py-0.5 font-mono">
                          <span style={{ color: entry.color }} className="font-sans font-medium">
                            {entry.name}:
                          </span>
                          <span className="font-bold">{formatCurrency(entry.value)}</span>
                        </div>
                      ))}
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

            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeFill)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#F43F5E"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#expenseFill)"
            />
            <Area
              type="monotone"
              dataKey="savings"
              name="Net Savings"
              stroke="#06B6D4"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#savingsFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
