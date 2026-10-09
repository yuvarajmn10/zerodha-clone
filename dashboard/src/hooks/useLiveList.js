import { useEffect, useState } from "react";

import API from "../api/axios";
import { onPortfolioChange, withQuotes } from "../api/socket";
import { useQuotes } from "./useQuotes";

// holdings/positions from the API, refetched after trades and kept at
// live prices
export const useLiveList = (path) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = () =>
      API.get(path)
        .then((res) => setItems(res.data))
        .catch((err) => console.log(err));

    load();
    return onPortfolioChange(load);
  }, [path]);

  const quotes = useQuotes(items.map((item) => item.name));
  return withQuotes(items, quotes);
};
