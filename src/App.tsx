import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PrivacyModal } from './components/PrivacyModal';
import { RulesModal } from './components/RulesModal';
import { CsvUploadModal } from './components/CsvUploadModal';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { SankeyView } from './components/SankeyView';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { IncomeExpenseBarChart } from './components/IncomeExpenseBarChart';
import { TreemapView } from './components/TreemapView';
import { SubscriptionDetectorCard } from './components/SubscriptionDetectorCard';
import { ForecastCard } from './components/ForecastCard';
import { TransactionTable } from './components/TransactionTable';
import { ShieldCheck, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
        onOpenRulesModal={() => setIsRulesOpen(true)}
        onOpenUploadModal={() => setIsUploadOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metric Cards */}
        <MetricCards />

        {/* Global Filter Toolbar */}
        <FilterBar />

        {/* Primary Visualization: Interactive Cash Flow Sankey */}
        <section aria-label="Sankey Diagram Flow">
          <SankeyView />
        </section>

        {/* Analytics Row 1: Monthly Trend Lines & Income vs Expenses Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrendChart />
          <IncomeExpenseBarChart />
        </div>

        {/* Analytics Row 2: Category Treemap & Next-Month Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TreemapView />
          <ForecastCard />
        </div>

        {/* Subscriptions & Cadence Detector */}
        <SubscriptionDetectorCard />

        {/* Ledger & Drill-down Transactions Table */}
        <TransactionTable />
      </main>

      {/* Modals */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <CsvUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero-Knowledge Architecture: 100% of calculation executes locally in browser RAM.</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Built with React, TypeScript, D3 & Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
