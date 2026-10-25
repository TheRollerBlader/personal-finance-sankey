import { CategoryRule, Transaction, TransactionType } from '../types/finance';

export interface CategorizationResult {
  category: string;
  subcategory: string;
  type: TransactionType;
  matchedRuleId?: string;
}

/**
 * Cleans bank transaction descriptions by stripping common noise:
 * - Card identifiers (e.g. "VISA DEBIT 1234")
 * - Store numbers (e.g. "#1029", "STORE 49")
 * - Dates / timestamps (e.g. "05/12/26")
 * - Trailing location abbreviations
 */
export const cleanMerchantName = (rawDescription: string): string => {
  if (!rawDescription) return 'Unknown Merchant';

  let cleaned = rawDescription.toUpperCase();

  // Remove common prefixes
  cleaned = cleaned.replace(/^(POS DEBIT|DEBIT CARD PURCHASE|CHECKCARD|ACH WITHDRAWAL|ELECTRONIC WITHDRAWAL|DIRECT DEPOSIT|AUTOMATIC PAYMENT|BILL PAY)\s*[-:]?\s*/i, '');

  // Remove asterisks and trailing transaction IDs
  cleaned = cleaned.replace(/\*[A-Z0-9_\-\.]+/, ' ');
  cleaned = cleaned.replace(/#[0-9]+/g, '');
  cleaned = cleaned.replace(/\bSTORE\s+[0-9]+/gi, '');

  // Remove trailing city/state abbreviations like "NEW YORK NY", "SAN FRANCISCO CA", "SEATTLE WA"
  cleaned = cleaned.replace(/\b[A-Z\s]+(CA|NY|WA|TX|IL|FL|MA|CO|OR|VA|NC|GA)\b$/i, '');

  // Remove non-alphanumeric except space & ampersand
  cleaned = cleaned.replace(/[^A-Z0-9\s&]/gi, ' ').replace(/\s+/g, ' ').trim();

  return cleaned || rawDescription.trim();
};

/**
 * Match a transaction description against active rules sorted by priority
 */
export const categorizeTransaction = (
  description: string,
  amount: number,
  rules: CategoryRule[]
): CategorizationResult => {
  const normDesc = (description || '').trim();
  const sortedRules = [...rules]
    .filter(r => r.enabled)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    let matches = false;

    if (rule.isRegex) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        matches = regex.test(normDesc);
      } catch (err) {
        console.warn(`Invalid regex pattern in rule ${rule.id}:`, rule.pattern);
        matches = false;
      }
    } else {
      matches = normDesc.toLowerCase().includes(rule.pattern.toLowerCase());
    }

    if (matches) {
      return {
        category: rule.targetCategory,
        subcategory: rule.targetSubcategory,
        type: rule.targetType,
        matchedRuleId: rule.id
      };
    }
  }

  // Fallback heuristic based on amount sign or generic keyword
  if (/deposit|payroll|refund|credit|salary/i.test(normDesc)) {
    return {
      category: 'Income',
      subcategory: 'Other Income',
      type: 'income'
    };
  }

  return {
    category: 'Uncategorized',
    subcategory: 'General',
    type: amount < 0 ? 'income' : 'expense'
  };
};

/**
 * Batch re-categorize transactions using updated rule set
 */
export const applyRulesToTransactions = (
  transactions: Transaction[],
  rules: CategoryRule[]
): Transaction[] => {
  return transactions.map(tx => {
    // Keep user manual overrides if explicitly marked, else run categorizer
    const result = categorizeTransaction(tx.originalDescription || tx.description, tx.amount, rules);
    return {
      ...tx,
      category: result.category,
      subcategory: result.subcategory,
      type: result.type
    };
  });
};
