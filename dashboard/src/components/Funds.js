import React, { useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/axios";
import { useAccount } from "../hooks/useAccount";
import { useLiveList } from "../hooks/useLiveList";
import { formatINR, formatPercent, holdingsTotals } from "../utils/format";

import "./Funds.css";

const QUICK_AMOUNTS = [1000, 5000, 10000, 50000];

const Row = ({ label, value, className = "" }) => (
  <div className={`funds-row ${className}`}>
    <span>{label}</span>
    <span>₹{formatINR(value)}</span>
  </div>
);

// in-page dialog for adding or withdrawing money
const TransferDialog = ({ kind, cash, onClose, onDone }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdd = kind === "add";

  const submit = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!(value > 0)) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!isAdd && value > cash) {
      setError(`You can withdraw up to ₹${formatINR(cash)}`);
      return;
    }

    setBusy(true);
    setError("");
    try {
      await API.post(`/funds/${kind}`, { amount: value });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
      setBusy(false);
    }
  };

  return (
    <div className="funds-overlay" onClick={onClose}>
      <form
        className="funds-dialog"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h4>{isAdd ? "Add funds" : "Withdraw funds"}</h4>
        <p className="funds-stat-sub">
          Available cash ₹{formatINR(cash)}
        </p>

        <label className="funds-input">
          <span>₹</span>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <div className="funds-chips">
          {QUICK_AMOUNTS.map((n) => (
            <button
              type="button"
              key={n}
              className="funds-chip"
              onClick={() => setAmount(String(n))}
            >
              ₹{n.toLocaleString("en-IN")}
            </button>
          ))}
          {!isAdd && (
            <button
              type="button"
              className="funds-chip"
              onClick={() => setAmount(String(cash))}
            >
              Max
            </button>
          )}
        </div>

        {error && <p className="funds-error">{error}</p>}

        <div className="funds-dialog-actions">
          <button type="button" className="funds-btn funds-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={`funds-btn ${isAdd ? "funds-btn-green" : "funds-btn-blue"}`}
            disabled={busy}
          >
            {busy ? "Please wait…" : isAdd ? "Add funds" : "Withdraw"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Funds = () => {
  const [account, reload] = useAccount();
  const holdings = useLiveList("/allHoldings");
  const { investment, current, pnl, pnlPercent } = holdingsTotals(holdings);
  const [dialog, setDialog] = useState(null); // "add" | "withdraw" | null

  const cash = account?.cash || 0;
  const accountValue = cash + current;
  const cashShare = accountValue ? (cash / accountValue) * 100 : 100;
  const pnlClass = pnl >= 0 ? "funds-profit" : "funds-loss";

  return (
    <div className="funds-page">
      <div className="funds-header">
        <div>
          <h3>Funds</h3>
          <p>Instant, zero-cost fund transfers with UPI</p>
        </div>
        <div className="funds-actions">
          <button className="funds-btn funds-btn-green" onClick={() => setDialog("add")}>
            Add funds
          </button>
          <button className="funds-btn funds-btn-blue" onClick={() => setDialog("withdraw")}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="funds-stats">
        <div className="funds-card">
          <p className="funds-stat-label">Available cash</p>
          <p className="funds-stat-value primary">₹{formatINR(cash)}</p>
          <p className="funds-stat-sub">Ready to invest</p>
        </div>
        <div className="funds-card">
          <p className="funds-stat-label">Invested</p>
          <p className="funds-stat-value">₹{formatINR(investment)}</p>
          <p className="funds-stat-sub">
            Now worth ₹{formatINR(current)}
          </p>
        </div>
        <div className="funds-card">
          <p className="funds-stat-label">Account value</p>
          <p className="funds-stat-value">₹{formatINR(accountValue)}</p>
          <p className="funds-stat-sub">
            P&L{" "}
            <span className={pnlClass}>
              ₹{formatINR(pnl)} ({formatPercent(pnlPercent)})
            </span>
          </p>
        </div>
      </div>

      <div className="funds-card funds-allocation">
        <p className="funds-stat-label">Allocation</p>
        <div className="funds-bar">
          <div className="funds-bar-cash" style={{ width: `${cashShare}%` }} />
          <div className="funds-bar-invested" style={{ width: `${100 - cashShare}%` }} />
        </div>
        <div className="funds-legend">
          <span style={{ "--dot": "#4184f3" }}>
            Cash {cashShare.toFixed(1)}%
          </span>
          <span style={{ "--dot": "#4caf50" }}>
            Holdings {(100 - cashShare).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="funds-grid">
        <div className="funds-card">
          <p className="funds-section-title">Equity</p>

          <div className="funds-group">
            <p className="funds-group-title">Cash</p>
            <Row label="Available margin" value={cash} className="strong" />
            <Row label="Total added" value={account?.totalAdded} />
            <Row label="Total withdrawn" value={account?.totalWithdrawn} />
          </div>

          <div className="funds-group">
            <p className="funds-group-title">Holdings</p>
            <Row label="Invested (at cost)" value={investment} />
            <Row label="Current value" value={current} />
            <div className="funds-row strong">
              <span>Unrealised P&L</span>
              <span className={pnlClass}>₹{formatINR(pnl)}</span>
            </div>
          </div>

          {/* no F&O or pledging in this app, so these stay zero */}
          <div className="funds-group muted">
            <p className="funds-group-title">Margins & collateral</p>
            <Row label="SPAN" value={0} />
            <Row label="Exposure" value={0} />
            <Row label="Options premium" value={0} />
            <Row label="Total collateral" value={0} />
          </div>
        </div>

        <div className="funds-card funds-commodity">
          <p className="funds-section-title">Commodity</p>
          <p>You don't have a commodity account</p>
          <Link to="#" className="funds-btn funds-btn-blue">
            Open Account
          </Link>
        </div>
      </div>

      {dialog && (
        <TransferDialog
          kind={dialog}
          cash={cash}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default Funds;
