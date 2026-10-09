import React, { useContext, useEffect, useState } from "react";

import { Add, Close, Remove } from "@mui/icons-material";

import GeneralContext from "./GeneralContext";
import API from "../api/axios";
import { useAccount } from "../hooks/useAccount";
import { useLiveList } from "../hooks/useLiveList";
import { useQuotes } from "../hooks/useQuotes";
import { formatINR } from "../utils/format";

import "./OrderWindow.css";

// shared Buy / Sell order window; mode is "BUY" or "SELL"
const OrderWindow = ({ uid, mode }) => {
  const isBuy = mode === "BUY";
  const generalContext = useContext(GeneralContext);
  const close = isBuy ? generalContext.closeBuyWindow : generalContext.closeSellWindow;

  const [qty, setQty] = useState(1);
  const [manualPrice, setManualPrice] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [account] = useAccount();
  const holding = useLiveList("/allHoldings").find((h) => h.name === uid);
  const held = holding ? holding.qty : 0;

  // orders fill at the live price; manual price only when there's no quote
  const live = useQuotes([uid])[uid];
  const price = live ? live.price : manualPrice;
  const value = price * qty;

  const cash = account?.cash ?? 0;
  const problem =
    !(qty >= 1) || !Number.isInteger(qty)
      ? "Enter a whole number of shares"
      : !(price > 0)
        ? "Enter a price"
        : isBuy && account && value > cash
          ? "Not enough cash for this order"
          : !isBuy && qty > held
            ? `You only hold ${held} share${held === 1 ? "" : "s"}`
            : "";

  // Esc closes the window
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const submit = async (e) => {
    e.preventDefault();
    if (problem) return;

    setBusy(true);
    setError("");
    try {
      const res = await API.post("/newOrder", { name: uid, qty, price, mode });
      generalContext.showToast(res.data);
      close();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
      setBusy(false);
    }
  };

  return (
    <div className="ow-overlay" onClick={close}>
      <form className="ow" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className={`ow-header ${isBuy ? "ow-buy" : "ow-sell"}`}>
          <div>
            <h4>
              {isBuy ? "Buy" : "Sell"} {uid}
              <span className="ow-exchange">NSE</span>
            </h4>
            <p>
              {live ? (
                <>
                  ₹{formatINR(live.price)} <span className="ow-change">{live.percent}</span>
                </>
              ) : (
                "Fetching live price…"
              )}
            </p>
          </div>
          <button type="button" className="ow-close" onClick={close} aria-label="Close">
            <Close fontSize="small" />
          </button>
        </div>

        <div className="ow-body">
          <div className="ow-fields">
            <label className="ow-field">
              <span>Quantity</span>
              <div className="ow-stepper">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Remove fontSize="small" />
                </button>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  autoFocus
                />
                <button type="button" onClick={() => setQty(qty + 1)}>
                  <Add fontSize="small" />
                </button>
              </div>
            </label>

            <label className="ow-field">
              <span>{live ? "Market price" : "Price"}</span>
              <div className={`ow-input ${live ? "readonly" : ""}`}>
                <em>₹</em>
                <input
                  type="number"
                  step="0.05"
                  readOnly={Boolean(live)}
                  value={price}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                />
              </div>
            </label>
          </div>

          <div className="ow-summary">
            <div className="ow-summary-row">
              <span>{isBuy ? "Order value" : "You'll receive"}</span>
              <strong>₹{formatINR(value)}</strong>
            </div>
            <div className="ow-summary-row">
              <span>{isBuy ? "Available cash" : "Shares held"}</span>
              <span>{isBuy ? `₹${formatINR(cash)}` : held}</span>
            </div>
          </div>

          {(error || problem) && <p className="ow-error">{error || problem}</p>}
        </div>

        <div className="ow-footer">
          <span className="ow-note">Market order · fills at live price</span>
          <div className="ow-actions">
            <button type="button" className="ui-btn ui-btn-ghost" onClick={close}>
              Cancel
            </button>
            <button
              type="submit"
              className={`ui-btn ${isBuy ? "ui-btn-blue" : "ui-btn-orange"}`}
              disabled={busy || Boolean(problem)}
            >
              {busy ? "Placing…" : isBuy ? "Buy" : "Sell"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderWindow;
