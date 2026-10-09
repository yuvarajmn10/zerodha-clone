import React from "react";

import { ShowChart } from "@mui/icons-material";

import { EmptyState, PageHeader, Stat, signClass } from "./ui";
import { useLiveList } from "../hooks/useLiveList";
import { formatINR } from "../utils/format";

const Positions = () => {
  const positions = useLiveList("/allPositions");
  const totalPnl = positions.reduce(
    (sum, p) => sum + (p.price - p.avg) * p.qty,
    0,
  );

  return (
    <div className="ui-page">
      <PageHeader
        title="Positions"
        count={positions.length}
        subtitle="Open positions at live prices"
      />

      {positions.length === 0 ? (
        <div className="ui-card">
          <EmptyState
            icon={<ShowChart />}
            title="No open positions"
            text="Intraday and short-term positions will show up here."
          />
        </div>
      ) : (
        <>
          <div className="ui-stats">
            <Stat label="Open positions" value={positions.length} />
            <Stat
              label="Total P&L"
              value={`₹${formatINR(totalPnl)}`}
              valueClass={signClass(totalPnl)}
            />
          </div>

          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th className="left">Product</th>
                  <th className="left">Instrument</th>
                  <th>Qty.</th>
                  <th>Avg.</th>
                  <th>LTP</th>
                  <th>P&L</th>
                  <th>Chg.</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((stock) => {
                  const pnl = (stock.price - stock.avg) * stock.qty;

                  return (
                    <tr key={stock._id}>
                      <td className="left">
                        <span className="ui-badge ui-badge-neutral">{stock.product}</span>
                      </td>
                      <td className="left ui-symbol">{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{formatINR(stock.avg)}</td>
                      <td>{formatINR(stock.price)}</td>
                      <td className={signClass(pnl)}>{formatINR(pnl)}</td>
                      <td className={stock.isLoss ? "ui-negative" : "ui-positive"}>
                        {stock.day}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Positions;
