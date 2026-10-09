import React from "react";
import { Link } from "react-router-dom";

import { TrendingDown, TrendingUp, WorkOutline } from "@mui/icons-material";

import { DetailRow, EmptyState, PageHeader, signClass } from "./ui";
import { useAccount } from "../hooks/useAccount";
import { useLiveList } from "../hooks/useLiveList";
import { formatINR, formatPercent, holdingsTotals } from "../utils/format";

// "+2.65%" -> 2.65
const dayPercent = (stock) => parseFloat(stock.day) || 0;

const MoverList = ({ title, icon, stocks }) => (
  <div>
    <p className="ui-stat-label" style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {icon} {title}
    </p>
    {stocks.length === 0 ? (
      <p className="ui-stat-sub">None today</p>
    ) : (
      stocks.map((s) => (
        <DetailRow
          key={s._id}
          label={s.name}
          value={`₹${formatINR(s.price)}  ${formatPercent(dayPercent(s))}`}
          valueClass={signClass(dayPercent(s))}
        />
      ))
    )}
  </div>
);

const Summary = () => {
  const [account] = useAccount();
  const holdings = useLiveList("/allHoldings");
  const { investment, current, pnl, pnlPercent } = holdingsTotals(holdings);

  const byDay = [...holdings].sort((a, b) => dayPercent(b) - dayPercent(a));
  const gainers = byDay.filter((s) => dayPercent(s) > 0).slice(0, 3);
  const losers = byDay.filter((s) => dayPercent(s) < 0).reverse().slice(0, 3);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="ui-page">
      <PageHeader
        title={`Hi, ${account?.username || "there"}!`}
        subtitle={`${today} · your portfolio at a glance`}
      >
        <Link to="/funds" className="ui-btn ui-btn-green">
          Add funds
        </Link>
      </PageHeader>

      <div className="ui-grid-2">
        <div className="ui-card">
          <div className="ui-card-header">
            <p className="ui-card-title">Equity</p>
            <Link to="/funds" className="ui-link">
              View funds →
            </Link>
          </div>
          <p className="ui-stat-label">Margin available</p>
          <p className="ui-stat-value large ui-primary">
            ₹{formatINR(account?.cash)}
          </p>
          <div className="ui-section">
            <DetailRow label="Invested" value={`₹${formatINR(investment)}`} />
            <DetailRow
              label="Total added"
              value={`₹${formatINR(account?.totalAdded)}`}
            />
          </div>
        </div>

        <div className="ui-card">
          <div className="ui-card-header">
            <p className="ui-card-title">Holdings ({holdings.length})</p>
            <Link to="/holdings" className="ui-link">
              View holdings →
            </Link>
          </div>
          <p className="ui-stat-label">P&L</p>
          <p className={`ui-stat-value large ${signClass(pnl)}`}>
            ₹{formatINR(pnl)}{" "}
            <small style={{ fontSize: "0.9rem" }}>{formatPercent(pnlPercent)}</small>
          </p>
          <div className="ui-section">
            <DetailRow label="Current value" value={`₹${formatINR(current)}`} />
            <DetailRow label="Investment" value={`₹${formatINR(investment)}`} />
          </div>
        </div>
      </div>

      <div className="ui-card ui-section">
        <div className="ui-card-header">
          <p className="ui-card-title">Today's movers in your holdings</p>
        </div>
        {holdings.length === 0 ? (
          <EmptyState
            icon={<WorkOutline />}
            title="You don't own any stocks yet"
            text="Hover over a stock in your watchlist and click Buy to get started."
          />
        ) : (
          <div className="ui-grid-2">
            <MoverList
              title="Top gainers"
              icon={<TrendingUp fontSize="small" className="ui-positive" />}
              stocks={gainers}
            />
            <MoverList
              title="Top losers"
              icon={<TrendingDown fontSize="small" className="ui-negative" />}
              stocks={losers}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
