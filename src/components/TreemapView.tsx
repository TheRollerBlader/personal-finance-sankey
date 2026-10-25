import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_COLOR_MAP } from '../constants/defaultCategories';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface TreemapNode {
  name: string;
  size: number;
  color: string;
  category?: string;
  children?: TreemapNode[];
}

export const TreemapView: React.FC = () => {
  const { filteredTransactions, setSelectedCategory } = useFinance();

  const { treeData, totalExpenses } = useMemo(() => {
    const catMap: Record<string, { total: number; subcats: Record<string, number> }> = {};
    let totalExp = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const cat = tx.category || 'Uncategorized';
      const sub = tx.subcategory || 'General';

      if (!catMap[cat]) {
        catMap[cat] = { total: 0, subcats: {} };
      }
      catMap[cat].total += tx.amount;
      catMap[cat].subcats[sub] = (catMap[cat].subcats[sub] || 0) + tx.amount;
      totalExp += tx.amount;
    });

    const rootChildren: TreemapNode[] = Object.entries(catMap).map(([catName, data]) => {
      const catColor = CATEGORY_COLOR_MAP[catName] || '#64748B';
      const subChildren: TreemapNode[] = Object.entries(data.subcats).map(([subName, subAmount]) => ({
        name: subName,
        size: Number(subAmount.toFixed(2)),
        color: catColor,
        category: catName,
      }));

      return {
        name: catName,
        size: Number(data.total.toFixed(2)),
        color: catColor,
        children: subChildren,
      };
    });

    return { treeData: rootChildren, totalExpenses: totalExp };
  }, [filteredTransactions]);

  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, size, color } = props;
    if (width < 35 || height < 25) return null;

    const percent = totalExpenses > 0 ? (size / totalExpenses) * 100 : 0;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={6}
          fill={color || '#6366F1'}
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeOpacity={0.2}
          className="hover:opacity-90 transition-opacity cursor-pointer"
          onClick={() => {
            if (props.category) setSelectedCategory(props.category);
            else if (name) setSelectedCategory(name);
          }}
        />
        {width > 65 && height > 35 && (
          <>
            <text
              x={x + 8}
              y={y + 18}
              fill="#FFFFFF"
              fontSize={width > 120 ? 12 : 10}
              fontWeight="bold"
              className="pointer-events-none select-none drop-shadow-sm truncate"
            >
              {name}
            </text>
            <text
              x={x + 8}
              y={y + 32}
              fill="#FFFFFF"
              fillOpacity={0.85}
              fontSize={10}
              fontFamily="monospace"
              className="pointer-events-none select-none drop-shadow-sm"
            >
              {formatCurrency(size, 0)} ({formatPercent(percent, 0)})
            </text>
          </>
        )}
      </g>
    );
  };

  if (treeData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Category Spending Treemap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proportional surface area of expenses by category & subcategory • Click any block to filter
          </p>
        </div>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<CustomizedContent />}
          >
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const pct = totalExpenses > 0 ? (item.size / totalExpenses) * 100 : 0;
                  return (
                    <div className="p-3 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <div className="font-bold text-slate-100">{item.name}</div>
                      {item.category && (
                        <div className="text-[10px] text-slate-400">Parent: {item.category}</div>
                      )}
                      <div className="mt-1 font-mono flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{formatCurrency(item.size)}</span>
                        <span className="text-slate-300">({formatPercent(pct)} of total spend)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
