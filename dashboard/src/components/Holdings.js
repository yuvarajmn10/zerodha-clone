import React from "react";

import { VerticalGraph } from "./VerticalGraph";
import { useLiveList } from "../hooks/useLiveList";
import { formatINR, formatPercent, holdingsTotals } from "../utils/format";

// "29,875.55" -> 29,875.<span>55</span> to match the original styling
const Amount = ({ value }) => {
  const [whole, decimals] = formatINR(value).split(".");
  return (
    <h5>
      {whole}.<span>{decimals}</span>
    </h5>
  );
};

const Holdings = () => {
  const holdings = useLiveList("/allHoldings");
  const { investment, current, pnl, pnlPercent } = holdingsTotals(holdings);

  const data = {
    labels: holdings.map((stock) => stock.name),
    datasets: [
      {
        label: "Stock Price",
        data: holdings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({holdings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
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
              const profClass = stockPnl >= 0 ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={stock._id}>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.price.toFixed(2)}</td>
                  <td>{curValue.toFixed(2)}</td>
                  <td className={profClass}>{stockPnl.toFixed(2)}</td>
                  <td className={profClass}>{formatPercent(netChange)}</td>
                  <td className={dayClass}>{stock.day || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <Amount value={investment} />
          <p>Total investment</p>
        </div>
        <div className="col">
          <Amount value={current} />
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={pnl >= 0 ? "profit" : "loss"}>
            {formatINR(pnl)} ({formatPercent(pnlPercent)})
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;
