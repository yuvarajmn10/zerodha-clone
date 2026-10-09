import React from "react";

import Menu from "./Menu";
import { useQuotes } from "../hooks/useQuotes";
import { formatINR } from "../utils/format";

import "./TopBar.css";

const INDICES = ["NIFTY 50", "SENSEX"];

const TopBar = () => {
  const quotes = useQuotes(INDICES);

  return (
    <div className="topbar-container tb">
      <div className="tb-indices">
        {INDICES.map((name) => {
          const q = quotes[name];
          return (
            <div className="tb-index" key={name}>
              <span className="tb-index-name">{name}</span>
              <span className={`tb-index-price ${q?.isDown ? "tb-down" : "tb-up"}`}>
                {q ? formatINR(q.price) : "—"}
              </span>
              {q && (
                <span className={`tb-index-change ${q.isDown ? "tb-down" : "tb-up"}`}>
                  {q.percent}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
