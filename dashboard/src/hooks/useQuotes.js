import { useEffect, useState } from "react";

import { subscribeQuotes } from "../api/socket";

// live { NAME: { price, percent, isDown } } for the given names,
// pushed over the WebSocket
export const useQuotes = (names) => {
  const [quotes, setQuotes] = useState({});
  const key = names.join(",");

  useEffect(() => {
    if (!key) return;
    return subscribeQuotes(key.split(","), (q) =>
      setQuotes((prev) => ({ ...prev, ...q })),
    );
  }, [key]);

  return quotes;
};
