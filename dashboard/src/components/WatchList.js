import React, { useState, useContext, useEffect } from "react";

import GeneralContext from "./GeneralContext";
import API from "../api/axios";
import { useQuotes } from "../hooks/useQuotes";
import { formatINR } from "../utils/format";

import { Tooltip, Grow } from "@mui/material";

import {
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
} from "@mui/icons-material";

import { DoughnutChart } from "./DoughnoutChart";

import "./WatchList.css";

const MAX_WATCHLIST = 50;

const CHART_COLORS = [
  "rgba(65, 132, 243, 0.7)",
  "rgba(76, 175, 80, 0.7)",
  "rgba(255, 152, 0, 0.7)",
  "rgba(126, 87, 194, 0.7)",
  "rgba(38, 166, 154, 0.7)",
  "rgba(239, 83, 80, 0.7)",
  "rgba(141, 110, 99, 0.7)",
  "rgba(236, 64, 122, 0.7)",
  "rgba(120, 144, 156, 0.7)",
];

const WatchList = () => {
  const [names, setNames] = useState([]);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/watchlist")
      .then((res) => setNames(res.data))
      .catch((err) => console.log(err));
  }, []);

  // live NSE prices pushed over the WebSocket
  const quotes = useQuotes(names);
  const stocks = names.map((name) => ({ name, ...quotes[name] }));
  const isLive = Object.keys(quotes).length > 0;

  const addStock = async (e) => {
    e.preventDefault();
    const name = search.trim();
    if (!name) return;

    setAdding(true);
    setError("");
    try {
      const res = await API.post("/watchlist", { name });
      setNames(res.data);
      setSearch("");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
    setAdding(false);
  };

  const removeStock = async (name) => {
    try {
      const res = await API.delete(`/watchlist/${encodeURIComponent(name)}`);
      setNames(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const data = {
    labels: stocks.map((stock) => stock.name),
    datasets: [
      {
        label: "Price",
        data: stocks.map((stock) => stock.price),
        backgroundColor: CHART_COLORS,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="watchlist-container wl">
      <form className="wl-search" onSubmit={addStock}>
        <Search className="wl-search-icon" fontSize="small" />
        <input
          type="text"
          name="search"
          placeholder={adding ? "Adding…" : "Add a stock, eg: sbin, tatamotors"}
          value={search}
          disabled={adding}
          onChange={(e) => {
            setSearch(e.target.value);
            setError("");
          }}
        />
        <span className="wl-count">
          {names.length}/{MAX_WATCHLIST}
        </span>
      </form>

      {error && <p className="wl-error">{error}</p>}

      <div className="wl-status">
        <span className={`wl-dot ${isLive ? "live" : ""}`} />
        {isLive ? "Live NSE prices · may be slightly delayed" : "Connecting to live prices…"}
      </div>

      {stocks.length === 0 ? (
        <p className="wl-empty">
          Your watchlist is empty. Search above to add stocks.
        </p>
      ) : (
        <ul className="wl-list">
          {stocks.map((stock) => (
            <WatchListItem stock={stock} key={stock.name} onRemove={removeStock} />
          ))}
        </ul>
      )}

      {stocks.length > 0 && (
        <div className="wl-chart">
          <p className="wl-chart-title">Price comparison</p>
          <DoughnutChart data={data} />
        </div>
      )}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);
  const hasPrice = typeof stock.price === "number";

  return (
    <li
      className="wl-item"
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <span className={`wl-name ${stock.isDown ? "wl-down" : "wl-up"}`}>
        {stock.name}
      </span>
      <span className="wl-info">
        <span className="wl-percent">{stock.percent}</span>
        {hasPrice &&
          (stock.isDown ? (
            <KeyboardArrowDown className="wl-arrow wl-down" fontSize="small" />
          ) : (
            <KeyboardArrowUp className="wl-arrow wl-up" fontSize="small" />
          ))}
        <span className={`wl-price ${stock.isDown ? "wl-down" : "wl-up"}`}>
          {hasPrice ? formatINR(stock.price) : "—"}
        </span>
      </span>
      {showWatchlistActions && (
        <WatchListActions uid={stock.name} onRemove={onRemove} />
      )}
    </li>
  );
};

const WatchListActions = ({ uid, onRemove }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <span className="wl-actions">
      <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
        <button
          className="wl-btn wl-btn-buy"
          onClick={() => generalContext.openBuyWindow(uid)}
        >
          B
        </button>
      </Tooltip>
      <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
        <button
          className="wl-btn wl-btn-sell"
          onClick={() => generalContext.openSellWindow(uid)}
        >
          S
        </button>
      </Tooltip>
      <Tooltip
        title="Remove from watchlist"
        placement="top"
        arrow
        TransitionComponent={Grow}
      >
        <button className="wl-btn wl-btn-icon" onClick={() => onRemove(uid)}>
          <DeleteOutline fontSize="small" />
        </button>
      </Tooltip>
    </span>
  );
};
