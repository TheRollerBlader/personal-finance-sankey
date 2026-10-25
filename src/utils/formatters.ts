export const formatCurrency = (amount: number, minimumFractionDigits = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount, 0);
};

export const formatPercent = (value: number, decimals = 1): string => {
  return `${value >= 0 ? '' : ''}${value.toFixed(decimals)}%`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatMonthLabel = (yearMonthStr: string): string => {
  // input: '2026-05'
  const [year, month] = yearMonthStr.split('-');
  if (!year || !month) return yearMonthStr;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};
