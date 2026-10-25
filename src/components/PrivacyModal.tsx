import React from 'react';
import { X, ShieldCheck, Lock, HardDrive, WifiOff, Trash2, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { clearAllData, transactions } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Zero-Knowledge & Privacy Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your financial data never leaves your browser
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">100% Client-Side Processing</h4>
              <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                All CSV parsing, category pattern-matching, subscription cadence regression, and Sankey graph generation run purely inside your web browser’s JavaScript engine. No banking credentials or transactions are ever transmitted across the network.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Zero Telemetry & Third-Party Trackers</h4>
              <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                There are no analytics trackers, no advertising beacons, and no external tracking scripts embedded. You can verify this by checking your browser’s DevTools Network tab or running completely offline.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Ephemeral or Local-Only Storage</h4>
              <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                Transactions and user-defined rules are stored exclusively in your browser’s <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono">localStorage</code> for session continuity.
              </p>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current in memory: <span className="font-semibold text-slate-700 dark:text-slate-200">{transactions.length}</span> transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to purge all stored transactions from browser memory?')) {
                  clearAllData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Local Data</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Understood</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
