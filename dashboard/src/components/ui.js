import React from "react";

import "../styles/ui.css";

export const PageHeader = ({ title, count, subtitle, children }) => (
  <div className="ui-page-header">
    <div>
      <h3 className="ui-page-title">
        {title}
        {count !== undefined && <small>({count})</small>}
      </h3>
      {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const Stat = ({ label, value, sub, valueClass = "" }) => (
  <div className="ui-card">
    <p className="ui-stat-label">{label}</p>
    <p className={`ui-stat-value ${valueClass}`}>{value}</p>
    {sub && <p className="ui-stat-sub">{sub}</p>}
  </div>
);

export const DetailRow = ({ label, value, valueClass = "" }) => (
  <div className="ui-row">
    <span>{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);

export const EmptyState = ({ icon, title, text, action }) => (
  <div className="ui-empty">
    {icon && <div className="ui-empty-icon">{icon}</div>}
    <p className="ui-empty-title">{title}</p>
    {text && <p className="ui-empty-text">{text}</p>}
    {action}
  </div>
);

// green for gains, red for losses
export const signClass = (n) => (n >= 0 ? "ui-positive" : "ui-negative");
