import React, { useState, useContext, useEffect } from "react";

import GeneralContext from "./GeneralContext";
import API from "../api/axios";
import { useQuotes } from "../hooks/useQuotes";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

import { DoughnutChart } from "./DoughnoutChart";

const MAX_WATCHLIST = 50;

const WatchList = () => {
  const [names, setNames] = useState([]);
  const [search, setSearch] = useState("");

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

    try {
      const res = await API.post("/watchlist", { name });
      setNames(res.data);
      setSearch("");
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const removeStock = async (name) => {
    try {
      const res = await API.delete(`/watchlist/${encodeURIComponent(name)}`);
      setNames(res.data);
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const data = {
    labels: stocks.map((stock) => stock.name),
    datasets: [
      {
        label: "Price",
        data: stocks.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <form className="search-container" onSubmit={addStock}>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Add a stock, eg: sbin, tatamotors (press Enter)"
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="counts">
          {" "}
          {names.length} / {MAX_WATCHLIST}
        </span>
      </form>

      {isLive && (
        <p style={{ padding: "8px 12px", fontSize: "0.8rem", color: "#4caf50" }}>
          ● Live NSE prices (may be slightly delayed)
        </p>
      )}

      <ul className="list">
        {stocks.map((stock) => (
          <WatchListItem stock={stock} key={stock.name} onRemove={removeStock} />
        ))}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">
            {typeof stock.price === "number" ? stock.price.toFixed(2) : "—"}
          </span>
        </div>
      </div>
      {showWatchlistActions && (
        <WatchListActions uid={stock.name} onRemove={onRemove} />
      )}
    </li>
  );
};

const WatchListActions = ({ uid, onRemove }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip
          title="Remove from watchlist"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={() => onRemove(uid)}
        >
          <button className="action">
            <DeleteOutline className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
