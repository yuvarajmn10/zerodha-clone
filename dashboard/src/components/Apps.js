import React from "react";

import { PageHeader } from "./ui";
import "./Apps.css";

// Zerodha ecosystem apps (external links)
const APPS = [
  {
    name: "Coin",
    color: "#4caf50",
    url: "https://coin.zerodha.com",
    text: "Invest in direct mutual funds with zero commission.",
  },
  {
    name: "Varsity",
    color: "#ff9800",
    url: "https://zerodha.com/varsity/",
    text: "Free, in-depth lessons on markets and trading.",
  },
  {
    name: "Kite Connect",
    color: "#4184f3",
    url: "https://kite.trade",
    text: "APIs to build your own trading and investment platform.",
  },
  {
    name: "Sensibull",
    color: "#7e57c2",
    url: "https://sensibull.com",
    text: "Options trading platform with strategy builders.",
  },
  {
    name: "smallcase",
    color: "#1e88e5",
    url: "https://smallcase.com",
    text: "Thematic baskets of stocks and ETFs.",
  },
  {
    name: "Streak",
    color: "#26a69a",
    url: "https://streak.tech",
    text: "Create and backtest strategies without code.",
  },
  {
    name: "GoldenPi",
    color: "#c9a227",
    url: "https://goldenpi.com",
    text: "Invest in bonds and debentures.",
  },
  {
    name: "Ditto",
    color: "#ef5350",
    url: "https://joinditto.in",
    text: "Unbiased advice on health and term insurance.",
  },
];

const Apps = () => (
  <div className="ui-page">
    <PageHeader title="Apps" subtitle="Platforms from the Zerodha ecosystem" />

    <div className="apps-grid">
      {APPS.map((app) => (
        <a
          key={app.name}
          className="ui-card apps-card"
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="apps-icon" style={{ background: app.color }}>
            {app.name[0].toUpperCase()}
          </div>
          <div>
            <p className="apps-name">{app.name}</p>
            <p className="apps-text">{app.text}</p>
          </div>
        </a>
      ))}
    </div>
  </div>
);

export default Apps;
