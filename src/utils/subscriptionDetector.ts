import { RecurringSubscription, Transaction } from '../types/finance';
import { cleanMerchantName } from './categorizer';

/**
 * Detects recurring subscriptions and fixed bill commitments
 * using cadence interval clustering and variance analysis.
 */
export const detectRecurringSubscriptions = (transactions: Transaction[]): RecurringSubscription[] => {
  if (!transactions || transactions.length === 0) return [];

  // Consider only expenses and transfers (like Gym, Subscriptions, Rent, Utilities, Investments)
  const candidateTxs = transactions.filter(t => t.type === 'expense' || t.type === 'transfer');

  // Group by simplified merchant name
  const merchantGroups: Record<string, Transaction[]> = {};

  candidateTxs.forEach((tx) => {
    const merchant = cleanMerchantName(tx.originalDescription || tx.description);
    if (!merchantGroups[merchant]) {
      merchantGroups[merchant] = [];
    }
    merchantGroups[merchant].push(tx);
  });

  const subscriptions: RecurringSubscription[] = [];

  Object.entries(merchantGroups).forEach(([merchant, txs]) => {
    // We need at least 2 occurrences to measure an interval
    if (txs.length < 2) return;

    // Sort chronologically ascending
    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));

    // Calculate sequential day intervals
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date).getTime();
      const curr = new Date(sorted[i].date).getTime();
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        intervals.push(diffDays);
      }
    }

    if (intervals.length === 0) return;

    // Calculate mean interval and standard deviation
    const meanInterval = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
    const intervalVariance = intervals.reduce((sum, v) => sum + Math.pow(v - meanInterval, 2), 0) / intervals.length;
    const intervalStdDev = Math.sqrt(intervalVariance);
    const intervalCV = meanInterval > 0 ? intervalStdDev / meanInterval : 1; // Coefficient of variation

    // Calculate amount metrics
    const amounts = sorted.map(t => t.amount);
    const meanAmount = amounts.reduce((sum, v) => sum + v, 0) / amounts.length;
    const amountVariance = amounts.reduce((sum, v) => sum + Math.pow(v - meanAmount, 2), 0) / amounts.length;
    const amountStdDev = Math.sqrt(amountVariance);
    const amountCV = meanAmount > 0 ? amountStdDev / meanAmount : 1;

    // Determine cadence classification
    let frequency: RecurringSubscription['frequency'] | null = null;
    let expectedCadence = 30;

    if (meanInterval >= 5 && meanInterval <= 9) {
      frequency = 'weekly';
      expectedCadence = 7;
    } else if (meanInterval >= 12 && meanInterval <= 16) {
      frequency = 'bi-weekly';
      expectedCadence = 14;
    } else if (meanInterval >= 25 && meanInterval <= 35) {
      frequency = 'monthly';
      expectedCadence = 30.4;
    } else if (meanInterval >= 80 && meanInterval <= 100) {
      frequency = 'quarterly';
      expectedCadence = 91.25;
    } else if (meanInterval >= 340 && meanInterval <= 380) {
      frequency = 'annual';
      expectedCadence = 365;
    }

    // If cadence doesn't match a regular financial periodicity, reject
    if (!frequency) return;

    // Interval CV tolerance: intervals should be fairly consistent (allow small leeway for weekends/bank holidays)
    if (intervalCV > 0.45 && intervals.length > 2) return;

    // Calculate confidence score (0 to 100)
    // High confidence if amount is exact (amountCV < 0.05) and intervals are tight (intervalCV < 0.15)
    let score = 50;

    // Consistency of amount
    if (amountCV < 0.02) score += 25; // exact same dollar amount
    else if (amountCV < 0.10) score += 15; // slight fluctuation (e.g. tax/utility)
    else if (amountCV > 0.35) score -= 20;

    // Consistency of interval
    if (intervalCV < 0.12) score += 20;
    else if (intervalCV < 0.25) score += 10;
    else score -= 10;

    // Number of occurrences
    if (sorted.length >= 4) score += 10;
    if (sorted.length >= 6) score += 5;

    // Known subscription keywords boost
    if (/netflix|spotify|openai|chatgpt|github|icloud|apple|hulu|disney|prime|gym|equinox|rent|verizon|con edison|t-mobile/i.test(merchant)) {
      score += 15;
    }

    const confidence = Math.min(100, Math.max(20, Math.round(score)));

    // Variance rating
    let varianceScore: RecurringSubscription['varianceScore'] = 'low';
    if (amountCV > 0.15 || intervalCV > 0.2) varianceScore = 'medium';
    if (amountCV > 0.3 || intervalCV > 0.35) varianceScore = 'high';

    // Projected Next Date
    const lastDate = sorted[sorted.length - 1].date;
    const lastDateObj = new Date(lastDate);
    const nextDateObj = new Date(lastDateObj);
    nextDateObj.setDate(lastDateObj.getDate() + Math.round(expectedCadence));
    const nextProjectedDate = nextDateObj.toISOString().split('T')[0];

    // Annualized Cost Calculation
    let annualizedCost = 0;
    switch (frequency) {
      case 'weekly': annualizedCost = meanAmount * 52; break;
      case 'bi-weekly': annualizedCost = meanAmount * 26; break;
      case 'monthly': annualizedCost = meanAmount * 12; break;
      case 'quarterly': annualizedCost = meanAmount * 4; break;
      case 'annual': annualizedCost = meanAmount; break;
    }

    const primaryCategory = sorted[sorted.length - 1].category;
    const primarySubcategory = sorted[sorted.length - 1].subcategory;

    subscriptions.push({
      merchant,
      category: primaryCategory,
      subcategory: primarySubcategory,
      averageAmount: Number(meanAmount.toFixed(2)),
      frequency,
      intervalDays: Math.round(meanInterval),
      confidence,
      lastDate,
      nextProjectedDate,
      annualizedCost: Number(annualizedCost.toFixed(2)),
      occurrences: sorted.length,
      varianceScore,
      transactions: sorted
    });
  });

  // Sort by highest annual cost impact first
  return subscriptions.sort((a, b) => b.annualizedCost - a.annualizedCost);
};
