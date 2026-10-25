import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CategoryDefinition,
  CategoryRule,
  DateRangeFilter,
  SankeyNodeData,
  Transaction,
} from '../types/finance';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories';
import { DEFAULT_RULES } from '../constants/defaultRules';
import { SAMPLE_TRANSACTIONS } from '../constants/sampleTransactions';
import { applyRulesToTransactions } from '../utils/categorizer';

interface FinanceContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  rules: CategoryRule[];
  categories: CategoryDefinition[];
  dateFilter: DateRangeFilter;
  selectedCategory: string | null;
  searchQuery: string;
  drillDownNode: SankeyNodeData | null;
  theme: 'light' | 'dark';
  isSampleDataLoaded: boolean;
  setDateFilter: (filter: DateRangeFilter) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDrillDownNode: (node: SankeyNodeData | null) => void;
  setTransactions: (txs: Transaction[]) => void;
  addTransactions: (newTxs: Transaction[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addRule: (rule: Omit<CategoryRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<CategoryRule>) => void;
  deleteRule: (id: string) => void;
  resetRules: () => void;
  reapplyRules: () => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  toggleTheme: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_TX_KEY = 'pf_sankey_transactions_v1';
const LOCAL_STORAGE_RULES_KEY = 'pf_sankey_rules_v1';
const LOCAL_STORAGE_THEME_KEY = 'pf_sankey_theme_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Rules state
  const [rules, setRules] = useState<CategoryRule[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load rules from localStorage', e);
    }
    return DEFAULT_RULES;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(rules));
  }, [rules]);

  // Transactions state
  const [transactions, setTransactionsState] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load transactions from localStorage', e);
    }
    return SAMPLE_TRANSACTIONS;
  });

  const [isSampleDataLoaded, setIsSampleDataLoaded] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
    return !saved;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Filter state
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: '',
    endDate: '',
    preset: 'all',
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [drillDownNode, setDrillDownNode] = useState<SankeyNodeData | null>(null);

  // Compute active date boundaries for presets
  const activeDateRange = useMemo(() => {
    if (dateFilter.preset === 'all') return { start: '', end: '' };
    if (dateFilter.preset === 'custom') return { start: dateFilter.startDate, end: dateFilter.endDate };

    // Find min and max date in current dataset to make presets relative to data
    if (transactions.length === 0) return { start: '', end: '' };
    const dates = transactions.map(t => t.date).sort();
    const maxDateStr = dates[dates.length - 1];
    const maxDate = new Date(maxDateStr);

    let start = new Date(maxDate);
    if (dateFilter.preset === 'last30') {
      start.setDate(start.getDate() - 30);
    } else if (dateFilter.preset === 'last90') {
      start.setDate(start.getDate() - 90);
    } else if (dateFilter.preset === 'last180') {
      start.setDate(start.getDate() - 180);
    } else if (dateFilter.preset === 'ytd') {
      start = new Date(maxDate.getFullYear(), 0, 1);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: maxDateStr,
    };
  }, [dateFilter, transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Date filter
      if (activeDateRange.start && tx.date < activeDateRange.start) return false;
      if (activeDateRange.end && tx.date > activeDateRange.end) return false;

      // Category filter
      if (selectedCategory && tx.category !== selectedCategory) return false;

      // Drill-down node filter
      if (drillDownNode) {
        if (drillDownNode.categoryType === 'income_source') {
          if (tx.type !== 'income' || (tx.subcategory !== drillDownNode.name && tx.description !== drillDownNode.name)) {
            return false;
          }
        } else if (drillDownNode.categoryType === 'category') {
          if (tx.category !== drillDownNode.name) return false;
        } else if (drillDownNode.categoryType === 'subcategory') {
          if (tx.subcategory !== drillDownNode.name) return false;
        } else if (drillDownNode.categoryType === 'savings') {
          if (tx.type !== 'transfer' && tx.category !== 'Savings & Investments') return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        const matchSub = tx.subcategory.toLowerCase().includes(q);
        const matchAmt = tx.amount.toString().includes(q);
        if (!matchDesc && !matchCat && !matchSub && !matchAmt) return false;
      }

      return true;
    });
  }, [transactions, activeDateRange, selectedCategory, drillDownNode, searchQuery]);

  // Actions
  const setTransactions = (txs: Transaction[]) => {
    setTransactionsState(txs);
    setIsSampleDataLoaded(false);
  };

  const addTransactions = (newTxs: Transaction[]) => {
    setTransactionsState(prev => {
      const combined = [...newTxs, ...prev];
      return combined.sort((a, b) => b.date.localeCompare(a.date));
    });
    setIsSampleDataLoaded(false);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactionsState(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactionsState(prev => prev.filter(t => t.id !== id));
  };

  const addRule = (rule: Omit<CategoryRule, 'id'>) => {
    const newRule: CategoryRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    const updatedRules = [newRule, ...rules];
    setRules(updatedRules);
    // Automatically reapply rules
    setTransactionsState(prev => applyRulesToTransactions(prev, updatedRules));
  };

  const updateRule = (id: string, updates: Partial<CategoryRule>) => {
    const updated = rules.map(r => (r.id === id ? { ...r, ...updates } : r));
    setRules(updated);
    setTransactionsState(prev => applyRulesToTransactions(prev, updated));
  };

  const deleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
  };

  const resetRules = () => {
    setRules(DEFAULT_RULES);
    setTransactionsState(prev => applyRulesToTransactions(prev, DEFAULT_RULES));
  };

  const reapplyRules = () => {
    setTransactionsState(prev => applyRulesToTransactions(prev, rules));
  };

  const resetToSampleData = () => {
    setTransactionsState(SAMPLE_TRANSACTIONS);
    setIsSampleDataLoaded(true);
    setRules(DEFAULT_RULES);
    setDrillDownNode(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setDateFilter({ startDate: '', endDate: '', preset: 'all' });
    localStorage.removeItem(LOCAL_STORAGE_TX_KEY);
  };

  const clearAllData = () => {
    setTransactionsState([]);
    setIsSampleDataLoaded(false);
    setDrillDownNode(null);
    localStorage.removeItem(LOCAL_STORAGE_TX_KEY);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        filteredTransactions,
        rules,
        categories: DEFAULT_CATEGORIES,
        dateFilter,
        selectedCategory,
        searchQuery,
        drillDownNode,
        theme,
        isSampleDataLoaded,
        setDateFilter,
        setSelectedCategory,
        setSearchQuery,
        setDrillDownNode,
        setTransactions,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        addRule,
        updateRule,
        deleteRule,
        resetRules,
        reapplyRules,
        resetToSampleData,
        clearAllData,
        toggleTheme,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
