import React from "react";

import Menu from "./Menu";
import { useQuotes } from "../hooks/useQuotes";
import { formatINR } from "../utils/format";

const INDICES = ["NIFTY 50", "SENSEX"];

const TopBar = () => {
  const quotes = useQuotes(INDICES);

  const renderIndex = (name, className) => {
    const q = quotes[name];
    return (
      <div className={className}>
        <p className="index">{name}</p>
        <p className="index-points">{q ? formatINR(q.price) : "—"}</p>
        <p className={`percent ${q?.isDown ? "down" : "up"}`}>
          {q ? q.percent : ""}
        </p>
      </div>
    );
  };

  return (
    <div className="topbar-container">
      <div className="indices-container">
        {renderIndex("NIFTY 50", "nifty")}
        {renderIndex("SENSEX", "sensex")}
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
