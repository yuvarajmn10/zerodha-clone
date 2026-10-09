import { useCallback, useEffect, useState } from "react";

import API from "../api/axios";
import { onPortfolioChange } from "../api/socket";

// the logged-in user's profile and funds; refreshes after trades and
// fund transfers. Returns [account, reload].
export const useAccount = () => {
  const [account, setAccount] = useState(null);

  const reload = useCallback(
    () =>
      API.get("/account")
        .then((res) => setAccount(res.data))
        .catch((err) => console.log(err)),
    [],
  );

  useEffect(() => {
    reload();
    return onPortfolioChange(reload);
  }, [reload]);

  return [account, reload];
};
