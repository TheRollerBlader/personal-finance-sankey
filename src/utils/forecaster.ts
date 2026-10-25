import { CategoryForecast, OverallForecast, Transaction } from '../types/finance';

/**
 * Computes next-month spending forecasts by category using weighted moving averages
 * and linear trend projection.
 */
export const calculateSpendingForecast = (transactions: Transaction[]): OverallForecast => {
  if (!transactions || transactions.length === 0) {
    return {
      projectedTotalSpend: 0,
      projectedSavingsRate: 0,
      categories: []
    };
  }

  // 1. Identify all months in dataset (sorted chronologically)
  const monthSet = new Set<string>();
  transactions.forEach(t => {
    if (t.date && t.date.length >= 7) {
      monthSet.add(t.date.substring(0, 7)); // 'YYYY-MM'
    }
  });

  const sortedMonths = Array.from(monthSet).sort();
  if (sortedMonths.length === 0) {
    return { projectedTotalSpend: 0, projectedSavingsRate: 0, categories: [] };
  }

  // Monthly income totals
  const monthlyIncome: Record<string, number> = {};
  // Monthly expenses by category: category -> { 'YYYY-MM': amount }
  const categoryMonthlySpend: Record<string, Record<string, number>> = {};

  transactions.forEach(t => {
    const m = t.date.substring(0, 7);
    if (t.type === 'income') {
      monthlyIncome[m] = (monthlyIncome[m] || 0) + t.amount;
    } else if (t.type === 'expense') {
      const cat = t.category || 'Uncategorized';
      if (!categoryMonthlySpend[cat]) categoryMonthlySpend[cat] = {};
      categoryMonthlySpend[cat][m] = (categoryMonthlySpend[cat][m] || 0) + t.amount;
    }
  });

  const latestMonth = sortedMonths[sortedMonths.length - 1];
  const categoriesForecast: CategoryForecast[] = [];

  let projectedTotalSpend = 0;

  Object.entries(categoryMonthlySpend).forEach(([category, spendByMonth]) => {
    // Array of amounts in chronological order
    const series = sortedMonths.map(m => spendByMonth[m] || 0);
    const n = series.length;
    const currentMonthSpend = series[n - 1] || 0;

    if (n === 1) {
      const projected = currentMonthSpend;
      categoriesForecast.push({
        category,
        currentMonthSpend,
        projectedSpend: Number(projected.toFixed(2)),
        historicalAverage: Number(projected.toFixed(2)),
        trendPercentage: 0,
        confidenceLower: Number((projected * 0.9).toFixed(2)),
        confidenceUpper: Number((projected * 1.1).toFixed(2))
      });
      projectedTotalSpend += projected;
      return;
    }

    // Historical Simple Average
    const sum = series.reduce((acc, v) => acc + v, 0);
    const historicalAverage = sum / n;

    // Weighted Moving Average (giving recent months more weight)
    let weightSum = 0;
    let weightedSum = 0;
    series.forEach((val, idx) => {
      const w = idx + 1; // 1, 2, 3, ...
      weightSum += w;
      weightedSum += val * w;
    });
    const wma = weightedSum / weightSum;

    // Linear Regression Trend (x = 0, 1, ..., n-1; y = series[x])
    const xMean = (n - 1) / 2;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (series[i] - historicalAverage);
      den += (i - xMean) * (i - xMean);
    }
    const slope = den !== 0 ? num / den : 0;
    const intercept = historicalAverage - slope * xMean;
    const trendNext = intercept + slope * n; // for next month x = n

    // Blended forecast: 65% weighted moving average, 35% trend (damped)
    let projected = 0.65 * wma + 0.35 * Math.max(0, trendNext);

    // Guard rails: prevent wild negative or infinite projections
    projected = Math.max(0, projected);

    // Compute sample variance & confidence bounds
    const variance = series.reduce((acc, v) => acc + Math.pow(v - historicalAverage, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const confidenceLower = Math.max(0, Number((projected - 0.8 * stdDev).toFixed(2)));
    const confidenceUpper = Number((projected + 0.8 * stdDev).toFixed(2));

    // Trend percentage compared to current month spend
    const trendPercentage = currentMonthSpend > 0
      ? Number((((projected - currentMonthSpend) / currentMonthSpend) * 100).toFixed(1))
      : 0;

    categoriesForecast.push({
      category,
      currentMonthSpend: Number(currentMonthSpend.toFixed(2)),
      projectedSpend: Number(projected.toFixed(2)),
      historicalAverage: Number(historicalAverage.toFixed(2)),
      trendPercentage,
      confidenceLower,
      confidenceUpper
    });

    projectedTotalSpend += projected;
  });

  // Sort categories by highest projected spend
  categoriesForecast.sort((a, b) => b.projectedSpend - a.projectedSpend);

  // Projected Income (based on latest or average monthly income)
  const recentIncomes = sortedMonths.map(m => monthlyIncome[m] || 0);
  const avgIncome = recentIncomes.reduce((a, b) => a + b, 0) / (recentIncomes.length || 1);
  const projectedIncome = recentIncomes[recentIncomes.length - 1] || avgIncome;

  const projectedSavings = projectedIncome - projectedTotalSpend;
  const projectedSavingsRate = projectedIncome > 0
    ? Number(((projectedSavings / projectedIncome) * 100).toFixed(1))
    : 0;

  return {
    projectedTotalSpend: Number(projectedTotalSpend.toFixed(2)),
    projectedSavingsRate,
    categories: categoriesForecast
  };
};
