// ₹ amounts in Indian grouping: 1,23,456.78
export const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// compact amounts for summary cards: 3.74k, 1.20L, 2.05Cr
export const formatShort = (n) => {
  const value = Number(n || 0);
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${(value / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)}k`;
  return value.toFixed(2);
};

export const formatPercent = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

// totals across holdings, using live prices when present
export const holdingsTotals = (holdings) => {
  const investment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const current = holdings.reduce((sum, h) => sum + h.price * h.qty, 0);
  const pnl = current - investment;
  const pnlPercent = investment ? (pnl / investment) * 100 : 0;

  return { investment, current, pnl, pnlPercent };
};
