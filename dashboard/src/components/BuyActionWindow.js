import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";
import API from "../api/axios";
import { useAccount } from "../hooks/useAccount";
import { useQuotes } from "../hooks/useQuotes";
import { formatINR } from "../utils/format";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const generalContext = useContext(GeneralContext);
  const [account] = useAccount();

  // orders fill at the live price; manual price only when there's no quote
  const live = useQuotes([uid])[uid];
  const price = live ? live.price : stockPrice;
  const required = price * stockQuantity;

  const handleBuyClick = async () => {
    try {
      const res = await API.post("/newOrder", {
        name: uid,
        qty: stockQuantity,
        price,
        mode: "BUY",
      });

      alert(res.data);

      generalContext.closeBuyWindow();
    } catch (err) {
      console.log("ORDER ERROR:", err.response?.data);
      alert(`Buy Failed: ${err.response?.data || err.message}`);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>{live ? "Market price" : "Price"}</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              readOnly={Boolean(live)}
              onChange={(e) => setStockPrice(Number(e.target.value))}
              value={price}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>
          Margin required ₹{formatINR(required)}
          {account && <> · Available ₹{formatINR(account.cash)}</>}
        </span>
        <div>
          <Link to="" className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
