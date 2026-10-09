import React, { useEffect, useState } from "react";

import { ReceiptLong } from "@mui/icons-material";

import API from "../api/axios";
import { onPortfolioChange } from "../api/socket";
import { EmptyState, PageHeader, Stat } from "./ui";
import { formatINR } from "../utils/format";

const FILTERS = ["ALL", "BUY", "SELL"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchOrders();
    // new orders show up without a reload
    return onPortfolioChange(fetchOrders);
  }, []);

  const shown = filter === "ALL" ? orders : orders.filter((o) => o.mode === filter);
  const total = (mode) =>
    orders
      .filter((o) => o.mode === mode)
      .reduce((sum, o) => sum + o.price * o.qty, 0);

  return (
    <div className="ui-page">
      <PageHeader title="Orders" count={orders.length} subtitle="Your order history, latest first">
        {orders.length > 0 && (
          <div className="ui-segmented">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "All" : f === "BUY" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>
        )}
      </PageHeader>

      {orders.length === 0 ? (
        <div className="ui-card">
          <EmptyState
            icon={<ReceiptLong />}
            title="You haven't placed any orders yet"
            text="Hover over a stock in your watchlist and click Buy or Sell to place one."
          />
        </div>
      ) : (
        <>
          <div className="ui-stats">
            <Stat label="Orders" value={orders.length} />
            <Stat label="Bought" value={`₹${formatINR(total("BUY"))}`} />
            <Stat label="Sold" value={`₹${formatINR(total("SELL"))}`} />
          </div>

          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th className="left">Time</th>
                  <th className="left">Type</th>
                  <th className="left">Instrument</th>
                  <th>Qty.</th>
                  <th>Price</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((order) => (
                  <tr key={order._id}>
                    <td className="left" style={{ color: "#777" }}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="left">
                      <span
                        className={`ui-badge ${
                          order.mode === "BUY" ? "ui-badge-buy" : "ui-badge-sell"
                        }`}
                      >
                        {order.mode}
                      </span>
                    </td>
                    <td className="left ui-symbol">{order.name}</td>
                    <td>{order.qty}</td>
                    <td>₹{formatINR(order.price)}</td>
                    <td>₹{formatINR(order.price * order.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
