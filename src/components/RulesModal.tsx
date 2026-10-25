import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Play, Check, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CategoryRule, TransactionType } from '../types/finance';
import { categorizeTransaction } from '../utils/categorizer';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { rules, categories, addRule, updateRule, deleteRule, resetRules, reapplyRules } = useFinance();

  // Test sandbox state
  const [testInput, setTestInput] = useState('WHOLE FOODS SOHO STORE #491');
  const [testResult, setTestResult] = useState<ReturnType<typeof categorizeTransaction> | null>(() => {
    return categorizeTransaction('WHOLE FOODS SOHO STORE #491', 50, rules);
  });

  // New rule form state
  const [isAdding, setIsAdding] = useState(false);
  const [pattern, setPattern] = useState('');
  const [isRegex, setIsRegex] = useState(true);
  const [targetCategory, setTargetCategory] = useState(categories[1]?.name || 'Housing');
  const [targetSubcategory, setTargetSubcategory] = useState(categories[1]?.subcategories[0] || 'Rent / Mortgage');
  const [targetType, setTargetType] = useState<TransactionType>('expense');
  const [priority, setPriority] = useState(70);

  const handleTest = () => {
    const res = categorizeTransaction(testInput, 50, rules);
    setTestResult(res);
  };

  const handleCategoryChange = (catName: string) => {
    setTargetCategory(catName);
    const cat = categories.find(c => c.name === catName);
    if (cat) {
      setTargetType(cat.type);
      setTargetSubcategory(cat.subcategories[0] || 'General');
    }
  };

  const handleSaveNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim()) return;

    addRule({
      pattern: pattern.trim(),
      isRegex,
      matchField: 'description',
      targetCategory,
      targetSubcategory,
      targetType,
      priority,
      enabled: true
    });

    setPattern('');
    setIsAdding(false);
    handleTest();
  };

  if (!isOpen) return null;

  const currentCategoryDef = categories.find(c => c.name === targetCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Rule-Based Categorization Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize regex patterns, keyword matchers, and hierarchy assignments
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Test Sandbox */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Rule Matcher Sandbox
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter sample bank transaction description..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleTest}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Match</span>
              </button>
            </div>

            {testResult && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Match Output:</span>
                <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {testResult.category} &rarr; {testResult.subcategory}
                </span>
                <span className="text-slate-400">Type: <span className="uppercase font-mono text-slate-600 dark:text-slate-300">{testResult.type}</span></span>
                {testResult.matchedRuleId ? (
                  <span className="text-slate-400">Rule ID: <code className="font-mono text-emerald-600 dark:text-emerald-400">{testResult.matchedRuleId}</code></span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Fallback Heuristic</span>
                )}
              </div>
            )}
          </div>

          {/* New Rule Button / Form */}
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Active Rules ({rules.length})
              </h3>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Rule</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveNewRule} className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add New Categorization Rule</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Pattern (e.g. UBER|LYFT)</label>
                  <input
                    type="text"
                    required
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter keywords or regex pattern"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4 mt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRegex}
                      onChange={(e) => setIsRegex(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Regular Expression (Regex)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Target Category</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Target Subcategory</label>
                  <select
                    value={targetSubcategory}
                    onChange={(e) => setTargetSubcategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {currentCategoryDef?.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Priority (Higher = Evaluated First)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save & Apply Rule
                </button>
              </div>
            </form>
          )}

          {/* Rules List */}
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                  rule.enabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/50 opacity-60'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {rule.pattern}
                    </span>
                    {rule.isRegex && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                        REGEX
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      P: {rule.priority}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{rule.targetCategory}</span>
                    <span>&rarr;</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{rule.targetSubcategory}</span>
                    <span className="text-slate-400 text-[10px]">({rule.targetType})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Active</span>
                  </label>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset all rules to system default set?')) {
                resetRules();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                reapplyRules();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
