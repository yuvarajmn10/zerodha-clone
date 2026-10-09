import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/axios";
import { onPortfolioChange } from "../api/socket";
import { formatINR } from "../utils/format";

const Orders = () => {
  const [orders, setOrders] = useState([]);

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

  return (
    <div className="orders">
      {orders.length === 0 ? (
        // Empty state (your existing UI)
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      ) : (
        //  Orders table
        <div className="orders-table-container">
          <h3>Your Orders</h3>

          <table className="orders-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Mode</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.name}</td>
                  <td>{order.qty}</td>
                  <td>₹{formatINR(order.price)}</td>
                  <td
                    style={{
                      color: order.mode === "BUY" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {order.mode}
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
