import React from 'react';
import {
  ShieldCheck,
  Upload,
  Sliders,
  Sun,
  Moon,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportTransactionsToCSV } from '../utils/csvParser';

interface NavbarProps {
  onOpenPrivacyModal: () => void;
  onOpenRulesModal: () => void;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPrivacyModal,
  onOpenRulesModal,
  onOpenUploadModal,
}) => {
  const {
    theme,
    toggleTheme,
    transactions,
    isSampleDataLoaded,
    resetToSampleData,
  } = useFinance();

  const handleExportCSV = () => {
    const csvString = exportTransactionsToCSV(transactions);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-flow-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl tracking-tight">
            ≋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Sankey<span className="text-emerald-500">Flow</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                v1.0
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
              Privacy-First Personal Finance Visualizer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy Indicator Badge */}
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer"
            title="Learn how your data stays 100% private in browser"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="hidden lg:inline">Zero-Telemetry • 100% Local</span>
            <span className="lg:hidden">Private</span>
          </button>

          {/* Sample Data State */}
          {isSampleDataLoaded ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample Data</span>
            </div>
          ) : (
            <button
              onClick={resetToSampleData}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Reload sample financial dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample</span>
            </button>
          )}

          {/* Upload CSV */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload CSV</span>
            <span className="sm:hidden">Import</span>
          </button>

          {/* Rules Editor */}
          <button
            onClick={onOpenRulesModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Edit categorization rules"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Rules</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Export filtered transactions as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
