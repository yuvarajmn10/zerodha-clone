import React from "react";

import { useAccount } from "../hooks/useAccount";
import { useLiveList } from "../hooks/useLiveList";
import { formatPercent, formatShort, holdingsTotals } from "../utils/format";

const Summary = () => {
  const [account] = useAccount();
  const holdings = useLiveList("/allHoldings");
  const { investment, current, pnl, pnlPercent } = holdingsTotals(holdings);

  return (
    <>
      <div className="username">
        <h6>Hi, {account?.username || "there"}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{account ? formatShort(account.cash) : "—"}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Invested <span>{formatShort(investment)}</span>{" "}
            </p>
            <p>
              Total added <span>{account ? formatShort(account.totalAdded) : "—"}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={pnl >= 0 ? "profit" : "loss"}>
              {formatShort(pnl)} <small>{formatPercent(pnlPercent)}</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{formatShort(current)}</span>{" "}
            </p>
            <p>
              Investment <span>{formatShort(investment)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
