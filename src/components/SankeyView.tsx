import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3Sankey from 'd3-sankey';
import { useFinance } from '../context/FinanceContext';
import { buildSankeyData } from '../utils/sankeyBuilder';
import { SankeyNodeData } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Info, MousePointerClick, ZoomIn } from 'lucide-react';

interface TooltipInfo {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  amount: number;
  percentage?: number;
}

export const SankeyView: React.FC = () => {
  const { filteredTransactions, setDrillDownNode, drillDownNode } = useFinance();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        // Keep minimum height for good readability of multiple subcategories
        const computedHeight = Math.max(500, Math.min(680, clientWidth * 0.55));
        setDimensions({
          width: clientWidth,
          height: computedHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute graph data
  const rawGraph = useMemo(() => {
    return buildSankeyData(filteredTransactions);
  }, [filteredTransactions]);

  // Total income for percentage computation
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Compute D3 Sankey Layout
  const sankeyLayout = useMemo(() => {
    if (rawGraph.nodes.length === 0 || rawGraph.links.length === 0) {
      return null;
    }

    const { width, height } = dimensions;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = Math.max(200, width - margin.left - margin.right);
    const innerHeight = Math.max(200, height - margin.top - margin.bottom);

    // Deep copy to prevent d3-sankey mutation issues
    const graphData = {
      nodes: rawGraph.nodes.map((n) => ({ ...n })),
      links: rawGraph.links.map((l) => ({ ...l })),
    };

    const sankey = d3Sankey
      .sankey<SankeyNodeData, any>()
      .nodeId((d: any) => d.id)
      .nodeWidth(18)
      .nodePadding(14)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);

    try {
      const result = sankey(graphData as any);
      return { ...result, margin, innerWidth, innerHeight };
    } catch (err) {
      console.warn('d3-sankey computation error (possibly cyclic or invalid links):', err);
      return null;
    }
  }, [rawGraph, dimensions]);

  const handleNodeClick = (node: SankeyNodeData) => {
    if (drillDownNode?.id === node.id) {
      setDrillDownNode(null);
    } else {
      setDrillDownNode(node);
      // Smooth scroll to transaction table
      const el = document.getElementById('transaction-table-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!sankeyLayout || rawGraph.nodes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
        <p className="font-semibold">No transaction flows to render.</p>
        <p className="text-xs mt-1">Adjust filters or upload bank statement data to generate Sankey visualization.</p>
      </div>
    );
  }

  const { nodes, links, margin } = sankeyLayout;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-3">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Income & Cash Flow Sankey</span>
            <span className="text-xs font-normal text-slate-400">
              (Income Sources &rarr; Total Income &rarr; Categories &rarr; Subcategories)
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hover over flows to view exact volume; click any node to drill-down into underlying transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-500" />
            <span>Interactive Drill-Down</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="w-full relative overflow-x-auto min-h-[480px]">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="select-none overflow-visible"
        >
          <defs>
            {/* Gradients for smooth ribbon transitions */}
            {links.map((link: any, idx: number) => {
              const srcColor = link.source.color || '#10B981';
              const tgtColor = link.target.color || '#6366F1';
              return (
                <linearGradient
                  key={`gradient-${idx}`}
                  id={`link-grad-${idx}`}
                  gradientUnits="userSpaceOnUse"
                  x1={link.source.x1}
                  x2={link.target.x0}
                >
                  <stop offset="0%" stopColor={srcColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={tgtColor} stopOpacity={0.4} />
                </linearGradient>
              );
            })}
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* 1. Sankey Links (Ribbons) */}
            <g className="links" fill="none">
              {links.map((link: any, idx: number) => {
                const path = d3Sankey.sankeyLinkHorizontal()(link);
                const isHovered = hoveredLink === idx;
                const isConnected =
                  hoveredNode &&
                  (link.source.id === hoveredNode || link.target.id === hoveredNode);

                const opacity =
                  isHovered || isConnected
                    ? 0.75
                    : hoveredNode || hoveredLink !== null
                    ? 0.15
                    : 0.45;

                return (
                  <path
                    key={`link-${idx}`}
                    d={path || undefined}
                    stroke={`url(#link-grad-${idx})`}
                    strokeWidth={Math.max(1.5, link.width)}
                    strokeOpacity={opacity}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredLink(idx);
                      const rect = containerRef.current?.getBoundingClientRect();
                      setTooltip({
                        x: e.clientX - (rect?.left || 0),
                        y: e.clientY - (rect?.top || 0) - 20,
                        title: `${link.source.name} → ${link.target.name}`,
                        subtitle: 'Flow Volume',
                        amount: link.value,
                        percentage: totalIncome > 0 ? (link.value / totalIncome) * 100 : undefined,
                      });
                    }}
                    onMouseMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      setTooltip((prev) =>
                        prev
                          ? {
                              ...prev,
                              x: e.clientX - (rect?.left || 0),
                              y: e.clientY - (rect?.top || 0) - 20,
                            }
                          : null
                      );
                    }}
                    onMouseLeave={() => {
                      setHoveredLink(null);
                      setTooltip(null);
                    }}
                  />
                );
              })}
            </g>

            {/* 2. Sankey Nodes (Bars) */}
            <g className="nodes">
              {nodes.map((node: any) => {
                const isHovered = hoveredNode === node.id;
                const isSelected = drillDownNode?.id === node.id;
                const width = node.x1 - node.x0;
                const height = Math.max(2, node.y1 - node.y0);

                // Align label text left or right depending on node position
                const isRightSide = node.x0 > sankeyLayout.innerWidth / 2;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x0}, ${node.y0})`}
                    className="cursor-pointer group"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={(e) => {
                      setHoveredNode(node.id);
                      const rect = containerRef.current?.getBoundingClientRect();
                      setTooltip({
                        x: e.clientX - (rect?.left || 0),
                        y: e.clientY - (rect?.top || 0) - 20,
                        title: node.name,
                        subtitle: `${node.categoryType.replace('_', ' ').toUpperCase()} • Click to drill-down`,
                        amount: node.value,
                        percentage: totalIncome > 0 ? (node.value / totalIncome) * 100 : undefined,
                      });
                    }}
                    onMouseMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      setTooltip((prev) =>
                        prev
                          ? {
                              ...prev,
                              x: e.clientX - (rect?.left || 0),
                              y: e.clientY - (rect?.top || 0) - 20,
                            }
                          : null
                      );
                    }}
                    onMouseLeave={() => {
                      setHoveredNode(null);
                      setTooltip(null);
                    }}
                  >
                    {/* Node Rectangle */}
                    <rect
                      width={width}
                      height={height}
                      rx={4}
                      fill={node.color || '#10B981'}
                      stroke={isSelected ? '#059669' : isHovered ? '#FFFFFF' : 'transparent'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-transform duration-150"
                      filter={isHovered || isSelected ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : undefined}
                    />

                    {/* Node Label Text */}
                    <text
                      x={isRightSide ? width + 8 : -8}
                      y={height / 2}
                      dy="0.35em"
                      textAnchor={isRightSide ? 'start' : 'end'}
                      className={`text-xs font-semibold fill-slate-800 dark:fill-slate-200 pointer-events-none transition-all ${
                        isSelected ? 'font-bold fill-emerald-600 dark:fill-emerald-400' : ''
                      }`}
                    >
                      {node.name}
                    </text>

                    {/* Value subtitle text below label */}
                    <text
                      x={isRightSide ? width + 8 : -8}
                      y={height / 2 + 13}
                      dy="0.35em"
                      textAnchor={isRightSide ? 'start' : 'end'}
                      className="text-[10px] fill-slate-500 dark:fill-slate-400 pointer-events-none font-mono"
                    >
                      {formatCurrency(node.value, 0)}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Floating Custom Tooltip */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none px-3.5 py-2 rounded-xl bg-slate-900/95 text-white shadow-xl text-xs border border-slate-700 backdrop-blur-md transform -translate-x-1/2 -translate-y-full transition-all"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="font-bold text-emerald-400">{tooltip.title}</div>
            {tooltip.subtitle && (
              <div className="text-[10px] text-slate-400 mb-1">{tooltip.subtitle}</div>
            )}
            <div className="flex items-center gap-2 font-mono mt-0.5">
              <span className="text-sm font-semibold">{formatCurrency(tooltip.amount)}</span>
              {tooltip.percentage !== undefined && (
                <span className="text-emerald-300 text-[11px] bg-emerald-950 px-1.5 py-0.5 rounded">
                  {formatPercent(tooltip.percentage)} of Income
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
