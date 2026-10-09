import React from "react";

import { WorkOutline } from "@mui/icons-material";

import { VerticalGraph } from "./VerticalGraph";
import { EmptyState, PageHeader, Stat, signClass } from "./ui";
import { useLiveList } from "../hooks/useLiveList";
import { formatINR, formatPercent, holdingsTotals } from "../utils/format";

// change since yesterday's close, from the day % ("+2.65%")
const dayChange = (stock) => {
  const pct = parseFloat(stock.day) || 0;
  const prevClose = stock.price / (1 + pct / 100);
  return (stock.price - prevClose) * stock.qty;
};

const Holdings = () => {
  const holdings = useLiveList("/allHoldings");
  const { investment, current, pnl, pnlPercent } = holdingsTotals(holdings);
  const dayPnl = holdings.reduce((sum, h) => sum + dayChange(h), 0);
  const dayPnlPercent = current - dayPnl ? (dayPnl / (current - dayPnl)) * 100 : 0;

  const data = {
    labels: holdings.map((stock) => stock.name),
    datasets: [
      {
        label: "Current value (₹)",
        data: holdings.map((stock) => stock.price * stock.qty),
        backgroundColor: "rgba(65, 132, 243, 0.6)",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="ui-page">
      <PageHeader
        title="Holdings"
        count={holdings.length}
        subtitle="Long-term investments, valued at live prices"
      />

      {holdings.length === 0 ? (
        <div className="ui-card">
          <EmptyState
            icon={<WorkOutline />}
            title="No holdings yet"
            text="Stocks you buy will show up here. Hover over a stock in your watchlist and click Buy."
          />
        </div>
      ) : (
        <>
          <div className="ui-stats">
            <Stat label="Total investment" value={`₹${formatINR(investment)}`} />
            <Stat label="Current value" value={`₹${formatINR(current)}`} />
            <Stat
              label="Total P&L"
              value={`₹${formatINR(pnl)}`}
              valueClass={signClass(pnl)}
              sub={formatPercent(pnlPercent)}
            />
            <Stat
              label="Day's P&L"
              value={`₹${formatINR(dayPnl)}`}
              valueClass={signClass(dayPnl)}
              sub={formatPercent(dayPnlPercent)}
            />
          </div>

          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th className="left">Instrument</th>
                  <th>Qty.</th>
                  <th>Avg. cost</th>
                  <th>LTP</th>
                  <th>Cur. val</th>
                  <th>P&L</th>
                  <th>Net chg.</th>
                  <th>Day chg.</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((stock) => {
                  const curValue = stock.price * stock.qty;
                  const stockPnl = curValue - stock.avg * stock.qty;
                  const netChange = stock.avg
                    ? ((stock.price - stock.avg) / stock.avg) * 100
                    : 0;

                  return (
                    <tr key={stock._id}>
                      <td className="left ui-symbol">{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{formatINR(stock.avg)}</td>
                      <td>{formatINR(stock.price)}</td>
                      <td>{formatINR(curValue)}</td>
                      <td className={signClass(stockPnl)}>{formatINR(stockPnl)}</td>
                      <td className={signClass(netChange)}>{formatPercent(netChange)}</td>
                      <td className={stock.isLoss ? "ui-negative" : "ui-positive"}>
                        {stock.day || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ui-card ui-section">
            <VerticalGraph data={data} title="Current value by stock" />
          </div>
        </>
      )}
    </div>
  );
};

export default Holdings;
