import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Filter, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLOR_MAP } from '../constants/defaultCategories';

export const TransactionTable: React.FC = () => {
  const {
    filteredTransactions,
    categories,
    updateTransaction,
    deleteTransaction,
    drillDownNode,
    setDrillDownNode,
  } = useFinance();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Editing row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startEdit = (tx: any) => {
    setEditingId(tx.id);
    setEditCategory(tx.category);
    setEditSubcategory(tx.subcategory);
  };

  const saveEdit = (id: string) => {
    updateTransaction(id, {
      category: editCategory,
      subcategory: editSubcategory,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const currentCategoryDef = categories.find((c) => c.name === editCategory);

  return (
    <div
      id="transaction-table-section"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden scroll-mt-20 space-y-0"
    >
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Transactions Ledger
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredTransactions.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {drillDownNode
              ? `Filtered by node: ${drillDownNode.name}`
              : 'Detailed breakdown of all active records with inline category reassignment'}
          </p>
        </div>

        {drillDownNode && (
          <button
            onClick={() => setDrillDownNode(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <span>Reset Drill-Down Filter</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Category & Subcategory</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No transactions match the selected criteria.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const isEditing = editingId === tx.id;
                const catColor = CATEGORY_COLOR_MAP[tx.category] || '#64748B';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {tx.description}
                    </td>

                    {/* Category Column */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editCategory}
                            onChange={(e) => {
                              setEditCategory(e.target.value);
                              const c = categories.find((cat) => cat.name === e.target.value);
                              if (c) setEditSubcategory(c.subcategories[0] || 'General');
                            }}
                            className="px-2 py-1 rounded text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={editSubcategory}
                            onChange={(e) => setEditSubcategory(e.target.value)}
                            className="px-2 py-1 rounded text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            {currentCategoryDef?.subcategories.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {tx.category}
                          </span>
                          <span className="text-slate-400">&rsaquo;</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {tx.subcategory}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : tx.type === 'transfer'
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {tx.account || '—'}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'transfer'
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(tx.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(tx)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
