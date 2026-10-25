import Papa from 'papaparse';
import { ColumnMapping, Transaction } from '../types/finance';
import { categorizeTransaction } from './categorizer';
import { DEFAULT_RULES } from '../constants/defaultRules';

export interface CSVParseResult {
  headers: string[];
  rawRows: Record<string, string>[];
  detectedMapping: ColumnMapping;
  previewTransactions: Partial<Transaction>[];
}

/**
 * Normalizes date strings to ISO YYYY-MM-DD
 */
export const normalizeDate = (rawDate: string): string => {
  if (!rawDate) return new Date().toISOString().split('T')[0];

  const cleaned = rawDate.trim();

  // Check ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Check MM/DD/YYYY or M/D/YYYY
  const mdyMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Check DD.MM.YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Native Date fallback
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
};

/**
 * Heuristic detector for bank CSV column mappings
 */
export const detectColumns = (headers: string[]): ColumnMapping => {
  const lowerHeaders = headers.map(h => h.trim().toLowerCase());

  const findHeader = (candidates: string[]): string => {
    for (const c of candidates) {
      const idx = lowerHeaders.findIndex(h => h === c || h.includes(c));
      if (idx !== -1) return headers[idx];
    }
    return '';
  };

  const dateCol = findHeader(['date', 'posting date', 'transaction date', 'trans date', 'effective date']);
  const descCol = findHeader(['description', 'payee', 'memo', 'name', 'merchant', 'details', 'narrative']);
  const amountCol = findHeader(['amount', 'trans amount', 'transaction amount', 'value']);
  const debitCol = findHeader(['debit', 'withdrawal', 'outflow', 'debit amount']);
  const creditCol = findHeader(['credit', 'deposit', 'inflow', 'credit amount']);
  const typeCol = findHeader(['type', 'transaction type', 'cr/dr']);

  return {
    date: dateCol || headers[0] || '',
    description: descCol || headers[1] || '',
    amount: amountCol || (debitCol && creditCol ? '' : headers[2] || ''),
    debitAmount: debitCol,
    creditAmount: creditCol,
    type: typeCol
  };
};

/**
 * Parse CSV file and provide column detection
 */
export const parseCSVFile = (file: File): Promise<CSVParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('Uploaded CSV file appears to be empty.'));
          return;
        }

        const headers = results.meta.fields || Object.keys(results.data[0]);
        const detectedMapping = detectColumns(headers);

        const previewRows = results.data.slice(0, 5);
        const previewTransactions = previewRows.map((row, idx) => {
          const rawDate = row[detectedMapping.date] || '';
          const desc = row[detectedMapping.description] || '';
          let amount = 0;

          if (detectedMapping.debitAmount && row[detectedMapping.debitAmount]) {
            amount = Math.abs(parseFloat(row[detectedMapping.debitAmount].replace(/[^0-9.-]/g, '')) || 0);
          } else if (detectedMapping.creditAmount && row[detectedMapping.creditAmount]) {
            amount = Math.abs(parseFloat(row[detectedMapping.creditAmount].replace(/[^0-9.-]/g, '')) || 0);
          } else if (detectedMapping.amount && row[detectedMapping.amount]) {
            amount = Math.abs(parseFloat(row[detectedMapping.amount].replace(/[^0-9.-]/g, '')) || 0);
          }

          const cat = categorizeTransaction(desc, amount, DEFAULT_RULES);

          return {
            id: `preview-${idx}`,
            date: normalizeDate(rawDate),
            description: desc,
            amount,
            category: cat.category,
            subcategory: cat.subcategory,
            type: cat.type
          };
        });

        resolve({
          headers,
          rawRows: results.data,
          detectedMapping,
          previewTransactions
        });
      },
      error: (error) => reject(error)
    });
  });
};

/**
 * Convert parsed CSV rows into typed Transaction models with chosen mapping
 */
export const convertRowsToTransactions = (
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  accountName = 'Uploaded CSV'
): Transaction[] => {
  return rows.map((row, idx) => {
    const rawDate = row[mapping.date] || '';
    const desc = (row[mapping.description] || 'Unknown Transaction').trim();
    let amount = 0;
    let isIncome = false;

    if (mapping.debitAmount && row[mapping.debitAmount] && parseFloat(row[mapping.debitAmount])) {
      amount = Math.abs(parseFloat(row[mapping.debitAmount].replace(/[^0-9.-]/g, '')) || 0);
      isIncome = false;
    } else if (mapping.creditAmount && row[mapping.creditAmount] && parseFloat(row[mapping.creditAmount])) {
      amount = Math.abs(parseFloat(row[mapping.creditAmount].replace(/[^0-9.-]/g, '')) || 0);
      isIncome = true;
    } else if (mapping.amount && row[mapping.amount]) {
      const rawVal = parseFloat(row[mapping.amount].replace(/[^0-9.-]/g, '')) || 0;
      // In many bank formats, negative amounts are debits (expenses) and positive are deposits (income).
      // In others (e.g. credit card statements), positive amounts are charges (expenses) and negative are payments.
      // We check if raw string had a minus or if description suggests income
      amount = Math.abs(rawVal);
      if (rawVal > 0 && /deposit|payroll|credit|refund|dividend|interest/i.test(desc)) {
        isIncome = true;
      } else if (rawVal < 0) {
        // If bank uses negative for debit, rawVal < 0 is expense; if rawVal > 0 is credit
        isIncome = false;
      }
    }

    const catResult = categorizeTransaction(desc, amount, DEFAULT_RULES);
    const finalType = isIncome ? 'income' : catResult.type;

    return {
      id: `csv-${Date.now()}-${idx}`,
      date: normalizeDate(rawDate),
      description: desc,
      originalDescription: desc,
      amount,
      type: finalType,
      category: isIncome && catResult.type !== 'income' ? 'Income' : catResult.category,
      subcategory: isIncome && catResult.type !== 'income' ? 'Other Income' : catResult.subcategory,
      account: accountName
    };
  }).filter(tx => tx.amount > 0 && tx.date);
};

/**
 * Export transactions to CSV format
 */
export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  const exportData = transactions.map(t => ({
    Date: t.date,
    Description: t.description,
    Amount: t.amount,
    Type: t.type,
    Category: t.category,
    Subcategory: t.subcategory,
    Account: t.account || '',
    Notes: t.notes || ''
  }));

  return Papa.unparse(exportData);
};
