import React from "react";
import { Link } from "react-router-dom";

import API from "../api/axios";
import { useAccount } from "../hooks/useAccount";
import { useLiveList } from "../hooks/useLiveList";
import { formatINR, holdingsTotals } from "../utils/format";

const Row = ({ label, value, className }) => (
  <div className="data">
    <p>{label}</p>
    <p className={className}>{formatINR(value)}</p>
  </div>
);

const Funds = () => {
  const [account, reload] = useAccount();
  const holdings = useLiveList("/allHoldings");
  const { investment, current } = holdingsTotals(holdings);

  const cash = account?.cash || 0;

  const transfer = async (kind) => {
    const input = window.prompt(
      kind === "add" ? "Amount to add (₹)" : "Amount to withdraw (₹)",
    );
    if (input === null) return;

    try {
      await API.post(`/funds/${kind}`, { amount: Number(input) });
      reload();
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <button className="btn btn-green" onClick={() => transfer("add")}>
          Add funds
        </button>
        <button className="btn btn-blue" onClick={() => transfer("withdraw")}>
          Withdraw
        </button>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <Row label="Available margin" value={cash} className="imp colored" />
            <Row label="Invested (at cost)" value={investment} className="imp" />
            <Row label="Available cash" value={cash} className="imp" />
            <hr />
            <Row label="Holdings value" value={current} />
            <Row label="Account value" value={cash + current} />
            <Row label="Total added" value={account?.totalAdded} />
            <Row label="Total withdrawn" value={account?.totalWithdrawn} />
            <hr />
            {/* no F&O or pledging in this app, so these stay zero */}
            <Row label="SPAN" value={0} />
            <Row label="Exposure" value={0} />
            <Row label="Options premium" value={0} />
            <Row label="Total Collateral" value={0} />
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
