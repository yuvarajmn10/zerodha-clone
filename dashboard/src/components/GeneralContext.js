import React, { useEffect, useState } from "react";

import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  closeBuyWindow: () => {},
  openSellWindow: (uid) => {},
  closeSellWindow: () => {},
  showToast: (message) => {},
});

const TOAST_MS = 3000;

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [selectedStockUID, setSelectedStockUID] = useState("");

  // only one order window at a time
  const handleOpenBuyWindow = (uid) => {
    setIsSellWindowOpen(false);
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
  };

  const handleOpenSellWindow = (uid) => {
    setIsBuyWindowOpen(false);
    setIsSellWindowOpen(true);
    setSelectedStockUID(uid);
  };

  const handleCloseSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStockUID("");
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        showToast: setToast,
      }}
    >
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} />}
      {isSellWindowOpen && <SellActionWindow uid={selectedStockUID} />}
      {toast && <div className="ow-toast">{toast}</div>}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
