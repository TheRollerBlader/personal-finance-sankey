import { Transaction, SankeyGraph, SankeyNodeData, SankeyLinkData } from '../types/finance';
import { CATEGORY_COLOR_MAP } from '../constants/defaultCategories';

export interface SankeyBuildOptions {
  includeTransfersInSavings?: boolean;
}

export const buildSankeyData = (
  transactions: Transaction[],
  _options: SankeyBuildOptions = {}
): SankeyGraph => {
  if (!transactions || transactions.length === 0) {
    return { nodes: [], links: [] };
  }

  // 1. Group income by source (subcategory or description)
  const incomeSources: Record<string, number> = {};
  let totalIncome = 0;

  // 2. Group expenses and savings by Category and Subcategory
  const categoryTotals: Record<string, number> = {};
  const subcategoryTotals: Record<string, Record<string, number>> = {};
  let totalExpenses = 0;
  let totalSavingsTransfers = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      const sourceName = tx.subcategory || 'General Income';
      incomeSources[sourceName] = (incomeSources[sourceName] || 0) + tx.amount;
      totalIncome += tx.amount;
    } else if (tx.type === 'transfer' || tx.category === 'Savings & Investments') {
      const cat = 'Savings & Investments';
      const sub = tx.subcategory || 'Transfers';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
      if (!subcategoryTotals[cat]) subcategoryTotals[cat] = {};
      subcategoryTotals[cat][sub] = (subcategoryTotals[cat][sub] || 0) + tx.amount;
      totalSavingsTransfers += tx.amount;
    } else {
      // Expense
      const cat = tx.category || 'Uncategorized';
      const sub = tx.subcategory || 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
      if (!subcategoryTotals[cat]) subcategoryTotals[cat] = {};
      subcategoryTotals[cat][sub] = (subcategoryTotals[cat][sub] || 0) + tx.amount;
      totalExpenses += tx.amount;
    }
  });

  const nodes: SankeyNodeData[] = [];
  const links: SankeyLinkData[] = [];
  const nodeMap = new Map<string, SankeyNodeData>();

  const addNode = (id: string, name: string, categoryType: SankeyNodeData['categoryType'], color: string) => {
    if (!nodeMap.has(id)) {
      const node: SankeyNodeData = { id, name, categoryType, color };
      nodeMap.set(id, node);
      nodes.push(node);
    }
  };

  const addLink = (source: string, target: string, value: number, color?: string) => {
    if (value <= 0.01) return; // avoid zero or negative links
    links.push({
      source,
      target,
      value: Number(value.toFixed(2)),
      color
    });
  };

  // Node: Central Income Hub
  const totalIncomeNodeId = 'node-total-income';
  addNode(totalIncomeNodeId, 'Total Income', 'total_income', '#10B981');

  // Handle case where total income is 0 (e.g. only expenses imported)
  if (totalIncome === 0 && totalExpenses > 0) {
    totalIncome = totalExpenses;
    incomeSources['Disbursed Funds'] = totalExpenses;
  }

  // A. Layer 1: Income Sources -> Total Income
  Object.entries(incomeSources).forEach(([sourceName, amount]) => {
    const sourceNodeId = `node-src-${sourceName.replace(/\s+/g, '-').toLowerCase()}`;
    addNode(sourceNodeId, sourceName, 'income_source', '#34D399');
    addLink(sourceNodeId, totalIncomeNodeId, amount, '#34D39988');
  });

  // Calculate Net Flow
  const totalOutflows = totalExpenses + totalSavingsTransfers;
  const netSurplus = totalIncome - totalOutflows;

  // B. Layer 2: Total Income -> Category Hubs
  Object.entries(categoryTotals).forEach(([categoryName, catAmount]) => {
    const catColor = CATEGORY_COLOR_MAP[categoryName] || '#64748B';
    const catNodeId = `node-cat-${categoryName.replace(/\s+/g, '-').toLowerCase()}`;
    addNode(catNodeId, categoryName, 'category', catColor);
    addLink(totalIncomeNodeId, catNodeId, catAmount, `${catColor}88`);

    // C. Layer 3: Category -> Subcategories
    const subcats = subcategoryTotals[categoryName] || {};
    Object.entries(subcats).forEach(([subName, subAmount]) => {
      const subNodeId = `node-sub-${categoryName.replace(/\s+/g, '-').toLowerCase()}-${subName.replace(/\s+/g, '-').toLowerCase()}`;
      addNode(subNodeId, subName, 'subcategory', catColor);
      addLink(catNodeId, subNodeId, subAmount, `${catColor}66`);
    });
  });

  // Flow Balance Handling
  if (netSurplus > 0.01) {
    // There is unallocated / retained surplus
    const surplusNodeId = 'node-net-surplus';
    addNode(surplusNodeId, 'Net Savings (Surplus)', 'savings', '#06B6D4');
    addLink(totalIncomeNodeId, surplusNodeId, netSurplus, '#06B6D488');
  } else if (netSurplus < -0.01) {
    // Expenses exceeded income -> budget deficit
    const deficitAmount = Math.abs(netSurplus);
    const deficitNodeId = 'node-deficit';
    addNode(deficitNodeId, 'Budget Deficit / Debt', 'deficit', '#EF4444');
    addLink(deficitNodeId, totalIncomeNodeId, deficitAmount, '#EF444488');
  }

  return { nodes, links };
};
