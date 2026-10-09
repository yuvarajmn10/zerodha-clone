import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import GeneralContext from "./GeneralContext";
import { useLiveList } from "../hooks/useLiveList";
import { useQuotes } from "../hooks/useQuotes";
import { formatINR } from "../utils/format";

import "./BuyActionWindow.css"; // reuse same styling

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const generalContext = useContext(GeneralContext);
  const holding = useLiveList("/allHoldings").find((h) => h.name === uid);

  // orders fill at the live price; manual price only when there's no quote
  const live = useQuotes([uid])[uid];
  const price = live ? live.price : stockPrice;

  const handleSellClick = async () => {
    try {
      const res = await API.post("/newOrder", {
        name: uid,
        qty: stockQuantity,
        price,
        mode: "SELL",
      });

      alert(res.data);

      generalContext.closeSellWindow();
    } catch (err) {
      console.log(err);
      alert(`Sell Failed: ${err.response?.data || err.message}`);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeSellWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              min="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
            />
          </fieldset>

          <fieldset>
            <legend>{live ? "Market price" : "Price"}</legend>
            <input
              type="number"
              step="0.05"
              readOnly={Boolean(live)}
              value={price}
              onChange={(e) => setStockPrice(Number(e.target.value))}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>
          You get ₹{formatINR(price * stockQuantity)} · Holding{" "}
          {holding ? holding.qty : 0}
        </span>

        <div>
          <Link to="" className="btn btn-red" onClick={handleSellClick}>
            Sell
          </Link>

          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
