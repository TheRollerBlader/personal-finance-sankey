export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive value
  type: TransactionType;
  category: string;
  subcategory: string;
  originalDescription?: string;
  account?: string;
  notes?: string;
  isRecurring?: boolean;
}

export interface CategoryRule {
  id: string;
  pattern: string; // regex or keyword
  isRegex: boolean;
  matchField: 'description';
  targetCategory: string;
  targetSubcategory: string;
  targetType: TransactionType;
  priority: number; // higher = evaluated first
  enabled: boolean;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  subcategories: string[];
}

export interface SankeyNodeData {
  id: string;
  name: string;
  categoryType: 'income_source' | 'total_income' | 'category' | 'subcategory' | 'savings' | 'deficit';
  color: string;
  depth?: number;
  value?: number;
}

export interface SankeyLinkData {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export interface SankeyGraph {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

export interface RecurringSubscription {
  merchant: string;
  category: string;
  subcategory: string;
  averageAmount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual';
  intervalDays: number;
  confidence: number; // 0 - 100%
  lastDate: string;
  nextProjectedDate: string;
  annualizedCost: number;
  occurrences: number;
  varianceScore: 'low' | 'medium' | 'high'; // consistency of amount and interval
  transactions: Transaction[];
}

export interface CategoryForecast {
  category: string;
  currentMonthSpend: number;
  projectedSpend: number;
  historicalAverage: number;
  trendPercentage: number; // +X% or -X%
  confidenceLower: number;
  confidenceUpper: number;
}

export interface OverallForecast {
  projectedTotalSpend: number;
  projectedSavingsRate: number;
  categories: CategoryForecast[];
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
  preset: 'all' | 'last30' | 'last90' | 'last180' | 'ytd' | 'custom';
}

export interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  type?: string;
  category?: string;
  debitAmount?: string;
  creditAmount?: string;
  dateFormat?: string;
}
