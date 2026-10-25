import React from 'react';
import { Search, Calendar, Filter, X, RotateCcw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const FilterBar: React.FC = () => {
  const {
    dateFilter,
    setDateFilter,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    drillDownNode,
    setDrillDownNode,
    filteredTransactions,
    transactions,
  } = useFinance();

  const presets = [
    { id: 'all', label: 'All Time' },
    { id: 'last30', label: 'Last 30d' },
    { id: 'last90', label: 'Last 90d' },
    { id: 'last180', label: 'Last 180d' },
    { id: 'ytd', label: 'YTD' },
  ] as const;

  const hasActiveFilters =
    dateFilter.preset !== 'all' ||
    selectedCategory !== null ||
    searchQuery.trim().length > 0 ||
    drillDownNode !== null;

  const handleResetFilters = () => {
    setDateFilter({ startDate: '', endDate: '', preset: 'all' });
    setSelectedCategory(null);
    setSearchQuery('');
    setDrillDownNode(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Preset Date Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Range:</span>
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setDateFilter({ ...dateFilter, preset: p.id })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                dateFilter.preset === p.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setDateFilter({ ...dateFilter, preset: 'custom' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              dateFilter.preset === 'custom'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="appearance-none pl-8 pr-8 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, memo..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Input row if 'custom' is active */}
      {dateFilter.preset === 'custom' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-500">From:</span>
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <span className="text-slate-500">To:</span>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* Active Drill-Down Banner */}
      {drillDownNode && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Drill-Down Active: <strong>{drillDownNode.name}</strong> ({drillDownNode.categoryType.replace('_', ' ')})
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              — Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
          </div>
          <button
            onClick={() => setDrillDownNode(null)}
            className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-semibold"
          >
            <span>Clear Drill-Down</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
