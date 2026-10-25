import React, { useMemo } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Calendar, DollarSign, ShieldAlert } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { detectRecurringSubscriptions } from '../utils/subscriptionDetector';
import { formatCurrency, formatDate } from '../utils/formatters';

export const SubscriptionDetectorCard: React.FC = () => {
  const { transactions } = useFinance();

  const subscriptions = useMemo(() => {
    return detectRecurringSubscriptions(transactions);
  }, [transactions]);

  const totalAnnualized = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + s.annualizedCost, 0);
  }, [subscriptions]);

  const totalMonthlyCommitment = totalAnnualized / 12;

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center text-slate-500">
        <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
        <p className="font-semibold text-sm">No recurring subscriptions detected yet.</p>
        <p className="text-xs mt-0.5">We analyze repeating transaction cadences (e.g. ~30 days) and amount variance.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Recurring Subscriptions & Cadence Detector
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {subscriptions.length} Detected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadence interval analysis & coefficient of variance ($CV$) algorithm
          </p>
        </div>

        {/* Annual Commitment Summary */}
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
              Annual Recurring Drag
            </div>
            <div className="font-black text-slate-900 dark:text-white font-mono text-sm">
              {formatCurrency(totalAnnualized, 0)}
              <span className="text-[11px] font-normal text-slate-400"> /yr</span>
            </div>
          </div>
          <div className="border-l border-purple-200 dark:border-purple-800 pl-3">
            <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
              Monthly Equiv.
            </div>
            <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-xs">
              {formatCurrency(totalMonthlyCommitment, 0)}/mo
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {subscriptions.map((sub, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-2.5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="truncate">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={sub.merchant}>
                    {sub.merchant}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sub.category} &bull; {sub.subcategory}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-sm text-slate-900 dark:text-white font-mono">
                    {formatCurrency(sub.averageAmount)}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {sub.frequency}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics & Confidence */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Cadence: ~{sub.intervalDays} days
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                  sub.varianceScore === 'low'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : sub.varianceScore === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                }`}>
                  {sub.varianceScore} variance
                </span>
              </div>

              {/* Progress Bar for Confidence */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Detection Confidence</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.confidence}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${sub.confidence}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                <span>Next Projected:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                  {formatDate(sub.nextProjectedDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
